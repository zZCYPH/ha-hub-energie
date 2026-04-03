"""Unit tests for storage manager, tempo logic and reinjection diagnostics."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest


HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.storage", HUB_DIR / "storage")
_ensure_pkg("hub_energie.tempo", HUB_DIR / "tempo")
_ensure_pkg("hub_energie.power", HUB_DIR / "power")
_ensure_pkg("hub_energie.snapshot", HUB_DIR / "snapshot")

store_module = importlib.import_module("hub_energie.storage.store_manager")
tempo_module = importlib.import_module("hub_energie.tempo.tempo_logic")
power_flow_module = importlib.import_module("hub_energie.power.power_flow")
diag_module = importlib.import_module("hub_energie.power.reinjection_diagnostics")
snapshot_module = importlib.import_module("hub_energie.snapshot.snapshot_builder")


SLOTS = ("bleu_hc", "bleu_hp", "blanc_hc", "blanc_hp", "rouge_hc", "rouge_hp")
CAUSES = (
    "solar_surplus",
    "battery_full_or_absent",
    "switch_latency",
    "unattributed",
)


def test_store_manager_validate_and_build_payload() -> None:
    manager = store_module.StoreManager(model_version=1, slots=SLOTS, decimals=3)
    valid = {
        "model_version": 1,
        "totals_kwh_by_source": {"grid": 10.1234},
        "slot_day_kwh": {
            "2026-04-02": {
                "grid": {"bleu_hp": 1.2, "bleu_hc": 0.4}
            }
        },
        "last_raw_by_source": {"grid": 100.55},
        "written_stats_days": ["2026-04-01"],
    }
    assert manager.validate_payload(valid)

    invalid_slot = {
        **valid,
        "slot_day_kwh": {"2026-04-02": {"grid": {"not_a_slot": 1.0}}},
    }
    assert not manager.validate_payload(invalid_slot)

    invalid_lts = {
        **valid,
        "lts_cumulative_kwh_by_statistic_id": {"hub_energie:slot_x": -0.5},
    }
    assert not manager.validate_payload(invalid_lts)

    built = manager.build_payload(
        totals_kwh_by_source={"grid": 10.12349},
        slot_day_kwh={"2026-04-02": {"grid": {"bleu_hp": 1.23456}}},
        last_raw_by_source={"grid": 100.55555},
        written_stats_days={"2026-04-01"},
        source_entity_by_source={"grid": "sensor.grid_energy"},
        diag_export_kwh={},
        diag_export_slot_kwh={},
        batt_charge_power_split_kwh={},
        batt_charge_power_split_slot_kwh={},
        last_stable_attribution_slot=None,
        lts_cumulative_kwh_by_statistic_id={"hub_energie:slot_grid_bleu_hp_kwh": 3.5},
    )
    assert built["totals_kwh_by_source"]["grid"] == pytest.approx(10.123)
    assert built["slot_day_kwh"]["2026-04-02"]["grid"]["bleu_hp"] == pytest.approx(1.235)
    assert built["last_raw_by_source"]["grid"] == pytest.approx(100.556)
    assert built["lts_cumulative_kwh_by_statistic_id"]["hub_energie:slot_grid_bleu_hp_kwh"] == pytest.approx(
        3.5
    )


def test_tempo_day_counters_excludes_current_day_from_elapsed() -> None:
    now = datetime(2026, 1, 10, 12, 0, tzinfo=timezone.utc)
    rows = [
        SimpleNamespace(
            value="BLUE",
            start=now - timedelta(days=1, hours=1),
            end=now - timedelta(days=1),
        ),
        SimpleNamespace(
            value="RED",
            start=now - timedelta(hours=1),
            end=now + timedelta(hours=1),
        ),
    ]
    quotas = {"blue": 300, "white": 43, "red": 22}
    counters = tempo_module.compute_tempo_day_counters(
        rows=rows,
        now_paris=now,
        season_quotas=quotas,
        tempo_supply_day_start_paris=lambda dt: dt,
    )
    assert counters is not None
    assert counters["blue"]["elapsed"] == 1
    assert counters["red"]["elapsed"] == 0
    assert counters["red"]["remaining"] == 21


def test_reinjection_diagnostics_accumulates_and_computes_opportunity() -> None:
    diag_export: dict[str, dict[str, float]] = {}
    diag_slot: dict[str, dict[str, dict[str, float]]] = {}
    batt_split: dict[str, dict[str, float]] = {}
    batt_split_slot: dict[str, dict[str, dict[str, float]]] = {}

    def ensure_diag_day(day: str) -> dict[str, float]:
        row = diag_export.setdefault(day, {})
        for cause in CAUSES:
            row.setdefault(cause, 0.0)
        return row

    def ensure_diag_slot_day(day: str) -> dict[str, dict[str, float]]:
        row = diag_slot.setdefault(day, {})
        for cause in CAUSES:
            by_slot = row.setdefault(cause, {})
            for slot in SLOTS:
                by_slot.setdefault(slot, 0.0)
        return row

    def ensure_split_day(day: str) -> dict[str, float]:
        row = batt_split.setdefault(day, {})
        row.setdefault("solar", 0.0)
        row.setdefault("grid", 0.0)
        return row

    def ensure_split_slot_day(day: str) -> tuple[dict[str, float], dict[str, float]]:
        row = batt_split_slot.setdefault(day, {})
        grid = row.setdefault("grid", {})
        solar = row.setdefault("solar", {})
        for slot in SLOTS:
            grid.setdefault(slot, 0.0)
            solar.setdefault(slot, 0.0)
        return grid, solar

    flow = power_flow_module.compute_power_flow(
        p_grid_raw=200.0,
        p_solar=1000.0,
        p_batt_dis=100.0,
        p_batt_charge=300.0,
        p_load_measured=600.0,
        grid_export_positive=False,
    )

    now = datetime(2026, 4, 2, 12, 0, tzinfo=timezone.utc)
    result = diag_module.update_reinjection_diagnostics(
        day="2026-04-02",
        now_paris=now,
        rates={slot: 0.2 for slot in SLOTS},
        flow=flow,
        cause="solar_surplus",
        slots=SLOTS,
        diag_causes=CAUSES,
        current_slot="bleu_hp",
        last_ts=now - timedelta(hours=1),
        last_cause="solar_surplus",
        last_slot="bleu_hp",
        export_ignore_below_w=10.0,
        max_power_integration_seconds=3600.0,
        battery_power_split_available=True,
        ensure_diag_day=ensure_diag_day,
        ensure_diag_slot_day=ensure_diag_slot_day,
        ensure_batt_charge_split_day=ensure_split_day,
        ensure_batt_charge_split_slot_day=ensure_split_slot_day,
    )
    expected_export_kwh = flow.p_export / 1000.0
    assert result.diag_day["solar_surplus"] == pytest.approx(expected_export_kwh)
    assert result.diag_slot_day["solar_surplus"]["bleu_hp"] == pytest.approx(expected_export_kwh)
    assert result.diag_dirty is True
    assert result.opportunity_total >= 0.0


def test_snapshot_builder_keeps_expected_keys_and_debug_toggle() -> None:
    data = snapshot_module.SnapshotBuildInput(
        day="2026-04-02",
        current_slot="bleu_hp",
        today_color="blue",
        tomorrow_color="white",
        offer="tempo",
        contract_power="9",
        tariff_fetched_at=None,
        tempo_days=None,
        tempo_is_off_peak=False,
        tempo_next_colour_change_at=None,
        tempo_next_hc_start_at=None,
        grid={slot: 0.0 for slot in SLOTS},
        solar={slot: 0.0 for slot in SLOTS},
        batt_discharge={slot: 0.0 for slot in SLOTS},
        batt_charge={slot: 0.0 for slot in SLOTS},
        maison={slot: 0.0 for slot in SLOTS},
        cost_by_slot={slot: 0.0 for slot in SLOTS},
        cost_total=1.23456,
        abonnement_eur=0.12345,
        origin_grid=0.0,
        origin_grid_direct_maison_kwh=0.0,
        origin_grid_via_batterie_kwh=0.0,
        origin_solar=0.0,
        origin_solar_direct_maison_kwh=0.0,
        origin_solar_via_batterie_kwh=0.0,
        usage_grid_direct=0.0,
        usage_grid_batt_charge=0.0,
        usage_solar_direct=0.0,
        usage_solar_batt_charge=0.0,
        usage_batt_home=0.0,
        energy_grid_total_kwh=0.0,
        energy_solar_total_kwh=0.0,
        energy_export_total_kwh=0.0,
        energy_batt_charge_total_kwh=0.0,
        energy_batt_discharge_total_kwh=0.0,
        energy_grid_today_kwh=0.0,
        energy_solar_today_kwh=0.0,
        energy_export_today_kwh=0.0,
        energy_batt_charge_today_kwh=0.0,
        energy_batt_discharge_today_kwh=0.0,
        energy_home_today_kwh=0.0,
        usage_batt_charge_method="slot_heuristic",
        batt_charge_meter_kwh=0.0,
        usage_grid_batt_charge_by_slot_kwh={slot: 0.0 for slot in SLOTS},
        usage_solar_batt_charge_by_slot_kwh={slot: 0.0 for slot in SLOTS},
        reinjection_cause="unattributed",
        reinjection_confidence_pct=50.2345,
        reinjection_decision_confidence=0.5023,
        reinjection_decision_inputs={"x": 1},
        export_power_w=0.0,
        grid_power_signed_w=None,
        solar_power_w=None,
        batt_discharge_power_w=None,
        batt_charge_power_w=None,
        load_power_w=None,
        home_power_w=0.0,
        grid_import_power_w=0.0,
        battery_discharge_power_w=0.0,
        solar_production_power_w=0.0,
        solar_to_home_power_w=0.0,
        battery_to_home_power_w=0.0,
        grid_to_home_power_w=0.0,
        solar_to_battery_power_w=0.0,
        grid_to_battery_power_w=0.0,
        solar_export_power_w=0.0,
        power_model_mode="inferred",
        load_power_inferred=True,
        export_due_to_solar_surplus_kwh=0.0,
        export_due_to_battery_full_or_absent_kwh=0.0,
        export_due_to_switch_latency_kwh=0.0,
        export_unattributed_kwh=0.0,
        export_opportunity_cost_total_eur=0.0,
        export_opportunity_cost_solar_surplus_eur=0.0,
        export_opportunity_cost_battery_full_or_absent_eur=0.0,
        export_opportunity_cost_switch_latency_eur=0.0,
        export_opportunity_cost_unattributed_eur=0.0,
        eco_solar=0.0,
        eco_batt=0.0,
        tempo_mode="rte",
        rte_calendar_row_count=0,
        rte_calendar_fetched_at=None,
        logic_version=1,
        battery_systems=[],
        battery_card=None,
        battery_total_charge_kwh=0.0,
        battery_total_discharge_kwh=0.0,
        battery_total_net_power_w=0.0,
        battery_data_quality="ok",
        solar_estimate_power_w=None,
        solar_estimate_daily_kwh=None,
        solar_estimate_yearly_kwh=None,
        solar_export_revenue_eur=None,
        supplier="edf",
        pricing_structure="tempo",
        phase_type="mono",
        debug_enabled=False,
        debug_flow_gap_w=12.3456,
        debug_modelled_home_power_w=345.6789,
    )
    snapshot = snapshot_module.build_snapshot(data)
    assert "day" in snapshot
    assert "power_model_mode" in snapshot
    assert "debug_flow_gap_w" not in snapshot
    assert snapshot["reinjection_confidence"] == pytest.approx(50.2)

    data_debug = snapshot_module.SnapshotBuildInput(**{**data.__dict__, "debug_enabled": True})
    snapshot_debug = snapshot_module.build_snapshot(data_debug)
    assert snapshot_debug["debug_flow_gap_w"] == pytest.approx(12.346)
