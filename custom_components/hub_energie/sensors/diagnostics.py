"""Trust, export diagnostics, and configuration overview sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CURRENCY_EURO, UnitOfEnergy, UnitOfPower, UnitOfTime
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from ..const.core import LOGIC_VERSION
from ..const.energy_data import (
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_CURRENT_SLOT,
    DATA_DATA_QUALITY,
    DATA_DAY,
    DATA_DELTA_DISCARDS,
    DATA_DELTA_LAST_REJECTION,
    DATA_DELTA_TELEMETRY,
    DATA_GRID_POWER_SIGNED_W,
    DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY,
    DATA_INPUT_STATUS,
    DATA_LOAD_POWER_INFERRED,
    DATA_LOAD_POWER_W,
    DATA_LOGIC_VERSION,
    DATA_SECONDS_SINCE_LAST_APPLIED_DELTA,
    DATA_SOLAR_POWER_W,
    DATA_TRUST_CAUSE,
    DATA_TRUST_CAUSE_CODE,
    DATA_TRUST_LEVEL,
    INPUT_STATUS_DEGRADED,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    INPUT_STATUS_OK,
)
from ..const.tariff_edf import CONF_SUPPLIER, CONF_TARIFF_OFFER, SUPPLIER_EDF
from ..coordinator import HubEnergieCoordinator
from ..device_info import (
    _device_diagnostics,
    _device_for_diagnostic_metric_key,
    _device_grid_config,
)
from ..utils.config_display import config_overview_attributes as _config_overview_attributes
from .base import (
    HubEnergieSensor,
    _input_status_sensor_attributes,
    _safe_float,
)

_DIAG_ENTITY_LABELS: dict[str, str] = {
    "reinjection_cause": "Cause réinjection",
    "reinjection_confidence": "Fiabilité réinjection",
    "export_power_w": "Puissance d'export",
    "export_due_to_solar_surplus_kwh": "Export (surplus solaire)",
    "export_due_to_battery_full_or_absent_kwh": "Export (batterie pleine ou absente)",
    "export_due_to_switch_latency_kwh": "Export (latence de commutation)",
    "export_unattributed_kwh": "Export (non attribué)",
    "export_opportunity_cost_total_eur": "Coût d'opportunité export (total)",
    "export_opportunity_cost_solar_surplus_eur": "Coût d'opportunité (surplus solaire)",
    "export_opportunity_cost_battery_full_or_absent_eur": "Coût d'opportunité (batterie)",
    "export_opportunity_cost_switch_latency_eur": "Coût d'opportunité (latence)",
    "export_opportunity_cost_unattributed_eur": "Coût d'opportunité (non attribué)",
}


class HubEnergieHealthSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Trust level plus configured-entity readability (input_status)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "health"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ("ok", "degraded", "rebuilding", "inconsistent", "no_input")

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_health"
        self._attr_name = "État général"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> str:
        data = self.coordinator.data
        if not data:
            return "ok"
        trust = str(data.get(DATA_TRUST_LEVEL) or "ok")
        inp = str(data.get(DATA_INPUT_STATUS) or INPUT_STATUS_OK)
        if inp == INPUT_STATUS_NO_INPUT:
            return "no_input"
        if trust == "inconsistent" or inp == INPUT_STATUS_ERROR:
            return "inconsistent"
        if trust == "rebuilding":
            return "rebuilding"
        if inp == INPUT_STATUS_DEGRADED or trust == "degraded":
            return "degraded"
        return "ok"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        attrs = {
            "paris_day": data.get(DATA_DAY),
            DATA_CURRENT_SLOT: data.get(DATA_CURRENT_SLOT),
            DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION),
            DATA_DATA_QUALITY: data.get(DATA_DATA_QUALITY),
            DATA_TRUST_LEVEL: data.get(DATA_TRUST_LEVEL),
            DATA_TRUST_CAUSE_CODE: data.get(DATA_TRUST_CAUSE_CODE),
            DATA_TRUST_CAUSE: data.get(DATA_TRUST_CAUSE),
            DATA_DELTA_DISCARDS: data.get(DATA_DELTA_DISCARDS, {}),
            DATA_DELTA_TELEMETRY: data.get(DATA_DELTA_TELEMETRY, {}),
            DATA_DELTA_LAST_REJECTION: data.get(DATA_DELTA_LAST_REJECTION, {}),
            DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY: data.get(DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY),
            DATA_SECONDS_SINCE_LAST_APPLIED_DELTA: data.get(DATA_SECONDS_SINCE_LAST_APPLIED_DELTA),
        }
        attrs.update(_input_status_sensor_attributes(data, cap_entity_lists=True))
        return attrs


class HubEnergieDiagUnknownBucketSensor(HubEnergieSensor):
    """Grid energy accumulated in the indeterminate (`unknown`) tariff bucket today."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False
    _attr_icon = "mdi:help-circle-outline"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_grid_unknown_bucket_today"
        self._attr_name = "Réseau — créneau indéterminé (jour en cours)"
        self._attr_device_info = _device_grid_config(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY)


