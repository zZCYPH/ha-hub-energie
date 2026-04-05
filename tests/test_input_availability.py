"""Tests for utils/input_availability.py."""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any
from unittest.mock import MagicMock

import pytest

from hub_energie.const import (
    CONF_BATTERY_SYSTEMS,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    CONF_SUPPLIER,
    INPUT_REASON_MISSING_ENTITIES,
    INPUT_REASON_NO_GRID_IMPORT_READABLE,
    INPUT_REASON_TRUST_INCONSISTENT,
    INPUT_STATUS_DEGRADED,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    INPUT_STATUS_OK,
    PHASE_MONO,
    SUPPLIER_EDF,
)
from hub_energie.ha.reader import HAReader
from hub_energie.utils.energy import normalize_kwh
from hub_energie.utils.input_availability import (
    classify_presence,
    compute_input_probe,
    derive_input_status,
    grid_import_kwh_readable,
)


def _hass_with_states(entity_states: dict[str, tuple[str, str]]) -> Any:
    """state string, uom for energy sensors."""

    def _get(eid: str) -> Any:
        if eid not in entity_states:
            return None
        st, uom = entity_states[eid]
        return SimpleNamespace(state=st, attributes={"unit_of_measurement": uom})

    hass = MagicMock()
    hass.states.get.side_effect = _get
    return hass


def test_classify_presence() -> None:
    hass = _hass_with_states({})
    assert classify_presence(hass, "sensor.m") == "missing"
    hass2 = _hass_with_states({"sensor.x": ("unknown", "kWh")})
    assert classify_presence(hass2, "sensor.x") == "unavailable"
    hass3 = _hass_with_states({"sensor.x": ("1.0", "kWh")})
    assert classify_presence(hass3, "sensor.x") == "ok"


def test_grid_import_readable_mono() -> None:
    entry = MagicMock()
    entry.data = {
        CONF_PHASE_TYPE: PHASE_MONO,
        CONF_GRID_IMPORT_ENERGY: "sensor.grid",
        CONF_HAS_SOLAR: False,
        CONF_HAS_BATTERIES: False,
        CONF_SUPPLIER: SUPPLIER_EDF,
    }
    entry.options = {}
    hass = _hass_with_states({"sensor.grid": ("10.5", "kWh")})
    reader = HAReader(hass, entry, normalize_kwh=normalize_kwh)
    assert grid_import_kwh_readable(reader, entry) is True


def test_compute_input_probe_missing() -> None:
    entry = MagicMock()
    entry.data = {
        CONF_PHASE_TYPE: PHASE_MONO,
        CONF_GRID_IMPORT_ENERGY: "sensor.grid",
        CONF_HAS_SOLAR: False,
        CONF_HAS_BATTERIES: False,
        CONF_SUPPLIER: SUPPLIER_EDF,
        CONF_GRID_POWER_SENSOR: None,
        CONF_LOAD_POWER_SENSOR: None,
        CONF_GRID_POWER_PHASES: [],
        CONF_BATTERY_SYSTEMS: [],
    }
    entry.options = {}
    hass = _hass_with_states({})
    reader = HAReader(hass, entry, normalize_kwh=normalize_kwh)
    probe = compute_input_probe(hass, entry, reader)
    assert "sensor.grid" in probe.missing_entity_ids
    assert probe.grid_import_readable is False


def test_derive_input_status_no_input() -> None:
    from hub_energie.utils.input_availability import InputProbeResult

    probe = InputProbeResult(
        missing_entity_ids=["sensor.grid"],
        unavailable_entity_ids=[],
        grid_import_readable=False,
    )
    st, reasons = derive_input_status(probe, trust_level="ok", data_quality="good")
    assert st == INPUT_STATUS_NO_INPUT
    assert INPUT_REASON_NO_GRID_IMPORT_READABLE in reasons
    assert INPUT_REASON_MISSING_ENTITIES in reasons


def test_derive_input_status_ok() -> None:
    from hub_energie.utils.input_availability import InputProbeResult

    probe = InputProbeResult(
        missing_entity_ids=[],
        unavailable_entity_ids=[],
        grid_import_readable=True,
    )
    st, reasons = derive_input_status(probe, trust_level="ok", data_quality="good")
    assert st == INPUT_STATUS_OK
    assert reasons == []


def test_derive_input_status_error_trust_inconsistent() -> None:
    from hub_energie.utils.input_availability import InputProbeResult

    probe = InputProbeResult(
        missing_entity_ids=[],
        unavailable_entity_ids=[],
        grid_import_readable=True,
    )
    st, reasons = derive_input_status(probe, trust_level="inconsistent", data_quality="good")
    assert st == INPUT_STATUS_ERROR
    assert INPUT_REASON_TRUST_INCONSISTENT in reasons


def test_derive_input_status_degraded_optional_missing() -> None:
    from hub_energie.utils.input_availability import InputProbeResult

    probe = InputProbeResult(
        missing_entity_ids=["sensor.solar"],
        unavailable_entity_ids=[],
        grid_import_readable=True,
    )
    st, reasons = derive_input_status(probe, trust_level="ok", data_quality="good")
    assert st == INPUT_STATUS_DEGRADED
    assert INPUT_REASON_MISSING_ENTITIES in reasons
