"""EDF / Tempo runtime fields update (orchestration, mutates EdfRuntimeFields only)."""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from ..const import TARIFF_OFFER_BASE, TARIFF_OFFER_HPHC, TARIFF_OFFER_TEMPO, TEMPO_MODE_API, TEMPO_MODE_RTE
from ..providers.edf import (
    build_current_slot,
    current_colour_from_calendar,
    current_slot_from_calendar,
    is_off_peak,
    tomorrow_colour_from_calendar,
)
from .edf_client import fetch_rte_tempo_calendar, fetch_tempo_api_colors_and_stats

__all__ = ("EdfRuntimeFields", "update_edf_state")


@dataclass
class EdfRuntimeFields:
    calendar_rows: list[Any] = field(default_factory=list)
    calendar_fetched_at: datetime | None = None
    today_color: str = "unknown"
    tomorrow_color: str = "unknown"
    current_slot: str | None = None
    tempo_days_api: dict[str, dict[str, int]] | None = None
    api_stats_raw: dict[str, Any] | None = None


async def update_edf_state(
    *,
    hass: HomeAssistant,
    entry: ConfigEntry,
    fields: EdfRuntimeFields,
    now_paris: datetime,
    tariff_offer: str,
    tempo_mode: str,
    logger: logging.Logger,
    on_tempo_sensor_branch: Callable[[], None] | None = None,
) -> None:
    offer = tariff_offer
    if offer == TARIFF_OFFER_TEMPO and tempo_mode == TEMPO_MODE_RTE:
        try:
            fields.calendar_rows = await fetch_rte_tempo_calendar(hass, dict(entry.data))
            fields.calendar_fetched_at = dt_util.utcnow()
        except Exception as err:  # noqa: BLE001
            logger.warning("RTE calendar fetch failed: %s", err)
        colour = current_colour_from_calendar(fields.calendar_rows, now_paris)
        fields.today_color = colour or "unknown"
        tcol = tomorrow_colour_from_calendar(fields.calendar_rows, now_paris)
        fields.tomorrow_color = tcol or "unknown"
        fields.current_slot = current_slot_from_calendar(fields.calendar_rows, now_paris)
        if fields.current_slot is None:
            fields.current_slot = build_current_slot(colour, now_paris)
        fields.tempo_days_api = None

    elif offer == TARIFF_OFFER_TEMPO and tempo_mode == TEMPO_MODE_API:
        try:
            today_color, tomorrow_color, tempo_days, api_stats = await fetch_tempo_api_colors_and_stats(hass)
            fields.tempo_days_api = tempo_days
            fields.api_stats_raw = api_stats
        except Exception as err:  # noqa: BLE001
            logger.warning("api-couleur-tempo fetch failed: %s", err)
            today_color, tomorrow_color = None, None
            fields.tempo_days_api = None
            fields.api_stats_raw = None
        fields.today_color = today_color or "unknown"
        fields.tomorrow_color = tomorrow_color or "unknown"
        fields.current_slot = build_current_slot(today_color, now_paris)

    elif offer == TARIFF_OFFER_TEMPO:
        if on_tempo_sensor_branch is not None:
            on_tempo_sensor_branch()
        fields.tempo_days_api = None

    elif offer == TARIFF_OFFER_HPHC:
        fields.today_color = "n/a"
        fields.tomorrow_color = "n/a"
        fields.current_slot = "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
        fields.tempo_days_api = None

    elif offer == TARIFF_OFFER_BASE:
        fields.today_color = "n/a"
        fields.tomorrow_color = "n/a"
        fields.current_slot = "bleu_hp"
        fields.tempo_days_api = None

    else:
        fields.today_color = "unknown"
        fields.tomorrow_color = "unknown"
        fields.current_slot = "bleu_hp"
        fields.tempo_days_api = None