class HubEnergieDiagStalenessSensor(HubEnergieSensor):
    """Seconds since the last successfully applied meter delta (any configured source)."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.SECONDS
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_should_poll = False
    _attr_icon = "mdi:timer-sand"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_seconds_since_last_applied_delta"
        self._attr_name = "Délai depuis dernière mise à jour compteur"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(DATA_SECONDS_SINCE_LAST_APPLIED_DELTA)


class HubEnergieDiagInfoSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Diagnostic text/percent info sensor."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        key: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_name = _DIAG_ENTITY_LABELS.get(
            key, key.replace("_", " ").title(),
        )
        if key == "reinjection_confidence":
            self._attr_native_unit_of_measurement = "%"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> str | float | None:
        data = self.coordinator.data
        if not data:
            return None
        value = data.get(self._key)
        if self._key == "reinjection_confidence":
            return _safe_float(value)
        return str(value) if value is not None else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        return {
            DATA_GRID_POWER_SIGNED_W: data.get(DATA_GRID_POWER_SIGNED_W),
            DATA_SOLAR_POWER_W: data.get(DATA_SOLAR_POWER_W),
            DATA_BATT_DISCHARGE_POWER_W: data.get(DATA_BATT_DISCHARGE_POWER_W),
            DATA_BATT_CHARGE_POWER_W: data.get(DATA_BATT_CHARGE_POWER_W),
            DATA_LOAD_POWER_W: data.get(DATA_LOAD_POWER_W),
            DATA_LOAD_POWER_INFERRED: data.get(DATA_LOAD_POWER_INFERRED),
            DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION),
        }


class HubEnergieDiagPowerSensor(HubEnergieSensor):
    """Diagnostic power sensor in W."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        key: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_name = _DIAG_ENTITY_LABELS.get(
            key, key.replace("_", " ").title(),
        )
        self._attr_device_info = _device_for_diagnostic_metric_key(coordinator, key)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)


class HubEnergieDiagEnergySensor(HubEnergieSensor):
    """Diagnostic daily kWh buckets."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        key: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_name = _DIAG_ENTITY_LABELS.get(
            key, key.replace("_", " ").title(),
        )
        self._attr_device_info = _device_for_diagnostic_metric_key(coordinator, key)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)


class HubEnergieDiagCostSensor(HubEnergieSensor):
    """Diagnostic opportunity cost (€) sensors."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        key: str,
    ) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_name = _DIAG_ENTITY_LABELS.get(
            key, key.replace("_", " ").title(),
        )
        self._attr_device_info = _device_for_diagnostic_metric_key(coordinator, key)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)


class HubEnergieConfigOverviewSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Read-only recap of configured entities and options."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:information-outline"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_configuration_overview"
        self._attr_name = "Aperçu de la configuration"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> str | None:
        entry = self.coordinator.entry
        supplier = entry.data.get(CONF_SUPPLIER, SUPPLIER_EDF)
        if supplier == SUPPLIER_EDF:
            return str(entry.data.get(CONF_TARIFF_OFFER) or "unknown")
        return supplier

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return _config_overview_attributes(self.coordinator.entry)
