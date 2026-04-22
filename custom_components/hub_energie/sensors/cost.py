"""Cost detail and savings sensors."""

from __future__ import annotations

import math
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CURRENCY_EURO

from ..const import (
    ATTRIBUTION_SLOTS,
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
    LOGIC_VERSION,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_battery_summary, _device_cost, _device_solar_config
from .base import (
    HubEnergieSensor,
    _build_power_graph_entity_map,
    _input_status_blocks_cost_and_grid,
    _input_status_sensor_attributes,
    _safe_float,
)

_SAVINGS_LABELS: dict[str, str] = {
    "solar": "Économies solaire",
    "battery": "Économies batterie",
}


class HubEnergieCostDetailSensor(HubEnergieSensor):
    """Daily cost with per-slot attributes — the main sensor the card reads."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_cost_detail"
        self._attr_suggested_object_id = "hub_energie_cost_detail"
        self._attr_name = "Coût du jour"
        self._attr_device_info = _device_cost(coordinator)

    @property
    def native_value(self) -> float | None:
        return self.coordinator.get_cost_total()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        cbs = data.get(DATA_COST_BY_SLOT)
        attrs: dict[str, Any] = {
            DATA_POWER_GRAPH_ENTITY_MAP: _build_power_graph_entity_map(
                self.hass,
                self.coordinator.entry,
            ),
            DATA_LOGIC_VERSION: data.get(DATA_LOGIC_VERSION, LOGIC_VERSION),
            DATA_ABONNEMENT_EUR: data.get(DATA_ABONNEMENT_EUR, 0.0),
            DATA_OFFER: data.get(DATA_OFFER),
            DATA_CONTRACT_POWER: data.get(DATA_CONTRACT_POWER),
            DATA_TARIFF_FETCHED_AT: data.get(DATA_TARIFF_FETCHED_AT),
            DATA_CURRENT_SLOT: data.get(DATA_CURRENT_SLOT),
            DATA_TODAY_COLOR: data.get(DATA_TODAY_COLOR),
            DATA_TOMORROW_COLOR: data.get(DATA_TOMORROW_COLOR),
            DATA_SUPPLIER: data.get(DATA_SUPPLIER),
            DATA_PRICING_STRUCTURE: data.get(DATA_PRICING_STRUCTURE),
            DATA_REINJECTION_CAUSE: data.get(DATA_REINJECTION_CAUSE),
            DATA_REINJECTION_CONFIDENCE: data.get(DATA_REINJECTION_CONFIDENCE),
            DATA_EXPORT_POWER_W: data.get(DATA_EXPORT_POWER_W),
            DATA_GRID_POWER_SIGNED_W: data.get(DATA_GRID_POWER_SIGNED_W),
            DATA_SOLAR_POWER_W: data.get(DATA_SOLAR_POWER_W),
            DATA_SOLAR_ESTIMATE_POWER_W: data.get(DATA_SOLAR_ESTIMATE_POWER_W),
            DATA_BATT_DISCHARGE_POWER_W: data.get(DATA_BATT_DISCHARGE_POWER_W),
            DATA_BATT_CHARGE_POWER_W: data.get(DATA_BATT_CHARGE_POWER_W),
            DATA_LOAD_POWER_W: data.get(DATA_LOAD_POWER_W),
            DATA_LOAD_POWER_INFERRED: data.get(DATA_LOAD_POWER_INFERRED),
            DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH: data.get(DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH, 0.0),
            DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH: data.get(DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH, 0.0),
            DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH: data.get(DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH, 0.0),
            DATA_EXPORT_UNATTRIBUTED_KWH: data.get(DATA_EXPORT_UNATTRIBUTED_KWH, 0.0),
            DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR: data.get(DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR, 0.0),
            DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR: data.get(
                DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR, 0.0,
            ),
            DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR: data.get(
                DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR, 0.0,
            ),
            DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR: data.get(
                DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR, 0.0,
            ),
            DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR: data.get(
                DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR, 0.0,
            ),
            DATA_USAGE_BATT_CHARGE_METHOD: data.get(DATA_USAGE_BATT_CHARGE_METHOD),
            DATA_BATT_CHARGE_METER_KWH: data.get(DATA_BATT_CHARGE_METER_KWH),
            DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH: data.get(DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH, {}),
            DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH: data.get(DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH, {}),
            DATA_ECO_SOLAR: data.get(DATA_ECO_SOLAR, 0.0),
            DATA_ECO_BATT: data.get(DATA_ECO_BATT, 0.0),
            DATA_BATTERY_TOTAL_CHARGE_KWH: data.get(DATA_BATTERY_TOTAL_CHARGE_KWH),
            DATA_BATTERY_TOTAL_DISCHARGE_KWH: data.get(DATA_BATTERY_TOTAL_DISCHARGE_KWH),
            DATA_SOLAR_ESTIMATE_DAILY_KWH: data.get(DATA_SOLAR_ESTIMATE_DAILY_KWH),
            DATA_SOLAR_EXPORT_REVENUE_EUR: data.get(DATA_SOLAR_EXPORT_REVENUE_EUR),
        }
        grid_map = data.get("grid")
        if isinstance(grid_map, dict):
            attrs[DATA_GRID_BY_SLOT_KWH] = {
                k: round(float(v), 5)
                for k, v in grid_map.items()
                if isinstance(v, (int, float)) and math.isfinite(v)
            }
        maison_map = data.get("maison")
        if isinstance(maison_map, dict):
            attrs[DATA_MAISON_BY_SLOT_KWH] = {
                k: round(float(v), 5)
                for k, v in maison_map.items()
                if isinstance(v, (int, float)) and math.isfinite(v)
            }
        tempo_days = data.get(DATA_TEMPO_DAYS)
        if isinstance(tempo_days, dict):
            attrs[DATA_TEMPO_DAYS] = tempo_days
        bcard = data.get(DATA_BATTERY_CARD)
        if isinstance(bcard, dict):
            battery_capacity = _safe_float(bcard.get("capacity_kwh"))
            if battery_capacity is not None:
                attrs["battery_capacity_kwh"] = battery_capacity
            battery_stored = _safe_float(bcard.get("stored_kwh"))
            if battery_stored is not None:
                attrs["battery_stored_kwh"] = battery_stored
            battery_available = _safe_float(bcard.get("available_kwh"))
            if battery_available is not None:
                attrs["battery_available_kwh"] = battery_available
            battery_soc = _safe_float(bcard.get("soc_percent"))
            if battery_soc is not None:
                attrs["battery_soc_percent"] = battery_soc
            battery_soc_min = _safe_float(bcard.get("soc_min_percent"))
            if battery_soc_min is not None:
                attrs["battery_soc_min_percent"] = battery_soc_min
            battery_soc_max = _safe_float(bcard.get("soc_max_percent"))
            if battery_soc_max is not None:
                attrs["battery_soc_max_percent"] = battery_soc_max
        if isinstance(cbs, dict):
            for slot in ATTRIBUTION_SLOTS:
                slot_cost = _safe_float(cbs.get(slot))
                if slot_cost is not None:
                    attrs[f"{slot}_eur"] = round(slot_cost, 3)
        attrs.update(_input_status_sensor_attributes(data))
        return attrs


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
        self._attr_suggested_object_id = f"hub_energie_savings_{kind}_eur"
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
