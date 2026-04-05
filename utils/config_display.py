"""Safe display of config entry data for diagnostics attributes (no raw secrets)."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry

from ..const import (
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
    OPT_TARIFF_FETCHED_AT,
    REINJECTION_OPTION_KEYS,
)

__all__ = ("config_overview_attributes", "redact_entry_data_for_display")


def redact_entry_data_for_display(data: dict[str, Any]) -> dict[str, Any]:
    out = dict(data)
    if out.get(CONF_RTE_CLIENT_SECRET):
        out[CONF_RTE_CLIENT_SECRET] = "(stored)"
    cid = out.get(CONF_RTE_CLIENT_ID)
    if cid:
        s = str(cid)
        out[CONF_RTE_CLIENT_ID] = f"{s[:4]}…{s[-4:]}" if len(s) > 8 else "(stored)"
    return out


def config_overview_attributes(entry: ConfigEntry) -> dict[str, Any]:
    data = redact_entry_data_for_display(dict(entry.data))
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
    }
