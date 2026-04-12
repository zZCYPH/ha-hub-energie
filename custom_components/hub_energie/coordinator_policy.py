"""Coordinator policy helpers (delta caps, Paris calendar, reinjection diag ordering)."""

from __future__ import annotations

import math
from datetime import datetime

from homeassistant.config_entries import ConfigEntry

from .const.energy_data import (
    DEFAULT_MAX_DELTA_KWH_BATTERY,
    DEFAULT_MAX_DELTA_KWH_GRID,
    DEFAULT_MAX_DELTA_KWH_SOLAR,
    DELTA_CAP_KWH_MAX,
    DELTA_CAP_KWH_MIN,
    MAX_DELTA_KWH_DEFAULT,
    OPT_MAX_DELTA_KWH_BATTERY,
    OPT_MAX_DELTA_KWH_GRID,
    OPT_MAX_DELTA_KWH_OTHER,
    OPT_MAX_DELTA_KWH_SOLAR,
)
from .const.reinjection import (
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
)
from .energy.delta_policy import DeltaPolicy
from .time.paris_time import ParisTime

DIAG_CAUSES: tuple[str, ...] = (
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
)


def delta_policy_from_entry(entry: ConfigEntry) -> DeltaPolicy:
    opts = entry.options

    def resolved(key: str, default: float) -> float:
        raw = opts.get(key)
        if raw is None:
            return float(default)
        try:
            v = float(raw)
        except (TypeError, ValueError):
            return float(default)
        if not math.isfinite(v):
            return float(default)
        return max(float(DELTA_CAP_KWH_MIN), min(float(DELTA_CAP_KWH_MAX), v))

    return DeltaPolicy(
        max_delta_grid_kwh=resolved(OPT_MAX_DELTA_KWH_GRID, DEFAULT_MAX_DELTA_KWH_GRID),
        max_delta_solar_kwh=resolved(OPT_MAX_DELTA_KWH_SOLAR, DEFAULT_MAX_DELTA_KWH_SOLAR),
        max_delta_battery_kwh=resolved(OPT_MAX_DELTA_KWH_BATTERY, DEFAULT_MAX_DELTA_KWH_BATTERY),
        max_delta_other_kwh=resolved(OPT_MAX_DELTA_KWH_OTHER, MAX_DELTA_KWH_DEFAULT),
    )


def paris_now() -> datetime:
    return ParisTime.now()


def paris_today_iso() -> str:
    return ParisTime.today()


def paris_yesterday() -> str:
    return ParisTime.yesterday()
