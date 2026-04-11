"""Tariff modes, EDF/Tempo slots, manual pricing, and external API endpoints."""

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Supplier constants
# ---------------------------------------------------------------------------
SUPPLIER_EDF: Final = "edf"
SUPPLIER_OTHER: Final = "other"
SUPPLIER_OPTIONS: Final[list[str]] = [SUPPLIER_EDF, SUPPLIER_OTHER]

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

# Config-flow UI: bottom-of-form navigation (initial setup wizard only)
CONF_FLOW_NAV: Final = "flow_nav"
FLOW_NAV_CONTINUE: Final = "continue"
FLOW_NAV_BACK: Final = "back"

# Time-of-use tariff
CONF_TOU_PERIODS: Final = "tou_periods"
# Fixed rows in ``manual_tou`` (HP/HC — two slots).
TOU_FORM_MAX_SLOTS: Final = 2
TOU_FORM_SECTION_PREFIX: Final = "tou_slot_"

# Advanced schedule
CONF_SCHEDULE_SLOTS: Final = "schedule_slots"
# Fixed rows in the config-flow form (add/remove is not supported by the HA schema).
SCHEDULE_FORM_MAX_SLOTS: Final = 6
# ``section()`` keys in ``manual_schedule_form`` (visual grouping in the UI).
SCHEDULE_FORM_SECTION_PREFIX: Final = "sched_slot_"

# EDF auto-fetch
CONF_TARIFF_OFFER: Final = "tariff_offer"
CONF_TARIFF_FETCHED_AT: Final = "tariff_fetched_at"
CONF_TARIFF_SOURCE: Final = "tariff_source"

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
    "bleu_hc",
    "bleu_hp",
    "blanc_hc",
    "blanc_hp",
    "rouge_hc",
    "rouge_hp",
)

# Attribution bucket when no tariff slot can be resolved (energy still accumulated).
SLOT_UNKNOWN: Final = "unknown"
ATTRIBUTION_SLOTS: Final[tuple[str, ...]] = (*SLOTS, SLOT_UNKNOWN)

# How the slot used for a delta was chosen (observability / data_quality).
SLOT_RESOLUTION_DIRECT: Final = "direct"
SLOT_RESOLUTION_FALLBACK_LAST_KNOWN: Final = "fallback_last_known"
SLOT_RESOLUTION_FALLBACK_SCHEDULE: Final = "fallback_schedule"
SLOT_RESOLUTION_UNKNOWN: Final = "unknown"

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
    "blue": 300,
    "white": 43,
    "red": 22,
}

CONTRACT_POWER_OPTIONS: Final[list[str]] = [
    "3",
    "6",
    "9",
    "12",
    "15",
    "18",
    "24",
    "30",
    "36",
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
