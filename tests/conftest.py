"""Minimal dependency stubs so tests run outside a full Home Assistant environment."""

from __future__ import annotations

import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Generic, TypeVar

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

    class ClientConnectionError(Exception):
        """Minimal stub for ``hub_energie.providers.http_retry`` imports."""

    class ClientResponseError(Exception):
        """Minimal stub matching aiohttp's ``status`` attribute."""

        def __init__(
            self,
            request_info: object = None,
            history: object = None,
            *,
            status: int = 0,
            message: str = "",
            headers: object = None,
        ) -> None:
            self.status = status
            self.message = message

    aio.ClientSession = type("ClientSession", (), {})  # noqa: PLC0415 — test stub only
    aio.ClientConnectionError = ClientConnectionError
    aio.ClientResponseError = ClientResponseError
    sys.modules["aiohttp"] = aio


def _ensure_stub_homeassistant() -> None:
    if "homeassistant" in sys.modules:
        return
    ha = types.ModuleType("homeassistant")
    ha.__path__ = []  # type: ignore[attr-defined] — namespace package for homeassistant.helpers.*
    sys.modules["homeassistant"] = ha

    core = types.ModuleType("homeassistant.core")

    def _callback(fn: Any) -> Any:
        return fn

    core.callback = _callback
    core.CALLBACK_TYPE = type(None)
    core.State = type("State", (), {})  # noqa: PLC0415 — test stub only
    core.Event = type("Event", (), {})  # noqa: PLC0415 — test stub only
    core.EventStateChangedData = type(  # noqa: PLC0415 — test stub only
        "EventStateChangedData", (), {}
    )

    class _Bus:
        def async_listen(self, *_a: object, **_kw: object) -> object:
            return lambda: None

    class _States:
        def get(self, _entity_id: object) -> None:
            return None

    class HomeAssistant:
        def __init__(self) -> None:
            self.bus = _Bus()
            self.states = _States()

        def async_create_task(self, coro: object) -> None:
            return None

    core.HomeAssistant = HomeAssistant
    sys.modules["homeassistant.core"] = core
    ha.core = core

    entries = types.ModuleType("homeassistant.config_entries")
    entries.ConfigEntry = type("ConfigEntry", (), {})
    sys.modules["homeassistant.config_entries"] = entries

    util = types.ModuleType("homeassistant.util")
    dt_mod = types.ModuleType("homeassistant.util.dt")

    def _utcnow() -> datetime:
        return datetime(2026, 6, 15, 10, 30, 0, tzinfo=timezone.utc)

    def _parse_datetime(dt_str: str) -> datetime | None:
        if not isinstance(dt_str, str):
            return None
        try:
            normalized = dt_str.replace("Z", "+00:00") if dt_str.endswith("Z") else dt_str
            return datetime.fromisoformat(normalized)
        except ValueError:
            return None

    dt_mod.utcnow = _utcnow
    dt_mod.parse_datetime = _parse_datetime
    dt_mod.UTC = timezone.utc
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


def _ensure_ha_persistence_stubs() -> None:
    """Extra HA shims for ``runtime.persistence`` imports."""
    if "homeassistant.helpers.storage" in sys.modules:
        return

    storage_mod = types.ModuleType("homeassistant.helpers.storage")

    class Store:
        def __init__(self, hass: object, version: int, key: str) -> None:
            self.hass = hass
            self.version = version
            self.key = key

        async def async_load(self) -> None:
            return None

        async def async_save(self, _data: object) -> None:
            return None

    storage_mod.Store = Store
    sys.modules["homeassistant.helpers.storage"] = storage_mod

    event_mod = types.ModuleType("homeassistant.helpers.event")

    def async_call_later(hass: object, delay: float, action: object) -> object:
        return lambda: None

    def async_track_time_change(
        hass: object, action: object, hour: int = 0, minute: int = 0, second: int = 0
    ) -> object:
        return lambda: None

    def async_track_point_in_time(hass: object, action: object, fire_time: object) -> object:
        return lambda: None

    event_mod.async_call_later = async_call_later
    event_mod.async_track_time_change = async_track_time_change
    event_mod.async_track_point_in_time = async_track_point_in_time
    sys.modules["homeassistant.helpers.event"] = event_mod

    components = types.ModuleType("homeassistant.components")
    components.__path__ = []  # type: ignore[attr-defined]
    sys.modules["homeassistant.components"] = components

    diag_comp = types.ModuleType("homeassistant.components.diagnostics")

    def async_redact_data(data: dict[str, Any], to_redact: list[str] | tuple[str, ...]) -> dict[str, Any]:
        redacted = dict(data)
        for key in to_redact:
            if key in redacted:
                redacted[key] = "**REDACTED**"
        return redacted

    diag_comp.async_redact_data = async_redact_data
    sys.modules["homeassistant.components.diagnostics"] = diag_comp

    sensor_mod = types.ModuleType("homeassistant.components.sensor")

    class SensorStateClass:
        TOTAL_INCREASING = "total_increasing"

    sensor_mod.SensorStateClass = SensorStateClass
    sys.modules["homeassistant.components.sensor"] = sensor_mod

    recorder_mod = types.ModuleType("homeassistant.components.recorder")

    class _RecorderInstance:
        """Minimal recorder stub; ``async_db_ready`` must be awaitable (matches real HA)."""

        @property
        def async_db_ready(self) -> object:
            async def _ready() -> bool:
                return True

            return _ready()

        async def async_add_executor_job(self, fn: object) -> object:
            return fn()  # type: ignore[misc]

    recorder_mod.get_instance = lambda _hass: _RecorderInstance()
    sys.modules["homeassistant.components.recorder"] = recorder_mod

    stats_mod = types.ModuleType("homeassistant.components.recorder.statistics")
    stats_mod._captured_external: list[tuple[dict[str, Any], list[Any]]] = []

    def async_add_external_statistics(
        hass: object, metadata: dict[str, Any], stats: list[Any]
    ) -> None:
        stats_mod._captured_external.append((dict(metadata), list(stats)))

    def statistics_during_period(*_a: object, **_kw: object) -> dict[str, list[Any]]:
        return {}

    stats_mod.async_add_external_statistics = async_add_external_statistics
    stats_mod.statistics_during_period = statistics_during_period
    sys.modules["homeassistant.components.recorder.statistics"] = stats_mod


