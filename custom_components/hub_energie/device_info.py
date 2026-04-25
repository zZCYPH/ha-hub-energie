"""Shared DeviceInfo factories for sensor and binary_sensor platforms."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo

from .const import (
    DOMAIN,
    INTEGRATION_TITLE,
    SOURCE_GRID,
    SOURCE_SOLAR,
    scoped_device_name,
)
from .site_slug import site_slug_for_entry
from .coordinator import HubEnergieCoordinator

__all__ = (
    "_battery_device_display_name",
    "_device_battery",
    "_device_battery_summary",
    "_device_cost",
    "_device_diagnostics",
    "_device_energy_balance",
    "_device_frontend",
    "_device_for_diagnostic_metric_key",
    "_device_for_power_flow_kind",
    "_device_for_slot_source",
    "_device_for_ssot_today_kind",
    "_device_for_usage_flow_key",
    "_device_grid_config",
    "_device_offer",
    "_device_site",
    "_device_solar_config",
)


def _device_site(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    """Per-entry site / installation (Tempo info, connectivity, site slug context)."""
    entry = coordinator.entry
    slug = site_slug_for_entry(entry)
    label = slug if slug else "Site"
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_site")},
        name=scoped_device_name(label),
        manufacturer=INTEGRATION_TITLE,
        model="Site & installation",
    )


def _device_offer(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_offer")},
        name=scoped_device_name("Offre"),
        manufacturer=INTEGRATION_TITLE,
        model="Tariff & contract",
    )


def _device_grid_config(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_grid_config")},
        name=scoped_device_name("Réseau"),
        manufacturer=INTEGRATION_TITLE,
        model="Grid configuration",
    )


def _device_solar_config(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_solar_config")},
        name=scoped_device_name("Solaire"),
        manufacturer=INTEGRATION_TITLE,
        model="Solar configuration",
    )


def _battery_device_display_name(batt_id: str, batt_name: str) -> str:
    """Short device title: user label, else id (readable lists / dashboards)."""
    label = (batt_name or "").strip()
    if label:
        return scoped_device_name(label)
    if batt_id:
        return scoped_device_name(str(batt_id))
    return scoped_device_name("Batterie")


def _device_battery(
    coordinator: HubEnergieCoordinator, batt_id: str, batt_name: str,
) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_battery_{batt_id}")},
        name=_battery_device_display_name(batt_id, batt_name),
        manufacturer=INTEGRATION_TITLE,
        model="Battery system",
    )


def _device_battery_summary(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_battery_summary")},
        name=scoped_device_name("Toutes batteries"),
        manufacturer=INTEGRATION_TITLE,
        model="Battery aggregates",
    )


def _device_energy_balance(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_energy_balance")},
        name=scoped_device_name("Bilan énergétique"),
        manufacturer=INTEGRATION_TITLE,
        model="Energy flows (kWh)",
    )


def _device_cost(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_cost")},
        name=scoped_device_name("Coûts"),
        manufacturer=INTEGRATION_TITLE,
        model="Monetary (€)",
    )


def _device_frontend(coordinator: HubEnergieCoordinator) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_frontend")},
        name=scoped_device_name("Frontend"),
        manufacturer=INTEGRATION_TITLE,
        model="Lovelace payloads",
    )


def _device_diagnostics(
    coordinator: HubEnergieCoordinator,
    *,
    model: str = "Reinjection & export diagnostics",
) -> DeviceInfo:
    return DeviceInfo(
        entry_type=DeviceEntryType.SERVICE,
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_diagnostics")},
        name=scoped_device_name("Diagnostics"),
        manufacturer=INTEGRATION_TITLE,
        model=model,
    )


def _device_for_slot_source(coordinator: HubEnergieCoordinator, source: str) -> DeviceInfo:
    """Map daily slot kWh source to the physical/logical device (grid / solar / batteries)."""
    if source == SOURCE_GRID:
        return _device_grid_config(coordinator)
    if source == SOURCE_SOLAR:
        return _device_solar_config(coordinator)
    return _device_battery_summary(coordinator)


def _device_for_ssot_today_kind(coordinator: HubEnergieCoordinator, kind: str) -> DeviceInfo:
    """SSOT totals and 'today' sensors: grid / solar+export / battery aggregates."""
    if kind == "grid":
        return _device_grid_config(coordinator)
    if kind in ("solar", "export"):
        return _device_solar_config(coordinator)
    return _device_battery_summary(coordinator)


def _device_for_power_flow_kind(coordinator: HubEnergieCoordinator, kind: str) -> DeviceInfo:
    """Real-time power flow sensors."""
    if kind == "home":
        return _device_energy_balance(coordinator)
    if kind in ("grid_import", "grid_to_home"):
        return _device_grid_config(coordinator)
    if kind in (
        "solar_production",
        "solar_to_home",
        "solar_to_battery",
        "solar_export",
    ):
        return _device_solar_config(coordinator)
    return _device_battery_summary(coordinator)


def _device_for_usage_flow_key(coordinator: HubEnergieCoordinator, key: str) -> DeviceInfo:
    """Usage kWh flows (grid / solar / battery→home)."""
    if key in ("grid_direct", "grid_batt_charge"):
        return _device_grid_config(coordinator)
    if key in ("solar_direct", "solar_batt_charge"):
        return _device_solar_config(coordinator)
    return _device_battery_summary(coordinator)


def _device_for_diagnostic_metric_key(
    coordinator: HubEnergieCoordinator, key: str,
) -> DeviceInfo:
    """Split export-related diagnostics onto solar vs battery devices when unambiguous."""
    if key in (
        "export_power_w",
        "export_due_to_solar_surplus_kwh",
        "export_opportunity_cost_solar_surplus_eur",
    ):
        return _device_solar_config(coordinator)
    if key in (
        "export_due_to_battery_full_or_absent_kwh",
        "export_opportunity_cost_battery_full_or_absent_eur",
    ):
        return _device_battery_summary(coordinator)
    return _device_diagnostics(coordinator)
