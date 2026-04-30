"""Diagnostics helpers public API."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .config_entry_payload import build_config_entry_diagnostics
from .reinjection_state import ReinjectionState

__all__ = [
    "ReinjectionState",
    "async_get_config_entry_diagnostics",
]


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> dict[str, Any]:
    """Diagnostics download (Settings → Devices & services → Hub Énergie → Download diagnostics)."""
    return build_config_entry_diagnostics(hass, config_entry)
