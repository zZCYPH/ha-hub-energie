"""Tests for ``battery_metrics`` aggregation (card summary + per-battery row builder)."""

from __future__ import annotations

import importlib

batt = importlib.import_module("hub_energie.battery.battery_metrics")
const = importlib.import_module("hub_energie.const")

_CONF = {
    "batt_name": const.CONF_BATT_NAME,
    "batt_power_in": const.CONF_BATT_POWER_IN,
    "batt_power_out": const.CONF_BATT_POWER_OUT,
    "batt_power_net": const.CONF_BATT_POWER_NET,
    "batt_power_net_sign": const.CONF_BATT_POWER_NET_SIGN,
    "batt_soc": const.CONF_BATT_SOC,
    "batt_capacity_kwh": const.CONF_BATT_CAPACITY_KWH,
    "batt_capacity_kwh_entity": const.CONF_BATT_CAPACITY_KWH_ENTITY,
    "batt_soc_min": const.CONF_BATT_SOC_MIN,
    "batt_soc_min_entity": const.CONF_BATT_SOC_MIN_ENTITY,
    "batt_soc_max": const.CONF_BATT_SOC_MAX,
    "batt_soc_max_entity": const.CONF_BATT_SOC_MAX_ENTITY,
    "batt_energy_available": const.CONF_BATT_ENERGY_AVAILABLE,
}


def test_compute_battery_card_metrics_empty() -> None:
    assert batt.compute_battery_card_metrics([]) is None


def test_compute_battery_card_metrics_skips_invalid_capacity() -> None:
    assert (
        batt.compute_battery_card_metrics(
            [{"nominal_capacity_kwh": 0, "soc": 50}, {"nominal_capacity_kwh": None, "soc": 50}]
        )
        is None
    )


def test_compute_battery_card_metrics_uses_stored_energy_when_present() -> None:
    out = batt.compute_battery_card_metrics(
        [
            {
                "nominal_capacity_kwh": 10.0,
                "soc": 50.0,
                "stored_energy_kwh": 4.2,
                "available_energy_kwh": 3.0,
                "soc_min_percent": 10.0,
                "soc_max_percent": 100.0,
            }
        ]
    )
    assert out is not None
    assert out["stored_kwh"] == 4.2
    assert out["available_kwh"] == 3.0


def test_compute_battery_card_metrics_derives_stored_from_soc_when_missing() -> None:
    out = batt.compute_battery_card_metrics(
        [{"nominal_capacity_kwh": 10.0, "soc": 50.0, "soc_min_percent": 0.0}]
    )
    assert out is not None
    assert out["stored_kwh"] == 5.0
    assert out["available_kwh"] == 5.0


def test_compute_battery_metrics_net_from_in_out() -> None:
    warnings: list[str] = []

    def _slot_values(_day_acc: object, _prefix: str) -> dict[str, float]:
        return {"bleu_hp": 1.0}

    def _resolve(bcfg: object, static_k: str, _entity_k: str, kind: str | None = None) -> float | None:
        if static_k == const.CONF_BATT_CAPACITY_KWH:
            v = bcfg.get(static_k) if isinstance(bcfg, dict) else None
            return float(v) if v is not None else None
        return None

    cfg = [
        {
            "id": "b1",
            const.CONF_BATT_NAME: "Pack A",
            const.CONF_BATT_POWER_IN: "s.in",
            const.CONF_BATT_POWER_OUT: "s.out",
            const.CONF_BATT_SOC: "s.soc",
            const.CONF_BATT_CAPACITY_KWH: 10.0,
        }
    ]

    def _rp(eid: str | None) -> float | None:
        if eid == "s.in":
            return 100.0
        if eid == "s.out":
            return 250.0
        if eid == "s.soc":
            return 40.0
        return None

    res = batt.compute_battery_metrics(
        day_acc={},
        battery_systems_cfg=cfg,
        slot_values=_slot_values,
        read_power_w=_rp,
        read_energy_kwh=lambda _e: None,
        read_soc_percent=_rp,
        resolve_batt_param=_resolve,
        net_sign_default="standard",
        net_sign_positive_charge="inverted",
        conf_keys=_CONF,
        warn=warnings.append,
    )
    assert res.battery_data_quality == "ok"
    assert res.battery_systems[0]["power_net"] == 150.0
    assert res.total_charge_kwh == 1.0
    assert res.total_discharge_kwh == 1.0