def _ensure_ha_coordinator_stubs() -> None:
    if "homeassistant.helpers.update_coordinator" in sys.modules:
        return
    uc_mod = types.ModuleType("homeassistant.helpers.update_coordinator")

    _T = TypeVar("_T")

    class DataUpdateCoordinator(Generic[_T]):
        def __init__(
            self,
            hass: object,
            logger: object,
            name: str,
            update_interval: object,
        ) -> None:
            self.hass = hass
            self.logger = logger
            self.name = name
            self.update_interval = update_interval
            self.data: object | None = None

        def async_update_listeners(self) -> None:
            return None

        async def async_request_refresh(self) -> None:
            return None

    uc_mod.DataUpdateCoordinator = DataUpdateCoordinator
    sys.modules["homeassistant.helpers.update_coordinator"] = uc_mod


_ensure_stub_aiohttp()
_ensure_stub_homeassistant()
_ensure_ha_persistence_stubs()
_ensure_ha_coordinator_stubs()


def _register_hub_energie_const_test_barrel() -> None:
    """Expose const submodules on ``hub_energie.const`` for ``importlib…hub_energie.const``.

    Match ``pytest_configure``: keep a lightweight ``hub_energie`` package stub so
    submodule imports do not execute the full integration ``__init__.py``.
    """
    import importlib

    repo_root = Path(__file__).resolve().parents[1]
    hub_dir = repo_root / "custom_components" / "hub_energie"
    if "hub_energie" not in sys.modules:
        pkg = types.ModuleType("hub_energie")
        pkg.__path__ = [str(hub_dir)]  # type: ignore[attr-defined]
        sys.modules["hub_energie"] = pkg
    for sub in ("core", "tariff_edf", "reinjection", "energy_data", "config_keys"):
        importlib.import_module(f"hub_energie.const.{sub}")
    barrel = types.ModuleType("hub_energie.const")
    barrel.__path__ = [str(hub_dir / "const")]  # type: ignore[attr-defined]
    for sub in ("core", "tariff_edf", "reinjection", "energy_data", "config_keys"):
        mod = importlib.import_module(f"hub_energie.const.{sub}")
        for name in dir(mod):
            if name.startswith("_"):
                continue
            setattr(barrel, name, getattr(mod, name))
    sys.modules["hub_energie.const"] = barrel


_register_hub_energie_const_test_barrel()

_skipped_nodeids: set[str] = set()


def pytest_configure(config: object) -> None:
    """Map ``hub_energie`` to the integration root so tests can import submodules."""
    _skipped_nodeids.clear()
    repo_root = Path(__file__).resolve().parents[1]
    hub_dir = repo_root / "custom_components" / "hub_energie"
    if "hub_energie" in sys.modules:
        return
    pkg = types.ModuleType("hub_energie")
    pkg.__path__ = [str(hub_dir)]  # type: ignore[attr-defined]
    sys.modules["hub_energie"] = pkg


def pytest_runtest_logreport(report: object) -> None:
    """Track skips so we can fail the session if any test was skipped (see pytest_unconfigure)."""
    if getattr(report, "skipped", False):
        nodeid = getattr(report, "nodeid", None)
        if isinstance(nodeid, str):
            _skipped_nodeids.add(nodeid)


def pytest_unconfigure(config: object) -> None:
    """Exit non-zero if any test was skipped — keeps CI/local runs honest."""
    if not _skipped_nodeids:
        return
    import sys

    lines = "\n".join(sorted(_skipped_nodeids))
    print(
        f"\nERROR: {len(_skipped_nodeids)} skipped test(s); skips are not allowed.\n{lines}\n",
        file=sys.stderr,
    )
    sys.exit(1)
