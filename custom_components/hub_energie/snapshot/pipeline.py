"""Snapshot orchestration pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable, Mapping

from ..energy.costs import CostComputation
from ..energy.energy_aggregation import EnergyAggregation
from ..energy.origin import OriginAndUsage
from ..power.power_flow import PowerFlowModel
from .snapshot_builder import SnapshotBuildInput
from ..tempo.tempo_logic import TempoSnapshot


@dataclass(frozen=True)
class SnapshotPipelineInputs:
    day: str
    now_paris: datetime
    day_acc: Mapping[str, Any]
    rates: Mapping[str, float]
    abonnement_day_eur: float
    current_slot: str | None
    today_color: str
    tomorrow_color: str
    is_edf: bool
    tariff_offer: str
    contract_power: str
    tariff_fetched_at: str | None
    tempo_mode: str
    calendar_row_count: int
    calendar_fetched_at: datetime | None
    logic_version: int
    supplier: str
    pricing_structure: str
    phase_type: str
    has_batteries: bool
    solar_resale_configured: bool
    solar_export_tariff: float
    debug_enabled: bool
    flow_mismatch_warn_threshold_w: float
    flow_mismatch_warn_interval_s: float
    last_flow_warn_ts: datetime | None
    reinjection_confidence_grid: float
    reinjection_confidence_solar: float
    reinjection_confidence_battery: float
    reinjection_confidence_load: float
    min_soc_option_key: str
    min_soc_option_default: float
    source_grid: str
    source_solar: str
    source_grid_export: str
    source_batt_charge_prefix: str
    source_batt_discharge_prefix: str
    diag_cause_solar_surplus: str
    diag_cause_battery_full_or_absent: str
    diag_cause_switch_latency: str
    diag_cause_unattributed: str


@dataclass(frozen=True)
class SnapshotPipelineResult:
    snapshot: dict[str, Any]
    should_warn_flow_mismatch: bool
    raw_home_power_w: float
    modeled_home_power_w: float
    flow_gap_w: float
    next_last_flow_warn_ts: datetime | None


@dataclass(frozen=True)
class SnapshotPipelineDeps:
    compute_energy_aggregation: Callable[[Mapping[str, Any]], EnergyAggregation]
    compute_costs: Callable[[Mapping[str, float], Mapping[str, float], float], CostComputation]
    compute_origin_and_usage: Callable[[EnergyAggregation], OriginAndUsage]
    power_source_map: Callable[[], dict[str, str | None]]
    read_grid_power_total_w: Callable[[], float | None]
    read_power_w: Callable[[str | None], float | None]
    read_aggregate_battery_power: Callable[[], tuple[float, float | None, bool]]
    compute_power_flow_model: Callable[..., PowerFlowModel]
    aggregate_battery_soc_fill_ratio: Callable[[], float | None]
    any_battery_at_max: Callable[[], bool | None]
    reinjection_option_float: Callable[[str, float], float]
    classify_reinjection_cause: Callable[
        [float, float, float | None, bool, datetime, float | None, float, bool | None],
        tuple[str, float, dict[str, Any]],
    ]
    update_reinjection_diagnostics: Callable[
        [str, datetime, Mapping[str, float], PowerFlowModel, str],
        tuple[dict[str, float], dict[str, dict[str, float]], dict[str, float], float],
    ]
    compute_savings: Callable[
        [dict[str, float], dict[str, float], dict[str, float], Mapping[str, float]],
        tuple[float, float],
    ]
    battery_power_split_available: Callable[[], bool]
    get_batt_charge_power_split_day: Callable[[str], Mapping[str, float]]
    get_batt_charge_power_split_slot_day: Callable[[str], Mapping[str, dict[str, float]]]
    usage_batt_charge_by_slot_from_heuristic: Callable[[Mapping[str, float]], tuple[dict[str, float], dict[str, float]]]
    compute_tempo_snapshot: Callable[[datetime], TempoSnapshot]
    compute_battery_metrics: Callable[[Mapping[str, Any]], tuple[list[dict[str, Any]], float, float, float, str]]
    build_battery_card_metrics: Callable[[list[dict[str, Any]]], dict[str, Any] | None]
    compute_solar_estimate: Callable[[datetime], tuple[float | None, float | None, float | None]]
    source_total: Callable[[str], float]
    slot_vals: Callable[[Mapping[str, Any], str], dict[str, float]]
    norm_kwh: Callable[[float], float]
    build_snapshot: Callable[[SnapshotBuildInput], dict[str, Any]]


class SnapshotPipeline:
    """Computes snapshot inputs and output in one orchestration step."""

    def __init__(self, slots: tuple[str, ...], deps: SnapshotPipelineDeps) -> None:
        self._slots = slots
        self._deps = deps

    def run(self, inputs: SnapshotPipelineInputs) -> SnapshotPipelineResult:
        energy = self._deps.compute_energy_aggregation(inputs.day_acc)
        cost = self._deps.compute_costs(energy.grid, inputs.rates, inputs.abonnement_day_eur)
        origin = self._deps.compute_origin_and_usage(energy)

        power_map = self._deps.power_source_map()
        p_grid_raw = self._deps.read_grid_power_total_w()
        p_solar = self._deps.read_power_w(power_map.get("solar_power")) or 0.0
        p_load_measured = self._deps.read_power_w(power_map.get("load_power"))
        p_batt_dis, p_batt_charge, any_batt_power = self._deps.read_aggregate_battery_power()
        flow = self._deps.compute_power_flow_model(
            p_grid_raw=p_grid_raw,
            p_solar=p_solar,
            p_batt_dis=p_batt_dis,
            p_batt_charge=p_batt_charge,
            p_load_measured=p_load_measured,
        )

        should_warn_flow = False
        next_last_warn_ts = inputs.last_flow_warn_ts
        if flow.flow_gap > inputs.flow_mismatch_warn_threshold_w:
            should_warn_flow = (
                inputs.last_flow_warn_ts is None
                or (inputs.now_paris - inputs.last_flow_warn_ts).total_seconds()
                >= inputs.flow_mismatch_warn_interval_s
            )
            if should_warn_flow:
                next_last_warn_ts = inputs.now_paris

        soc_ratio = self._deps.aggregate_battery_soc_fill_ratio()
        soc_at_max = self._deps.any_battery_at_max()
        min_soc_f = max(
            0.5,
            min(
                0.999,
                self._deps.reinjection_option_float(
                    inputs.min_soc_option_key,
                    inputs.min_soc_option_default,
                ),
            ),
        )
        cause, decision_confidence, decision_inputs = self._deps.classify_reinjection_cause(
            flow.p_export,
            flow.p_solar,
            flow.p_batt_charge,
            inputs.has_batteries,
            inputs.now_paris,
            soc_ratio,
            min_soc_f,
            soc_at_max,
        )

        confidence = max(0.0, min(1.0, decision_confidence))
        if flow.p_grid_raw is not None:
            confidence += inputs.reinjection_confidence_grid
        if power_map.get("solar_power"):
            confidence += inputs.reinjection_confidence_solar
        if any_batt_power:
            confidence += inputs.reinjection_confidence_battery
        if power_map.get("load_power"):
            confidence += inputs.reinjection_confidence_load
        confidence = max(0.0, min(1.0, confidence))

        diag_day, _diag_slot_day, opp, opp_total = self._deps.update_reinjection_diagnostics(
            inputs.day,
            inputs.now_paris,
            inputs.rates,
            flow,
            cause,
        )

        eco_solar, eco_batt = self._deps.compute_savings(
            energy.solar,
            energy.batt_charge,
            energy.batt_discharge,
            inputs.rates,
        )

        batt_charge_meter_kwh = round(
            sum(energy.batt_charge.get(slot, 0.0) for slot in self._slots),
            3,
        )
        power_split_on = self._deps.battery_power_split_available()
        usage_batt_charge_method = "power_integration" if power_split_on else "slot_heuristic"
        usage_grid_batt_chg = origin.usage_grid_batt_charge
        usage_solar_batt_hp = origin.usage_solar_batt_charge
        if power_split_on:
            split_day = self._deps.get_batt_charge_power_split_day(inputs.day)
            usage_grid_batt_chg = round(float(split_day.get("grid", 0.0)), 3)
            usage_solar_batt_hp = round(float(split_day.get("solar", 0.0)), 3)

        if power_split_on:
            gday = self._deps.get_batt_charge_power_split_slot_day(inputs.day)
            usage_grid_batt_charge_by_slot = {
                slot: round(float(gday.get("grid", {}).get(slot, 0.0)), 5)
                for slot in self._slots
            }
            usage_solar_batt_charge_by_slot = {
                slot: round(float(gday.get("solar", {}).get(slot, 0.0)), 5)
                for slot in self._slots
            }
        else:
            usage_grid_batt_charge_by_slot, usage_solar_batt_charge_by_slot = (
                self._deps.usage_batt_charge_by_slot_from_heuristic(energy.batt_charge)
            )

        tempo = self._deps.compute_tempo_snapshot(inputs.now_paris)
        batt_systems, batt_total_chg, batt_total_dis, batt_total_net, battery_data_quality = (
            self._deps.compute_battery_metrics(inputs.day_acc)
        )
        battery_card = self._deps.build_battery_card_metrics(batt_systems)
        sol_est_p, sol_est_d, sol_est_y = self._deps.compute_solar_estimate(inputs.now_paris)

        solar_export_revenue: float | None = None
        if inputs.solar_resale_configured and inputs.solar_export_tariff:
            total_export = sum(
                self._deps.slot_vals(inputs.day_acc, inputs.source_grid_export).values()
            )
            solar_export_revenue = round(total_export * inputs.solar_export_tariff, 3)

        energy_grid_total = self._deps.source_total(inputs.source_grid)
        energy_solar_total = self._deps.source_total(inputs.source_solar)
        energy_export_total = self._deps.source_total(inputs.source_grid_export)
        energy_batt_charge_total = self._deps.source_total(inputs.source_batt_charge_prefix)
        energy_batt_discharge_total = self._deps.source_total(inputs.source_batt_discharge_prefix)

        energy_grid_today = self._deps.norm_kwh(sum(energy.grid.values()))
        energy_solar_today = self._deps.norm_kwh(sum(energy.solar.values()))
        energy_export_today = self._deps.norm_kwh(
            sum(self._deps.slot_vals(inputs.day_acc, inputs.source_grid_export).values())
        )
        energy_batt_charge_today = self._deps.norm_kwh(sum(energy.batt_charge.values()))
        energy_batt_discharge_today = self._deps.norm_kwh(sum(energy.batt_discharge.values()))
        energy_home_today = self._deps.norm_kwh(sum(energy.maison.values()))

        snapshot = self._deps.build_snapshot(
            SnapshotBuildInput(
                day=inputs.day,
                current_slot=inputs.current_slot,
                today_color=inputs.today_color,
                tomorrow_color=inputs.tomorrow_color,
                offer=inputs.tariff_offer if inputs.is_edf else "n/a",
                contract_power=inputs.contract_power,
                tariff_fetched_at=inputs.tariff_fetched_at,
                tempo_days=tempo.tempo_days,
                tempo_is_off_peak=tempo.tempo_is_off,
                tempo_next_colour_change_at=tempo.tempo_next_colour,
                tempo_next_hc_start_at=tempo.tempo_next_hc,
                grid=energy.grid,
                solar=energy.solar,
                batt_discharge=energy.batt_discharge,
                batt_charge=energy.batt_charge,
                maison=energy.maison,
                cost_by_slot=cost.cost_by_slot,
                cost_total=cost.cost_total,
                abonnement_eur=cost.abonnement_eur,
                origin_grid=origin.origin_grid_total,
                origin_grid_direct_maison_kwh=origin.direct_grid,
                origin_grid_via_batterie_kwh=origin.batt_from_grid,
                origin_solar=origin.origin_solar_total,
                origin_solar_direct_maison_kwh=origin.solar_direct,
                origin_solar_via_batterie_kwh=origin.batt_from_solar,
                usage_grid_direct=origin.usage_grid_direct,
                usage_grid_batt_charge=usage_grid_batt_chg,
                usage_solar_direct=origin.usage_solar_direct,
                usage_solar_batt_charge=usage_solar_batt_hp,
                usage_batt_home=origin.usage_batt_home,
                energy_grid_total_kwh=energy_grid_total,
                energy_solar_total_kwh=energy_solar_total,
                energy_export_total_kwh=energy_export_total,
                energy_batt_charge_total_kwh=energy_batt_charge_total,
                energy_batt_discharge_total_kwh=energy_batt_discharge_total,
                energy_grid_today_kwh=energy_grid_today,
                energy_solar_today_kwh=energy_solar_today,
                energy_export_today_kwh=energy_export_today,
                energy_batt_charge_today_kwh=energy_batt_charge_today,
                energy_batt_discharge_today_kwh=energy_batt_discharge_today,
                energy_home_today_kwh=energy_home_today,
                usage_batt_charge_method=usage_batt_charge_method,
                batt_charge_meter_kwh=batt_charge_meter_kwh,
                usage_grid_batt_charge_by_slot_kwh=usage_grid_batt_charge_by_slot,
                usage_solar_batt_charge_by_slot_kwh=usage_solar_batt_charge_by_slot,
                reinjection_cause=cause,
                reinjection_confidence_pct=confidence * 100.0,
                reinjection_decision_confidence=confidence,
                reinjection_decision_inputs=decision_inputs,
                export_power_w=round(flow.p_export, 1),
                grid_power_signed_w=round(flow.p_grid_signed, 1)
                if flow.p_grid_signed is not None
                else None,
                solar_power_w=round(flow.p_solar, 1) if power_map.get("solar_power") else None,
                batt_discharge_power_w=round(flow.p_batt_dis, 1) if any_batt_power else None,
                batt_charge_power_w=round(flow.p_batt_charge, 1)
                if flow.p_batt_charge is not None
                else None,
                load_power_w=round(flow.p_load, 1) if flow.p_load is not None else None,
                home_power_w=round(flow.home_power_for_flows, 1),
                grid_import_power_w=round(flow.grid_import_power, 1),
                battery_discharge_power_w=round(flow.battery_discharge_power, 1),
                solar_production_power_w=round(flow.solar_production_power, 1),
                solar_to_home_power_w=round(flow.solar_to_home, 1),
                battery_to_home_power_w=round(flow.battery_to_home, 1),
                grid_to_home_power_w=round(flow.grid_to_home, 1),
                solar_to_battery_power_w=round(flow.solar_to_battery, 1),
                grid_to_battery_power_w=round(flow.grid_to_battery, 1),
                solar_export_power_w=round(flow.solar_export_model, 1),
                power_model_mode=flow.power_model_mode,
                load_power_inferred=flow.p_load_measured is None,
                export_due_to_solar_surplus_kwh=round(
                    diag_day.get(inputs.diag_cause_solar_surplus, 0.0), 3
                ),
                export_due_to_battery_full_or_absent_kwh=round(
                    diag_day.get(inputs.diag_cause_battery_full_or_absent, 0.0), 3
                ),
                export_due_to_switch_latency_kwh=round(
                    diag_day.get(inputs.diag_cause_switch_latency, 0.0), 3
                ),
                export_unattributed_kwh=round(
                    diag_day.get(inputs.diag_cause_unattributed, 0.0), 3
                ),
                export_opportunity_cost_total_eur=round(opp_total, 3),
                export_opportunity_cost_solar_surplus_eur=round(
                    opp.get(inputs.diag_cause_solar_surplus, 0.0), 3
                ),
                export_opportunity_cost_battery_full_or_absent_eur=round(
                    opp.get(inputs.diag_cause_battery_full_or_absent, 0.0), 3
                ),
                export_opportunity_cost_switch_latency_eur=round(
                    opp.get(inputs.diag_cause_switch_latency, 0.0), 3
                ),
                export_opportunity_cost_unattributed_eur=round(
                    opp.get(inputs.diag_cause_unattributed, 0.0), 3
                ),
                eco_solar=round(eco_solar, 3),
                eco_batt=round(eco_batt, 3),
                tempo_mode=inputs.tempo_mode if inputs.is_edf else "n/a",
                rte_calendar_row_count=inputs.calendar_row_count,
                rte_calendar_fetched_at=inputs.calendar_fetched_at.isoformat()
                if inputs.calendar_fetched_at
                else None,
                logic_version=inputs.logic_version,
                battery_systems=batt_systems,
                battery_card=battery_card,
                battery_total_charge_kwh=round(batt_total_chg, 3),
                battery_total_discharge_kwh=round(batt_total_dis, 3),
                battery_total_net_power_w=round(batt_total_net, 1),
                battery_data_quality=battery_data_quality,
                solar_estimate_power_w=sol_est_p,
                solar_estimate_daily_kwh=sol_est_d,
                solar_estimate_yearly_kwh=sol_est_y,
                solar_export_revenue_eur=solar_export_revenue,
                supplier=inputs.supplier,
                pricing_structure=inputs.pricing_structure
                if not inputs.is_edf
                else inputs.tariff_offer,
                phase_type=inputs.phase_type,
                debug_enabled=inputs.debug_enabled,
                debug_flow_gap_w=flow.flow_gap,
                debug_modelled_home_power_w=flow.home_power_for_flows,
            )
        )

        return SnapshotPipelineResult(
            snapshot=snapshot,
            should_warn_flow_mismatch=should_warn_flow,
            raw_home_power_w=max(0.0, flow.p_load or 0.0),
            modeled_home_power_w=flow.home_power_for_flows,
            flow_gap_w=flow.flow_gap,
            next_last_flow_warn_ts=next_last_warn_ts,
        )
