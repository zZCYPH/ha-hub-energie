"""Pure Tempo snapshot computation for pipeline."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from ..const import TARIFF_OFFER_TEMPO, TEMPO_MODE_API, TEMPO_MODE_RTE, TEMPO_SEASON_DAY_QUOTAS
from ..providers.edf import (
    is_off_peak,
    next_hc_window_start_paris,
    next_tempo_colour_change_at,
    next_tempo_day_boundary_paris,
    tempo_supply_day_start_paris,
)
from .tempo_logic import TempoSnapshot, compute_tempo_day_counters

__all__ = ("compute_tempo_snapshot",)


def compute_tempo_snapshot(
    *,
    now_paris: datetime,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    calendar_rows: list[Any],
    tempo_days_api: dict[str, dict[str, int]] | None,
) -> TempoSnapshot:
    tempo_days: dict[str, dict[str, int]] | None = None
    tempo_next_colour: str | None = None
    tempo_next_hc: str | None = None
    tempo_is_off: bool | None = None

    if is_edf and tariff_offer == TARIFF_OFFER_TEMPO:
        tempo_is_off = is_off_peak(now_paris)
        if tempo_mode == TEMPO_MODE_RTE:
            tempo_days = compute_tempo_day_counters(
                rows=calendar_rows,
                now_paris=now_paris,
                season_quotas=TEMPO_SEASON_DAY_QUOTAS,
                tempo_supply_day_start_paris=tempo_supply_day_start_paris,
            )
        elif tempo_mode == TEMPO_MODE_API:
            tempo_days = tempo_days_api
        tnc: datetime | None = None
        if tempo_mode == TEMPO_MODE_RTE and calendar_rows:
            tnc = next_tempo_colour_change_at(calendar_rows, now_paris)
        if tnc is None:
            tnc = next_tempo_day_boundary_paris(now_paris)
        tempo_next_colour = tnc.isoformat()
        tempo_next_hc = next_hc_window_start_paris(now_paris).isoformat()

    return TempoSnapshot(
        tempo_days=tempo_days,
        tempo_next_colour=tempo_next_colour,
        tempo_next_hc=tempo_next_hc,
        tempo_is_off=tempo_is_off,
    )
