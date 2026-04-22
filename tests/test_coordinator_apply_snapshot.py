"""Tests for hub_energie.coordinator_apply_snapshot."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

as_mod = importlib.import_module("hub_energie.coordinator.apply_snapshot")


async def _run_apply(*, clear: bool) -> None:
    lock = asyncio.Lock()
    snap = {"k": 1}
    co = SimpleNamespace(
        _state_lock=lock,
        _build_snapshot=MagicMock(return_value=snap),
        data={},
        _reinjection_state=SimpleNamespace(dirty=True, mark_clean=MagicMock()),
        _schedule_store_save_locked=MagicMock(),
        async_update_listeners=MagicMock(),
        _trust_rebuilding_after_recorder=True,
    )
    out = await as_mod.apply_snapshot_to_coordinator(co, clear_trust_rebuilding_after_recorder=clear)
    assert out is snap
    assert co.data is snap
    co._reinjection_state.mark_clean.assert_called_once()
    co._schedule_store_save_locked.assert_called_once()
    co.async_update_listeners.assert_called_once()
    assert co._trust_rebuilding_after_recorder is (False if clear else True)


def test_apply_snapshot_clears_trust_flag_when_requested() -> None:
    asyncio.run(_run_apply(clear=True))


def test_apply_snapshot_preserves_trust_flag_when_false() -> None:
    asyncio.run(_run_apply(clear=False))


async def _run_no_dirty() -> None:
    co = SimpleNamespace(
        _state_lock=asyncio.Lock(),
        _build_snapshot=MagicMock(return_value={}),
        data={},
        _reinjection_state=SimpleNamespace(dirty=False, mark_clean=MagicMock()),
        _schedule_store_save_locked=MagicMock(),
        async_update_listeners=MagicMock(),
        _trust_rebuilding_after_recorder=False,
    )
    await as_mod.apply_snapshot_to_coordinator(co, clear_trust_rebuilding_after_recorder=False)
    co._reinjection_state.mark_clean.assert_not_called()
    co._schedule_store_save_locked.assert_not_called()


def test_apply_snapshot_skips_save_when_reinjection_clean() -> None:
    asyncio.run(_run_no_dirty())
