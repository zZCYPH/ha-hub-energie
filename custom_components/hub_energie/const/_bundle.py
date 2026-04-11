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
