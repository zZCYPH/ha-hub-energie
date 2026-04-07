"""Battery metrics computation with data quality reporting."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Literal


BatteryDataQuality = Literal["ok", "partial", "poor"]


@dataclass(frozen=True)
class BatteryMetricsResult:
    battery_systems: list[dict[str, Any]]
    total_charge_kwh: float
    total_discharge_kwh: float
    total_net_power_w: float
    battery_data_quality: BatteryDataQuality


def compute_battery_card_metrics(
    battery_systems: list[dict[str, Any]],
) -> dict[str, Any] | None:
    rows: list[tuple[dict[str, Any], float]] = []
    for battery in battery_systems:
        cap = battery.get("nominal_capacity_kwh")
        soc = battery.get("soc")
        if cap is None or float(cap) <= 0 or soc is None:
            continue
        rows.append((battery, float(cap)))
    if not rows:
        return None
    total_cap = sum(cap for _, cap in rows)
    weighted_soc = sum(float(b["soc"]) * cap for b, cap in rows)
    total_stored = 0.0
    total_avail = 0.0
    w_min = 0.0
    w_max = 0.0
    for battery, cap in rows:
        raw_stored = battery.get("stored_energy_kwh")
        if raw_stored is not None:
            total_stored += float(raw_stored)
        else:
            total_stored += float(battery["soc"]) * cap / 100.0
        avail = battery.get("available_energy_kwh")
        if avail is not None:
            total_avail += float(avail)
        else:
            soc_min = float(battery.get("soc_min_percent") or 0.0)
            total_avail += cap * max(0.0, float(battery["soc"]) - soc_min) / 100.0
        w_min += float(battery.get("soc_min_percent") or 0.0) * cap
        w_max += float(battery.get("soc_max_percent") or 100.0) * cap
    soc_pct = weighted_soc / total_cap if total_cap > 0 else None
    if soc_pct is None:
        return None
    return {
        "capacity_kwh": round(total_cap, 3),
        "stored_kwh": round(total_stored, 3),
        "available_kwh": round(total_avail, 3),
        "soc_percent": round(float(soc_pct), 2),
        "soc_min_percent": round(float(w_min / total_cap), 2),
        "soc_max_percent": round(float(w_max / total_cap), 2),
    }


def compute_battery_metrics(
    *,
    day_acc: dict[str, Any],
    battery_systems_cfg: list[dict[str, Any]],
    slot_values: Callable[[dict[str, Any], str], dict[str, float]],
    read_power_w: Callable[[str | None], float | None],
    read_energy_kwh: Callable[[str | None], float | None],
    read_soc_percent: Callable[[str | None], float | None],
    resolve_batt_param: Callable[..., float | None],
    net_sign_default: str,
    net_sign_positive_charge: str,
    conf_keys: dict[str, str],
    warn: Callable[[str], None],
) -> BatteryMetricsResult:
    per_battery: list[dict[str, Any]] = []
    total_charge = 0.0
    total_discharge = 0.0
    total_net_power = 0.0
    complete_rows = 0

    for batt in battery_systems_cfg:
        batt_id = batt.get("id", "")
        name = batt.get(conf_keys["batt_name"], f"Battery {batt_id}")

        charge_slots = slot_values(day_acc, f"batt_charge:{batt_id}")
        discharge_slots = slot_values(day_acc, f"batt_discharge:{batt_id}")
        charge_kwh = sum(charge_slots.values())
        discharge_kwh = sum(discharge_slots.values())

        p_in = read_power_w(batt.get(conf_keys["batt_power_in"]))
        p_out = read_power_w(batt.get(conf_keys["batt_power_out"]))
        p_net_raw = read_power_w(batt.get(conf_keys["batt_power_net"]))
        power_net: float | None = None
        if p_net_raw is not None:
            sign = batt.get(conf_keys["batt_power_net_sign"], net_sign_default)
            power_net = -p_net_raw if sign == net_sign_positive_charge else p_net_raw
        elif p_in is not None or p_out is not None:
            power_net = (p_out or 0.0) - (p_in or 0.0)

        soc = read_soc_percent(batt.get(conf_keys["batt_soc"]))
        capacity = resolve_batt_param(
            batt,
            conf_keys["batt_capacity_kwh"],
            conf_keys["batt_capacity_kwh_entity"],
        )
        soc_min = (
            resolve_batt_param(
                batt,
                conf_keys["batt_soc_min"],
                conf_keys["batt_soc_min_entity"],
                kind="soc",
            )
            or 0.0
        )
        soc_max = (
            resolve_batt_param(
                batt,
                conf_keys["batt_soc_max"],
                conf_keys["batt_soc_max_entity"],
                kind="soc",
            )
            or 100.0
        )

        stored: float | None = None
        available: float | None = None
        if capacity and soc is not None:
            stored = round(capacity * soc / 100.0, 3)
            available = round(capacity * max(0.0, soc - soc_min) / 100.0, 3)

        avail_entity = batt.get(conf_keys["batt_energy_available"])
        if avail_entity:
            avail_val = read_energy_kwh(avail_entity)
            if avail_val is not None:
                available = round(avail_val, 3)

        efficiency: float | None = None
        if charge_kwh > 0.01 and discharge_kwh > 0:
            efficiency = round(discharge_kwh / charge_kwh, 3)

        if soc is not None and capacity is not None:
            complete_rows += 1
        else:
            warn(f"Battery '{name}' has partial data (soc={soc is not None}, capacity={capacity is not None})")

        per_battery.append(
            {
                "id": batt_id,
                "name": name,
                "charge_kwh": round(charge_kwh, 3),
                "discharge_kwh": round(discharge_kwh, 3),
                "power_net": round(power_net, 1) if power_net is not None else None,
                "soc": round(soc, 1) if soc is not None else None,
                "stored_energy_kwh": stored,
                "available_energy_kwh": available,
                "efficiency": efficiency,
                "nominal_capacity_kwh": round(capacity, 3) if capacity else None,
                "soc_min_percent": round(float(soc_min), 2) if soc is not None else None,
                "soc_max_percent": round(float(soc_max), 2) if soc is not None else None,
            }
        )
        total_charge += charge_kwh
        total_discharge += discharge_kwh
        if power_net is not None:
            total_net_power += power_net

    total_rows = len(battery_systems_cfg)
    if total_rows == 0:
        quality: BatteryDataQuality = "poor"
    elif complete_rows == total_rows:
        quality = "ok"
    elif complete_rows > 0:
        quality = "partial"
    else:
        quality = "poor"

    return BatteryMetricsResult(
        battery_systems=per_battery,
        total_charge_kwh=total_charge,
        total_discharge_kwh=total_discharge,
        total_net_power_w=total_net_power,
        battery_data_quality=quality,
    )
