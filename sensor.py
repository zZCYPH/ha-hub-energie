"""Hub Énergie sensors."""

from __future__ import annotations

from datetime import datetime
import math
from typing import Any, TypedDict

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy, UnitOfPower
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_DIRECT_MAISON,
    ATTR_VIA_BATTERIE,
    CONF_BATT_NAME,
    CONF_BATTERY_SYSTEMS,
    CONF_CONTRACT_POWER,
    CONF_CURRENT_SLOT_SENSOR,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_RTE_CLIENT_ID,
    CONF_RTE_CLIENT_SECRET,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_POWER_SENSOR,
    CONF_SOLAR_RESALE_CONTRACT,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    CONF_TEMPO_MODE,
    DOMAIN,
    LOGIC_VERSION,
    OPT_TARIFF_FETCHED_AT,
    REINJECTION_OPTION_KEYS,
    SLOTS,
    SOURCE_BATT_CHARGE,
    SOURCE_BATT_DISCHARGE,
    SOURCE_GRID,
    SOURCE_SOLAR,
    SUPPLIER_EDF,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
    TEMPO_SEASON_DAY_QUOTAS,
)
from .coordinator import HubEnergieCoordinator

_MANUFACTURER = "Hub Énergie"


class EnergyData(TypedDict, total=False):
    """Lightweight partial typing for coordinator snapshot data."""

    grid_power_signed_w: float
    solar_power_w: float
    load_power_w: float
    cost_total: float
    eco_solar: float
    eco_batt: float
    export_power_w: float
    battery_total_charge_kwh: float
    battery_total_discharge_kwh: float
    battery_total_net_power_w: float
    solar_export_revenue_eur: float
    solar_estimate_power_w: float
    solar_estimate_daily_kwh: float
    solar_estimate_yearly_kwh: float
    maison: dict[str, float]
    battery_systems: list[dict[str, Any]]


class HubEnergieSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Common safe access helpers for Hub Energie sensors."""

    _attr_should_poll = False

    def _data(self) -> EnergyData | None:
        data = self.coordinator.data
        return data if isinstance(data, dict) and data else None

    def _get_value(self, key: str) -> float | None:
        data = self._data()
        if not data:
            return None
        value = data.get(key)
        return _safe_float(value)

    def _get_nested_value(self, section_key: str, key: str) -> float | None:
        data = self._data()
        if not data:
            return None
        section = data.get(section_key)
        if not isinstance(section, dict):
            return None
        return _safe_float(section.get(key))

    def _get_section(self, key: str) -> dict[str, Any] | None:
        data = self._data()
        if not data:
            return None
        section = data.get(key)
        return section if isinstance(section, dict) else None


def _safe_float(value: Any) -> float | None:
    if value is None or not isinstance(value, (int, float)):
        return None
    if not math.isfinite(float(value)):
        return None
    return float(value)


def _safe_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# Device info helpers — one per logical scope
# ═══════════════════════════════════════════════════════════════════════════════


def _device_offer(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_offer")},
        name="Offre",
        manufacturer=_MANUFACTURER,
        model="Tariff & contract",
    )


def _device_grid_config(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_grid_config")},
        name="Réseau",
        manufacturer=_MANUFACTURER,
        model="Grid configuration",
    )


def _device_solar_config(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_solar_config")},
        name="Solaire",
        manufacturer=_MANUFACTURER,
        model="Solar configuration",
    )


def _battery_device_display_name(batt_id: str, batt_name: str) -> str:
    """Short device title: user label, else id (readable lists / dashboards)."""
    label = (batt_name or "").strip()
    if label:
        return label
    if batt_id:
        return str(batt_id)
    return "Batterie"


def _device_battery(
    coordinator: HubEnergieCoordinator, batt_id: str, batt_name: str,
) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_battery_{batt_id}")},
        name=_battery_device_display_name(batt_id, batt_name),
        manufacturer=_MANUFACTURER,
        model="Battery system",
    )


def _device_battery_summary(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_battery_summary")},
        name="Toutes batteries",
        manufacturer=_MANUFACTURER,
        model="Battery aggregates",
    )


def _device_energy_balance(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_energy_balance")},
        name="Bilan énergétique",
        manufacturer=_MANUFACTURER,
        model="Energy flows (kWh)",
    )


def _device_cost(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_cost")},
        name="Coûts",
        manufacturer=_MANUFACTURER,
        model="Monetary (€)",
    )


def _device_diagnostics(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_diagnostics")},
        name="Diagnostics",
        manufacturer=_MANUFACTURER,
        model="Reinjection & export diagnostics",
    )


def _slot_label_fr(slot: str) -> str:
    """Compact French label for a tariff slot (Tempo / HPHC)."""
    parts = slot.split("_", 1)
    if len(parts) != 2:
        return slot.replace("_", " ").title()
    color, period = parts
    color_fr = {"bleu": "Bleu", "blanc": "Blanc", "rouge": "Rouge"}.get(color, color.title())
    period_fr = "HC" if period == "hc" else "HP" if period == "hp" else period.upper()
    return f"{color_fr} {period_fr}"


def _energy_source_label_fr(source: str) -> str:
    return {
        SOURCE_GRID: "Réseau",
        SOURCE_SOLAR: "Solaire",
        SOURCE_BATT_DISCHARGE: "Décharge batterie",
        SOURCE_BATT_CHARGE: "Charge batterie",
    }.get(source, source.replace("_", " ").title())


_USAGE_FLOW_LABELS: dict[str, str] = {
    "grid_direct": "Réseau → maison",
    "grid_batt_charge": "Réseau → batterie",
    "solar_direct": "Solaire → maison",
    "solar_batt_charge": "Solaire → batterie",
    "batt_home": "Batterie → maison",
}

_INFO_LABELS: dict[str, str] = {
    "current_slot": "Créneau actuel",
    "today_color": "Couleur aujourd'hui",
    "tomorrow_color": "Couleur demain",
}

_ORIGIN_LABELS: dict[str, str] = {
    "grid": "Énergie réseau",
    "solar": "Énergie solaire",
}

_SAVINGS_LABELS: dict[str, str] = {
    "solar": "Économies solaire",
    "battery": "Économies batterie",
}

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

_SOLAR_ESTIMATE_LABELS: dict[str, str] = {
    "current_power_estimate": "Puissance estimée",
    "daily_energy_estimate": "Énergie estimée (jour)",
    "yearly_energy_estimate": "Énergie estimée (an)",
}

_TEMPO_QUOTA_DAY_LABEL: dict[str, str] = {
    "blue": "bleus",
    "white": "blancs",
    "red": "rouges",
}


# ═══════════════════════════════════════════════════════════════════════════════
# Helpers
# ═══════════════════════════════════════════════════════════════════════════════


def _visible_slots_for_offer(entry: ConfigEntry) -> set[str]:
    """Slots enabled by default for the selected offer."""
    supplier = entry.data.get(CONF_SUPPLIER, SUPPLIER_EDF)
    if supplier != SUPPLIER_EDF:
        return {"bleu_hc", "bleu_hp"}
    offer = entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)
    if offer == TARIFF_OFFER_BASE:
        return {"bleu_hp"}
    if offer == TARIFF_OFFER_HPHC:
        return {"bleu_hc", "bleu_hp"}
    return set(SLOTS)


def _redact_entry_data_for_display(data: dict[str, Any]) -> dict[str, Any]:
    out = dict(data)
    if out.get(CONF_RTE_CLIENT_SECRET):
        out[CONF_RTE_CLIENT_SECRET] = "(stored)"
    cid = out.get(CONF_RTE_CLIENT_ID)
    if cid:
        s = str(cid)
        out[CONF_RTE_CLIENT_ID] = f"{s[:4]}…{s[-4:]}" if len(s) > 8 else "(stored)"
    return out


def _config_overview_attributes(entry: ConfigEntry) -> dict[str, Any]:
    data = _redact_entry_data_for_display(dict(entry.data))
    options = dict(entry.options)
    reinj_override = {k: options[k] for k in REINJECTION_OPTION_KEYS if k in options}
    power_wiring: dict[str, str | None] = {
        "grid_power_sensor": options.get(CONF_GRID_POWER_SENSOR) or data.get(CONF_GRID_POWER_SENSOR),
        "solar_power_sensor": options.get(CONF_SOLAR_POWER_SENSOR) or data.get(CONF_SOLAR_POWER_SENSOR),
        "load_power_sensor": options.get(CONF_LOAD_POWER_SENSOR) or data.get(CONF_LOAD_POWER_SENSOR),
        "grid_power_sign_mode": options.get(CONF_GRID_POWER_SIGN_MODE) or data.get(CONF_GRID_POWER_SIGN_MODE),
    }
    has_power = any(bool(v) for k, v in power_wiring.items() if k != "grid_power_sign_mode") or bool(
        power_wiring.get("grid_power_sign_mode")
    )
    batteries = data.get(CONF_BATTERY_SYSTEMS, [])
    return {
        "supplier": data.get(CONF_SUPPLIER),
        "offer": data.get(CONF_TARIFF_OFFER),
        "tempo_mode": data.get(CONF_TEMPO_MODE),
        "contract_power_kva": data.get(CONF_CONTRACT_POWER) or options.get(CONF_CONTRACT_POWER),
        "tariff_fetched_at": options.get(OPT_TARIFF_FETCHED_AT),
        "has_solar": bool(data.get(CONF_HAS_SOLAR)),
        "has_batteries": bool(data.get(CONF_HAS_BATTERIES)),
        "battery_count": len(batteries) if isinstance(batteries, list) else 0,
        "solar_estimation_enabled": bool(data.get(CONF_SOLAR_ESTIMATION_ENABLED)),
        "solar_resale_contract": bool(data.get(CONF_SOLAR_RESALE_CONTRACT)),
        "power_entities": power_wiring,
        "power_sensors_configured": has_power,
        "current_slot_sensor": data.get(CONF_CURRENT_SLOT_SENSOR),
        "reinjection_overrides": reinj_override or None,
        "options_keys": sorted(options.keys()),
        "data": data,
        "options": options,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# SSOT totals / today / flow sensors
# ═══════════════════════════════════════════════════════════════════════════════

_SSOT_TOTAL_CONFIG: dict[str, dict[str, str]] = {
    "grid": {"snapshot_key": "energy_grid_total_kwh", "name": "Énergie réseau (total)"},
    "solar": {"snapshot_key": "energy_solar_total_kwh", "name": "Énergie solaire (total)"},
    "export": {"snapshot_key": "energy_export_total_kwh", "name": "Énergie export (total)"},
    "battery_charge": {
        "snapshot_key": "energy_batt_charge_total_kwh",
        "name": "Énergie charge batterie (total)",
    },
    "battery_discharge": {
        "snapshot_key": "energy_batt_discharge_total_kwh",
        "name": "Énergie décharge batterie (total)",
    },
}

_TODAY_ENERGY_CONFIG: dict[str, dict[str, str]] = {
    "home": {"snapshot_key": "energy_home_today_kwh", "name": "Énergie maison (aujourd'hui)"},
    "grid": {"snapshot_key": "energy_grid_today_kwh", "name": "Énergie réseau (aujourd'hui)"},
    "solar": {"snapshot_key": "energy_solar_today_kwh", "name": "Énergie solaire (aujourd'hui)"},
    "export": {"snapshot_key": "energy_export_today_kwh", "name": "Énergie export (aujourd'hui)"},
    "battery_charge": {
        "snapshot_key": "energy_batt_charge_today_kwh",
        "name": "Énergie charge batterie (aujourd'hui)",
    },
    "battery_discharge": {
        "snapshot_key": "energy_batt_discharge_today_kwh",
        "name": "Énergie décharge batterie (aujourd'hui)",
    },
}

_FLOW_POWER_CONFIG: dict[str, dict[str, str]] = {
    "home": {"snapshot_key": "home_power_w", "name": "Puissance maison"},
    "grid_import": {"snapshot_key": "grid_import_power_w", "name": "Puissance import réseau"},
    "solar_production": {"snapshot_key": "solar_production_power_w", "name": "Puissance production solaire"},
    "battery_discharge": {"snapshot_key": "battery_discharge_power_w", "name": "Puissance décharge batterie"},
    "solar_to_home": {"snapshot_key": "solar_to_home_power_w", "name": "Puissance solaire vers maison"},
    "battery_to_home": {"snapshot_key": "battery_to_home_power_w", "name": "Puissance batterie vers maison"},
    "grid_to_home": {"snapshot_key": "grid_to_home_power_w", "name": "Puissance réseau vers maison"},
    "solar_to_battery": {"snapshot_key": "solar_to_battery_power_w", "name": "Puissance solaire vers batterie"},
    "grid_to_battery": {"snapshot_key": "grid_to_battery_power_w", "name": "Puissance réseau vers batterie"},
    "solar_export": {"snapshot_key": "solar_export_power_w", "name": "Puissance export solaire"},
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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)


class HubEnergieTodayEnergySensor(HubEnergieSensor):
    """Convenience today kWh sensor (derived, non-SSOT)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_state_class = SensorStateClass.MEASUREMENT
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
        cfg = _TODAY_ENERGY_CONFIG[kind]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_{kind}_today_kwh"
        self._attr_name = cfg["name"]
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)


