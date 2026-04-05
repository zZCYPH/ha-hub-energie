"""Broader unit coverage for small pure modules (utils, tempo, delta policy, solar, observability)."""

from __future__ import annotations

import importlib
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

numbers_mod = importlib.import_module("hub_energie.utils.numbers")
energy_util = importlib.import_module("hub_energie.utils.energy")
const = importlib.import_module("hub_energie.const")
tempo_logic = importlib.import_module("hub_energie.tempo.tempo_logic")
delta_policy_mod = importlib.import_module("hub_energie.energy.delta_policy")
battery_split = importlib.import_module("hub_energie.battery.battery_split")
solar_est = importlib.import_module("hub_energie.solar.solar_estimation")
delta_obs = importlib.import_module("hub_energie.energy.delta_observability")


def test_safe_float_accepts_numbers_and_rejects_bad_values() -> None:
    assert numbers_mod.safe_float("3.5") == pytest.approx(3.5)
    assert numbers_mod.safe_float(2) == pytest.approx(2.0)
    assert numbers_mod.safe_float(None) is None
    assert numbers_mod.safe_float("x") is None
    assert numbers_mod.safe_float(float("nan")) is None
    assert numbers_mod.safe_float(float("inf")) is None


def test_normalize_kwh_rounds_like_const() -> None:
    v = energy_util.normalize_kwh(1.23456789)
    assert v == round(1.23456789, const.ENERGY_ROUND_DECIMALS)


def test_normalize_kwh_to_decimals_matches_store_rounding() -> None:
    assert energy_util.normalize_kwh_to_decimals(1.234567, 6) == round(1.234567, 6)


def test_scoped_device_name_strips_and_falls_back() -> None:
    assert const.scoped_device_name("") == const.INTEGRATION_TITLE
    assert const.scoped_device_name("   ") == const.INTEGRATION_TITLE
    assert const.scoped_device_name("  Solar  ") == f"{const.INTEGRATION_TITLE} Solar"


def test_tempo_season_start_year_boundary() -> None:
    sep = datetime(2026, 9, 1, 12, 0, tzinfo=timezone.utc)
    assert tempo_logic.tempo_season_start(sep).year == 2026
    aug = datetime(2026, 8, 31, 12, 0, tzinfo=timezone.utc)
    assert tempo_logic.tempo_season_start(aug).year == 2025


def test_compute_tempo_day_counters_empty_and_season() -> None:
    assert tempo_logic.compute_tempo_day_counters(
        rows=[],
        now_paris=datetime(2026, 3, 1, 12, 0, tzinfo=ZoneInfo("Europe/Paris")),
        season_quotas={"blue": 300, "white": 43, "red": 22},
        tempo_supply_day_start_paris=lambda dt: dt.replace(hour=6, minute=0, second=0, microsecond=0),
    ) is None

    class Row:
        def __init__(self, value: str, start: datetime, end: datetime) -> None:
            self.value = value
            self.start = start
            self.end = end

    paris = ZoneInfo("Europe/Paris")
    now = datetime(2026, 3, 15, 12, 0, tzinfo=paris)
    mid = datetime(2026, 3, 10, 12, 0, tzinfo=paris)
    rows = [Row("BLUE", mid - timedelta(hours=1), mid + timedelta(hours=1))]
    out = tempo_logic.compute_tempo_day_counters(
        rows=rows,
        now_paris=now,
        season_quotas={"blue": 300, "white": 43, "red": 22},
        tempo_supply_day_start_paris=lambda dt: dt.replace(
            hour=6, minute=0, second=0, microsecond=0
        ),
    )
    assert out is not None
    assert "blue" in out
    assert out["blue"]["elapsed"] >= 0
    assert out["blue"]["remaining"] >= 0


