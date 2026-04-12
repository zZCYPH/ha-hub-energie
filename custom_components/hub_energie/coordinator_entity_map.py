"""Config-derived entity ids for energy meters and power sensors."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast

from .const.config_keys import (
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_LOAD_POWER_SENSOR,
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_POWER_SENSOR,
    PHASE_TRI,
    SYNTHETIC_ENTITY_GRID_EXPORT_SUM,
    SYNTHETIC_ENTITY_GRID_IMPORT_SUM,
    TRI_GRID_ENERGY_PER_PHASE,
)
from .const.energy_data import SOURCE_GRID, SOURCE_GRID_EXPORT, SOURCE_SOLAR
from .const.tariff_edf import CONF_PHASE_TYPE
from .utils.grid_phases import ordered_phase_entity_ids


def read_energy_kwh_for_persistence(
    entity_id: str | None,
    entry_data: Mapping[str, Any],
    reader: Any,
) -> float | None:
    """Resolve meter kWh for store / drift (including tri-phase synthetic sums)."""
    if not entity_id:
        return None
    if entity_id == SYNTHETIC_ENTITY_GRID_IMPORT_SUM:
        ids = ordered_phase_entity_ids(entry_data.get(CONF_GRID_IMPORT_ENERGY_PHASES))
        if len(ids) != 3:
            return None
        return reader.sum_energy_kwh(ids)
    if entity_id == SYNTHETIC_ENTITY_GRID_EXPORT_SUM:
        ids = ordered_phase_entity_ids(entry_data.get(CONF_GRID_EXPORT_ENERGY_PHASES))
        if len(ids) != 3:
            return None
        return reader.sum_energy_kwh(ids)
    return reader.read_energy_kwh(entity_id)


def tri_grid_aggregate_import_entities(
    entry_data: Mapping[str, Any],
    *,
    phase_type: str,
) -> list[str]:
    if (
        phase_type != PHASE_TRI
        or entry_data.get(CONF_GRID_TRI_ENERGY_MODE) != TRI_GRID_ENERGY_PER_PHASE
    ):
        return []
    return ordered_phase_entity_ids(entry_data.get(CONF_GRID_IMPORT_ENERGY_PHASES))


def tri_grid_aggregate_export_entities(
    entry_data: Mapping[str, Any],
    *,
    phase_type: str,
) -> list[str]:
    if (
        phase_type != PHASE_TRI
        or entry_data.get(CONF_GRID_TRI_ENERGY_MODE) != TRI_GRID_ENERGY_PER_PHASE
    ):
        return []
    return ordered_phase_entity_ids(entry_data.get(CONF_GRID_EXPORT_ENERGY_PHASES))


def build_source_map(
    entry_data: Mapping[str, Any],
    *,
    battery_systems: list[dict[str, Any]],
    has_solar: bool,
) -> dict[str, str | None]:
    grid_import = cast(str | None, entry_data.get(CONF_GRID_IMPORT_ENERGY))
    grid_export = cast(str | None, entry_data.get(CONF_GRID_EXPORT_ENERGY))
    if (
        entry_data.get(CONF_PHASE_TYPE) == PHASE_TRI
        and entry_data.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE
    ):
        imp_ids = ordered_phase_entity_ids(entry_data.get(CONF_GRID_IMPORT_ENERGY_PHASES))
        grid_import = SYNTHETIC_ENTITY_GRID_IMPORT_SUM if len(imp_ids) == 3 else None
        exp_ids = ordered_phase_entity_ids(entry_data.get(CONF_GRID_EXPORT_ENERGY_PHASES))
        grid_export = SYNTHETIC_ENTITY_GRID_EXPORT_SUM if len(exp_ids) == 3 else None
    m: dict[str, str | None] = {
        SOURCE_GRID: grid_import,
        SOURCE_SOLAR: entry_data.get(CONF_SOLAR_ENERGY) if has_solar else None,
        SOURCE_GRID_EXPORT: grid_export,
    }
    for batt in battery_systems:
        bid = batt.get("id", "")
        m[f"batt_charge:{bid}"] = batt.get(CONF_BATT_ENERGY_IN)
        m[f"batt_discharge:{bid}"] = batt.get(CONF_BATT_ENERGY_OUT)
    return m


def build_power_source_map(
    entry_options: Mapping[str, Any],
    entry_data: Mapping[str, Any],
    *,
    has_solar: bool,
) -> dict[str, str | None]:
    return {
        "grid_power": cast(
            str | None,
            entry_options.get(CONF_GRID_POWER_SENSOR, entry_data.get(CONF_GRID_POWER_SENSOR)),
        ),
        "solar_power": (
            cast(
                str | None,
                entry_options.get(CONF_SOLAR_POWER_SENSOR, entry_data.get(CONF_SOLAR_POWER_SENSOR)),
            )
            if has_solar
            else None
        ),
        "load_power": cast(
            str | None,
            entry_options.get(CONF_LOAD_POWER_SENSOR, entry_data.get(CONF_LOAD_POWER_SENSOR)),
        ),
    }
