"""Tests for ``PersistenceManager`` store migration and external statistics writes."""

from __future__ import annotations

import asyncio
import importlib
import logging
import sys
import types
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.runtime", HUB_DIR / "runtime")
_ensure_pkg("hub_energie.diagnostics", HUB_DIR / "diagnostics")
_ensure_pkg("hub_energie.storage", HUB_DIR / "storage")
_ensure_pkg("hub_energie.energy", HUB_DIR / "energy")
_ensure_pkg("hub_energie.time", HUB_DIR / "time")

const = importlib.import_module("hub_energie.const")
diag_mod = importlib.import_module("hub_energie.diagnostics.reinjection_state")
persistence_mod = importlib.import_module("hub_energie.runtime.persistence")
runtime_state_mod = importlib.import_module("hub_energie.runtime.state")
store_manager_mod = importlib.import_module("hub_energie.storage.store_manager")
numbers_mod = importlib.import_module("hub_energie.utils.numbers")
energy_mod = importlib.import_module("hub_energie.utils.energy")
paris_time_mod = importlib.import_module("hub_energie.time.paris_time")

SLOTS = const.ATTRIBUTION_SLOTS
PARIS_TZ = paris_time_mod.PARIS_TZ
_DIAG_CAUSES = (
    const.DIAG_CAUSE_SOLAR_SURPLUS,
    const.DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    const.DIAG_CAUSE_SWITCH_LATENCY,
    const.DIAG_CAUSE_UNATTRIBUTED,
)


def _norm(v: float) -> float:
    return energy_mod.normalize_kwh(v)


def _make_runtime_state() -> object:
    diag = diag_mod.ReinjectionState(
        slots=SLOTS,
        diag_causes=_DIAG_CAUSES,
        default_cause=const.DIAG_CAUSE_UNATTRIBUTED,
    )
    return runtime_state_mod.RuntimeState(slots=SLOTS, reinjection_state=diag)


def _fill_day_grid(rs: object, day: str, bleu_hp_kwh: float) -> None:
    grid_slots = {s: 0.0 for s in SLOTS}
    grid_slots["bleu_hp"] = _norm(bleu_hp_kwh)
    rs.accum[day] = {"grid": grid_slots}


def _pm(
    rs: object,
    *,
    expected_sources: frozenset[str] | None = None,
) -> object:
    sm = store_manager_mod.StoreManager(
        model_version=1,
        slots=SLOTS,
        decimals=const.ENERGY_ROUND_DECIMALS,
    )
    es = expected_sources or frozenset({"grid"})
    return persistence_mod.PersistenceManager(
        hass=SimpleNamespace(async_create_task=lambda _c: None),
        entry=SimpleNamespace(entry_id="test-entry"),
        domain=const.DOMAIN,
        slots=SLOTS,
        state_lock=asyncio.Lock(),
        runtime_state=rs,
        store_manager=sm,
        save_debounce_s=0.01,
        logger=logging.getLogger("test.persistence"),
        store_model_version=1,
        source_map=lambda: {"grid": "sensor.grid_energy"},
        expected_source_keys=lambda: set(es),
        read_energy_kwh=lambda _e: None,
        normalize_kwh=_norm,
        safe_float=numbers_mod.safe_float,
        statistic_id=lambda sk, sl: f"{const.DOMAIN}:slot_{sk}_{sl}_kwh",
    )


def test_migrate_legacy_store_payload_builds_model_v1() -> None:
    pm = persistence_mod.PersistenceManager.__new__(persistence_mod.PersistenceManager)
    pm._slots = SLOTS
    pm._store_model_version = 1
    pm._norm_kwh = _norm
    pm._safe_float = numbers_mod.safe_float

    def _source_map() -> dict[str, str | None]:
        return {"grid": "sensor.grid_energy"}

    pm._source_map = _source_map

    raw = {
        "accum": {
            "2026-01-01": {
                "grid": {s: (1.0 if s == "bleu_hp" else 0.0) for s in SLOTS},
            }
        },
        "last_raw": {"sensor.grid_energy": 99.5},
        "written_stats_days": ["2026-01-01"],
    }
    out = pm.migrate_legacy_store_payload(raw)
    assert out is not None
    assert out["model_version"] == 1
    assert out["totals_kwh_by_source"]["grid"] == _norm(1.0)
    assert out["last_raw_by_source"]["grid"] == _norm(99.5)
    assert "2026-01-01" in out["slot_day_kwh"]


def test_migrate_legacy_store_payload_rejects_bad_shapes() -> None:
    pm = persistence_mod.PersistenceManager.__new__(persistence_mod.PersistenceManager)
    pm._slots = SLOTS
    pm._store_model_version = 1
    pm._norm_kwh = _norm
    pm._safe_float = numbers_mod.safe_float
    pm._source_map = lambda: {"grid": "sensor.g"}
    assert pm.migrate_legacy_store_payload({"model_version": 1}) == {"model_version": 1}
    assert pm.migrate_legacy_store_payload({"accum": "x", "last_raw": {}}) is None
    assert pm.migrate_legacy_store_payload({"accum": {}, "last_raw": []}) is None


