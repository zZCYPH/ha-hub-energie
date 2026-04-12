"""Snapshot `data_quality`: attribution / delta health (not entity presence)."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from .const.energy_data import SOURCE_GRID
from .const.tariff_edf import SLOT_UNKNOWN
from .time.paris_time import ParisTime


def compute_snapshot_data_quality(
    snapshot_data_for_day: Callable[[str], Mapping[str, Any]],
    delta_telemetry: Mapping[str, Any],
) -> str:
    """Degraded when unknown grid bucket, indirect attribution, or long delta gaps."""
    day = ParisTime.today()
    day_acc = snapshot_data_for_day(day)
    grid = day_acc.get(SOURCE_GRID, {})
    unk = (
        float(grid.get(SLOT_UNKNOWN, 0.0))
        if isinstance(grid, dict)
        else 0.0
    )
    for tel in delta_telemetry.values():
        if not isinstance(tel, dict):
            continue
        if tel.get("last_method") not in (None, "direct"):
            return "degraded"
        gs = tel.get("last_gap_seconds")
        if gs is not None and float(gs) > 7200:
            return "degraded"
    if unk > 0.01:
        return "degraded"
    return "good"
