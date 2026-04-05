"""Minimal dependency stubs so tests run outside a full Home Assistant environment."""

from __future__ import annotations

import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import zoneinfo

_original_zoneinfo = zoneinfo.ZoneInfo


def _zone_info_with_test_fallback(key: str):
    try:
        return _original_zoneinfo(key)
    except zoneinfo.ZoneInfoNotFoundError:
        if key == "Europe/Paris":
            return timezone(timedelta(hours=1))
        raise


zoneinfo.ZoneInfo = _zone_info_with_test_fallback  # type: ignore[assignment]


def _ensure_stub_aiohttp() -> None:
    if "aiohttp" in sys.modules:
        return
    aio = types.ModuleType("aiohttp")
    aio.ClientSession = type("ClientSession", (), {})  # noqa: PLC0415 — test stub only
    sys.modules["aiohttp"] = aio


def _ensure_stub_homeassistant() -> None:
    if "homeassistant" in sys.modules:
        return
    ha = types.ModuleType("homeassistant")
    ha.__path__ = []  # type: ignore[attr-defined] — namespace package for homeassistant.helpers.*
    sys.modules["homeassistant"] = ha

    core = types.ModuleType("homeassistant.core")
    core.HomeAssistant = type("HomeAssistant", (), {})
    sys.modules["homeassistant.core"] = core
    ha.core = core

    entries = types.ModuleType("homeassistant.config_entries")
    entries.ConfigEntry = type("ConfigEntry", (), {})
    sys.modules["homeassistant.config_entries"] = entries

    util = types.ModuleType("homeassistant.util")
    dt_mod = types.ModuleType("homeassistant.util.dt")

    def _utcnow() -> datetime:
        return datetime(2026, 6, 15, 10, 30, 0, tzinfo=timezone.utc)

    dt_mod.utcnow = _utcnow
    util.dt = dt_mod
    sys.modules["homeassistant.util"] = util
    sys.modules["homeassistant.util.dt"] = dt_mod
    ha.util = util

    helpers = types.ModuleType("homeassistant.helpers")
    helpers.__path__ = []  # type: ignore[attr-defined]
    aiohttp_client = types.ModuleType("homeassistant.helpers.aiohttp_client")

    async def async_get_clientsession(*_a: object, **_kw: object) -> None:
        raise RuntimeError("async_get_clientsession is not available in standalone tests")

    aiohttp_client.async_get_clientsession = async_get_clientsession
    sys.modules["homeassistant.helpers"] = helpers
    sys.modules["homeassistant.helpers.aiohttp_client"] = aiohttp_client
    ha.helpers = helpers


_ensure_stub_aiohttp()
_ensure_stub_homeassistant()


def pytest_configure(config: object) -> None:
    """Map ``hub_energie`` to the integration root so tests can import submodules."""
    hub_dir = Path(__file__).resolve().parents[1]
    if "hub_energie" in sys.modules:
        return
    pkg = types.ModuleType("hub_energie")
    pkg.__path__ = [str(hub_dir)]  # type: ignore[attr-defined]
    sys.modules["hub_energie"] = pkg
