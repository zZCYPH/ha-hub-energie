"""TariffResolver: EDF slot rates, subscription proration, generic flat/TOU/schedule."""

from __future__ import annotations

import importlib
import sys
import types
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

const = importlib.import_module("hub_energie.const")
tm = importlib.import_module("hub_energie.tariff_manager")
TariffResolver = tm.TariffResolver


def _edf_auto_options() -> dict:
    return {
        const.OPT_BLEU_HP: 0.15,
        "hp_bleu_ttc": 0.22,
        "hc_bleu_ttc": 0.12,
    }


def test_rate_unknown_slot_is_zero() -> None:
    r = TariffResolver({}, {const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO, "supplier": const.SUPPLIER_EDF})
    assert r.rate_for_slot(const.SLOT_UNKNOWN) == 0.0


def test_edf_auto_prefers_api_key_when_present() -> None:
    r = TariffResolver(
        _edf_auto_options(),
        {const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO, "supplier": const.SUPPLIER_EDF},
    )
    assert r.is_edf_auto is True
    assert r.rate_for_slot(const.OPT_BLEU_HP) == 0.22


def test_edf_auto_fallback_to_slot_option_on_bad_api_value() -> None:
    opts = {**_edf_auto_options(), "hp_bleu_ttc": "nope"}
    r = TariffResolver(
        opts,
        {const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO, "supplier": const.SUPPLIER_EDF},
    )
    assert r.rate_for_slot(const.OPT_BLEU_HP) == 0.15


def test_edf_manual_uses_option_per_slot() -> None:
    r = TariffResolver(
        {const.OPT_BLEU_HC: 0.09},
        {const.CONF_TARIFF_MODE: const.TARIFF_MODE_MANUAL, "supplier": const.SUPPLIER_EDF},
    )
    assert r.rate_for_slot(const.OPT_BLEU_HC) == 0.09


def test_other_supplier_flat_pricing() -> None:
    data = {
        "supplier": const.SUPPLIER_OTHER,
        const.CONF_PRICING_STRUCTURE: const.PRICING_FLAT,
        const.CONF_ENERGY_PRICE: 0.18,
    }
    r = TariffResolver({}, data)
    fixed = datetime(2026, 2, 2, 15, 0, 0)
    with patch.object(tm, "datetime") as mock_dt:
        mock_dt.now = lambda: fixed
        assert r.rate_for_slot("any") == 0.18


def test_other_supplier_tou_picks_window() -> None:
    data = {
        "supplier": const.SUPPLIER_OTHER,
        const.CONF_PRICING_STRUCTURE: const.PRICING_TIME_OF_USE,
        const.CONF_TOU_PERIODS: [
            {"start": "08:00", "end": "20:00", "price": 0.2},
            {"start": "20:00", "end": "08:00", "price": 0.1},
        ],
    }
    r = TariffResolver({}, data)
    noon = datetime(2026, 2, 2, 12, 0, 0)
    with patch.object(tm, "datetime") as mock_dt:
        mock_dt.now = lambda: noon
        assert r.rate_for_slot("x") == 0.2
    night = datetime(2026, 2, 2, 22, 0, 0)
    with patch.object(tm, "datetime") as mock_dt:
        mock_dt.now = lambda: night
        assert r.rate_for_slot("x") == 0.1


def test_other_supplier_schedule_day_type_and_season() -> None:
    data = {
        "supplier": const.SUPPLIER_OTHER,
        const.CONF_PRICING_STRUCTURE: const.PRICING_SCHEDULE,
        const.CONF_SCHEDULE_SLOTS: [
            {
                "day_type": const.DAY_TYPE_WEEKDAYS,
                "season": [{"start_month": 1, "end_month": 12}],
                "start": "09:00",
                "end": "17:00",
                "price": 0.25,
            },
            {
                "day_type": const.DAY_TYPE_WEEKENDS,
                "start": "00:00",
                "end": "23:59",
                "price": 0.11,
            },
        ],
    }
    r = TariffResolver({}, data)
    wed = datetime(2026, 2, 4, 10, 0, 0)
    with patch.object(tm, "datetime") as mock_dt:
        mock_dt.now = lambda: wed
        assert r.rate_for_slot("x") == 0.25
    sat = datetime(2026, 2, 7, 12, 0, 0)
    with patch.object(tm, "datetime") as mock_dt:
        mock_dt.now = lambda: sat
        assert r.rate_for_slot("x") == 0.11


def test_subscription_daily_edf_auto_annual_then_monthly_fallback() -> None:
    r = TariffResolver(
        {const.OPT_FIXED_TTC: 365.0},
        {const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO, "supplier": const.SUPPLIER_EDF},
    )
    assert r.subscription_daily() == round(365.0 / 365.0, 6)

    r2 = TariffResolver(
        {},
        {
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            "supplier": const.SUPPLIER_EDF,
            const.CONF_SUBSCRIPTION_PRICE: 30.0,
        },
    )
    assert r2.subscription_daily() == round(30.0 / 30.0, 6)


def test_subscription_daily_non_edf_uses_monthly_option() -> None:
    r = TariffResolver(
        {const.OPT_ABONNEMENT: 15.0},
        {"supplier": const.SUPPLIER_OTHER},
    )
    assert r.subscription_daily() == round(15.0 / 30.0, 6)


def test_cost_for_slot_and_all_slot_rates() -> None:
    r = TariffResolver(
        {const.OPT_BLEU_HP: 0.2},
        {const.CONF_TARIFF_MODE: const.TARIFF_MODE_MANUAL, "supplier": const.SUPPLIER_EDF},
    )
    assert r.cost_for_slot(const.OPT_BLEU_HP, 10.0) == round(2.0, 6)
    rates = r.all_slot_rates()
    assert rates[const.SLOT_UNKNOWN] == 0.0
    assert const.OPT_BLEU_HP in rates


def test_tempo_hphc_base_flags() -> None:
    r = TariffResolver(
        {"tariff_offer": const.TARIFF_OFFER_TEMPO},
        {"supplier": const.SUPPLIER_EDF},
    )
    assert r.is_tempo is True
    r2 = TariffResolver(
        {"tariff_offer": const.TARIFF_OFFER_HPHC},
        {"supplier": const.SUPPLIER_EDF},
    )
    assert r2.is_hphc is True
    r3 = TariffResolver(
        {"tariff_offer": const.TARIFF_OFFER_BASE},
        {"supplier": const.SUPPLIER_EDF},
    )
    assert r3.is_base is True
