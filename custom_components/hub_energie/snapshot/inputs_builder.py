"""Construct SnapshotPipelineInputs from coordinator state (orchestration wiring only)."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ..const.config_keys import CONF_SOLAR_EXPORT_TARIFF
from ..const.core import LOGIC_VERSION
from ..const.energy_data import SOURCE_GRID, SOURCE_GRID_EXPORT, SOURCE_SOLAR
from ..const.reinjection import (
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    REINJECTION_BATT_FULL_MIN_SOC_FRAC,
)
from ..const.tariff_edf import CONF_CONTRACT_POWER, OPT_TARIFF_FETCHED_AT
from ..time.paris_time import ParisTime
from .pipeline import SnapshotPipelineInputs

_SNAPSHOT_DEBUG_OPT_KEY = "debug_snapshot"
_FLOW_MISMATCH_WARN_THRESHOLD_W = 30.0
_FLOW_MISMATCH_WARN_INTERVAL_S = 300.0
_REINJECTION_CONFIDENCE_GRID = 0.25
_REINJECTION_CONFIDENCE_SOLAR = 0.2
_REINJECTION_CONFIDENCE_BATTERY = 0.2
_REINJECTION_CONFIDENCE_LOAD = 0.05

__all__ = ("build_snapshot_inputs",)


def build_snapshot_inputs(coordinator: Any) -> SnapshotPipelineInputs:
    day = ParisTime.today()
    now_paris = ParisTime.now()
    day_acc: Mapping[str, Any] = coordinator._runtime_state.snapshot_data(day)
    tariff = coordinator._tariff or coordinator._build_tariff_resolver()
    rates = tariff.all_slot_rates()
    abo_day = tariff.subscription_daily()
    debug_enabled = bool(coordinator.entry.options.get(_SNAPSHOT_DEBUG_OPT_KEY, False))
    return SnapshotPipelineInputs(
        day=day,
        now_paris=now_paris,
        day_acc=day_acc,
        rates=rates,
        abonnement_day_eur=abo_day,
        current_slot=coordinator._edf.current_slot,
        today_color=coordinator._edf.today_color,
        tomorrow_color=coordinator._edf.tomorrow_color,
        is_edf=coordinator.is_edf,
        tariff_offer=coordinator.tariff_offer,
        contract_power=str(
            coordinator.entry.options.get(
                CONF_CONTRACT_POWER,
                coordinator.entry.data.get(CONF_CONTRACT_POWER, ""),
            )
        ),
        tariff_fetched_at=coordinator.entry.options.get(OPT_TARIFF_FETCHED_AT),
        tempo_mode=coordinator.tempo_mode,
        calendar_row_count=len(coordinator._edf.calendar_rows),
        calendar_fetched_at=coordinator._edf.calendar_fetched_at,
        logic_version=LOGIC_VERSION,
        supplier=coordinator.supplier,
        pricing_structure=coordinator.pricing_structure,
        phase_type=coordinator.phase_type,
        has_batteries=coordinator.has_batteries,
        solar_resale_configured=coordinator.solar_resale_configured,
        solar_export_tariff=float(coordinator.entry.data.get(CONF_SOLAR_EXPORT_TARIFF, 0.0)),
        debug_enabled=debug_enabled,
        flow_mismatch_warn_threshold_w=_FLOW_MISMATCH_WARN_THRESHOLD_W,
        flow_mismatch_warn_interval_s=_FLOW_MISMATCH_WARN_INTERVAL_S,
        last_flow_warn_ts=coordinator._last_flow_warn_ts,
        reinjection_confidence_grid=_REINJECTION_CONFIDENCE_GRID,
        reinjection_confidence_solar=_REINJECTION_CONFIDENCE_SOLAR,
        reinjection_confidence_battery=_REINJECTION_CONFIDENCE_BATTERY,
        reinjection_confidence_load=_REINJECTION_CONFIDENCE_LOAD,
        min_soc_option_key=OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
        min_soc_option_default=REINJECTION_BATT_FULL_MIN_SOC_FRAC,
        source_grid=SOURCE_GRID,
        source_solar=SOURCE_SOLAR,
        source_grid_export=SOURCE_GRID_EXPORT,
        source_batt_charge_prefix="batt_charge:",
        source_batt_discharge_prefix="batt_discharge:",
        diag_cause_solar_surplus=DIAG_CAUSE_SOLAR_SURPLUS,
        diag_cause_battery_full_or_absent=DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
        diag_cause_switch_latency=DIAG_CAUSE_SWITCH_LATENCY,
        diag_cause_unattributed=DIAG_CAUSE_UNATTRIBUTED,
    )
