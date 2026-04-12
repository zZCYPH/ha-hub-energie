"""Tests for hub_energie.coordinator_entity_map."""

from __future__ import annotations

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

const = importlib.import_module("hub_energie.const")
em = importlib.import_module("hub_energie.coordinator_entity_map")


def test_build_source_map_mono_with_battery_keys() -> None:
    data = {
        const.CONF_PHASE_TYPE: "mono",
        const.CONF_GRID_IMPORT_ENERGY: "sensor.gi",
        const.CONF_GRID_EXPORT_ENERGY: "sensor.ge",
        const.CONF_HAS_SOLAR: True,
        const.CONF_SOLAR_ENERGY: "sensor.sol",
        const.CONF_BATTERY_SYSTEMS: [
            {"id": "b1", const.CONF_BATT_ENERGY_IN: "sensor.bin", const.CONF_BATT_ENERGY_OUT: "sensor.bout"},
        ],
    }
    m = em.build_source_map(data, battery_systems=data[const.CONF_BATTERY_SYSTEMS], has_solar=True)
    assert m[const.SOURCE_GRID] == "sensor.gi"
    assert m[const.SOURCE_SOLAR] == "sensor.sol"
    assert m[const.SOURCE_GRID_EXPORT] == "sensor.ge"
    assert m["batt_charge:b1"] == "sensor.bin"
    assert m["batt_discharge:b1"] == "sensor.bout"


def test_build_source_map_tri_synthetic_when_three_phases() -> None:
    phases_imp = [
        {"phase": 1, "entity_id": "e1"},
        {"phase": 2, "entity_id": "e2"},
        {"phase": 3, "entity_id": "e3"},
    ]
    phases_exp = [
        {"phase": 1, "entity_id": "x1"},
        {"phase": 2, "entity_id": "x2"},
        {"phase": 3, "entity_id": "x3"},
    ]
    data = {
        const.CONF_PHASE_TYPE: const.PHASE_TRI,
        const.CONF_GRID_TRI_ENERGY_MODE: const.TRI_GRID_ENERGY_PER_PHASE,
        const.CONF_GRID_IMPORT_ENERGY_PHASES: phases_imp,
        const.CONF_GRID_EXPORT_ENERGY_PHASES: phases_exp,
        const.CONF_HAS_SOLAR: False,
    }
    m = em.build_source_map(data, battery_systems=[], has_solar=False)
    assert m[const.SOURCE_GRID] == const.SYNTHETIC_ENTITY_GRID_IMPORT_SUM
    assert m[const.SOURCE_GRID_EXPORT] == const.SYNTHETIC_ENTITY_GRID_EXPORT_SUM
    assert m[const.SOURCE_SOLAR] is None


def test_build_source_map_tri_no_synthetic_if_incomplete_phases() -> None:
    data = {
        const.CONF_PHASE_TYPE: const.PHASE_TRI,
        const.CONF_GRID_TRI_ENERGY_MODE: const.TRI_GRID_ENERGY_PER_PHASE,
        const.CONF_GRID_IMPORT_ENERGY_PHASES: [{"phase": 1, "entity_id": "e1"}],
        const.CONF_GRID_EXPORT_ENERGY: "sensor.ge",
        const.CONF_GRID_IMPORT_ENERGY: "sensor.gi",
    }
    m = em.build_source_map(data, battery_systems=[], has_solar=False)
    assert m[const.SOURCE_GRID] is None
    # Tri per-phase mode overwrites export with synthetic-or-None (ignores flat CONF_GRID_EXPORT_ENERGY).
    assert m[const.SOURCE_GRID_EXPORT] is None


def test_build_power_source_map_option_overrides_data() -> None:
    data = {const.CONF_GRID_POWER_SENSOR: "sensor.g0", const.CONF_SOLAR_POWER_SENSOR: "sensor.s0"}
    opts = {const.CONF_GRID_POWER_SENSOR: "sensor.g1", const.CONF_SOLAR_POWER_SENSOR: "sensor.s1"}
    m = em.build_power_source_map(opts, data, has_solar=True)
    assert m["grid_power"] == "sensor.g1"
    assert m["solar_power"] == "sensor.s1"
    assert m["load_power"] is None


def test_read_energy_kwh_synthetic_import_sum() -> None:
    reader = MagicMock()
    reader.sum_energy_kwh.return_value = 33.3
    data = {
        const.CONF_GRID_IMPORT_ENERGY_PHASES: [
            {"phase": 1, "entity_id": "e1"},
            {"phase": 2, "entity_id": "e2"},
            {"phase": 3, "entity_id": "e3"},
        ],
    }
    v = em.read_energy_kwh_for_persistence(const.SYNTHETIC_ENTITY_GRID_IMPORT_SUM, data, reader)
    assert v == 33.3
    reader.sum_energy_kwh.assert_called_once()


def test_read_energy_kwh_synthetic_export_sum_incomplete_phases() -> None:
    reader = MagicMock()
    data = {const.CONF_GRID_EXPORT_ENERGY_PHASES: [{"phase": 1, "entity_id": "x1"}]}
    assert em.read_energy_kwh_for_persistence(const.SYNTHETIC_ENTITY_GRID_EXPORT_SUM, data, reader) is None
    reader.sum_energy_kwh.assert_not_called()


def test_read_energy_kwh_none_entity() -> None:
    reader = MagicMock()
    assert em.read_energy_kwh_for_persistence(None, {}, reader) is None
    reader.read_energy_kwh.assert_not_called()


def test_build_source_map_battery_without_id_uses_empty_string_key() -> None:
    data = {
        const.CONF_PHASE_TYPE: "mono",
        const.CONF_GRID_IMPORT_ENERGY: "g",
        const.CONF_GRID_EXPORT_ENERGY: None,
    }
    batt = [{const.CONF_BATT_ENERGY_IN: "in0", const.CONF_BATT_ENERGY_OUT: "out0"}]
    m = em.build_source_map(data, battery_systems=batt, has_solar=False)
    assert "batt_charge:" in m
    assert m["batt_charge:"] == "in0"


def test_tri_grid_aggregate_lists_only_in_tri_per_phase_mode() -> None:
    phases = [
        {"phase": 1, "entity_id": "e1"},
        {"phase": 2, "entity_id": "e2"},
        {"phase": 3, "entity_id": "e3"},
    ]
    data_tri = {
        const.CONF_PHASE_TYPE: const.PHASE_TRI,
        const.CONF_GRID_TRI_ENERGY_MODE: const.TRI_GRID_ENERGY_PER_PHASE,
        const.CONF_GRID_IMPORT_ENERGY_PHASES: phases,
    }
    assert em.tri_grid_aggregate_import_entities(data_tri, phase_type="mono") == []
    assert em.tri_grid_aggregate_import_entities(data_tri, phase_type=const.PHASE_TRI) == ["e1", "e2", "e3"]
