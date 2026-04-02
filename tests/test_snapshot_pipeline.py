"""Tests for snapshot orchestration pipeline."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Mapping

import pytest


HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.energy", HUB_DIR / "energy")
_ensure_pkg("hub_energie.power", HUB_DIR / "power")
_ensure_pkg("hub_energie.tempo", HUB_DIR / "tempo")
_ensure_pkg("hub_energie.snapshot", HUB_DIR / "snapshot")

energy_module = importlib.import_module("hub_energie.energy.energy_aggregation")
costs_module = importlib.import_module("hub_energie.energy.costs")
origin_module = importlib.import_module("hub_energie.energy.origin")
flow_module = importlib.import_module("hub_energie.power.power_flow")
tempo_module = importlib.import_module("hub_energie.tempo.tempo_logic")
builder_module = importlib.import_module("hub_energie.snapshot.snapshot_builder")
pipeline_module = importlib.import_module("hub_energie.snapshot.pipeline")

SLOTS = ("bleu_hc", "bleu_hp", "blanc_hc", "blanc_hp", "rouge_hc", "rouge_hp")


def test_pipeline_builds_snapshot_and_warns_flow_mismatch() -> None:
    day = "2026-04-03"
    now = datetime(2026, 4, 3, 12, 0, tzinfo=timezone.utc)
    day_acc = {
        "grid": {slot: 1.0 for slot in SLOTS},
        "solar": {slot: 0.2 for slot in SLOTS},
        "grid_export": {slot: 0.1 for slot in SLOTS},
    }
    rates = {slot: 0.2 for slot in SLOTS}

    def compute_energy(day_payload: Mapping[str, Any]):
        return energy_module.compute_energy(
            grid={slot: float(day_payload.get("grid", {}).get(slot, 0.0)) for slot in SLOTS},
            solar={slot: float(day_payload.get("solar", {}).get(slot, 0.0)) for slot in SLOTS},
            battery_charge={slot: 0.0 for slot in SLOTS},
            battery_discharge={slot: 0.0 for slot in SLOTS},
            slots=SLOTS,
        )

    def compute_costs(grid: Mapping[str, float], local_rates: Mapping[str, float], abo_day: float):
        return costs_module.compute_costs(
            grid_by_slot=dict(grid),
            rates_by_slot=dict(local_rates),
            slots=SLOTS,
            abonnement_eur=abo_day,
        )

    def compute_origin(energy):
        return origin_module.compute_origin_and_usage(energy, SLOTS)

    def compute_flow(**kwargs):
        return flow_module.compute_power_flow(grid_export_positive=False, **kwargs)

    def compute_tempo(_now: datetime):
        return tempo_module.TempoSnapshot(None, None, None, None)

    def update_diag(_day, _now, _rates, _flow, _cause):
        empty = {"solar_surplus": 0.0, "battery_full_or_absent": 0.0, "switch_latency": 0.0, "unattributed": 0.0}
        return empty, {}, empty, 0.0

    def compute_savings(_solar, _charge, _discharge, _rates):
        return 0.0, 0.0

    def classify(*_args):
        return "unattributed", 0.7, {"rule": "test"}

    deps = pipeline_module.SnapshotPipelineDeps(
        compute_energy_aggregation=compute_energy,
        compute_costs=compute_costs,
        compute_origin_and_usage=compute_origin,
        power_source_map=lambda: {"grid_power": "sensor.grid", "solar_power": None, "load_power": "sensor.load"},
        read_grid_power_total_w=lambda: 300.0,
        read_power_w=lambda _entity: 2000.0 if _entity == "sensor.load" else None,
        read_aggregate_battery_power=lambda: (0.0, None, False),
        compute_power_flow_model=compute_flow,
        aggregate_battery_soc_fill_ratio=lambda: None,
        any_battery_at_max=lambda: None,
        reinjection_option_float=lambda _key, default: default,
        classify_reinjection_cause=classify,
        update_reinjection_diagnostics=update_diag,
        compute_savings=compute_savings,
        battery_power_split_available=lambda: False,
        get_batt_charge_power_split_day=lambda _d: {},
        get_batt_charge_power_split_slot_day=lambda _d: {},
        usage_batt_charge_by_slot_from_heuristic=lambda _bc: ({slot: 0.0 for slot in SLOTS}, {slot: 0.0 for slot in SLOTS}),
        compute_tempo_snapshot=compute_tempo,
        compute_battery_metrics=lambda _d: ([], 0.0, 0.0, 0.0, "ok"),
        build_battery_card_metrics=lambda _b: None,
        compute_solar_estimate=lambda _n: (None, None, None),
        source_total=lambda _src: 0.0,
        slot_vals=lambda payload, src: {slot: float(payload.get(src, {}).get(slot, 0.0)) for slot in SLOTS},
        norm_kwh=lambda v: round(float(v), 6),
        build_snapshot=builder_module.build_snapshot,
    )
    pipeline = pipeline_module.SnapshotPipeline(SLOTS, deps)
    result = pipeline.run(
        pipeline_module.SnapshotPipelineInputs(
            day=day,
            now_paris=now,
            day_acc=day_acc,
            rates=rates,
            abonnement_day_eur=0.4,
            current_slot="bleu_hp",
            today_color="blue",
            tomorrow_color="white",
            is_edf=True,
            tariff_offer="tempo",
            contract_power="9",
            tariff_fetched_at=None,
            tempo_mode="rte",
            calendar_row_count=0,
            calendar_fetched_at=None,
            logic_version=1,
            supplier="edf",
            pricing_structure="tempo",
            phase_type="mono",
            has_batteries=False,
            solar_resale_configured=False,
            solar_export_tariff=0.0,
            debug_enabled=True,
            flow_mismatch_warn_threshold_w=30.0,
            flow_mismatch_warn_interval_s=300.0,
            last_flow_warn_ts=now - timedelta(hours=1),
            reinjection_confidence_grid=0.25,
            reinjection_confidence_solar=0.2,
            reinjection_confidence_battery=0.2,
            reinjection_confidence_load=0.05,
            min_soc_option_key="min_soc",
            min_soc_option_default=0.95,
            source_grid="grid",
            source_solar="solar",
            source_grid_export="grid_export",
            source_batt_charge_prefix="batt_charge:",
            source_batt_discharge_prefix="batt_discharge:",
            diag_cause_solar_surplus="solar_surplus",
            diag_cause_battery_full_or_absent="battery_full_or_absent",
            diag_cause_switch_latency="switch_latency",
            diag_cause_unattributed="unattributed",
        )
    )
    assert result.should_warn_flow_mismatch is True
    assert result.snapshot["day"] == day
    assert "debug_flow_gap_w" in result.snapshot
    assert result.snapshot["load_power_inferred"] is False
