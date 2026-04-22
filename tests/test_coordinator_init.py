"""Tests for hub_energie.coordinator_init wiring."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

ci = importlib.import_module("hub_energie.coordinator_init")


def test_wire_hub_energie_coordinator_after_super_order() -> None:
    """Scheduler receives coordinator callbacks; heavy deps are constructed once each."""

    class _Co:
        hass = SimpleNamespace()
        entry = SimpleNamespace(options={})

        def source_map(self) -> dict[str, str | None]:
            return {}

        def _expected_source_keys(self) -> set[str]:
            return set()

        def _read_energy_kwh_for_persistence(self, _eid: str | None) -> float | None:
            return None

        def _next_poll_fire_local(self, _after: object) -> object:
            return object()

        async def _async_scheduled_poll(self) -> None:
            return None

        async def _async_midnight_maintenance(self) -> None:
            return None

        async def _async_refresh_tariffs(self, *, update_entry: bool) -> bool:
            return True

    co = _Co()
    log = MagicMock()

    with (
        patch.object(ci, "StoreManager") as sm,
        patch.object(ci, "HAReader") as hr,
        patch.object(ci, "ReinjectionState") as rs,
        patch.object(ci, "RuntimeState") as rt,
        patch.object(ci, "PersistenceManager") as pm,
        patch.object(ci, "build_pipeline_deps", return_value=object()),
        patch.object(ci, "SnapshotPipeline") as sp,
        patch.object(ci, "Scheduler") as sch,
        patch.object(ci.asyncio, "Lock", return_value=MagicMock(name="state_lock")),
    ):
        ci.wire_hub_energie_coordinator_after_super(co, co.hass, co.entry, logger=log)

    sm.assert_called_once()
    hr.assert_called_once()
    rs.assert_called_once()
    rt.assert_called_once()
    pm.assert_called_once()
    sp.assert_called_once()
    sch.assert_called_once()

    kwargs = sch.call_args.kwargs
    assert kwargs["hass"] is co.hass
    assert kwargs["entry"] is co.entry
    # MagicMock call recording can duplicate bound-method objects; __eq__ still matches.
    assert kwargs["next_poll_fire_local"] == co._next_poll_fire_local
    assert kwargs["on_scheduled_poll"] == co._async_scheduled_poll
    assert kwargs["on_midnight"] == co._async_midnight_maintenance
    assert co._scheduler is sch.return_value
