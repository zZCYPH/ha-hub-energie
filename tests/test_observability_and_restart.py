"""Tests for energy observability helpers, rejections, and hydrate/apply invariants."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.diagnostics", HUB_DIR / "diagnostics")
_ensure_pkg("hub_energie.runtime", HUB_DIR / "runtime")
_ensure_pkg("hub_energie.energy", HUB_DIR / "energy")
_ensure_pkg("hub_energie.storage", HUB_DIR / "storage")

store_manager_module = importlib.import_module("hub_energie.storage.store_manager")
delta_obs_module = importlib.import_module("hub_energie.energy.delta_observability")
runtime_state_module = importlib.import_module("hub_energie.runtime.state")
delta_policy_module = importlib.import_module("hub_energie.energy.delta_policy")
diag_state_module = importlib.import_module("hub_energie.diagnostics.reinjection_state")

seconds_since = delta_obs_module.seconds_since_last_applied_delta
RuntimeState = runtime_state_module.RuntimeState
DeltaPolicy = delta_policy_module.DeltaPolicy
ReinjectionState = diag_state_module.ReinjectionState

SLOTS_FULL = (
    "bleu_hc",
    "bleu_hp",
    "blanc_hc",
    "blanc_hp",
    "rouge_hc",
    "rouge_hp",
    "unknown",
)
CAUSES = ("solar_surplus", "battery_full_or_absent", "switch_latency", "unattributed")


def _norm(v: float) -> float:
    return round(float(v), 6)


def test_seconds_since_last_applied_uses_latest_timestamp() -> None:
    t0 = datetime(2026, 4, 3, 12, 0, 0, tzinfo=timezone.utc)
    telemetry = {
        "grid": {"last_applied_at": (t0 - timedelta(minutes=5)).isoformat()},
        "solar": {"last_applied_at": t0.isoformat()},
    }
    now = t0 + timedelta(seconds=30)
    sec = seconds_since(telemetry, now_utc=now)
    assert sec == pytest.approx(30.0)


def test_seconds_since_last_applied_none_when_empty() -> None:
    assert seconds_since({}, now_utc=datetime.now(timezone.utc)) is None


def test_last_delta_rejection_recorded_on_runtime_state() -> None:
    diag = ReinjectionState(slots=SLOTS_FULL, diag_causes=CAUSES, default_cause="unattributed")
    state = RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    state.record_last_delta_rejection(
        "grid",
        reason="discarded_negative",
        at_iso="2026-04-03T10:00:00+00:00",
        delta_kwh=-0.5,
        last_raw=10.0,
        new_raw=9.2,
    )
    row = state.last_delta_rejection_by_source["grid"]
    assert row["reason"] == "discarded_negative"
    assert row["delta_kwh"] == -0.5


def test_hydrate_then_identical_meter_reading_yields_no_delta() -> None:
    """After restart, applying the same kWh reading must not add energy again."""
    diag = ReinjectionState(slots=SLOTS_FULL, diag_causes=CAUSES, default_cause="unattributed")
    state = RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    policy = DeltaPolicy()

    state.apply_delta(
        day="2026-04-02",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=100.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    state.apply_delta(
        day="2026-04-02",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=101.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    sm = store_manager_module.StoreManager(model_version=1, slots=SLOTS_FULL, decimals=6)
    payload = state.export_store_payload(store_manager=sm)

    state2 = RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    hydrate_payload = {k: v for k, v in payload.items() if k != "model_version"}
    state2.hydrate(
        hydrate_payload,
        normalize_kwh=_norm,
        safe_float=store_manager_module.safe_float,
    )
    no_change = state2.apply_delta(
        day="2026-04-02",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=101.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert no_change.outcome == "no_delta"
    assert state2.totals_kwh_by_source["grid"] == state.totals_kwh_by_source["grid"]
