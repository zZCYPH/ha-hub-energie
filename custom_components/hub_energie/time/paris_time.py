"""Local timezone helpers for day-boundary logic (Home Assistant default TZ)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from homeassistant.util import dt as dt_util

from ..const.tariff_edf import FR_TZ

UTC = timezone.utc

# France civil time for EDF/RTE APIs only — see ``hub_energy_tz`` for integration day boundaries.
PARIS_TZ = ZoneInfo(FR_TZ)


def hub_energy_tz() -> ZoneInfo:
    """Timezone used for day keys, statistics alignment, and polling slot math.

    Uses Home Assistant's configured default time zone. Falls back to ``Europe/Paris``
    when ``get_default_time_zone`` is unavailable (e.g. minimal test stubs).
    """
    get_tz = getattr(dt_util, "get_default_time_zone", None)
    if not callable(get_tz):
        return ZoneInfo(FR_TZ)
    tz = get_tz()
    if tz is None:
        return ZoneInfo(FR_TZ)
    key = getattr(tz, "key", None)
    if isinstance(key, str) and key:
        return ZoneInfo(key)
    if isinstance(tz, ZoneInfo):
        return tz
    return ZoneInfo(FR_TZ)


class ParisTime:
    """Centralized local date-time helpers (HA default timezone)."""

    @staticmethod
    def now() -> datetime:
        return dt_util.utcnow().astimezone(hub_energy_tz())

    @staticmethod
    def today() -> str:
        return ParisTime.now().date().isoformat()

    @staticmethod
    def yesterday() -> str:
        return (ParisTime.now().date() - timedelta(days=1)).isoformat()

    @staticmethod
    def day_start(dt: datetime) -> datetime:
        return dt.astimezone(hub_energy_tz()).replace(hour=0, minute=0, second=0, microsecond=0)

    @staticmethod
    def day_start_utc(iso_day: str) -> datetime:
        """UTC instant of 00:00 local (HA default TZ) for ``iso_day`` (`YYYY-MM-DD`)."""
        return datetime.strptime(iso_day, "%Y-%m-%d").replace(tzinfo=hub_energy_tz()).astimezone(UTC)
