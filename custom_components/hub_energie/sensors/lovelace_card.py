"""Site entity-id map + Lovelace card payload (Frontend device)."""

from __future__ import annotations

import json
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import callback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from ..card_payload import (
    build_card_entity_reference_attributes,
    build_lovelace_card_payload_attributes,
)
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_frontend, _device_site
from ..entity_id_stability import apply_stable_suggested_object_id


def _stable_fp(obj: Any) -> str:
    try:
        return json.dumps(obj, sort_keys=True, default=str)
    except (TypeError, ValueError):
        return str(obj)


class HubEnergieSiteIdsSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Site device: resolved Hub Énergie entity_ids for the Lovelace card (``card_entity_ids`` shape)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_native_value = "ok"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_site_ids"
        apply_stable_suggested_object_id(self)
        self._attr_name = "IDs site"
        self._attr_device_info = _device_site(coordinator)
        self._cached: dict[str, Any] = {}
        self._fp: str | None = None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._cached

    def _refresh(self) -> bool:
        attrs = build_card_entity_reference_attributes(self.hass, self.coordinator.entry)
        fp = _stable_fp(attrs)
        if fp == self._fp:
            return False
        self._cached = attrs
        self._fp = fp
        return True

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    @callback
    def _handle_coordinator_update(self) -> None:
        if self._refresh():
            self.async_write_ha_state()


class HubEnergieLovelaceCardSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Frontend device: live kWh / W / Tempo-style attributes for the Hub Énergie Lovelace card."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_native_value = "ok"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_lovelace_card"
        apply_stable_suggested_object_id(self)
        self._attr_name = "Carte Lovelace"
        self._attr_device_info = _device_frontend(coordinator)
        self._cached: dict[str, Any] = {}
        self._fp: str | None = None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._cached

    def _refresh(self) -> bool:
        attrs = build_lovelace_card_payload_attributes(self.hass, self.coordinator)
        fp = _stable_fp(attrs)
        if fp == self._fp:
            return False
        self._cached = attrs
        self._fp = fp
        return True

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    @callback
    def _handle_coordinator_update(self) -> None:
        if self._refresh():
            self.async_write_ha_state()
