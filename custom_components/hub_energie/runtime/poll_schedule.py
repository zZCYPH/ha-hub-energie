"""Paris poll slot math for coordinator scheduling (pure)."""

from __future__ import annotations

from datetime import datetime, timedelta

from ..const.tariff_edf import TARIFF_OFFER_TEMPO, TEMPO_MODE_API
from ..time.paris_time import PARIS_TZ

__all__ = (
    "POLL_SLOTS_PARIS",
    "ceil_minutes",
    "next_poll_fire_paris_after",
    "next_poll_fire_paris_edf_tempo_api",
    "resolve_next_poll",
)

POLL_SLOTS_PARIS: tuple[tuple[int, int], ...] = tuple(
    sorted(
        {(h, 0) for h in range(0, 24, 2)}
        | {(5, 30), (6, 30), (10, 30), (11, 0), (11, 30), (21, 50), (22, 30)},
        key=lambda t: (t[0], t[1]),
    )
)


def next_poll_fire_paris_after(after: datetime) -> datetime:
    """Next scheduled coordinator refresh strictly after *after* (Paris TZ)."""
    tz = PARIS_TZ
    after = after.astimezone(tz) if after.tzinfo else after.replace(tzinfo=tz)
    day = after.date()
    for _ in range(3):
        for hour, minute in POLL_SLOTS_PARIS:
            candidate = datetime(day.year, day.month, day.day, hour, minute, 0, tzinfo=tz)
            if candidate > after:
                return candidate
        day += timedelta(days=1)
    return after + timedelta(hours=2)


def ceil_minutes(dt: datetime, step_min: int) -> datetime:
    """Ceil dt to the next N-minute boundary (strictly after dt if not aligned)."""
    if step_min <= 0:
        return dt
    base = dt.replace(second=0, microsecond=0)
    minute = base.minute
    rem = minute % step_min
    add = step_min - rem if rem != 0 else 0
    out = base + timedelta(minutes=add)
    return out if out > dt else out + timedelta(minutes=step_min)


def next_poll_fire_paris_edf_tempo_api(after: datetime, *, tomorrow_color: str | None) -> datetime:
    """Dynamic poll schedule for EDF Tempo API colour fetches (Paris TZ)."""
    tz = PARIS_TZ
    after = after.astimezone(tz) if after.tzinfo else after.replace(tzinfo=tz)
    day = after.date()
    t0530 = datetime(day.year, day.month, day.day, 5, 30, 0, tzinfo=tz)
    t1200 = datetime(day.year, day.month, day.day, 12, 0, 0, tzinfo=tz)
    if after < t0530:
        return t0530
    if after >= t1200:
        nd = day + timedelta(days=1)
        return datetime(nd.year, nd.month, nd.day, 5, 30, 0, tzinfo=tz)

    tomorrow_unknown = str(tomorrow_color or "unknown") in ("unknown", "n/a", "")
    if tomorrow_unknown:
        return ceil_minutes(after, 10)

    next_hour = after.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    if next_hour < t1200:
        return next_hour
    nd = day + timedelta(days=1)
    return datetime(nd.year, nd.month, nd.day, 5, 30, 0, tzinfo=tz)


def resolve_next_poll(
    after: datetime,
    *,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    tomorrow_color: str | None,
) -> datetime:
    if not (is_edf and tariff_offer == TARIFF_OFFER_TEMPO and tempo_mode == TEMPO_MODE_API):
        return next_poll_fire_paris_after(after)
    return next_poll_fire_paris_edf_tempo_api(after, tomorrow_color=tomorrow_color)
