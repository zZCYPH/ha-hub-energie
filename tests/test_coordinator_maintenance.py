"""Tests for hub_energie.coordinator_maintenance."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from pathlib import Path

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

maint = importlib.import_module("hub_energie.coordinator_maintenance")


async def _run() -> None:
    calls: list[str] = []

    async def write(day: str) -> None:
        calls.append(f"write:{day}")

    lock = asyncio.Lock()

    def cleanup(**kwargs: object) -> None:
        calls.append(f"cleanup:{kwargs}")

    def schedule() -> None:
        calls.append("save")

    async def flush() -> None:
        calls.append("flush")

    async def refresh() -> None:
        calls.append("refresh")

    await maint.run_midnight_maintenance(
        yesterday_iso="2026-01-01",
        write_day_statistics=write,
        state_lock=lock,
        cleanup_accumulators=lambda keep_days: cleanup(keep_days=keep_days),
        schedule_save_locked=schedule,
        flush_pending_store_save=flush,
        request_refresh=refresh,
        keep_days=7,
    )
    assert calls == ["write:2026-01-01", "cleanup:{'keep_days': 7}", "save", "flush", "refresh"]


def test_run_midnight_maintenance_order() -> None:
    asyncio.run(_run())
