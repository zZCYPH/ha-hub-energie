"""Read-only view of integration config from a config entry (no I/O)."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast

from ..const.config_keys import (
    CONF_BATTERY_SYSTEMS,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_RESALE_CONTRACT,
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
)
from ..const.tariff_edf import (
    CONF_PHASE_TYPE,
    CONF_PRICING_STRUCTURE,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    CONF_TEMPO_MODE,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
)


def entry_supplier(entry_data: Mapping[str, Any]) -> str:
    return cast(str, entry_data.get(CONF_SUPPLIER, SUPPLIER_EDF))


def entry_is_edf(entry_data: Mapping[str, Any]) -> bool:
    return entry_supplier(entry_data) == SUPPLIER_EDF


def entry_tariff_offer(entry_data: Mapping[str, Any], entry_options: Mapping[str, Any]) -> str:
    return cast(
        str,
        entry_options.get(
            CONF_TARIFF_OFFER,
            entry_data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
        ),
    )


def entry_tempo_mode(entry_data: Mapping[str, Any]) -> str:
    return cast(str, entry_data.get(CONF_TEMPO_MODE, TEMPO_MODE_SENSOR))


def tempo_rte_calendar_ready(
    *,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    calendar_rows: Any,
) -> bool:
    """True when RTE calendar rows exist if Tempo + RTE mode requires them."""
    if not is_edf or tariff_offer != TARIFF_OFFER_TEMPO:
        return True
    if tempo_mode != TEMPO_MODE_RTE:
        return True
    return bool(calendar_rows)


def entry_phase_type(entry_data: Mapping[str, Any]) -> str:
    return cast(str, entry_data.get(CONF_PHASE_TYPE, "mono"))


def entry_pricing_structure(entry_data: Mapping[str, Any]) -> str:
    return cast(str, entry_data.get(CONF_PRICING_STRUCTURE, "flat"))


def entry_battery_systems(entry_data: Mapping[str, Any]) -> list[dict[str, Any]]:
    return cast(list, entry_data.get(CONF_BATTERY_SYSTEMS, []))


def entry_has_batteries(entry_data: Mapping[str, Any]) -> bool:
    return bool(entry_data.get(CONF_HAS_BATTERIES)) and bool(entry_battery_systems(entry_data))


def entry_has_solar(entry_data: Mapping[str, Any]) -> bool:
    return bool(entry_data.get(CONF_HAS_SOLAR))


def entry_solar_estimation_enabled(entry_data: Mapping[str, Any]) -> bool:
    return bool(entry_data.get(CONF_SOLAR_ESTIMATION_ENABLED))


def entry_solar_resale_configured(entry_data: Mapping[str, Any]) -> bool:
    return bool(entry_data.get(CONF_SOLAR_RESALE_CONTRACT))


def entry_grid_power_sign_mode(
    entry_data: Mapping[str, Any],
    entry_options: Mapping[str, Any],
) -> str:
    return cast(
        str,
        entry_options.get(
            CONF_GRID_POWER_SIGN_MODE,
            entry_data.get(CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE),
        ),
    )
