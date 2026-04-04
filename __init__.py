"""Hub Énergie – energy monitoring integration for Home Assistant."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady

from .const import DOMAIN
from .coordinator import HubEnergieCoordinator
from .migration import async_migrate_entry  # noqa: F401 — entry point for HA

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]
_FRONTEND_STATIC_KEY = f"{DOMAIN}_frontend_static_registered"
_LOVELACE_MODULE_URL_KEY = f"{DOMAIN}_lovelace_module_url"  # tuple[str, str] | str (legacy)
_SERVICE_FLAG = f"{DOMAIN}_service_registered"


def _read_integration_version(integration_dir: Path) -> str:
    """Return manifest version for cache-busting the Lovelace module URL."""
    try:
        with (integration_dir / "manifest.json").open(encoding="utf-8") as f:
            data = json.load(f)
        return str(data.get("version") or "0")
    except (OSError, TypeError, json.JSONDecodeError):
        return "0"


async def _async_register_card_route(hass: HomeAssistant) -> None:
    """Register /{domain} static route once; refresh extra Lovelace JS when dist/manifest changes."""
    integration_dir = Path(__file__).parent
    frontend_dir = integration_dir / "frontend"
    dist_dir = frontend_dir / "dist"
    dist_file = dist_dir / "hub-energie-card.js"
    preload_file = dist_dir / "hub-energie-card-preload.js"

    if not hass.data.get(_FRONTEND_STATIC_KEY):
        if not dist_file.is_file():
            _LOGGER.warning(
                "dist/hub-energie-card.js missing under frontend/. "
                "Run the Vite build before using the card."
            )
            return
        frontend_resolved = str(frontend_dir.resolve())
        registered = False

        if hasattr(hass, "http") and hass.http is not None:
            if hasattr(hass.http, "async_register_static_paths"):
                try:
                    from homeassistant.components.http import StaticPathConfig

                    await hass.http.async_register_static_paths(
                        [
                            StaticPathConfig(
                                f"/{DOMAIN}",
                                frontend_resolved,
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
                        frontend_resolved,
                        cache_headers=False,
                    )
                    registered = True
                except (AttributeError, OSError, TypeError) as err:
                    _LOGGER.debug("register_static_path failed: %s", err)

        if not registered:
            _LOGGER.warning(
                "Could not register static path for hub-energie-card.js "
                "(ensure manifest lists http dependency and HA is up to date)"
            )
            return

        hass.data[_FRONTEND_STATIC_KEY] = True

    if not dist_file.is_file():
        return

    version = await hass.async_add_executor_job(
        _read_integration_version, integration_dir
    )

    def _dist_cache_bust() -> str:
        try:
            return str(int(dist_file.stat().st_mtime))
        except OSError:
            return "0"

    bust = await hass.async_add_executor_job(_dist_cache_bust)
    query = f"v={version}-{bust}"
    new_main = f"/{DOMAIN}/dist/hub-energie-card.js?{query}"
    new_preload = f"/{DOMAIN}/dist/hub-energie-card-preload.js?{query}"
    use_preload = await hass.async_add_executor_job(preload_file.is_file)
    new_pair: tuple[str, str] | str = (
        (new_preload, new_main) if use_preload else new_main
    )
    old_registered = hass.data.get(_LOVELACE_MODULE_URL_KEY)
    if old_registered == new_pair:
        return

    try:
        from homeassistant.components.frontend import (
            add_extra_js_url,
            remove_extra_js_url,
        )
    except ImportError:
        _LOGGER.warning("frontend component not available for Hub Énergie card module")
        return

    try:
        if old_registered:
            if isinstance(old_registered, tuple):
                for u in old_registered:
                    remove_extra_js_url(hass, u)
            else:
                remove_extra_js_url(hass, old_registered)
        if use_preload:
            add_extra_js_url(hass, new_preload)
        add_extra_js_url(hass, new_main)
    except KeyError:
        _LOGGER.warning(
            "Could not register Hub Énergie card as extra module "
            "(frontend component not ready; check manifest dependencies)",
        )
        return

    hass.data[_LOVELACE_MODULE_URL_KEY] = new_pair
    _LOGGER.info(
        "Hub Énergie Lovelace module URL(s) updated: preload=%s main=%s "
        "(remove duplicate Dashboard resources for these paths)",
        new_preload if use_preload else "(disabled)",
        new_main,
    )


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Global setup: register card route + domain services."""
    await _async_register_card_route(hass)
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
    await _async_register_card_route(hass)
    coordinator = HubEnergieCoordinator(hass, entry)
    await coordinator.async_setup()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    try:
        await coordinator.async_config_entry_first_refresh()
    except Exception as err:  # noqa: BLE001
        _LOGGER.error("First refresh failed: %s", err)
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
