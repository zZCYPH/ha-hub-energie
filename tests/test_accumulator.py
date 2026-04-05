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


def _base_kw(
    *,
    src: dict[str, str],
    raw: dict[str, float],
    day: str = "2026-01-01",
    slot: str = "bleu_hp",
    source_key: str = "grid",
    entity_id: str = "sensor.g",
    max_delta: float = 200.0,
    no_reset: bool = True,
    band: float = 0.1,
):
    return dict(
        source_entity_by_source=src,
        last_raw_by_source=raw,
        day=day,
        slot=slot,
        source_key=source_key,
        entity_id=entity_id,
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: max_delta,
        is_plausible_reset=(lambda *_: False) if no_reset else None,
        small_negative_rebase_max_kwh=band,
    )


def test_compute_delta_decision_positive_delta_applied_with_accum_tuple() -> None:
    src = {"grid": "sensor.g"}
    raw: dict[str, float] = {}
    kw = _base_kw(src=src, raw=raw)
    kw["is_plausible_reset"] = lambda *_: False
    r, p = acc_module.compute_delta_decision(
        normalized_new=_norm(42.0),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r.outcome == "initialized"
    raw["grid"] = 42.0
    r2, p2 = acc_module.compute_delta_decision(
        normalized_new=_norm(45.5),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r2.outcome == "applied"
    assert r2.delta_kwh == _norm(3.5)
    assert p2.add_to_accum == ("2026-01-01", "bleu_hp", "grid", _norm(3.5))


def test_compute_delta_decision_zero_delta_no_save_but_updates_last_raw() -> None:
    """Document: same reading keeps last_raw aligned without persisting a no-op."""
    src = {"grid": "sensor.g"}
    raw = {"grid": 10.0}
    kw = _base_kw(src=src, raw=raw)
    kw["is_plausible_reset"] = lambda *_: False
    r, p = acc_module.compute_delta_decision(
        normalized_new=_norm(10.0),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r.outcome == "no_delta"
    assert r.should_save is False
    assert p.update_last_raw is True
    assert p.last_raw_value == _norm(10.0)
    assert p.add_to_accum is None


def test_compute_delta_decision_applied_twice_is_idempotent_on_second_zero_delta() -> None:
    """Second sample with same counter yields no_delta and does not double-count."""
    src = {"grid": "sensor.g"}
    raw = {"grid": 10.0}
    kw = _base_kw(src=src, raw=raw)
    kw["is_plausible_reset"] = lambda *_: False
    r1, p1 = acc_module.compute_delta_decision(
        normalized_new=_norm(11.0),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r1.outcome == "applied"
    assert p1.add_to_accum is not None
    raw["grid"] = 11.0
    r2, p2 = acc_module.compute_delta_decision(
        normalized_new=_norm(11.0),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r2.outcome == "no_delta"
    assert p2.add_to_accum is None


def test_compute_delta_decision_unrealistic_rebases_last_raw() -> None:
    """Spurious one-shot spike: discard energy but follow the meter to avoid deadlock."""
    kw = _base_kw(
        src={"grid": "sensor.g"},
        raw={"grid": 5.0},
        max_delta=10.0,
    )
    kw["is_plausible_reset"] = lambda *_: False
    r, patch = acc_module.compute_delta_decision(
        normalized_new=_norm(500.0),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r.outcome == "discarded_unrealistic"
    assert r.should_save is True
    assert patch.update_last_raw is True
    assert patch.last_raw_value == _norm(500.0)
    assert r.last_raw == 5.0
    assert r.new_raw == _norm(500.0)


def test_compute_delta_decision_small_negative_rebases_without_accum() -> None:
    kw = _base_kw(src={"grid": "sensor.g"}, raw={"grid": 10.0})
    kw["is_plausible_reset"] = lambda *_: False
    r, patch = acc_module.compute_delta_decision(
        normalized_new=_norm(9.95),
        **{k: v for k, v in kw.items() if k != "small_negative_rebase_max_kwh"},
        small_negative_rebase_max_kwh=0.1,
    )
    assert r.outcome == "rebased_noise"
    assert r.should_save is True
    assert patch.update_last_raw is True
    assert patch.last_raw_value == _norm(9.95)
    assert patch.add_to_accum is None


def test_compute_delta_decision_plausible_reset_rebases_without_accum() -> None:
    kw = _base_kw(src={"grid": "sensor.g"}, raw={"grid": 100.0}, band=0.05)
    r, patch = acc_module.compute_delta_decision(
        normalized_new=_norm(5.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda sk, last, new: sk == "grid" and last > new,
        small_negative_rebase_max_kwh=0.05,
        source_entity_by_source=kw["source_entity_by_source"],
        last_raw_by_source=kw["last_raw_by_source"],
        day=kw["day"],
        slot=kw["slot"],
        source_key=kw["source_key"],
        entity_id=kw["entity_id"],
    )
    assert r.outcome == "reset_rebased"
    assert r.should_save is True
    assert patch.update_last_raw is True
    assert patch.last_raw_value == _norm(5.0)
    assert patch.add_to_accum is None
    assert r.delta_kwh < 0


def test_compute_delta_decision_discarded_negative_keeps_last_raw() -> None:
    kw = _base_kw(src={"grid": "sensor.g"}, raw={"grid": 100.0}, band=0.01)
    r, patch = acc_module.compute_delta_decision(
        normalized_new=_norm(50.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda *_: False,
        small_negative_rebase_max_kwh=0.01,
        source_entity_by_source=kw["source_entity_by_source"],
        last_raw_by_source=kw["last_raw_by_source"],
        day=kw["day"],
        slot=kw["slot"],
        source_key=kw["source_key"],
        entity_id=kw["entity_id"],
    )
    assert r.outcome == "discarded_negative"
    assert r.should_save is False
    assert patch.update_last_raw is False
    assert patch.add_to_accum is None


def test_compute_delta_decision_source_changed_rebases_no_accum() -> None:
    r, patch = acc_module.compute_delta_decision(
        source_entity_by_source={"grid": "sensor.old"},
        last_raw_by_source={"grid": 99.0},
        day="2026-01-01",
        slot="bleu_hp",
        source_key="grid",
        entity_id="sensor.new",
        normalized_new=_norm(10.0),
        normalize_kwh=_norm,
        max_delta_kwh_for_source=lambda _s: 200.0,
        is_plausible_reset=lambda *_: False,
    )
    assert r.outcome == "source_changed"
    assert patch.add_to_accum is None
    assert patch.last_raw_value == _norm(10.0)


def test_sequence_rise_noise_negative_then_rise_again() -> None:
    src = {"grid": "sensor.g"}
    raw = {"grid": 10.0}
    applied = 0.0

    def step(new: float, **kwargs):
        nonlocal applied
        r, p = acc_module.compute_delta_decision(
            source_entity_by_source=src,
            last_raw_by_source=raw,
            day="2026-01-01",
            slot="bleu_hp",
            source_key="grid",
            entity_id="sensor.g",
            normalized_new=_norm(new),
            normalize_kwh=_norm,
            max_delta_kwh_for_source=lambda _s: 200.0,
            is_plausible_reset=lambda *_: False,
            small_negative_rebase_max_kwh=0.1,
            **kwargs,
        )
        if p.update_last_raw:
            raw["grid"] = p.last_raw_value
        if p.add_to_accum:
            applied += p.add_to_accum[3]
        return r, p

    step(12.0)
    assert applied == _norm(2.0)
    r2, _ = step(11.95)
    assert r2.outcome == "rebased_noise"
    assert applied == _norm(2.0)
    step(15.0)
    assert applied == _norm(5.05)


def test_sequence_rise_unrealistic_spike_then_normal_rise() -> None:
    src = {"grid": "sensor.g"}
    raw = {"grid": 10.0}
    applied = 0.0

    def step(new: float):
        nonlocal applied
        r, p = acc_module.compute_delta_decision(
            source_entity_by_source=src,
            last_raw_by_source=raw,
            day="2026-06-01",
            slot="bleu_hp",
            source_key="grid",
            entity_id="sensor.g",
            normalized_new=_norm(new),
            normalize_kwh=_norm,
            max_delta_kwh_for_source=lambda _s: 10.0,
            is_plausible_reset=lambda *_: False,
        )
        if p.update_last_raw:
            raw["grid"] = p.last_raw_value
        if p.add_to_accum:
            applied += p.add_to_accum[3]
        return r

    assert step(12.0) .outcome == "applied"
    assert applied == _norm(2.0)
    assert step(5000.0).outcome == "discarded_unrealistic"
    assert raw["grid"] == _norm(5000.0)
    assert applied == _norm(2.0)
    assert step(5001.0).outcome == "applied"
    assert applied == _norm(3.0)


def test_sequence_counter_reset_then_import_continues() -> None:
    src = {"grid": "sensor.g"}
    raw = {"grid": 500.0}
    applied = 0.0

    def plausible_reset(sk: str, last: float, new: float) -> bool:
        return sk == "grid" and new <= 0.1

    def step(new: float):
        nonlocal applied
        r, p = acc_module.compute_delta_decision(
            source_entity_by_source=src,
            last_raw_by_source=raw,
            day="2026-03-01",
            slot="bleu_hp",
            source_key="grid",
            entity_id="sensor.g",
            normalized_new=_norm(new),
            normalize_kwh=_norm,
            max_delta_kwh_for_source=lambda _s: 300.0,
            is_plausible_reset=plausible_reset,
        )
        if p.update_last_raw:
            raw["grid"] = p.last_raw_value
        if p.add_to_accum:
            applied += p.add_to_accum[3]
        return r

    assert step(0.05).outcome == "reset_rebased"
    assert applied == 0.0
    assert raw["grid"] == _norm(0.05)
    assert step(3.0).outcome == "applied"
    assert applied == _norm(2.95)
