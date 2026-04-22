"""Coordinator wiring: load → delta → runtime → persist → statistics (fakes, no full HA)."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

const = importlib.import_module("hub_energie.const")
coord_mod = importlib.import_module("hub_energie.coordinator")
coordinator_policy = importlib.import_module("hub_energie.coordinator_policy")
coordinator_apply_delta = importlib.import_module("hub_energie.coordinator_apply_delta")
coordinator_data_quality = importlib.import_module("hub_energie.coordinator_data_quality")
energy_mod = importlib.import_module("hub_energie.utils.energy")
persistence_mod = importlib.import_module("hub_energie.runtime.persistence")
paris_time_mod = importlib.import_module("hub_energie.time.paris_time")
slot_attribution = importlib.import_module("hub_energie.tariff.slot_attribution")
store_manager_mod = importlib.import_module("hub_energie.storage.store_manager")

PARIS_TZ = paris_time_mod.PARIS_TZ
SLOTS = const.ATTRIBUTION_SLOTS


def _norm(v: float) -> float:
    return energy_mod.normalize_kwh(v)


def _entry_e2e() -> SimpleNamespace:
    return SimpleNamespace(
        entry_id="e2e-coordinator",
        data={
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
        },
        options={const.OPT_TARIFF_AUTO_REFRESH: False},
        async_on_unload=lambda _fn: None,
    )


def _v1_store_payload(*, yesterday: str, yesterday_bleu_hp: float, last_raw_grid: float) -> dict:
    sm = store_manager_mod.StoreManager(
        model_version=1,
        slots=SLOTS,
        decimals=const.ENERGY_ROUND_DECIMALS,
    )
    grid_y = {s: 0.0 for s in SLOTS}
    grid_y["bleu_hp"] = float(yesterday_bleu_hp)
    return sm.build_payload(
        totals_kwh_by_source={"grid": _norm(float(yesterday_bleu_hp))},
        slot_day_kwh={yesterday: {"grid": grid_y}},
        last_raw_by_source={"grid": _norm(float(last_raw_grid))},
        drift_anchor_meter_by_source={},
        written_stats_days=set(),
        source_entity_by_source={"grid": "sensor.grid_import"},
        diag_export_kwh={},
        diag_export_slot_kwh={},
        batt_charge_power_split_kwh={},
        batt_charge_power_split_slot_kwh={},
        last_stable_attribution_slot=None,
        lts_cumulative_kwh_by_statistic_id={},
    )


class _FixedParis(paris_time_mod.LocalTime):
    @staticmethod
    def today() -> str:
        return "2026-04-02"

    @staticmethod
    def yesterday() -> str:
        return "2026-04-01"

    @staticmethod
    def now():
        return datetime(2026, 4, 2, 14, 0, 0, tzinfo=PARIS_TZ)


def _mem_store_factory(initial: dict, saves: list[dict]) -> type:
    class _MemStore:
        def __init__(self, _h: object, _v: int, _k: str) -> None:
            pass

        async def async_load(self) -> dict:
            return initial

        async def async_save(self, data: dict) -> None:
            saves.append(dict(data))

    return _MemStore


async def _load_delta_persist_statistics_flow() -> None:
    """Load hydrates SSOT, backlog day flushes to external stats, delta updates today and store."""
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()

    yesterday = "2026-04-01"
    today = "2026-04-02"
    initial = _v1_store_payload(
        yesterday=yesterday,
        yesterday_bleu_hp=1.0,
        last_raw_grid=10.0,
    )
    saves: list[dict] = []

    from homeassistant.core import HomeAssistant

    hass = HomeAssistant()
    entry = _entry_e2e()

    def _direct_slot(**_kwargs: object) -> slot_attribution.SlotAttributionResult:
        return slot_attribution.SlotAttributionResult("bleu_hp", "direct")

    with patch.object(persistence_mod, "Store", _mem_store_factory(initial, saves)):
        with patch.object(persistence_mod, "LocalTime", _FixedParis):
            with patch.object(coordinator_policy, "LocalTime", _FixedParis):
                with patch.object(coordinator_data_quality, "LocalTime", _FixedParis):
                    coord = coord_mod.HubEnergieCoordinator(hass, entry)
                    coord._async_notify_all = AsyncMock()
                    coord.async_request_refresh = AsyncMock()
                    coord._reader.read_energy_kwh = lambda _eid: None
                    coord._energy_attrib_date = today

                    with patch.object(
                        coordinator_apply_delta,
                        "resolve_attribution_slot",
                        side_effect=_direct_slot,
                    ):
                        await coord.async_setup()

                        n_stats_after_load = len(stats_mod._captured_external)
                        assert n_stats_after_load == len(SLOTS)
                        assert coord._runtime_state.is_day_written(yesterday)

                        await coord._async_apply_delta("sensor.grid_import", const.SOURCE_GRID, 12.0)
                        await coord._async_flush_pending_store_save()

                        assert coord._runtime_state.accum[today]["grid"]["bleu_hp"] == _norm(2.0)
                        assert coord._runtime_state.totals_kwh_by_source["grid"] == _norm(3.0)
                        assert coord._runtime_state.last_raw[const.SOURCE_GRID] == _norm(12.0)

                        await coord._async_apply_delta("sensor.grid_import", const.SOURCE_GRID, 12.0)
                        await coord._async_flush_pending_store_save()

                        assert coord._runtime_state.accum[today]["grid"]["bleu_hp"] == _norm(2.0)
                        assert coord._runtime_state.totals_kwh_by_source["grid"] == _norm(3.0)

                        n_before_idempotent_stats = len(stats_mod._captured_external)
                        await coord._async_write_day_statistics(yesterday)
                        assert len(stats_mod._captured_external) == n_before_idempotent_stats

    assert saves, "store should have been persisted at least once"
    final = saves[-1]
    assert yesterday in final.get("written_stats_days", [])
    assert final["totals_kwh_by_source"]["grid"] == _norm(3.0)
    assert final["slot_day_kwh"][today]["grid"]["bleu_hp"] == _norm(2.0)


def test_coordinator_load_delta_persist_and_statistics_happy_path() -> None:
    asyncio.run(_load_delta_persist_statistics_flow())


async def _statistics_idempotent_after_load() -> None:
    """Second write_statistics for the same day does not call the recorder again."""
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()

    yesterday = "2026-04-01"
    initial = _v1_store_payload(
        yesterday=yesterday,
        yesterday_bleu_hp=0.5,
        last_raw_grid=5.0,
    )

    from homeassistant.core import HomeAssistant

    hass = HomeAssistant()
    entry = _entry_e2e()

    with patch.object(persistence_mod, "Store", _mem_store_factory(initial, [])):
        with patch.object(persistence_mod, "LocalTime", _FixedParis):
            with patch.object(coordinator_policy, "LocalTime", _FixedParis):
                with patch.object(coordinator_data_quality, "LocalTime", _FixedParis):
                    coord = coord_mod.HubEnergieCoordinator(hass, entry)
                    coord._async_notify_all = AsyncMock()
                    coord.async_request_refresh = AsyncMock()
                    coord._reader.read_energy_kwh = lambda _eid: None
                    coord._energy_attrib_date = "2026-04-02"

                    await coord.async_setup()

    n = len(stats_mod._captured_external)
    assert n == len(SLOTS)
    await coord._async_write_day_statistics(yesterday)
    assert len(stats_mod._captured_external) == n


def test_coordinator_write_statistics_idempotent_after_load() -> None:
    asyncio.run(_statistics_idempotent_after_load())
