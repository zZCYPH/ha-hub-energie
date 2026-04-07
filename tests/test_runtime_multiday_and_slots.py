"""Runtime invariants: multi-day accumulation, unrealistic deltas, Paris day_start."""

from __future__ import annotations

import importlib
import sys
import types
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

runtime_state_module = importlib.import_module("hub_energie.runtime.state")
delta_policy_module = importlib.import_module("hub_energie.energy.delta_policy")
diag_state_module = importlib.import_module("hub_energie.diagnostics.reinjection_state")

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


def test_apply_delta_new_day_does_not_merge_into_previous_day() -> None:
    """Paris day change: energy goes to the new day's bucket; totals stay global."""
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS_FULL,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    policy = delta_policy_module.DeltaPolicy()

    state.apply_delta(
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=10.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    state.apply_delta(
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=12.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    state.apply_delta(
        day="2026-01-02",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=13.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert state.accum["2026-01-01"]["grid"]["bleu_hp"] == _norm(2.0)
    assert state.accum["2026-01-02"]["grid"]["bleu_hp"] == _norm(1.0)
    assert state.totals_kwh_by_source["grid"] == _norm(3.0)


def test_add_rebuilt_value_twice_doubles_slot_documented_non_idempotent() -> None:
    """Second rebuild ingest for the same day/slot adds again (no dedupe)."""
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS_FULL,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    state.add_rebuilt_value(
        day="2026-01-10",
        source_key="grid",
        slot="bleu_hp",
        value=2.0,
        normalize_kwh=_norm,
    )
    state.add_rebuilt_value(
        day="2026-01-10",
        source_key="grid",
        slot="bleu_hp",
        value=2.0,
        normalize_kwh=_norm,
    )
    assert state.accum["2026-01-10"]["grid"]["bleu_hp"] == _norm(4.0)
    assert state.totals_kwh_by_source["grid"] == _norm(4.0)


def test_positive_delta_with_unknown_slot_accumulates_in_unknown_bucket() -> None:
    """Energy is not dropped when attribution resolves to SLOT_UNKNOWN."""
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS_FULL,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    policy = delta_policy_module.DeltaPolicy()
    state.apply_delta(
        day="2026-06-01",
        slot="unknown",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=5.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    state.apply_delta(
        day="2026-06-01",
        slot="unknown",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=8.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert state.accum["2026-06-01"]["grid"]["unknown"] == _norm(3.0)
    assert state.totals_kwh_by_source["grid"] == _norm(3.0)


def test_unrealistic_delta_rebases_last_raw_without_counting_energy() -> None:
    diag = diag_state_module.ReinjectionState(
        slots=SLOTS_FULL,
        diag_causes=CAUSES,
        default_cause="unattributed",
    )
    state = runtime_state_module.RuntimeState(slots=SLOTS_FULL, reinjection_state=diag)
    policy = delta_policy_module.DeltaPolicy()
    state.apply_delta(
        day="2026-06-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=5.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    state.apply_delta(
        day="2026-06-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.grid",
        normalized_new=5000.0,
        normalize_kwh=_norm,
        delta_policy=policy,
    )
    assert state.last_raw["grid"] == _norm(5000.0)
    assert state.totals_kwh_by_source.get("grid", 0.0) == _norm(0.0)
