"""Branch coverage for ``power.reinjection.classify_reinjection_cause`` (pure logic)."""

from __future__ import annotations

from datetime import datetime, timedelta

import importlib

reinj = importlib.import_module("hub_energie.power.reinjection")
T = reinj.ReinjectionThresholds

_TH = T(
    export_ignore_below_w=50.0,
    short_export_max_s=30.0,
    short_export_max_w=200.0,
    export_vs_solar_fraction=0.5,
    export_min_abs_w=100.0,
    min_solar_for_classify_w=500.0,
    batt_charge_significant_w=50.0,
    battery_full_min_soc_frac=0.85,
)

_NOW = datetime(2026, 3, 15, 12, 0, 0)
_U = "unattributed"
_B = "battery_full"
_L = "latency"
_S = "solar_surplus"


def _kw(**over):
    base = dict(
        p_export=1000.0,
        p_solar=0.0,
        p_batt_charge=None,
        has_battery=True,
        now=_NOW,
        export_active_since=_NOW - timedelta(seconds=120),
        soc_fill_ratio=None,
        soc_at_or_above_max=None,
        thresholds=_TH,
        cause_unattributed=_U,
        cause_battery_full_or_absent=_B,
        cause_switch_latency=_L,
        cause_solar_surplus=_S,
    )
    base.update(over)
    return base


def test_below_export_ignore_is_unattributed_and_clears_since() -> None:
    dec, since = reinj.classify_reinjection_cause(**_kw(p_export=40.0))
    assert dec.cause == _U
    assert dec.inputs["reason"] == "below_export_ignore_threshold"
    assert since is None


def test_no_battery_configured() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(has_battery=False, p_export=200.0, export_active_since=None)
    )
    assert dec.cause == _B
    assert dec.inputs["reason"] == "no_battery_configured"
    assert since == _NOW


def test_short_export_low_power_is_switch_latency() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_export=150.0,
            export_active_since=_NOW,
        )
    )
    assert dec.cause == _L
    assert since == _NOW
    assert dec.inputs["export_duration_s"] == 0.0


def test_high_soc_uses_battery_full_branch() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=600.0,
            p_export=400.0,
            p_batt_charge=10.0,
            soc_at_or_above_max=True,
        )
    )
    assert dec.cause == _B
    assert dec.confidence == 0.92


def test_low_soc_fill_prefers_solar_surplus() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=600.0,
            p_export=400.0,
            p_batt_charge=10.0,
            soc_at_or_above_max=None,
            soc_fill_ratio=0.5,
        )
    )
    assert dec.cause == _S
    assert dec.confidence == 0.76


def test_no_soc_flags_uses_battery_full_heuristic() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=600.0,
            p_export=400.0,
            p_batt_charge=10.0,
            soc_at_or_above_max=None,
            soc_fill_ratio=None,
        )
    )
    assert dec.cause == _B
    assert dec.confidence == 0.72


def test_battery_charging_while_exporting() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=600.0,
            p_export=400.0,
            p_batt_charge=80.0,
            soc_at_or_above_max=False,
        )
    )
    assert dec.cause == _S
    assert dec.inputs["reason"] == "battery_charging_while_exporting"


def test_solar_present_fallback_within_export() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=600.0,
            p_export=120.0,
            p_batt_charge=80.0,
        )
    )
    assert dec.cause == _S
    assert dec.inputs["reason"] == "solar_present"
    assert dec.confidence == 0.6


def test_final_unattributed_fallback() -> None:
    dec, since = reinj.classify_reinjection_cause(
        **_kw(
            p_solar=100.0,
            p_export=400.0,
            p_batt_charge=10.0,
        )
    )
    assert dec.cause == _U
    assert dec.inputs["reason"] == "fallback"
