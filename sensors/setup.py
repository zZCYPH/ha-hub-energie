"""Sensor platform setup: entity registration order must stay stable."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import (
    CONF_BATT_NAME,
    CONF_BATTERY_SYSTEMS,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_RESALE_CONTRACT,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    DOMAIN,
    SLOT_UNKNOWN,
    SOURCE_BATT_CHARGE,
    SOURCE_BATT_DISCHARGE,
    SOURCE_GRID,
    SOURCE_SOLAR,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
)
from ..coordinator import HubEnergieCoordinator
from .base import _visible_slots_for_offer
from .battery import HubEnergieBatterySensor, HubEnergieBatterySummarySensor
from .cost import HubEnergieCostDetailSensor, HubEnergieSavingsSensor
from .diagnostics import (
    HubEnergieConfigOverviewSensor,
    HubEnergieDiagCostSensor,
    HubEnergieDiagEnergySensor,
    HubEnergieDiagInfoSensor,
    HubEnergieDiagPowerSensor,
    HubEnergieDiagStalenessSensor,
    HubEnergieDiagUnknownBucketSensor,
    HubEnergieHealthSensor,
)
from .energy import (
    HubEnergieMaisonSensor,
    HubEnergieOriginSensor,
    HubEnergieSlotSensor,
    HubEnergieSsotTotalSensor,
    HubEnergieTodayEnergySensor,
    HubEnergieUsageSensor,
)
from .power import HubEnergiePowerFlowSensor
from .solar import HubEnergieSolarEstimateSensor, HubEnergieSolarRevenueSensor
from .tempo import (
    HubEnergieInfoSensor,
    HubEnergieNextColourChangeSensor,
    HubEnergieNextHcStartSensor,
    HubEnergieQuotaDaySensor,
    HubEnergieRteDataSensor,
)


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