def test_compute_battery_metrics_net_sign_invert() -> None:
    cfg = [
        {
            "id": "b1",
            const.CONF_BATT_POWER_NET: "s.net",
            const.CONF_BATT_POWER_NET_SIGN: "inverted",
            const.CONF_BATT_SOC: "s.soc",
            const.CONF_BATT_CAPACITY_KWH: 5.0,
        }
    ]

    def _rp(eid: str | None) -> float | None:
        if eid == "s.net":
            return 200.0
        if eid == "s.soc":
            return 50.0
        return None

    res = batt.compute_battery_metrics(
        day_acc={},
        battery_systems_cfg=cfg,
        slot_values=lambda _d, _p: {},
        read_power_w=_rp,
        read_energy_kwh=lambda _e: None,
        read_soc_percent=_rp,
        resolve_batt_param=lambda *_a, **_k: None,
        net_sign_default="standard",
        net_sign_positive_charge="inverted",
        conf_keys=_CONF,
        warn=lambda _m: None,
    )
    assert res.battery_systems[0]["power_net"] == -200.0


def test_compute_battery_metrics_available_entity_overrides() -> None:
    cfg = [
        {
            "id": "b1",
            const.CONF_BATT_SOC: "s.soc",
            const.CONF_BATT_CAPACITY_KWH: 10.0,
            const.CONF_BATT_ENERGY_AVAILABLE: "s.avail",
        }
    ]

    def _rp(eid: str | None) -> float | None:
        if eid == "s.soc":
            return 50.0
        return None

    res = batt.compute_battery_metrics(
        day_acc={},
        battery_systems_cfg=cfg,
        slot_values=lambda _d, _p: {},
        read_power_w=lambda _e: None,
        read_energy_kwh=lambda e: 1.234 if e == "s.avail" else None,
        read_soc_percent=_rp,
        resolve_batt_param=lambda *_a, **_k: None,
        net_sign_default="standard",
        net_sign_positive_charge="inverted",
        conf_keys=_CONF,
        warn=lambda _m: None,
    )
    assert res.battery_systems[0]["available_energy_kwh"] == 1.234


def test_compute_battery_metrics_efficiency_and_partial_quality() -> None:
    warns: list[str] = []

    def _slot_values(_day_acc: object, prefix: str) -> dict[str, float]:
        if prefix.startswith("batt_charge:"):
            return {"bleu_hp": 2.0}
        if prefix.startswith("batt_discharge:"):
            return {"bleu_hp": 1.0}
        return {}

    def _resolve(bcfg: object, static_k: str, _entity_k: str, kind: str | None = None) -> float | None:
        if static_k == const.CONF_BATT_CAPACITY_KWH and isinstance(bcfg, dict):
            v = bcfg.get(static_k)
            return float(v) if v is not None else None
        return None

    cfg = [
        {
            "id": "b1",
            const.CONF_BATT_SOC: "s.soc",
            const.CONF_BATT_CAPACITY_KWH: 10.0,
        },
        {
            "id": "b2",
            const.CONF_BATT_CAPACITY_KWH: 5.0,
        },
    ]

    res = batt.compute_battery_metrics(
        day_acc={},
        battery_systems_cfg=cfg,
        slot_values=_slot_values,
        read_power_w=lambda _e: None,
        read_energy_kwh=lambda _e: None,
        read_soc_percent=lambda e: 50.0 if e == "s.soc" else None,
        resolve_batt_param=_resolve,
        net_sign_default="standard",
        net_sign_positive_charge="inverted",
        conf_keys=_CONF,
        warn=warns.append,
    )
    assert res.battery_systems[0]["efficiency"] == 0.5
    assert res.battery_data_quality == "partial"
    assert any("partial data" in w for w in warns)


def test_compute_battery_metrics_empty_systems_is_poor() -> None:
    res = batt.compute_battery_metrics(
        day_acc={},
        battery_systems_cfg=[],
        slot_values=lambda _d, _p: {},
        read_power_w=lambda _e: None,
        read_energy_kwh=lambda _e: None,
        read_soc_percent=lambda _e: None,
        resolve_batt_param=lambda *_a, **_k: None,
        net_sign_default="standard",
        net_sign_positive_charge="inverted",
        conf_keys=_CONF,
        warn=lambda _m: None,
    )
    assert res.battery_data_quality == "poor"
    assert res.battery_systems == []
