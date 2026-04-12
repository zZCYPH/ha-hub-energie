"""Tests for hub_energie.coordinator_snapshot_access."""

from __future__ import annotations

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

sa = importlib.import_module("hub_energie.coordinator_snapshot_access")


def test_snapshot_get_numeric_rejects_non_finite() -> None:
    data = {"a": 1.0, "b": float("nan"), "c": "x"}
    assert sa.snapshot_get_numeric_value(data, "a") == 1.0
    assert sa.snapshot_get_numeric_value(data, "b") is None
    assert sa.snapshot_get_numeric_value(data, "c") is None
    assert sa.snapshot_get_numeric_value(None, "a") is None


def test_snapshot_get_nested_numeric() -> None:
    data = {"section": {"x": 2.5}}
    assert sa.snapshot_get_nested_numeric_value(data, "section", "x") == 2.5
    assert sa.snapshot_get_nested_numeric_value(data, "section", "missing") is None
    assert sa.snapshot_get_nested_numeric_value(data, "nope", "x") is None


def test_snapshot_get_str_and_list() -> None:
    assert sa.snapshot_get_str({"k": "v"}, "k") == "v"
    assert sa.snapshot_get_str({"k": None}, "k") is None
    assert sa.snapshot_get_list({"k": [1, 2]}, "k") == [1, 2]
    assert sa.snapshot_get_list({"k": "notlist"}, "k") == []
