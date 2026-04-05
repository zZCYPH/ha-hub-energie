"""Energy unit helpers (pure)."""

from __future__ import annotations

from ..const import ENERGY_ROUND_DECIMALS

__all__ = ("normalize_kwh", "normalize_kwh_to_decimals")


def normalize_kwh(value: float) -> float:
    return round(float(value), ENERGY_ROUND_DECIMALS)


def normalize_kwh_to_decimals(value: float, decimals: int) -> float:
    """Round kWh for JSON store serialization (decimals from StoreManager)."""
    return round(float(value), decimals)
