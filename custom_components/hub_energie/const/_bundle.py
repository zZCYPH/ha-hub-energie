# Remaining integration constants (split across PRs into domain modules).

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Phase type
# ---------------------------------------------------------------------------
PHASE_MONO: Final = "mono"
PHASE_TRI: Final = "tri"
PHASE_OPTIONS: Final[list[str]] = [PHASE_MONO, PHASE_TRI]

# Three-phase grid: one total sensor (JSON) vs per-phase wizard
CONF_GRID_TRI_SENSOR_LAYOUT: Final = "grid_tri_sensor_layout"
TRI_GRID_SENSOR_TOTAL: Final = "total"
TRI_GRID_SENSOR_PER_PHASE: Final = "per_phase"
TRI_GRID_SENSOR_OPTIONS: Final[list[str]] = [TRI_GRID_SENSOR_TOTAL, TRI_GRID_SENSOR_PER_PHASE]
# Ephemeral config-flow keys (merged into *_phases lists, not stored as-is)
CONF_TRI_PHASE_STEP_IMPORT_ENERGY: Final = "tri_phase_step_import_energy"
CONF_TRI_PHASE_STEP_EXPORT_ENERGY: Final = "tri_phase_step_export_energy"
CONF_TRI_PHASE_STEP_GRID_POWER: Final = "tri_phase_step_grid_power"

# Three-phase primary import/export: one meter for all phases vs three (summed in runtime)
CONF_GRID_TRI_ENERGY_MODE: Final = "grid_tri_energy_mode"
TRI_GRID_ENERGY_SINGLE: Final = "single"
TRI_GRID_ENERGY_PER_PHASE: Final = "per_phase"
TRI_GRID_ENERGY_OPTIONS: Final[list[str]] = [TRI_GRID_ENERGY_SINGLE, TRI_GRID_ENERGY_PER_PHASE]
# Stable pseudo-entity ids for delta bookkeeping when summing phase meters
SYNTHETIC_ENTITY_GRID_IMPORT_SUM: Final = "hub_energie.__tri_grid_import_sum__"
SYNTHETIC_ENTITY_GRID_EXPORT_SUM: Final = "hub_energie.__tri_grid_export_sum__"
# Ephemeral form keys → grid_*_energy_phases (grid_tri_per_phase step)
CONF_TRI_IMPORT_ENERGY_P1: Final = "tri_import_energy_p1"
CONF_TRI_IMPORT_ENERGY_P2: Final = "tri_import_energy_p2"
CONF_TRI_IMPORT_ENERGY_P3: Final = "tri_import_energy_p3"
CONF_TRI_EXPORT_ENERGY_P1: Final = "tri_export_energy_p1"
CONF_TRI_EXPORT_ENERGY_P2: Final = "tri_export_energy_p2"
CONF_TRI_EXPORT_ENERGY_P3: Final = "tri_export_energy_p3"
CONF_TRI_GRID_POWER_P1: Final = "tri_grid_power_p1"
CONF_TRI_GRID_POWER_P2: Final = "tri_grid_power_p2"
CONF_TRI_GRID_POWER_P3: Final = "tri_grid_power_p3"

# ---------------------------------------------------------------------------
# Config flow keys – Grid scope
# ---------------------------------------------------------------------------
CONF_GRID_IMPORT_ENERGY: Final = "grid_import_energy"
CONF_GRID_EXPORT_ENERGY: Final = "grid_export_energy"
CONF_GRID_IMPORT_ENERGY_PHASES: Final = "grid_import_energy_phases"
CONF_GRID_EXPORT_ENERGY_PHASES: Final = "grid_export_energy_phases"
CONF_GRID_POWER_SENSOR: Final = "grid_power_sensor"
CONF_GRID_POWER_SIGN_MODE: Final = "grid_power_sign_mode"
CONF_GRID_POWER_PHASES: Final = "grid_power_phases"
CONF_LOAD_POWER_SENSOR: Final = "load_power_sensor"

# Keys written together when saving three-phase grid detail (options flow persist)
GRID_TRI_DETAIL_KEYS: Final[tuple[str, ...]] = (
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_GRID_TRI_SENSOR_LAYOUT,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_LOAD_POWER_SENSOR,
)

GRID_POWER_SIGN_EXPORT_NEGATIVE: Final = "export_negative"
GRID_POWER_SIGN_EXPORT_POSITIVE: Final = "export_positive"
GRID_POWER_SIGN_OPTIONS: Final[list[str]] = [
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    GRID_POWER_SIGN_EXPORT_POSITIVE,
]

