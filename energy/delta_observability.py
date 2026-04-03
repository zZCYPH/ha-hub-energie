"""Home Assistant–free helpers for delta / telemetry observability (unit-testable)."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

__all__ = ("seconds_since_last_applied_delta",)


def _parse_last_applied_at(raw: object) -> datetime | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def seconds_since_last_applied_delta(
    delta_telemetry: Mapping[str, Any],
    *,
    now_utc: datetime,
) -> float | None:
    """Seconds since the most recent successfully applied energy delta (any source)."""
    latest: datetime | None = None
    for tel in delta_telemetry.values():
        if not isinstance(tel, dict):
            continue
        parsed = _parse_last_applied_at(tel.get("last_applied_at"))
        if parsed is None:
            continue
        if latest is None or parsed > latest:
            latest = parsed
    if latest is None:
        return None
    now = now_utc if now_utc.tzinfo else now_utc.replace(tzinfo=timezone.utc)
    now = now.astimezone(timezone.utc)
    return max(0.0, (now - latest).total_seconds())
