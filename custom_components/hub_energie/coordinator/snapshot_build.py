"""Run snapshot pipeline + post-process (trust, input probe, etc.)."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, cast

from .snapshot_post import finalize_snapshot_after_pipeline
from .types import EnergyData
from ..snapshot.inputs_builder import build_snapshot_inputs


def run_coordinator_snapshot_build(
    co: Any,
    *,
    logger: logging.Logger,
) -> tuple[EnergyData, datetime | None, bool, str | None]:
    """Build full ``EnergyData`` snapshot; returns flow-warn ts and input-probe state for the coordinator."""
    inputs = build_snapshot_inputs(co)
    result = co._snapshot_pipeline.run(inputs)

    next_last_flow_warn_ts = result.next_last_flow_warn_ts
    if result.should_warn_flow_mismatch:
        logger.warning(
            "Flow model mismatch (raw_home=%.1f modeled_home=%.1f gap=%.1f)",
            result.raw_home_power_w,
            result.modeled_home_power_w,
            result.flow_gap_w,
        )

    if inputs.debug_enabled:
        logger.debug(
            "Snapshot debug day=%s slot=%s cost=%.3f export_w=%.1f flow_gap=%.3f",
            inputs.day,
            co._edf.current_slot,
            result.snapshot["cost_total"],
            result.snapshot["export_power_w"],
            result.snapshot["debug_flow_gap_w"],
        )
    snap = dict(result.snapshot)
    snap, first_input_probe_logged, last_input_probe_signature = finalize_snapshot_after_pipeline(
        snap=snap,
        runtime_delta_telemetry=co._runtime_state.delta_telemetry,
        runtime_delta_discards=co._runtime_state.delta_discards,
        runtime_last_delta_rejection=co._runtime_state.last_delta_rejection_by_source,
        snapshot_data_for_day=co._runtime_state.snapshot_data,
        expected_source_keys=co._expected_source_keys,
        hass=co.hass,
        entry=co.entry,
        reader=co._reader,
        trust_rebuilding_after_recorder=co._trust_rebuilding_after_recorder,
        is_edf=co.is_edf,
        tariff_offer=co.tariff_offer,
        tempo_mode=co.tempo_mode,
        tempo_rte_calendar_ready=co.tempo_rte_calendar_ready,
        tariff_refresh_rejected_incomplete=co._tariff_refresh_rejected_incomplete,
        first_input_probe_logged=co._first_input_probe_logged,
        last_input_probe_signature=co._last_input_probe_signature,
        logger=logger,
    )

    return cast(EnergyData, snap), next_last_flow_warn_ts, first_input_probe_logged, last_input_probe_signature
