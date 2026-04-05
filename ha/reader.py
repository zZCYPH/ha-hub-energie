"""Home Assistant entity state reads and numeric parsing (no business rules)."""

from __future__ import annotations

import math
from typing import Callable, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State

from ..const import (
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_SOLAR_POWER_SENSOR,
)

__all__ = ("HAReader",)


class HAReader:
    """Reads and normalizes entity states; injectable into coordinator and persistence."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        *,
        normalize_kwh: Callable[[float], float],
    ) -> None:
        self._hass = hass
        self._entry = entry
        self._normalize_kwh = normalize_kwh

    def read_power_w(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        st = self._hass.states.get(entity_id)
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        try:
            value = float(st.state)
        except (TypeError, ValueError):
            return None
        uom = str(st.attributes.get("unit_of_measurement", "W")).lower()
        if uom in ("kw", "kilowatt", "kilowatts"):
            return value * 1000.0
        return value

    def read_energy_kwh(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        st = self._hass.states.get(entity_id)
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        try:
            value = float(st.state)
        except (TypeError, ValueError):
            return None
        uom = str(st.attributes.get("unit_of_measurement", "kWh")).lower()
        if uom in ("wh", "watt_hour", "watt_hours"):
            return value / 1000.0
        return value

    def sum_energy_kwh(self, entity_ids: list[str]) -> float | None:
        """Sum kWh from several meters; returns None if any entity is missing or unreadable."""
        if not entity_ids:
            return None
        total = 0.0
        for eid in entity_ids:
            part = self.read_energy_kwh(eid)
            if part is None:
                return None
            total += part
        return self._normalize_kwh(total)

    def read_soc_percent(self, entity_id: str | None) -> float | None:
        """Read SOC as 0–100 percent."""
        if not entity_id:
            return None
        st = self._hass.states.get(entity_id)
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        try:
            v = float(st.state)
        except (TypeError, ValueError):
            return None
        uom = str(st.attributes.get("unit_of_measurement", "")).lower().strip()
        if uom == "%" or 0.0 <= v <= 100.0:
            return max(0.0, min(100.0, v))
        if 0.0 < v <= 1.0:
            return v * 100.0
        return max(0.0, min(100.0, v))

    def read_soc_normalized(self, entity_id: str) -> float | None:
        pct = self.read_soc_percent(entity_id)
        return pct / 100.0 if pct is not None else None

    def read_number(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        st = self._hass.states.get(entity_id)
        if st is None or st.state in ("unknown", "unavailable", ""):
            return None
        try:
            return float(st.state)
        except (TypeError, ValueError):
            return None

    def power_source_map(self) -> dict[str, str | None]:
        opts, data = self._entry.options, self._entry.data
        return {
            "grid_power": cast(str | None, opts.get(CONF_GRID_POWER_SENSOR, data.get(CONF_GRID_POWER_SENSOR))),
            "solar_power": (
                cast(str | None, opts.get(CONF_SOLAR_POWER_SENSOR, data.get(CONF_SOLAR_POWER_SENSOR)))
                if self._entry.data.get(CONF_HAS_SOLAR) else None
            ),
            "load_power": cast(str | None, opts.get(CONF_LOAD_POWER_SENSOR, data.get(CONF_LOAD_POWER_SENSOR))),
        }

    def read_grid_power_total_w(self) -> float | None:
        phases = self._entry.data.get(CONF_GRID_POWER_PHASES, [])
        if isinstance(phases, list) and phases:
            total = 0.0
            any_valid = False
            for phase in phases:
                if isinstance(phase, dict):
                    val = self.read_power_w(phase.get("entity_id"))
                    if val is not None:
                        total += val
                        any_valid = True
            if any_valid:
                return total
        return self.read_power_w(self.power_source_map().get("grid_power"))

    def state_to_kwh(self, state: State) -> float | None:
        try:
            raw = float(state.state)
        except (TypeError, ValueError):
            return None
        uom = str(state.attributes.get("unit_of_measurement") or "kWh").lower()
        value = raw / 1000.0 if uom in ("wh", "watt_hour", "watt_hours") else raw
        if not math.isfinite(value) or value < 0:
            return None
        return self._normalize_kwh(value)
