"""Coordinator public data shapes and persistence tuning constants."""

from __future__ import annotations

from typing import Any, Final, TypedDict

SAVE_DEBOUNCE_S: Final = 2.0
STORE_MODEL_VERSION: Final = 1


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


__all__ = (
    "BatteryCardData",
    "BatterySnapshotData",
    "EnergyData",
    "SAVE_DEBOUNCE_S",
    "STORE_MODEL_VERSION",
)
