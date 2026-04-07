"""Pure energy aggregation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class EnergyAggregation:
    """Per-slot daily energy decomposition."""

    grid: dict[str, float]
    solar: dict[str, float]
    battery_charge: dict[str, float]
    battery_discharge: dict[str, float]
    home: dict[str, float]

    @property
    def batt_charge(self) -> dict[str, float]:
        """Backward-compatible alias."""
        return self.battery_charge

    @property
    def batt_discharge(self) -> dict[str, float]:
        """Backward-compatible alias."""
        return self.battery_discharge

    @property
    def maison(self) -> dict[str, float]:
        """Backward-compatible alias."""
        return self.home


def empty_slots(slots: tuple[str, ...]) -> dict[str, float]:
    return {slot: 0.0 for slot in slots}


def slot_values(day_acc: dict[str, Any] | Any, source_key: str, slots: tuple[str, ...]) -> dict[str, float]:
    section = day_acc.get(source_key) if isinstance(day_acc, dict) else None
    if not isinstance(section, dict):
        return empty_slots(slots)
    return {slot: float(section.get(slot, 0.0)) for slot in slots}


def compute_energy(
    *,
    grid: dict[str, float],
    solar: dict[str, float],
    battery_charge: dict[str, float],
    battery_discharge: dict[str, float],
    slots: tuple[str, ...],
) -> EnergyAggregation:
    home = {
        slot: grid[slot] + solar[slot] + battery_discharge[slot]
        for slot in slots
    }
    return EnergyAggregation(
        grid=grid,
        solar=solar,
        battery_charge=battery_charge,
        battery_discharge=battery_discharge,
        home=home,
    )