# ---------------------------------------------------------------------------
# Config flow keys – Solar scope
# ---------------------------------------------------------------------------
CONF_HAS_SOLAR: Final = "has_solar"
CONF_SOLAR_ENERGY: Final = "solar_energy"
CONF_SOLAR_ENERGY_SENSORS: Final = "solar_energy_sensors"
CONF_SOLAR_POWER_SENSOR: Final = "solar_power_sensor"
CONF_SOLAR_RESALE_CONTRACT: Final = "solar_resale_contract"
CONF_SOLAR_EXPORT_TARIFF: Final = "solar_export_tariff"

# Solar PV estimation
CONF_SOLAR_ESTIMATION_ENABLED: Final = "solar_estimation_enabled"
CONF_SOLAR_LOCATION_LAT: Final = "solar_lat"
CONF_SOLAR_LOCATION_LON: Final = "solar_lon"
CONF_SOLAR_PEAK_POWER: Final = "solar_peak_power"
CONF_SOLAR_ORIENTATION: Final = "solar_orientation"
CONF_SOLAR_TILT: Final = "solar_tilt"
CONF_SOLAR_TILT_MODE: Final = "solar_tilt_mode"
CONF_SOLAR_SHADING: Final = "solar_shading"
CONF_SOLAR_PERFORMANCE: Final = "solar_performance"
CONF_SOLAR_ADVANCED: Final = "solar_advanced"
CONF_SOLAR_ARRAYS: Final = "solar_arrays"
CONF_SOLAR_COMMISSIONING_YEAR: Final = "solar_commissioning_year"
CONF_SOLAR_DEGRADATION_RATE: Final = "solar_degradation_rate"
CONF_SOLAR_PERFORMANCE_RATIO: Final = "solar_performance_ratio"

SOLAR_TILT_AUTO: Final = "auto"
SOLAR_TILT_MANUAL: Final = "manual"

SOLAR_SHADING_NONE: Final = "none"
SOLAR_SHADING_LIGHT: Final = "light"
SOLAR_SHADING_MEDIUM: Final = "medium"
SOLAR_SHADING_HEAVY: Final = "heavy"
SOLAR_SHADING_OPTIONS: Final[list[str]] = [
    SOLAR_SHADING_NONE,
    SOLAR_SHADING_LIGHT,
    SOLAR_SHADING_MEDIUM,
    SOLAR_SHADING_HEAVY,
]

SOLAR_PERF_HIGH: Final = "high"
SOLAR_PERF_STANDARD: Final = "standard"
SOLAR_PERF_LOW: Final = "low"
SOLAR_PERF_OPTIONS: Final[list[str]] = [
    SOLAR_PERF_HIGH,
    SOLAR_PERF_STANDARD,
    SOLAR_PERF_LOW,
]

# ---------------------------------------------------------------------------
# Config flow keys – Battery scope
# ---------------------------------------------------------------------------
CONF_HAS_BATTERIES: Final = "has_batteries"
CONF_BATTERY_SYSTEMS: Final = "battery_systems"
CONF_BATT_NAME: Final = "batt_name"
CONF_BATT_ENERGY_IN: Final = "batt_energy_in"
CONF_BATT_ENERGY_OUT: Final = "batt_energy_out"
CONF_BATT_POWER_IN: Final = "batt_power_in"
CONF_BATT_POWER_OUT: Final = "batt_power_out"
CONF_BATT_POWER_NET: Final = "batt_power_net"
CONF_BATT_POWER_NET_SIGN: Final = "batt_power_net_sign"
CONF_BATT_SOC: Final = "batt_soc"
CONF_BATT_CAPACITY_KWH: Final = "batt_capacity_kwh"
CONF_BATT_CAPACITY_KWH_ENTITY: Final = "batt_capacity_kwh_entity"
CONF_BATT_MAX_CHARGE_W: Final = "batt_max_charge_w"
CONF_BATT_MAX_CHARGE_W_ENTITY: Final = "batt_max_charge_w_entity"
CONF_BATT_MAX_DISCHARGE_W: Final = "batt_max_discharge_w"
CONF_BATT_MAX_DISCHARGE_W_ENTITY: Final = "batt_max_discharge_w_entity"
CONF_BATT_ENERGY_AVAILABLE: Final = "batt_energy_available"
CONF_BATT_ENERGY_AVAILABLE_INCL_SOC_MIN: Final = "batt_energy_available_incl_soc_min"
CONF_BATT_SOC_MIN: Final = "batt_soc_min"
CONF_BATT_SOC_MIN_ENTITY: Final = "batt_soc_min_entity"
CONF_BATT_SOC_MAX: Final = "batt_soc_max"
CONF_BATT_SOC_MAX_ENTITY: Final = "batt_soc_max_entity"
CONF_BATT_ADVANCED: Final = "batt_advanced"
# Options flow ``battery_pick`` — remove selected entry (not persisted as a config key).
CONF_BATT_REMOVE_SELECTED: Final = "batt_remove_selected"

