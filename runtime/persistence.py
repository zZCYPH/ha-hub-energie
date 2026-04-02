"""Persistence and recorder durability manager."""

from __future__ import annotations

import copy
import logging
from collections.abc import Callable, Mapping
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from ..storage.store_manager import StoreManager
from ..time.paris_time import PARIS_TZ, ParisTime
from .state import RuntimeState

__all__ = ("PersistenceManager",)


class PersistenceManager:
    """Owns Store load/save, migration, recorder rebuild and statistics writes."""

    def __init__(
        self,
        *,
        hass: HomeAssistant,
        entry: ConfigEntry,
        domain: str,
        slots: tuple[str, ...],
        state_lock: Any,
        runtime_state: RuntimeState,
        store_manager: StoreManager,
        save_debounce_s: float,
        logger: logging.Logger,
        store_model_version: int,
        source_map: Callable[[], dict[str, str | None]],
        expected_source_keys: Callable[[], set[str]],
        read_energy_kwh: Callable[[str | None], float | None],
        normalize_kwh: Callable[[float], float],
        safe_float: Callable[[Any], float | None],
        statistic_id: Callable[[str, str], str],
    ) -> None:
        self._hass = hass
        self._entry = entry
        self._domain = domain
        self._slots = slots
        self._state_lock = state_lock
        self._runtime_state = runtime_state
        self._store_manager = store_manager
        self._save_debounce_s = save_debounce_s
        self._logger = logger
        self._store_model_version = store_model_version
        self._source_map = source_map
        self._expected_source_keys = expected_source_keys
        self._read_energy_kwh = read_energy_kwh
        self._norm_kwh = normalize_kwh
        self._safe_float = safe_float
        self._statistic_id = statistic_id
        self._store = Store(hass, 1, f"{domain}.{entry.entry_id}")
        self._pending_store_payload: dict[str, Any] | None = None
        self._save_unsub: CALLBACK_TYPE | None = None

    def validate_payload(self, data: dict[str, Any]) -> bool:
        return self._store_manager.validate_payload(data)

    def migrate_legacy_store_payload(self, raw: dict[str, Any]) -> dict[str, Any] | None:
        if "model_version" in raw:
            return raw
        accum = raw.get("accum")
        last_raw = raw.get("last_raw")
        written = raw.get("written_stats_days", [])
        if not isinstance(accum, dict) or not isinstance(last_raw, dict):
            return None

        totals: dict[str, float] = {}
        slot_day: dict[str, dict[str, dict[str, float]]] = {}
        for day_key, by_source in accum.items():
            if not isinstance(day_key, str) or not isinstance(by_source, Mapping):
                continue
            day_map: dict[str, dict[str, float]] = {}
            for source_key, by_slot in by_source.items():
                if not isinstance(source_key, str) or not isinstance(by_slot, Mapping):
                    continue
                slots = {slot: 0.0 for slot in self._slots}
                for slot in self._slots:
                    value = self._safe_float(by_slot.get(slot, 0.0))
                    if value is None or value < 0:
                        value = 0.0
                    slots[slot] = self._norm_kwh(value)
                    totals[source_key] = self._norm_kwh(totals.get(source_key, 0.0) + slots[slot])
                day_map[source_key] = slots
            if day_map:
                slot_day[day_key] = day_map

        source_map = self._source_map()
        source_entity_by_source = {
            source: entity_id
            for source, entity_id in source_map.items()
            if isinstance(entity_id, str) and entity_id
        }
        last_raw_by_source: dict[str, float] = {}
        for source_key, entity_id in source_entity_by_source.items():
            raw_value = self._safe_float(last_raw.get(entity_id))
            if raw_value is not None and raw_value >= 0:
                last_raw_by_source[source_key] = self._norm_kwh(raw_value)

        return {
            "model_version": self._store_model_version,
            "totals_kwh_by_source": totals,
            "slot_day_kwh": slot_day,
            "last_raw_by_source": last_raw_by_source,
            "written_stats_days": sorted({str(day) for day in written if isinstance(day, str)}),
            "source_entity_by_source": source_entity_by_source,
            "diag_export_kwh": raw.get("diag_export_kwh", {}),
            "diag_export_slot_kwh": raw.get("diag_export_slot_kwh", {}),
            "batt_charge_power_split_kwh": raw.get("batt_charge_power_split_kwh", {}),
            "batt_charge_power_split_slot_kwh": raw.get("batt_charge_power_split_slot_kwh", {}),
        }

    async def load(self) -> bool:
        raw_loaded = await self._store.async_load()
        migrated: dict[str, Any] | None = None
        if isinstance(raw_loaded, dict):
            migrated = self.migrate_legacy_store_payload(raw_loaded)

        loaded_from_store = False
        if isinstance(migrated, dict) and self.validate_payload(migrated):
            self._runtime_state.hydrate(
                migrated,
                normalize_kwh=self._norm_kwh,
                safe_float=self._safe_float,
            )
            loaded_from_store = True
        else:
            if raw_loaded:
                self._logger.warning("Invalid Store payload detected; rebuilding from recorder fallback")
            self._runtime_state.reset()
            await self.rebuild_from_recorder()

        source_map = self._source_map()
        needs_save = not loaded_from_store
        for source_key, entity_id in source_map.items():
            if not entity_id:
                continue
            if self._runtime_state.source_entity_by_source.get(source_key) != entity_id:
                self._runtime_state.source_entity_by_source[source_key] = entity_id
                current_kwh = self._read_energy_kwh(entity_id)
                if current_kwh is not None and current_kwh >= 0:
                    self._runtime_state.last_raw[source_key] = self._norm_kwh(current_kwh)
                needs_save = True
            elif source_key not in self._runtime_state.last_raw:
                current_kwh = self._read_energy_kwh(entity_id)
                if current_kwh is not None and current_kwh >= 0:
                    self._runtime_state.last_raw[source_key] = self._norm_kwh(current_kwh)
                    needs_save = True

        if loaded_from_store:
            yesterday = ParisTime.yesterday()
            if not self._runtime_state.is_day_written(yesterday):
                await self.write_statistics(yesterday)
                needs_save = True

        if needs_save:
            async with self._state_lock:
                self.schedule_save_locked()
            await self.flush_pending_store_save()
        return loaded_from_store

    def _store_payload(self) -> dict[str, Any]:
        return self._runtime_state.export_store_payload(store_manager=self._store_manager)

    def _capture_store_snapshot_locked(self) -> dict[str, Any]:
        return copy.deepcopy(self._store_payload())

    def schedule_save_locked(self) -> None:
        self._pending_store_payload = self._capture_store_snapshot_locked()
        if self._save_unsub is not None:
            self._save_unsub()
            self._save_unsub = None

        @callback
        def _save(_now: datetime) -> None:
            self._save_unsub = None
            self._hass.async_create_task(self.flush_pending_store_save())

        self._save_unsub = async_call_later(self._hass, self._save_debounce_s, _save)

    async def flush_pending_store_save(self) -> None:
        async with self._state_lock:
            payload = self._pending_store_payload
            self._pending_store_payload = None
        if payload is not None:
            await self._store.async_save(payload)

    async def save(self) -> None:
        async with self._state_lock:
            self.schedule_save_locked()
        await self.flush_pending_store_save()

    async def rebuild_from_recorder(self) -> None:
        """Rebuild SSOT from recorder for completed days only."""
        try:
            from homeassistant.components.recorder.statistics import statistics_during_period
        except Exception:  # noqa: BLE001
            return

        today = ParisTime.today()
        now = ParisTime.now()
        start = ParisTime.day_start(now - timedelta(days=3650)).astimezone(dt_util.UTC)
        end = ParisTime.day_start(now + timedelta(days=1)).astimezone(dt_util.UTC)
        source_keys = sorted(self._expected_source_keys())
        stat_ids = [
            self._statistic_id(source_key, slot)
            for source_key in source_keys
            for slot in self._slots
        ]

        def _fetch() -> dict[str, list[Any]]:
            try:
                return statistics_during_period(
                    self._hass,
                    start_time=start,
                    end_time=end,
                    statistic_ids=stat_ids,
                    period="day",
                    types={"sum"},
                )
            except TypeError:
                return statistics_during_period(
                    self._hass,
                    start,
                    end_time=end,
                    statistic_ids=stat_ids,
                    period="day",
                    types={"sum"},
                )

        try:
            stats = await self._hass.async_add_executor_job(_fetch)
        except Exception as err:  # noqa: BLE001
            self._logger.warning("Recorder fallback statistics rebuild failed: %s", err)
            return

        for source_key in source_keys:
            for slot in self._slots:
                sid = self._statistic_id(source_key, slot)
                rows = stats.get(sid, [])
                for row in rows:
                    start_dt = row.get("start") if isinstance(row, Mapping) else getattr(row, "start", None)
                    sum_val = row.get("sum") if isinstance(row, Mapping) else getattr(row, "sum", None)
                    if not isinstance(start_dt, datetime):
                        continue
                    value = self._safe_float(sum_val)
                    if value is None or value <= 0:
                        continue
                    day_iso = start_dt.astimezone(PARIS_TZ).date().isoformat()
                    if day_iso >= today:
                        continue
                    self._runtime_state.add_rebuilt_value(
                        day=day_iso,
                        source_key=source_key,
                        slot=slot,
                        value=value,
                        normalize_kwh=self._norm_kwh,
                    )
                    self._runtime_state.mark_written_day(day_iso)

    async def write_statistics(self, iso_day: str) -> None:
        async with self._state_lock:
            if self._runtime_state.is_day_written(iso_day):
                return
            day_acc = self._runtime_state.copy_day_acc(iso_day)
            if not day_acc:
                self._logger.debug("Skipping recorder write for %s: missing slot_day_kwh entry", iso_day)
                return
        from homeassistant.components.recorder.statistics import async_add_external_statistics

        expected_sources = self._expected_source_keys()
        if any(source not in day_acc for source in expected_sources):
            self._logger.warning(
                "Skipping recorder write for %s: incomplete slot_day_kwh sources",
                iso_day,
            )
            return

        start_utc = ParisTime.day_start_utc(iso_day)
        all_ok = True
        for source, slot_data in day_acc.items():
            for slot in self._slots:
                value = self._norm_kwh(float(slot_data.get(slot, 0.0)))
                statistic_id = self._statistic_id(source, slot)
                metadata = {
                    "has_mean": False,
                    "has_sum": True,
                    "name": f"Hub Énergie {source} {slot} kWh",
                    "source": self._domain,
                    "statistic_id": statistic_id,
                    "unit_of_measurement": "kWh",
                }
                try:
                    async_add_external_statistics(
                        self._hass,
                        metadata,
                        [{"start": start_utc, "sum": value}],
                    )
                except Exception as err:  # noqa: BLE001
                    all_ok = False
                    self._logger.warning(
                        "Failed external statistics %s day %s: %s",
                        statistic_id,
                        iso_day,
                        err,
                    )
        if all_ok:
            async with self._state_lock:
                self._runtime_state.mark_written_day(iso_day)
                self.schedule_save_locked()
