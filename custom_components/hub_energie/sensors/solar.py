"""Solar estimation and export revenue sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CURRENCY_EURO, UnitOfEnergy, UnitOfPower

from ..const.energy_data import (
    DATA_SOLAR_ESTIMATE_DAILY_KWH,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_SOLAR_ESTIMATE_YEARLY_KWH,
    DATA_SOLAR_EXPORT_REVENUE_EUR,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_solar_config
from .base import HubEnergieSensor

_SOLAR_ESTIMATE_LABELS: dict[str, str] = {
    "current_power_estimate": "Puissance estimée",
    "daily_energy_estimate": "Énergie estimée (jour)",
    "yearly_energy_estimate": "Énergie estimée (an)",
}

_SOLAR_ESTIMATE_CONFIG: dict[str, dict[str, Any]] = {
    "current_power_estimate": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_SOLAR_ESTIMATE_POWER_W,
        "icon": "mdi:solar-power",
    },
    "daily_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_SOLAR_ESTIMATE_DAILY_KWH,
        "icon": "mdi:solar-power-variant",
    },
    "yearly_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_SOLAR_ESTIMATE_YEARLY_KWH,
        "icon": "mdi:solar-power-variant-outline",
    },
}


class HubEnergieSolarEstimateSensor(HubEnergieSensor):
    """Clear-sky solar PV estimation sensor."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        metric: str,
    ) -> None:
        super().__init__(coordinator)
        cfg = _SOLAR_ESTIMATE_CONFIG[metric]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_solar_estimate_{metric}"
        self._attr_name = _SOLAR_ESTIMATE_LABELS.get(
            metric, metric.replace("_", " ").title(),
        )
        self._attr_device_class = cfg["device_class"]
        self._attr_native_unit_of_measurement = cfg["unit"]
        self._attr_state_class = cfg["state_class"]
        self._attr_icon = cfg.get("icon")
        self._attr_device_info = _device_solar_config(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)


class HubEnergieSolarRevenueSensor(HubEnergieSensor):
    """Solar export revenue (€) when a resale contract is configured."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False
    _attr_icon = "mdi:cash-plus"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_solar_export_revenue"
        self._attr_name = "Revenus d'injection"
        self._attr_device_info = _device_solar_config(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(DATA_SOLAR_EXPORT_REVENUE_EUR)
