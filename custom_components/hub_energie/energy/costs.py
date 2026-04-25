"""Cost and savings computations."""

from __future__ import annotations

from collections.abc import Mapping
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


def solar_self_use_kwh_by_slot(
    *,
    solar_production_by_slot: Mapping[str, float],
    solar_to_battery_by_slot: Mapping[str, float],
    grid_export_by_slot: Mapping[str, float],
    slots: tuple[str, ...],
) -> dict[str, float]:
    """Per-slot PV kWh consumed directly at home (not to battery, not grid export).

    Used as the basis for solar savings so ``eco_solar`` does not double-count energy
    later valued via battery discharge savings or physical export.
    """
    return {
        slot: max(
            0.0,
            float(solar_production_by_slot.get(slot, 0.0))
            - float(solar_to_battery_by_slot.get(slot, 0.0))
            - float(grid_export_by_slot.get(slot, 0.0)),
        )
        for slot in slots
    }


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
