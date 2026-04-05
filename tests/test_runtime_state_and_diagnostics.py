"""Unit tests for runtime state and diagnostics state holders."""

from __future__ import annotations

import importlib

import pytest
import sys
import types
from pathlib import Path


HUB_DIR = Path(__file__).resolve().parents[1]


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

delta_policy_module = importlib.import_module("hub_energie.energy.delta_policy")
runtime_state_module = importlib.import_module("hub_energie.runtime.state")
store_manager_module = importlib.import_module("hub_energie.storage.store_manager")
diag_state_module = importlib.import_module("hub_energie.diagnostics.reinjection_state")


SLOTS = ("bleu_hc", "bleu_hp", "blanc_hc", "blanc_hp", "rouge_hc", "rouge_hp")
CAUSES = ("solar_surplus", "battery_full_or_absent", "switch_latency", "unattributed")


def _norm(v: float) -> float:
    return round(float(v), 6)


def test_runtime_state_apply_delta_handles_rebase_and_discard() -> None:
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS, reinjection_state=diag)
    policy = delta_policy_module.DeltaPolicy()

    first = state.apply_delta(
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=10.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert first.outcome == "initialized"
    assert first.should_save is True

    applied = state.apply_delta(
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=11.2,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert applied.outcome == "applied"
    assert state.accum["2026-01-01"]["grid"]["bleu_hp"] == _norm(1.2)
    assert state.totals_kwh_by_source["grid"] == _norm(1.2)

    discarded = state.apply_delta(
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid_total",
        normalized_new=10.8,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert discarded.outcome == "discarded_negative"
    assert state.last_raw["grid"] == _norm(11.2)


def test_runtime_state_cleanup_removes_old_related_days() -> None:
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS, reinjection_state=diag)

    for day in ("2026-01-01", "2026-01-02", "2026-01-03"):
        state.accum[day] = {"grid": {"bleu_hp": 1.0}}
        state.batt_charge_power_split_kwh[day] = {"grid": 0.1, "solar": 0.2}
        state.batt_charge_power_split_slot_kwh[day] = {"grid": {"bleu_hp": 0.1}, "solar": {"bleu_hp": 0.2}}
        diag.ensure_day(day)
        diag.ensure_slot_day(day)

    state.cleanup(keep_days=1)
    assert list(state.accum.keys()) == ["2026-01-03"]
    assert "2026-01-01" not in diag.diag_export_kwh
    assert "2026-01-02" not in state.batt_charge_power_split_kwh


def test_runtime_state_export_store_payload_top_level_keys_stable() -> None:
    """Regression guard: Store JSON top-level keys must not drift."""
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS, reinjection_state=diag)
    store = store_manager_module.StoreManager(model_version=1, slots=SLOTS, decimals=6)
    payload = state.export_store_payload(store_manager=store)
    expected = {
        "model_version",
        "totals_kwh_by_source",
        "slot_day_kwh",
        "last_raw_by_source",
        "drift_anchor_meter_by_source",
        "written_stats_days",
        "source_entity_by_source",
        "diag_export_kwh",
        "diag_export_slot_kwh",
        "batt_charge_power_split_kwh",
        "batt_charge_power_split_slot_kwh",
        "last_stable_attribution_slot",
        "lts_cumulative_kwh_by_statistic_id",
    }
    assert set(payload.keys()) == expected


def test_relative_meter_drift_uses_anchor_not_raw_counter() -> None:
    """Drift compares internal total to (meter − anchor), not to the raw cumulative meter."""
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS, reinjection_state=diag)
    state.totals_kwh_by_source["grid"] = _norm(10.0)
    state.reanchor_drift_meter_for_source("grid", meter_kwh=1000.0, normalize_kwh=_norm)
    assert state.drift_anchor_meter_by_source["grid"] == _norm(990.0)
    assert state.relative_meter_drift_kwh("grid", meter_kwh=1005.0, normalize_kwh=_norm) == pytest.approx(-5.0)
    state.totals_kwh_by_source["grid"] = _norm(15.0)
    assert state.relative_meter_drift_kwh("grid", meter_kwh=1005.0, normalize_kwh=_norm) == pytest.approx(0.0)
