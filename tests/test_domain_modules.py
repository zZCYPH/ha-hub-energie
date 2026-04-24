"""Unit tests for extracted pure hub_energie domain modules."""

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
_ensure_pkg("hub_energie.energy", HUB_DIR / "energy")
_ensure_pkg("hub_energie.power", HUB_DIR / "power")
_ensure_pkg("hub_energie.battery", HUB_DIR / "battery")

energy_aggregation = importlib.import_module("hub_energie.energy.energy_aggregation")
origin_module = importlib.import_module("hub_energie.energy.origin")
costs_module = importlib.import_module("hub_energie.energy.costs")
power_flow_module = importlib.import_module("hub_energie.power.power_flow")
reinjection_module = importlib.import_module("hub_energie.power.reinjection")
battery_metrics_module = importlib.import_module("hub_energie.battery.battery_metrics")


SLOTS = ("bleu_hc", "bleu_hp", "blanc_hc", "blanc_hp", "rouge_hc", "rouge_hp")


def test_energy_and_origin_computation() -> None:
    energy = energy_aggregation.compute_energy(
        grid={slot: 1.0 for slot in SLOTS},
        solar={slot: 0.5 for slot in SLOTS},
        battery_charge={slot: 0.2 for slot in SLOTS},
        battery_discharge={slot: 0.3 for slot in SLOTS},
        slots=SLOTS,
    )
    assert energy.home["bleu_hc"] == pytest.approx(1.8)
    assert energy.maison["rouge_hp"] == pytest.approx(1.8)
    assert energy.batt_charge["bleu_hp"] == pytest.approx(0.2)

    origin = origin_module.compute_origin_and_usage(energy, SLOTS)
    assert origin.origin_grid_total >= 0.0
    assert origin.origin_solar_total >= 0.0
    assert origin.usage_grid_batt_charge == pytest.approx(0.6)
    assert origin.usage_solar_batt_charge == pytest.approx(0.6)


def test_costs_and_savings() -> None:
    rates = {slot: 0.2 for slot in SLOTS}
    cost = costs_module.compute_costs(
        grid_by_slot={slot: 1.0 for slot in SLOTS},
        rates_by_slot=rates,
        slots=SLOTS,
        abonnement_eur=0.3,
    )
    assert cost.cost_total == pytest.approx(1.5)

    eco_solar, eco_battery = costs_module.compute_savings(
        solar_by_slot={slot: 0.5 for slot in SLOTS},
        battery_charge_by_slot={slot: 0.1 for slot in SLOTS},
        battery_discharge_by_slot={slot: 0.2 for slot in SLOTS},
        rates_by_slot=rates,
        slots=SLOTS,
        is_hc_slot=lambda s: s.endswith("_hc"),
    )
    assert eco_solar == pytest.approx(0.6)
    assert eco_battery > 0.0


def test_solar_self_use_kwh_by_slot_and_eco_solar() -> None:
    """Solar savings basis excludes PV to battery and grid export (per slot)."""
    slots = SLOTS
    zeros = {slot: 0.0 for slot in slots}
    solar_prod = {**zeros, "bleu_hp": 10.0}
    solar_to_batt = {**zeros, "bleu_hp": 3.0}
    export = {**zeros, "bleu_hp": 2.0}
    self_use = costs_module.solar_self_use_kwh_by_slot(
        solar_production_by_slot=solar_prod,
        solar_to_battery_by_slot=solar_to_batt,
        grid_export_by_slot=export,
        slots=slots,
    )
    assert self_use["bleu_hp"] == pytest.approx(5.0)
    rates = {slot: 0.2 for slot in slots}
    eco_solar, eco_batt = costs_module.compute_savings(
        solar_by_slot=self_use,
        battery_charge_by_slot=dict(zeros),
        battery_discharge_by_slot=dict(zeros),
        rates_by_slot=rates,
        slots=slots,
        is_hc_slot=lambda s: s.endswith("_hc"),
    )
    assert eco_solar == pytest.approx(1.0)
    assert eco_batt == pytest.approx(0.0)


def test_power_flow_measured_and_inferred_modes() -> None:
    measured = power_flow_module.compute_power_flow(
        p_grid_raw=100.0,
        p_solar=900.0,
        p_batt_dis=100.0,
        p_batt_charge=50.0,
        p_load_measured=1000.0,
        grid_export_positive=False,
    )
    assert measured.power_model_mode == "measured"
    assert measured.p_load == pytest.approx(1000.0)
    assert measured.home_power_for_flows == pytest.approx(
        measured.solar_to_home + measured.battery_to_home + measured.grid_to_home
    )
    assert measured.grid_to_home >= 0.0

    inferred = power_flow_module.compute_power_flow(
        p_grid_raw=150.0,
        p_solar=400.0,
        p_batt_dis=50.0,
        p_batt_charge=0.0,
        p_load_measured=None,
        grid_export_positive=False,
    )
    assert inferred.power_model_mode == "inferred"
    assert inferred.p_load is not None
    assert inferred.home_power_for_flows >= 0.0


