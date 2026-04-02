"""Runtime battery helpers extracted from coordinator."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..const import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
)


def aggregate_battery_soc_fill_ratio(
    *,
    has_batteries: bool,
    battery_systems: list[dict[str, Any]],
    resolve_batt_param: Callable[..., float | None],
    read_soc_normalized: Callable[[str], float | None],
) -> float | None:
    if not has_batteries:
        return None
    total_cap = 0.0
    weighted = 0.0
    for batt in battery_systems:
        soc_e = batt.get(CONF_BATT_SOC)
        cap = resolve_batt_param(
            batt, CONF_BATT_CAPACITY_KWH, CONF_BATT_CAPACITY_KWH_ENTITY
        )
        if not soc_e or not cap:
            continue
        soc_n = read_soc_normalized(soc_e)
        if soc_n is None:
            continue
        soc_max_pct = (
            resolve_batt_param(
                batt, CONF_BATT_SOC_MAX, CONF_BATT_SOC_MAX_ENTITY, kind="soc"
            )
            or 100.0
        )
        max_n = soc_max_pct / 100.0
        weighted += max(0.0, min(1.0, soc_n / max(1e-9, max_n))) * cap
        total_cap += cap
    if total_cap <= 0:
        return None
    return max(0.0, min(1.0, weighted / total_cap))


def any_battery_at_max(
    *,
    has_batteries: bool,
    battery_systems: list[dict[str, Any]],
    resolve_batt_param: Callable[..., float | None],
    read_soc_percent: Callable[[str | None], float | None],
) -> bool | None:
    if not has_batteries:
        return None
    for batt in battery_systems:
        soc_e = batt.get(CONF_BATT_SOC)
        soc_max = resolve_batt_param(
            batt, CONF_BATT_SOC_MAX, CONF_BATT_SOC_MAX_ENTITY, kind="soc"
        )
        if not soc_e or soc_max is None:
            continue
        pct = read_soc_percent(soc_e)
        if pct is not None and pct + 0.1 >= soc_max:
            return True
    return None


def read_aggregate_battery_power(
    *,
    battery_systems: list[dict[str, Any]],
    read_power_w: Callable[[str | None], float | None],
) -> tuple[float, float | None, bool]:
    """Return (discharge_w, charge_w_or_none, any_sensor_valid)."""
    dis_total = 0.0
    chg_total = 0.0
    any_valid = False
    for batt in battery_systems:
        p_in = read_power_w(batt.get(CONF_BATT_POWER_IN))
        p_out = read_power_w(batt.get(CONF_BATT_POWER_OUT))
        p_net_raw = read_power_w(batt.get(CONF_BATT_POWER_NET))
        if p_net_raw is not None:
            sign = batt.get(CONF_BATT_POWER_NET_SIGN, BATT_SIGN_POSITIVE_DISCHARGE)
            if sign not in (BATT_SIGN_POSITIVE_DISCHARGE, BATT_SIGN_POSITIVE_CHARGE):
                sign = BATT_SIGN_POSITIVE_DISCHARGE
            net = -p_net_raw if sign == BATT_SIGN_POSITIVE_CHARGE else p_net_raw
            if net > 0:
                dis_total += net
            else:
                chg_total += abs(net)
            any_valid = True
        else:
            if p_out is not None:
                dis_total += max(0.0, p_out)
                any_valid = True
            if p_in is not None:
                chg_total += max(0.0, p_in)
                any_valid = True
    return dis_total, (chg_total if any_valid else None), any_valid