class HubEnergiePowerFlowSensor(HubEnergieSensor):
    """Derived real-time power/flow sensor (measurement, non-SSOT)."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_state_class = SensorStateClass.MEASUREMENT
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
        cfg = _FLOW_POWER_CONFIG[kind]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_{kind}_power_w"
        self._attr_name = cfg["name"]
        self._attr_entity_registry_enabled_default = enabled_default
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)


# ═══════════════════════════════════════════════════════════════════════════════
# async_setup_entry
# ═══════════════════════════════════════════════════════════════════════════════


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: Any,
) -> None:
    coordinator: HubEnergieCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities: list[SensorEntity] = []

    is_edf = entry.data.get(CONF_SUPPLIER, SUPPLIER_EDF) == SUPPLIER_EDF
    is_tempo = is_edf and entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO) == TARIFF_OFFER_TEMPO
    has_solar = bool(entry.data.get(CONF_HAS_SOLAR))
    has_batteries = bool(entry.data.get(CONF_HAS_BATTERIES))
    battery_systems: list[dict[str, Any]] = entry.data.get(CONF_BATTERY_SYSTEMS, [])
    solar_estimation = bool(entry.data.get(CONF_SOLAR_ESTIMATION_ENABLED))
    solar_resale = bool(entry.data.get(CONF_SOLAR_RESALE_CONTRACT))

    # ── SSOT totals (integration-owned total_increasing) ───────────────
    entities.extend(
        [
            HubEnergieSsotTotalSensor(coordinator, entry, "grid"),
            HubEnergieSsotTotalSensor(coordinator, entry, "solar", enabled_default=has_solar),
            HubEnergieSsotTotalSensor(coordinator, entry, "export"),
            HubEnergieSsotTotalSensor(coordinator, entry, "battery_charge", enabled_default=has_batteries),
            HubEnergieSsotTotalSensor(coordinator, entry, "battery_discharge", enabled_default=has_batteries),
        ]
    )

    # ── Today convenience sensors (derived, non-SSOT) ──────────────────
    entities.extend(
        [
            HubEnergieTodayEnergySensor(coordinator, entry, "home"),
            HubEnergieTodayEnergySensor(coordinator, entry, "grid"),
            HubEnergieTodayEnergySensor(coordinator, entry, "solar", enabled_default=has_solar),
            HubEnergieTodayEnergySensor(coordinator, entry, "export"),
            HubEnergieTodayEnergySensor(coordinator, entry, "battery_charge", enabled_default=has_batteries),
            HubEnergieTodayEnergySensor(coordinator, entry, "battery_discharge", enabled_default=has_batteries),
        ]
    )

    # ── Power / flow sensors (derived, non-SSOT) ───────────────────────
    entities.extend(
        [
            HubEnergiePowerFlowSensor(coordinator, entry, "home"),
            HubEnergiePowerFlowSensor(coordinator, entry, "grid_import"),
            HubEnergiePowerFlowSensor(coordinator, entry, "solar_production", enabled_default=has_solar),
            HubEnergiePowerFlowSensor(coordinator, entry, "battery_discharge", enabled_default=has_batteries),
            HubEnergiePowerFlowSensor(coordinator, entry, "solar_to_home", enabled_default=has_solar),
            HubEnergiePowerFlowSensor(coordinator, entry, "battery_to_home", enabled_default=has_batteries),
            HubEnergiePowerFlowSensor(coordinator, entry, "grid_to_home"),
            HubEnergiePowerFlowSensor(coordinator, entry, "solar_to_battery", enabled_default=has_solar and has_batteries),
            HubEnergiePowerFlowSensor(coordinator, entry, "grid_to_battery", enabled_default=has_batteries),
            HubEnergiePowerFlowSensor(coordinator, entry, "solar_export", enabled_default=has_solar),
        ]
    )

    # ── Tempo-specific (EDF only) ──────────────────────────────────────
    if is_tempo:
        entities.append(HubEnergieRteDataSensor(coordinator, entry))
        for color_key in ("blue", "white", "red"):
            entities.append(HubEnergieQuotaDaySensor(coordinator, entry, color_key))
        entities.append(HubEnergieNextColourChangeSensor(coordinator, entry))
        entities.append(HubEnergieNextHcStartSensor(coordinator, entry))

    # ── Core sensors ───────────────────────────────────────────────────
    entities.extend([
        HubEnergieCostDetailSensor(coordinator, entry),
        HubEnergieOriginSensor(coordinator, entry, "grid"),
        HubEnergieOriginSensor(coordinator, entry, "solar"),
        HubEnergieUsageSensor(coordinator, entry, "grid_direct"),
        HubEnergieUsageSensor(coordinator, entry, "grid_batt_charge"),
        HubEnergieUsageSensor(coordinator, entry, "solar_direct"),
        HubEnergieUsageSensor(coordinator, entry, "solar_batt_charge"),
        HubEnergieUsageSensor(coordinator, entry, "batt_home"),
        HubEnergieSavingsSensor(coordinator, entry, "solar"),
        HubEnergieSavingsSensor(coordinator, entry, "battery"),
        HubEnergieInfoSensor(coordinator, entry, "current_slot"),
        HubEnergieInfoSensor(coordinator, entry, "today_color", enabled_default=is_tempo),
        HubEnergieInfoSensor(coordinator, entry, "tomorrow_color", enabled_default=is_tempo),
    ])

    # ── Diagnostics sensors ────────────────────────────────────────────
    entities.extend([
        HubEnergieDiagInfoSensor(coordinator, entry, "reinjection_cause"),
        HubEnergieDiagInfoSensor(coordinator, entry, "reinjection_confidence"),
        HubEnergieDiagPowerSensor(coordinator, entry, "export_power_w"),
        HubEnergieDiagEnergySensor(coordinator, entry, "export_due_to_solar_surplus_kwh"),
        HubEnergieDiagEnergySensor(coordinator, entry, "export_due_to_battery_full_or_absent_kwh"),
        HubEnergieDiagEnergySensor(coordinator, entry, "export_due_to_switch_latency_kwh"),
        HubEnergieDiagEnergySensor(coordinator, entry, "export_unattributed_kwh"),
        HubEnergieDiagCostSensor(coordinator, entry, "export_opportunity_cost_total_eur"),
        HubEnergieDiagCostSensor(coordinator, entry, "export_opportunity_cost_solar_surplus_eur"),
        HubEnergieDiagCostSensor(coordinator, entry, "export_opportunity_cost_battery_full_or_absent_eur"),
        HubEnergieDiagCostSensor(coordinator, entry, "export_opportunity_cost_switch_latency_eur"),
        HubEnergieDiagCostSensor(coordinator, entry, "export_opportunity_cost_unattributed_eur"),
        HubEnergieHealthSensor(coordinator, entry),
        HubEnergieConfigOverviewSensor(coordinator, entry),
    ])

    # ── Per-battery sensors ────────────────────────────────────────────
    if has_batteries and isinstance(battery_systems, list):
        for batt in battery_systems:
            batt_id = batt.get("id", "")
            batt_name = batt.get(CONF_BATT_NAME, f"Battery {batt_id}")
            for metric in (
                "charge_energy", "discharge_energy", "power_net",
                "soc", "stored_energy", "available_energy",
            ):
                entities.append(
                    HubEnergieBatterySensor(coordinator, entry, batt_id, batt_name, metric)
                )

        # ── Battery summary ────────────────────────────────────────────
        for metric in ("total_charge_energy", "total_discharge_energy", "total_net_power"):
            entities.append(
                HubEnergieBatterySummarySensor(coordinator, entry, metric)
            )

    # ── Solar estimation ───────────────────────────────────────────────
    if has_solar and solar_estimation:
        for metric in ("current_power_estimate", "daily_energy_estimate", "yearly_energy_estimate"):
            entities.append(
                HubEnergieSolarEstimateSensor(coordinator, entry, metric)
            )

    # ── Solar export revenue ───────────────────────────────────────────
    if has_solar and solar_resale:
        entities.append(HubEnergieSolarRevenueSensor(coordinator, entry))

    async_add_entities(entities)


# ═══════════════════════════════════════════════════════════════════════════════
# Sensor classes
# ═══════════════════════════════════════════════════════════════════════════════


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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        value = self._get_nested_value(self._source, self._slot)
        return round(value, 3) if value is not None else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        return {"logic_version": data.get("logic_version", LOGIC_VERSION)}


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


_USAGE_KEYS = {
    "grid_direct": "usage_grid_direct",
    "grid_batt_charge": "usage_grid_batt_charge",
    "solar_direct": "usage_solar_direct",
    "solar_batt_charge": "usage_solar_batt_charge",
    "batt_home": "usage_batt_home",
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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        attrs: dict[str, Any] = {
            "logic_version": data.get("logic_version", LOGIC_VERSION),
        }
        if self._key in ("usage_grid_batt_charge", "usage_solar_batt_charge"):
            attrs["batt_charge_method"] = data.get("usage_batt_charge_method")
            attrs["batt_charge_meter_kwh"] = data.get("batt_charge_meter_kwh")
            if self._key == "usage_grid_batt_charge":
                gslot = data.get("usage_grid_batt_charge_by_slot_kwh")
                if isinstance(gslot, dict):
                    attrs["by_slot_kwh"] = gslot
            else:
                sslot = data.get("usage_solar_batt_charge_by_slot_kwh")
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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(f"origin_{self._kind}")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        sub = data.get(f"origin_{self._kind}_attrs", {})
        return {
            ATTR_DIRECT_MAISON: sub.get(ATTR_DIRECT_MAISON, 0.0),
            ATTR_VIA_BATTERIE: sub.get(ATTR_VIA_BATTERIE, 0.0),
            "logic_version": data.get("logic_version", LOGIC_VERSION),
        }


class HubEnergieCostDetailSensor(HubEnergieSensor):
    """Daily cost with per-slot attributes — the main sensor the card reads."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "€"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_should_poll = False

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_cost_detail"
        self._attr_name = "Coût du jour"
        self._attr_device_info = _device_cost(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value("cost_total")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        cbs = data.get("cost_by_slot")
        attrs: dict[str, Any] = {
            "logic_version": data.get("logic_version", LOGIC_VERSION),
            "abonnement_eur": data.get("abonnement_eur", 0.0),
            "offer": data.get("offer"),
            "contract_power": data.get("contract_power"),
            "tariff_fetched_at": data.get("tariff_fetched_at"),
            "current_slot": data.get("current_slot"),
            "today_color": data.get("today_color"),
            "tomorrow_color": data.get("tomorrow_color"),
            "supplier": data.get("supplier"),
            "pricing_structure": data.get("pricing_structure"),
            "reinjection_cause": data.get("reinjection_cause"),
            "reinjection_confidence": data.get("reinjection_confidence"),
            "export_power_w": data.get("export_power_w"),
            "grid_power_signed_w": data.get("grid_power_signed_w"),
            "solar_power_w": data.get("solar_power_w"),
            "solar_estimate_power_w": data.get("solar_estimate_power_w"),
            "batt_discharge_power_w": data.get("batt_discharge_power_w"),
            "batt_charge_power_w": data.get("batt_charge_power_w"),
            "load_power_w": data.get("load_power_w"),
            "load_power_inferred": data.get("load_power_inferred"),
            "export_due_to_solar_surplus_kwh": data.get("export_due_to_solar_surplus_kwh", 0.0),
            "export_due_to_battery_full_or_absent_kwh": data.get("export_due_to_battery_full_or_absent_kwh", 0.0),
            "export_due_to_switch_latency_kwh": data.get("export_due_to_switch_latency_kwh", 0.0),
            "export_unattributed_kwh": data.get("export_unattributed_kwh", 0.0),
            "export_opportunity_cost_total_eur": data.get("export_opportunity_cost_total_eur", 0.0),
            "export_opportunity_cost_solar_surplus_eur": data.get(
                "export_opportunity_cost_solar_surplus_eur", 0.0,
            ),
            "export_opportunity_cost_battery_full_or_absent_eur": data.get(
                "export_opportunity_cost_battery_full_or_absent_eur", 0.0,
            ),
            "export_opportunity_cost_switch_latency_eur": data.get(
                "export_opportunity_cost_switch_latency_eur", 0.0,
            ),
            "export_opportunity_cost_unattributed_eur": data.get(
                "export_opportunity_cost_unattributed_eur", 0.0,
            ),
            "usage_batt_charge_method": data.get("usage_batt_charge_method"),
            "batt_charge_meter_kwh": data.get("batt_charge_meter_kwh"),
            "usage_grid_batt_charge_by_slot_kwh": data.get("usage_grid_batt_charge_by_slot_kwh", {}),
            "usage_solar_batt_charge_by_slot_kwh": data.get("usage_solar_batt_charge_by_slot_kwh", {}),
            "eco_solar": data.get("eco_solar", 0.0),
            "eco_batt": data.get("eco_batt", 0.0),
            "battery_total_charge_kwh": data.get("battery_total_charge_kwh"),
            "battery_total_discharge_kwh": data.get("battery_total_discharge_kwh"),
            "solar_estimate_daily_kwh": data.get("solar_estimate_daily_kwh"),
            "solar_export_revenue_eur": data.get("solar_export_revenue_eur"),
        }
        tempo_days = data.get("tempo_days")
        if isinstance(tempo_days, dict):
            attrs["tempo_days"] = tempo_days
        bcard = data.get("battery_card")
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
            for slot in SLOTS:
                slot_cost = _safe_float(cbs.get(slot))
                if slot_cost is not None:
                    attrs[f"{slot}_eur"] = round(slot_cost, 3)
        return attrs


class HubEnergieSavingsSensor(HubEnergieSensor):
    """Daily savings in € (solar or battery)."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "€"
    _attr_state_class = SensorStateClass.MEASUREMENT
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
        self._attr_name = _SAVINGS_LABELS.get(kind, kind.title())
        self._attr_device_info = _device_cost(coordinator)

    @property
    def native_value(self) -> float | None:
        if self._kind == "solar":
            return self._get_value("eco_solar")
        return self._get_value("eco_batt")


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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> str | None:
        data = self.coordinator.data
        if not data:
            return None
        value = data.get(self._info)
        return str(value) if value is not None else None


class HubEnergieRteDataSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Résumé source Tempo (RTE / API / capteur)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:counter"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_rte_data"
        self._attr_name = "Source Tempo"
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> str | None:
        return self.coordinator.tempo_mode

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        c = self.coordinator
        data = c.data or {}
        attrs: dict[str, Any] = {
            "tempo_mode": c.tempo_mode,
            "rte_calendar_fetched_at": data.get("rte_calendar_fetched_at"),
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
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> int | None:
        data = self.coordinator.data
        if not data:
            return None
        td = data.get("tempo_days")
        if not isinstance(td, dict):
            return None
        block = td.get(self._color_key)
        if not isinstance(block, dict):
            return None
        return _safe_int(block.get("remaining"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        td = data.get("tempo_days")
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

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_next_colour_change"
        self._attr_name = "Prochain changement de couleur"
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> datetime | None:
        data = self.coordinator.data
        if not data:
            return None
        raw = data.get("tempo_next_colour_change_at")
        if not raw:
            return None
        return dt_util.parse_datetime(str(raw))


class HubEnergieNextHcStartSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Début de la prochaine plage heures creuses (22:00 Europe/Paris)."""

    _attr_has_entity_name = False
    _attr_should_poll = False
    _attr_icon = "mdi:weather-night"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_tempo_next_hc_start"
        self._attr_name = "hub énergie tempo next hc start"
        self._attr_device_info = _device_energy_balance(coordinator)

    @property
    def native_value(self) -> datetime | None:
        data = self.coordinator.data
        if not data:
            return None
        raw = data.get("tempo_next_hc_start_at")
        if not raw:
            return None
        return dt_util.parse_datetime(str(raw))


class HubEnergieHealthSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Simple health: ok / warning."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_health"
        self._attr_name = "État général"
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> str:
        data = self.coordinator.data
        c = self.coordinator
        if c.is_edf and c.tariff_offer == TARIFF_OFFER_TEMPO:
            if c.tempo_mode == TEMPO_MODE_RTE and not c._edf.calendar_rows:  # noqa: SLF001
                return "warning"
        if data and not data.get("current_slot"):
            return "warning"
        return "ok"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        return {
            "paris_day": data.get("day"),
            "current_slot": data.get("current_slot"),
            "logic_version": data.get("logic_version", LOGIC_VERSION),
        }


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
            "grid_power_signed_w": data.get("grid_power_signed_w"),
            "solar_power_w": data.get("solar_power_w"),
            "batt_discharge_power_w": data.get("batt_discharge_power_w"),
            "batt_charge_power_w": data.get("batt_charge_power_w"),
            "load_power_w": data.get("load_power_w"),
            "load_power_inferred": data.get("load_power_inferred"),
            "logic_version": data.get("logic_version", LOGIC_VERSION),
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
        self._attr_device_info = _device_diagnostics(coordinator)

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
        self._attr_device_info = _device_diagnostics(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._key)


class HubEnergieDiagCostSensor(HubEnergieSensor):
    """Diagnostic opportunity cost (€) sensors."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "€"
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
        self._attr_device_info = _device_diagnostics(coordinator)

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


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensors — Battery per-system
# ═══════════════════════════════════════════════════════════════════════════════

# Short entity names (device name is prepended when has_entity_name is True).
_BATTERY_ENTITY_LABELS: dict[str, str] = {
    "charge_energy": "Énergie de charge",
    "discharge_energy": "Énergie de décharge",
    "power_net": "Puissance nette",
    "soc": "État de charge",
    "stored_energy": "Énergie stockée",
    "available_energy": "Énergie disponible",
}

_BATTERY_SUMMARY_LABELS: dict[str, str] = {
    "total_charge_energy": "Énergie de charge (total)",
    "total_discharge_energy": "Énergie de décharge (total)",
    "total_net_power": "Puissance nette (total)",
}

_BATTERY_METRIC_CONFIG: dict[str, dict[str, Any]] = {
    "charge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "charge_kwh",
        "icon": "mdi:battery-charging",
    },
    "discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "discharge_kwh",
        "icon": "mdi:battery-arrow-down",
    },
    "power_net": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "power_net",
        "icon": "mdi:flash",
    },
    "soc": {
        "device_class": SensorDeviceClass.BATTERY,
        "unit": "%",
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "soc",
        "icon": "mdi:battery",
    },
    "stored_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "stored_energy_kwh",
        "icon": "mdi:battery-heart-variant",
    },
    "available_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "available_energy_kwh",
        "icon": "mdi:battery-check",
    },
}


class HubEnergieBatterySensor(HubEnergieSensor):
    """Per-battery metric sensor."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        batt_id: str,
        batt_name: str,
        metric: str,
    ) -> None:
        super().__init__(coordinator)
        self._batt_id = batt_id
        self._metric = metric
        cfg = _BATTERY_METRIC_CONFIG[metric]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_battery_{batt_id}_{metric}"
        self._attr_name = _BATTERY_ENTITY_LABELS.get(
            metric, metric.replace("_", " ").title()
        )
        self._attr_device_class = cfg["device_class"]
        self._attr_native_unit_of_measurement = cfg["unit"]
        self._attr_state_class = cfg["state_class"]
        self._attr_icon = cfg.get("icon")
        self._attr_device_info = _device_battery(coordinator, batt_id, batt_name)

    def _find_battery_snapshot(self) -> dict[str, Any] | None:
        data = self._data()
        if not data:
            return None
        battery_systems = data.get("battery_systems")
        if not isinstance(battery_systems, list):
            return None
        for batt in battery_systems:
            if batt.get("id") == self._batt_id:
                return batt
        return None

    @property
    def native_value(self) -> float | None:
        snap = self._find_battery_snapshot()
        if snap is None:
            return None
        return _safe_float(snap.get(self._snapshot_key))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        snap = self._find_battery_snapshot()
        if snap is None:
            return {}
        attrs: dict[str, Any] = {"battery_id": self._batt_id}
        eff = snap.get("efficiency")
        if eff is not None:
            attrs["efficiency"] = eff
        return attrs


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensors — Battery summary (aggregated)
# ═══════════════════════════════════════════════════════════════════════════════

