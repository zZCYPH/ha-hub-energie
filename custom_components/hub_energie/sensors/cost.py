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
from ..const.core import LOGIC_VERSION
from ..const.energy_data import (
    DATA_ABONNEMENT_EUR,
    DATA_BATT_CHARGE_METER_KWH,
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_BATTERY_CARD,
    DATA_BATTERY_TOTAL_CHARGE_KWH,
    DATA_BATTERY_TOTAL_DISCHARGE_KWH,
    DATA_CONTRACT_POWER,
    DATA_COST_BY_SLOT,
    DATA_CURRENT_SLOT,
    DATA_ECO_BATT,
    DATA_ECO_SOLAR,
    DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH,
    DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH,
    DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH,
    DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR,
    DATA_EXPORT_POWER_W,
    DATA_EXPORT_UNATTRIBUTED_KWH,
    DATA_GRID_BY_SLOT_KWH,
    DATA_GRID_POWER_SIGNED_W,
    DATA_LOAD_POWER_INFERRED,
    DATA_LOAD_POWER_W,
    DATA_LOGIC_VERSION,
    DATA_MAISON_BY_SLOT_KWH,
    DATA_OFFER,
    DATA_POWER_GRAPH_ENTITY_MAP,
    DATA_PRICING_STRUCTURE,
    DATA_REINJECTION_CAUSE,
    DATA_REINJECTION_CONFIDENCE,
    DATA_SOLAR_ESTIMATE_DAILY_KWH,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_SOLAR_EXPORT_REVENUE_EUR,
    DATA_SOLAR_POWER_W,
    DATA_SUPPLIER,
    DATA_TARIFF_FETCHED_AT,
    DATA_TEMPO_DAYS,
    DATA_TODAY_COLOR,
    DATA_TOMORROW_COLOR,
    DATA_USAGE_BATT_CHARGE_METHOD,
    DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH,
)
from ..const.tariff_edf import ATTRIBUTION_SLOTS
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