def test_delta_policy_max_delta_and_plausible_reset() -> None:
    pol = delta_policy_mod.DeltaPolicy()
    assert pol.small_negative_rebase_band_kwh() == pytest.approx(
        float(const.NEGATIVE_DELTA_REBASE_BAND_KWH)
    )
    assert pol.max_delta_kwh("batt_charge:x") == pytest.approx(80.0)
    assert pol.max_delta_kwh(const.SOURCE_SOLAR) == pytest.approx(120.0)
    assert pol.max_delta_kwh(const.SOURCE_GRID) == pytest.approx(300.0)
    assert pol.max_delta_kwh("other") == pytest.approx(float(const.MAX_DELTA_KWH_DEFAULT))

    assert pol.is_plausible_reset("grid", 10.0, 10.0) is False
    assert pol.is_plausible_reset("grid", 10.0, 0.05) is True
    assert pol.is_plausible_reset("grid", 100.0, 40.0) is True
    drop_noise = const.NEGATIVE_DELTA_NOISE_KWH
    assert pol.is_plausible_reset("grid", 5.0, 5.0 - drop_noise / 2) is False
    assert pol.is_plausible_reset("grid", 200.0, 50.0) is True


def test_usage_batt_charge_by_slot_from_heuristic_splits_hc_hp() -> None:
    slots = ("bleu_hc", "bleu_hp", "rouge_hc")
    charge = {"bleu_hc": 1.25, "bleu_hp": 2.5, "rouge_hc": 0.1}
    grid, solar = battery_split.usage_batt_charge_by_slot_from_heuristic(
        charge,
        slots,
        is_hc_slot=lambda s: s.endswith("_hc"),
        is_hp_slot=lambda s: s.endswith("_hp"),
    )
    assert grid["bleu_hc"] == pytest.approx(1.25)
    assert grid["bleu_hp"] == 0.0
    assert solar["bleu_hp"] == pytest.approx(2.5)
    assert solar["bleu_hc"] == 0.0


def test_compute_solar_estimation_requires_inputs() -> None:
    paris = ZoneInfo("Europe/Paris")
    now = datetime(2026, 6, 15, 14, 0, tzinfo=paris)
    empty = solar_est.compute_solar_estimation(
        lat=None,
        lon=None,
        peak_kwp=None,
        orientation_deg=180.0,
        tilt_deg=30.0,
        tilt_auto=False,
        shading="none",
        performance="standard",
        now_paris=now,
        paris_tz=paris,
    )
    assert empty.power_w is None
    assert empty.daily_kwh is None
    assert empty.yearly_kwh is None


def test_optimal_tilt_and_solar_estimate_non_trivial() -> None:
    lat = 48.85
    tilt = solar_est.optimal_tilt(lat)
    assert 0.0 <= tilt <= 60.0
    assert tilt == pytest.approx(max(0.0, min(60.0, abs(lat) * 0.76 + 3.1)))

    paris = ZoneInfo("Europe/Paris")
    now = datetime(2026, 6, 15, 12, 0, tzinfo=paris)
    est = solar_est.compute_solar_estimation(
        lat=lat,
        lon=2.35,
        peak_kwp=5.0,
        orientation_deg=180.0,
        tilt_deg=30.0,
        tilt_auto=False,
        shading="light",
        performance="high",
        now_paris=now,
        paris_tz=paris,
    )
    assert est.power_w is not None and est.power_w >= 0.0
    assert est.daily_kwh is not None and est.daily_kwh > 0.0
    assert est.yearly_kwh is not None and est.yearly_kwh > 0.0


def test_seconds_since_last_applied_delta_parses_iso_and_z_suffix() -> None:
    now = datetime(2026, 1, 10, 12, 1, 30, tzinfo=timezone.utc)
    telemetry = {
        "grid": {"last_applied_at": "2026-01-10T12:00:00+00:00"},
        "solar": {"last_applied_at": "2026-01-10T11:55:30Z"},
    }
    sec = delta_obs.seconds_since_last_applied_delta(telemetry, now_utc=now)
    assert sec is not None
    assert sec == pytest.approx(90.0)

    assert delta_obs.seconds_since_last_applied_delta({}, now_utc=now) is None
