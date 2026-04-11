"""Tempo / offer sensors (info, RTE source, quotas, timestamps)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from ..const.energy_data import (
    DATA_RTE_CALENDAR_FETCHED_AT,
    DATA_TEMPO_DAYS,
    DATA_TEMPO_NEXT_COLOUR_CHANGE_AT,
    DATA_TEMPO_NEXT_HC_START_AT,
)
from ..const.tariff_edf import CONF_CURRENT_SLOT_SENSOR, TEMPO_MODE_SENSOR, TEMPO_SEASON_DAY_QUOTAS
from ..coordinator import HubEnergieCoordinator
from ..device_info import _device_offer
from .base import _safe_int

_INFO_LABELS: dict[str, str] = {
    "current_slot": "Créneau actuel",
    "today_color": "Couleur aujourd'hui",
    "tomorrow_color": "Couleur demain",
}

_TEMPO_QUOTA_DAY_LABEL: dict[str, str] = {
    "blue": "bleus",
    "white": "blancs",
    "red": "rouges",
}


class HubEnergieInfoSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """current_slot / today_color / tomorrow_color."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        info: str,
        *,
        enabled_default: bool = True,
    ) -> None:
        super().__init__(coordinator)
        self._info = info
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_unique_id = f"{entry.unique_id}_{info}"
        self._attr_name = _INFO_LABELS.get(
            info, info.replace("_", " ").title(),
        )
        self._attr_device_info = _device_offer(coordinator)
        if info in ("today_color", "tomorrow_color"):
            self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> str | None:
        if self._info == "current_slot":
            return self.coordinator.get_current_slot()
        if self._info == "today_color":
            return self.coordinator.get_today_color()
        if self._info == "tomorrow_color":
            return self.coordinator.get_tomorrow_color()
        value = self.coordinator.get_value(self._info)
        return str(value) if value is not None else None


class HubEnergieRteDataSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Résumé source Tempo (RTE / API / capteur)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:counter"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_rte_data"
        self._attr_name = "Source Tempo"
        self._attr_device_info = _device_offer(coordinator)

    @property
    def native_value(self) -> str | None:
        return self.coordinator.tempo_mode

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        c = self.coordinator
        data = c.data or {}
        attrs: dict[str, Any] = {
            "tempo_mode": c.tempo_mode,
            DATA_RTE_CALENDAR_FETCHED_AT: data.get(DATA_RTE_CALENDAR_FETCHED_AT),
            "tempo_days_quotas_note": (
                "Jours **strictement avant** aujourd'hui → « elapsed »; jour courant dans « remaining » "
                "(modes RTE calendrier / API). Voir les capteurs quota bleu · blanc · rouge."
            ),
        }
        if c.tempo_mode == TEMPO_MODE_SENSOR:
            attrs["current_slot_entity_id"] = c.entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        raw_api = c._edf.api_stats_raw
        if isinstance(raw_api, dict):
            attrs["api_stats_raw"] = raw_api
        return attrs


class HubEnergieQuotaDaySensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Jours Tempo restants sur la saison (état) + déjà écoulés (attribut)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_native_unit_of_measurement = "d"
    _attr_icon = "mdi:counter"

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        color_key: str,
    ) -> None:
        super().__init__(coordinator)
        self._color_key = color_key
        self._attr_unique_id = f"{entry.unique_id}_tempo_quota_{color_key}"
        adj = _TEMPO_QUOTA_DAY_LABEL.get(color_key, color_key)
        self._attr_name = f"Jours {adj} restants"
        self._attr_device_info = _device_offer(coordinator)

    @property
    def native_value(self) -> int | None:
        td = self.coordinator.get_tempo_days()
        if not isinstance(td, dict):
            return None
        block = td.get(self._color_key)
        if not isinstance(block, dict):
            return None
        return _safe_int(block.get("remaining"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        td = data.get(DATA_TEMPO_DAYS)
        quota = TEMPO_SEASON_DAY_QUOTAS.get(self._color_key, 0)
        out: dict[str, Any] = {"quota_saison": quota}
        if isinstance(td, dict):
            block = td.get(self._color_key)
            if isinstance(block, dict):
                out["elapsed"] = block.get("elapsed", 0)
        return out


class HubEnergieNextColourChangeSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Prochain instant où la couleur jour Tempo change."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:clock-end"
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_next_colour_change"
        self._attr_name = "Prochain changement de couleur"
        self._attr_device_info = _device_offer(coordinator)

    @property
    def native_value(self) -> datetime | None:
        raw = self.coordinator.get_value(DATA_TEMPO_NEXT_COLOUR_CHANGE_AT)
        if not raw:
            return None
        return dt_util.parse_datetime(str(raw))


class HubEnergieNextHcStartSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Début de la prochaine plage heures creuses (22:00 Europe/Paris)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:weather-night"
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_next_hc_start"
        self._attr_name = "Prochain début heures creuses"
        self._attr_device_info = _device_offer(coordinator)

    @property
    def native_value(self) -> datetime | None:
        raw = self.coordinator.get_value(DATA_TEMPO_NEXT_HC_START_AT)
        if not raw:
            return None
        return dt_util.parse_datetime(str(raw))
