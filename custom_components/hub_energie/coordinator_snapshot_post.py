"""Post-processing after SnapshotPipeline.run (telemetry, trust, input probe)."""

from __future__ import annotations

import json
import logging
from collections.abc import Callable, Mapping, MutableMapping
from typing import Any

from homeassistant.util import dt as dt_util

from .const.energy_data import (
    DATA_CURRENT_SLOT,
    DATA_DATA_QUALITY,
    DATA_DELTA_DISCARDS,
    DATA_DELTA_LAST_REJECTION,
    DATA_DELTA_TELEMETRY,
    DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY,
    DATA_INPUT_MISSING_ENTITY_IDS,
    DATA_INPUT_STATUS,
    DATA_INPUT_STATUS_REASONS,
    DATA_INPUT_UNAVAILABLE_ENTITY_IDS,
    DATA_SECONDS_SINCE_LAST_APPLIED_DELTA,
    DATA_TRUST_CAUSE,
    DATA_TRUST_CAUSE_CODE,
    DATA_TRUST_LEVEL,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    SOURCE_GRID,
)
from .const.tariff_edf import SLOT_UNKNOWN, TARIFF_OFFER_TEMPO, TEMPO_MODE_RTE
from .coordinator_data_quality import compute_snapshot_data_quality
from .energy.delta_observability import seconds_since_last_applied_delta
from .energy.trust_level import TrustInputs, compute_trust
from .time.paris_time import ParisTime
from .utils.input_availability import (
    compute_input_probe,
    derive_input_status,
    format_probe_log_dict,
    probe_signature,
)


def finalize_snapshot_after_pipeline(
    *,
    snap: MutableMapping[str, Any],
    runtime_delta_telemetry: Mapping[str, Any],
    runtime_delta_discards: Mapping[str, int],
    runtime_last_delta_rejection: Mapping[str, Any],
    snapshot_data_for_day: Callable[[str], Mapping[str, Any]],
    expected_source_keys: Callable[[], set[str]],
    hass: Any,
    entry: Any,
    reader: Any,
    trust_rebuilding_after_recorder: bool,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    tempo_rte_calendar_ready: bool,
    tariff_refresh_rejected_incomplete: bool,
    first_input_probe_logged: bool,
    last_input_probe_signature: str | None,
    logger: logging.Logger,
) -> tuple[MutableMapping[str, Any], bool, str | None]:
    """Enrich pipeline snapshot with quality, deltas, trust, and input probe; log probe changes."""
    snap[DATA_DELTA_TELEMETRY] = {
        k: dict(v) if isinstance(v, dict) else v
        for k, v in runtime_delta_telemetry.items()
    }
    snap[DATA_DELTA_DISCARDS] = dict(runtime_delta_discards)
    snap[DATA_DELTA_LAST_REJECTION] = dict(runtime_last_delta_rejection)

    snap[DATA_DATA_QUALITY] = compute_snapshot_data_quality(
        snapshot_data_for_day,
        snap[DATA_DELTA_TELEMETRY],
    )

    day_today = ParisTime.today()
    grid_day = snapshot_data_for_day(day_today).get(SOURCE_GRID, {})
    unk_today = (
        float(grid_day.get(SLOT_UNKNOWN, 0.0))
        if isinstance(grid_day, dict)
        else 0.0
    )
    snap[DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY] = unk_today
    snap[DATA_SECONDS_SINCE_LAST_APPLIED_DELTA] = seconds_since_last_applied_delta(
        snap[DATA_DELTA_TELEMETRY],
        now_utc=dt_util.utcnow(),
    )

    slot_raw = snap.get(DATA_CURRENT_SLOT)
    slot_str = str(slot_raw).strip() if slot_raw is not None else ""
    trust = compute_trust(
        TrustInputs(
            post_recorder_rebuild_pending=trust_rebuilding_after_recorder,
            delta_telemetry=snap[DATA_DELTA_TELEMETRY],
            delta_discards=snap[DATA_DELTA_DISCARDS],
            grid_unknown_bucket_kwh_today=float(snap[DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY]),
            seconds_since_last_applied_delta=snap[DATA_SECONDS_SINCE_LAST_APPLIED_DELTA],
            has_configured_energy_sources=bool(expected_source_keys()),
            current_slot=slot_str if slot_str else None,
            is_edf_tempo_rte_not_ready=(
                is_edf
                and tariff_offer == TARIFF_OFFER_TEMPO
                and tempo_mode == TEMPO_MODE_RTE
                and not tempo_rte_calendar_ready
            ),
            tariff_refresh_rejected_incomplete=tariff_refresh_rejected_incomplete,
            battery_data_quality=str(snap.get("battery_data_quality") or "ok"),
            data_quality=str(snap[DATA_DATA_QUALITY]),
        ),
    )
    snap[DATA_TRUST_LEVEL] = trust.level
    snap[DATA_TRUST_CAUSE_CODE] = trust.cause_code
    snap[DATA_TRUST_CAUSE] = trust.cause_message

    probe = compute_input_probe(hass, entry, reader)
    input_status, input_reasons = derive_input_status(
        probe,
        trust_level=str(snap[DATA_TRUST_LEVEL]),
        data_quality=str(snap[DATA_DATA_QUALITY]),
    )
    snap[DATA_INPUT_STATUS] = input_status
    snap[DATA_INPUT_STATUS_REASONS] = list(input_reasons)
    snap[DATA_INPUT_MISSING_ENTITY_IDS] = list(probe.missing_entity_ids)
    snap[DATA_INPUT_UNAVAILABLE_ENTITY_IDS] = list(probe.unavailable_entity_ids)

    sig = probe_signature(input_status, probe)
    log_payload = format_probe_log_dict(
        entry_id=entry.entry_id,
        input_status=input_status,
        reasons=input_reasons,
        probe=probe,
    )
    line = json.dumps(log_payload, ensure_ascii=False)
    next_first_logged = first_input_probe_logged
    next_sig = last_input_probe_signature
    if not first_input_probe_logged:
        next_first_logged = True
        lvl = (
            logging.WARNING
            if input_status in (INPUT_STATUS_NO_INPUT, INPUT_STATUS_ERROR)
            else logging.INFO
        )
        logger.log(lvl, "Hub Énergie input probe (first refresh): %s", line)
    elif sig != last_input_probe_signature:
        logger.info("Hub Énergie input probe (status changed): %s", line)
    next_sig = sig

    return snap, next_first_logged, next_sig
