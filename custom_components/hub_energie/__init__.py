"""Hub Énergie – energy monitoring integration for Home Assistant."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
    ResourceYAMLCollection,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady, HomeAssistantError
from homeassistant.helpers.start import async_at_started

from .const import DOMAIN
from .coordinator import HubEnergieCoordinator
from .utils.startup_failure import log_first_refresh_failure
from .migration import async_migrate_entry  # noqa: F401 — entry point for HA

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]
_FRONTEND_STATIC_KEY = f"{DOMAIN}_frontend_static_registered"
_LOVELACE_REGISTER_SCHEDULED_KEY = f"{DOMAIN}_lovelace_register_scheduled"
_SERVICE_FLAG = f"{DOMAIN}_service_registered"

CARD_BOOT_MODULE_PATH = f"/{DOMAIN}/hub-energie-card-boot.js"


async def _async_register_card_http_route(hass: HomeAssistant) -> None:
    """Serve frontend/dist at /{domain} (once). Safe to call anytime http is up."""
    integration_dir = Path(__file__).parent
    frontend_dir = integration_dir / "frontend"
    dist_dir = frontend_dir / "dist"
    boot_file = dist_dir / "hub-energie-card-boot.js"
    core_file = dist_dir / "hub-energie-card.js"

    if hass.data.get(_FRONTEND_STATIC_KEY):
        return

    if not boot_file.is_file() or not core_file.is_file():
        _LOGGER.warning(
            "dist/hub-energie-card-boot.js and dist/hub-energie-card.js missing under frontend/. "
            "The repository normally includes these (rebuilt in CI); reinstall or run npm run build "
            "in frontend/ if you use a trimmed copy without dist/."
        )
        return

    dist_resolved = str(dist_dir.resolve())
    registered = False

    if hasattr(hass, "http") and hass.http is not None:
        if hasattr(hass.http, "async_register_static_paths"):
            try:
                from homeassistant.components.http import StaticPathConfig

                await hass.http.async_register_static_paths(
                    [
                        StaticPathConfig(
                            f"/{DOMAIN}",
                            dist_resolved,
                            False,
                        )
                    ]
                )
                registered = True
            except (OSError, TypeError, ValueError) as err:
                _LOGGER.debug("async_register_static_paths failed: %s", err)

        if not registered and hasattr(hass.http, "register_static_path"):
            try:
                hass.http.register_static_path(
                    f"/{DOMAIN}",
                    dist_resolved,
                    cache_headers=False,
                )
                registered = True
            except (AttributeError, OSError, TypeError) as err:
                _LOGGER.debug("register_static_path failed: %s", err)

    if not registered:
        _LOGGER.warning(
            "Could not register static path for Hub Énergie frontend "
            "(ensure manifest lists http dependency and HA is up to date)"
        )
        return

    hass.data[_FRONTEND_STATIC_KEY] = True


async def _async_cleanup_legacy_extra_js_urls(hass: HomeAssistant) -> None:
    """Drop Hub Énergie from frontend extra_module_url (replaced by Lovelace resource)."""
    try:
        from homeassistant.components.frontend import remove_extra_js_url
    except ImportError:
        return
    for u in (
        f"/{DOMAIN}/hub-energie-card-boot.js",
        f"/{DOMAIN}/hub-energie-card.js",
    ):
        try:
            remove_extra_js_url(hass, u)
        except (KeyError, ValueError):
            pass


def _lovelace_item_url_matches(item_url: str, expected_path: str) -> bool:
    if not item_url or not expected_path:
        return False
    u = item_url.strip()
    if u == expected_path:
        return True
    base = u.split("?", 1)[0].rstrip("/")
    return base.endswith(expected_path) or base == expected_path.rstrip("/")


async def _async_ensure_lovelace_storage_resource(hass: HomeAssistant) -> None:
    """Add the card boot URL to Lovelace resources (storage mode), same as the UI Resources page."""
    integration_dir = Path(__file__).parent
    dist_dir = integration_dir / "frontend" / "dist"
    if not (dist_dir / "hub-energie-card-boot.js").is_file() or not (
        dist_dir / "hub-energie-card.js"
    ).is_file():
        return

    await _async_cleanup_legacy_extra_js_urls(hass)

    ll_data = hass.data.get(LOVELACE_DATA)
    if ll_data is None:
        _LOGGER.debug(
            "Lovelace not initialized; skip Hub Énergie resource (e.g. recovery mode)"
        )
        return

    resources = ll_data.resources
    if isinstance(resources, ResourceYAMLCollection):
        _LOGGER.info(
            "Lovelace resources are in YAML mode; add under lovelace.resources: "
            "{url: %s, type: module}",
            CARD_BOOT_MODULE_PATH,
        )
        return

    if not isinstance(resources, ResourceStorageCollection):
        return

    await resources.async_load()

    for item in resources.async_items():
        if _lovelace_item_url_matches(item.get("url", ""), CARD_BOOT_MODULE_PATH):
            return

    try:
        await resources.async_create_item(
            {"res_type": "module", "url": CARD_BOOT_MODULE_PATH}
        )
    except (HomeAssistantError, vol.Invalid, ValueError) as err:
        _LOGGER.error("Could not add Hub Énergie Lovelace resource: %s", err)
        return

    _LOGGER.info(
        "Added Hub Énergie as a Lovelace resource (%s). "
        "Remove any duplicate manual entry for the same URL if you added one while testing.",
        CARD_BOOT_MODULE_PATH,
    )


def _schedule_lovelace_resource(hass: HomeAssistant) -> None:
    """Run after HA start so Lovelace storage is ready."""

    if hass.data.get(_LOVELACE_REGISTER_SCHEDULED_KEY):
        return
    hass.data[_LOVELACE_REGISTER_SCHEDULED_KEY] = True

    async def _go(_h: HomeAssistant) -> None:
        await _async_ensure_lovelace_storage_resource(_h)

    async_at_started(hass, _go)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Global setup: register card route + domain services."""
    await _async_register_card_http_route(hass)
    _schedule_lovelace_resource(hass)
    if not hass.data.get(_SERVICE_FLAG):

        async def _handle_refresh(_call) -> None:
            for coordinator in hass.data.get(DOMAIN, {}).values():
                if isinstance(coordinator, HubEnergieCoordinator):
                    await coordinator.async_request_refresh()

        async def _handle_refresh_tariffs(_call) -> None:
            for coordinator in hass.data.get(DOMAIN, {}).values():
                if isinstance(coordinator, HubEnergieCoordinator):
                    await coordinator.async_manual_tariff_refresh()

        hass.services.async_register(DOMAIN, "refresh", _handle_refresh)
        hass.services.async_register(DOMAIN, "refresh_tariffs", _handle_refresh_tariffs)
        hass.data[_SERVICE_FLAG] = True
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Hub Énergie from a config entry."""
    await _async_register_card_http_route(hass)
    if hass.state is CoreState.running:
        await _async_ensure_lovelace_storage_resource(hass)
    else:
        _schedule_lovelace_resource(hass)
    coordinator = HubEnergieCoordinator(hass, entry)
    await coordinator.async_setup()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    try:
        await coordinator.async_config_entry_first_refresh()
    except BaseException as err:
        if isinstance(err, asyncio.CancelledError):
            raise
        log_first_refresh_failure(_LOGGER, entry_id=entry.entry_id, exc=err)
        raise ConfigEntryNotReady from err

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
        if not hass.data.get(DOMAIN) and hass.data.get(_SERVICE_FLAG):
            hass.services.async_remove(DOMAIN, "refresh")
            hass.services.async_remove(DOMAIN, "refresh_tariffs")
            hass.data[_SERVICE_FLAG] = False
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload on options change."""
    await hass.config_entries.async_reload(entry.entry_id)
