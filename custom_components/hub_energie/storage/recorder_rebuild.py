"""Pure helpers to rebuild daily kWh and LTS floor from recorder statistic rows."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

__all__ = ("stat_rows_to_dailies_and_lts_floor",)


def stat_rows_to_dailies_and_lts_floor(
    rows: list[Any],
    *,
    today_iso: str,
    local_tz: ZoneInfo,
    safe_float: Callable[[Any], float | None],
    norm_kwh: Callable[[float], float],
) -> tuple[list[tuple[str, float]], float]:
    """Split recorder rows into per-day kWh for internal rebuild and LTS cumulative floor.

    Monotonic ``sum`` series → treat as cumulative (delta between rows). Non-monotonic
    → legacy daily values written as ``sum`` (before v0.2.2).
    """
    parsed: list[tuple[datetime, float]] = []
    for row in rows:
        start_dt = row.get("start") if isinstance(row, Mapping) else getattr(row, "start", None)
        sum_val = row.get("sum") if isinstance(row, Mapping) else getattr(row, "sum", None)
        if not isinstance(start_dt, datetime):
            continue
        s = safe_float(sum_val)
        if s is None:
            continue
        parsed.append((start_dt, s))

    parsed.sort(key=lambda t: t[0])
    done = [
        (dt, s)
        for dt, s in parsed
        if dt.astimezone(local_tz).date().isoformat() < today_iso
    ]
    if not done:
        return [], 0.0

    sums = [p[1] for p in done]
    monotonic = len(sums) < 2 or all(
        sums[i] >= sums[i - 1] - 1e-9 for i in range(1, len(sums))
    )

    out: list[tuple[str, float]] = []
    if not monotonic:
        last_cum = 0.0
        for dt, s in done:
            day_iso = dt.astimezone(local_tz).date().isoformat()
            daily = norm_kwh(max(0.0, s))
            if daily > 0:
                out.append((day_iso, daily))
                last_cum = norm_kwh(last_cum + daily)
        return out, last_cum

    prev = 0.0
    for dt, s in done:
        day_iso = dt.astimezone(local_tz).date().isoformat()
        daily = norm_kwh(max(0.0, s - prev))
        if daily > 0:
            out.append((day_iso, daily))
        prev = s
    return out, norm_kwh(sums[-1])
