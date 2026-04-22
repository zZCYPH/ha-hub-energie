"""Read typed values from coordinator snapshot payloads (pure helpers)."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any, cast

from ..const.config_keys import CONF_BATTERY_SYSTEMS
from ..const.energy_data import (
    DATA_COST_TOTAL,
    DATA_CURRENT_SLOT,
    DATA_GRID_POWER_SIGNED_W,
    DATA_LOAD_POWER_W,
    DATA_SOLAR_POWER_W,
    DATA_TEMPO_DAYS,
    DATA_TODAY_COLOR,
    DATA_TOMORROW_COLOR,
)
from .types import BatterySnapshotData, EnergyData


def snapshot_get_value(data: Mapping[str, Any] | None, key: str) -> Any | None:
    if not data:
        return None
    return data.get(key)


def snapshot_finite_number(value: Any) -> float | None:
    if value is None or not isinstance(value, (int, float)):
        return None
    numeric = float(value)
    return numeric if math.isfinite(numeric) else None


def snapshot_get_numeric_value(data: Mapping[str, Any] | None, key: str) -> float | None:
    return snapshot_finite_number(snapshot_get_value(data, key))


def snapshot_get_mapping_value(data: Mapping[str, Any] | None, key: str) -> dict[str, Any] | None:
    value = snapshot_get_value(data, key)
    return value if isinstance(value, dict) else None


def snapshot_get_nested_numeric_value(
    data: Mapping[str, Any] | None,
    section_key: str,
    key: str,
) -> float | None:
    section = snapshot_get_mapping_value(data, section_key)
    if not section:
        return None
    return snapshot_finite_number(section.get(key))


def snapshot_get_str(data: Mapping[str, Any] | None, key: str) -> str | None:
    value = snapshot_get_value(data, key)
    return str(value) if value is not None else None


def snapshot_get_list(data: Mapping[str, Any] | None, key: str) -> list[Any]:
    value = snapshot_get_value(data, key)
    return value if isinstance(value, list) else []


def coordinator_snapshot_data(data: EnergyData | None) -> EnergyData | None:
    """Latest coordinator snapshot payload, or None when empty / unavailable."""
    return data if data else None


def coordinator_get_value(data: EnergyData | None, key: str) -> Any | None:
    return snapshot_get_value(coordinator_snapshot_data(data), key)


def coordinator_get_numeric_value(data: EnergyData | None, key: str) -> float | None:
    return snapshot_get_numeric_value(coordinator_snapshot_data(data), key)


def coordinator_get_mapping_value(data: EnergyData | None, key: str) -> dict[str, Any] | None:
    return snapshot_get_mapping_value(coordinator_snapshot_data(data), key)


def coordinator_get_nested_numeric_value(
    data: EnergyData | None,
    section_key: str,
    key: str,
) -> float | None:
    return snapshot_get_nested_numeric_value(coordinator_snapshot_data(data), section_key, key)


def coordinator_get_grid_power_signed_w(data: EnergyData | None) -> float | None:
    return coordinator_get_numeric_value(data, DATA_GRID_POWER_SIGNED_W)


def coordinator_get_solar_power_w(data: EnergyData | None) -> float | None:
    return coordinator_get_numeric_value(data, DATA_SOLAR_POWER_W)


def coordinator_get_load_power_w(data: EnergyData | None) -> float | None:
    return coordinator_get_numeric_value(data, DATA_LOAD_POWER_W)


def coordinator_get_cost_total(data: EnergyData | None) -> float | None:
    return coordinator_get_numeric_value(data, DATA_COST_TOTAL)


def coordinator_get_current_slot(data: EnergyData | None) -> str | None:
    return snapshot_get_str(coordinator_snapshot_data(data), DATA_CURRENT_SLOT)


def coordinator_get_today_color(data: EnergyData | None) -> str | None:
    return snapshot_get_str(coordinator_snapshot_data(data), DATA_TODAY_COLOR)


def coordinator_get_tomorrow_color(data: EnergyData | None) -> str | None:
    return snapshot_get_str(coordinator_snapshot_data(data), DATA_TOMORROW_COLOR)


def coordinator_get_tempo_days(data: EnergyData | None) -> dict[str, Any] | None:
    return coordinator_get_mapping_value(data, DATA_TEMPO_DAYS)


def coordinator_get_battery_systems_data(data: EnergyData | None) -> list[BatterySnapshotData]:
    return cast(
        list[BatterySnapshotData],
        snapshot_get_list(coordinator_snapshot_data(data), CONF_BATTERY_SYSTEMS),
    )
