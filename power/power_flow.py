"""Power flow model (measured/inferred) utilities."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class PowerFlowModel:
    p_grid_signed: float | None
    p_export: float
    p_solar: float
    p_batt_dis: float
    p_batt_charge: float | None
    p_load: float | None
    p_load_measured: float | None
    p_grid_raw: float | None
    any_batt_power: bool
    home_power_for_flows: float
    grid_import_power: float
    solar_production_power: float
    battery_discharge_power: float
    solar_to_home: float
    battery_to_home: float
    grid_to_home: float
    solar_to_battery: float
    grid_to_battery: float
    solar_export_model: float
    flow_gap: float
    power_model_mode: Literal["measured", "inferred"]


def compute_power_flow(
    *,
    p_grid_raw: float | None,
    p_solar: float,
    p_batt_dis: float,
    p_batt_charge: float | None,
    p_load_measured: float | None,
    grid_export_positive: bool,
) -> PowerFlowModel:
    p_grid_signed: float | None = None
    p_export = 0.0
    if p_grid_raw is not None:
        p_grid_signed = -p_grid_raw if grid_export_positive else p_grid_raw
        p_export = max(0.0, -p_grid_signed)

    p_bc_bal = max(0.0, p_batt_charge) if p_batt_charge is not None else 0.0
    if p_grid_signed is not None:
        p_load_inferred = p_solar + p_grid_signed + p_batt_dis - p_bc_bal
    else:
        p_load_inferred = p_solar + p_batt_dis - p_bc_bal
    p_load = p_load_measured if p_load_measured is not None else p_load_inferred
    power_model_mode: Literal["measured", "inferred"] = (
        "measured" if p_load_measured is not None else "inferred"
    )

    grid_import_power = max(0.0, p_grid_signed or 0.0)
    solar_production_power = max(0.0, p_solar)
    battery_discharge_power = max(0.0, p_batt_dis)
    battery_charge_power = max(0.0, p_batt_charge or 0.0)

    raw_home_power = max(0.0, p_load or 0.0)
    max_supply = solar_production_power + battery_discharge_power + grid_import_power
    home_power_for_flows = min(raw_home_power, max_supply)

    solar_to_home = min(solar_production_power, home_power_for_flows)
    remain_home = max(0.0, home_power_for_flows - solar_to_home)
    battery_to_home = min(battery_discharge_power, remain_home)
    remain_home = max(0.0, remain_home - battery_to_home)
    grid_to_home = min(grid_import_power, remain_home)
    home_power_for_flows = solar_to_home + battery_to_home + grid_to_home

    solar_remaining = max(0.0, solar_production_power - solar_to_home)
    solar_to_battery = min(solar_remaining, battery_charge_power)
    grid_remaining = max(0.0, grid_import_power - grid_to_home)
    grid_to_battery = min(max(0.0, battery_charge_power - solar_to_battery), grid_remaining)
    solar_export_model = max(0.0, solar_remaining - solar_to_battery)

    return PowerFlowModel(
        p_grid_signed=p_grid_signed,
        p_export=p_export,
        p_solar=p_solar,
        p_batt_dis=p_batt_dis,
        p_batt_charge=p_batt_charge,
        p_load=p_load,
        p_load_measured=p_load_measured,
        p_grid_raw=p_grid_raw,
        any_batt_power=(p_batt_charge is not None or p_batt_dis > 0),
        home_power_for_flows=home_power_for_flows,
        grid_import_power=grid_import_power,
        solar_production_power=solar_production_power,
        battery_discharge_power=battery_discharge_power,
        solar_to_home=solar_to_home,
        battery_to_home=battery_to_home,
        grid_to_home=grid_to_home,
        solar_to_battery=solar_to_battery,
        grid_to_battery=grid_to_battery,
        solar_export_model=solar_export_model,
        flow_gap=abs(raw_home_power - home_power_for_flows),
        power_model_mode=power_model_mode,
    )
