"""Resolve current tariff slot from offer, tempo mode, and EDF runtime fields."""

from __future__ import annotations

from datetime import datetime

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const.tariff_edf import (
    CONF_CURRENT_SLOT_SENSOR,
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
    parse_slot_from_sensor_state,
)
from .edf_state import EdfRuntimeFields

__all__ = ("resolve_slot",)


def resolve_slot(
    *,
    now_paris: datetime,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    edf_fields: EdfRuntimeFields,
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> str | None:
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
    if mode == TEMPO_MODE_SENSOR:
        eid = entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        st = hass.states.get(eid) if eid else None
        edf_fields.current_slot = parse_slot_from_sensor_state(st.state if st else None)
        return edf_fields.current_slot
    if mode == TEMPO_MODE_RTE:
        if edf_fields.calendar_rows:
            slot = current_slot_from_calendar(edf_fields.calendar_rows, now_paris)
            if slot and slot in SLOTS:
                return slot
            colour = current_colour_from_calendar(edf_fields.calendar_rows, now_paris)
            return build_current_slot(colour, now_paris)
        col = edf_fields.today_color if edf_fields.today_color not in ("unknown", "n/a", "") else None
        return build_current_slot(col, now_paris)
    if mode == TEMPO_MODE_API:
        col = edf_fields.today_color if edf_fields.today_color not in ("unknown", "n/a", "") else None
        return build_current_slot(col, now_paris)
    return None
