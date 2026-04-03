"""Pure delta accumulator decision tests."""

from __future__ import annotations

import importlib
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
_ensure_pkg("hub_energie.energy", HUB_DIR / "energy")

acc_module = importlib.import_module("hub_energie.energy.accumulator")


def _norm(v: float) -> float:
    return round(float(v), 6)


def test_compute_delta_decision_applied_twice_is_idempotent_on_second_zero_delta() -> None:
    """Second sample with same counter yields no_delta and does not double-count."""
    src = {"grid": "sensor.g"}
    raw = {"grid": 10.0}
    r1, p1 = acc_module.compute_delta_decision(
        source_entity_by_source=src,
        last_raw_by_source=raw,
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.g",
        normalized_new=_norm(11.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda *_: False,
    )
    assert r1.outcome == "applied"
    assert p1.add_to_accum is not None
    raw["grid"] = 11.0
    r2, p2 = acc_module.compute_delta_decision(
        source_entity_by_source=src,
        last_raw_by_source=raw,
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.g",
        normalized_new=_norm(11.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda *_: False,
    )
    assert r2.outcome == "no_delta"
    assert p2.add_to_accum is None


def test_compute_delta_decision_unrealistic_rebases_last_raw() -> None:
    """Spurious one-shot spike: discard energy but follow the meter to avoid deadlock."""
    r, patch = acc_module.compute_delta_decision(
        source_entity_by_source={"grid": "sensor.g"},
        last_raw_by_source={"grid": 5.0},
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.g",
        normalized_new=_norm(500.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 10.0,
        is_plausible_reset=lambda *_: False,
    )
    assert r.outcome == "discarded_unrealistic"
    assert r.should_save is True
    assert patch.update_last_raw is True
    assert patch.last_raw_value == _norm(500.0)
    assert r.last_raw == 5.0
    assert r.new_raw == _norm(500.0)


def test_compute_delta_decision_small_negative_rebases_without_accum() -> None:
    r, patch = acc_module.compute_delta_decision(
        source_entity_by_source={"grid": "sensor.g"},
        last_raw_by_source={"grid": 10.0},
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.g",
        normalized_new=_norm(9.95),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda *_: False,
        small_negative_rebase_max_kwh=0.1,
    )
    assert r.outcome == "rebased_noise"
    assert r.should_save is True
    assert patch.update_last_raw is True
    assert patch.last_raw_value == _norm(9.95)
    assert patch.add_to_accum is None
