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

sa = importlib.import_module("hub_energie.coordinator.snapshot_access")


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


def test_coordinator_snapshot_data_empty_vs_payload() -> None:
    assert sa.coordinator_snapshot_data({}) is None
    payload = {"day": "2026-01-01"}
    assert sa.coordinator_snapshot_data(payload) == payload


def test_coordinator_public_numeric_and_slot_helpers() -> None:
    ed = importlib.import_module("hub_energie.const.energy_data")
    data = {
        ed.DATA_GRID_POWER_SIGNED_W: 1200.0,
        ed.DATA_SOLAR_POWER_W: 800.0,
        ed.DATA_LOAD_POWER_W: 2000.0,
        ed.DATA_COST_TOTAL: 3.5,
        ed.DATA_CURRENT_SLOT: "bleu_hc",
        ed.DATA_TODAY_COLOR: "bleu",
        ed.DATA_TOMORROW_COLOR: "blanc",
        ed.DATA_TEMPO_DAYS: {"blue": 1},
    }
    assert sa.coordinator_get_grid_power_signed_w(data) == 1200.0
    assert sa.coordinator_get_solar_power_w(data) == 800.0
    assert sa.coordinator_get_load_power_w(data) == 2000.0
    assert sa.coordinator_get_cost_total(data) == 3.5
    assert sa.coordinator_get_current_slot(data) == "bleu_hc"
    assert sa.coordinator_get_today_color(data) == "bleu"
    assert sa.coordinator_get_tomorrow_color(data) == "blanc"
    assert sa.coordinator_get_tempo_days(data) == {"blue": 1}


def test_coordinator_get_battery_systems_data_cast() -> None:
    ck = importlib.import_module("hub_energie.const.config_keys")
    data = {ck.CONF_BATTERY_SYSTEMS: [{"id": "b1"}]}
    rows = sa.coordinator_get_battery_systems_data(data)
    assert rows == [{"id": "b1"}]
