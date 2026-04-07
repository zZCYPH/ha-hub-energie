"""EDF / Tempo HTTP client calls only (no coordinator, no field mutations)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from ..const import CONF_RTE_CLIENT_ID, CONF_RTE_CLIENT_SECRET
from ..providers.edf import (
    async_get_calendar_rows,
    async_get_tempo_stats_with_raw,
    async_get_today_tomorrow_colors,
)

__all__ = (
    "fetch_rte_tempo_calendar",
    "fetch_tempo_api_colors_and_stats",
)


async def fetch_rte_tempo_calendar(hass: HomeAssistant, entry_data: dict[str, Any]) -> list[Any]:
    session = async_get_clientsession(hass)
    cid = entry_data[CONF_RTE_CLIENT_ID]
    secret = entry_data[CONF_RTE_CLIENT_SECRET]
    return await async_get_calendar_rows(session, cid, secret)


async def fetch_tempo_api_colors_and_stats(hass: HomeAssistant) -> tuple[
    str | None,
    str | None,
    dict[str, dict[str, int]] | None,
    dict[str, Any] | None,
]:
    session = async_get_clientsession(hass)
    today_color, tomorrow_color = await async_get_today_tomorrow_colors(session)
    tempo_days_api, api_stats_raw = await async_get_tempo_stats_with_raw(session)
    return today_color, tomorrow_color, tempo_days_api, api_stats_raw