BATT_SIGN_POSITIVE_DISCHARGE: Final = "positive_discharge"
BATT_SIGN_POSITIVE_CHARGE: Final = "positive_charge"

DATA_DATA_QUALITY: Final = "data_quality"
# Entity readability vs SSOT (distinct from data_quality attribution heuristics).
DATA_INPUT_STATUS: Final = "input_status"
DATA_INPUT_STATUS_REASONS: Final = "input_status_reasons"
DATA_INPUT_MISSING_ENTITY_IDS: Final = "input_missing_entity_ids"
DATA_INPUT_UNAVAILABLE_ENTITY_IDS: Final = "input_unavailable_entity_ids"

INPUT_STATUS_OK: Final = "ok"
INPUT_STATUS_DEGRADED: Final = "degraded"
INPUT_STATUS_NO_INPUT: Final = "no_input"
INPUT_STATUS_ERROR: Final = "error"

INPUT_REASON_MISSING_ENTITIES: Final = "missing_entities"
INPUT_REASON_UNAVAILABLE_ENTITIES: Final = "unavailable_entities"
INPUT_REASON_NO_GRID_IMPORT_READABLE: Final = "no_grid_import_readable"
INPUT_REASON_TRUST_INCONSISTENT: Final = "trust_inconsistent"
INPUT_REASON_TRUST_DEGRADED: Final = "trust_degraded"
INPUT_REASON_DATA_QUALITY_DEGRADED: Final = "data_quality_degraded"

DATA_DELTA_TELEMETRY: Final = "delta_telemetry"
DATA_DELTA_DISCARDS: Final = "delta_discards"
DATA_DELTA_LAST_REJECTION: Final = "delta_last_rejection"
DATA_GRID_UNKNOWN_BUCKET_KWH_TODAY: Final = "grid_unknown_bucket_kwh_today"
DATA_SECONDS_SINCE_LAST_APPLIED_DELTA: Final = "seconds_since_last_applied_delta"

# Trust / health sensor (heuristic thresholds; not physical guarantees).
TRUST_DRIFT_INCONSISTENT_KWH: Final = 1.0
TRUST_STALENESS_DEGRADED_SECONDS: Final = 6 * 3600
DATA_TRUST_LEVEL: Final = "trust_level"
DATA_TRUST_CAUSE_CODE: Final = "trust_cause_code"
DATA_TRUST_CAUSE: Final = "trust_cause"

# ---------------------------------------------------------------------------
# Energy rounding / delta policy (shared across integration)
# ---------------------------------------------------------------------------
ENERGY_ROUND_DECIMALS: Final = 6
NEGATIVE_DELTA_NOISE_KWH: Final = 0.01
# Negative deltas with magnitude below this rebaseline last_raw without counting energy (meter jitter).
NEGATIVE_DELTA_REBASE_BAND_KWH: Final = 0.1
MAX_DELTA_KWH_DEFAULT: Final = 200.0
# Built-in caps for one delta tick (grid import/export share the grid cap in DeltaPolicy).
DEFAULT_MAX_DELTA_KWH_GRID: Final = 300.0
DEFAULT_MAX_DELTA_KWH_SOLAR: Final = 120.0
DEFAULT_MAX_DELTA_KWH_BATTERY: Final = 80.0
# Config entry options: override delta caps (Configure → Advanced: energy delta caps).
OPT_MAX_DELTA_KWH_GRID: Final = "max_delta_kwh_grid"
OPT_MAX_DELTA_KWH_SOLAR: Final = "max_delta_kwh_solar"
OPT_MAX_DELTA_KWH_BATTERY: Final = "max_delta_kwh_battery"
OPT_MAX_DELTA_KWH_OTHER: Final = "max_delta_kwh_other"
# Sanity bounds when reading options or showing the options form.
DELTA_CAP_KWH_MIN: Final = 0.01
DELTA_CAP_KWH_MAX: Final = 500_000.0

# ---------------------------------------------------------------------------
# Energy sources (accumulator keys)
# ---------------------------------------------------------------------------
SOURCE_GRID: Final = "grid"
SOURCE_GRID_EXPORT: Final = "grid_export"
SOURCE_SOLAR: Final = "solar"
SOURCE_BATT_DISCHARGE: Final = "batt_discharge"
SOURCE_BATT_CHARGE: Final = "batt_charge"

