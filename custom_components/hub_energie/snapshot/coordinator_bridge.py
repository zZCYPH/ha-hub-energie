"""Build SnapshotPipelineDeps from coordinator — wiring and domain delegation."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from datetime import datetime
from typing import TYPE_CHECKING, Any

from ..battery.battery_metrics import compute_battery_card_metrics as compute_battery_card_metrics_domain
from ..battery.battery_metrics import compute_battery_metrics as compute_battery_metrics_domain
from ..battery.battery_runtime import aggregate_battery_soc_fill_ratio as aggregate_battery_soc_fill_ratio_domain
from ..battery.battery_runtime import any_battery_at_max as any_battery_at_max_domain
from ..battery.battery_runtime import read_aggregate_battery_power as read_aggregate_battery_power_domain
from ..battery.battery_split import (
    usage_batt_charge_by_slot_from_heuristic as usage_batt_charge_by_slot_from_heuristic_domain,
)
from ..const.config_keys import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_AVAILABLE,
    CONF_BATT_NAME,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_SOLAR_LOCATION_LAT,
    CONF_SOLAR_LOCATION_LON,
    CONF_SOLAR_ORIENTATION,
    CONF_SOLAR_PEAK_POWER,
    CONF_SOLAR_PERFORMANCE,
    CONF_SOLAR_SHADING,
    CONF_SOLAR_TILT,
    CONF_SOLAR_TILT_MODE,
    GRID_POWER_SIGN_EXPORT_POSITIVE,
    SOLAR_TILT_AUTO,
)
from ..const.energy_data import SOURCE_GRID, SOURCE_SOLAR
from ..const.reinjection import (
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
    OPT_REINJECTION_EXPORT_MIN_ABS_W,
    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
    REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    REINJECTION_EXPORT_IGNORE_BELOW_W,
    REINJECTION_EXPORT_MIN_ABS_W,
    REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    REINJECTION_SHORT_EXPORT_MAX_S,
    REINJECTION_SHORT_EXPORT_MAX_W,
)
from ..const.tariff_edf import ATTRIBUTION_SLOTS
from ..energy.costs import compute_costs as compute_costs_domain
from ..energy.costs import compute_savings as compute_savings_domain
from ..energy.energy_aggregation import compute_energy as compute_energy_domain
from ..energy.energy_aggregation import slot_values as slot_values_domain
from ..energy.energy_aggregation import EnergyAggregation
from ..energy.origin import OriginAndUsage
from ..energy.origin import compute_origin_and_usage as compute_origin_and_usage_domain
from ..power.power_flow import PowerFlowModel
from ..power.power_flow import compute_power_flow as compute_power_flow_domain
from ..power.reinjection import ReinjectionThresholds
from ..power.reinjection import classify_reinjection_cause as classify_reinjection_cause_domain
from ..power.reinjection_diagnostics import (
    update_reinjection_diagnostics as update_reinjection_diagnostics_domain,
)
from ..solar.solar_estimation import compute_solar_estimation
from ..tempo.service import compute_tempo_snapshot
from ..time.paris_time import PARIS_TZ
from ..utils.energy import normalize_kwh
from .pipeline import SnapshotPipelineDeps
from .snapshot_builder import build_snapshot as build_snapshot_domain

if TYPE_CHECKING:
    from ..coordinator import HubEnergieCoordinator

_LOGGER = logging.getLogger(__name__)

_MAX_POWER_INT = 3600.0

_DIAG_CAUSES: tuple[str, ...] = (
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
)


def _is_hc_slot(slot: str) -> bool:
    return slot.endswith("_hc")


def _is_hp_slot(slot: str) -> bool:
    return slot.endswith("_hp")


def _empty_slots() -> dict[str, float]:
    return {s: 0.0 for s in ATTRIBUTION_SLOTS}


def _resolve_batt_param(
    co: HubEnergieCoordinator,
    batt: Mapping[str, Any],
    value_key: str,
    entity_key: str,
    *,
    kind: str = "number",
) -> float | None:
    ent = batt.get(entity_key)
    if isinstance(ent, str) and ent:
        if kind == "soc":
            return co._reader.read_soc_percent(ent)
        return co._reader.read_number(ent)
    raw = batt.get(value_key)
    if raw is None:
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def _slot_vals(_co: HubEnergieCoordinator, day_acc: Mapping[str, Any], src: str) -> dict[str, float]:
    return slot_values_domain(dict(day_acc), src, ATTRIBUTION_SLOTS)


def _aggregate_battery_slot_vals(co: HubEnergieCoordinator, day_acc: Mapping[str, Any]) -> tuple[dict[str, float], dict[str, float]]:
    bc = _empty_slots()
    bd = _empty_slots()
    for batt in co.battery_systems:
        bid = batt.get("id", "")
        bc_b = _slot_vals(co, day_acc, f"batt_charge:{bid}")
        bd_b = _slot_vals(co, day_acc, f"batt_discharge:{bid}")
        for s in ATTRIBUTION_SLOTS:
            bc[s] += bc_b[s]
            bd[s] += bd_b[s]
    return bc, bd


def _compute_energy_aggregation(co: HubEnergieCoordinator, day_acc: Mapping[str, Any]) -> EnergyAggregation:
    grid = _slot_vals(co, day_acc, SOURCE_GRID)
    solar = _slot_vals(co, day_acc, SOURCE_SOLAR) if co.has_solar else _empty_slots()
    batt_charge, batt_discharge = _aggregate_battery_slot_vals(co, day_acc)
    return compute_energy_domain(
        grid=grid,
        solar=solar,
        battery_charge=batt_charge,
        battery_discharge=batt_discharge,
        slots=ATTRIBUTION_SLOTS,
    )


def _compute_costs(
    grid: Mapping[str, float],
    rates: Mapping[str, float],
    abo_day: float,
):
    return compute_costs_domain(
        grid_by_slot=dict(grid),
        rates_by_slot=dict(rates),
        slots=ATTRIBUTION_SLOTS,
        abonnement_eur=abo_day,
    )


def _compute_origin_and_usage(energy: EnergyAggregation) -> OriginAndUsage:
    return compute_origin_and_usage_domain(energy, ATTRIBUTION_SLOTS)


def _compute_power_flow_model(
    co: HubEnergieCoordinator,
    *,
    p_grid_raw: float | None,
    p_solar: float,
    p_batt_dis: float,
    p_batt_charge: float | None,
    p_load_measured: float | None,
) -> PowerFlowModel:
    return compute_power_flow_domain(
        p_grid_raw=p_grid_raw,
        p_solar=p_solar,
        p_batt_dis=p_batt_dis,
        p_batt_charge=p_batt_charge,
        p_load_measured=p_load_measured,
        grid_export_positive=(co.grid_power_sign_mode() == GRID_POWER_SIGN_EXPORT_POSITIVE),
    )


def _reinjection_option_float(co: HubEnergieCoordinator, key: str, default: float) -> float:
    raw = co.entry.options.get(key)
    if raw is None:
        return default
    try:
        return float(raw)
    except (TypeError, ValueError):
        return default


def _classify_reinjection_cause(
    co: HubEnergieCoordinator,
    p_export: float,
    p_solar: float,
    p_batt_charge: float | None,
    has_battery: bool,
    now: datetime,
    soc_fill_ratio: float | None,
    min_soc_for_full_frac: float,
    soc_at_or_above_max: bool | None,
) -> tuple[str, float, dict[str, Any]]:
    thresholds = ReinjectionThresholds(
        export_ignore_below_w=_reinjection_option_float(co, OPT_REINJECTION_EXPORT_IGNORE_BELOW_W, REINJECTION_EXPORT_IGNORE_BELOW_W),
        short_export_max_s=_reinjection_option_float(co, OPT_REINJECTION_SHORT_EXPORT_MAX_S, REINJECTION_SHORT_EXPORT_MAX_S),
        short_export_max_w=_reinjection_option_float(co, OPT_REINJECTION_SHORT_EXPORT_MAX_W, REINJECTION_SHORT_EXPORT_MAX_W),
        export_vs_solar_fraction=_reinjection_option_float(
            co, OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION, REINJECTION_EXPORT_VS_SOLAR_FRACTION
        ),
        export_min_abs_w=_reinjection_option_float(co, OPT_REINJECTION_EXPORT_MIN_ABS_W, REINJECTION_EXPORT_MIN_ABS_W),
        min_solar_for_classify_w=_reinjection_option_float(
            co, OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W, REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W
        ),
        batt_charge_significant_w=_reinjection_option_float(
            co, OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W, REINJECTION_BATT_CHARGE_SIGNIFICANT_W
        ),
        battery_full_min_soc_frac=min_soc_for_full_frac,
    )
    decision, active_since = classify_reinjection_cause_domain(
        p_export=p_export,
        p_solar=p_solar,
        p_batt_charge=p_batt_charge,
        has_battery=has_battery,
        now=now,
        export_active_since=co._reinjection_state.export_active_since,
        soc_fill_ratio=soc_fill_ratio,
        soc_at_or_above_max=soc_at_or_above_max,
        thresholds=thresholds,
        cause_unattributed=DIAG_CAUSE_UNATTRIBUTED,
        cause_battery_full_or_absent=DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
        cause_switch_latency=DIAG_CAUSE_SWITCH_LATENCY,
        cause_solar_surplus=DIAG_CAUSE_SOLAR_SURPLUS,
    )
    co._reinjection_state.export_active_since = active_since
    return decision.cause, decision.confidence, decision.inputs


def _update_reinjection_diagnostics(
    co: HubEnergieCoordinator,
    *,
    day: str,
    now_paris: datetime,
    rates: Mapping[str, float],
    flow: PowerFlowModel,
    cause: str,
) -> tuple[dict[str, float], dict[str, dict[str, float]], dict[str, float], float]:
    result = update_reinjection_diagnostics_domain(
        day=day,
        now_paris=now_paris,
        rates=dict(rates),
        flow=flow,
        cause=cause,
        slots=ATTRIBUTION_SLOTS,
        diag_causes=_DIAG_CAUSES,
        current_slot=co._edf.current_slot,
        last_ts=co._reinjection_state.last_ts,
        last_cause=co._reinjection_state.last_cause,
        last_slot=co._reinjection_state.last_slot,
        export_ignore_below_w=_reinjection_option_float(
            co, OPT_REINJECTION_EXPORT_IGNORE_BELOW_W, REINJECTION_EXPORT_IGNORE_BELOW_W
        ),
        max_power_integration_seconds=_MAX_POWER_INT,
        battery_power_split_available=_battery_power_split_available(co),
        ensure_diag_day=co._reinjection_state.ensure_day,
        ensure_diag_slot_day=co._reinjection_state.ensure_slot_day,
        ensure_batt_charge_split_day=co._runtime_state.ensure_batt_charge_split_day,
        ensure_batt_charge_split_slot_day=co._runtime_state.ensure_batt_charge_split_slot_day,
    )
    co._reinjection_state.update(result)
    return (
        result.diag_day,
        result.diag_slot_day,
        result.opportunity_by_cause,
        result.opportunity_total,
    )


def _battery_power_split_available(co: HubEnergieCoordinator) -> bool:
    pm = co.power_source_map()
    if not pm.get("grid_power") or not pm.get("solar_power"):
        return False
    for batt in co.battery_systems:
        if batt.get(CONF_BATT_POWER_IN) and batt.get(CONF_BATT_POWER_OUT):
            return True
    return False


def _usage_batt_charge_by_slot_from_heuristic(
    bc: Mapping[str, float],
) -> tuple[dict[str, float], dict[str, float]]:
    return usage_batt_charge_by_slot_from_heuristic_domain(
        batt_charge_by_slot=bc,
        slots=ATTRIBUTION_SLOTS,
        is_hc_slot=_is_hc_slot,
        is_hp_slot=_is_hp_slot,
    )


def _compute_battery_metrics(
    co: HubEnergieCoordinator,
    day_acc: Mapping[str, Any],
) -> tuple[list[dict[str, Any]], float, float, float, str]:
    result = compute_battery_metrics_domain(
        day_acc=dict(day_acc),
        battery_systems_cfg=co.battery_systems,
        slot_values=lambda d, source_key: _slot_vals(co, d, source_key),
        read_power_w=co._reader.read_power_w,
        read_energy_kwh=co._reader.read_energy_kwh,
        read_soc_percent=co._reader.read_soc_percent,
        resolve_batt_param=lambda batt, value_key, entity_key, kind="number": _resolve_batt_param(
            co, batt, value_key, entity_key, kind=kind
        ),
        net_sign_default=BATT_SIGN_POSITIVE_DISCHARGE,
        net_sign_positive_charge=BATT_SIGN_POSITIVE_CHARGE,
        conf_keys={
            "batt_name": CONF_BATT_NAME,
            "batt_power_in": CONF_BATT_POWER_IN,
            "batt_power_out": CONF_BATT_POWER_OUT,
            "batt_power_net": CONF_BATT_POWER_NET,
            "batt_power_net_sign": CONF_BATT_POWER_NET_SIGN,
            "batt_soc": CONF_BATT_SOC,
            "batt_capacity_kwh": CONF_BATT_CAPACITY_KWH,
            "batt_capacity_kwh_entity": CONF_BATT_CAPACITY_KWH_ENTITY,
            "batt_soc_min": CONF_BATT_SOC_MIN,
            "batt_soc_min_entity": CONF_BATT_SOC_MIN_ENTITY,
            "batt_soc_max": CONF_BATT_SOC_MAX,
            "batt_soc_max_entity": CONF_BATT_SOC_MAX_ENTITY,
            "batt_energy_available": CONF_BATT_ENERGY_AVAILABLE,
        },
        warn=lambda msg: _LOGGER.warning(msg),
    )
    return (
        result.battery_systems,
        result.total_charge_kwh,
        result.total_discharge_kwh,
        result.total_net_power_w,
        result.battery_data_quality,
    )


def _build_battery_card_metrics(batt_systems: list[dict[str, Any]]) -> dict[str, Any] | None:
    return compute_battery_card_metrics_domain(batt_systems)


def _compute_solar_estimate(
    co: HubEnergieCoordinator,
    now_paris: datetime,
) -> tuple[float | None, float | None, float | None]:
    if not co.solar_estimation_enabled:
        return None, None, None
    d = co.entry.data
    lat = d.get(CONF_SOLAR_LOCATION_LAT)
    lon = d.get(CONF_SOLAR_LOCATION_LON)
    peak = d.get(CONF_SOLAR_PEAK_POWER)
    tilt_mode = d.get(CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO)
    estimate = compute_solar_estimation(
        lat=float(lat) if lat is not None else None,
        lon=float(lon) if lon is not None else None,
        peak_kwp=float(peak) if peak else None,
        orientation_deg=float(d.get(CONF_SOLAR_ORIENTATION, 180)),
        tilt_deg=float(d.get(CONF_SOLAR_TILT, 30)),
        tilt_auto=(tilt_mode == SOLAR_TILT_AUTO),
        shading=str(d.get(CONF_SOLAR_SHADING, "none")),
        performance=str(d.get(CONF_SOLAR_PERFORMANCE, "standard")),
        now_paris=now_paris,
        paris_tz=PARIS_TZ,
    )
    return estimate.power_w, estimate.daily_kwh, estimate.yearly_kwh


def _source_total(co: HubEnergieCoordinator, prefix_or_key: str) -> float:
    return co._runtime_state.source_total(prefix_or_key, normalize_kwh=normalize_kwh)


def _read_aggregate_battery_power(co: HubEnergieCoordinator) -> tuple[float, float | None, bool]:
    return read_aggregate_battery_power_domain(
        battery_systems=co.battery_systems,
        read_power_w=co._reader.read_power_w,
    )


def build_pipeline_deps(co: HubEnergieCoordinator) -> SnapshotPipelineDeps:
    """Wire domain callables to coordinator reader/runtime/reinjection state."""
    return SnapshotPipelineDeps(
        compute_energy_aggregation=lambda d: _compute_energy_aggregation(co, d),
        compute_costs=_compute_costs,
        compute_origin_and_usage=_compute_origin_and_usage,
        power_source_map=co.power_source_map,
        read_grid_power_total_w=co._reader.read_grid_power_total_w,
        read_power_w=co._reader.read_power_w,
        read_aggregate_battery_power=lambda: _read_aggregate_battery_power(co),
        compute_power_flow_model=lambda **kw: _compute_power_flow_model(co, **kw),
        aggregate_battery_soc_fill_ratio=lambda: aggregate_battery_soc_fill_ratio_domain(
            has_batteries=co.has_batteries,
            battery_systems=co.battery_systems,
            resolve_batt_param=lambda batt, value_key, entity_key, kind="number": _resolve_batt_param(
                co, batt, value_key, entity_key, kind=kind
            ),
            read_soc_normalized=co._reader.read_soc_normalized,
        ),
        any_battery_at_max=lambda: any_battery_at_max_domain(
            has_batteries=co.has_batteries,
            battery_systems=co.battery_systems,
            resolve_batt_param=lambda batt, value_key, entity_key, kind="number": _resolve_batt_param(
                co, batt, value_key, entity_key, kind=kind
            ),
            read_soc_percent=co._reader.read_soc_percent,
        ),
        reinjection_option_float=lambda key, default: _reinjection_option_float(co, key, default),
        classify_reinjection_cause=lambda *a, **kw: _classify_reinjection_cause(co, *a, **kw),
        update_reinjection_diagnostics=lambda day, now_paris, rates, flow, cause: _update_reinjection_diagnostics(
            co, day=day, now_paris=now_paris, rates=rates, flow=flow, cause=cause
        ),
        compute_savings=lambda solar_by_slot, battery_charge_by_slot, battery_discharge_by_slot, rates_by_slot: compute_savings_domain(
            solar_by_slot=solar_by_slot,
            battery_charge_by_slot=battery_charge_by_slot,
            battery_discharge_by_slot=battery_discharge_by_slot,
            rates_by_slot=rates_by_slot,
            slots=ATTRIBUTION_SLOTS,
            is_hc_slot=_is_hc_slot,
        ),
        battery_power_split_available=lambda: _battery_power_split_available(co),
        get_batt_charge_power_split_day=lambda day: co._runtime_state.batt_charge_power_split_kwh.get(day, {}),
        get_batt_charge_power_split_slot_day=lambda day: co._runtime_state.batt_charge_power_split_slot_kwh.get(day, {}),
        usage_batt_charge_by_slot_from_heuristic=_usage_batt_charge_by_slot_from_heuristic,
        compute_tempo_snapshot=lambda now_paris: compute_tempo_snapshot(
            now_paris=now_paris,
            is_edf=co.is_edf,
            tariff_offer=co.tariff_offer,
            tempo_mode=co.tempo_mode,
            calendar_rows=co._edf.calendar_rows,
            tempo_days_api=co._edf.tempo_days_api,
        ),
        compute_battery_metrics=lambda day_acc: _compute_battery_metrics(co, day_acc),
        build_battery_card_metrics=_build_battery_card_metrics,
        compute_solar_estimate=lambda now_paris: _compute_solar_estimate(co, now_paris),
        source_total=lambda prefix: _source_total(co, prefix),
        slot_vals=lambda day_acc, src: _slot_vals(co, day_acc, src),
        norm_kwh=normalize_kwh,
        build_snapshot=build_snapshot_domain,
    )
