"""Apply a single energy meter delta (attribution, runtime state, notify)."""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable

from homeassistant.util import dt as dt_util

from .const.tariff_edf import SLOT_UNKNOWN, TARIFF_OFFER_TEMPO, TEMPO_MODE_API
from .coordinator_policy import local_now, local_today_iso
from .energy.delta_policy import DeltaPolicy
from .runtime.state import RuntimeState
from .tariff import EdfRuntimeFields
from .tariff.slot_attribution import resolve_attribution_slot
_LOGGER = logging.getLogger(__name__)


async def apply_energy_delta(
    *,
    hass: object,
    entry: object,
    edf: EdfRuntimeFields,
    runtime_state: RuntimeState,
    state_lock: object,
    delta_policy: DeltaPolicy,
    normalize_kwh: Callable[[float], float],
    read_energy_kwh_for_persistence: Callable[[str | None], float | None],
    schedule_save_locked: Callable[[], None],
    async_request_refresh: Callable[[], Awaitable[None]],
    async_notify_all: Callable[[], Awaitable[None]],
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    entity_id: str,
    source_key: str,
    new_val: float,
    energy_attrib_date_ref: list[str | None],
    logger: logging.Logger | None = None,
) -> None:
    """Mirror HubEnergieCoordinator._async_apply_delta (kept out of coordinator.py for size)."""
    log = logger or _LOGGER
    now_paris = local_now()
    day = local_today_iso()

    if (
        is_edf
        and tariff_offer == TARIFF_OFFER_TEMPO
        and tempo_mode == TEMPO_MODE_API
        and energy_attrib_date_ref[0] != day
    ):
        energy_attrib_date_ref[0] = day
        await async_request_refresh()

    prev_tel = runtime_state.delta_telemetry.get(source_key, {})
    prev_iso = prev_tel.get("last_applied_at") if isinstance(prev_tel, dict) else None
    gap_seconds: float | None = None
    if isinstance(prev_iso, str):
        prev_dt = dt_util.parse_datetime(prev_iso)
        if prev_dt is not None:
            gap_seconds = (dt_util.utcnow() - prev_dt).total_seconds()

    attribution = resolve_attribution_slot(
        now_paris=now_paris,
        is_edf=is_edf,
        tariff_offer=tariff_offer,
        tempo_mode=tempo_mode,
        edf_fields=edf,
        hass=hass,
        entry=entry,
        last_stable_slot=runtime_state.last_stable_attribution_slot,
    )
    if attribution.slot == SLOT_UNKNOWN:
        await async_request_refresh()
        attribution = resolve_attribution_slot(
            now_paris=local_now(),
            is_edf=is_edf,
            tariff_offer=tariff_offer,
            tempo_mode=tempo_mode,
            edf_fields=edf,
            hass=hass,
            entry=entry,
            last_stable_slot=runtime_state.last_stable_attribution_slot,
        )

    slot = attribution.slot
    method = attribution.method
    edf.current_slot = slot

    if method != "direct":
        log.info(
            "Energy delta attribution source=%s slot=%s method=%s",
            source_key,
            slot,
            method,
        )

    normalized_new = normalize_kwh(new_val)
    reanchor_outcomes = frozenset(
        {"initialized", "source_changed", "reset_rebased", "discarded_unrealistic"}
    )
    async with state_lock:
        result = runtime_state.apply_delta(
            day=day,
            slot=slot,
            source_key=source_key,
            entity_id=entity_id,
            normalized_new=normalized_new,
            normalize_kwh=normalize_kwh,
            delta_policy=delta_policy,
        )
        if result.outcome in reanchor_outcomes:
            runtime_state.reanchor_drift_meter_for_source(
                source_key,
                meter_kwh=normalized_new,
                normalize_kwh=normalize_kwh,
            )
        if result.outcome == "discarded_negative":
            runtime_state.note_delta_discard("discarded_negative")
            runtime_state.record_last_delta_rejection(
                source_key,
                reason="discarded_negative",
                at_iso=dt_util.utcnow().isoformat(),
                delta_kwh=result.delta_kwh,
                last_raw=result.last_raw,
                new_raw=result.new_raw,
            )
            log.warning(
                "Discarded negative delta for %s: old=%.6f new=%.6f",
                source_key,
                result.last_raw or 0.0,
                result.new_raw or 0.0,
            )
        elif result.outcome == "discarded_unrealistic":
            runtime_state.note_delta_discard("discarded_unrealistic")
            runtime_state.record_last_delta_rejection(
                source_key,
                reason="discarded_unrealistic",
                at_iso=dt_util.utcnow().isoformat(),
                delta_kwh=result.delta_kwh,
                last_raw=result.last_raw,
                new_raw=result.new_raw,
            )
            log.warning(
                "Discarded unrealistic delta for %s: delta=%.6f",
                source_key,
                result.delta_kwh,
            )
        elif result.outcome == "applied":
            meter_kwh = read_energy_kwh_for_persistence(entity_id)
            drift_kwh = runtime_state.relative_meter_drift_kwh(
                source_key,
                meter_kwh=meter_kwh,
                normalize_kwh=normalize_kwh,
            )
            runtime_state.record_applied_delta_telemetry(
                source_key,
                applied_at_iso=dt_util.utcnow().isoformat(),
                delta_kwh=result.delta_kwh,
                slot=slot,
                method=method,
                gap_seconds=gap_seconds,
                drift_kwh=drift_kwh,
            )
        if result.outcome in reanchor_outcomes:
            drift_now = runtime_state.relative_meter_drift_kwh(
                source_key,
                meter_kwh=normalized_new,
                normalize_kwh=normalize_kwh,
            )
            runtime_state.patch_delta_telemetry_drift(source_key, drift_now)
        if result.should_save:
            schedule_save_locked()

    await async_notify_all()