def test_write_statistics_emits_metadata_and_monotonic_cumulative() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()

    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-02-01", 2.5)
    pm = _pm(rs)

    async def _run() -> None:
        await pm.write_statistics("2026-02-01")

    asyncio.run(_run())

    assert rs.is_day_written("2026-02-01")
    assert len(stats_mod._captured_external) == len(SLOTS)
    meta0, points0 = stats_mod._captured_external[0]
    assert meta0["unit_of_measurement"] == "kWh"
    assert meta0["source"] == const.DOMAIN
    assert meta0["statistic_id"].startswith(f"{const.DOMAIN}:slot_grid_")
    assert meta0["state_class"] == "total_increasing"
    assert points0[0]["sum"] == _norm(2.5) or points0[0]["sum"] == 0.0
    sid_hp = f"{const.DOMAIN}:slot_grid_bleu_hp_kwh"
    hp_row = next((m, p) for m, p in stats_mod._captured_external if m["statistic_id"] == sid_hp)
    assert hp_row[1][0]["sum"] == _norm(2.5)


def test_write_statistics_skips_when_day_already_written() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-02-02", 1.0)
    rs.mark_written_day("2026-02-02")
    pm = _pm(rs)

    async def _run() -> None:
        await pm.write_statistics("2026-02-02")

    asyncio.run(_run())
    assert stats_mod._captured_external == []


def test_write_statistics_skips_when_day_acc_missing() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    rs = _make_runtime_state()
    pm = _pm(rs)

    async def _run() -> None:
        await pm.write_statistics("2026-02-03")

    asyncio.run(_run())
    assert stats_mod._captured_external == []


def test_write_statistics_skips_when_sources_incomplete() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-02-04", 1.0)
    pm = _pm(rs, expected_sources=frozenset({"grid", "solar"}))

    async def _run() -> None:
        await pm.write_statistics("2026-02-04")

    asyncio.run(_run())
    assert stats_mod._captured_external == []
    assert not rs.is_day_written("2026-02-04")


def test_write_statistics_zero_daily_does_not_increase_cumulative() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-02-05", 0.0)
    sid = f"{const.DOMAIN}:slot_grid_bleu_hp_kwh"
    rs.lts_cumulative_kwh_by_statistic_id[sid] = _norm(10.0)
    pm = _pm(rs)

    async def _run() -> None:
        await pm.write_statistics("2026-02-05")

    asyncio.run(_run())
    hp_row = next((m, p) for m, p in stats_mod._captured_external if m["statistic_id"] == sid)
    assert hp_row[1][0]["sum"] == _norm(10.0)
    assert rs.lts_cumulative_kwh_by_statistic_id[sid] == _norm(10.0)


def _store_manager() -> object:
    return store_manager_mod.StoreManager(
        model_version=1,
        slots=SLOTS,
        decimals=const.ENERGY_ROUND_DECIMALS,
    )


def _v1_payload(*, day: str, bleu_hp: float, written: list[str] | None = None) -> dict:
    sm = _store_manager()
    grid_slots = {s: 0.0 for s in SLOTS}
    grid_slots["bleu_hp"] = float(bleu_hp)
    return sm.build_payload(
        totals_kwh_by_source={"grid": _norm(float(bleu_hp))},
        slot_day_kwh={day: {"grid": grid_slots}},
        last_raw_by_source={"grid": _norm(1.0)},
        written_stats_days=set(written or []),
        source_entity_by_source={"grid": "sensor.grid_energy"},
        diag_export_kwh={},
        diag_export_slot_kwh={},
        batt_charge_power_split_kwh={},
        batt_charge_power_split_slot_kwh={},
        last_stable_attribution_slot=None,
        lts_cumulative_kwh_by_statistic_id={},
    )


def test_validate_payload_uses_store_manager_rules() -> None:
    rs = _make_runtime_state()
    pm = _pm(rs)
    assert pm.validate_payload({"model_version": 99}) is False
    assert pm.validate_payload(_v1_payload(day="2026-01-20", bleu_hp=1.0)) is True


def test_migrate_legacy_filters_written_days_and_stable_slot() -> None:
    pm = persistence_mod.PersistenceManager.__new__(persistence_mod.PersistenceManager)
    pm._slots = SLOTS
    pm._store_model_version = 1
    pm._norm_kwh = _norm
    pm._safe_float = numbers_mod.safe_float
    pm._source_map = lambda: {"grid": "sensor.g"}
    grid = {s: 0.0 for s in SLOTS}
    grid["bleu_hp"] = -2.0
    raw = {
        "accum": {
            "2026-02-10": {
                "grid": grid,
            },
            404: {"grid": grid},
            "2026-02-11": "not-a-mapping",
        },
        "last_raw": {"sensor.g": "x"},
        "written_stats_days": ["2026-02-10", 999, None],
        "last_stable_attribution_slot": 123,
    }
    out = pm.migrate_legacy_store_payload(raw)
    assert out is not None
    assert out["written_stats_days"] == ["2026-02-10"]
    assert out["last_stable_attribution_slot"] is None
    assert out["slot_day_kwh"]["2026-02-10"]["grid"]["bleu_hp"] == 0.0
    assert "grid" not in out["last_raw_by_source"]


