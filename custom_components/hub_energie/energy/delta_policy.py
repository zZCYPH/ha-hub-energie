"""Delta accumulation policy (same thresholds as legacy coordinator)."""

from __future__ import annotations

from ..const.energy_data import (
    DEFAULT_MAX_DELTA_KWH_BATTERY,
    DEFAULT_MAX_DELTA_KWH_GRID,
    DEFAULT_MAX_DELTA_KWH_SOLAR,
    MAX_DELTA_KWH_DEFAULT,
    NEGATIVE_DELTA_NOISE_KWH,
    NEGATIVE_DELTA_REBASE_BAND_KWH,
    SOURCE_GRID,
    SOURCE_GRID_EXPORT,
    SOURCE_SOLAR,
)

__all__ = ("DeltaPolicy",)


class DeltaPolicy:
    """Caps and reset heuristics for energy counter deltas."""

    def __init__(
        self,
        *,
        max_delta_grid_kwh: float = DEFAULT_MAX_DELTA_KWH_GRID,
        max_delta_solar_kwh: float = DEFAULT_MAX_DELTA_KWH_SOLAR,
        max_delta_battery_kwh: float = DEFAULT_MAX_DELTA_KWH_BATTERY,
        max_delta_other_kwh: float = MAX_DELTA_KWH_DEFAULT,
    ) -> None:
        self._max_grid = float(max_delta_grid_kwh)
        self._max_solar = float(max_delta_solar_kwh)
        self._max_batt = float(max_delta_battery_kwh)
        self._max_other = float(max_delta_other_kwh)

    def small_negative_rebase_band_kwh(self) -> float:
        """Max |negative delta| treated as noise: rebase last_raw, do not accumulate."""
        return float(NEGATIVE_DELTA_REBASE_BAND_KWH)

    def max_delta_kwh(self, source_key: str) -> float:
        if source_key.startswith("batt_"):
            return self._max_batt
        if source_key == SOURCE_SOLAR:
            return self._max_solar
        if source_key in (SOURCE_GRID, SOURCE_GRID_EXPORT):
            return self._max_grid
        return self._max_other

    def is_plausible_reset(self, source_key: str, last_raw: float, new_raw: float) -> bool:
        drop = max(0.0, last_raw - new_raw)
        if drop <= NEGATIVE_DELTA_NOISE_KWH:
            return False
        if new_raw <= 0.1:
            return True
        if new_raw <= last_raw * 0.5:
            return True
        return drop >= self.max_delta_kwh(source_key)
