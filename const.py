"""Constants for Hub Énergie integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "hub_energie"
LOGIC_VERSION: Final = "1"

# ---------------------------------------------------------------------------
# Device identifiers (one device per scope)
# ---------------------------------------------------------------------------
DEVICE_OFFER: Final = "offer"
DEVICE_GRID_CONFIG: Final = "grid_config"
DEVICE_SOLAR_CONFIG: Final = "solar_config"
DEVICE_ENERGY_BALANCE: Final = "energy_balance"
DEVICE_COST: Final = "cost"
DEVICE_DIAGNOSTICS: Final = "diagnostics"
DEVICE_BATTERY_SUMMARY: Final = "battery_summary"

# ---------------------------------------------------------------------------
# Supplier constants
# ---------------------------------------------------------------------------
SUPPLIER_EDF: Final = "edf"
SUPPLIER_OTHER: Final = "other"
SUPPLIER_OPTIONS: Final[list[str]] = [SUPPLIER_EDF, SUPPLIER_OTHER]

# ---------------------------------------------------------------------------
# Phase type
# ---------------------------------------------------------------------------
PHASE_MONO: Final = "mono"
PHASE_TRI: Final = "tri"
PHASE_OPTIONS: Final[list[str]] = [PHASE_MONO, PHASE_TRI]

# ---------------------------------------------------------------------------
# Tariff mode
# ---------------------------------------------------------------------------
TARIFF_MODE_AUTO: Final = "auto"
TARIFF_MODE_MANUAL: Final = "manual"

# ---------------------------------------------------------------------------
# Pricing structure (manual mode)
# ---------------------------------------------------------------------------
PRICING_FLAT: Final = "flat"
PRICING_TIME_OF_USE: Final = "time_of_use"
PRICING_SCHEDULE: Final = "schedule"
PRICING_OPTIONS: Final[list[str]] = [PRICING_FLAT, PRICING_TIME_OF_USE, PRICING_SCHEDULE]

# ---------------------------------------------------------------------------
# Price basis
# ---------------------------------------------------------------------------
PRICE_BASIS_TTC: Final = "TTC"
PRICE_BASIS_HT: Final = "HT"
PRICE_BASIS_OPTIONS: Final[list[str]] = [PRICE_BASIS_TTC, PRICE_BASIS_HT]

# ---------------------------------------------------------------------------
# Day types for schedule
# ---------------------------------------------------------------------------
DAY_TYPE_ALL: Final = "all"
DAY_TYPE_WEEKDAYS: Final = "weekdays"
DAY_TYPE_WEEKENDS: Final = "weekends"
DAY_TYPE_OPTIONS: Final[list[str]] = [DAY_TYPE_ALL, DAY_TYPE_WEEKDAYS, DAY_TYPE_WEEKENDS]

# ---------------------------------------------------------------------------
# Config flow keys – Offer scope
# ---------------------------------------------------------------------------
CONF_SUPPLIER: Final = "supplier"
CONF_SUPPLIER_CUSTOM_NAME: Final = "supplier_custom_name"
CONF_TARIFF_MODE: Final = "tariff_mode"
CONF_CONTRACT_POWER: Final = "contract_power"
CONF_CONTRACT_NAME: Final = "contract_name"
CONF_PHASE_TYPE: Final = "phase_type"
CONF_PRICING_STRUCTURE: Final = "pricing_structure"
CONF_PRICE_BASIS: Final = "price_basis"
CONF_CURRENCY: Final = "currency"

# Flat tariff
CONF_ENERGY_PRICE: Final = "energy_price"
CONF_SUBSCRIPTION_PRICE: Final = "subscription_price"

# Time-of-use tariff
CONF_TOU_PERIODS: Final = "tou_periods"

# Advanced schedule
CONF_SCHEDULE_SLOTS: Final = "schedule_slots"

# EDF auto-fetch
CONF_TARIFF_OFFER: Final = "tariff_offer"
CONF_TARIFF_FETCHED_AT: Final = "tariff_fetched_at"
CONF_TARIFF_SOURCE: Final = "tariff_source"

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
    SOLAR_SHADING_NONE, SOLAR_SHADING_LIGHT,
    SOLAR_SHADING_MEDIUM, SOLAR_SHADING_HEAVY,
]

SOLAR_PERF_HIGH: Final = "high"
SOLAR_PERF_STANDARD: Final = "standard"
SOLAR_PERF_LOW: Final = "low"
SOLAR_PERF_OPTIONS: Final[list[str]] = [
    SOLAR_PERF_HIGH, SOLAR_PERF_STANDARD, SOLAR_PERF_LOW,
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

BATT_SIGN_POSITIVE_DISCHARGE: Final = "positive_discharge"
BATT_SIGN_POSITIVE_CHARGE: Final = "positive_charge"

# ---------------------------------------------------------------------------
# Config flow keys – Tempo / RTE (EDF only)
# ---------------------------------------------------------------------------
CONF_TEMPO_MODE: Final = "tempo_mode"
TEMPO_MODE_RTE: Final = "rte"
TEMPO_MODE_SENSOR: Final = "sensor"
TEMPO_MODE_API: Final = "api_couleur"
CONF_RTE_CLIENT_ID: Final = "rte_client_id"
CONF_RTE_CLIENT_SECRET: Final = "rte_client_secret"
CONF_CURRENT_SLOT_SENSOR: Final = "current_slot_sensor"

# ---------------------------------------------------------------------------
# Reinjection / power heuristics
# ---------------------------------------------------------------------------
REINJECTION_EXPORT_IGNORE_BELOW_W: Final = 10.0
REINJECTION_BATT_CHARGE_SIGNIFICANT_W: Final = 0.0
REINJECTION_SHORT_EXPORT_MAX_S: Final = 45.0
REINJECTION_SHORT_EXPORT_MAX_W: Final = 600.0
REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W: Final = 100.0
REINJECTION_EXPORT_MIN_ABS_W: Final = 120.0
REINJECTION_EXPORT_VS_SOLAR_FRACTION: Final = 0.2
REINJECTION_BATT_FULL_MIN_SOC_FRAC: Final = 0.93

OPT_REINJECTION_EXPORT_IGNORE_BELOW_W: Final = "reinjection_export_ignore_below_w"
OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W: Final = "reinjection_batt_charge_significant_w"
OPT_REINJECTION_SHORT_EXPORT_MAX_S: Final = "reinjection_short_export_max_s"
OPT_REINJECTION_SHORT_EXPORT_MAX_W: Final = "reinjection_short_export_max_w"
OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W: Final = "reinjection_min_solar_for_classify_w"
OPT_REINJECTION_EXPORT_MIN_ABS_W: Final = "reinjection_export_min_abs_w"
OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION: Final = "reinjection_export_vs_solar_fraction"
OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC: Final = "reinjection_batt_full_min_soc_frac"

REINJECTION_OPTION_KEYS: Final[tuple[str, ...]] = (
    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    OPT_REINJECTION_EXPORT_MIN_ABS_W,
    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
)

# ---------------------------------------------------------------------------
# EDF-specific tariff / slot constants (kept for EDF supplier path)
# ---------------------------------------------------------------------------
TARIFF_OFFER_TEMPO: Final = "tempo"
TARIFF_OFFER_HPHC: Final = "hphc"
TARIFF_OFFER_BASE: Final = "base"
TARIFF_OFFER_OPTIONS: Final[list[str]] = [
    TARIFF_OFFER_TEMPO,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_BASE,
]

SLOTS: Final[tuple[str, ...]] = (
    "bleu_hc", "bleu_hp",
    "blanc_hc", "blanc_hp",
    "rouge_hc", "rouge_hp",
)

OPT_BLEU_HC: Final = "bleu_hc"
OPT_BLEU_HP: Final = "bleu_hp"
OPT_BLANC_HC: Final = "blanc_hc"
OPT_BLANC_HP: Final = "blanc_hp"
OPT_ROUGE_HC: Final = "rouge_hc"
OPT_ROUGE_HP: Final = "rouge_hp"
OPT_ABONNEMENT: Final = "abonnement_mensuel_eur"
# EDF tabular API column PART_FIXE_TTC (€ TTC per year), not per month.
OPT_FIXED_TTC: Final = "fixed_ttc"
OPT_TARIFF_AUTO_REFRESH: Final = "tariff_auto_refresh"
OPT_TARIFF_REFRESH_HOURS: Final = "tariff_refresh_hours"
OPT_TARIFF_FETCHED_AT: Final = "tariff_fetched_at"

DEFAULT_RATES: Final[dict[str, float]] = {
    OPT_BLEU_HC: 0.1296,
    OPT_BLEU_HP: 0.1609,
    OPT_BLANC_HC: 0.1486,
    OPT_BLANC_HP: 0.1893,
    OPT_ROUGE_HC: 0.1568,
    OPT_ROUGE_HP: 0.7562,
}

DEFAULT_ABONNEMENT: Final[float] = 0.0
DEFAULT_TARIFF_AUTO_REFRESH: Final[bool] = False
DEFAULT_TARIFF_REFRESH_HOURS: Final[int] = 24
TARIFF_REFRESH_HOURS_OPTIONS: Final[list[int]] = [6, 12, 24, 48, 72, 168]

TEMPO_SEASON_DAY_QUOTAS: Final[dict[str, int]] = {
    "blue": 300, "white": 43, "red": 22,
}

CONTRACT_POWER_OPTIONS: Final[list[str]] = [
    "3", "6", "9", "12", "15", "18", "24", "30", "36",
]

# ---------------------------------------------------------------------------
# EDF API endpoints
# ---------------------------------------------------------------------------
TABULAR_API_BASE: Final = "https://tabular-api.data.gouv.fr/api/resources"
TARIFF_RESOURCE_TEMPO: Final = "0c3d1d36-c412-4620-8566-e5cbb4fa2b5a"
TARIFF_RESOURCE_HPHC: Final = "f7303b3a-93c7-4242-813d-84919034c416"
TARIFF_RESOURCE_BASE: Final = "c13d05e5-9e55-4d03-bf7e-042a2ade7e49"

FR_TZ: Final = "Europe/Paris"
API_DOMAIN: Final = "digital.iservices.rte-france.com"
API_TOKEN_URL: Final = f"https://{API_DOMAIN}/token/oauth"
API_CALENDAR_URL: Final = (
    f"https://{API_DOMAIN}/open_api/tempo_like_supply_contract/v1/tempo_like_calendars"
)
API_DATE_QUERY_FORMAT: Final = "%Y-%m-%dT%H:%M:%S%z"
HOUR_OF_CHANGE: Final = 6
OFF_PEAK_START: Final = 22
USER_AGENT: Final = "homeassistant-hub_energie/1.0"
API_COULEUR_TEMPO_BASE_URL: Final = "https://www.api-couleur-tempo.fr"

# ---------------------------------------------------------------------------
# Energy rounding / delta policy (shared across integration)
# ---------------------------------------------------------------------------
ENERGY_ROUND_DECIMALS: Final = 6
NEGATIVE_DELTA_NOISE_KWH: Final = 0.01
MAX_DELTA_KWH_DEFAULT: Final = 200.0

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

# ---------------------------------------------------------------------------
# Reinjection diagnostics
# ---------------------------------------------------------------------------
DIAG_CAUSE_SOLAR_SURPLUS: Final = "solar_surplus"
DIAG_CAUSE_BATTERY_FULL_OR_ABSENT: Final = "battery_full_or_absent"
DIAG_CAUSE_SWITCH_LATENCY: Final = "switch_latency"
DIAG_CAUSE_UNATTRIBUTED: Final = "unattributed"
