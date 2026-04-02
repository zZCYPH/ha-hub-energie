"""Energy unit helpers (pure)."""

from __future__ import annotations

from ..const import ENERGY_ROUND_DECIMALS

__all__ = ("normalize_kwh",)


def normalize_kwh(value: float) -> float:
    return round(float(value), ENERGY_ROUND_DECIMALS)
