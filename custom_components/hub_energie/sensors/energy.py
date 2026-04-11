"""SSOT totals, today kWh, per-slot / maison, usage flows, origin sensors."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy

from ..const.core import LOGIC_VERSION
from ..const.energy_data import (
    ATTR_DIRECT_MAISON,
    ATTR_VIA_BATTERIE,
    DATA_BATT_CHARGE_METER_KWH,
    DATA_DAY,
    DATA_ENERGY_BATT_CHARGE_TODAY_KWH,
    DATA_ENERGY_BATT_CHARGE_TOTAL_KWH,
    DATA_ENERGY_BATT_DISCHARGE_TODAY_KWH,
    DATA_ENERGY_BATT_DISCHARGE_TOTAL_KWH,
    DATA_ENERGY_EXPORT_TODAY_KWH,
    DATA_ENERGY_EXPORT_TOTAL_KWH,
    DATA_ENERGY_GRID_TODAY_KWH,
    DATA_ENERGY_GRID_TOTAL_KWH,
    DATA_ENERGY_HOME_TODAY_KWH,
    DATA_ENERGY_SOLAR_TODAY_KWH,
    DATA_ENERGY_SOLAR_TOTAL_KWH,
    DATA_LOGIC_VERSION,
    DATA_ORIGIN_GRID,
    DATA_ORIGIN_GRID_ATTRS,
    DATA_ORIGIN_SOLAR,
    DATA_ORIGIN_SOLAR_ATTRS,
    DATA_USAGE_BATT_CHARGE_METHOD,
    DATA_USAGE_BATT_HOME,
    DATA_USAGE_GRID_BATT_CHARGE,
    DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_GRID_DIRECT,
    DATA_USAGE_SOLAR_BATT_CHARGE,
    DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_SOLAR_DIRECT,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import (
    _device_energy_balance,
    _device_for_slot_source,
    _device_for_ssot_today_kind,
    _device_for_usage_flow_key,
    _device_grid_config,
    _device_solar_config,
)
from ..time.paris_time import ParisTime
from .base import (
    HubEnergieSensor,
    _energy_source_label_fr,
    _input_status_blocks_cost_and_grid,
    _input_status_sensor_attributes,
    _slot_label_fr,
)

_ORIGIN_LABELS: dict[str, str] = {
    "grid": "Énergie réseau",
    "solar": "Énergie solaire",
}

_USAGE_FLOW_LABELS: dict[str, str] = {
    "grid_direct": "Réseau → maison",
    "grid_batt_charge": "Réseau → batterie",
    "solar_direct": "Solaire → maison",
    "solar_batt_charge": "Solaire → batterie",
    "batt_home": "Batterie → maison",
}

_SSOT_TOTAL_CONFIG: dict[str, dict[str, str]] = {
    "grid": {"snapshot_key": DATA_ENERGY_GRID_TOTAL_KWH, "name": "Énergie réseau (total)"},
    "solar": {"snapshot_key": DATA_ENERGY_SOLAR_TOTAL_KWH, "name": "Énergie solaire (total)"},
    "export": {"snapshot_key": DATA_ENERGY_EXPORT_TOTAL_KWH, "name": "Énergie export (total)"},
    "battery_charge": {
        "snapshot_key": DATA_ENERGY_BATT_CHARGE_TOTAL_KWH,
        "name": "Énergie charge batterie (total)",
    },
    "battery_discharge": {
        "snapshot_key": DATA_ENERGY_BATT_DISCHARGE_TOTAL_KWH,
        "name": "Énergie décharge batterie (total)",
    },
}

_TODAY_ENERGY_CONFIG: dict[str, dict[str, str]] = {
    "home": {"snapshot_key": DATA_ENERGY_HOME_TODAY_KWH, "name": "Énergie maison (aujourd'hui)"},
    "grid": {"snapshot_key": DATA_ENERGY_GRID_TODAY_KWH, "name": "Énergie réseau (aujourd'hui)"},
    "solar": {"snapshot_key": DATA_ENERGY_SOLAR_TODAY_KWH, "name": "Énergie solaire (aujourd'hui)"},
    "export": {"snapshot_key": DATA_ENERGY_EXPORT_TODAY_KWH, "name": "Énergie export (aujourd'hui)"},
    "battery_charge": {
        "snapshot_key": DATA_ENERGY_BATT_CHARGE_TODAY_KWH,
        "name": "Énergie charge batterie (aujourd'hui)",
    },
    "battery_discharge": {
        "snapshot_key": DATA_ENERGY_BATT_DISCHARGE_TODAY_KWH,
        "name": "Énergie décharge batterie (aujourd'hui)",
    },
}


class HubEnergieSsotTotalSensor(HubEnergieSensor):
    """Integration-owned SSOT total_increasing sensor."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
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
        cfg = _SSOT_TOTAL_CONFIG[kind]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_ssot_{kind}_total_kwh"
        self._attr_name = cfg["name"]
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_device_info = _device_for_ssot_today_kind(coordinator, kind)

    @property
    def native_value(self) -> float | None:
        if self._snapshot_key == DATA_ENERGY_GRID_TOTAL_KWH:
            if _input_status_blocks_cost_and_grid(self._data()):
                return None
        return self._get_value(self._snapshot_key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if self._snapshot_key == DATA_ENERGY_GRID_TOTAL_KWH:
            return _input_status_sensor_attributes(self._data())
        return {}


class HubEnergieTodayEnergySensor(HubEnergieSensor):
    """Convenience today kWh sensor (derived, non-SSOT)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
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
        self._kind = kind
        cfg = _TODAY_ENERGY_CONFIG[kind]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_{kind}_today_kwh"
        self._attr_name = cfg["name"]
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_device_info = _device_for_ssot_today_kind(coordinator, kind)

    @property
    def native_value(self) -> float | None:
        if self._kind in ("grid", "home") and _input_status_blocks_cost_and_grid(self._data()):
            return None
        return self._get_value(self._snapshot_key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if self._kind in ("grid", "home"):
            return _input_status_sensor_attributes(self._data())
        return {}


class HubEnergieSlotSensor(HubEnergieSensor):
    """Per-slot kWh for one source (grid / solar / batt_discharge / batt_charge)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        source: str,
        slot: str,
        *,
        enabled_default: bool,
    ) -> None:
        super().__init__(coordinator)
        self._source = source
        self._slot = slot
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_unique_id = f"{entry.unique_id}_{source}_{slot}_kwh"
        self._attr_name = (
            f"{_energy_source_label_fr(source)} {_slot_label_fr(slot)}"
        )
        self._attr_device_info = _device_for_slot_source(coordinator, source)

    @property
    def native_value(self) -> float | None:
        value = self._get_nested_value(self._source, self._slot)
        return round(value, 3) if value is not None else None

    @property
    def last_reset(self) -> datetime | None:
        """Midnight (Europe/Paris) for the snapshot day — daily slot totals reset there."""
        data = self.coordinator.data or {}
        day = data.get(DATA_DAY)
        if not day or not isinstance(day, str):
            return None
        try:
            return ParisTime.day_start_utc(day)
        except ValueError:
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        return {DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION)}


