"""Resolve tariff slot for energy deltas with fallbacks (no silent drops)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import (
    ATTRIBUTION_SLOTS,
    SLOT_UNKNOWN,
    SLOTS,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
)
from ..providers.edf import (
    build_current_slot,
    current_colour_from_calendar,
    current_slot_from_calendar,
    is_off_peak,
)
from .edf_state import EdfRuntimeFields
from .slot_resolver import resolve_slot

__all__ = ("SlotAttributionResult", "resolve_attribution_slot", "resolve_slot_schedule_only")


SlotResolutionMethod = Literal[
    "direct",
    "fallback_last_known",
    "fallback_schedule",
    "unknown",
]


@dataclass(frozen=True)
class SlotAttributionResult:
    """Slot used for accumulator write + provenance for observability."""

    slot: str
    method: SlotResolutionMethod


def resolve_slot_schedule_only(
    *,
    now_paris: datetime,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    edf_fields: EdfRuntimeFields,
) -> str | None:
    """Pure slot from wall clock + frozen ``edf_fields`` only.

    Must not read Home Assistant state or perform I/O — coordinator refreshes
    ``edf_fields`` on its own schedule before deltas run.
    """
    if not is_edf:
        return "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"

    offer = tariff_offer
    if offer == TARIFF_OFFER_BASE:
        return "bleu_hp"
    if offer == TARIFF_OFFER_HPHC:
        return "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
    if offer != TARIFF_OFFER_TEMPO:
        return "bleu_hp"

    mode = tempo_mode
    if mode == TEMPO_MODE_RTE:
        if edf_fields.calendar_rows:
            slot = current_slot_from_calendar(edf_fields.calendar_rows, now_paris)
            if slot and slot in SLOTS:
                return slot
            colour = current_colour_from_calendar(edf_fields.calendar_rows, now_paris)
            return build_current_slot(colour, now_paris)
        col = edf_fields.today_color if edf_fields.today_color not in ("unknown", "n/a", "") else None
        return build_current_slot(col, now_paris)

    if mode in (TEMPO_MODE_API, TEMPO_MODE_SENSOR):
        col = edf_fields.today_color if edf_fields.today_color not in ("unknown", "n/a", "") else None
        return build_current_slot(col, now_paris)

    return None


def resolve_attribution_slot(
    *,
    now_paris: datetime,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    edf_fields: EdfRuntimeFields,
    hass: HomeAssistant,
    entry: ConfigEntry,
    last_stable_slot: str | None,
) -> SlotAttributionResult:
    """Resolve slot for delta application: direct resolver, then fallbacks, then UNKNOWN.

    Guarantees ``result.slot in ATTRIBUTION_SLOTS``.
    """
    direct = resolve_slot(
        now_paris=now_paris,
        is_edf=is_edf,
        tariff_offer=tariff_offer,
        tempo_mode=tempo_mode,
        edf_fields=edf_fields,
        hass=hass,
        entry=entry,
    )
    if direct is not None and direct in SLOTS:
        return SlotAttributionResult(direct, "direct")

    if last_stable_slot and last_stable_slot in SLOTS:
        return SlotAttributionResult(last_stable_slot, "fallback_last_known")

    sched = resolve_slot_schedule_only(
        now_paris=now_paris,
        is_edf=is_edf,
        tariff_offer=tariff_offer,
        tempo_mode=tempo_mode,
        edf_fields=edf_fields,
    )
    if sched is not None and sched in SLOTS:
        return SlotAttributionResult(sched, "fallback_schedule")

    return SlotAttributionResult(SLOT_UNKNOWN, "unknown")