def test_load_from_store_hydrates_and_writes_yesterday_to_recorder() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    payload = _v1_payload(day="2026-04-01", bleu_hp=2.0, written=[])
    saves: list[dict] = []

    class _MemStore:
        def __init__(self, _h: object, _v: int, _k: str) -> None:
            pass

        async def async_load(self) -> dict:
            return payload

        async def async_save(self, data: dict) -> None:
            saves.append(data)

    class _FixedParis(paris_time_mod.ParisTime):
        @staticmethod
        def today() -> str:
            return "2026-04-02"

        @staticmethod
        def yesterday() -> str:
            return "2026-04-01"

        @staticmethod
        def now():
            return datetime(2026, 4, 2, 14, 0, 0, tzinfo=PARIS_TZ)

    rs = _make_runtime_state()

    async def _run() -> None:
        with patch.object(persistence_mod, "Store", _MemStore):
            with patch.object(persistence_mod, "ParisTime", _FixedParis):
                pm = _pm(rs)
                ok = await pm.load()
        assert ok is True

    asyncio.run(_run())
    assert rs.accum["2026-04-01"]["grid"]["bleu_hp"] == _norm(2.0)
    assert rs.is_day_written("2026-04-01")
    assert stats_mod._captured_external
    assert saves


def test_load_corrupt_store_rebuilds_from_recorder_rows() -> None:
    sid = f"{const.DOMAIN}:slot_grid_bleu_hp_kwh"
    row_t = datetime(2026, 5, 10, 11, 0, 0, tzinfo=PARIS_TZ)
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    real_sdp = stats_mod.statistics_during_period

    def _sdp(*_a: object, **_kw: object) -> dict:
        return {sid: [{"start": row_t, "sum": 4.0}]}

    stats_mod.statistics_during_period = _sdp

    class _BadStore:
        def __init__(self, _h: object, _v: int, _k: str) -> None:
            pass

        async def async_load(self) -> dict:
            return {"not": "valid"}

        async def async_save(self, _data: dict) -> None:
            return None

    class _ParisRebuild(paris_time_mod.ParisTime):
        @staticmethod
        def today() -> str:
            return "2026-05-20"

        @staticmethod
        def now():
            return datetime(2026, 5, 15, 12, 0, 0, tzinfo=PARIS_TZ)

    rs = _make_runtime_state()
    try:

        async def _go() -> None:
            with patch.object(persistence_mod, "Store", _BadStore):
                with patch.object(persistence_mod, "ParisTime", _ParisRebuild):
                    pm = _pm(rs)
                    await pm.load()

        asyncio.run(_go())
    finally:
        stats_mod.statistics_during_period = real_sdp
    assert rs.accum.get("2026-05-10", {}).get("grid", {}).get("bleu_hp") == _norm(4.0)
    assert rs.lts_cumulative_kwh_by_statistic_id.get(sid) == _norm(4.0)


def test_save_writes_store_snapshot() -> None:
    saves: list[dict] = []

    class _MemStore:
        def __init__(self, _h: object, _v: int, _k: str) -> None:
            pass

        async def async_load(self) -> None:
            return None

        async def async_save(self, data: dict) -> None:
            saves.append(data)

    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-07-01", 1.5)
    rs.totals_kwh_by_source["grid"] = _norm(1.5)

    async def _run() -> None:
        with patch.object(persistence_mod, "Store", _MemStore):
            pm = _pm(rs)
            await pm.save()

    asyncio.run(_run())
    assert saves and saves[0].get("model_version") == 1
    assert "grid" in saves[0].get("totals_kwh_by_source", {})


def test_write_statistics_partial_failure_leaves_day_unmarked() -> None:
    stats_mod = sys.modules["homeassistant.components.recorder.statistics"]
    stats_mod._captured_external.clear()
    real_add = stats_mod.async_add_external_statistics
    n_calls = 0

    def _add(hass: object, meta: dict, stats: list) -> None:
        nonlocal n_calls
        n_calls += 1
        if n_calls == 2:
            raise RuntimeError("injected recorder failure")
        stats_mod._captured_external.append((dict(meta), list(stats)))

    stats_mod.async_add_external_statistics = _add
    rs = _make_runtime_state()
    _fill_day_grid(rs, "2026-08-01", 1.0)
    pm = _pm(rs)
    try:
        asyncio.run(pm.write_statistics("2026-08-01"))
    finally:
        stats_mod.async_add_external_statistics = real_add
    assert not rs.is_day_written("2026-08-01")
    assert n_calls == len(SLOTS)
    assert len(stats_mod._captured_external) == len(SLOTS) - 1
