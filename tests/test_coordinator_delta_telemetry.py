"""Tests for hub_energie.coordinator_delta_telemetry."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from pathlib import Path
from unittest.mock import MagicMock

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

dt_mod = importlib.import_module("hub_energie.coordinator.delta_telemetry")


async def _run_refresh() -> None:
    lock = asyncio.Lock()
    rt = MagicMock()
    rt.relative_meter_drift_kwh.return_value = 0.5

    reads: list[str | None] = []

    def _read(eid: str | None) -> float:
        reads.append(eid)
        return 10.0

    await dt_mod.refresh_delta_telemetry_drift_all_sources(
        lock,
        rt,
        {"grid": "sensor.g", "solar": None},
        _read,
        lambda x: float(x),
    )
    assert reads == ["sensor.g"]
    rt.relative_meter_drift_kwh.assert_called_once()
    rt.patch_delta_telemetry_drift.assert_called_once_with("grid", 0.5)


def test_refresh_delta_telemetry_drift_skips_empty_entities() -> None:
    asyncio.run(_run_refresh())