def test_reinjection_is_deterministic_for_same_inputs() -> None:
    thresholds = reinjection_module.ReinjectionThresholds(
        export_ignore_below_w=30.0,
        short_export_max_s=90.0,
        short_export_max_w=500.0,
        export_vs_solar_fraction=0.15,
        export_min_abs_w=100.0,
        min_solar_for_classify_w=150.0,
        batt_charge_significant_w=60.0,
        battery_full_min_soc_frac=0.95,
    )
    now = datetime(2026, 4, 2, 12, 0, tzinfo=timezone.utc)
    active_since = now - timedelta(seconds=30)
    d1, a1 = reinjection_module.classify_reinjection_cause(
        p_export=220.0,
        p_solar=900.0,
        p_batt_charge=20.0,
        has_battery=True,
        now=now,
        export_active_since=active_since,
        soc_fill_ratio=0.98,
        soc_at_or_above_max=True,
        thresholds=thresholds,
        cause_unattributed="unattributed",
        cause_battery_full_or_absent="battery_full_or_absent",
        cause_switch_latency="switch_latency",
        cause_solar_surplus="solar_surplus",
    )
    d2, a2 = reinjection_module.classify_reinjection_cause(
        p_export=220.0,
        p_solar=900.0,
        p_batt_charge=20.0,
        has_battery=True,
        now=now,
        export_active_since=active_since,
        soc_fill_ratio=0.98,
        soc_at_or_above_max=True,
        thresholds=thresholds,
        cause_unattributed="unattributed",
        cause_battery_full_or_absent="battery_full_or_absent",
        cause_switch_latency="switch_latency",
        cause_solar_surplus="solar_surplus",
    )
    assert d1 == d2
    assert a1 == a2


def test_battery_metrics_quality_partial() -> None:
    warnings: list[str] = []
    day_acc = {
        "batt_charge:b1": {slot: 0.1 for slot in SLOTS},
        "batt_discharge:b1": {slot: 0.2 for slot in SLOTS},
        "batt_charge:b2": {slot: 0.0 for slot in SLOTS},
        "batt_discharge:b2": {slot: 0.0 for slot in SLOTS},
    }
    batteries = [
        {"id": "b1", "name": "Battery 1", "soc": "sensor.b1_soc", "capacity": 5.0},
        {"id": "b2", "name": "Battery 2", "capacity": 4.0},
    ]

    def slot_values(payload: dict[str, dict[str, float]], key: str) -> dict[str, float]:
        return {slot: float(payload.get(key, {}).get(slot, 0.0)) for slot in SLOTS}

    def read_power(_entity: str | None) -> float | None:
        return None

    def read_energy(_entity: str | None) -> float | None:
        return None

    def read_soc(entity: str | None) -> float | None:
        return 80.0 if entity == "sensor.b1_soc" else None

    def resolve_param(batt: dict[str, object], value_key: str, _entity_key: str, **_kwargs: object) -> float | None:
        value = batt.get(value_key)
        return float(value) if value is not None else None

    result = battery_metrics_module.compute_battery_metrics(
        day_acc=day_acc,
        battery_systems_cfg=batteries,
        slot_values=slot_values,
        read_power_w=read_power,
        read_energy_kwh=read_energy,
        read_soc_percent=read_soc,
        resolve_batt_param=resolve_param,
        net_sign_default="positive_discharge",
        net_sign_positive_charge="positive_charge",
        conf_keys={
            "batt_name": "name",
            "batt_power_in": "power_in",
            "batt_power_out": "power_out",
            "batt_power_net": "power_net",
            "batt_power_net_sign": "power_net_sign",
            "batt_soc": "soc",
            "batt_capacity_kwh": "capacity",
            "batt_capacity_kwh_entity": "capacity_entity",
            "batt_soc_min": "soc_min",
            "batt_soc_min_entity": "soc_min_entity",
            "batt_soc_max": "soc_max",
            "batt_soc_max_entity": "soc_max_entity",
            "batt_energy_available": "available_entity",
        },
        warn=warnings.append,
    )
    assert result.battery_data_quality == "partial"
    assert len(result.battery_systems) == 2
    assert warnings, "Expected warning for incomplete battery data"
