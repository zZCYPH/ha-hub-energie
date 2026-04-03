"""Paris timezone helpers for day-boundary logic."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from homeassistant.util import dt as dt_util

from ..const import FR_TZ

PARIS_TZ = ZoneInfo(FR_TZ)
UTC = timezone.utc


class ParisTime:
    """Centralized Europe/Paris date-time helpers."""

    @staticmethod
    def now() -> datetime:
        return dt_util.utcnow().astimezone(PARIS_TZ)

    @staticmethod
    def today() -> str:
        return ParisTime.now().date().isoformat()

    @staticmethod
    def yesterday() -> str:
        return (ParisTime.now().date() - timedelta(days=1)).isoformat()

    @staticmethod
    def day_start(dt: datetime) -> datetime:
        return dt.astimezone(PARIS_TZ).replace(hour=0, minute=0, second=0, microsecond=0)

    @staticmethod
    def day_start_utc(iso_day: str) -> datetime:
        """UTC instant of 00:00 Europe/Paris for ``iso_day`` (`YYYY-MM-DD`)."""
        return datetime.strptime(iso_day, "%Y-%m-%d").replace(tzinfo=PARIS_TZ).astimezone(UTC)
