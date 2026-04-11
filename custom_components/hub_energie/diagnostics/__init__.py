"""Diagnostics helpers public API."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .reinjection_state import ReinjectionState

__all__ = [
    "ReinjectionState",
    "async_get_config_entry_diagnostics",
]


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Delegate to ``entry`` module so importing ``ReinjectionState`` stays lightweight."""
    from .entry import async_get_config_entry_diagnostics as _impl

    return await _impl(hass, entry)
