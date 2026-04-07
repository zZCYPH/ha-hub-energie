"""Home Assistant state_changed listener factory (delegates to coordinator).

Energy meter entities:
- ``unknown`` / ``unavailable`` / empty state: no delta is applied (avoids bogus
  consumption while a device is offline).
- When the entity returns to a numeric value, the next change is processed with
  the usual delta rules (negative deltas discarded unless a plausible meter reset).

Power/auxiliary entities: trigger a lightweight snapshot refresh only.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback

from ..const import (
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_CURRENT_SLOT_SENSOR,
    SOURCE_GRID,
    SOURCE_GRID_EXPORT,
    SYNTHETIC_ENTITY_GRID_EXPORT_SUM,
    SYNTHETIC_ENTITY_GRID_IMPORT_SUM,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_SENSOR,
)


def create_state_changed_handler(co: Any):
    """Return async-compatible @callback matching legacy coordinator listener behavior."""

    @callback
    def _async_on_state_changed(event: Event[EventStateChangedData]) -> None:
        hass: HomeAssistant = co.hass
        entity_id = event.data["entity_id"]
        sm = co.source_map()

        if (
            co.is_edf
            and co.tariff_offer == TARIFF_OFFER_TEMPO
            and co.tempo_mode == TEMPO_MODE_SENSOR
            and entity_id == co.entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        ):
            co._refresh_slot_sensor()
            hass.async_create_task(co._async_notify_all())

        power_ids: set[str] = {v for v in co.power_source_map().values() if v}
        for batt in co.battery_systems:
            for k in (CONF_BATT_POWER_IN, CONF_BATT_POWER_OUT, CONF_BATT_POWER_NET, CONF_BATT_SOC):
                v = batt.get(k)
                if v:
                    power_ids.add(v)
        if entity_id in power_ids:
            hass.async_create_task(co._async_notify_all())
            return

        imp_agg = co.tri_grid_aggregate_import_entities()
        if len(imp_agg) == 3 and entity_id in imp_agg:
            total = co._reader.sum_energy_kwh(imp_agg)
            if total is not None:
                hass.async_create_task(
                    co._async_apply_delta(SYNTHETIC_ENTITY_GRID_IMPORT_SUM, SOURCE_GRID, total)
                )
            return

        exp_agg = co.tri_grid_aggregate_export_entities()
        if len(exp_agg) == 3 and entity_id in exp_agg:
            total = co._reader.sum_energy_kwh(exp_agg)
            if total is not None:
                hass.async_create_task(
                    co._async_apply_delta(SYNTHETIC_ENTITY_GRID_EXPORT_SUM, SOURCE_GRID_EXPORT, total)
                )
            return

        if entity_id not in (v for v in sm.values() if v):
            return
        new = event.data.get("new_state")
        if new is None or new.state in ("unknown", "unavailable", ""):
            return
        new_val = co._reader.state_to_kwh(new)
        if new_val is None:
            return
        source_key = next(k for k, v in sm.items() if v == entity_id)
        hass.async_create_task(co._async_apply_delta(entity_id, source_key, new_val))

    return _async_on_state_changed
