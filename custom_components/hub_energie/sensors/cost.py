"""Cost detail and savings sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CURRENCY_EURO

from ..card_payload import build_cost_detail_monetary_attributes
from ..const import DATA_ECO_BATT, DATA_ECO_SOLAR
from ..coordinator import HubEnergieCoordinator
from ..entity_id_stability import apply_stable_suggested_object_id
from ..device_info import _device_battery_summary, _device_cost, _device_solar_config
from .base import (
    HubEnergieSensor,
    _input_status_blocks_cost_and_grid,
    _input_status_sensor_attributes,
)

_SAVINGS_LABELS: dict[str, str] = {
    "solar": "Économies solaire",
    "battery": "Économies batterie",
}


class HubEnergieCostDetailSensor(HubEnergieSensor):
    """Daily cost (€) — monetary attributes; Lovelace live payload is on ``sensor.*_lovelace_card``."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_cost_detail"
        apply_stable_suggested_object_id(self)
        self._attr_name = "Coût du jour"
        self._attr_device_info = _device_cost(coordinator)

    @property
    def native_value(self) -> float | None:
        return self.coordinator.get_cost_total()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return build_cost_detail_monetary_attributes(self.hass, self.coordinator)


class HubEnergieSavingsSensor(HubEnergieSensor):
    """Daily savings in € (solar or battery)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        kind: str,
    ) -> None:
        super().__init__(coordinator)
        self._kind = kind
        self._attr_unique_id = f"{entry.unique_id}_savings_{kind}_eur"
        apply_stable_suggested_object_id(self)
        self._attr_name = _SAVINGS_LABELS.get(kind, kind.title())
        self._attr_device_info = (
            _device_solar_config(coordinator)
            if kind == "solar"
            else _device_battery_summary(coordinator)
        )

    @property
    def native_value(self) -> float | None:
        if _input_status_blocks_cost_and_grid(self._data()):
            return None
        if self._kind == "solar":
            return self._get_value(DATA_ECO_SOLAR)
        return self._get_value(DATA_ECO_BATT)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return _input_status_sensor_attributes(self._data())
