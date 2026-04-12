"""Coordinator: energy tracking, costs, multi-battery, solar estimation."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const.config_keys import CONF_BATTERY_SYSTEMS
from .const.core import DOMAIN
from .const.energy_data import (
    DATA_BATT_CHARGE_METER_KWH,
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_BATTERY_AVAILABLE_ENERGY_KWH,
    DATA_BATTERY_CARD,
    DATA_BATTERY_CHARGE_KWH,
    DATA_BATTERY_DISCHARGE_KWH,
    DATA_BATTERY_EFFICIENCY,
    DATA_BATTERY_POWER_NET,
    DATA_BATTERY_SOC,
    DATA_BATTERY_STORED_ENERGY_KWH,
    DATA_BATTERY_TOTAL_CHARGE_KWH,
    DATA_BATTERY_TOTAL_DISCHARGE_KWH,
    DATA_BATTERY_TOTAL_NET_POWER_W,
    DATA_CONTRACT_POWER,
    DATA_COST_BY_SLOT,
    DATA_COST_TOTAL,
    DATA_CURRENT_SLOT,
    DATA_DAY,
    DATA_ECO_BATT,
    DATA_ECO_SOLAR,
    DATA_ENERGY_BATT_CHARGE_TODAY_KWH,
    DATA_ENERGY_BATT_CHARGE_TOTAL_KWH,
    DATA_ENERGY_BATT_DISCHARGE_TODAY_KWH,
    DATA_ENERGY_BATT_DISCHARGE_TOTAL_KWH,
    DATA_ENERGY_EXPORT_TODAY_KWH,
    DATA_ENERGY_EXPORT_TOTAL_KWH,
    DATA_ENERGY_GRID_TODAY_KWH,
    DATA_ENERGY_GRID_TOTAL_KWH,
    DATA_ENERGY_HOME_TODAY_KWH,
    DATA_ENERGY_SOLAR_TODAY_KWH,
    DATA_ENERGY_SOLAR_TOTAL_KWH,
    DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH,
    DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH,
    DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH,
    DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR,
    DATA_EXPORT_POWER_W,
    DATA_EXPORT_UNATTRIBUTED_KWH,
    DATA_GRID_IMPORT_POWER_W,
    DATA_GRID_POWER_SIGNED_W,
    DATA_GRID_TO_BATTERY_POWER_W,
    DATA_GRID_TO_HOME_POWER_W,
    DATA_HOME_POWER_W,
    DATA_LOAD_POWER_INFERRED,
    DATA_LOAD_POWER_W,
    DATA_LOGIC_VERSION,
    DATA_OFFER,
    DATA_ORIGIN_GRID,
    DATA_ORIGIN_GRID_ATTRS,
    DATA_ORIGIN_SOLAR,
    DATA_ORIGIN_SOLAR_ATTRS,
    DATA_PRICING_STRUCTURE,
    DATA_REINJECTION_CAUSE,
    DATA_REINJECTION_CONFIDENCE,
    DATA_RTE_CALENDAR_FETCHED_AT,
    DATA_SOLAR_ESTIMATE_DAILY_KWH,
    DATA_SOLAR_ESTIMATE_POWER_W,
    DATA_SOLAR_ESTIMATE_YEARLY_KWH,
    DATA_SOLAR_EXPORT_POWER_W,
    DATA_SOLAR_EXPORT_REVENUE_EUR,
    DATA_SOLAR_POWER_W,
    DATA_SOLAR_PRODUCTION_POWER_W,
    DATA_SOLAR_TO_BATTERY_POWER_W,
    DATA_SOLAR_TO_HOME_POWER_W,
    DATA_SUPPLIER,
    DATA_TARIFF_FETCHED_AT,
    DATA_TEMPO_DAYS,
    DATA_TEMPO_NEXT_COLOUR_CHANGE_AT,
    DATA_TEMPO_NEXT_HC_START_AT,
    DATA_TODAY_COLOR,
    DATA_TOMORROW_COLOR,
    DATA_USAGE_BATT_CHARGE_METHOD,
    DATA_USAGE_BATT_HOME,
    DATA_USAGE_GRID_BATT_CHARGE,
    DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_GRID_DIRECT,
    DATA_USAGE_SOLAR_BATT_CHARGE,
    DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH,
    DATA_USAGE_SOLAR_DIRECT,
    ENERGY_ROUND_DECIMALS,
)
from .const.reinjection import DIAG_CAUSE_UNATTRIBUTED
from .const.tariff_edf import ATTRIBUTION_SLOTS, CONF_CURRENT_SLOT_SENSOR
from .diagnostics.reinjection_state import ReinjectionState
from .coordinator_policy import (
    DIAG_CAUSES,
    delta_policy_from_entry,
    paris_now,
    paris_yesterday,
)
from .ha.reader import HAReader
from .runtime.persistence import PersistenceManager
from .runtime.state import RuntimeState
from .scheduler import Scheduler
from .snapshot.coordinator_bridge import build_pipeline_deps
from .snapshot.pipeline import SnapshotPipeline
from .coordinator_apply_delta import apply_energy_delta
from .coordinator_apply_snapshot import apply_snapshot_to_coordinator
from .coordinator_delta_telemetry import refresh_delta_telemetry_drift_all_sources
from .coordinator_snapshot_access import (
    snapshot_get_list,
    snapshot_get_mapping_value,
    snapshot_get_nested_numeric_value,
    snapshot_get_numeric_value,
    snapshot_get_str,
    snapshot_get_value,
)
from .coordinator_update_prep import refresh_tariff_resolver_and_edf_before_snapshot
from .coordinator_config_view import (
    entry_battery_systems,
    entry_grid_power_sign_mode,
    entry_has_batteries,
    entry_has_solar,
    entry_is_edf,
    entry_phase_type,
    entry_pricing_structure,
    entry_solar_estimation_enabled,
    entry_solar_resale_configured,
    entry_supplier,
    entry_tariff_offer,
    entry_tempo_mode,
    tempo_rte_calendar_ready,
)
from .coordinator_lifecycle import (
    coordinator_arm_next_poll,
    coordinator_async_setup,
    coordinator_cancel_poll_schedule,
    coordinator_next_poll_fire_paris,
    coordinator_rebuild_from_recorder,
    coordinator_run_scheduled_poll,
)
from .coordinator_tariff_wiring import (
    async_refresh_tariffs,
    build_tariff_resolver,
    next_tariff_refresh_rejected_incomplete,
    tariff_refresh_enabled as entry_tariff_refresh_enabled,
    tariff_refresh_hours as entry_tariff_refresh_hours,
)
from .coordinator_entity_map import (
    build_power_source_map,
    build_source_map,
    read_energy_kwh_for_persistence,
    tri_grid_aggregate_export_entities,
    tri_grid_aggregate_import_entities,
)
from .coordinator_snapshot_build import run_coordinator_snapshot_build
from .coordinator_types import (
    SAVE_DEBOUNCE_S,
    STORE_MODEL_VERSION,
    BatterySnapshotData,
    EnergyData,
)
from .storage.statistics import statistic_id as statistic_id_for_domain
from .storage.store_manager import StoreManager
from .tariff import EdfRuntimeFields
from .tariff_manager import TariffResolver
from .utils.energy import normalize_kwh
from .utils.numbers import safe_float
from .providers.edf import parse_slot_from_sensor_state

_LOGGER = logging.getLogger(__name__)


class HubEnergieCoordinator(DataUpdateCoordinator[EnergyData]):
    """Central state coordinator for Hub Énergie."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=None)
        self.entry = entry
        self.config_entry = entry
        self.data: EnergyData = {}
        self._state_lock = asyncio.Lock()
        self._store_manager = StoreManager(
            model_version=STORE_MODEL_VERSION,
            slots=ATTRIBUTION_SLOTS,
            decimals=ENERGY_ROUND_DECIMALS,
        )
        self._reader = HAReader(hass, entry, normalize_kwh=normalize_kwh)

        self._edf = EdfRuntimeFields()
        self._energy_attrib_date: str | None = None
        self._last_flow_warn_ts: datetime | None = None

        self._reinjection_state = ReinjectionState(
            slots=ATTRIBUTION_SLOTS,
            diag_causes=DIAG_CAUSES,
            default_cause=DIAG_CAUSE_UNATTRIBUTED,
        )
        self._runtime_state = RuntimeState(
            slots=ATTRIBUTION_SLOTS,
            reinjection_state=self._reinjection_state,
        )
        self._delta_policy = delta_policy_from_entry(entry)
        self._trust_rebuilding_after_recorder = False
        self._tariff_refresh_rejected_incomplete = False
        self._first_input_probe_logged = False
        self._last_input_probe_signature: str | None = None

        self._persistence = PersistenceManager(
            hass=self.hass,
            entry=self.entry,
            domain=DOMAIN,
            slots=ATTRIBUTION_SLOTS,
            state_lock=self._state_lock,
            runtime_state=self._runtime_state,
            store_manager=self._store_manager,
            save_debounce_s=SAVE_DEBOUNCE_S,
            logger=_LOGGER,
            store_model_version=STORE_MODEL_VERSION,
            source_map=self.source_map,
            expected_source_keys=self._expected_source_keys,
            read_energy_kwh=self._read_energy_kwh_for_persistence,
            normalize_kwh=normalize_kwh,
            safe_float=safe_float,
            statistic_id=lambda sk, sl: statistic_id_for_domain(DOMAIN, sk, sl),
        )
        self._snapshot_pipeline = SnapshotPipeline(ATTRIBUTION_SLOTS, build_pipeline_deps(self))

        self._tariff: TariffResolver | None = None
        self._scheduler = Scheduler(
            hass=self.hass,
            entry=self.entry,
            next_poll_fire_paris=self._next_poll_fire_paris,
            on_scheduled_poll=self._async_scheduled_poll,
            on_midnight=self._async_midnight_maintenance,
            on_tariff_refresh=lambda: self._async_refresh_tariffs(update_entry=True),
            tariff_refresh_enabled=lambda: self.is_edf
            and entry_tariff_refresh_enabled(dict(self.entry.options)),
            tariff_refresh_hours=lambda: entry_tariff_refresh_hours(dict(self.entry.options)),
        )

    @property
    def supplier(self) -> str:
        return entry_supplier(self.entry.data)

    @property
    def is_edf(self) -> bool:
        return entry_is_edf(self.entry.data)

    @property
    def tariff_offer(self) -> str:
        return entry_tariff_offer(self.entry.data, self.entry.options)

    @property
    def tempo_mode(self) -> str:
        return entry_tempo_mode(self.entry.data)

    @property
    def tempo_rte_calendar_ready(self) -> bool:
        """True when RTE calendar rows exist if Tempo + RTE mode requires them."""
        return tempo_rte_calendar_ready(
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            calendar_rows=self._edf.calendar_rows,
        )

    @property
    def phase_type(self) -> str:
        return entry_phase_type(self.entry.data)

    @property
    def pricing_structure(self) -> str:
        return entry_pricing_structure(self.entry.data)

    @property
    def battery_systems(self) -> list[dict[str, Any]]:
        return entry_battery_systems(self.entry.data)

    @property
    def has_batteries(self) -> bool:
        return entry_has_batteries(self.entry.data)

    @property
    def has_solar(self) -> bool:
        return entry_has_solar(self.entry.data)

    @property
    def solar_estimation_enabled(self) -> bool:
        return entry_solar_estimation_enabled(self.entry.data)

    @property
    def solar_resale_configured(self) -> bool:
        return entry_solar_resale_configured(self.entry.data)

    def _read_energy_kwh_for_persistence(self, entity_id: str | None) -> float | None:
        return read_energy_kwh_for_persistence(entity_id, self.entry.data, self._reader)

    def tri_grid_aggregate_import_entities(self) -> list[str]:
        return tri_grid_aggregate_import_entities(self.entry.data, phase_type=self.phase_type)

    def tri_grid_aggregate_export_entities(self) -> list[str]:
        return tri_grid_aggregate_export_entities(self.entry.data, phase_type=self.phase_type)

    def source_map(self) -> dict[str, str | None]:
        return build_source_map(
            self.entry.data,
            battery_systems=self.battery_systems,
            has_solar=self.has_solar,
        )

    def power_source_map(self) -> dict[str, str | None]:
        return build_power_source_map(
            self.entry.options,
            self.entry.data,
            has_solar=self.has_solar,
        )

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
        return entry_grid_power_sign_mode(self.entry.data, self.entry.options)

    def _build_tariff_resolver(self) -> TariffResolver:
        return build_tariff_resolver(self.entry)

    def tariff_refresh_enabled(self) -> bool:
        return entry_tariff_refresh_enabled(dict(self.entry.options))

    def tariff_refresh_hours(self) -> int:
        return entry_tariff_refresh_hours(dict(self.entry.options))

    async def async_setup(self) -> None:
        await coordinator_async_setup(self)

    async def _async_rebuild_from_recorder(self) -> None:
        await coordinator_rebuild_from_recorder(self)

    def _cancel_poll_schedule(self) -> None:
        coordinator_cancel_poll_schedule(self)

    async def _async_scheduled_poll(self) -> None:
        await coordinator_run_scheduled_poll(self, async_request_refresh=self.async_request_refresh)

    def _arm_next_poll(self) -> None:
        coordinator_arm_next_poll(self)

    def _next_poll_fire_paris(self, after: datetime) -> datetime:
        return coordinator_next_poll_fire_paris(
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

    def snapshot_data(self) -> EnergyData | None:
        """Return the latest typed snapshot payload when available."""
        return self.data if self.data else None

    def get_value(self, key: str) -> Any | None:
        """Return a raw snapshot value safely."""
        return snapshot_get_value(self.snapshot_data(), key)

    def get_numeric_value(self, key: str) -> float | None:
        """Return a finite numeric snapshot value."""
        return snapshot_get_numeric_value(self.snapshot_data(), key)

    def get_mapping_value(self, key: str) -> dict[str, Any] | None:
        """Return a snapshot mapping safely."""
        return snapshot_get_mapping_value(self.snapshot_data(), key)

    def get_nested_numeric_value(self, section_key: str, key: str) -> float | None:
        """Return a finite numeric value inside a snapshot mapping."""
        return snapshot_get_nested_numeric_value(self.snapshot_data(), section_key, key)

    def get_grid_power_signed_w(self) -> float | None:
        """Return signed grid power in watts."""
        return self.get_numeric_value(DATA_GRID_POWER_SIGNED_W)

    def get_solar_power_w(self) -> float | None:
        """Return measured solar power in watts."""
        return self.get_numeric_value(DATA_SOLAR_POWER_W)

    def get_load_power_w(self) -> float | None:
        """Return measured or inferred load power in watts."""
        return self.get_numeric_value(DATA_LOAD_POWER_W)

    def get_cost_total(self) -> float | None:
        """Return today's total cost in EUR."""
        return self.get_numeric_value(DATA_COST_TOTAL)

    def get_current_slot(self) -> str | None:
        """Return the current tariff slot."""
        return snapshot_get_str(self.snapshot_data(), DATA_CURRENT_SLOT)

    def get_today_color(self) -> str | None:
        """Return today's Tempo color."""
        return snapshot_get_str(self.snapshot_data(), DATA_TODAY_COLOR)

    def get_tomorrow_color(self) -> str | None:
        """Return tomorrow's Tempo color."""
        return snapshot_get_str(self.snapshot_data(), DATA_TOMORROW_COLOR)

    def get_tempo_days(self) -> dict[str, Any] | None:
        """Return Tempo day counters mapping."""
        return self.get_mapping_value(DATA_TEMPO_DAYS)

    def get_battery_systems_data(self) -> list[BatterySnapshotData]:
        """Return per-battery snapshot rows."""
        return cast(list[BatterySnapshotData], snapshot_get_list(self.snapshot_data(), CONF_BATTERY_SYSTEMS))

    async def _async_refresh_delta_telemetry_drift_all_sources(self) -> None:
        """Recompute relative meter drift in existing telemetry (e.g. after restart / anchor migration)."""
        await refresh_delta_telemetry_drift_all_sources(
            self._state_lock,
            self._runtime_state,
            self.source_map(),
            self._read_energy_kwh_for_persistence,
            normalize_kwh,
        )

    async def _async_apply_delta(self, entity_id: str, source_key: str, new_val: float) -> None:
        energy_attrib_date_ref: list[str | None] = [self._energy_attrib_date]
        await apply_energy_delta(
            hass=self.hass,
            entry=self.entry,
            edf=self._edf,
            runtime_state=self._runtime_state,
            state_lock=self._state_lock,
            delta_policy=self._delta_policy,
            normalize_kwh=normalize_kwh,
            read_energy_kwh_for_persistence=self._read_energy_kwh_for_persistence,
            schedule_save_locked=self._schedule_store_save_locked,
            async_request_refresh=self.async_request_refresh,
            async_notify_all=self._async_notify_all,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            entity_id=entity_id,
            source_key=source_key,
            new_val=new_val,
            energy_attrib_date_ref=energy_attrib_date_ref,
            logger=_LOGGER,
        )
        self._energy_attrib_date = energy_attrib_date_ref[0]

    def _schedule_store_save_locked(self) -> None:
        self._persistence.schedule_save_locked()

    async def _async_flush_pending_store_save(self) -> None:
        await self._persistence.flush_pending_store_save()

    async def _async_schedule_save(self) -> None:
        async with self._state_lock:
            self._schedule_store_save_locked()

    async def _async_midnight_maintenance(self) -> None:
        yesterday = paris_yesterday()
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
        await apply_snapshot_to_coordinator(self, clear_trust_rebuilding_after_recorder=False)

    async def _async_update_data(self) -> EnergyData:
        now_paris = paris_now()
        self._tariff = await refresh_tariff_resolver_and_edf_before_snapshot(
            hass=self.hass,
            entry=self.entry,
            edf=self._edf,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            now_paris=now_paris,
            logger=_LOGGER,
            on_tempo_sensor_branch=self._refresh_slot_sensor,
        )

        return await apply_snapshot_to_coordinator(
            self,
            clear_trust_rebuilding_after_recorder=True,
        )

    def _build_snapshot(self) -> EnergyData:
        snap, next_ts, first_logged, last_sig = run_coordinator_snapshot_build(
            self,
            logger=_LOGGER,
        )
        self._last_flow_warn_ts = next_ts
        self._first_input_probe_logged = first_logged
        self._last_input_probe_signature = last_sig
        return snap

    async def async_manual_tariff_refresh(self) -> bool:
        return await self._async_refresh_tariffs(update_entry=True)

    async def _async_refresh_tariffs(self, *, update_entry: bool) -> bool:
        outcome = await async_refresh_tariffs(
            self.hass,
            self.entry,
            update_entry=update_entry,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            logger=_LOGGER,
        )
        self._tariff_refresh_rejected_incomplete = next_tariff_refresh_rejected_incomplete(
            self._tariff_refresh_rejected_incomplete,
            outcome,
        )
        return outcome.ok