_BATTERY_SUMMARY_CONFIG: dict[str, dict[str, Any]] = {
    "total_charge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "battery_total_charge_kwh",
        "icon": "mdi:battery-charging",
    },
    "total_discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "battery_total_discharge_kwh",
        "icon": "mdi:battery-arrow-down",
    },
    "total_net_power": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "battery_total_net_power_w",
        "icon": "mdi:flash",
    },
}


class HubEnergieBatterySummarySensor(HubEnergieSensor):
    """Aggregated battery metric across all battery systems."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HubEnergieCoordinator,
        entry: ConfigEntry,
        metric: str,
    ) -> None:
        super().__init__(coordinator)
        cfg = _BATTERY_SUMMARY_CONFIG[metric]
        self._snapshot_key = cfg["snapshot_key"]
        self._attr_unique_id = f"{entry.unique_id}_battery_summary_{metric}"
        self._attr_name = _BATTERY_SUMMARY_LABELS.get(
            metric, metric.replace("_", " ").title()
        )
        self._attr_device_class = cfg["device_class"]
        self._attr_native_unit_of_measurement = cfg["unit"]
        self._attr_state_class = cfg["state_class"]
        self._attr_icon = cfg.get("icon")
        self._attr_device_info = _device_battery_summary(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(self._snapshot_key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        count = len(data.get("battery_systems", []))
        return {"battery_count": count}


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensors — Solar estimation
# ═══════════════════════════════════════════════════════════════════════════════

_SOLAR_ESTIMATE_CONFIG: dict[str, dict[str, Any]] = {
    "current_power_estimate": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": "solar_estimate_power_w",
        "icon": "mdi:solar-power",
    },
    "daily_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "solar_estimate_daily_kwh",
        "icon": "mdi:solar-power-variant",
    },
    "yearly_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": "solar_estimate_yearly_kwh",
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


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensor — Solar export revenue
# ═══════════════════════════════════════════════════════════════════════════════


class HubEnergieSolarRevenueSensor(HubEnergieSensor):
    """Solar export revenue (€) when a resale contract is configured."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "€"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_should_poll = False
    _attr_icon = "mdi:cash-plus"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_solar_export_revenue"
        self._attr_name = "Revenus d'injection"
        self._attr_device_info = _device_cost(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value("solar_export_revenue_eur")
