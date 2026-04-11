"""Per-battery and aggregated battery summary sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy, UnitOfPower

from ..const.energy_data import (
    DATA_BATTERY_AVAILABLE_ENERGY_KWH,
    DATA_BATTERY_CHARGE_KWH,
    DATA_BATTERY_DISCHARGE_KWH,
    DATA_BATTERY_EFFICIENCY,
    DATA_BATTERY_POWER_NET,
    DATA_BATTERY_SOC,
    DATA_BATTERY_STORED_ENERGY_KWH,
    DATA_BATTERY_TOTAL_CHARGE_KWH,
    DATA_BATTERY_TOTAL_DISCHARGE_KWH,
    DATA_BATTERY_TOTAL_NET_POWER_W,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_battery, _device_battery_summary
from .base import HubEnergieSensor, _safe_float

_BATTERY_ENTITY_LABELS: dict[str, str] = {
    "charge_energy": "Énergie de charge",
    "discharge_energy": "Énergie de décharge",
    "power_net": "Puissance nette",
    "soc": "État de charge",
    "stored_energy": "Énergie stockée",
    "available_energy": "Énergie disponible",
}

_BATTERY_SUMMARY_LABELS: dict[str, str] = {
    "total_charge_energy": "Énergie de charge (total)",
    "total_discharge_energy": "Énergie de décharge (total)",
    "total_net_power": "Puissance nette (total)",
}

_BATTERY_METRIC_CONFIG: dict[str, dict[str, Any]] = {
    "charge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_CHARGE_KWH,
        "icon": "mdi:battery-charging",
    },
    "discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_DISCHARGE_KWH,
        "icon": "mdi:battery-arrow-down",
    },
    "power_net": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_POWER_NET,
        "icon": "mdi:flash",
    },
    "soc": {
        "device_class": SensorDeviceClass.BATTERY,
        "unit": "%",
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_SOC,
        "icon": "mdi:battery",
    },
    "stored_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_STORED_ENERGY_KWH,
        "icon": "mdi:battery-heart-variant",
    },
    "available_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_AVAILABLE_ENERGY_KWH,
        "icon": "mdi:battery-check",
    },
}


class HubEnergieBatterySensor(HubEnergieSensor):
    """Per-battery metric sensor."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        batt_id: str,
        batt_name: str,
        metric: str,
    ) -> None:
        super().__init__(coordinator)
        self._batt_id = batt_id
        self._metric = metric
        cfg = _BATTERY_METRIC_CONFIG[metric]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_battery_{batt_id}_{metric}"
        self._attr_name = _BATTERY_ENTITY_LABELS.get(
            metric, metric.replace("_", " ").title()
        )
        self._attr_device_class = cfg["device_class"]
        self._attr_native_unit_of_measurement = cfg["unit"]
        self._attr_state_class = cfg["state_class"]
        self._attr_icon = cfg.get("icon")
        self._attr_device_info = _device_battery(coordinator, batt_id, batt_name)

    def _find_battery_snapshot(self) -> dict[str, Any] | None:
        for batt in self.coordinator.get_battery_systems_data():
            if batt.get("id") == self._batt_id:
                return batt
        return None

    @property
    def native_value(self) -> float | None:
        snap = self._find_battery_snapshot()
        if snap is None:
            return None
        return _safe_float(snap.get(self._snapshot_key))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        snap = self._find_battery_snapshot()
        if snap is None:
            return {}
        attrs: dict[str, Any] = {"battery_id": self._batt_id}
        eff = snap.get(DATA_BATTERY_EFFICIENCY)
        if eff is not None:
            attrs[DATA_BATTERY_EFFICIENCY] = eff
        return attrs


_BATTERY_SUMMARY_CONFIG: dict[str, dict[str, Any]] = {
    "total_charge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_TOTAL_CHARGE_KWH,
        "icon": "mdi:battery-charging",
    },
    "total_discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_TOTAL_DISCHARGE_KWH,
        "icon": "mdi:battery-arrow-down",
    },
    "total_net_power": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_TOTAL_NET_POWER_W,
        "icon": "mdi:flash",
    },
}


class HubEnergieBatterySummarySensor(HubEnergieSensor):
    """Aggregated battery metric across all battery systems."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        metric: str,
    ) -> None:
        super().__init__(coordinator)
        cfg = _BATTERY_SUMMARY_CONFIG[metric]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_battery_summary_{metric}"
        self._attr_name = _BATTERY_SUMMARY_LABELS.get(
            metric, metric.replace("_", " ").title()
        )
        self._attr_device_class = cfg["device_class"]
        self._attr_native_unit_of_measurement = cfg["unit"]
        self._attr_state_class = cfg["state_class"]
        self._attr_icon = cfg.get("icon")
        self._attr_device_info = _device_battery_summary(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        count = len(self.coordinator.get_battery_systems_data())
        return {"battery_count": count}
