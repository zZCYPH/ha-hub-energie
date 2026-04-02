"""Pure snapshot assembly."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SnapshotBuildInput:
    day: str
    current_slot: str | None
    today_color: str
    tomorrow_color: str
    offer: str
    contract_power: str
    tariff_fetched_at: str | None
    tempo_days: dict[str, dict[str, int]] | None
    tempo_is_off_peak: bool | None
    tempo_next_colour_change_at: str | None
    tempo_next_hc_start_at: str | None
    grid: dict[str, float]
    solar: dict[str, float]
    batt_discharge: dict[str, float]
    batt_charge: dict[str, float]
    maison: dict[str, float]
    cost_by_slot: dict[str, float]
    cost_total: float
    abonnement_eur: float
    origin_grid: float
    origin_grid_direct_maison_kwh: float
    origin_grid_via_batterie_kwh: float
    origin_solar: float
    origin_solar_direct_maison_kwh: float
    origin_solar_via_batterie_kwh: float
    usage_grid_direct: float
    usage_grid_batt_charge: float
    usage_solar_direct: float
    usage_solar_batt_charge: float
    usage_batt_home: float
    energy_grid_total_kwh: float
    energy_solar_total_kwh: float
    energy_export_total_kwh: float
    energy_batt_charge_total_kwh: float
    energy_batt_discharge_total_kwh: float
    energy_grid_today_kwh: float
    energy_solar_today_kwh: float
    energy_export_today_kwh: float
    energy_batt_charge_today_kwh: float
    energy_batt_discharge_today_kwh: float
    energy_home_today_kwh: float
    usage_batt_charge_method: str
    batt_charge_meter_kwh: float
    usage_grid_batt_charge_by_slot_kwh: dict[str, float]
    usage_solar_batt_charge_by_slot_kwh: dict[str, float]
    reinjection_cause: str
    reinjection_confidence_pct: float
    reinjection_decision_confidence: float
    reinjection_decision_inputs: dict[str, Any]
    export_power_w: float
    grid_power_signed_w: float | None
    solar_power_w: float | None
    batt_discharge_power_w: float | None
    batt_charge_power_w: float | None
    load_power_w: float | None
    home_power_w: float
    grid_import_power_w: float
    battery_discharge_power_w: float
    solar_production_power_w: float
    solar_to_home_power_w: float
    battery_to_home_power_w: float
    grid_to_home_power_w: float
    solar_to_battery_power_w: float
    grid_to_battery_power_w: float
    solar_export_power_w: float
    power_model_mode: str
    load_power_inferred: bool
    export_due_to_solar_surplus_kwh: float
    export_due_to_battery_full_or_absent_kwh: float
    export_due_to_switch_latency_kwh: float
    export_unattributed_kwh: float
    export_opportunity_cost_total_eur: float
    export_opportunity_cost_solar_surplus_eur: float
    export_opportunity_cost_battery_full_or_absent_eur: float
    export_opportunity_cost_switch_latency_eur: float
    export_opportunity_cost_unattributed_eur: float
    eco_solar: float
    eco_batt: float
    tempo_mode: str
    rte_calendar_row_count: int
    rte_calendar_fetched_at: str | None
    logic_version: int
    battery_systems: list[dict[str, Any]]
    battery_card: dict[str, Any] | None
    battery_total_charge_kwh: float
    battery_total_discharge_kwh: float
    battery_total_net_power_w: float
    battery_data_quality: str
    solar_estimate_power_w: float | None
    solar_estimate_daily_kwh: float | None
    solar_estimate_yearly_kwh: float | None
    solar_export_revenue_eur: float | None
    supplier: str
    pricing_structure: str
    phase_type: str
    debug_enabled: bool
    debug_flow_gap_w: float
    debug_modelled_home_power_w: float


def build_snapshot(input_data: SnapshotBuildInput) -> dict[str, Any]:
    snapshot = {
        "day": input_data.day,
        "current_slot": input_data.current_slot,
        "today_color": input_data.today_color,
        "tomorrow_color": input_data.tomorrow_color,
        "offer": input_data.offer,
        "contract_power": input_data.contract_power,
        "tariff_fetched_at": input_data.tariff_fetched_at,
        "tempo_days": input_data.tempo_days,
        "tempo_is_off_peak": input_data.tempo_is_off_peak,
        "tempo_next_colour_change_at": input_data.tempo_next_colour_change_at,
        "tempo_next_hc_start_at": input_data.tempo_next_hc_start_at,
        "grid": input_data.grid,
        "solar": input_data.solar,
        "batt_discharge": input_data.batt_discharge,
        "batt_charge": input_data.batt_charge,
        "maison": input_data.maison,
        "cost_by_slot": input_data.cost_by_slot,
        "cost_total": round(input_data.cost_total, 3),
        "abonnement_eur": round(input_data.abonnement_eur, 3),
        "origin_grid": input_data.origin_grid,
        "origin_grid_attrs": {
            "direct_maison_kwh": round(input_data.origin_grid_direct_maison_kwh, 3),
            "via_batterie_kwh": round(input_data.origin_grid_via_batterie_kwh, 3),
        },
        "origin_solar": input_data.origin_solar,
        "origin_solar_attrs": {
            "direct_maison_kwh": round(input_data.origin_solar_direct_maison_kwh, 3),
            "via_batterie_kwh": round(input_data.origin_solar_via_batterie_kwh, 3),
        },
        "usage_grid_direct": input_data.usage_grid_direct,
        "usage_grid_batt_charge": input_data.usage_grid_batt_charge,
        "usage_solar_direct": input_data.usage_solar_direct,
        "usage_solar_batt_charge": input_data.usage_solar_batt_charge,
        "usage_batt_home": input_data.usage_batt_home,
        "energy_grid_total_kwh": input_data.energy_grid_total_kwh,
        "energy_solar_total_kwh": input_data.energy_solar_total_kwh,
        "energy_export_total_kwh": input_data.energy_export_total_kwh,
        "energy_batt_charge_total_kwh": input_data.energy_batt_charge_total_kwh,
        "energy_batt_discharge_total_kwh": input_data.energy_batt_discharge_total_kwh,
        "energy_grid_today_kwh": input_data.energy_grid_today_kwh,
        "energy_solar_today_kwh": input_data.energy_solar_today_kwh,
        "energy_export_today_kwh": input_data.energy_export_today_kwh,
        "energy_batt_charge_today_kwh": input_data.energy_batt_charge_today_kwh,
        "energy_batt_discharge_today_kwh": input_data.energy_batt_discharge_today_kwh,
        "energy_home_today_kwh": input_data.energy_home_today_kwh,
        "usage_batt_charge_method": input_data.usage_batt_charge_method,
        "batt_charge_meter_kwh": input_data.batt_charge_meter_kwh,
        "usage_grid_batt_charge_by_slot_kwh": input_data.usage_grid_batt_charge_by_slot_kwh,
        "usage_solar_batt_charge_by_slot_kwh": input_data.usage_solar_batt_charge_by_slot_kwh,
        "reinjection_cause": input_data.reinjection_cause,
        "reinjection_confidence": round(input_data.reinjection_confidence_pct, 1),
        "reinjection_decision": {
            "cause": input_data.reinjection_cause,
            "confidence": round(input_data.reinjection_decision_confidence, 4),
            "inputs": input_data.reinjection_decision_inputs,
        },
        "export_power_w": input_data.export_power_w,
        "grid_power_signed_w": input_data.grid_power_signed_w,
        "solar_power_w": input_data.solar_power_w,
        "batt_discharge_power_w": input_data.batt_discharge_power_w,
        "batt_charge_power_w": input_data.batt_charge_power_w,
        "load_power_w": input_data.load_power_w,
        "home_power_w": input_data.home_power_w,
        "grid_import_power_w": input_data.grid_import_power_w,
        "battery_discharge_power_w": input_data.battery_discharge_power_w,
        "solar_production_power_w": input_data.solar_production_power_w,
        "solar_to_home_power_w": input_data.solar_to_home_power_w,
        "battery_to_home_power_w": input_data.battery_to_home_power_w,
        "grid_to_home_power_w": input_data.grid_to_home_power_w,
        "solar_to_battery_power_w": input_data.solar_to_battery_power_w,
        "grid_to_battery_power_w": input_data.grid_to_battery_power_w,
        "solar_export_power_w": input_data.solar_export_power_w,
        "power_model_mode": input_data.power_model_mode,
        "load_power_inferred": input_data.load_power_inferred,
        "export_due_to_solar_surplus_kwh": input_data.export_due_to_solar_surplus_kwh,
        "export_due_to_battery_full_or_absent_kwh": input_data.export_due_to_battery_full_or_absent_kwh,
        "export_due_to_switch_latency_kwh": input_data.export_due_to_switch_latency_kwh,
        "export_unattributed_kwh": input_data.export_unattributed_kwh,
        "export_opportunity_cost_total_eur": input_data.export_opportunity_cost_total_eur,
        "export_opportunity_cost_solar_surplus_eur": input_data.export_opportunity_cost_solar_surplus_eur,
        "export_opportunity_cost_battery_full_or_absent_eur": input_data.export_opportunity_cost_battery_full_or_absent_eur,
        "export_opportunity_cost_switch_latency_eur": input_data.export_opportunity_cost_switch_latency_eur,
        "export_opportunity_cost_unattributed_eur": input_data.export_opportunity_cost_unattributed_eur,
        "eco_solar": input_data.eco_solar,
        "eco_batt": input_data.eco_batt,
        "tempo_mode": input_data.tempo_mode,
        "rte_calendar_row_count": input_data.rte_calendar_row_count,
        "rte_calendar_fetched_at": input_data.rte_calendar_fetched_at,
        "logic_version": input_data.logic_version,
        "battery_systems": input_data.battery_systems,
        "battery_card": input_data.battery_card,
        "battery_total_charge_kwh": input_data.battery_total_charge_kwh,
        "battery_total_discharge_kwh": input_data.battery_total_discharge_kwh,
        "battery_total_net_power_w": input_data.battery_total_net_power_w,
        "battery_data_quality": input_data.battery_data_quality,
        "solar_estimate_power_w": input_data.solar_estimate_power_w,
        "solar_estimate_daily_kwh": input_data.solar_estimate_daily_kwh,
        "solar_estimate_yearly_kwh": input_data.solar_estimate_yearly_kwh,
        "solar_export_revenue_eur": input_data.solar_export_revenue_eur,
        "supplier": input_data.supplier,
        "pricing_structure": input_data.pricing_structure,
        "phase_type": input_data.phase_type,
    }
    if input_data.debug_enabled:
        snapshot["debug_flow_gap_w"] = round(input_data.debug_flow_gap_w, 3)
        snapshot["debug_modelled_home_power_w"] = round(
            input_data.debug_modelled_home_power_w, 3
        )
    return snapshot
