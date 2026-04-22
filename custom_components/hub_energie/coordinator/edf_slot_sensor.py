"""Apply current tariff slot from optional HA state (Tempo sensor mode)."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ..const.tariff_edf import CONF_CURRENT_SLOT_SENSOR
from ..providers.edf import parse_slot_from_sensor_state


def apply_current_slot_from_sensor(hass: Any, entry_data: Mapping[str, Any], edf: Any) -> None:
    eid = entry_data.get(CONF_CURRENT_SLOT_SENSOR)
    st = hass.states.get(eid) if eid else None
    edf.current_slot = parse_slot_from_sensor_state(st.state if st else None)
