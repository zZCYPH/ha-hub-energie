"""Tests for ``storage.recorder_rebuild`` (recorder row → daily kWh + LTS floor)."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime
from pathlib import Path

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.storage", HUB_DIR / "storage")
_ensure_pkg("hub_energie.time", HUB_DIR / "time")

rebuild = importlib.import_module("hub_energie.storage.recorder_rebuild")
paris_time = importlib.import_module("hub_energie.time.paris_time")
PARIS_TZ = paris_time.PARIS_TZ


def _norm(x: float) -> float:
    return round(float(x), 6)


def _sf(v: object) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def test_stat_rows_empty_returns_zero_floor() -> None:
    d, floor = rebuild.stat_rows_to_dailies_and_lts_floor(
        [],
        today_iso="2026-06-01",
        safe_float=_sf,
        norm_kwh=_norm,
    )
    assert d == []
    assert floor == 0.0


def test_stat_rows_skips_bad_rows() -> None:
    good = datetime(2026, 5, 1, 12, 0, tzinfo=PARIS_TZ)
    rows = [
        {"start": "not-a-date", "sum": 1.0},
        {"start": good, "sum": "nope"},
        {"start": good, "sum": 3.0},
    ]
    d, floor = rebuild.stat_rows_to_dailies_and_lts_floor(
        rows,
        today_iso="2026-06-02",
        safe_float=_sf,
        norm_kwh=_norm,
    )
    assert d == [("2026-05-01", _norm(3.0))]
    assert floor == _norm(3.0)


def test_stat_rows_monotonic_cumulative_deltas_and_floor() -> None:
    d1 = datetime(2026, 5, 1, 14, 0, tzinfo=PARIS_TZ)
    d2 = datetime(2026, 5, 2, 14, 0, tzinfo=PARIS_TZ)
    rows = [{"start": d1, "sum": 10.0}, {"start": d2, "sum": 33.0}]
    d, floor = rebuild.stat_rows_to_dailies_and_lts_floor(
        rows,
        today_iso="2026-05-03",
        safe_float=_sf,
        norm_kwh=_norm,
    )
    assert d == [("2026-05-01", _norm(10.0)), ("2026-05-02", _norm(23.0))]
    assert floor == _norm(33.0)


def test_stat_rows_non_monotonic_legacy_daily_values() -> None:
    d1 = datetime(2026, 5, 1, 14, 0, tzinfo=PARIS_TZ)
    d2 = datetime(2026, 5, 2, 14, 0, tzinfo=PARIS_TZ)
    rows = [{"start": d1, "sum": 5.0}, {"start": d2, "sum": 3.0}]
    d, floor = rebuild.stat_rows_to_dailies_and_lts_floor(
        rows,
        today_iso="2026-05-03",
        safe_float=_sf,
        norm_kwh=_norm,
    )
    assert d == [("2026-05-01", _norm(5.0)), ("2026-05-02", _norm(3.0))]
    assert floor == _norm(8.0)


def test_stat_rows_excludes_today_and_future_days() -> None:
    past = datetime(2026, 5, 1, 14, 0, tzinfo=PARIS_TZ)
    today_row = datetime(2026, 5, 2, 14, 0, tzinfo=PARIS_TZ)
    rows = [{"start": past, "sum": 5.0}, {"start": today_row, "sum": 99.0}]
    d, floor = rebuild.stat_rows_to_dailies_and_lts_floor(
        rows,
        today_iso="2026-05-02",
        safe_float=_sf,
        norm_kwh=_norm,
    )
    assert d == [("2026-05-01", _norm(5.0))]
    assert floor == _norm(5.0)
