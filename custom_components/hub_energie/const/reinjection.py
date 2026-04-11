"""Reinjection heuristics, options keys, and export classification diagnostics."""

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Reinjection / power heuristics
# ---------------------------------------------------------------------------
REINJECTION_EXPORT_IGNORE_BELOW_W: Final = 10.0
REINJECTION_BATT_CHARGE_SIGNIFICANT_W: Final = 0.0
REINJECTION_SHORT_EXPORT_MAX_S: Final = 45.0
REINJECTION_SHORT_EXPORT_MAX_W: Final = 600.0
REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W: Final = 100.0
REINJECTION_EXPORT_MIN_ABS_W: Final = 120.0
REINJECTION_EXPORT_VS_SOLAR_FRACTION: Final = 0.2
REINJECTION_BATT_FULL_MIN_SOC_FRAC: Final = 0.93

OPT_REINJECTION_EXPORT_IGNORE_BELOW_W: Final = "reinjection_export_ignore_below_w"
OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W: Final = "reinjection_batt_charge_significant_w"
OPT_REINJECTION_SHORT_EXPORT_MAX_S: Final = "reinjection_short_export_max_s"
OPT_REINJECTION_SHORT_EXPORT_MAX_W: Final = "reinjection_short_export_max_w"
OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W: Final = "reinjection_min_solar_for_classify_w"
OPT_REINJECTION_EXPORT_MIN_ABS_W: Final = "reinjection_export_min_abs_w"
OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION: Final = "reinjection_export_vs_solar_fraction"
OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC: Final = "reinjection_batt_full_min_soc_frac"

REINJECTION_OPTION_KEYS: Final[tuple[str, ...]] = (
    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    OPT_REINJECTION_EXPORT_MIN_ABS_W,
    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
)

# Bounds for options-flow UI (NumberSelector); defaults above stay the integration defaults.
REINJECTION_UI_POWER_W_MAX: Final = 500_000.0
REINJECTION_UI_DURATION_S_MAX: Final = 600.0

# ---------------------------------------------------------------------------
# Reinjection diagnostics
# ---------------------------------------------------------------------------
DIAG_CAUSE_SOLAR_SURPLUS: Final = "solar_surplus"
DIAG_CAUSE_BATTERY_FULL_OR_ABSENT: Final = "battery_full_or_absent"
DIAG_CAUSE_SWITCH_LATENCY: Final = "switch_latency"
DIAG_CAUSE_UNATTRIBUTED: Final = "unattributed"