# ---------------------------------------------------------------------------
# Snapshot attribute keys
# ---------------------------------------------------------------------------
ATTR_DIRECT_MAISON: Final = "direct_maison_kwh"
ATTR_VIA_BATTERIE: Final = "via_batterie_kwh"

# Snapshot / coordinator.data keys
DATA_DAY: Final = "day"
DATA_LOGIC_VERSION: Final = "logic_version"
DATA_CURRENT_SLOT: Final = "current_slot"
DATA_TODAY_COLOR: Final = "today_color"
DATA_TOMORROW_COLOR: Final = "tomorrow_color"
DATA_TEMPO_DAYS: Final = "tempo_days"
DATA_TEMPO_NEXT_COLOUR_CHANGE_AT: Final = "tempo_next_colour_change_at"
DATA_TEMPO_NEXT_HC_START_AT: Final = "tempo_next_hc_start_at"
DATA_RTE_CALENDAR_FETCHED_AT: Final = "rte_calendar_fetched_at"
DATA_COST_TOTAL: Final = "cost_total"
DATA_COST_BY_SLOT: Final = "cost_by_slot"
DATA_ABONNEMENT_EUR: Final = "abonnement_eur"
DATA_OFFER: Final = "offer"
DATA_SUPPLIER: Final = "supplier"
DATA_CONTRACT_POWER: Final = "contract_power"
DATA_PRICING_STRUCTURE: Final = "pricing_structure"
DATA_TARIFF_FETCHED_AT: Final = "tariff_fetched_at"
DATA_GRID_POWER_SIGNED_W: Final = "grid_power_signed_w"
DATA_SOLAR_POWER_W: Final = "solar_power_w"
DATA_SOLAR_ESTIMATE_POWER_W: Final = "solar_estimate_power_w"
DATA_BATT_DISCHARGE_POWER_W: Final = "batt_discharge_power_w"
DATA_BATT_CHARGE_POWER_W: Final = "batt_charge_power_w"
DATA_LOAD_POWER_W: Final = "load_power_w"
DATA_LOAD_POWER_INFERRED: Final = "load_power_inferred"
DATA_POWER_GRAPH_ENTITY_MAP: Final = "power_graph_entity_map"
DATA_EXPORT_POWER_W: Final = "export_power_w"
DATA_REINJECTION_CAUSE: Final = "reinjection_cause"
DATA_REINJECTION_CONFIDENCE: Final = "reinjection_confidence"
DATA_EXPORT_DUE_TO_SOLAR_SURPLUS_KWH: Final = "export_due_to_solar_surplus_kwh"
DATA_EXPORT_DUE_TO_BATTERY_FULL_OR_ABSENT_KWH: Final = "export_due_to_battery_full_or_absent_kwh"
DATA_EXPORT_DUE_TO_SWITCH_LATENCY_KWH: Final = "export_due_to_switch_latency_kwh"
DATA_EXPORT_UNATTRIBUTED_KWH: Final = "export_unattributed_kwh"
DATA_EXPORT_OPPORTUNITY_COST_TOTAL_EUR: Final = "export_opportunity_cost_total_eur"
DATA_EXPORT_OPPORTUNITY_COST_SOLAR_SURPLUS_EUR: Final = "export_opportunity_cost_solar_surplus_eur"
DATA_EXPORT_OPPORTUNITY_COST_BATTERY_FULL_OR_ABSENT_EUR: Final = (
    "export_opportunity_cost_battery_full_or_absent_eur"
)
DATA_EXPORT_OPPORTUNITY_COST_SWITCH_LATENCY_EUR: Final = "export_opportunity_cost_switch_latency_eur"
DATA_EXPORT_OPPORTUNITY_COST_UNATTRIBUTED_EUR: Final = "export_opportunity_cost_unattributed_eur"
DATA_USAGE_GRID_DIRECT: Final = "usage_grid_direct"
DATA_USAGE_GRID_BATT_CHARGE: Final = "usage_grid_batt_charge"
DATA_USAGE_SOLAR_DIRECT: Final = "usage_solar_direct"
DATA_USAGE_SOLAR_BATT_CHARGE: Final = "usage_solar_batt_charge"
DATA_USAGE_BATT_HOME: Final = "usage_batt_home"
DATA_USAGE_BATT_CHARGE_METHOD: Final = "usage_batt_charge_method"
DATA_BATT_CHARGE_METER_KWH: Final = "batt_charge_meter_kwh"
DATA_USAGE_GRID_BATT_CHARGE_BY_SLOT_KWH: Final = "usage_grid_batt_charge_by_slot_kwh"
DATA_USAGE_SOLAR_BATT_CHARGE_BY_SLOT_KWH: Final = "usage_solar_batt_charge_by_slot_kwh"
DATA_ORIGIN_GRID: Final = "origin_grid"
DATA_ORIGIN_SOLAR: Final = "origin_solar"
DATA_ORIGIN_GRID_ATTRS: Final = "origin_grid_attrs"
DATA_ORIGIN_SOLAR_ATTRS: Final = "origin_solar_attrs"
DATA_ECO_SOLAR: Final = "eco_solar"
DATA_ECO_BATT: Final = "eco_batt"
DATA_BATTERY_CARD: Final = "battery_card"
DATA_BATTERY_TOTAL_CHARGE_KWH: Final = "battery_total_charge_kwh"
DATA_BATTERY_TOTAL_DISCHARGE_KWH: Final = "battery_total_discharge_kwh"
DATA_BATTERY_TOTAL_NET_POWER_W: Final = "battery_total_net_power_w"
DATA_SOLAR_ESTIMATE_DAILY_KWH: Final = "solar_estimate_daily_kwh"
DATA_SOLAR_ESTIMATE_YEARLY_KWH: Final = "solar_estimate_yearly_kwh"
DATA_SOLAR_EXPORT_REVENUE_EUR: Final = "solar_export_revenue_eur"
DATA_ENERGY_GRID_TOTAL_KWH: Final = "energy_grid_total_kwh"
DATA_ENERGY_SOLAR_TOTAL_KWH: Final = "energy_solar_total_kwh"
DATA_ENERGY_EXPORT_TOTAL_KWH: Final = "energy_export_total_kwh"
DATA_ENERGY_BATT_CHARGE_TOTAL_KWH: Final = "energy_batt_charge_total_kwh"
DATA_ENERGY_BATT_DISCHARGE_TOTAL_KWH: Final = "energy_batt_discharge_total_kwh"
DATA_ENERGY_HOME_TODAY_KWH: Final = "energy_home_today_kwh"
DATA_ENERGY_GRID_TODAY_KWH: Final = "energy_grid_today_kwh"
DATA_ENERGY_SOLAR_TODAY_KWH: Final = "energy_solar_today_kwh"
DATA_ENERGY_EXPORT_TODAY_KWH: Final = "energy_export_today_kwh"
DATA_ENERGY_BATT_CHARGE_TODAY_KWH: Final = "energy_batt_charge_today_kwh"
DATA_ENERGY_BATT_DISCHARGE_TODAY_KWH: Final = "energy_batt_discharge_today_kwh"
DATA_HOME_POWER_W: Final = "home_power_w"
DATA_GRID_IMPORT_POWER_W: Final = "grid_import_power_w"
DATA_SOLAR_PRODUCTION_POWER_W: Final = "solar_production_power_w"
DATA_BATTERY_DISCHARGE_POWER_W: Final = "battery_discharge_power_w"
DATA_SOLAR_TO_HOME_POWER_W: Final = "solar_to_home_power_w"
DATA_BATTERY_TO_HOME_POWER_W: Final = "battery_to_home_power_w"
DATA_GRID_TO_HOME_POWER_W: Final = "grid_to_home_power_w"
DATA_SOLAR_TO_BATTERY_POWER_W: Final = "solar_to_battery_power_w"
DATA_GRID_TO_BATTERY_POWER_W: Final = "grid_to_battery_power_w"
DATA_SOLAR_EXPORT_POWER_W: Final = "solar_export_power_w"
DATA_BATTERY_CHARGE_KWH: Final = "charge_kwh"
DATA_BATTERY_DISCHARGE_KWH: Final = "discharge_kwh"
DATA_BATTERY_POWER_NET: Final = "power_net"
DATA_BATTERY_SOC: Final = "soc"
DATA_BATTERY_STORED_ENERGY_KWH: Final = "stored_energy_kwh"
DATA_BATTERY_AVAILABLE_ENERGY_KWH: Final = "available_energy_kwh"
DATA_BATTERY_EFFICIENCY: Final = "efficiency"

# ---------------------------------------------------------------------------
# Per-slot snapshot maps (exposed on cost_detail for frontend consumption)
# ---------------------------------------------------------------------------
DATA_GRID_BY_SLOT_KWH: Final = "grid_by_slot_kwh"
DATA_MAISON_BY_SLOT_KWH: Final = "maison_by_slot_kwh"
