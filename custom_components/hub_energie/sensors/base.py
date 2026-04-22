"""Shared sensor base class and helpers for Hub Énergie."""

from __future__ import annotations

from collections.abc import Mapping
import math
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from ..const.config_keys import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATTERY_SYSTEMS,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_SOLAR_POWER_SENSOR,
)
from ..const.core import DOMAIN
from ..const.energy_data import (
    DATA_INPUT_MISSING_ENTITY_IDS,
    DATA_INPUT_STATUS,
    DATA_INPUT_STATUS_REASONS,
    DATA_INPUT_UNAVAILABLE_ENTITY_IDS,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    SOURCE_BATT_CHARGE,
    SOURCE_BATT_DISCHARGE,
    SOURCE_GRID,
    SOURCE_SOLAR,
)
from ..const.tariff_edf import (
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    SLOTS,
    SLOT_UNKNOWN,
    SUPPLIER_EDF,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
)
from ..coordinator import HubEnergieCoordinator
from ..coordinator.types import EnergyData

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
