"""Battery domain public API."""

from .battery_metrics import (
    BatteryMetricsResult,
    compute_battery_card_metrics,
    compute_battery_metrics,
)
from .battery_runtime import (
    aggregate_battery_soc_fill_ratio,
    any_battery_at_max,
    read_aggregate_battery_power,
)
from .battery_split import usage_batt_charge_by_slot_from_heuristic

__all__ = [
    "BatteryMetricsResult",
    "aggregate_battery_soc_fill_ratio",
    "any_battery_at_max",
    "compute_battery_card_metrics",
    "compute_battery_metrics",
    "read_aggregate_battery_power",
    "usage_batt_charge_by_slot_from_heuristic",
]
