"""Battery split helpers."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Callable


def usage_batt_charge_by_slot_from_heuristic(
    batt_charge_by_slot: Mapping[str, float],
    slots: tuple[str, ...],
    is_hc_slot: Callable[[str], bool],
    is_hp_slot: Callable[[str], bool],
) -> tuple[dict[str, float], dict[str, float]]:
    """HC slots -> grid-side charge; HP slots -> solar-side charge."""
    grid_by = {
        slot: round(float(batt_charge_by_slot.get(slot, 0.0)), 5) if is_hc_slot(slot) else 0.0
        for slot in slots
    }
    solar_by = {
        slot: round(float(batt_charge_by_slot.get(slot, 0.0)), 5) if is_hp_slot(slot) else 0.0
        for slot in slots
    }
    return grid_by, solar_by
