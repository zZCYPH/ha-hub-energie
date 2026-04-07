"""Europe/Paris day boundaries used by persistence and statistics."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.time", HUB_DIR / "time")

paris_time = importlib.import_module("hub_energie.time.paris_time")
ParisTime = paris_time.ParisTime
PARIS_TZ = paris_time.PARIS_TZ


def test_day_start_utc_midnight_paris_winter_maps_to_utc() -> None:
    # 2026-01-15 00:00 Europe/Paris (CET, UTC+1) == 2026-01-14 23:00 UTC
    start_utc = ParisTime.day_start_utc("2026-01-15")
    assert start_utc.tzinfo == timezone.utc
    assert start_utc == datetime(2026, 1, 14, 23, 0, 0, tzinfo=timezone.utc)


def test_day_start_strips_time_in_paris() -> None:
    noon_paris = datetime(2026, 7, 1, 14, 30, 45, tzinfo=PARIS_TZ)
    midnight = ParisTime.day_start(noon_paris)
    assert midnight.hour == 0 and midnight.minute == 0 and midnight.second == 0
    assert midnight.date() == noon_paris.date()


def test_today_yesterday_follow_utcnow() -> None:
    fixed_utc = datetime(2026, 3, 10, 23, 30, 0, tzinfo=timezone.utc)

    class _FakeDtUtil:
        @staticmethod
        def utcnow() -> datetime:
            return fixed_utc

    with patch.object(paris_time, "dt_util", _FakeDtUtil):
        assert ParisTime.today() == "2026-03-11"
        assert ParisTime.yesterday() == "2026-03-10"
