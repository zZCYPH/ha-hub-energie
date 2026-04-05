"""Coordinator: energy tracking, costs, multi-battery, solar estimation."""

from __future__ import annotations

import asyncio
import json
import logging
import math
from datetime import datetime
from typing import Any, TypedDict, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_BATTERY_SYSTEMS,
    CONF_CURRENT_SLOT_SENSOR,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    PHASE_TRI,
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
    DATA_BATT_CHARGE_POWER_W,
    DATA_BATT_DISCHARGE_POWER_W,
    DATA_BATTERY_CARD,
    DATA_BATTERY_SOC,
    DATA_BATTERY_STORED_ENERGY_KWH,
    DATA_BATTERY_AVAILABLE_ENERGY_KWH,
    DATA_BATTERY_CHARGE_KWH,
    DATA_BATTERY_DISCHARGE_KWH,
    DATA_BATTERY_EFFICIENCY,
    DATA_BATTERY_POWER_NET,
    DATA_BATTERY_TOTAL_CHARGE_KWH,
    DATA_BATTERY_TOTAL_DISCHARGE_KWH,
    DATA_BATTERY_TOTAL_NET_POWER_W,
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
    DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR,
    DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR,
    DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH,
    DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH,
    DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH,
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
    DATA_BATT_CHARGE_METER_KWH,
    ATTRIBUTION_SLOTS,
    DATA_CONTRACT_POWER,
    DATA_DATA_QUALITY,
    DATA_INPUT_MISSING_ENTITY_IDS,
    DATA_INPUT_STATUS,
    DATA_INPUT_STATUS_REASONS,
    DATA_INPUT_UNAVAILABLE_ENTITY_IDS,
    DATA_DELTA_DISCARDS,
    DATA_DELTA_LAST_REJECTION,
    DATA_DELTA_TELEMETRY,
    DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY,
    DATA_SECONDS_SINCE_LAST_APPLIED_DELTA,
    DATA_TRUST_CAUSE,
    DATA_TRUST_CAUSE_CODE,
    DATA_TRUST_LEVEL,
    DATA_OFFER,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
    DOMAIN,
    ENERGY_ROUND_DECIMALS,
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    INPUT_STATUS_OK,
    SLOT_UNKNOWN,
    SOURCE_GRID,
    SOURCE_GRID_EXPORT,
    SOURCE_SOLAR,
    SYNTHETIC_ENTITY_GRID_EXPORT_SUM,
    SYNTHETIC_ENTITY_GRID_IMPORT_SUM,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
    TRI_GRID_ENERGY_PER_PHASE,
    OPT_TARIFF_AUTO_REFRESH,
    OPT_TARIFF_REFRESH_HOURS,
)
from .diagnostics.reinjection_state import ReinjectionState
from .energy.delta_observability import seconds_since_last_applied_delta
from .energy.delta_policy import DeltaPolicy
from .energy.trust_level import TrustInputs, compute_trust
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
from .tariff import EdfRuntimeFields, TariffRefreshOutcome, refresh_tariffs, update_edf_state
from .tariff.slot_attribution import resolve_attribution_slot
from .tariff_manager import TariffResolver
from .time.paris_time import ParisTime
from .utils.energy import normalize_kwh
from .utils.grid_phases import ordered_phase_entity_ids
from .utils.input_availability import (
    compute_input_probe,
    derive_input_status,
    format_probe_log_dict,
    probe_signature,
)
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


class BatteryCardData(TypedDict, total=False):
    capacity_kwh: float
    stored_kwh: float
    available_kwh: float
    soc_percent: float
    soc_min_percent: float
    soc_max_percent: float


class BatterySnapshotData(TypedDict, total=False):
    id: str
    charge_kwh: float
    discharge_kwh: float
    power_net: float
    soc: float
    stored_energy_kwh: float
    available_energy_kwh: float
    efficiency: float


