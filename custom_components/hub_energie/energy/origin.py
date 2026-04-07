"""Origin and usage computations from per-slot energy."""

from __future__ import annotations

from dataclasses import dataclass

from .energy_aggregation import EnergyAggregation


@dataclass(frozen=True)
class OriginAndUsage:
    """Origin split + user-facing usage channels."""

    origin_grid_total: float
    origin_solar_total: float
    direct_grid: float
    battery_from_grid: float
    solar_direct: float
    battery_from_solar: float
    usage_grid_direct: float
    usage_grid_battery_charge: float
    usage_solar_direct: float
    usage_solar_battery_charge: float
    usage_battery_home: float

    @property
    def batt_from_grid(self) -> float:
        return self.battery_from_grid

    @property
    def batt_from_solar(self) -> float:
        return self.battery_from_solar

    @property
    def usage_grid_batt_charge(self) -> float:
        return self.usage_grid_battery_charge

    @property
    def usage_solar_batt_charge(self) -> float:
        return self.usage_solar_battery_charge

    @property
    def usage_batt_home(self) -> float:
        return self.usage_battery_home


def is_hc_slot(slot: str) -> bool:
    return slot.endswith("_hc")


def is_hp_slot(slot: str) -> bool:
    return slot.endswith("_hp")


def compute_origin_and_usage(energy: EnergyAggregation, slots: tuple[str, ...]) -> OriginAndUsage:
    enedis_total = sum(energy.grid.values())
    battery_discharge_total = sum(energy.batt_discharge.values())
    battery_charge_hc = sum(
        energy.batt_charge.get(slot, 0.0)
        for slot in slots
        if is_hc_slot(slot)
    )
    battery_from_grid = min(battery_discharge_total, battery_charge_hc)
    direct_grid = max(0.0, enedis_total - battery_charge_hc)

    solar_direct = sum(energy.solar.values())
    battery_from_solar = max(0.0, battery_discharge_total - battery_from_grid)
    usage_solar_battery_charge = round(
        sum(
            energy.batt_charge.get(slot, 0.0)
            for slot in slots
            if is_hp_slot(slot)
        ),
        3,
    )
    return OriginAndUsage(
        origin_grid_total=round(direct_grid + battery_from_grid, 3),
        origin_solar_total=round(solar_direct + battery_from_solar, 3),
        direct_grid=direct_grid,
        battery_from_grid=battery_from_grid,
        solar_direct=solar_direct,
        battery_from_solar=battery_from_solar,
        usage_grid_direct=round(direct_grid, 3),
        usage_grid_battery_charge=round(battery_charge_hc, 3),
        usage_solar_direct=round(solar_direct, 3),
        usage_solar_battery_charge=usage_solar_battery_charge,
        usage_battery_home=round(battery_discharge_total, 3),
    )
