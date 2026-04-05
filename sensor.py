"""Hub Énergie sensors."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
import math
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CURRENCY_EURO, UnitOfEnergy, UnitOfPower, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_DIRECT_MAISON,
    ATTR_VIA_BATTERIE,
    CONF_BATT_NAME,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATTERY_SYSTEMS,
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_CONTRACT_POWER,
    CONF_CURRENT_SLOT_SENSOR,
    CONF_GRID_POWER_PHASES,
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
    DATA_ABONNEMENT_EUR,
    DATA_BATT_CHARGE_METER_KWH,
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_BATTERY_AVAILABLE_ENERGY_KWH,
    DATA_BATTERY_CARD,
    DATA_BATTERY_CHARGE_KWH,
    DATA_BATTERY_DISCHARGE_KWH,
    DATA_BATTERY_DISCHARGE_POWER_W,
    DATA_BATTERY_EFFICIENCY,
    DATA_BATTERY_POWER_NET,
    DATA_BATTERY_SOC,
    DATA_BATTERY_STORED_ENERGY_KWH,
    DATA_BATTERY_TO_HOME_POWER_W,
    DATA_BATTERY_TOTAL_CHARGE_KWH,
    DATA_BATTERY_TOTAL_DISCHARGE_KWH,
    DATA_BATTERY_TOTAL_NET_POWER_W,
    DATA_CONTRACT_POWER,
    DATA_COST_BY_SLOT,
    DATA_COST_TOTAL,
    DATA_CURRENT_SLOT,
    DATA_DAY,
    DATA_ECO_BATT,
    DATA_ECO_SOLAR,
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
    DATA_GRID_IMPORT_POWER_W,
    DATA_GRID_POWER_SIGNED_W,
    DATA_GRID_TO_BATTERY_POWER_W,
    DATA_GRID_TO_HOME_POWER_W,
    DATA_HOME_POWER_W,
    DATA_LOAD_POWER_INFERRED,
    DATA_LOAD_POWER_W,
    DATA_LOGIC_VERSION,
    DATA_MAISON_BY_SLOT_KWH,
    DATA_OFFER,
    DATA_ORIGIN_GRID,
    DATA_ORIGIN_GRID_ATTRS,
    DATA_ORIGIN_SOLAR,
    DATA_ORIGIN_SOLAR_ATTRS,
    DATA_POWER_GRAPH_ENTITY_MAP,
    DATA_PRICING_STRUCTURE,
    DATA_REINJECTION_CAUSE,
    DATA_REINJECTION_CONFIDENCE,
    DATA_RTE_CALENDAR_FETCHED_AT,
    DATA_SOLAR_ESTIMATE_DAILY_KWH,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_SOLAR_ESTIMATE_YEARLY_KWH,
    DATA_SOLAR_EXPORT_POWER_W,
    DATA_SOLAR_EXPORT_REVENUE_EUR,
    DATA_SOLAR_POWER_W,
    DATA_SOLAR_PRODUCTION_POWER_W,
    DATA_SOLAR_TO_BATTERY_POWER_W,
    DATA_SOLAR_TO_HOME_POWER_W,
    DATA_SUPPLIER,
    DATA_TARIFF_FETCHED_AT,
    DATA_TEMPO_DAYS,
    DATA_TEMPO_NEXT_COLOUR_CHANGE_AT,
    DATA_TEMPO_NEXT_HC_START_AT,
    DATA_TODAY_COLOR,
    DATA_TOMORROW_COLOR,
    DATA_USAGE_BATT_CHARGE_METHOD,
    DATA_USAGE_BATT_HOME,
    DATA_USAGE_GRID_BATT_CHARGE,
    DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_GRID_DIRECT,
    DATA_USAGE_SOLAR_BATT_CHARGE,
    DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_SOLAR_DIRECT,
    ATTRIBUTION_SLOTS,
    DATA_DATA_QUALITY,
    DATA_INPUT_MISSING_ENTITY_IDS,
    DATA_INPUT_STATUS,
    DATA_INPUT_STATUS_REASONS,
    DATA_INPUT_UNAVAILABLE_ENTITY_IDS,
    DATA_DELTA_DISCARDS,
    DATA_DELTA_LAST_REJECTION,
    DATA_DELTA_TELEMETRY,
    DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY,
    DATA_SECONDS_SINCE_LAST_APPLIED_DELTA,
    DATA_TRUST_CAUSE,
    DATA_TRUST_CAUSE_CODE,
    DATA_TRUST_LEVEL,
    DOMAIN,
    INPUT_STATUS_DEGRADED,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    INPUT_STATUS_OK,
    LOGIC_VERSION,
    scoped_device_name,
    SLOTS,
    SLOT_UNKNOWN,
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
from .coordinator import EnergyData, HubEnergieCoordinator
from .device_info import (
    _device_battery,
    _device_battery_summary,
    _device_cost,
    _device_diagnostics,
    _device_energy_balance,
    _device_for_diagnostic_metric_key,
    _device_for_power_flow_kind,
    _device_for_slot_source,
    _device_for_ssot_today_kind,
    _device_for_usage_flow_key,
    _device_grid_config,
    _device_offer,
    _device_solar_config,
)
from .time.paris_time import ParisTime
from .utils.config_display import (
    config_overview_attributes as _config_overview_attributes,
    redact_entry_data_for_display as _redact_entry_data_for_display,
)

_MAX_INPUT_ENTITY_ATTRS = 50


def _input_status_blocks_cost_and_grid(data: Mapping[str, Any] | None) -> bool:
    """When grid import is unreadable or trust is inconsistent, hide cost/grid-derived numbers."""
    if not data:
        return False
    st = data.get(DATA_INPUT_STATUS)
    return st in (INPUT_STATUS_NO_INPUT, INPUT_STATUS_ERROR)


def _input_status_sensor_attributes(
    data: Mapping[str, Any] | None,
    *,
    cap_entity_lists: bool = False,
) -> dict[str, Any]:
    if not data:
        return {}
    missing = data.get(DATA_INPUT_MISSING_ENTITY_IDS)
    unavail = data.get(DATA_INPUT_UNAVAILABLE_ENTITY_IDS)
    out: dict[str, Any] = {
        DATA_INPUT_STATUS: data.get(DATA_INPUT_STATUS),
        DATA_INPUT_STATUS_REASONS: data.get(DATA_INPUT_STATUS_REASONS),
    }
    if isinstance(missing, list) and isinstance(unavail, list):
        if cap_entity_lists and (
            len(missing) > _MAX_INPUT_ENTITY_ATTRS
            or len(unavail) > _MAX_INPUT_ENTITY_ATTRS
        ):
            out[DATA_INPUT_MISSING_ENTITY_IDS] = missing[:_MAX_INPUT_ENTITY_ATTRS]
            out[DATA_INPUT_UNAVAILABLE_ENTITY_IDS] = unavail[:_MAX_INPUT_ENTITY_ATTRS]
            out["input_entity_ids_truncated"] = True
            out["input_missing_entity_ids_total"] = len(missing)
            out["input_unavailable_entity_ids_total"] = len(unavail)
        else:
            out[DATA_INPUT_MISSING_ENTITY_IDS] = list(missing)
            out[DATA_INPUT_UNAVAILABLE_ENTITY_IDS] = list(unavail)
    return out


class HubEnergieSensor(CoordinatorEntity[HubEnergieCoordinator], SensorEntity):
    """Common safe access helpers for Hub Energie sensors."""

    _attr_should_poll = False

    def _data(self) -> EnergyData | None:
        return self.coordinator.snapshot_data()

    def _get_value(self, key: str) -> float | None:
        return self.coordinator.get_numeric_value(key)

    def _get_nested_value(self, section_key: str, key: str) -> float | None:
        return self.coordinator.get_nested_numeric_value(section_key, key)

    def _get_section(self, key: str) -> dict[str, Any] | None:
        return self.coordinator.get_mapping_value(key)


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


def _slot_label_fr(slot: str) -> str:
    """Compact French label for a tariff slot (Tempo / HPHC)."""
    if slot == SLOT_UNKNOWN:
        return "Indéterminé"
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
    offer = entry.options.get(
        CONF_TARIFF_OFFER,
        entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
    )
    if offer == TARIFF_OFFER_BASE:
        return {"bleu_hp"}
    if offer == TARIFF_OFFER_HPHC:
        return {"bleu_hc", "bleu_hp"}
    return set(SLOTS)


# ═══════════════════════════════════════════════════════════════════════════════
# SSOT totals / today / flow sensors
# ═══════════════════════════════════════════════════════════════════════════════

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

_FLOW_POWER_CONFIG: dict[str, dict[str, str]] = {
    "home": {"snapshot_key": DATA_HOME_POWER_W, "name": "Puissance maison"},
    "grid_import": {"snapshot_key": DATA_GRID_IMPORT_POWER_W, "name": "Puissance import réseau"},
    "solar_production": {"snapshot_key": DATA_SOLAR_PRODUCTION_POWER_W, "name": "Puissance production solaire"},
    "battery_discharge": {"snapshot_key": DATA_BATTERY_DISCHARGE_POWER_W, "name": "Puissance décharge batterie"},
    "solar_to_home": {"snapshot_key": DATA_SOLAR_TO_HOME_POWER_W, "name": "Puissance solaire vers maison"},
    "battery_to_home": {"snapshot_key": DATA_BATTERY_TO_HOME_POWER_W, "name": "Puissance batterie vers maison"},
    "grid_to_home": {"snapshot_key": DATA_GRID_TO_HOME_POWER_W, "name": "Puissance réseau vers maison"},
    "solar_to_battery": {"snapshot_key": DATA_SOLAR_TO_BATTERY_POWER_W, "name": "Puissance solaire vers batterie"},
    "grid_to_battery": {"snapshot_key": DATA_GRID_TO_BATTERY_POWER_W, "name": "Puissance réseau vers batterie"},
    "solar_export": {"snapshot_key": DATA_SOLAR_EXPORT_POWER_W, "name": "Puissance export solaire"},
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
        self._attr_device_info = _device_for_power_flow_kind(coordinator, kind)

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
    offer_eff = entry.options.get(
        CONF_TARIFF_OFFER,
        entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
    )
    is_tempo = is_edf and offer_eff == TARIFF_OFFER_TEMPO
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

    # ── Per-slot kWh + maison (Paris day, optional LTS via last_reset) ─
    visible_slots = _visible_slots_for_offer(entry)
    slots_for_entities = sorted(
        visible_slots | {SLOT_UNKNOWN},
        key=lambda s: (1 if s == SLOT_UNKNOWN else 0, s),
    )
    for slot in slots_for_entities:
        slot_enabled_default = slot in visible_slots and slot != SLOT_UNKNOWN
        entities.append(
            HubEnergieSlotSensor(
                coordinator, entry, SOURCE_GRID, slot,
                enabled_default=slot_enabled_default,
            )
        )
        if has_solar:
            entities.append(
                HubEnergieSlotSensor(
                    coordinator, entry, SOURCE_SOLAR, slot,
                    enabled_default=slot_enabled_default,
                )
            )
        if has_batteries:
            entities.extend(
                (
                    HubEnergieSlotSensor(
                        coordinator, entry, SOURCE_BATT_DISCHARGE, slot,
                        enabled_default=slot_enabled_default,
                    ),
                    HubEnergieSlotSensor(
                        coordinator, entry, SOURCE_BATT_CHARGE, slot,
                        enabled_default=slot_enabled_default,
                    ),
                )
            )
        entities.append(
            HubEnergieMaisonSensor(
                coordinator, entry, slot,
                enabled_default=slot_enabled_default,
            )
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
        HubEnergieDiagUnknownBucketSensor(coordinator, entry),
        HubEnergieDiagStalenessSensor(coordinator, entry),
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


def _integration_home_power_entity_id(hass: HomeAssistant, entry: ConfigEntry) -> str | None:
    """Entity ID of Hub Énergie's Puissance maison sensor (unique_id …_home_power_w), if registered."""
    unique_id = f"{entry.unique_id}_home_power_w"
    return er.async_get(hass).async_get_entity_id("sensor", DOMAIN, unique_id)


