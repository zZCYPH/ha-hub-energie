"""Unit tests for coordinator_data_quality.compute_snapshot_data_quality."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path
from unittest.mock import patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

const = importlib.import_module("hub_energie.const")
dq_mod = importlib.import_module("hub_energie.coordinator_data_quality")


def test_data_quality_good() -> None:
    def _snap(_day: str) -> dict:
        return {const.SOURCE_GRID: {"bleu_hp": 1.0}}

    tel = {"grid": {"last_method": "direct", "last_gap_seconds": 60.0}}
    assert dq_mod.compute_snapshot_data_quality(_snap, tel) == "good"


def test_data_quality_degraded_unknown_bucket() -> None:
    def _snap(_day: str) -> dict:
        return {const.SOURCE_GRID: {const.SLOT_UNKNOWN: 0.02}}

    assert dq_mod.compute_snapshot_data_quality(_snap, {}) == "degraded"


def test_data_quality_degraded_indirect_method() -> None:
    def _snap(_day: str) -> dict:
        return {const.SOURCE_GRID: {}}

    tel = {"grid": {"last_method": "fallback", "last_gap_seconds": None}}
    assert dq_mod.compute_snapshot_data_quality(_snap, tel) == "degraded"


def test_data_quality_degraded_long_gap() -> None:
    def _snap(_day: str) -> dict:
        return {const.SOURCE_GRID: {}}

    tel = {"grid": {"last_method": "direct", "last_gap_seconds": 7201.0}}
    assert dq_mod.compute_snapshot_data_quality(_snap, tel) == "degraded"


def test_data_quality_uses_paris_today_for_day_key() -> None:
    calls: list[str] = []

    def _snap(day: str) -> dict:
        calls.append(day)
        return {const.SOURCE_GRID: {}}

    with patch.object(dq_mod, "ParisTime") as pt:
        pt.today.return_value = "2026-05-01"
        assert dq_mod.compute_snapshot_data_quality(_snap, {}) == "good"
    assert calls == ["2026-05-01"]
