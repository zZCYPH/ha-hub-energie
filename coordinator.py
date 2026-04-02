"""Coordinator: energy tracking, costs, multi-battery, solar estimation."""

from __future__ import annotations

import asyncio
import logging
import math
import re
from collections.abc import Mapping
from datetime import datetime, timedelta
from typing import Any, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    Event,
    EventStateChangedData,
    HomeAssistant,
    State,
    callback,
)
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .battery.battery_metrics import (
    compute_battery_card_metrics as compute_battery_card_metrics_domain,
)
from .battery.battery_metrics import (
    compute_battery_metrics as compute_battery_metrics_domain,
)
from .battery.battery_split import (
    usage_batt_charge_by_slot_from_heuristic as usage_batt_charge_by_slot_from_heuristic_domain,
)
from .battery.battery_runtime import (
    aggregate_battery_soc_fill_ratio as aggregate_battery_soc_fill_ratio_domain,
)
from .battery.battery_runtime import (
    any_battery_at_max as any_battery_at_max_domain,
)
from .battery.battery_runtime import (
    read_aggregate_battery_power as read_aggregate_battery_power_domain,
)
from .const import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_AVAILABLE,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_BATT_NAME,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATTERY_SYSTEMS,
    CONF_CONTRACT_POWER,
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
    CONF_RTE_CLIENT_ID,
    CONF_RTE_CLIENT_SECRET,
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_EXPORT_TARIFF,
    CONF_SOLAR_LOCATION_LAT,
    CONF_SOLAR_LOCATION_LON,
    CONF_SOLAR_ORIENTATION,
    CONF_SOLAR_PEAK_POWER,
    CONF_SOLAR_PERFORMANCE,
    CONF_SOLAR_POWER_SENSOR,
    CONF_SOLAR_RESALE_CONTRACT,
    CONF_SOLAR_SHADING,
    CONF_SOLAR_TILT,
    CONF_SOLAR_TILT_MODE,
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
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    GRID_POWER_SIGN_EXPORT_POSITIVE,
    LOGIC_VERSION,
    OPT_ABONNEMENT,
    OPT_FIXED_TTC,
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
    OPT_REINJECTION_EXPORT_MIN_ABS_W,
    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_TARIFF_AUTO_REFRESH,
    OPT_TARIFF_FETCHED_AT,
    OPT_TARIFF_REFRESH_HOURS,
    REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    REINJECTION_EXPORT_IGNORE_BELOW_W,
    REINJECTION_EXPORT_MIN_ABS_W,
    REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    REINJECTION_SHORT_EXPORT_MAX_S,
    REINJECTION_SHORT_EXPORT_MAX_W,
    SLOTS,
    SOLAR_TILT_AUTO,
    SOURCE_BATT_CHARGE,
    SOURCE_BATT_DISCHARGE,
    SOURCE_GRID,
    SOURCE_SOLAR,
    SUPPLIER_EDF,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
    TEMPO_SEASON_DAY_QUOTAS,
)
from .energy.costs import compute_costs as compute_costs_domain
from .energy.costs import compute_savings as compute_savings_domain
from .energy.costs import CostComputation
from .energy.energy_aggregation import compute_energy as compute_energy_domain
from .energy.energy_aggregation import slot_values as slot_values_domain
from .energy.energy_aggregation import EnergyAggregation
from .energy.origin import OriginAndUsage
from .energy.origin import compute_origin_and_usage as compute_origin_and_usage_domain
from .diagnostics.reinjection_state import ReinjectionState
from .ha.reader import HAReader
from .runtime.persistence import PersistenceManager
from .runtime.state import RuntimeState
from .power.power_flow import PowerFlowModel
from .power.power_flow import compute_power_flow as compute_power_flow_domain
from .power.reinjection import ReinjectionThresholds
from .power.reinjection import classify_reinjection_cause as classify_reinjection_cause_domain
from .power.reinjection_diagnostics import (
    update_reinjection_diagnostics as update_reinjection_diagnostics_domain,
)
from .snapshot.snapshot_builder import build_snapshot as build_snapshot_domain
from .snapshot.pipeline import SnapshotPipeline
from .snapshot.pipeline import SnapshotPipelineDeps
from .snapshot.pipeline import SnapshotPipelineInputs
from .solar.solar_estimation import compute_solar_estimation
from .scheduler import Scheduler
from .storage.store_manager import StoreManager
from .tariff_manager import TariffResolver
from .time.paris_time import PARIS_TZ, ParisTime
from .tempo.tempo_logic import TempoSnapshot
from .tempo.tempo_logic import compute_tempo_day_counters as compute_tempo_day_counters_domain
from .providers.edf import (
    async_fetch_offer_tariffs,
    async_get_calendar_rows,
    async_get_tempo_stats_with_raw,
    async_get_today_tomorrow_colors,
    build_current_slot,
    current_colour_from_calendar,
    current_slot_from_calendar,
    is_off_peak,
    next_hc_window_start_paris,
    next_tempo_colour_change_at,
    next_tempo_day_boundary_paris,
    parse_slot_from_sensor_state,
    tempo_supply_day_start_paris,
    tomorrow_colour_from_calendar,
)

_LOGGER = logging.getLogger(__name__)

SAVE_DEBOUNCE_S = 2
SOURCE_GRID_EXPORT = "grid_export"
STORE_MODEL_VERSION = 1
ENERGY_ROUND_DECIMALS = 6
FLOW_MISMATCH_WARN_THRESHOLD_W = 30.0
FLOW_MISMATCH_WARN_INTERVAL_S = 300.0
MAX_DELTA_KWH_DEFAULT = 200.0
SNAPSHOT_DEBUG_OPT_KEY = "debug_snapshot"
MAX_POWER_INTEGRATION_SECONDS = 3600.0
REINJECTION_CONFIDENCE_BASE = 0.4
REINJECTION_CONFIDENCE_GRID = 0.25
REINJECTION_CONFIDENCE_SOLAR = 0.2
REINJECTION_CONFIDENCE_BATTERY = 0.2
REINJECTION_CONFIDENCE_LOAD = 0.05
NEGATIVE_DELTA_NOISE_KWH = 0.01

