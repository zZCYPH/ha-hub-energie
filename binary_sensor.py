"""Hub Énergie – binary sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_BATT_NAME,
    CONF_BATTERY_SYSTEMS,
    CONF_HAS_SOLAR,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    DOMAIN,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
)
from .coordinator import HubEnergieCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: Any,
) -> None:
    coordinator: HubEnergieCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities: list[BinarySensorEntity] = []

    entities.append(HubEnergieConnectivitySensor(coordinator, entry))

    offer_eff = entry.options.get(
        CONF_TARIFF_OFFER,
        entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
    )
    is_edf_tempo = entry.data.get(CONF_SUPPLIER) == SUPPLIER_EDF and offer_eff == TARIFF_OFFER_TEMPO
    if is_edf_tempo:
        entities.append(HubEnergieOffPeakSensor(coordinator, entry))

    if entry.data.get(CONF_HAS_SOLAR):
        entities.append(HubEnergieSolarProducingSensor(coordinator, entry))

    if entry.data.get(CONF_SOLAR_ESTIMATION_ENABLED):
        entities.append(HubEnergieSolarEstimateActiveSensor(coordinator, entry))

    battery_systems = entry.data.get(CONF_BATTERY_SYSTEMS, [])
    for batt in battery_systems:
        batt_id = batt.get("id", "unknown")
        batt_name = batt.get(CONF_BATT_NAME) or batt_id
        entities.append(
            HubEnergieBatteryChargingSensor(coordinator, entry, batt_id, batt_name)
        )

    async_add_entities(entities)


def _device_diagnostics(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_diagnostics")},
        name="Diagnostics",
        manufacturer="Hub Énergie",
        model="Diagnostics",
    )


def _device_energy_balance(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_energy_balance")},
        name="Bilan énergétique",
        manufacturer="Hub Énergie",
        model="Energy flows (kWh)",
    )


def _device_offer(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_offer")},
        name="Offre",
        manufacturer="Hub Énergie",
        model="Tariff & contract",
    )


def _device_solar_config(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_solar_config")},
        name="Solaire",
        manufacturer="Hub Énergie",
        model="Solar configuration",
    )


def _battery_device_display_name(batt_id: str, batt_name: str) -> str:
    label = (batt_name or "").strip()
    if label:
        return label
    if batt_id:
        return str(batt_id)
    return "Batterie"


def _device_battery(
    coordinator: HubEnergieCoordinator, batt_id: str, batt_name: str
) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_battery_{batt_id}")},
        name=_battery_device_display_name(batt_id, batt_name),
        manufacturer="Hub Énergie",
        model="Battery system",
    )


class HubEnergieConnectivitySensor(
    CoordinatorEntity[HubEnergieCoordinator], BinarySensorEntity
):
    """Integration health: True when last coordinator refresh succeeded."""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False

    def __init__(
        self, coordinator: HubEnergieCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_connectivity"
        self._attr_name = "Connexion"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def is_on(self) -> bool:
        return self.coordinator.last_update_success


class HubEnergieOffPeakSensor(
    CoordinatorEntity[HubEnergieCoordinator], BinarySensorEntity
):
    """True during Tempo off-peak (HC) window. EDF Tempo only."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self, coordinator: HubEnergieCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_off_peak"
        self._attr_name = "Heures creuses Tempo"
        self._attr_device_info = _device_offer(coordinator)

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        if not data:
            return None
        return data.get("tempo_is_off_peak")


class HubEnergieSolarProducingSensor(
    CoordinatorEntity[HubEnergieCoordinator], BinarySensorEntity
):
    """True when solar power > 0."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:solar-power"
    _attr_should_poll = False

    def __init__(
        self, coordinator: HubEnergieCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_solar_producing"
        self._attr_name = "Production active"
        self._attr_device_info = _device_solar_config(coordinator)

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        if not data:
            return None
        pw = data.get("solar_power_w")
        if pw is None:
            return None
        return float(pw) > 0


class HubEnergieSolarEstimateActiveSensor(
    CoordinatorEntity[HubEnergieCoordinator], BinarySensorEntity
):
    """True when solar estimation model is running and producing > 0."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False

    def __init__(
        self, coordinator: HubEnergieCoordinator, entry: ConfigEntry
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_solar_estimate_active"
        self._attr_name = "Estimation PV active"
        self._attr_device_info = _device_solar_config(coordinator)

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        if not data:
            return None
        est = data.get("solar_estimate_power_w")
        if est is None:
            return False
        return float(est) > 0


class HubEnergieBatteryChargingSensor(
    CoordinatorEntity[HubEnergieCoordinator], BinarySensorEntity
):
    """True when this battery system is currently charging."""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.BATTERY_CHARGING
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        batt_id: str,
        batt_name: str,
    ) -> None:
        super().__init__(coordinator)
        self._batt_id = batt_id
        self._attr_unique_id = f"{entry.unique_id}_battery_{batt_id}_charging"
        self._attr_name = "En charge"
        self._attr_device_info = _device_battery(coordinator, batt_id, batt_name)

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        if not data:
            return None
        systems = data.get("battery_systems", [])
        for batt in systems:
            if batt.get("id") == self._batt_id:
                pnet = batt.get("power_net")
                if pnet is None:
                    return None
                return float(pnet) < 0
        return None
