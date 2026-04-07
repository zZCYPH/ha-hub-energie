"""Tempo-specific pure logic."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable


@dataclass(frozen=True)
class TempoSnapshot:
    tempo_days: dict[str, dict[str, int]] | None
    tempo_next_colour: str | None
    tempo_next_hc: str | None
    tempo_is_off: bool | None


def tempo_season_start(day: datetime) -> datetime:
    year = day.year if day.month >= 9 else day.year - 1
    return day.replace(year=year, month=9, day=1)


def compute_tempo_day_counters(
    *,
    rows: list[Any],
    now_paris: datetime,
    season_quotas: dict[str, int],
    tempo_supply_day_start_paris: Callable[[datetime], datetime],
) -> dict[str, dict[str, int]] | None:
    if not rows:
        return None
    season_start = tempo_season_start(now_paris).date()
    today = now_paris.date()
    day_color: dict[str, str] = {}
    for row in rows:
        value = str(getattr(row, "value", "")).upper()
        if value not in ("BLUE", "WHITE", "RED"):
            continue
        color = value.lower()
        start = getattr(row, "start", None)
        end = getattr(row, "end", None)
        if not isinstance(start, datetime) or not isinstance(end, datetime) or end <= start:
            continue
        mid = start + (end - start) / 2
        anchor_date = tempo_supply_day_start_paris(mid).date()
        if season_start <= anchor_date <= today:
            day_color.setdefault(anchor_date.isoformat(), color)

    elapsed = {"blue": 0, "white": 0, "red": 0}
    for day_iso, color in day_color.items():
        if day_iso < today.isoformat():
            elapsed[color] += 1
    today_color = day_color.get(today.isoformat())
    out: dict[str, dict[str, int]] = {}
    for color, quota in season_quotas.items():
        subtract_today = 1 if today_color == color else 0
        out[color] = {
            "elapsed": elapsed[color],
            "remaining": max(0, quota - elapsed[color] - subtract_today),
        }
    return out