_DIAG_CAUSES: tuple[str, ...] = (
    DIAG_CAUSE_SOLAR_SURPLUS,
    DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
    DIAG_CAUSE_SWITCH_LATENCY,
    DIAG_CAUSE_UNATTRIBUTED,
)

_POLL_SLOTS_PARIS: tuple[tuple[int, int], ...] = tuple(
    sorted(
        {(h, 0) for h in range(0, 24, 2)}
        | {(5, 30), (6, 30), (10, 30), (11, 0), (11, 30), (21, 50), (22, 30)},
        key=lambda t: (t[0], t[1]),
    )
)


# ═══════════════════════════════════════════════════════════════════════════════
# Module-level helpers
# ═══════════════════════════════════════════════════════════════════════════════


def _next_poll_fire_paris(after: datetime) -> datetime:
    """Next scheduled coordinator refresh strictly after *after* (Paris TZ)."""
    tz = PARIS_TZ
    after = after.astimezone(tz) if after.tzinfo else after.replace(tzinfo=tz)
    day = after.date()
    for _ in range(3):
        for hour, minute in _POLL_SLOTS_PARIS:
            candidate = datetime(day.year, day.month, day.day, hour, minute, 0, tzinfo=tz)
            if candidate > after:
                return candidate
        day += timedelta(days=1)
    return after + timedelta(hours=2)


def _ceil_minutes(dt: datetime, step_min: int) -> datetime:
    """Ceil dt to the next N-minute boundary (strictly after dt if not aligned)."""
    if step_min <= 0:
        return dt
    base = dt.replace(second=0, microsecond=0)
    minute = base.minute
    rem = minute % step_min
    add = step_min - rem if rem != 0 else 0
    out = base + timedelta(minutes=add)
    return out if out > dt else out + timedelta(minutes=step_min)


def _norm_kwh(value: float) -> float:
    return round(float(value), ENERGY_ROUND_DECIMALS)


def _safe_float(value: Any) -> float | None:
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(out):
        return None
    return out


def _source_stat_suffix(source_key: str) -> str:
    return re.sub(r"[^a-z0-9_]+", "_", source_key.lower().replace(":", "_"))


def _statistic_id(source_key: str, slot: str) -> str:
    return f"{DOMAIN}:slot_{_source_stat_suffix(source_key)}_{slot}_kwh"


def _paris_now() -> datetime:
    return ParisTime.now()


def _paris_day_start(dt: datetime) -> datetime:
    return ParisTime.day_start(dt)


def _paris_today_iso() -> str:
    return ParisTime.today()


def _paris_yesterday() -> str:
    return ParisTime.yesterday()


def _paris_day_start_utc(iso_day: str) -> datetime:
    return ParisTime.day_start_utc(iso_day)


def _empty_slots() -> dict[str, float]:
    return {s: 0.0 for s in SLOTS}


def _is_hc_slot(slot: str) -> bool:
    return slot.endswith("_hc")


def _is_hp_slot(slot: str) -> bool:
    return slot.endswith("_hp")


# ═══════════════════════════════════════════════════════════════════════════════
# Coordinator
# ═══════════════════════════════════════════════════════════════════════════════


class HubEnergieCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Central state coordinator for Hub Énergie."""

    # ── Initialisation ────────────────────────────────────────────────────

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
        self._reader = HAReader(hass, entry, normalize_kwh=_norm_kwh)

        self._calendar_rows: list[Any] = []
        self._calendar_fetched_at: datetime | None = None

        self._current_slot: str | None = None
        self._last_flow_warn_ts: datetime | None = None

        self._attr_today_color = "unknown"
        self._attr_tomorrow_color = "unknown"
        self._tempo_days_api: dict[str, dict[str, int]] | None = None
        self._api_stats_raw: dict[str, Any] | None = None

        self._reinjection_state = ReinjectionState(
            slots=SLOTS,
            diag_causes=_DIAG_CAUSES,
            default_cause=DIAG_CAUSE_UNATTRIBUTED,
        )
        self._runtime_state = RuntimeState(
            slots=SLOTS,
            reinjection_state=self._reinjection_state,
        )
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
            normalize_kwh=_norm_kwh,
            safe_float=_safe_float,
            statistic_id=_statistic_id,
        )
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

        self._energy_attrib_date: str | None = None
        self._tariff: TariffResolver | None = None
        self._snapshot_pipeline = SnapshotPipeline(
            SLOTS,
            SnapshotPipelineDeps(
                compute_energy_aggregation=self._compute_energy_aggregation,
                compute_costs=self._compute_costs,
                compute_origin_and_usage=self._compute_origin_and_usage,
                power_source_map=self.power_source_map,
                read_grid_power_total_w=self._read_grid_power_total_w,
                read_power_w=self._read_power_w,
                read_aggregate_battery_power=self._read_aggregate_battery_power,
                compute_power_flow_model=self._compute_power_flow_model,
                aggregate_battery_soc_fill_ratio=self._aggregate_battery_soc_fill_ratio,
                any_battery_at_max=self._any_battery_at_max,
                reinjection_option_float=self._reinjection_option_float,
                classify_reinjection_cause=self._classify_reinjection_cause,
                update_reinjection_diagnostics=lambda day, now_paris, rates, flow, cause: self._update_reinjection_diagnostics(
                    day=day,
                    now_paris=now_paris,
                    rates=rates,
                    flow=flow,
                    cause=cause,
                ),
                compute_savings=lambda solar_by_slot, battery_charge_by_slot, battery_discharge_by_slot, rates_by_slot: compute_savings_domain(
                    solar_by_slot=solar_by_slot,
                    battery_charge_by_slot=battery_charge_by_slot,
                    battery_discharge_by_slot=battery_discharge_by_slot,
                    rates_by_slot=rates_by_slot,
                    slots=SLOTS,
                    is_hc_slot=_is_hc_slot,
                ),
                battery_power_split_available=self._battery_power_split_available,
                get_batt_charge_power_split_day=lambda day: self._runtime_state.batt_charge_power_split_kwh.get(
                    day, {}
                ),
                get_batt_charge_power_split_slot_day=lambda day: self._runtime_state.batt_charge_power_split_slot_kwh.get(
                    day, {}
                ),
                usage_batt_charge_by_slot_from_heuristic=self._usage_batt_charge_by_slot_from_heuristic,
                compute_tempo_snapshot=self._compute_tempo_snapshot,
                compute_battery_metrics=self._compute_battery_metrics,
                build_battery_card_metrics=self._build_battery_card_metrics,
                compute_solar_estimate=self._compute_solar_estimate,
                source_total=self._source_total,
                slot_vals=self._slot_vals,
                norm_kwh=_norm_kwh,
                build_snapshot=build_snapshot_domain,
            ),
        )

    # ── Properties ────────────────────────────────────────────────────────

    @property
    def supplier(self) -> str:
        return cast(str, self.entry.data.get(CONF_SUPPLIER, SUPPLIER_EDF))

    @property
    def is_edf(self) -> bool:
        return self.supplier == SUPPLIER_EDF

    @property
    def tariff_offer(self) -> str:
        return cast(str, self.entry.options.get(
            CONF_TARIFF_OFFER, self.entry.data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO),
        ))

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

    # ── Source / power maps ───────────────────────────────────────────────

    def source_map(self) -> dict[str, str | None]:
        """Logical source key -> entity_id for all monitored energy sensors."""
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
                if self.has_solar else None
            ),
            "load_power": cast(str | None, opts.get(CONF_LOAD_POWER_SENSOR, data.get(CONF_LOAD_POWER_SENSOR))),
        }

    def _expected_source_keys(self) -> set[str]:
        return {k for k, v in self.source_map().items() if v}

    def _max_delta_kwh_for_source(self, source_key: str) -> float:
        if source_key.startswith("batt_"):
            return 80.0
        if source_key == SOURCE_SOLAR:
            return 120.0
        if source_key in (SOURCE_GRID, SOURCE_GRID_EXPORT):
            return 300.0
        return MAX_DELTA_KWH_DEFAULT

    def _is_plausible_reset(self, source_key: str, last_raw: float, new_raw: float) -> bool:
        """Heuristic reset detection for decreasing total_increasing counters."""
        drop = max(0.0, last_raw - new_raw)
        if drop <= NEGATIVE_DELTA_NOISE_KWH:
            return False
        # Treat large downward jumps as reset/device replacement, even if not near zero.
        if new_raw <= 0.1:
            return True
        if new_raw <= last_raw * 0.5:
            return True
        # Conservative fallback by source-specific cap.
        return drop >= self._max_delta_kwh_for_source(source_key)

    def _source_total(self, prefix_or_key: str) -> float:
        return self._runtime_state.source_total(prefix_or_key, normalize_kwh=_norm_kwh)

    def _validate_store_payload(self, data: dict[str, Any]) -> bool:
        return self._persistence.validate_payload(data)

    def _migrate_legacy_store_payload(self, raw: dict[str, Any]) -> dict[str, Any] | None:
        return self._persistence.migrate_legacy_store_payload(raw)

    def _reset_runtime_state(self) -> None:
        self._runtime_state.reset()

    def _hydrate_from_store_payload(self, payload: dict[str, Any]) -> None:
        self._runtime_state.hydrate(
            payload,
            normalize_kwh=_norm_kwh,
            safe_float=_safe_float,
        )

    def grid_power_sign_mode(self) -> str:
        return cast(str, self.entry.options.get(
            CONF_GRID_POWER_SIGN_MODE,
            self.entry.data.get(CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE),
        ))

    # ── Entity reading helpers ────────────────────────────────────────────

    def _read_power_w(self, entity_id: str | None) -> float | None:
        return self._reader.read_power_w(entity_id)

    def _read_energy_kwh(self, entity_id: str | None) -> float | None:
        return self._reader.read_energy_kwh(entity_id)

    def _read_soc_percent(self, entity_id: str | None) -> float | None:
        return self._reader.read_soc_percent(entity_id)

    def _read_soc_normalized(self, entity_id: str) -> float | None:
        return self._reader.read_soc_normalized(entity_id)

    def _read_number(self, entity_id: str | None) -> float | None:
        return self._reader.read_number(entity_id)

    def _resolve_batt_param(
        self,
        batt: Mapping[str, Any],
        value_key: str,
        entity_key: str,
        *,
        kind: str = "number",
    ) -> float | None:
        ent = batt.get(entity_key)
        if isinstance(ent, str) and ent:
            if kind == "soc":
                return self._reader.read_soc_percent(ent)
            return self._reader.read_number(ent)
        raw = batt.get(value_key)
        if raw is None:
            return None
        try:
            return float(raw)
        except (TypeError, ValueError):
            return None

    def _read_grid_power_total_w(self) -> float | None:
        return self._reader.read_grid_power_total_w()

    # ── SOC helpers (aggregate for reinjection) ───────────────────────────

    def _aggregate_battery_soc_fill_ratio(self) -> float | None:
        return aggregate_battery_soc_fill_ratio_domain(
            has_batteries=self.has_batteries,
            battery_systems=self.battery_systems,
            resolve_batt_param=self._resolve_batt_param,
            read_soc_normalized=self._read_soc_normalized,
        )

    def _any_battery_at_max(self) -> bool | None:
        return any_battery_at_max_domain(
            has_batteries=self.has_batteries,
            battery_systems=self.battery_systems,
            resolve_batt_param=self._resolve_batt_param,
            read_soc_percent=self._read_soc_percent,
        )

    # ── Accumulator structure helpers ─────────────────────────────────────

    def _ensure_diag_day(self, day: str) -> dict[str, float]:
        return self._reinjection_state.ensure_day(day)

    def _ensure_diag_slot_day(self, day: str) -> dict[str, dict[str, float]]:
        return self._reinjection_state.ensure_slot_day(day)

    def _ensure_batt_charge_split_day(self, day: str) -> dict[str, float]:
        return self._runtime_state.ensure_batt_charge_split_day(day)

    def _ensure_batt_charge_split_slot_day(self, day: str) -> tuple[dict[str, float], dict[str, float]]:
        return self._runtime_state.ensure_batt_charge_split_slot_day(day)

    @staticmethod
    def _usage_batt_charge_by_slot_from_heuristic(
        bc: Mapping[str, float],
    ) -> tuple[dict[str, float], dict[str, float]]:
        return usage_batt_charge_by_slot_from_heuristic_domain(
            batt_charge_by_slot=bc,
            slots=SLOTS,
            is_hc_slot=_is_hc_slot,
            is_hp_slot=_is_hp_slot,
        )

    def _battery_power_split_available(self) -> bool:
        pm = self.power_source_map()
        if not pm.get("grid_power") or not pm.get("solar_power"):
            return False
        for batt in self.battery_systems:
            if batt.get(CONF_BATT_POWER_IN) and batt.get(CONF_BATT_POWER_OUT):
                return True
        return False

    # ── Reinjection classification ────────────────────────────────────────

    def _reinjection_option_float(self, key: str, default: float) -> float:
        raw = self.entry.options.get(key)
        if raw is None:
            return default
        try:
            return float(raw)
        except (TypeError, ValueError):
            return default

    def _classify_reinjection_cause(
        self,
        p_export: float,
        p_solar: float,
        p_batt_charge: float | None,
        has_battery: bool,
        now: datetime,
        soc_fill_ratio: float | None,
        min_soc_for_full_frac: float,
        soc_at_or_above_max: bool | None,
    ) -> tuple[str, float, dict[str, Any]]:
        thresholds = ReinjectionThresholds(
            export_ignore_below_w=self._reinjection_option_float(
                OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
                REINJECTION_EXPORT_IGNORE_BELOW_W,
            ),
            short_export_max_s=self._reinjection_option_float(
                OPT_REINJECTION_SHORT_EXPORT_MAX_S,
                REINJECTION_SHORT_EXPORT_MAX_S,
            ),
            short_export_max_w=self._reinjection_option_float(
                OPT_REINJECTION_SHORT_EXPORT_MAX_W,
                REINJECTION_SHORT_EXPORT_MAX_W,
            ),
            export_vs_solar_fraction=self._reinjection_option_float(
                OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
                REINJECTION_EXPORT_VS_SOLAR_FRACTION,
            ),
            export_min_abs_w=self._reinjection_option_float(
                OPT_REINJECTION_EXPORT_MIN_ABS_W,
                REINJECTION_EXPORT_MIN_ABS_W,
            ),
            min_solar_for_classify_w=self._reinjection_option_float(
                OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
                REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
            ),
            batt_charge_significant_w=self._reinjection_option_float(
                OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
                REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
            ),
            battery_full_min_soc_frac=min_soc_for_full_frac,
        )
        decision, active_since = classify_reinjection_cause_domain(
            p_export=p_export,
            p_solar=p_solar,
            p_batt_charge=p_batt_charge,
            has_battery=has_battery,
            now=now,
            export_active_since=self._reinjection_state.export_active_since,
            soc_fill_ratio=soc_fill_ratio,
            soc_at_or_above_max=soc_at_or_above_max,
            thresholds=thresholds,
            cause_unattributed=DIAG_CAUSE_UNATTRIBUTED,
            cause_battery_full_or_absent=DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
            cause_switch_latency=DIAG_CAUSE_SWITCH_LATENCY,
            cause_solar_surplus=DIAG_CAUSE_SOLAR_SURPLUS,
        )
        self._reinjection_state.export_active_since = active_since
        return decision.cause, decision.confidence, decision.inputs

    # ── Tariff helpers ────────────────────────────────────────────────────

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

    # ── async_setup ───────────────────────────────────────────────────────

    async def async_setup(self) -> None:
        """Load store, start listeners, schedule polls."""
        await self._persistence.load()

        self._tariff = self._build_tariff_resolver()

        self.entry.async_on_unload(
            self.hass.bus.async_listen("state_changed", self._async_on_state_changed)
        )

        self._scheduler.start()

    async def _async_rebuild_from_recorder(self) -> None:
        await self._persistence.rebuild_from_recorder()

    def _setup_tariff_refresh_schedule(self) -> None:
        self._scheduler.schedule_tariff_refresh()

    # ── Poll scheduling ───────────────────────────────────────────────────

    def _cancel_poll_schedule(self) -> None:
        self._scheduler.cancel_poll()

    @callback
    def _on_scheduled_poll(self, _now: datetime) -> None:
        self.hass.async_create_task(self._async_scheduled_poll())

    async def _async_scheduled_poll(self) -> None:
        await self.async_request_refresh()

    def _arm_next_poll(self) -> None:
        self._scheduler.schedule_poll()

    def _next_poll_fire_paris(self, after: datetime) -> datetime:
        """Dynamic poll schedule for Tempo API colour fetches (Paris TZ)."""
        tz = PARIS_TZ
        after = after.astimezone(tz) if after.tzinfo else after.replace(tzinfo=tz)

        # Only apply burst schedule for EDF Tempo using the remote API.
        if not (self.is_edf and self.tariff_offer == TARIFF_OFFER_TEMPO and self.tempo_mode == TEMPO_MODE_API):
            return _next_poll_fire_paris(after)

        day = after.date()
        t0530 = datetime(day.year, day.month, day.day, 5, 30, 0, tzinfo=tz)
        t1200 = datetime(day.year, day.month, day.day, 12, 0, 0, tzinfo=tz)
        if after < t0530:
            return t0530
        if after >= t1200:
            nd = day + timedelta(days=1)
            return datetime(nd.year, nd.month, nd.day, 5, 30, 0, tzinfo=tz)

        tomorrow_unknown = str(self._attr_tomorrow_color or "unknown") in ("unknown", "n/a", "")
        if tomorrow_unknown:
            # Every 10 minutes between 05:30 and 12:00 until tomorrow is known.
            return _ceil_minutes(after, 10)

        # Tomorrow is known: poll hourly (top of hour) until 12:00.
        next_hour = after.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        if next_hour < t1200:
            return next_hour
        nd = day + timedelta(days=1)
        return datetime(nd.year, nd.month, nd.day, 5, 30, 0, tzinfo=tz)

    # ── State change listener ─────────────────────────────────────────────

    @callback
    def _async_on_state_changed(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        sm = self.source_map()

        if (
            self.is_edf
            and self.tariff_offer == TARIFF_OFFER_TEMPO
            and self.tempo_mode == TEMPO_MODE_SENSOR
            and entity_id == self.entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        ):
            self._refresh_slot_sensor()
            self.hass.async_create_task(self._async_notify_all())

        power_ids: set[str] = {v for v in self.power_source_map().values() if v}
        for batt in self.battery_systems:
            for k in (CONF_BATT_POWER_IN, CONF_BATT_POWER_OUT, CONF_BATT_POWER_NET, CONF_BATT_SOC):
                v = batt.get(k)
                if v:
                    power_ids.add(v)
        if entity_id in power_ids:
            self.hass.async_create_task(self._async_notify_all())
            return

        if entity_id not in (v for v in sm.values() if v):
            return
        new = event.data.get("new_state")
        if new is None or new.state in ("unknown", "unavailable", ""):
            return
        new_val = self._state_to_kwh(new)
        if new_val is None:
            return
        source_key = next(k for k, v in sm.items() if v == entity_id)
        self.hass.async_create_task(self._async_apply_delta(entity_id, source_key, new_val))

    def _refresh_slot_sensor(self) -> None:
        eid = self.entry.data.get(CONF_CURRENT_SLOT_SENSOR)
        st = self.hass.states.get(eid) if eid else None
        self._current_slot = parse_slot_from_sensor_state(st.state if st else None)

    # ── Slot resolution ───────────────────────────────────────────────────

    def _slot_at_instant(self, now_paris: datetime) -> str | None:
        if not self.is_edf:
            return "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"

        offer = self.tariff_offer
        if offer == TARIFF_OFFER_BASE:
            return "bleu_hp"
        if offer == TARIFF_OFFER_HPHC:
            return "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
        if offer != TARIFF_OFFER_TEMPO:
            return "bleu_hp"

        mode = self.tempo_mode
        if mode == TEMPO_MODE_SENSOR:
            self._refresh_slot_sensor()
            return self._current_slot
        if mode == TEMPO_MODE_RTE:
            if self._calendar_rows:
                slot = current_slot_from_calendar(self._calendar_rows, now_paris)
                if slot and slot in SLOTS:
                    return slot
                colour = current_colour_from_calendar(self._calendar_rows, now_paris)
                return build_current_slot(colour, now_paris)
            col = self._attr_today_color if self._attr_today_color not in ("unknown", "n/a", "") else None
            return build_current_slot(col, now_paris)
        if mode == TEMPO_MODE_API:
            col = self._attr_today_color if self._attr_today_color not in ("unknown", "n/a", "") else None
            return build_current_slot(col, now_paris)
        return None

    # ── Delta application / accumulation ──────────────────────────────────

    def _state_to_kwh(self, state: State) -> float | None:
        return self._reader.state_to_kwh(state)

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

        slot = self._slot_at_instant(now_paris)
        if slot is None:
            await self.async_request_refresh()
            slot = self._slot_at_instant(now_paris)
        if slot is None or slot not in SLOTS:
            return

        self._current_slot = slot

        normalized_new = _norm_kwh(new_val)
        async with self._state_lock:
            result = self._runtime_state.apply_delta(
                day=day,
                slot=slot,
                source_key=source_key,
                entity_id=entity_id,
                normalized_new=normalized_new,
                normalize_kwh=_norm_kwh,
                max_delta_kwh_for_source=self._max_delta_kwh_for_source,
                is_plausible_reset=self._is_plausible_reset,
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

    # ── Persistence ───────────────────────────────────────────────────────

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

    # ── Main poll ─────────────────────────────────────────────────────────

    async def _async_update_data(self) -> dict[str, Any]:
        now_paris = _paris_now()
        self._tariff = self._build_tariff_resolver()

        if self.is_edf:
            await self._async_update_edf_state(now_paris)
        else:
            self._attr_today_color = "n/a"
            self._attr_tomorrow_color = "n/a"
            self._current_slot = "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
            self._tempo_days_api = None

        async with self._state_lock:
            snapshot = self._build_snapshot()
            self.data = snapshot
            if self._reinjection_state.dirty:
                self._reinjection_state.mark_clean()
                self._schedule_store_save_locked()
        self.async_update_listeners()
        return snapshot

    async def _async_update_edf_state(self, now_paris: datetime) -> None:
        offer = self.tariff_offer
        if offer == TARIFF_OFFER_TEMPO and self.tempo_mode == TEMPO_MODE_RTE:
            session = async_get_clientsession(self.hass)
            cid = self.entry.data[CONF_RTE_CLIENT_ID]
            secret = self.entry.data[CONF_RTE_CLIENT_SECRET]
            try:
                self._calendar_rows = await async_get_calendar_rows(session, cid, secret)
                self._calendar_fetched_at = dt_util.utcnow()
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("RTE calendar fetch failed: %s", err)
            colour = current_colour_from_calendar(self._calendar_rows, now_paris)
            self._attr_today_color = colour or "unknown"
            tcol = tomorrow_colour_from_calendar(self._calendar_rows, now_paris)
            self._attr_tomorrow_color = tcol or "unknown"
            self._current_slot = current_slot_from_calendar(self._calendar_rows, now_paris)
            if self._current_slot is None:
                self._current_slot = build_current_slot(colour, now_paris)
            self._tempo_days_api = None

        elif offer == TARIFF_OFFER_TEMPO and self.tempo_mode == TEMPO_MODE_API:
            session = async_get_clientsession(self.hass)
            try:
                today_color, tomorrow_color = await async_get_today_tomorrow_colors(session)
                self._tempo_days_api, self._api_stats_raw = await async_get_tempo_stats_with_raw(session)
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning("api-couleur-tempo fetch failed: %s", err)
                today_color, tomorrow_color = None, None
                self._tempo_days_api = None
                self._api_stats_raw = None
            self._attr_today_color = today_color or "unknown"
            self._attr_tomorrow_color = tomorrow_color or "unknown"
            self._current_slot = build_current_slot(today_color, now_paris)

        elif offer == TARIFF_OFFER_TEMPO:
            self._refresh_slot_sensor()
            self._tempo_days_api = None

        elif offer == TARIFF_OFFER_HPHC:
            self._attr_today_color = "n/a"
            self._attr_tomorrow_color = "n/a"
            self._current_slot = "bleu_hc" if is_off_peak(now_paris) else "bleu_hp"
            self._tempo_days_api = None

        elif offer == TARIFF_OFFER_BASE:
            self._attr_today_color = "n/a"
            self._attr_tomorrow_color = "n/a"
            self._current_slot = "bleu_hp"
            self._tempo_days_api = None

        else:
            self._attr_today_color = "unknown"
            self._attr_tomorrow_color = "unknown"
            self._current_slot = "bleu_hp"
            self._tempo_days_api = None

    # ── Battery metrics ───────────────────────────────────────────────────

    def _compute_battery_metrics(
        self, day_acc: Mapping[str, Any],
    ) -> tuple[list[dict[str, Any]], float, float, float, str]:
        result = compute_battery_metrics_domain(
            day_acc=dict(day_acc),
            battery_systems_cfg=self.battery_systems,
            slot_values=lambda d, source_key: self._slot_vals(d, source_key),
            read_power_w=self._read_power_w,
            read_energy_kwh=self._read_energy_kwh,
            read_soc_percent=self._read_soc_percent,
            resolve_batt_param=self._resolve_batt_param,
            net_sign_default=BATT_SIGN_POSITIVE_DISCHARGE,
            net_sign_positive_charge=BATT_SIGN_POSITIVE_CHARGE,
            conf_keys={
                "batt_name": CONF_BATT_NAME,
                "batt_power_in": CONF_BATT_POWER_IN,
                "batt_power_out": CONF_BATT_POWER_OUT,
                "batt_power_net": CONF_BATT_POWER_NET,
                "batt_power_net_sign": CONF_BATT_POWER_NET_SIGN,
                "batt_soc": CONF_BATT_SOC,
                "batt_capacity_kwh": CONF_BATT_CAPACITY_KWH,
                "batt_capacity_kwh_entity": CONF_BATT_CAPACITY_KWH_ENTITY,
                "batt_soc_min": CONF_BATT_SOC_MIN,
                "batt_soc_min_entity": CONF_BATT_SOC_MIN_ENTITY,
                "batt_soc_max": CONF_BATT_SOC_MAX,
                "batt_soc_max_entity": CONF_BATT_SOC_MAX_ENTITY,
                "batt_energy_available": CONF_BATT_ENERGY_AVAILABLE,
            },
            warn=lambda msg: _LOGGER.warning(msg),
        )
        return (
            result.battery_systems,
            result.total_charge_kwh,
            result.total_discharge_kwh,
            result.total_net_power_w,
            result.battery_data_quality,
        )

    def _build_battery_card_metrics(
        self, batt_systems: list[dict[str, Any]],
    ) -> dict[str, Any] | None:
        return compute_battery_card_metrics_domain(batt_systems)

    # ── Solar estimation ──────────────────────────────────────────────────

    def _compute_solar_estimate(self, now_paris: datetime) -> tuple[float | None, float | None, float | None]:
        if not self.solar_estimation_enabled:
            return None, None, None
        d = self.entry.data
        lat = d.get(CONF_SOLAR_LOCATION_LAT)
        lon = d.get(CONF_SOLAR_LOCATION_LON)
        peak = d.get(CONF_SOLAR_PEAK_POWER)
        tilt_mode = d.get(CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO)
        estimate = compute_solar_estimation(
            lat=float(lat) if lat is not None else None,
            lon=float(lon) if lon is not None else None,
            peak_kwp=float(peak) if peak else None,
            orientation_deg=float(d.get(CONF_SOLAR_ORIENTATION, 180)),
            tilt_deg=float(d.get(CONF_SOLAR_TILT, 30)),
            tilt_auto=(tilt_mode == SOLAR_TILT_AUTO),
            shading=str(d.get(CONF_SOLAR_SHADING, "none")),
            performance=str(d.get(CONF_SOLAR_PERFORMANCE, "standard")),
            now_paris=now_paris,
            paris_tz=PARIS_TZ,
        )
        return estimate.power_w, estimate.daily_kwh, estimate.yearly_kwh

    # ── Snapshot helpers ──────────────────────────────────────────────────

    def _slot_vals(self, day_acc: Mapping[str, Any], src: str) -> dict[str, float]:
        # Domain function is pure and reusable outside Home Assistant.
        return slot_values_domain(dict(day_acc), src, SLOTS)

    def _aggregate_battery_slot_vals(self, day_acc: Mapping[str, Any]) -> tuple[dict[str, float], dict[str, float]]:
        """Sum per-battery charge/discharge across all batteries."""
        bc = _empty_slots()
        bd = _empty_slots()
        for batt in self.battery_systems:
            bid = batt.get("id", "")
            bc_b = self._slot_vals(day_acc, f"batt_charge:{bid}")
            bd_b = self._slot_vals(day_acc, f"batt_discharge:{bid}")
            for s in SLOTS:
                bc[s] += bc_b[s]
                bd[s] += bd_b[s]
        return bc, bd

    def _read_aggregate_battery_power(self) -> tuple[float, float | None, bool]:
        return read_aggregate_battery_power_domain(
            battery_systems=self.battery_systems,
            read_power_w=self._read_power_w,
        )

    def _compute_energy_aggregation(self, day_acc: Mapping[str, Any]) -> EnergyAggregation:
        grid = self._slot_vals(day_acc, SOURCE_GRID)
        solar = self._slot_vals(day_acc, SOURCE_SOLAR) if self.has_solar else _empty_slots()
        batt_charge, batt_discharge = self._aggregate_battery_slot_vals(day_acc)
        return compute_energy_domain(
            grid=grid,
            solar=solar,
            battery_charge=batt_charge,
            battery_discharge=batt_discharge,
            slots=SLOTS,
        )

    def _compute_costs(
        self,
        grid: Mapping[str, float],
        rates: Mapping[str, float],
        abo_day: float,
    ) -> CostComputation:
        return compute_costs_domain(
            grid_by_slot=dict(grid),
            rates_by_slot=dict(rates),
            slots=SLOTS,
            abonnement_eur=abo_day,
        )

    def _compute_origin_and_usage(self, energy: EnergyAggregation) -> OriginAndUsage:
        return compute_origin_and_usage_domain(energy, SLOTS)

    def _compute_power_flow_model(
        self,
        *,
        p_grid_raw: float | None,
        p_solar: float,
        p_batt_dis: float,
        p_batt_charge: float | None,
        p_load_measured: float | None,
    ) -> PowerFlowModel:
        return compute_power_flow_domain(
            p_grid_raw=p_grid_raw,
            p_solar=p_solar,
            p_batt_dis=p_batt_dis,
            p_batt_charge=p_batt_charge,
            p_load_measured=p_load_measured,
            grid_export_positive=(self.grid_power_sign_mode() == GRID_POWER_SIGN_EXPORT_POSITIVE),
        )

    def _compute_tempo_snapshot(self, now_paris: datetime) -> TempoSnapshot:
        tempo_days: dict[str, dict[str, int]] | None = None
        tempo_next_colour: str | None = None
        tempo_next_hc: str | None = None
        tempo_is_off: bool | None = None

        if self.is_edf and self.tariff_offer == TARIFF_OFFER_TEMPO:
            tempo_is_off = is_off_peak(now_paris)
            if self.tempo_mode == TEMPO_MODE_RTE:
                tempo_days = compute_tempo_day_counters_domain(
                    rows=self._calendar_rows,
                    now_paris=now_paris,
                    season_quotas=TEMPO_SEASON_DAY_QUOTAS,
                    tempo_supply_day_start_paris=tempo_supply_day_start_paris,
                )
            elif self.tempo_mode == TEMPO_MODE_API:
                tempo_days = self._tempo_days_api
            tnc: datetime | None = None
            if self.tempo_mode == TEMPO_MODE_RTE and self._calendar_rows:
                tnc = next_tempo_colour_change_at(self._calendar_rows, now_paris)
            if tnc is None:
                tnc = next_tempo_day_boundary_paris(now_paris)
            tempo_next_colour = tnc.isoformat()
            tempo_next_hc = next_hc_window_start_paris(now_paris).isoformat()

        return TempoSnapshot(
            tempo_days=tempo_days,
            tempo_next_colour=tempo_next_colour,
            tempo_next_hc=tempo_next_hc,
            tempo_is_off=tempo_is_off,
        )

    def _update_reinjection_diagnostics(
        self,
        *,
        day: str,
        now_paris: datetime,
        rates: Mapping[str, float],
        flow: PowerFlowModel,
        cause: str,
    ) -> tuple[dict[str, float], dict[str, dict[str, float]], dict[str, float], float]:
        result = update_reinjection_diagnostics_domain(
            day=day,
            now_paris=now_paris,
            rates=dict(rates),
            flow=flow,
            cause=cause,
            slots=SLOTS,
            diag_causes=_DIAG_CAUSES,
            current_slot=self._current_slot,
            last_ts=self._reinjection_state.last_ts,
            last_cause=self._reinjection_state.last_cause,
            last_slot=self._reinjection_state.last_slot,
            export_ignore_below_w=self._reinjection_option_float(
                OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
                REINJECTION_EXPORT_IGNORE_BELOW_W,
            ),
            max_power_integration_seconds=MAX_POWER_INTEGRATION_SECONDS,
            battery_power_split_available=self._battery_power_split_available(),
            ensure_diag_day=self._reinjection_state.ensure_day,
            ensure_diag_slot_day=self._reinjection_state.ensure_slot_day,
            ensure_batt_charge_split_day=self._runtime_state.ensure_batt_charge_split_day,
            ensure_batt_charge_split_slot_day=self._runtime_state.ensure_batt_charge_split_slot_day,
        )
        self._reinjection_state.update(result)
        return (
            result.diag_day,
            result.diag_slot_day,
            result.opportunity_by_cause,
            result.opportunity_total,
        )

    # ── _build_snapshot ───────────────────────────────────────────────────

    def _build_snapshot(self) -> dict[str, Any]:
        """Build one coherent snapshot from the current in-memory state.

        This method is intentionally split into smaller helper calls so each part
        (energy, power flow, costs, diagnostics, tempo) can be tested independently.
        """
        day = _paris_today_iso()
        now_paris = _paris_now()
        day_acc: Mapping[str, Any] = self._runtime_state.snapshot_data(day)
        tariff = self._tariff or self._build_tariff_resolver()
        rates = tariff.all_slot_rates()
        abo_day = tariff.subscription_daily()
        debug_enabled = bool(self.entry.options.get(SNAPSHOT_DEBUG_OPT_KEY, False))
        result = self._snapshot_pipeline.run(
            SnapshotPipelineInputs(
                day=day,
                now_paris=now_paris,
                day_acc=day_acc,
                rates=rates,
                abonnement_day_eur=abo_day,
                current_slot=self._current_slot,
                today_color=self._attr_today_color,
                tomorrow_color=self._attr_tomorrow_color,
                is_edf=self.is_edf,
                tariff_offer=self.tariff_offer,
                contract_power=str(
                    self.entry.options.get(
                        CONF_CONTRACT_POWER,
                        self.entry.data.get(CONF_CONTRACT_POWER, ""),
                    )
                ),
                tariff_fetched_at=self.entry.options.get(OPT_TARIFF_FETCHED_AT),
                tempo_mode=self.tempo_mode,
                calendar_row_count=len(self._calendar_rows),
                calendar_fetched_at=self._calendar_fetched_at,
                logic_version=LOGIC_VERSION,
                supplier=self.supplier,
                pricing_structure=self.pricing_structure,
                phase_type=self.phase_type,
                has_batteries=self.has_batteries,
                solar_resale_configured=self.solar_resale_configured,
                solar_export_tariff=float(self.entry.data.get(CONF_SOLAR_EXPORT_TARIFF, 0.0)),
                debug_enabled=debug_enabled,
                flow_mismatch_warn_threshold_w=FLOW_MISMATCH_WARN_THRESHOLD_W,
                flow_mismatch_warn_interval_s=FLOW_MISMATCH_WARN_INTERVAL_S,
                last_flow_warn_ts=self._last_flow_warn_ts,
                reinjection_confidence_grid=REINJECTION_CONFIDENCE_GRID,
                reinjection_confidence_solar=REINJECTION_CONFIDENCE_SOLAR,
                reinjection_confidence_battery=REINJECTION_CONFIDENCE_BATTERY,
                reinjection_confidence_load=REINJECTION_CONFIDENCE_LOAD,
                min_soc_option_key=OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
                min_soc_option_default=REINJECTION_BATT_FULL_MIN_SOC_FRAC,
                source_grid=SOURCE_GRID,
                source_solar=SOURCE_SOLAR,
                source_grid_export=SOURCE_GRID_EXPORT,
                source_batt_charge_prefix="batt_charge:",
                source_batt_discharge_prefix="batt_discharge:",
                diag_cause_solar_surplus=DIAG_CAUSE_SOLAR_SURPLUS,
                diag_cause_battery_full_or_absent=DIAG_CAUSE_BATTERY_FULL_OR_ABSENT,
                diag_cause_switch_latency=DIAG_CAUSE_SWITCH_LATENCY,
                diag_cause_unattributed=DIAG_CAUSE_UNATTRIBUTED,
            )
        )
        self._last_flow_warn_ts = result.next_last_flow_warn_ts
        if result.should_warn_flow_mismatch:
            _LOGGER.warning(
                "Flow model mismatch (raw_home=%.1f modeled_home=%.1f gap=%.1f)",
                result.raw_home_power_w,
                result.modeled_home_power_w,
                result.flow_gap_w,
            )

        if debug_enabled:
            _LOGGER.debug(
                "Snapshot debug day=%s slot=%s cost=%.3f export_w=%.1f flow_gap=%.3f",
                day,
                self._current_slot,
                result.snapshot["cost_total"],
                result.snapshot["export_power_w"],
                result.snapshot["debug_flow_gap_w"],
            )
        return result.snapshot

    # ── Tariff refresh (EDF auto mode) ────────────────────────────────────

    async def async_manual_tariff_refresh(self) -> bool:
        """Service entry-point: fetch and apply tariff options now."""
        return await self._async_refresh_tariffs(update_entry=True)

    async def _async_refresh_tariffs(self, *, update_entry: bool) -> bool:
        if not self.is_edf:
            _LOGGER.debug("Tariff refresh skipped: not EDF supplier")
            return False
        offer = self.tariff_offer
        power = str(self.entry.options.get(
            CONF_CONTRACT_POWER, self.entry.data.get(CONF_CONTRACT_POWER, ""),
        )).strip()
        if not power:
            _LOGGER.warning("Tariff refresh skipped: missing contract power")
            return False

        session = async_get_clientsession(self.hass)
        try:
            tariffs = await async_fetch_offer_tariffs(session, offer, power)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Tariff refresh failed (offer=%s, power=%s): %s", offer, power, err)
            return False

        new_options = dict(self.entry.options)
        new_options.update({
            CONF_TARIFF_OFFER: offer,
            CONF_CONTRACT_POWER: power,
            OPT_BLEU_HC: float(tariffs.get("hc_bleu_ttc", 0)),
            OPT_BLEU_HP: float(tariffs.get("hp_bleu_ttc", 0)),
            OPT_BLANC_HC: float(tariffs.get("hc_blanc_ttc", 0)),
            OPT_BLANC_HP: float(tariffs.get("hp_blanc_ttc", 0)),
            OPT_ROUGE_HC: float(tariffs.get("hc_rouge_ttc", 0)),
            OPT_ROUGE_HP: float(tariffs.get("hp_rouge_ttc", 0)),
            OPT_FIXED_TTC: float(tariffs.get("fixed_ttc", 0)),
            OPT_ABONNEMENT: 0.0,
            OPT_TARIFF_FETCHED_AT: tariffs.get("fetched_at"),
        })
        if update_entry:
            self.hass.config_entries.async_update_entry(self.entry, options=new_options)
            await self.hass.config_entries.async_reload(self.entry.entry_id)
        return True
