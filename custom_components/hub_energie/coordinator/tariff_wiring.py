"""Tariff resolver construction and remote refresh wiring for the coordinator."""

from __future__ import annotations

import logging
from collections.abc import Mapping

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const.tariff_edf import (
    DEFAULT_TARIFF_AUTO_REFRESH,
    DEFAULT_TARIFF_REFRESH_HOURS,
    OPT_TARIFF_AUTO_REFRESH,
    OPT_TARIFF_REFRESH_HOURS,
)
from ..tariff import TariffRefreshOutcome, refresh_tariffs
from ..tariff_manager import TariffResolver


def build_tariff_resolver(entry: ConfigEntry) -> TariffResolver:
    return TariffResolver(dict(entry.options), dict(entry.data))


def tariff_refresh_enabled(entry_options: Mapping[str, object]) -> bool:
    return bool(entry_options.get(OPT_TARIFF_AUTO_REFRESH, DEFAULT_TARIFF_AUTO_REFRESH))


def tariff_refresh_hours(entry_options: Mapping[str, object]) -> int:
    raw = entry_options.get(OPT_TARIFF_REFRESH_HOURS, DEFAULT_TARIFF_REFRESH_HOURS)
    try:
        return max(1, int(raw))
    except (TypeError, ValueError):
        return DEFAULT_TARIFF_REFRESH_HOURS


def next_tariff_refresh_rejected_incomplete(
    prior: bool,
    outcome: TariffRefreshOutcome,
) -> bool:
    """Update coordinator incomplete-tariff flag from a refresh outcome."""
    if outcome.rejected_incomplete_payload:
        return True
    if outcome.complete_payload_accepted:
        return False
    return prior


async def async_refresh_tariffs(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    update_entry: bool,
    is_edf: bool,
    tariff_offer: str,
    logger: logging.Logger,
) -> TariffRefreshOutcome:
    """Thin wrapper around tariff.refresh_tariffs for coordinator call sites."""
    return await refresh_tariffs(
        hass,
        entry,
        update_entry=update_entry,
        is_edf=is_edf,
        tariff_offer=tariff_offer,
        logger=logger,
    )
