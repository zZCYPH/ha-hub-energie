"""Real-time power / flow sensors."""

from __future__ import annotations

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfPower

from ..const.energy_data import (
    DATA_BATTERY_DISCHARGE_POWER_W,
    DATA_BATTERY_TO_HOME_POWER_W,
    DATA_GRID_IMPORT_POWER_W,
    DATA_GRID_TO_BATTERY_POWER_W,
    DATA_GRID_TO_HOME_POWER_W,
    DATA_HOME_POWER_W,
    DATA_SOLAR_EXPORT_POWER_W,
    DATA_SOLAR_PRODUCTION_POWER_W,
    DATA_SOLAR_TO_BATTERY_POWER_W,
    DATA_SOLAR_TO_HOME_POWER_W,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_for_power_flow_kind
from .base import HubEnergieSensor

_FLOW_POWER_CONFIG: dict[str, dict[str, str]] = {
    "home": {"snapshot_key": DATA_HOME_POWER_W, "name": "Puissance maison"},
    "grid_import": {"snapshot_key": DATA_GRID_IMPORT_POWER_W, "name": "Puissance import réseau"},
    "solar_production": {"snapshot_key": DATA_SOLAR_PRODUCTION_POWER_W, "name": "Puissance production solaire"},
    "battery_discharge": {"snapshot_key": DATA_BATTERY_DISCHARGE_POWER_W, "name": "Puissance décharge batterie"},
    "solar_to_home": {"snapshot_key": DATA_SOLAR_TO_HOME_POWER_W, "name": "Puissance solaire vers maison"},
    "battery_to_home": {"snapshot_key": DATA_BATTERY_TO_HOME_POWER_W, "name": "Puissance batterie vers maison"},
    "grid_to_home": {"snapshot_key": DATA_GRID_TO_HOME_POWER_W, "name": "Puissance réseau vers maison"},
    "solar_to_battery": {"snapshot_key": DATA_SOLAR_TO_BATTERY_POWER_W, "name": "Puissance solaire vers batterie"},
    "grid_to_battery": {"snapshot_key": DATA_GRID_TO_BATTERY_POWER_W, "name": "Puissance réseau vers batterie"},
    "solar_export": {"snapshot_key": DATA_SOLAR_EXPORT_POWER_W, "name": "Puissance export solaire"},
}


class HubEnergiePowerFlowSensor(HubEnergieSensor):
    """Derived real-time power/flow sensor (measurement, non-SSOT)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        kind: str,
        *,
        enabled_default: bool = True,
    ) -> None:
        super().__init__(coordinator)
        cfg = _FLOW_POWER_CONFIG[kind]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_{kind}_power_w"
        self._attr_name = cfg["name"]
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_device_info = _device_for_power_flow_kind(coordinator, kind)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)
