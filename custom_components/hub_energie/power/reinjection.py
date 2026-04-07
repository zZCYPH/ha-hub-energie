"""Deterministic reinjection classification utilities."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class ReinjectionThresholds:
    export_ignore_below_w: float
    short_export_max_s: float
    short_export_max_w: float
    export_vs_solar_fraction: float
    export_min_abs_w: float
    min_solar_for_classify_w: float
    batt_charge_significant_w: float
    battery_full_min_soc_frac: float


@dataclass(frozen=True)
class ReinjectionDecision:
    cause: str
    confidence: float
    inputs: dict[str, Any]


def classify_reinjection_cause(
    *,
    p_export: float,
    p_solar: float,
    p_batt_charge: float | None,
    has_battery: bool,
    now: datetime,
    export_active_since: datetime | None,
    soc_fill_ratio: float | None,
    soc_at_or_above_max: bool | None,
    thresholds: ReinjectionThresholds,
    cause_unattributed: str,
    cause_battery_full_or_absent: str,
    cause_switch_latency: str,
    cause_solar_surplus: str,
) -> tuple[ReinjectionDecision, datetime | None]:
    if p_export <= thresholds.export_ignore_below_w:
        return (
            ReinjectionDecision(
                cause=cause_unattributed,
                confidence=0.2,
                inputs={"reason": "below_export_ignore_threshold"},
            ),
            None,
        )
    if not has_battery:
        return (
            ReinjectionDecision(
                cause=cause_battery_full_or_absent,
                confidence=0.9,
                inputs={"reason": "no_battery_configured"},
            ),
            export_active_since or now,
        )

    active_since = export_active_since or now
    export_dur = max(0.0, (now - active_since).total_seconds())
    if export_dur <= thresholds.short_export_max_s and p_export <= thresholds.short_export_max_w:
        return (
            ReinjectionDecision(
                cause=cause_switch_latency,
                confidence=0.75,
                inputs={"export_duration_s": export_dur, "p_export": p_export},
            ),
            active_since,
        )

    export_vs_solar = max(
        thresholds.export_min_abs_w,
        thresholds.export_vs_solar_fraction * p_solar,
    )
    if (
        p_solar >= thresholds.min_solar_for_classify_w
        and p_export >= export_vs_solar
        and p_batt_charge is not None
        and p_batt_charge <= thresholds.batt_charge_significant_w
    ):
        if soc_at_or_above_max is not None:
            cause = cause_battery_full_or_absent if soc_at_or_above_max else cause_solar_surplus
            conf = 0.92 if soc_at_or_above_max else 0.8
        elif soc_fill_ratio is not None and soc_fill_ratio < thresholds.battery_full_min_soc_frac:
            cause = cause_solar_surplus
            conf = 0.76
        else:
            cause = cause_battery_full_or_absent
            conf = 0.72
        return (
            ReinjectionDecision(
                cause=cause,
                confidence=conf,
                inputs={
                    "p_export": p_export,
                    "p_solar": p_solar,
                    "p_batt_charge": p_batt_charge,
                    "soc_fill_ratio": soc_fill_ratio,
                    "soc_at_or_above_max": soc_at_or_above_max,
                    "export_vs_solar_threshold": export_vs_solar,
                },
            ),
            active_since,
        )

    if (
        p_solar >= thresholds.min_solar_for_classify_w
        and p_export >= export_vs_solar
        and p_batt_charge is not None
        and p_batt_charge > thresholds.batt_charge_significant_w
    ):
        return (
            ReinjectionDecision(
                cause=cause_solar_surplus,
                confidence=0.8,
                inputs={"reason": "battery_charging_while_exporting", "p_batt_charge": p_batt_charge},
            ),
            active_since,
        )
    if p_solar >= thresholds.min_solar_for_classify_w:
        return (
            ReinjectionDecision(
                cause=cause_solar_surplus,
                confidence=0.6,
                inputs={"reason": "solar_present"},
            ),
            active_since,
        )
    return (
        ReinjectionDecision(
            cause=cause_unattributed,
            confidence=0.35,
            inputs={"reason": "fallback"},
        ),
        active_since,
    )
