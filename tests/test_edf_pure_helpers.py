"""Unit tests for pure helpers in ``hub_energie.providers.edf`` (no network)."""

from __future__ import annotations

import importlib
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

edf = importlib.import_module("hub_energie.providers.edf")
const = importlib.import_module("hub_energie.const")


def test_parse_french_decimal_and_date() -> None:
    assert edf.parse_french_decimal("12,5") == pytest.approx(12.5)
    assert edf.parse_french_decimal("  3.14 ") == pytest.approx(3.14)
    with pytest.raises(ValueError):
        edf.parse_french_decimal("nope")

    assert edf.parse_french_date("15/03/2026") == date(2026, 3, 15)
    assert edf.parse_french_date("2026-03-15") == date(2026, 3, 15)
    with pytest.raises(ValueError):
        edf.parse_french_date("99/99/99")


def test_normalize_power_and_validate_headers() -> None:
    assert edf.normalize_power("  9 kVa ") == "9"
    edf.validate_headers(["A", "B", "C"], frozenset({"A", "B"}))
    with pytest.raises(ValueError, match="missing required headers"):
        edf.validate_headers(["A"], frozenset({"A", "B"}))


def test_colour_from_rte_value() -> None:
    assert edf.colour_from_rte_value("BLUE") == "bleu"
    assert edf.colour_from_rte_value("white") == "blanc"
    assert edf.colour_from_rte_value("x") is None


def test_is_off_peak_and_build_current_slot() -> None:
    hp = datetime(2026, 6, 1, 14, 0, 0)
    assert edf.is_off_peak(hp) is False
    assert edf.build_current_slot("bleu", hp) == "bleu_hp"

    hc_late = datetime(2026, 6, 1, 23, 0, 0)
    assert edf.is_off_peak(hc_late) is True
    assert edf.build_current_slot("rouge", hc_late) == "rouge_hc"

    hc_early = datetime(2026, 6, 1, 5, 30, 0)
    assert edf.is_off_peak(hc_early) is True

    assert edf.build_current_slot(None, hp) is None
    assert edf.build_current_slot("", hp) is None


def test_parse_slot_from_sensor_state_variants() -> None:
    assert edf.parse_slot_from_sensor_state("bleu_hp") == "bleu_hp"
    assert edf.parse_slot_from_sensor_state("Bleu HP") == "bleu_hp"
    assert edf.parse_slot_from_sensor_state("blanc-hc") == "blanc_hc"
    assert edf.parse_slot_from_sensor_state("unknown") is None
    assert edf.parse_slot_from_sensor_state("") is None
    assert edf.parse_slot_from_sensor_state("bleu with _hc tail") == "bleu_hc"


def test_tempo_supply_day_and_next_boundary_paris() -> None:
    paris = ZoneInfo(const.FR_TZ)
    before_change = datetime(2026, 6, 2, 5, 0, tzinfo=paris)
    start = edf.tempo_supply_day_start_paris(before_change)
    assert start.day == 1 and start.hour == const.HOUR_OF_CHANGE

    after_change = datetime(2026, 6, 2, 7, 0, tzinfo=paris)
    start2 = edf.tempo_supply_day_start_paris(after_change)
    assert start2.day == 2

    nxt = edf.next_tempo_day_boundary_paris(datetime(2026, 6, 2, 7, 0, tzinfo=paris))
    assert nxt.day == 3 and nxt.hour == const.HOUR_OF_CHANGE


def test_current_colour_from_calendar_prefers_longest_interval() -> None:
    paris = ZoneInfo(const.FR_TZ)
    anchor = datetime(2026, 6, 10, 12, 0, tzinfo=paris)
    short = edf.TempoCalendarRow(
        start=anchor - timedelta(hours=1),
        end=anchor + timedelta(hours=1),
        value="WHITE",
    )
    long = edf.TempoCalendarRow(
        start=anchor - timedelta(hours=12),
        end=anchor + timedelta(hours=12),
        value="BLUE",
    )
    colour = edf.current_colour_from_calendar([short, long], anchor)
    assert colour == "bleu"
