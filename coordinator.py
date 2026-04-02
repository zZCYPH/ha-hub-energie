"""Coordinator: energy tracking, costs, multi-battery, solar estimation."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_BATTERY_SYSTEMS,
    CONF_CURRENT_SLOT_SENSOR,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    CONF_PRICING_STRUCTURE,
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_POWER_SENSOR,
    CONF_SOLAR_RESALE_CONTRACT,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    CONF_TEMPO_MODE,
    DEFAULT_TARIFF_AUTO_REFRESH,
    DEFAULT_TARIFF_REFRESH_HOURS,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
    DOMAIN,
    ENERGY_ROUND_DECIMALS,
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    SLOTS,
    SOURCE_GRID,
    SOURCE_GRID_EXPORT,
    SOURCE_SOLAR,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_SENSOR,
    OPT_TARIFF_AUTO_REFRESH,
    OPT_TARIFF_REFRESH_HOURS,
)
from .diagnostics.reinjection_state import ReinjectionState
from .energy.delta_policy import DeltaPolicy
from .ha.reader import HAReader
from .runtime.events import create_state_changed_handler
from .runtime.persistence import PersistenceManager
from .runtime.poll_schedule import resolve_next_poll
from .runtime.state import RuntimeState
from .scheduler import Scheduler
from .snapshot.coordinator_bridge import build_pipeline_deps
from .snapshot.inputs_builder import build_snapshot_inputs
from .snapshot.pipeline import SnapshotPipeline
from .storage.statistics import statistic_id as statistic_id_for_domain
from .storage.store_manager import StoreManager
from .tariff import EdfRuntimeFields, refresh_tariffs, update_edf_state
from .tariff.slot_resolver import resolve_slot
from .tariff_manager import TariffResolver
from .time.paris_time import ParisTime
from .utils.energy import normalize_kwh
from .utils.numbers import safe_float
from .providers.edf import is_off_peak, parse_slot_from_sensor_state

_LOGGER = logging.getLogger(__name__)

SAVE_DEBOUNCE_S = 2.0
STORE_MODEL_VERSION = 1

_DIAG_CAUSES: tuple[str, ...] = (
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
)


def _paris_now() -> datetime:
    return ParisTime.now()


def _paris_today_iso() -> str:
    return ParisTime.today()


def _paris_yesterday() -> str:
    return ParisTime.yesterday()


class HubEnergieCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Central state coordinator for Hub Énergie."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=None)
        self.entry = entry
        self.config_entry = entry
        self._state_lock = asyncio.Lock()
        self._store_manager = StoreManager(
            model_version=STORE_MODEL_VERSION,
            slots=SLOTS,
            decimals=ENERGY_ROUND_DECIMALS,
        )
        self._reader = HAReader(hass, entry, normalize_kwh=normalize_kwh)

        self._edf = EdfRuntimeFields()
        self._energy_attrib_date: str | None = None
        self._last_flow_warn_ts: datetime | None = None

        self._reinjection_state = ReinjectionState(
            slots=SLOTS,
            diag_causes=_DIAG_CAUSES,
            default_cause=DIAG_CAUSE_UNATTRIBUTED,
        )
        self._runtime_state = RuntimeState(
            slots=SLOTS,
            reinjection_state=self._reinjection_state,
        )
        self._delta_policy = DeltaPolicy()

        self._persistence = PersistenceManager(
            hass=self.hass,
            entry=self.entry,
            domain=DOMAIN,
            slots=SLOTS,
            state_lock=self._state_lock,
            runtime_state=self._runtime_state,
            store_manager=self._store_manager,
            save_debounce_s=SAVE_DEBOUNCE_S,
            logger=_LOGGER,
            store_model_version=STORE_MODEL_VERSION,
            source_map=self.source_map,
            expected_source_keys=self._expected_source_keys,
            read_energy_kwh=self._reader.read_energy_kwh,
            normalize_kwh=normalize_kwh,
            safe_float=safe_float,
            statistic_id=lambda sk, sl: statistic_id_for_domain(DOMAIN, sk, sl),
        )
        self._snapshot_pipeline = SnapshotPipeline(SLOTS, build_pipeline_deps(self))

        self._tariff: TariffResolver | None = None
        self._scheduler = Scheduler(
            hass=self.hass,
            entry=self.entry,
            next_poll_fire_paris=self._next_poll_fire_paris,
            on_scheduled_poll=self._async_scheduled_poll,
            on_midnight=self._async_midnight_maintenance,
            on_tariff_refresh=lambda: self._async_refresh_tariffs(update_entry=True),
            tariff_refresh_enabled=lambda: self.is_edf and self.tariff_refresh_enabled(),
            tariff_refresh_hours=self.tariff_refresh_hours,
        )

    @property
    def supplier(self) -> str:
        return cast(str, self.entry.data.get(CONF_SUPPLIER, SUPPLIER_EDF))

    @property
    def is_edf(self) -> bool:
        return self.supplier == SUPPLIER_EDF

    @property
    def tariff_offer(self) -> str:
        return cast(
            str,
            self.entry.options.get(
                CONF_TARIFF_OFFER,
                self.entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
            ),
        )

    @property
    def tempo_mode(self) -> str:
        return cast(str, self.entry.data.get(CONF_TEMPO_MODE, TEMPO_MODE_SENSOR))

    @property
    def phase_type(self) -> str:
        return cast(str, self.entry.data.get(CONF_PHASE_TYPE, "mono"))

    @property
    def pricing_structure(self) -> str:
        return cast(str, self.entry.data.get(CONF_PRICING_STRUCTURE, "flat"))

    @property
    def battery_systems(self) -> list[dict[str, Any]]:
        return cast(list, self.entry.data.get(CONF_BATTERY_SYSTEMS, []))

    @property
    def has_batteries(self) -> bool:
        return bool(self.entry.data.get(CONF_HAS_BATTERIES)) and bool(self.battery_systems)

    @property
    def has_solar(self) -> bool:
        return bool(self.entry.data.get(CONF_HAS_SOLAR))

    @property
    def solar_estimation_enabled(self) -> bool:
        return bool(self.entry.data.get(CONF_SOLAR_ESTIMATION_ENABLED))

    @property
    def solar_resale_configured(self) -> bool:
        return bool(self.entry.data.get(CONF_SOLAR_RESALE_CONTRACT))

    def source_map(self) -> dict[str, str | None]:
        d = self.entry.data
        m: dict[str, str | None] = {
            SOURCE_GRID: d.get(CONF_GRID_IMPORT_ENERGY),
            SOURCE_SOLAR: d.get(CONF_SOLAR_ENERGY) if self.has_solar else None,
            SOURCE_GRID_EXPORT: d.get(CONF_GRID_EXPORT_ENERGY),
        }
        for batt in self.battery_systems:
            bid = batt.get("id", "")
            m[f"batt_charge:{bid}"] = batt.get(CONF_BATT_ENERGY_IN)
            m[f"batt_discharge:{bid}"] = batt.get(CONF_BATT_ENERGY_OUT)
        return m

    def power_source_map(self) -> dict[str, str | None]:
        opts, data = self.entry.options, self.entry.data
        return {
            "grid_power": cast(str | None, opts.get(CONF_GRID_POWER_SENSOR, data.get(CONF_GRID_POWER_SENSOR))),
            "solar_power": (
                cast(str | None, opts.get(CONF_SOLAR_POWER_SENSOR, data.get(CONF_SOLAR_POWER_SENSOR)))
                if self.has_solar
                else None
            ),
            "load_power": cast(str | None, opts.get(CONF_LOAD_POWER_SENSOR, data.get(CONF_LOAD_POWER_SENSOR))),
        }

    def _expected_source_keys(self) -> set[str]:
        return {k for k, v in self.source_map().items() if v}

    def _validate_store_payload(self, data: dict[str, Any]) -> bool:
        return self._persistence.validate_payload(data)

    def _migrate_legacy_store_payload(self, raw: dict[str, Any]) -> dict[str, Any] | None:
        return self._persistence.migrate_legacy_store_payload(raw)

    def _reset_runtime_state(self) -> None:
        self._runtime_state.reset()

    def _hydrate_from_store_payload(self, payload: dict[str, Any]) -> None:
        self._runtime_state.hydrate(
            payload,
            normalize_kwh=normalize_kwh,
            safe_float=safe_float,
        )

    def grid_power_sign_mode(self) -> str:
        return cast(
            str,
            self.entry.options.get(
                CONF_GRID_POWER_SIGN_MODE,
                self.entry.data.get(CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE),
            ),
        )

    def _build_tariff_resolver(self) -> TariffResolver:
        return TariffResolver(dict(self.entry.options), dict(self.entry.data))

    def tariff_refresh_enabled(self) -> bool:
        return bool(self.entry.options.get(OPT_TARIFF_AUTO_REFRESH, DEFAULT_TARIFF_AUTO_REFRESH))

    def tariff_refresh_hours(self) -> int:
        raw = self.entry.options.get(OPT_TARIFF_REFRESH_HOURS, DEFAULT_TARIFF_REFRESH_HOURS)
        try:
            return max(1, int(raw))
        except (TypeError, ValueError):
            return DEFAULT_TARIFF_REFRESH_HOURS

    async def async_setup(self) -> None:
        await self._persistence.load()
        self._tariff = self._build_tariff_resolver()
        self.entry.async_on_unload(
            self.hass.bus.async_listen("state_changed", create_state_changed_handler(self))
        )
        self._scheduler.start()

    async def _async_rebuild_from_recorder(self) -> None:
        await self._persistence.rebuild_from_recorder()

    def _cancel_poll_schedule(self) -> None:
        self._scheduler.cancel_poll()

    async def _async_scheduled_poll(self) -> None:
        await self.async_request_refresh()

    def _arm_next_poll(self) -> None:
        self._scheduler.schedule_poll()

    def _next_poll_fire_paris(self, after: datetime) -> datetime:
        return resolve_next_poll(
            after,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            tomorrow_color=self._edf.tomorrow_color,
        )

    def _refresh_slot_sensor(self) -> None:
        eid = self.entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        st = self.hass.states.get(eid) if eid else None
        self._edf.current_slot = parse_slot_from_sensor_state(st.state if st else None)

    async def _async_apply_delta(self, entity_id: str, source_key: str, new_val: float) -> None:
        now_paris = _paris_now()
        day = _paris_today_iso()

        if (
            self.is_edf
            and self.tariff_offer == TARIFF_OFFER_TEMPO
            and self.tempo_mode == TEMPO_MODE_API
            and self._energy_attrib_date != day
        ):
            self._energy_attrib_date = day
            await self.async_request_refresh()

        slot = resolve_slot(
            now_paris=now_paris,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            edf_fields=self._edf,
            hass=self.hass,
            entry=self.entry,
        )
        if slot is None:
            await self.async_request_refresh()
            slot = resolve_slot(
                now_paris=now_paris,
                is_edf=self.is_edf,
                tariff_offer=self.tariff_offer,
                tempo_mode=self.tempo_mode,
                edf_fields=self._edf,
                hass=self.hass,
                entry=self.entry,
            )
        if slot is None or slot not in SLOTS:
            return

        self._edf.current_slot = slot

        normalized_new = normalize_kwh(new_val)
        async with self._state_lock:
            result = self._runtime_state.apply_delta(
                day=day,
                slot=slot,
                source_key=source_key,
                entity_id=entity_id,
                normalized_new=normalized_new,
                normalize_kwh=normalize_kwh,
                delta_policy=self._delta_policy,
            )
            if result.outcome == "discarded_negative":
                _LOGGER.warning(
                    "Discarded negative delta for %s: old=%.6f new=%.6f",
                    source_key,
                    result.last_raw or 0.0,
                    result.new_raw or 0.0,
                )
            elif result.outcome == "discarded_unrealistic":
                _LOGGER.warning(
                    "Discarded unrealistic delta for %s: delta=%.6f",
                    source_key,
                    result.delta_kwh,
                )
            if result.should_save:
                self._schedule_store_save_locked()

        await self._async_notify_all()

    def _schedule_store_save_locked(self) -> None:
        self._persistence.schedule_save_locked()

    async def _async_flush_pending_store_save(self) -> None:
        await self._persistence.flush_pending_store_save()

    async def _async_schedule_save(self) -> None:
        async with self._state_lock:
            self._schedule_store_save_locked()

    async def _async_midnight_maintenance(self) -> None:
        yesterday = _paris_yesterday()
        await self._async_write_day_statistics(yesterday)
        async with self._state_lock:
            self._cleanup_accumulators(keep_days=7)
            self._schedule_store_save_locked()
        await self._async_flush_pending_store_save()
        await self.async_request_refresh()

    def _cleanup_accumulators(self, keep_days: int) -> None:
        self._runtime_state.cleanup(keep_days=keep_days)

    async def _async_write_day_statistics(self, iso_day: str) -> None:
        await self._persistence.write_statistics(iso_day)

    async def _async_notify_all(self) -> None:
        async with self._state_lock:
            self.data = self._build_snapshot()
            if self._reinjection_state.dirty:
                self._reinjection_state.mark_clean()
                self._schedule_store_save_locked()
        self.async_update_listeners()

    async def _async_update_data(self) -> dict[str, Any]:
        now_paris = _paris_now()
        self._tariff = self._build_tariff_resolver()

        if self.is_edf:
            await update_edf_state(
                hass=self.hass,
                entry=self.entry,
                fields=self._edf,
                now_paris=now_paris,
                tariff_offer=self.tariff_offer,
                tempo_mode=self.tempo_mode,
                logger=_LOGGER,
                on_tempo_sensor_branch=self._refresh_slot_sensor,
            )
        else:
            self._edf.today_color = "n/a"
            self._edf.tomorrow_color = "n/a"
            self._edf.current_slot = "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
            self._edf.tempo_days_api = None

        async with self._state_lock:
            snapshot = self._build_snapshot()
            self.data = snapshot
            if self._reinjection_state.dirty:
                self._reinjection_state.mark_clean()
                self._schedule_store_save_locked()
        self.async_update_listeners()
        return snapshot

    def _build_snapshot(self) -> dict[str, Any]:
        inputs = build_snapshot_inputs(self)
        result = self._snapshot_pipeline.run(inputs)

        self._last_flow_warn_ts = result.next_last_flow_warn_ts
        if result.should_warn_flow_mismatch:
            _LOGGER.warning(
                "Flow model mismatch (raw_home=%.1f modeled_home=%.1f gap=%.1f)",
                result.raw_home_power_w,
                result.modeled_home_power_w,
                result.flow_gap_w,
            )

        if inputs.debug_enabled:
            _LOGGER.debug(
                "Snapshot debug day=%s slot=%s cost=%.3f export_w=%.1f flow_gap=%.3f",
                inputs.day,
                self._edf.current_slot,
                result.snapshot["cost_total"],
                result.snapshot["export_power_w"],
                result.snapshot["debug_flow_gap_w"],
            )
        return result.snapshot

    async def async_manual_tariff_refresh(self) -> bool:
        return await self._async_refresh_tariffs(update_entry=True)

    async def _async_refresh_tariffs(self, *, update_entry: bool) -> bool:
        return await refresh_tariffs(
            self.hass,
            self.entry,
            update_entry=update_entry,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            logger=_LOGGER,
        )
