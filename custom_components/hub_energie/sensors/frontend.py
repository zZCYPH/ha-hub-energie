"""Frontend payload sensors for Lovelace cards."""

from __future__ import annotations

from collections.abc import Mapping
import math
from typing import Any

from homeassistant.config_entries import ConfigEntry

from ..const import (
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_CURRENT_SLOT,
    DATA_EXPORT_POWER_W,
    DATA_GRID_IMPORT_POWER_W,
    DATA_GRID_POWER_SIGNED_W,
    DATA_HOME_POWER_W,
    DATA_INPUT_STATUS,
    DATA_INPUT_STATUS_REASONS,
    DATA_LOGIC_VERSION,
    DATA_LOAD_POWER_INFERRED,
    DATA_LOAD_POWER_W,
    DATA_OFFER,
    DATA_POWER_GRAPH_ENTITY_MAP,
    DATA_PRICING_STRUCTURE,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_SOLAR_POWER_W,
    DATA_SOLAR_PRODUCTION_POWER_W,
    DATA_SUPPLIER,
    DATA_TARIFF_FETCHED_AT,
    DATA_TEMPO_DAYS,
    DATA_TODAY_COLOR,
    DATA_TOMORROW_COLOR,
    DATA_CONTRACT_POWER,
    DATA_BATTERY_DISCHARGE_POWER_W,
    DATA_BATTERY_TO_HOME_POWER_W,
    DATA_GRID_TO_BATTERY_POWER_W,
    DATA_GRID_TO_HOME_POWER_W,
    DATA_SOLAR_EXPORT_POWER_W,
    DATA_SOLAR_TO_BATTERY_POWER_W,
    DATA_SOLAR_TO_HOME_POWER_W,
    CONF_BATTERY_SYSTEMS,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
)
from ..coordinator import EnergyData, HubEnergieCoordinator
from ..device_info import _device_frontend
from .base import HubEnergieSensor, _build_power_graph_entity_map, _input_status_sensor_attributes

_LIVE_POWER_KEYS: tuple[str, ...] = (
    DATA_HOME_POWER_W,
    DATA_GRID_IMPORT_POWER_W,
    DATA_SOLAR_PRODUCTION_POWER_W,
    DATA_BATTERY_DISCHARGE_POWER_W,
    DATA_SOLAR_TO_HOME_POWER_W,
    DATA_BATTERY_TO_HOME_POWER_W,
    DATA_GRID_TO_HOME_POWER_W,
    DATA_SOLAR_TO_BATTERY_POWER_W,
    DATA_GRID_TO_BATTERY_POWER_W,
    DATA_SOLAR_EXPORT_POWER_W,
    DATA_EXPORT_POWER_W,
    DATA_GRID_POWER_SIGNED_W,
    DATA_SOLAR_POWER_W,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_BATT_CHARGE_POWER_W,
    DATA_LOAD_POWER_W,
)


def _quantize_w(value: Any) -> int | None:
    if value is None or not isinstance(value, (int, float)):
        return None
    numeric = float(value)
    if not math.isfinite(numeric):
        return None
    return int(round(numeric))


def _frontend_live_attributes(data: Mapping[str, Any] | None) -> dict[str, Any]:
    attrs: dict[str, Any] = {}
    if not data:
        return attrs
    for key in _LIVE_POWER_KEYS:
        quantized = _quantize_w(data.get(key))
        if quantized is not None:
            attrs[key] = quantized
    if data.get(DATA_LOAD_POWER_INFERRED) is not None:
        attrs[DATA_LOAD_POWER_INFERRED] = bool(data.get(DATA_LOAD_POWER_INFERRED))
    return attrs


def _frontend_meta_attributes(
    coordinator: HubEnergieCoordinator,
    data: Mapping[str, Any] | None,
) -> dict[str, Any]:
    entry = coordinator.entry
    battery_systems = entry.data.get(CONF_BATTERY_SYSTEMS, [])
    attrs: dict[str, Any] = {
        DATA_POWER_GRAPH_ENTITY_MAP: _build_power_graph_entity_map(coordinator.hass, entry),
        "battery_configured": bool(entry.data.get(CONF_HAS_BATTERIES)),
        "solar_configured": bool(entry.data.get(CONF_HAS_SOLAR)),
        "battery_system_count": len(battery_systems) if isinstance(battery_systems, list) else 0,
    }
    if not data:
        return attrs

    for key in (
        DATA_LOGIC_VERSION,
        DATA_OFFER,
        DATA_CONTRACT_POWER,
        DATA_TARIFF_FETCHED_AT,
        DATA_CURRENT_SLOT,
        DATA_TODAY_COLOR,
        DATA_TOMORROW_COLOR,
        DATA_SUPPLIER,
        DATA_PRICING_STRUCTURE,
    ):
        value = data.get(key)
        if value is not None:
            attrs[key] = value

    tempo_days = data.get(DATA_TEMPO_DAYS)
    if isinstance(tempo_days, dict):
        attrs[DATA_TEMPO_DAYS] = tempo_days

    attrs.update(_input_status_sensor_attributes(data, cap_entity_lists=True))
    return attrs


