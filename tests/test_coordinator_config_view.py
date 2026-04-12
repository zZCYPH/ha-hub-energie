"""Tests for hub_energie.coordinator_config_view."""

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

const = importlib.import_module("hub_energie.const")
cv = importlib.import_module("hub_energie.coordinator_config_view")


def test_entry_tariff_offer_options_override_data() -> None:
    data = {const.CONF_TARIFF_OFFER: "base"}
    opts = {const.CONF_TARIFF_OFFER: "tempo"}
    assert cv.entry_tariff_offer(data, opts) == "tempo"


def test_entry_tariff_offer_fallback_to_data_default() -> None:
    data: dict = {}
    opts: dict = {}
    assert cv.entry_tariff_offer(data, opts) == const.TARIFF_OFFER_TEMPO


def test_tempo_rte_calendar_ready_requires_rows_when_rte_tempo() -> None:
    assert (
        cv.tempo_rte_calendar_ready(
            is_edf=True,
            tariff_offer=const.TARIFF_OFFER_TEMPO,
            tempo_mode=const.TEMPO_MODE_RTE,
            calendar_rows=[],
        )
        is False
    )
    assert (
        cv.tempo_rte_calendar_ready(
            is_edf=True,
            tariff_offer=const.TARIFF_OFFER_TEMPO,
            tempo_mode=const.TEMPO_MODE_RTE,
            calendar_rows=[1],
        )
        is True
    )


def test_tempo_rte_calendar_ready_short_circuits_non_edf_or_non_tempo() -> None:
    assert cv.tempo_rte_calendar_ready(
        is_edf=False,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_RTE,
        calendar_rows=[],
    ) is True
    assert cv.tempo_rte_calendar_ready(
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_BASE,
        tempo_mode=const.TEMPO_MODE_RTE,
        calendar_rows=[],
    ) is True
    assert cv.tempo_rte_calendar_ready(
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_API,
        calendar_rows=[],
    ) is True


def test_entry_has_batteries_requires_systems() -> None:
    assert cv.entry_has_batteries({const.CONF_HAS_BATTERIES: True, const.CONF_BATTERY_SYSTEMS: []}) is False
    assert cv.entry_has_batteries(
        {const.CONF_HAS_BATTERIES: True, const.CONF_BATTERY_SYSTEMS: [{"id": "a"}]},
    ) is True


def test_entry_grid_power_sign_mode() -> None:
    data = {const.CONF_GRID_POWER_SIGN_MODE: "from_data"}
    opts: dict = {}
    assert cv.entry_grid_power_sign_mode(data, opts) == "from_data"
    opts2 = {const.CONF_GRID_POWER_SIGN_MODE: "from_opts"}
    assert cv.entry_grid_power_sign_mode(data, opts2) == "from_opts"


def test_entry_supplier_and_is_edf() -> None:
    assert cv.entry_supplier({}) == const.SUPPLIER_EDF
    assert cv.entry_is_edf({const.CONF_SUPPLIER: const.SUPPLIER_EDF}) is True
    assert cv.entry_is_edf({const.CONF_SUPPLIER: "other"}) is False


def test_entry_tempo_mode_default() -> None:
    assert cv.entry_tempo_mode({}) == const.TEMPO_MODE_SENSOR


def test_entry_phase_and_pricing_defaults() -> None:
    assert cv.entry_phase_type({}) == "mono"
    assert cv.entry_pricing_structure({}) == "flat"


def test_entry_battery_systems_empty() -> None:
    assert cv.entry_battery_systems({}) == []


def test_entry_has_solar_and_solar_flags() -> None:
    assert cv.entry_has_solar({}) is False
    assert cv.entry_has_solar({const.CONF_HAS_SOLAR: True}) is True
    assert cv.entry_solar_estimation_enabled({const.CONF_SOLAR_ESTIMATION_ENABLED: True}) is True
    assert cv.entry_solar_resale_configured({const.CONF_SOLAR_RESALE_CONTRACT: True}) is True
