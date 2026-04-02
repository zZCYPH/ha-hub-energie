"""Delta accumulation policy (same thresholds as legacy coordinator)."""

from __future__ import annotations

from ..const import (
    MAX_DELTA_KWH_DEFAULT,
    NEGATIVE_DELTA_NOISE_KWH,
    SOURCE_GRID,
    SOURCE_GRID_EXPORT,
    SOURCE_SOLAR,
)

__all__ = ("DeltaPolicy",)


class DeltaPolicy:
    """Caps and reset heuristics for energy counter deltas."""

    def max_delta_kwh(self, source_key: str) -> float:
        if source_key.startswith("batt_"):
            return 80.0
        if source_key == SOURCE_SOLAR:
            return 120.0
        if source_key in (SOURCE_GRID, SOURCE_GRID_EXPORT):
            return 300.0
        return MAX_DELTA_KWH_DEFAULT

    def is_plausible_reset(self, source_key: str, last_raw: float, new_raw: float) -> bool:
        drop = max(0.0, last_raw - new_raw)
        if drop <= NEGATIVE_DELTA_NOISE_KWH:
            return False
        if new_raw <= 0.1:
            return True
        if new_raw <= last_raw * 0.5:
            return True
        return drop >= self.max_delta_kwh(source_key)
