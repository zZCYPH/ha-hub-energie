"""Config-entry diagnostics download (Settings → integration → Download diagnostics)."""

from __future__ import annotations

from typing import Any, Final

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import (
    CONF_RTE_CLIENT_ID,
    CONF_RTE_CLIENT_SECRET,
    DOMAIN,
)
from ..utils.config_display import config_overview_attributes, redact_entry_data_for_display

# Keys never shipped in diagnostics JSON (secrets / credentials).
_TO_REDACT: Final[tuple[str, ...]] = (
    CONF_RTE_CLIENT_SECRET,
    CONF_RTE_CLIENT_ID,
)


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return redacted config-entry diagnostics for support."""
    overview = config_overview_attributes(entry)
    payload: dict[str, Any] = {
        "integration_version": entry.version,
        "title": entry.title,
        "config_overview": overview,
        "entry_data": async_redact_data(redact_entry_data_for_display(dict(entry.data)), _TO_REDACT),
        "entry_options": async_redact_data(dict(entry.options), _TO_REDACT),
    }

    coordinator = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if coordinator is not None and hasattr(coordinator, "data") and hasattr(
        coordinator, "last_update_success"
    ):
        payload["coordinator"] = {
            "last_update_success": coordinator.last_update_success,
            "data": coordinator.data,
        }
    else:
        payload["coordinator"] = None

    return payload
