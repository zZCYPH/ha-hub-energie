"""Tests for hub_energie.coordinator_edf_slot_sensor."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


class _NeverStates:
    @staticmethod
    def get(_eid: str) -> None:
        raise AssertionError("states.get should not run without sensor entity")


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

slot_mod = importlib.import_module("hub_energie.coordinator.edf_slot_sensor")


def test_apply_current_slot_no_sensor_skips_hass_lookup() -> None:
    hass = SimpleNamespace(states=_NeverStates())
    edf = SimpleNamespace(current_slot="unchanged")
    with patch.object(slot_mod, "parse_slot_from_sensor_state", return_value="parsed") as parse_mock:
        slot_mod.apply_current_slot_from_sensor(hass, {}, edf)
    parse_mock.assert_called_once_with(None)
    assert edf.current_slot == "parsed"


def test_apply_current_slot_reads_state_and_sets_edf() -> None:
    st = SimpleNamespace(state="Bleu HC")
    hass = SimpleNamespace(states=SimpleNamespace(get=lambda eid: st if eid == "sensor.slot" else None))
    edf = SimpleNamespace(current_slot=None)
    entry_data = {"current_slot_sensor": "sensor.slot"}
    with patch.object(slot_mod, "parse_slot_from_sensor_state", return_value="bleu_hc") as parse_mock:
        slot_mod.apply_current_slot_from_sensor(hass, entry_data, edf)
    parse_mock.assert_called_once_with("Bleu HC")
    assert edf.current_slot == "bleu_hc"
