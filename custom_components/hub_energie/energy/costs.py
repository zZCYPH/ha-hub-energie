"""Cost and savings computations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class CostComputation:
    cost_by_slot: dict[str, float]
    cost_total: float
    abonnement_eur: float


def compute_costs(
    *,
    grid_by_slot: dict[str, float],
    rates_by_slot: dict[str, float],
    slots: tuple[str, ...],
    abonnement_eur: float,
) -> CostComputation:
    cost_by_slot = {
        slot: grid_by_slot[slot] * rates_by_slot.get(slot, 0.0)
        for slot in slots
    }
    return CostComputation(
        cost_by_slot=cost_by_slot,
        cost_total=sum(cost_by_slot.values()) + abonnement_eur,
        abonnement_eur=abonnement_eur,
    )


def compute_savings(
    *,
    solar_by_slot: dict[str, float],
    battery_charge_by_slot: dict[str, float],
    battery_discharge_by_slot: dict[str, float],
    rates_by_slot: dict[str, float],
    slots: tuple[str, ...],
    is_hc_slot: Callable[[str], bool],
) -> tuple[float, float]:
    eco_solar = sum(
        solar_by_slot[slot] * rates_by_slot.get(slot, 0.0)
        for slot in slots
    )
    eco_battery = 0.0
    for slot in slots:
        tariff = rates_by_slot.get(slot, 0.0)
        if is_hc_slot(slot):
            eco_battery += (
                battery_discharge_by_slot.get(slot, 0.0)
                - battery_charge_by_slot.get(slot, 0.0)
            ) * tariff
        else:
            eco_battery += battery_discharge_by_slot.get(slot, 0.0) * tariff
    return eco_solar, eco_battery
