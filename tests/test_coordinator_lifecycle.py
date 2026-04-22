"""Tests for hub_energie.coordinator_lifecycle."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

lifecycle = importlib.import_module("hub_energie.coordinator_lifecycle")


def test_coordinator_next_poll_fire_local_delegates() -> None:
    after = datetime(2026, 1, 1, 12, 0, 0)
    expected = datetime(2026, 1, 1, 13, 0, 0)

    with patch.object(lifecycle, "resolve_next_poll", return_value=expected) as m:
        got = lifecycle.coordinator_next_poll_fire_local(
            after,
            is_edf=True,
            tariff_offer="tempo",
            tempo_mode="api",
            tomorrow_color="bleu",
        )
    assert got is expected
    m.assert_called_once_with(
        after,
        is_edf=True,
        tariff_offer="tempo",
        tempo_mode="api",
        tomorrow_color="bleu",
    )


async def _run_async_setup() -> None:
    co = SimpleNamespace()
    co._trust_rebuilding_after_recorder = False
    co._tariff = None
    co.entry = SimpleNamespace(async_on_unload=lambda _fn: None)
    co.hass = SimpleNamespace(bus=SimpleNamespace(async_listen=lambda *_a, **_k: "unsub"))
    co._scheduler = MagicMock()
    co._async_refresh_delta_telemetry_drift_all_sources = AsyncMock()
    persistence = SimpleNamespace(load=AsyncMock(return_value=({}, True)))
    co._persistence = persistence
    co.entry.data = {}
    co.entry.options = {}

    with patch.object(lifecycle, "build_tariff_resolver", return_value="resolver") as br:
        with patch.object(lifecycle, "create_state_changed_handler", return_value=lambda e: None) as csh:
            await lifecycle.coordinator_async_setup(co)

    assert co._trust_rebuilding_after_recorder is True
    assert co._tariff == "resolver"
    br.assert_called_once()
    csh.assert_called_once_with(co)
    co._scheduler.start.assert_called_once()
    co._async_refresh_delta_telemetry_drift_all_sources.assert_awaited_once()


def test_coordinator_async_setup_wires_load_scheduler_listener() -> None:
    asyncio.run(_run_async_setup())


async def _run_rebuild() -> None:
    co = SimpleNamespace()
    co._persistence = SimpleNamespace(rebuild_from_recorder=AsyncMock())
    await lifecycle.coordinator_rebuild_from_recorder(co)
    co._persistence.rebuild_from_recorder.assert_awaited_once()


def test_coordinator_rebuild_from_recorder() -> None:
    asyncio.run(_run_rebuild())


def test_coordinator_cancel_and_arm_poll_delegate_to_scheduler() -> None:
    co = SimpleNamespace(_scheduler=MagicMock())
    lifecycle.coordinator_cancel_poll_schedule(co)
    co._scheduler.cancel_poll.assert_called_once()
    lifecycle.coordinator_arm_next_poll(co)
    co._scheduler.schedule_poll.assert_called_once()


async def _run_scheduled_poll() -> None:
    co = SimpleNamespace()
    refresh = AsyncMock()
    await lifecycle.coordinator_run_scheduled_poll(co, async_request_refresh=refresh)
    refresh.assert_awaited_once()


def test_coordinator_run_scheduled_poll() -> None:
    asyncio.run(_run_scheduled_poll())