class HubEnergieMaisonSensor(HubEnergieSensor):
    """House consumption per slot (grid + solar + battery discharge)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        slot: str,
        *,
        enabled_default: bool,
    ) -> None:
        super().__init__(coordinator)
        self._slot = slot
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_unique_id = f"{entry.unique_id}_maison_{slot}_kwh"
        self._attr_name = f"Maison {_slot_label_fr(slot)}"
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        value = self._get_nested_value("maison", self._slot)
        return round(value, 3) if value is not None else None

    @property
    def last_reset(self) -> datetime | None:
        data = self.coordinator.data or {}
        day = data.get(DATA_DAY)
        if not day or not isinstance(day, str):
            return None
        try:
            return ParisTime.day_start_utc(day)
        except ValueError:
            return None


_USAGE_KEYS = {
    "grid_direct": DATA_USAGE_GRID_DIRECT,
    "grid_batt_charge": DATA_USAGE_GRID_BATT_CHARGE,
    "solar_direct": DATA_USAGE_SOLAR_DIRECT,
    "solar_batt_charge": DATA_USAGE_SOLAR_BATT_CHARGE,
    "batt_home": DATA_USAGE_BATT_HOME,
}


class HubEnergieUsageSensor(HubEnergieSensor):
    """One usage flow (kWh)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        key: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = _USAGE_KEYS[key]
        self._attr_unique_id = f"{entry.unique_id}_usage_{key}_kwh"
        self._attr_name = _USAGE_FLOW_LABELS.get(
            key, key.replace("_", " ").title(),
        )
        self._attr_device_info = _device_for_usage_flow_key(coordinator, key)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        attrs: dict[str, Any] = {
            DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION),
        }
        if self._key in (DATA_USAGE_GRID_BATT_CHARGE, DATA_USAGE_SOLAR_BATT_CHARGE):
            attrs[DATA_USAGE_BATT_CHARGE_METHOD] = data.get(DATA_USAGE_BATT_CHARGE_METHOD)
            attrs[DATA_BATT_CHARGE_METER_KWH] = data.get(DATA_BATT_CHARGE_METER_KWH)
            if self._key == DATA_USAGE_GRID_BATT_CHARGE:
                gslot = data.get(DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH)
                if isinstance(gslot, dict):
                    attrs["by_slot_kwh"] = gslot
            else:
                sslot = data.get(DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH)
                if isinstance(sslot, dict):
                    attrs["by_slot_kwh"] = sslot
        return attrs


class HubEnergieOriginSensor(HubEnergieSensor):
    """Origin grid or solar (kWh) with sub-attrs."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
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
        self._attr_unique_id = f"{entry.unique_id}_origin_{kind}_kwh"
        self._attr_name = _ORIGIN_LABELS.get(kind, kind.title())
        self._attr_device_info = (
            _device_grid_config(coordinator)
            if kind == "grid"
            else _device_solar_config(coordinator)
        )

    @property
    def native_value(self) -> float | None:
        return self._get_value(DATA_ORIGIN_GRID if self._kind == "grid" else DATA_ORIGIN_SOLAR)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        sub = data.get(DATA_ORIGIN_GRID_ATTRS if self._kind == "grid" else DATA_ORIGIN_SOLAR_ATTRS, {})
        return {
            ATTR_DIRECT_MAISON: sub.get(ATTR_DIRECT_MAISON, 0.0),
            ATTR_VIA_BATTERIE: sub.get(ATTR_VIA_BATTERIE, 0.0),
            DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION),
        }