class EnergyData(TypedDict, total=False):
    day: str
    logic_version: str
    current_slot: str
    today_color: str
    tomorrow_color: str
    tempo_days: dict[str, dict[str, int]]
    tempo_next_colour_change_at: str
    tempo_next_hc_start_at: str
    rte_calendar_fetched_at: str
    cost_total: float
    cost_by_slot: dict[str, float]
    abonnement_eur: float
    offer: str
    supplier: str
    contract_power: str
    tariff_fetched_at: str
    pricing_structure: str
    reinjection_cause: str
    reinjection_confidence: float
    export_power_w: float
    grid_power_signed_w: float
    solar_power_w: float
    solar_estimate_power_w: float
    batt_discharge_power_w: float
    batt_charge_power_w: float
    load_power_w: float
    load_power_inferred: bool
    export_due_to_solar_surplus_kwh: float
    export_due_to_battery_full_or_absent_kwh: float
    export_due_to_switch_latency_kwh: float
    export_unattributed_kwh: float
    export_opportunity_cost_total_eur: float
    export_opportunity_cost_solar_surplus_eur: float
    export_opportunity_cost_battery_full_or_absent_eur: float
    export_opportunity_cost_switch_latency_eur: float
    export_opportunity_cost_unattributed_eur: float
    usage_grid_direct: float
    usage_grid_batt_charge: float
    usage_solar_direct: float
    usage_solar_batt_charge: float
    usage_batt_home: float
    usage_batt_charge_method: str
    batt_charge_meter_kwh: float
    usage_grid_batt_charge_by_slot_kwh: dict[str, float]
    usage_solar_batt_charge_by_slot_kwh: dict[str, float]
    origin_grid: float
    origin_solar: float
    origin_grid_attrs: dict[str, float]
    origin_solar_attrs: dict[str, float]
    eco_solar: float
    eco_batt: float
    battery_card: BatteryCardData
    battery_total_charge_kwh: float
    battery_total_discharge_kwh: float
    battery_total_net_power_w: float
    battery_systems: list[BatterySnapshotData]
    solar_estimate_daily_kwh: float
    solar_estimate_yearly_kwh: float
    solar_export_revenue_eur: float
    energy_grid_total_kwh: float
    energy_solar_total_kwh: float
    energy_export_total_kwh: float
    energy_batt_charge_total_kwh: float
    energy_batt_discharge_total_kwh: float
    energy_home_today_kwh: float
    energy_grid_today_kwh: float
    energy_solar_today_kwh: float
    energy_export_today_kwh: float
    energy_batt_charge_today_kwh: float
    energy_batt_discharge_today_kwh: float
    home_power_w: float
    grid_import_power_w: float
    solar_production_power_w: float
    battery_discharge_power_w: float
    solar_to_home_power_w: float
    battery_to_home_power_w: float
    grid_to_home_power_w: float
    solar_to_battery_power_w: float
    grid_to_battery_power_w: float
    solar_export_power_w: float
    data_quality: str
    delta_telemetry: dict[str, dict[str, Any]]
    delta_discards: dict[str, int]
    delta_last_rejection: dict[str, dict[str, Any]]
    grid_unknown_bucket_kwh_today: float
    seconds_since_last_applied_delta: float | None
    trust_level: str
    trust_cause_code: str
    trust_cause: str
    input_status: str
    input_status_reasons: list[str]
    input_missing_entity_ids: list[str]
    input_unavailable_entity_ids: list[str]


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
            diag_causes=_DIAG_CAUSES,
            default_cause=DIAG_CAUSE_UNATTRIBUTED,
        )
        self._runtime_state = RuntimeState(
            slots=ATTRIBUTION_SLOTS,
            reinjection_state=self._reinjection_state,
        )
        self._delta_policy = DeltaPolicy()
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
    def tempo_rte_calendar_ready(self) -> bool:
        """True when RTE calendar rows exist if Tempo + RTE mode requires them."""
        if not self.is_edf or self.tariff_offer != TARIFF_OFFER_TEMPO:
            return True
        if self.tempo_mode != TEMPO_MODE_RTE:
            return True
        return bool(self._edf.calendar_rows)

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

    def _read_energy_kwh_for_persistence(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        if entity_id == SYNTHETIC_ENTITY_GRID_IMPORT_SUM:
            ids = ordered_phase_entity_ids(self.entry.data.get(CONF_GRID_IMPORT_ENERGY_PHASES))
            if len(ids) != 3:
                return None
            return self._reader.sum_energy_kwh(ids)
        if entity_id == SYNTHETIC_ENTITY_GRID_EXPORT_SUM:
            ids = ordered_phase_entity_ids(self.entry.data.get(CONF_GRID_EXPORT_ENERGY_PHASES))
            if len(ids) != 3:
                return None
            return self._reader.sum_energy_kwh(ids)
        return self._reader.read_energy_kwh(entity_id)

    def tri_grid_aggregate_import_entities(self) -> list[str]:
        if (
            self.phase_type != PHASE_TRI
            or self.entry.data.get(CONF_GRID_TRI_ENERGY_MODE) != TRI_GRID_ENERGY_PER_PHASE
        ):
            return []
        return ordered_phase_entity_ids(self.entry.data.get(CONF_GRID_IMPORT_ENERGY_PHASES))

    def tri_grid_aggregate_export_entities(self) -> list[str]:
        if (
            self.phase_type != PHASE_TRI
            or self.entry.data.get(CONF_GRID_TRI_ENERGY_MODE) != TRI_GRID_ENERGY_PER_PHASE
        ):
            return []
        return ordered_phase_entity_ids(self.entry.data.get(CONF_GRID_EXPORT_ENERGY_PHASES))

    def source_map(self) -> dict[str, str | None]:
        d = self.entry.data
        grid_import = cast(str | None, d.get(CONF_GRID_IMPORT_ENERGY))
        grid_export = cast(str | None, d.get(CONF_GRID_EXPORT_ENERGY))
        if (
            d.get(CONF_PHASE_TYPE) == PHASE_TRI
            and d.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE
        ):
            imp_ids = ordered_phase_entity_ids(d.get(CONF_GRID_IMPORT_ENERGY_PHASES))
            grid_import = SYNTHETIC_ENTITY_GRID_IMPORT_SUM if len(imp_ids) == 3 else None
            exp_ids = ordered_phase_entity_ids(d.get(CONF_GRID_EXPORT_ENERGY_PHASES))
            grid_export = SYNTHETIC_ENTITY_GRID_EXPORT_SUM if len(exp_ids) == 3 else None
        m: dict[str, str | None] = {
            SOURCE_GRID: grid_import,
            SOURCE_SOLAR: d.get(CONF_SOLAR_ENERGY) if self.has_solar else None,
            SOURCE_GRID_EXPORT: grid_export,
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
        _, rebuilt = await self._persistence.load()
        self._trust_rebuilding_after_recorder = rebuilt
        self._tariff = self._build_tariff_resolver()
        self.entry.async_on_unload(
            self.hass.bus.async_listen("state_changed", create_state_changed_handler(self))
        )
        self._scheduler.start()
        await self._async_refresh_delta_telemetry_drift_all_sources()

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

    def snapshot_data(self) -> EnergyData | None:
        """Return the latest typed snapshot payload when available."""
        return self.data if self.data else None

    def get_value(self, key: str) -> Any | None:
        """Return a raw snapshot value safely."""
        data = self.snapshot_data()
        if not data:
            return None
        return data.get(key)

    def get_numeric_value(self, key: str) -> float | None:
        """Return a finite numeric snapshot value."""
        value = self.get_value(key)
        if value is None or not isinstance(value, (int, float)):
            return None
        numeric = float(value)
        return numeric if math.isfinite(numeric) else None

    def get_mapping_value(self, key: str) -> dict[str, Any] | None:
        """Return a snapshot mapping safely."""
        value = self.get_value(key)
        return value if isinstance(value, dict) else None

    def get_nested_numeric_value(self, section_key: str, key: str) -> float | None:
        """Return a finite numeric value inside a snapshot mapping."""
        section = self.get_mapping_value(section_key)
        if not section:
            return None
        value = section.get(key)
        if value is None or not isinstance(value, (int, float)):
            return None
        numeric = float(value)
        return numeric if math.isfinite(numeric) else None

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
        value = self.get_value(DATA_CURRENT_SLOT)
        return str(value) if value is not None else None

    def get_today_color(self) -> str | None:
        """Return today's Tempo color."""
        value = self.get_value(DATA_TODAY_COLOR)
        return str(value) if value is not None else None

    def get_tomorrow_color(self) -> str | None:
        """Return tomorrow's Tempo color."""
        value = self.get_value(DATA_TOMORROW_COLOR)
        return str(value) if value is not None else None

    def get_tempo_days(self) -> dict[str, Any] | None:
        """Return Tempo day counters mapping."""
        return self.get_mapping_value(DATA_TEMPO_DAYS)

    def get_battery_systems_data(self) -> list[BatterySnapshotData]:
        """Return per-battery snapshot rows."""
        value = self.get_value(CONF_BATTERY_SYSTEMS)
        return value if isinstance(value, list) else []

    async def _async_refresh_delta_telemetry_drift_all_sources(self) -> None:
        """Recompute relative meter drift in existing telemetry (e.g. after restart / anchor migration)."""
        async with self._state_lock:
            for source_key, ent in self.source_map().items():
                if not ent:
                    continue
                meter_kwh = self._read_energy_kwh_for_persistence(ent)
                drift = self._runtime_state.relative_meter_drift_kwh(
                    source_key,
                    meter_kwh=meter_kwh,
                    normalize_kwh=normalize_kwh,
                )
                self._runtime_state.patch_delta_telemetry_drift(source_key, drift)

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

        prev_tel = self._runtime_state.delta_telemetry.get(source_key, {})
        prev_iso = prev_tel.get("last_applied_at") if isinstance(prev_tel, dict) else None
        gap_seconds: float | None = None
        if isinstance(prev_iso, str):
            prev_dt = dt_util.parse_datetime(prev_iso)
            if prev_dt is not None:
                gap_seconds = (dt_util.utcnow() - prev_dt).total_seconds()

        attribution = resolve_attribution_slot(
            now_paris=now_paris,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            tempo_mode=self.tempo_mode,
            edf_fields=self._edf,
            hass=self.hass,
            entry=self.entry,
            last_stable_slot=self._runtime_state.last_stable_attribution_slot,
        )
        if attribution.slot == SLOT_UNKNOWN:
            await self.async_request_refresh()
            attribution = resolve_attribution_slot(
                now_paris=_paris_now(),
                is_edf=self.is_edf,
                tariff_offer=self.tariff_offer,
                tempo_mode=self.tempo_mode,
                edf_fields=self._edf,
                hass=self.hass,
                entry=self.entry,
                last_stable_slot=self._runtime_state.last_stable_attribution_slot,
            )

        slot = attribution.slot
        method = attribution.method
        self._edf.current_slot = slot

        if method != "direct":
            _LOGGER.info(
                "Energy delta attribution source=%s slot=%s method=%s",
                source_key,
                slot,
                method,
            )

        normalized_new = normalize_kwh(new_val)
        reanchor_outcomes = frozenset(
            {"initialized", "source_changed", "reset_rebased", "discarded_unrealistic"}
        )
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
            if result.outcome in reanchor_outcomes:
                self._runtime_state.reanchor_drift_meter_for_source(
                    source_key,
                    meter_kwh=normalized_new,
                    normalize_kwh=normalize_kwh,
                )
            if result.outcome == "discarded_negative":
                self._runtime_state.note_delta_discard("discarded_negative")
                self._runtime_state.record_last_delta_rejection(
                    source_key,
                    reason="discarded_negative",
                    at_iso=dt_util.utcnow().isoformat(),
                    delta_kwh=result.delta_kwh,
                    last_raw=result.last_raw,
                    new_raw=result.new_raw,
                )
                _LOGGER.warning(
                    "Discarded negative delta for %s: old=%.6f new=%.6f",
                    source_key,
                    result.last_raw or 0.0,
                    result.new_raw or 0.0,
                )
            elif result.outcome == "discarded_unrealistic":
                self._runtime_state.note_delta_discard("discarded_unrealistic")
                self._runtime_state.record_last_delta_rejection(
                    source_key,
                    reason="discarded_unrealistic",
                    at_iso=dt_util.utcnow().isoformat(),
                    delta_kwh=result.delta_kwh,
                    last_raw=result.last_raw,
                    new_raw=result.new_raw,
                )
                _LOGGER.warning(
                    "Discarded unrealistic delta for %s: delta=%.6f",
                    source_key,
                    result.delta_kwh,
                )
            elif result.outcome == "applied":
                meter_kwh = self._read_energy_kwh_for_persistence(entity_id)
                drift_kwh = self._runtime_state.relative_meter_drift_kwh(
                    source_key,
                    meter_kwh=meter_kwh,
                    normalize_kwh=normalize_kwh,
                )
                self._runtime_state.record_applied_delta_telemetry(
                    source_key,
                    applied_at_iso=dt_util.utcnow().isoformat(),
                    delta_kwh=result.delta_kwh,
                    slot=slot,
                    method=method,
                    gap_seconds=gap_seconds,
                    drift_kwh=drift_kwh,
                )
            if result.outcome in reanchor_outcomes:
                drift_now = self._runtime_state.relative_meter_drift_kwh(
                    source_key,
                    meter_kwh=normalized_new,
                    normalize_kwh=normalize_kwh,
                )
                self._runtime_state.patch_delta_telemetry_drift(source_key, drift_now)
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

    async def _async_update_data(self) -> EnergyData:
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
        self._trust_rebuilding_after_recorder = False
        return snapshot

    def _compute_data_quality(self) -> str:
        """Attribution / delta health (unknown bucket, gaps). Not entity presence — see input_status."""
        day = ParisTime.today()
        day_acc = self._runtime_state.snapshot_data(day)
        grid = day_acc.get(SOURCE_GRID, {})
        unk = (
            float(grid.get(SLOT_UNKNOWN, 0.0))
            if isinstance(grid, dict)
            else 0.0
        )
        for tel in self._runtime_state.delta_telemetry.values():
            if not isinstance(tel, dict):
                continue
            if tel.get("last_method") not in (None, "direct"):
                return "degraded"
            gs = tel.get("last_gap_seconds")
            if gs is not None and float(gs) > 7200:
                return "degraded"
        if unk > 0.01:
            return "degraded"
        return "good"

    def _build_snapshot(self) -> EnergyData:
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
        snap = dict(result.snapshot)
        snap[DATA_DATA_QUALITY] = self._compute_data_quality()
        snap[DATA_DELTA_TELEMETRY] = {
            k: dict(v) if isinstance(v, dict) else v
            for k, v in self._runtime_state.delta_telemetry.items()
        }
        snap[DATA_DELTA_DISCARDS] = dict(self._runtime_state.delta_discards)
        snap[DATA_DELTA_LAST_REJECTION] = dict(
            self._runtime_state.last_delta_rejection_by_source,
        )
        day_today = ParisTime.today()
        grid_day = self._runtime_state.snapshot_data(day_today).get(SOURCE_GRID, {})
        unk_today = (
            float(grid_day.get(SLOT_UNKNOWN, 0.0))
            if isinstance(grid_day, dict)
            else 0.0
        )
        snap[DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY] = unk_today
        snap[DATA_SECONDS_SINCE_LAST_APPLIED_DELTA] = seconds_since_last_applied_delta(
            self._runtime_state.delta_telemetry,
            now_utc=dt_util.utcnow(),
        )
        slot_raw = snap.get(DATA_CURRENT_SLOT)
        slot_str = str(slot_raw).strip() if slot_raw is not None else ""
        trust = compute_trust(
            TrustInputs(
                post_recorder_rebuild_pending=self._trust_rebuilding_after_recorder,
                delta_telemetry=snap[DATA_DELTA_TELEMETRY],
                delta_discards=snap[DATA_DELTA_DISCARDS],
                grid_unknown_bucket_kwh_today=float(snap[DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY]),
                seconds_since_last_applied_delta=snap[DATA_SECONDS_SINCE_LAST_APPLIED_DELTA],
                has_configured_energy_sources=bool(self._expected_source_keys()),
                current_slot=slot_str if slot_str else None,
                is_edf_tempo_rte_not_ready=(
                    self.is_edf
                    and self.tariff_offer == TARIFF_OFFER_TEMPO
                    and self.tempo_mode == TEMPO_MODE_RTE
                    and not self.tempo_rte_calendar_ready
                ),
                tariff_refresh_rejected_incomplete=self._tariff_refresh_rejected_incomplete,
                battery_data_quality=str(snap.get("battery_data_quality") or "ok"),
                data_quality=str(snap[DATA_DATA_QUALITY]),
            ),
        )
        snap[DATA_TRUST_LEVEL] = trust.level
        snap[DATA_TRUST_CAUSE_CODE] = trust.cause_code
        snap[DATA_TRUST_CAUSE] = trust.cause_message

        probe = compute_input_probe(self.hass, self.entry, self._reader)
        input_status, input_reasons = derive_input_status(
            probe,
            trust_level=str(snap[DATA_TRUST_LEVEL]),
            data_quality=str(snap[DATA_DATA_QUALITY]),
        )
        snap[DATA_INPUT_STATUS] = input_status
        snap[DATA_INPUT_STATUS_REASONS] = list(input_reasons)
        snap[DATA_INPUT_MISSING_ENTITY_IDS] = list(probe.missing_entity_ids)
        snap[DATA_INPUT_UNAVAILABLE_ENTITY_IDS] = list(probe.unavailable_entity_ids)

        sig = probe_signature(input_status, probe)
        log_payload = format_probe_log_dict(
            entry_id=self.entry.entry_id,
            input_status=input_status,
            reasons=input_reasons,
            probe=probe,
        )
        line = json.dumps(log_payload, ensure_ascii=False)
        if not self._first_input_probe_logged:
            self._first_input_probe_logged = True
            lvl = logging.WARNING if input_status != INPUT_STATUS_OK else logging.INFO
            _LOGGER.log(lvl, "Hub Énergie input probe (first refresh): %s", line)
        elif sig != self._last_input_probe_signature:
            _LOGGER.info("Hub Énergie input probe (status changed): %s", line)
        self._last_input_probe_signature = sig

        return cast(EnergyData, snap)

    async def async_manual_tariff_refresh(self) -> bool:
        return await self._async_refresh_tariffs(update_entry=True)

    async def _async_refresh_tariffs(self, *, update_entry: bool) -> bool:
        outcome: TariffRefreshOutcome = await refresh_tariffs(
            self.hass,
            self.entry,
            update_entry=update_entry,
            is_edf=self.is_edf,
            tariff_offer=self.tariff_offer,
            logger=_LOGGER,
        )
        if outcome.rejected_incomplete_payload:
            self._tariff_refresh_rejected_incomplete = True
        elif outcome.complete_payload_accepted:
            self._tariff_refresh_rejected_incomplete = False
        return outcome.ok
