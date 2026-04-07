"""Pure battery aggregation helpers (reinjection inputs)."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.battery", HUB_DIR / "battery")

const = importlib.import_module("hub_energie.const")
brt = importlib.import_module("hub_energie.battery.battery_runtime")


def test_aggregate_soc_fill_ratio_no_batteries() -> None:
    assert (
        brt.aggregate_battery_soc_fill_ratio(
            has_batteries=False,
            battery_systems=[],
            resolve_batt_param=lambda *_a, **_k: None,
            read_soc_normalized=lambda _e: None,
        )
        is None
    )


def test_aggregate_soc_fill_ratio_weighted() -> None:
    def _resolve(bcfg: object, sk: str, _ek: str, kind: str | None = None) -> float | None:
        if not isinstance(bcfg, dict):
            return None
        if sk == const.CONF_BATT_CAPACITY_KWH:
            return float(bcfg[sk])
        if kind == "soc" and sk == const.CONF_BATT_SOC_MAX:
            return 100.0
        return None

    systems = [
        {
            const.CONF_BATT_SOC: "e1",
            const.CONF_BATT_CAPACITY_KWH: 10.0,
        },
        {
            const.CONF_BATT_SOC: "e2",
            const.CONF_BATT_CAPACITY_KWH: 10.0,
        },
    ]

    def _read_norm(eid: str) -> float | None:
        return 0.5 if eid == "e1" else 1.0

    ratio = brt.aggregate_battery_soc_fill_ratio(
        has_batteries=True,
        battery_systems=systems,
        resolve_batt_param=_resolve,
        read_soc_normalized=_read_norm,
    )
    assert ratio is not None
    assert abs(ratio - 0.75) < 1e-9


def test_any_battery_at_max() -> None:
    def _resolve(bcfg: object, sk: str, _ek: str, kind: str | None = None) -> float | None:
        if kind == "soc" and sk == const.CONF_BATT_SOC_MAX:
            return 100.0
        return None

    systems = [{const.CONF_BATT_SOC: "s1"}]

    assert (
        brt.any_battery_at_max(
            has_batteries=False,
            battery_systems=systems,
            resolve_batt_param=_resolve,
            read_soc_percent=lambda _e: 99.95,
        )
        is None
    )
    assert (
        brt.any_battery_at_max(
            has_batteries=True,
            battery_systems=systems,
            resolve_batt_param=_resolve,
            read_soc_percent=lambda _e: 99.95,
        )
        is True
    )


def test_read_aggregate_battery_power_net_and_in_out() -> None:
    d, c, ok = brt.read_aggregate_battery_power(
        battery_systems=[],
        read_power_w=lambda _e: None,
    )
    assert d == 0.0 and c is None and ok is False

    cfg = [
        {
            const.CONF_BATT_POWER_NET: "n1",
            const.CONF_BATT_POWER_NET_SIGN: const.BATT_SIGN_POSITIVE_CHARGE,
        }
    ]

    d2, c2, ok2 = brt.read_aggregate_battery_power(
        battery_systems=cfg,
        read_power_w=lambda e: 500.0 if e == "n1" else None,
    )
    assert ok2 is True
    assert d2 == 0.0 and c2 == 500.0

    cfg2 = [
        {
            const.CONF_BATT_POWER_IN: "i1",
            const.CONF_BATT_POWER_OUT: "o1",
            const.CONF_BATT_POWER_NET_SIGN: "invalid",
        }
    ]
    d3, c3, ok3 = brt.read_aggregate_battery_power(
        battery_systems=cfg2,
        read_power_w=lambda e: {"i1": 100.0, "o1": 250.0}.get(e),  # type: ignore[arg-type]
    )
    assert ok3 is True
    assert d3 == 250.0 and c3 == 100.0
