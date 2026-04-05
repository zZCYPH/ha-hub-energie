"""Tests for energy.trust_level (synthetic health / trust computation)."""

from __future__ import annotations

from hub_energie.const import TRUST_DRIFT_INCONSISTENT_KWH, TRUST_STALENESS_DEGRADED_SECONDS
from hub_energie.energy.trust_level import TrustInputs, compute_trust


def test_rebuilding_wins_over_inconsistent() -> None:
    r = compute_trust(
        TrustInputs(
            post_recorder_rebuild_pending=True,
            delta_telemetry={"grid": {"drift_kwh": TRUST_DRIFT_INCONSISTENT_KWH + 1.0}},
        ),
    )
    assert r.level == "rebuilding"
    assert r.cause_code == "recorder_rebuild_from_store"


def test_inconsistent_on_large_drift() -> None:
    r = compute_trust(
        TrustInputs(
            delta_telemetry={"grid": {"drift_kwh": TRUST_DRIFT_INCONSISTENT_KWH}},
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "inconsistent"
    assert r.cause_code == "internal_total_diverges_from_meter"
    assert "grid" in r.cause_message


def test_ok_when_drift_below_threshold() -> None:
    r = compute_trust(
        TrustInputs(
            delta_telemetry={"grid": {"drift_kwh": TRUST_DRIFT_INCONSISTENT_KWH - 0.01}},
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "ok"


def test_degraded_unknown_bucket() -> None:
    r = compute_trust(
        TrustInputs(
            grid_unknown_bucket_kwh_today=0.02,
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "unknown_tariff_bucket"


def test_degraded_non_direct_method() -> None:
    r = compute_trust(
        TrustInputs(
            delta_telemetry={"grid": {"last_method": "fallback_last_known"}},
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "attribution_not_direct"


def test_degraded_large_gap() -> None:
    r = compute_trust(
        TrustInputs(
            delta_telemetry={"grid": {"last_gap_seconds": 7201.0}},
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "large_inter_delta_gap"


def test_degraded_tempo_rte_not_ready_before_slot() -> None:
    r = compute_trust(
        TrustInputs(
            is_edf_tempo_rte_not_ready=True,
            current_slot="bleu_hp",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "tempo_rte_calendar_not_ready"


def test_degraded_missing_slot() -> None:
    r = compute_trust(
        TrustInputs(current_slot=None),
    )
    assert r.level == "degraded"
    assert r.cause_code == "missing_current_slot"


def test_degraded_missing_slot_empty_string() -> None:
    r = compute_trust(
        TrustInputs(current_slot=""),
    )
    assert r.level == "degraded"
    assert r.cause_code == "missing_current_slot"


def test_degraded_battery_partial() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            battery_data_quality="partial",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "battery_data_partial_or_poor"


def test_degraded_delta_discards() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            delta_discards={"discarded_negative": 1},
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "delta_discards_present"


def test_staleness_only_when_sources_configured() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            has_configured_energy_sources=False,
            seconds_since_last_applied_delta=TRUST_STALENESS_DEGRADED_SECONDS + 1.0,
        ),
    )
    assert r.level == "ok"


def test_degraded_stale_meters() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            has_configured_energy_sources=True,
            seconds_since_last_applied_delta=TRUST_STALENESS_DEGRADED_SECONDS + 1.0,
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "stale_meter_data"


def test_data_quality_degraded_fallback() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            data_quality="degraded",
        ),
    )
    assert r.level == "degraded"
    assert r.cause_code == "data_quality_degraded"


def test_inconsistent_priority_over_degraded_signals() -> None:
    r = compute_trust(
        TrustInputs(
            current_slot="bleu_hp",
            grid_unknown_bucket_kwh_today=1.0,
            delta_telemetry={"grid": {"drift_kwh": TRUST_DRIFT_INCONSISTENT_KWH}},
        ),
    )
    assert r.level == "inconsistent"
