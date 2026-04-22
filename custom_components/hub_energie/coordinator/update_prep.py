"""Pre-snapshot refresh: rebuild tariff resolver and refresh EDF runtime (or non-EDF defaults)."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .tariff_wiring import build_tariff_resolver
from ..providers.edf import is_off_peak
from ..tariff import EdfRuntimeFields, update_edf_state
from ..tariff_manager import TariffResolver


async def refresh_tariff_resolver_and_edf_before_snapshot(
    *,
    hass: HomeAssistant,
    entry: ConfigEntry,
    edf: EdfRuntimeFields,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    now_paris: datetime,
    logger: logging.Logger,
    on_tempo_sensor_branch: Callable[[], None],
    update_edf_state_fn: Any = update_edf_state,
    build_tariff_resolver_fn: Any = build_tariff_resolver,
) -> TariffResolver:
    """Return a fresh TariffResolver and align ``edf`` with supplier/tariff mode."""
    tariff = build_tariff_resolver_fn(entry)
    if is_edf:
        await update_edf_state_fn(
            hass=hass,
            entry=entry,
            fields=edf,
            now_paris=now_paris,
            tariff_offer=tariff_offer,
            tempo_mode=tempo_mode,
            logger=logger,
            on_tempo_sensor_branch=on_tempo_sensor_branch,
        )
    else:
        edf.today_color = "n/a"
        edf.tomorrow_color = "n/a"
        edf.current_slot = "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
        edf.tempo_days_api = None
    return tariff