def _fingerprint_live(data: Mapping[str, Any] | None) -> tuple[Any, ...]:
    if not data:
        return ("empty",)
    return (
        *(_quantize_w(data.get(key)) for key in _LIVE_POWER_KEYS),
        bool(data.get(DATA_LOAD_POWER_INFERRED)),
    )


def _fingerprint_meta(
    entry: ConfigEntry,
    data: Mapping[str, Any] | None,
) -> tuple[Any, ...]:
    battery_systems = entry.data.get(CONF_BATTERY_SYSTEMS, [])
    battery_count = len(battery_systems) if isinstance(battery_systems, list) else 0
    if not data:
        return (
            "empty",
            bool(entry.data.get(CONF_HAS_SOLAR)),
            bool(entry.data.get(CONF_HAS_BATTERIES)),
            battery_count,
        )
    return (
        data.get(DATA_LOGIC_VERSION),
        data.get(DATA_OFFER),
        data.get(DATA_CONTRACT_POWER),
        data.get(DATA_TARIFF_FETCHED_AT),
        data.get(DATA_CURRENT_SLOT),
        data.get(DATA_TODAY_COLOR),
        data.get(DATA_TOMORROW_COLOR),
        data.get(DATA_SUPPLIER),
        data.get(DATA_PRICING_STRUCTURE),
        data.get(DATA_INPUT_STATUS),
        tuple(data.get(DATA_INPUT_STATUS_REASONS) or ()),
        bool(entry.data.get(CONF_HAS_SOLAR)),
        bool(entry.data.get(CONF_HAS_BATTERIES)),
        battery_count,
    )


class _HubEnergieFrontendPayloadSensor(HubEnergieSensor):
    """Shared change-gated payload entity."""

    _attr_should_poll = False
    _attr_has_entity_name = True
    _attr_native_value = "ok"

    def __init__(self, coordinator: HubEnergieCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_frontend(coordinator)
        self._cached_attrs: dict[str, Any] = {}
        self._last_fingerprint: tuple[Any, ...] | None = None

    @property
    def native_value(self) -> str:
        return "ok"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._cached_attrs

    def _refresh_from_snapshot(self, data: EnergyData | None) -> bool:
        fingerprint = self._compute_fingerprint(data)
        if fingerprint == self._last_fingerprint:
            return False
        self._cached_attrs = self._build_attributes(data)
        self._last_fingerprint = fingerprint
        return True

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh_from_snapshot(self.coordinator.snapshot_data())

    def _handle_coordinator_update(self) -> None:
        data = self.coordinator.snapshot_data()
        if self._refresh_from_snapshot(data):
            self.async_write_ha_state()

    def _build_attributes(self, data: EnergyData | None) -> dict[str, Any]:
        raise NotImplementedError

    def _compute_fingerprint(self, data: EnergyData | None) -> tuple[Any, ...]:
        raise NotImplementedError


class HubEnergieFrontendDataSensor(_HubEnergieFrontendPayloadSensor):
    """High-churn live payload for Lovelace cards."""

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_frontend_data"
        self._attr_name = "Frontend data"
        self._attr_suggested_object_id = "hub_energie_frontend_data"

    def _build_attributes(self, data: EnergyData | None) -> dict[str, Any]:
        return _frontend_live_attributes(data)

    def _compute_fingerprint(self, data: EnergyData | None) -> tuple[Any, ...]:
        return _fingerprint_live(data)


class HubEnergieFrontendMetaSensor(_HubEnergieFrontendPayloadSensor):
    """Low-churn meta payload for Lovelace cards."""

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.unique_id}_frontend_meta"
        self._attr_name = "Frontend meta"
        self._attr_suggested_object_id = "hub_energie_frontend_meta"

    def _build_attributes(self, data: EnergyData | None) -> dict[str, Any]:
        return _frontend_meta_attributes(self.coordinator, data)

    def _compute_fingerprint(self, data: EnergyData | None) -> tuple[Any, ...]:
        return _fingerprint_meta(self._entry, data)
