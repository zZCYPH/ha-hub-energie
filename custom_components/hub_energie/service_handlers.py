"""Domain service handlers (refresh, tariff refresh) with optional config entry scope."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from .const.core import DOMAIN


def _is_hub_coordinator(obj: Any) -> bool:
    """True for the real coordinator or test doubles with the same async API."""
    from .coordinator import HubEnergieCoordinator

    if isinstance(obj, HubEnergieCoordinator):
        return True
    return hasattr(obj, "async_request_refresh") and hasattr(obj, "async_manual_tariff_refresh")


def _optional_config_entry_id(call: Any) -> str | None:
    raw = call.data.get("config_entry_id")
    if raw is None or raw == "":
        return None
    if not isinstance(raw, str):
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="service_invalid_config_entry_id",
            translation_placeholders={"detail": "config_entry_id must be a string"},
        )
    entry_id = raw.strip()
    if not entry_id:
        return None
    return entry_id


def _coordinators_for_call(hass: HomeAssistant, call: Any) -> list[Any]:
    """Return coordinators to act on; one entry if ``config_entry_id`` is set, else all."""
    entry_id = _optional_config_entry_id(call)
    domain_map = hass.data.get(DOMAIN, {})
    all_coords = [c for c in domain_map.values() if _is_hub_coordinator(c)]
    if entry_id is None:
        return all_coords
    if entry_id not in domain_map:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="service_unknown_config_entry",
            translation_placeholders={"config_entry_id": entry_id},
        )
    coordinator = domain_map[entry_id]
    if not _is_hub_coordinator(coordinator):
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="service_unknown_config_entry",
            translation_placeholders={"config_entry_id": entry_id},
        )
    return [coordinator]


async def async_handle_refresh(hass: HomeAssistant, call: Any) -> None:
    """Force coordinator refresh(es)."""
    for coordinator in _coordinators_for_call(hass, call):
        await coordinator.async_request_refresh()


async def async_handle_refresh_tariffs(hass: HomeAssistant, call: Any) -> None:
    """Force tariff refresh on coordinator(s) with auto-mode semantics."""
    for coordinator in _coordinators_for_call(hass, call):
        await coordinator.async_manual_tariff_refresh()


def async_register_domain_services(hass: HomeAssistant) -> None:
    """Register ``refresh`` and ``refresh_tariffs`` once (``async_setup``)."""

    async def _refresh(call: Any) -> None:
        _optional_config_entry_id(call)  # validate shape early
        await async_handle_refresh(hass, call)

    async def _refresh_tariffs(call: Any) -> None:
        _optional_config_entry_id(call)
        await async_handle_refresh_tariffs(hass, call)

    hass.services.async_register(DOMAIN, "refresh", _refresh)
    hass.services.async_register(DOMAIN, "refresh_tariffs", _refresh_tariffs)