def _build_power_graph_entity_map(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Entity IDs backing live power (same sources as coordinator) for Lovelace history charts."""
    data, opts = entry.data, entry.options

    def pick(key: str) -> str | None:
        raw = opts.get(key) or data.get(key)
        if raw is None or raw == "":
            return None
        s = str(raw).strip()
        return s or None

    grid_entities: list[str] = []
    phases = data.get(CONF_GRID_POWER_PHASES)
    if isinstance(phases, list) and phases:
        for ph in phases:
            if isinstance(ph, dict):
                eid = ph.get("entity_id")
                if eid:
                    grid_entities.append(str(eid).strip())
    else:
        g = pick(CONF_GRID_POWER_SENSOR)
        if g:
            grid_entities.append(g)

    solar_entity = pick(CONF_SOLAR_POWER_SENSOR) if data.get(CONF_HAS_SOLAR) else None
    load_entity = pick(CONF_LOAD_POWER_SENSOR)
    if load_entity is None:
        load_entity = _integration_home_power_entity_id(hass, entry)

    batteries: list[dict[str, Any]] = []
    if data.get(CONF_HAS_BATTERIES):
        for batt in data.get(CONF_BATTERY_SYSTEMS, []) or []:
            if not isinstance(batt, dict):
                continue
            net_raw = batt.get(CONF_BATT_POWER_NET)
            net = str(net_raw).strip() if net_raw else None
            if net:
                sign = batt.get(CONF_BATT_POWER_NET_SIGN, BATT_SIGN_POSITIVE_DISCHARGE)
                if sign not in (BATT_SIGN_POSITIVE_DISCHARGE, BATT_SIGN_POSITIVE_CHARGE):
                    sign = BATT_SIGN_POSITIVE_DISCHARGE
                batteries.append({"mode": "net", "entity": net, "net_sign": sign})
                continue
            pin_raw = batt.get(CONF_BATT_POWER_IN)
            pout_raw = batt.get(CONF_BATT_POWER_OUT)
            pin = str(pin_raw).strip() if pin_raw else None
            pout = str(pout_raw).strip() if pout_raw else None
            if pin or pout:
                batteries.append({"mode": "in_out", "in": pin, "out": pout})

    return {
        "grid_entities": grid_entities,
        "solar_entity": solar_entity,
        "load_entity": load_entity,
        "batteries": batteries,
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
        "snapshot_key": DATA_BATTERY_CHARGE_KWH,
        "icon": "mdi:battery-charging",
    },
    "discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_DISCHARGE_KWH,
        "icon": "mdi:battery-arrow-down",
    },
    "power_net": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_POWER_NET,
        "icon": "mdi:flash",
    },
    "soc": {
        "device_class": SensorDeviceClass.BATTERY,
        "unit": "%",
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_SOC,
        "icon": "mdi:battery",
    },
    "stored_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_STORED_ENERGY_KWH,
        "icon": "mdi:battery-heart-variant",
    },
    "available_energy": {
        "device_class": SensorDeviceClass.ENERGY_STORAGE,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_AVAILABLE_ENERGY_KWH,
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
        for batt in self.coordinator.get_battery_systems_data():
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
        eff = snap.get(DATA_BATTERY_EFFICIENCY)
        if eff is not None:
            attrs[DATA_BATTERY_EFFICIENCY] = eff
        return attrs


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensors — Battery summary (aggregated)
# ═══════════════════════════════════════════════════════════════════════════════

_BATTERY_SUMMARY_CONFIG: dict[str, dict[str, Any]] = {
    "total_charge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_TOTAL_CHARGE_KWH,
        "icon": "mdi:battery-charging",
    },
    "total_discharge_energy": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_BATTERY_TOTAL_DISCHARGE_KWH,
        "icon": "mdi:battery-arrow-down",
    },
    "total_net_power": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_BATTERY_TOTAL_NET_POWER_W,
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
        count = len(self.coordinator.get_battery_systems_data())
        return {"battery_count": count}


# ═══════════════════════════════════════════════════════════════════════════════
# NEW sensors — Solar estimation
# ═══════════════════════════════════════════════════════════════════════════════

_SOLAR_ESTIMATE_CONFIG: dict[str, dict[str, Any]] = {
    "current_power_estimate": {
        "device_class": SensorDeviceClass.POWER,
        "unit": UnitOfPower.WATT,
        "state_class": SensorStateClass.MEASUREMENT,
        "snapshot_key": DATA_SOLAR_ESTIMATE_POWER_W,
        "icon": "mdi:solar-power",
    },
    "daily_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_SOLAR_ESTIMATE_DAILY_KWH,
        "icon": "mdi:solar-power-variant",
    },
    "yearly_energy_estimate": {
        "device_class": SensorDeviceClass.ENERGY,
        "unit": UnitOfEnergy.KILO_WATT_HOUR,
        "state_class": SensorStateClass.TOTAL,
        "snapshot_key": DATA_SOLAR_ESTIMATE_YEARLY_KWH,
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
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = CURRENCY_EURO
    _attr_state_class = SensorStateClass.TOTAL
    _attr_should_poll = False
    _attr_icon = "mdi:cash-plus"

    def __init__(self, coordinator: HubEnergieCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.unique_id}_solar_export_revenue"
        self._attr_name = "Revenus d'injection"
        self._attr_device_info = _device_solar_config(coordinator)

    @property
    def native_value(self) -> float | None:
        return self._get_value(DATA_SOLAR_EXPORT_REVENUE_EUR)
