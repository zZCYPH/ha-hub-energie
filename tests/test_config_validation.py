"""Unit tests for Hub Energie config validation."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path


HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

config_validation = importlib.import_module("hub_energie.config_validation")
const = importlib.import_module("hub_energie.const")

HubEnergieConfigValidator = config_validation.HubEnergieConfigValidator
BATTERY_ID = "id"


def test_rte_credentials_validate_against_merged_state() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "rte_credentials",
        {const.CONF_RTE_CLIENT_SECRET: "existing-secret"},
        {const.CONF_RTE_CLIENT_ID: "new-client"},
    )

    assert errors == {}
    assert patch == {const.CONF_RTE_CLIENT_ID: "new-client"}


def test_manual_tou_invalid_price_on_form() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {
            "tou_r0_start": "08:00",
            "tou_r0_end": "20:00",
            "tou_r0_price": "not-a-number",
            "tou_r1_start": "20:00",
            "tou_r1_end": "08:00",
            "tou_r1_price": 0.1,
            const.CONF_SUBSCRIPTION_PRICE: 5,
        },
    )

    assert patch[const.CONF_SUBSCRIPTION_PRICE] == 5.0
    assert errors.get("tou_r0_price") == config_validation.ERR_INVALID_PRICE


def test_battery_advanced_rejects_manual_and_entity_pair() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_advanced",
        {},
        {
            const.CONF_BATT_CAPACITY_KWH: 10,
            const.CONF_BATT_CAPACITY_KWH_ENTITY: "sensor.battery_capacity",
        },
    )

    assert patch[const.CONF_BATT_MAX_CHARGE_W] is None
    assert patch[const.CONF_BATT_MAX_CHARGE_W_ENTITY] is None
    assert errors == {
        const.CONF_BATT_CAPACITY_KWH: config_validation.ERR_BATTERY_ADV_CAPACITY_NOT_BOTH,
        const.CONF_BATT_CAPACITY_KWH_ENTITY: config_validation.ERR_BATTERY_ADV_CAPACITY_NOT_BOTH,
    }


def test_battery_advanced_entity_only_and_manual_only_can_mix() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_advanced",
        {},
        {
            const.CONF_BATT_CAPACITY_KWH_ENTITY: "sensor.battery_capacity",
            const.CONF_BATT_MAX_CHARGE_W: 2500,
        },
    )

    assert errors == {}
    assert patch[const.CONF_BATT_CAPACITY_KWH] is None
    assert patch[const.CONF_BATT_CAPACITY_KWH_ENTITY] == "sensor.battery_capacity"
    assert patch[const.CONF_BATT_MAX_CHARGE_W] == 2500.0
    assert patch[const.CONF_BATT_MAX_CHARGE_W_ENTITY] is None


def test_battery_advanced_manual_zero_allowed_for_power_fields() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_advanced",
        {},
        {const.CONF_BATT_MAX_CHARGE_W: 0},
    )
    assert errors == {}
    assert patch[const.CONF_BATT_MAX_CHARGE_W] == 0.0
    assert patch[const.CONF_BATT_MAX_CHARGE_W_ENTITY] is None


def test_battery_advanced_accepts_comma_as_decimal_separator() -> None:
    """French-style manual entry (2,76 kWh) must not yield invalid_price."""
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_advanced",
        {},
        {
            const.CONF_BATT_CAPACITY_KWH: "2,76",
            const.CONF_BATT_SOC_MIN: "10,5",
            const.CONF_BATT_SOC_MAX: "100",
        },
    )
    assert errors == {}
    assert patch[const.CONF_BATT_CAPACITY_KWH] == 2.76
    assert patch[const.CONF_BATT_SOC_MIN] == 10.5
    assert patch[const.CONF_BATT_SOC_MAX] == 100.0


def test_solar_toggle_false_returns_clear_patch() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "solar_toggle",
        {const.CONF_SOLAR_ENERGY: "sensor.solar_energy"},
        {const.CONF_HAS_SOLAR: False},
    )

    assert errors == {}
    assert patch[const.CONF_HAS_SOLAR] is False
    assert patch[const.CONF_SOLAR_ENERGY] is None
    assert patch[const.CONF_SOLAR_ESTIMATION_ENABLED] is None


def test_validate_full_requires_battery_systems_when_feature_enabled() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import_energy",
            const.CONF_HAS_BATTERIES: True,
            const.CONF_BATTERY_SYSTEMS: [],
        }
    )

    assert errors[const.CONF_BATTERY_SYSTEMS] == config_validation.ERR_REQUIRED
    assert errors[const.CONF_SUPPLIER] == config_validation.ERR_REQUIRED


def test_validate_full_requires_estimation_fields_when_enabled() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import_energy",
            const.CONF_HAS_SOLAR: True,
            const.CONF_SOLAR_ENERGY: "sensor.solar_energy",
            const.CONF_SOLAR_RESALE_CONTRACT: False,
            const.CONF_SOLAR_ESTIMATION_ENABLED: True,
        }
    )

    assert const.CONF_SOLAR_LOCATION_LAT in errors
    assert const.CONF_SOLAR_LOCATION_LON in errors
    assert const.CONF_SOLAR_PEAK_POWER in errors


def test_validate_full_requires_global_fields() -> None:
    errors = HubEnergieConfigValidator.validate_full({})

    assert errors[const.CONF_SUPPLIER] == config_validation.ERR_REQUIRED
    assert errors[const.CONF_PHASE_TYPE] == config_validation.ERR_REQUIRED
    assert errors[const.CONF_TARIFF_MODE] == config_validation.ERR_REQUIRED
    assert errors[const.CONF_CONTRACT_POWER] == config_validation.ERR_REQUIRED
    assert errors[const.CONF_GRID_IMPORT_ENERGY] == config_validation.ERR_NO_ENERGY_SENSOR


def test_validate_full_checks_battery_mutual_exclusion() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            const.CONF_CONTRACT_POWER: "9",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import_energy",
            const.CONF_HAS_BATTERIES: True,
            const.CONF_BATTERY_SYSTEMS: [
                {
                    BATTERY_ID: "abc123",
                    const.CONF_BATT_NAME: "Main battery",
                    const.CONF_BATT_ENERGY_IN: "sensor.batt_in",
                    const.CONF_BATT_ENERGY_OUT: "sensor.batt_out",
                    const.CONF_BATT_CAPACITY_KWH: 10.0,
                    const.CONF_BATT_CAPACITY_KWH_ENTITY: "sensor.batt_capacity",
                }
            ],
        }
    )

    assert (
        errors[f"{const.CONF_BATTERY_SYSTEMS}_0_{const.CONF_BATT_CAPACITY_KWH}"]
        == config_validation.ERR_BATTERY_ADV_CAPACITY_NOT_BOTH
    )


def test_battery_add_normalizes_optional_fields_to_none() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_add",
        {BATTERY_ID: "abc123"},
        {
            const.CONF_BATT_NAME: "  Main battery  ",
            const.CONF_BATT_ENERGY_IN: "sensor.battery_charge_energy",
            const.CONF_BATT_ENERGY_OUT: "sensor.battery_discharge_energy",
            const.CONF_BATT_POWER_NET: "",
        },
    )

    assert errors == {}
    assert patch[const.CONF_BATT_NAME] == "Main battery"
    assert patch[const.CONF_BATT_POWER_NET] is None
    assert patch[const.CONF_BATT_POWER_NET_SIGN] is None


def test_battery_add_advanced_off_clears_advanced_fields() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_add",
        {BATTERY_ID: "abc123"},
        {
            const.CONF_BATT_NAME: "Main",
            const.CONF_BATT_ENERGY_IN: "sensor.battery_charge_energy",
            const.CONF_BATT_ENERGY_OUT: "sensor.battery_discharge_energy",
            const.CONF_BATT_ADVANCED: False,
            const.CONF_BATT_CAPACITY_KWH: 10.0,
        },
    )

    assert errors == {}
    assert patch[const.CONF_BATT_ADVANCED] is False
    assert patch[const.CONF_BATT_CAPACITY_KWH] is None
    assert patch[const.CONF_BATT_CAPACITY_KWH_ENTITY] is None


def test_battery_add_advanced_on_defers_xor_to_next_step() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_add",
        {BATTERY_ID: "abc123"},
        {
            const.CONF_BATT_NAME: "Main",
            const.CONF_BATT_ENERGY_IN: "sensor.battery_charge_energy",
            const.CONF_BATT_ENERGY_OUT: "sensor.battery_discharge_energy",
            const.CONF_BATT_ADVANCED: True,
            const.CONF_BATT_CAPACITY_KWH_ENTITY: "sensor.batt_capacity",
        },
    )

    assert errors == {}
    assert patch[const.CONF_BATT_ADVANCED] is True
    assert const.CONF_BATT_CAPACITY_KWH not in patch
    assert const.CONF_BATT_CAPACITY_KWH_ENTITY not in patch


def test_battery_advanced_validates_xor() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "battery_advanced",
        {BATTERY_ID: "abc123"},
        {const.CONF_BATT_CAPACITY_KWH_ENTITY: "sensor.batt_capacity"},
    )

    assert errors == {}
    assert patch[const.CONF_BATT_CAPACITY_KWH] is None
    assert patch[const.CONF_BATT_CAPACITY_KWH_ENTITY] == "sensor.batt_capacity"


def test_rte_credentials_errors_when_merged_missing_client_id() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "rte_credentials",
        {const.CONF_RTE_CLIENT_SECRET: "only-secret"},
        {},
    )
    assert errors == {"base": config_validation.ERR_RTE_CREDS_REQUIRED}
    assert patch == {}


def test_rte_credentials_errors_when_merged_missing_secret() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "rte_credentials",
        {const.CONF_RTE_CLIENT_ID: "only-id"},
        {},
    )
    assert errors == {"base": config_validation.ERR_RTE_CREDS_REQUIRED}
    assert patch == {}


def test_rte_credentials_ok_when_both_in_merged() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "rte_credentials",
        {
            const.CONF_RTE_CLIENT_ID: "my-id",
            const.CONF_RTE_CLIENT_SECRET: "my-secret",
        },
        {},
    )
    assert errors == {}
    assert patch == {}


def test_manual_flat_invalid_energy_price_out_of_range() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_flat",
        {},
        {const.CONF_ENERGY_PRICE: 10.0},
    )
    assert errors[const.CONF_ENERGY_PRICE] == config_validation.ERR_INVALID_PRICE
    assert const.CONF_ENERGY_PRICE not in patch


def test_manual_flat_negative_subscription_rejected() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_flat",
        {},
        {
            const.CONF_ENERGY_PRICE: 0.12,
            const.CONF_SUBSCRIPTION_PRICE: -5.0,
        },
    )
    assert errors[const.CONF_SUBSCRIPTION_PRICE] == config_validation.ERR_INVALID_PRICE


def test_manual_flat_valid_patch() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_flat",
        {},
        {
            const.CONF_ENERGY_PRICE: 0.15,
            const.CONF_SUBSCRIPTION_PRICE: 12.5,
        },
    )
    assert errors == {}
    assert patch[const.CONF_ENERGY_PRICE] == 0.15
    assert patch[const.CONF_SUBSCRIPTION_PRICE] == 12.5


def test_manual_tou_valid_form_normalizes_periods() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {
            "tou_r0_start": "08:00:00",
            "tou_r0_end": "20:00",
            "tou_r0_price": 0.12,
            "tou_r1_start": "20:00",
            "tou_r1_end": "08:00",
            "tou_r1_price": 0.08,
            const.CONF_SUBSCRIPTION_PRICE: 0,
        },
    )
    assert errors == {}
    assert patch[const.CONF_SUBSCRIPTION_PRICE] == 0.0
    periods = patch[const.CONF_TOU_PERIODS]
    assert isinstance(periods, list)
    assert len(periods) == 2
    assert periods[0]["name"] == "HC"
    assert periods[0]["start"] == "08:00"
    assert periods[0]["end"] == "20:00"
    assert periods[0]["price"] == 0.12
    assert periods[1]["name"] == "HP"


def test_manual_tou_invalid_time_on_form() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {
            "tou_r0_start": "25:00",
            "tou_r0_end": "20:00",
            "tou_r0_price": 0.1,
            "tou_r1_start": "20:00",
            "tou_r1_end": "25:00",
            "tou_r1_price": 0.1,
        },
    )
    assert errors.get("tou_r0_start") == config_validation.ERR_INVALID_JSON
    assert const.CONF_TOU_PERIODS not in patch


def test_manual_tou_missing_slots_require_fields() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_SUBSCRIPTION_PRICE: 0.0},
    )
    assert errors.get("tou_r0_start") == config_validation.ERR_REQUIRED
    assert const.CONF_TOU_PERIODS not in patch


def test_manual_tou_valid_nested_sections() -> None:
    """``section()`` payloads (tou_slot_N) flatten to the same validation as flat keys."""
    ui = {
        f"{const.TOU_FORM_SECTION_PREFIX}0": {
            "tou_r0_start": "22:00",
            "tou_r0_end": "06:00",
            "tou_r0_price": 0.11,
        },
        f"{const.TOU_FORM_SECTION_PREFIX}1": {
            "tou_r1_start": "06:00",
            "tou_r1_end": "22:00",
            "tou_r1_price": 0.19,
        },
        const.CONF_SUBSCRIPTION_PRICE: 0.0,
    }
    patch, errors = HubEnergieConfigValidator.validate_step("manual_tou", {}, ui)
    assert errors == {}
    assert patch[const.CONF_TOU_PERIODS][0]["name"] == "HC"
    assert patch[const.CONF_TOU_PERIODS][1]["name"] == "HP"


def test_manual_schedule_valid_json() -> None:
    raw = (
        '[{"start": "06:00", "end": "08:00", "price": 0.1, '
        f'"day_type": "{const.DAY_TYPE_WEEKDAYS}"}}]'
    )
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_schedule_json",
        {},
        {const.CONF_SCHEDULE_SLOTS: raw},
    )
    assert errors == {}
    slots = patch[const.CONF_SCHEDULE_SLOTS]
    assert slots[0]["day_type"] == const.DAY_TYPE_WEEKDAYS


def test_manual_schedule_invalid_day_type() -> None:
    raw = '[{"start": "06:00", "end": "08:00", "price": 0.1, "day_type": "mars"}]'
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_schedule_json",
        {},
        {const.CONF_SCHEDULE_SLOTS: raw},
    )
    assert errors[const.CONF_SCHEDULE_SLOTS] == config_validation.ERR_INVALID_OPTION


def test_manual_schedule_form_valid() -> None:
    ui: dict = {const.CONF_SUBSCRIPTION_PRICE: 0.0}
    ui["sched_r0_start"] = "06:00"
    ui["sched_r0_end"] = "22:00"
    ui["sched_r0_price"] = 0.18
    ui["sched_r0_day_type"] = const.DAY_TYPE_WEEKDAYS
    ui["sched_r0_name"] = "HP"
    patch, errors = HubEnergieConfigValidator.validate_step("manual_schedule_form", {}, ui)
    assert errors == {}
    assert patch[const.CONF_SCHEDULE_SLOTS][0]["name"] == "HP"


def test_manual_schedule_form_valid_nested_sections() -> None:
    """``section()`` payloads (sched_slot_N) flatten to the same validation as flat keys."""
    ui = {
        f"{const.SCHEDULE_FORM_SECTION_PREFIX}0": {
            "sched_r0_start": "06:00",
            "sched_r0_end": "22:00",
            "sched_r0_price": 0.18,
            "sched_r0_day_type": const.DAY_TYPE_WEEKDAYS,
            "sched_r0_name": "HP",
        },
        const.CONF_SUBSCRIPTION_PRICE: 0.0,
    }
    patch, errors = HubEnergieConfigValidator.validate_step("manual_schedule_form", {}, ui)
    assert errors == {}
    assert patch[const.CONF_SCHEDULE_SLOTS][0]["name"] == "HP"


def test_manual_schedule_form_incomplete_row() -> None:
    ui = {
        "sched_r0_start": "06:00",
        "sched_r0_end": "",
        const.CONF_SUBSCRIPTION_PRICE: 0.0,
    }
    patch, errors = HubEnergieConfigValidator.validate_step("manual_schedule_form", {}, ui)
    assert errors["base"] == config_validation.ERR_SCHEDULE_INCOMPLETE_ROW
    assert const.CONF_SCHEDULE_SLOTS not in patch


def test_manual_schedule_json_accepts_hhmmss_normalized() -> None:
    raw = '[{"start": "06:00:00", "end": "08:00:00", "price": 0.1, "day_type": "all"}]'
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_schedule_json",
        {},
        {const.CONF_SCHEDULE_SLOTS: raw},
    )
    assert errors == {}
    assert patch[const.CONF_SCHEDULE_SLOTS][0]["start"] == "06:00"


def test_validate_full_minimal_edf_tempo_api_valid() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            const.CONF_CONTRACT_POWER: "9",
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import_energy",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
        }
    )
    assert errors == {}


def test_validate_full_missing_grid_import_energy() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            const.CONF_CONTRACT_POWER: "9",
        }
    )
    assert errors[const.CONF_GRID_IMPORT_ENERGY] == config_validation.ERR_NO_ENERGY_SENSOR


def test_validate_full_tri_per_phase_uses_three_import_meters() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_TRI,
            const.CONF_GRID_TRI_ENERGY_MODE: const.TRI_GRID_ENERGY_PER_PHASE,
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            const.CONF_CONTRACT_POWER: "9",
            const.CONF_GRID_IMPORT_ENERGY_PHASES: [
                {"phase": 1, "entity_id": "sensor.g1"},
                {"phase": 2, "entity_id": "sensor.g2"},
                {"phase": 3, "entity_id": "sensor.g3"},
            ],
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
        }
    )
    assert errors == {}


def test_validate_full_tri_per_phase_requires_all_three_phases() -> None:
    errors = HubEnergieConfigValidator.validate_full(
        {
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_TRI,
            const.CONF_GRID_TRI_ENERGY_MODE: const.TRI_GRID_ENERGY_PER_PHASE,
            const.CONF_TARIFF_MODE: const.TARIFF_MODE_AUTO,
            const.CONF_CONTRACT_POWER: "9",
            const.CONF_GRID_IMPORT_ENERGY_PHASES: [
                {"phase": 1, "entity_id": "sensor.g1"},
            ],
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
        }
    )
    assert (
        errors[const.CONF_GRID_IMPORT_ENERGY_PHASES]
        == config_validation.ERR_TRI_IMPORT_PHASES_INCOMPLETE
    )


def test_grid_tri_per_phase_step_builds_phase_lists() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_per_phase",
        {},
        {
            const.CONF_TRI_IMPORT_ENERGY_P1: "sensor.i1",
            const.CONF_TRI_IMPORT_ENERGY_P2: "sensor.i2",
            const.CONF_TRI_IMPORT_ENERGY_P3: "sensor.i3",
            const.CONF_GRID_POWER_SIGN_MODE: const.GRID_POWER_SIGN_EXPORT_NEGATIVE,
        },
    )
    assert errors == {}
    assert patch[const.CONF_GRID_IMPORT_ENERGY] is None
    assert patch[const.CONF_GRID_IMPORT_ENERGY_PHASES] == [
        {"phase": 1, "entity_id": "sensor.i1"},
        {"phase": 2, "entity_id": "sensor.i2"},
        {"phase": 3, "entity_id": "sensor.i3"},
    ]
    assert patch.get(const.CONF_GRID_EXPORT_ENERGY_PHASES) is None
    assert patch.get(const.CONF_GRID_POWER_PHASES) is None
    assert const.CONF_GRID_POWER_SENSOR not in patch


def test_grid_tri_per_phase_instantaneous_power_per_phase() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_per_phase",
        {const.CONF_GRID_POWER_SENSOR: "sensor.grid_total_w"},
        {
            const.CONF_TRI_IMPORT_ENERGY_P1: "sensor.i1",
            const.CONF_TRI_IMPORT_ENERGY_P2: "sensor.i2",
            const.CONF_TRI_IMPORT_ENERGY_P3: "sensor.i3",
            const.CONF_GRID_POWER_SIGN_MODE: const.GRID_POWER_SIGN_EXPORT_NEGATIVE,
            const.CONF_TRI_GRID_POWER_P1: "sensor.p1_w",
            const.CONF_TRI_GRID_POWER_P2: "sensor.p2_w",
            const.CONF_TRI_GRID_POWER_P3: "sensor.p3_w",
        },
    )
    assert errors == {}
    assert patch[const.CONF_GRID_POWER_PHASES] == [
        {"phase": 1, "entity_id": "sensor.p1_w"},
        {"phase": 2, "entity_id": "sensor.p2_w"},
        {"phase": 3, "entity_id": "sensor.p3_w"},
    ]
    assert patch[const.CONF_GRID_POWER_SENSOR] is None


def test_grid_tri_per_phase_without_power_keeps_prior_total_sensor() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_per_phase",
        {const.CONF_GRID_POWER_SENSOR: "sensor.grid_total_w"},
        {
            const.CONF_TRI_IMPORT_ENERGY_P1: "sensor.i1",
            const.CONF_TRI_IMPORT_ENERGY_P2: "sensor.i2",
            const.CONF_TRI_IMPORT_ENERGY_P3: "sensor.i3",
            const.CONF_GRID_POWER_SIGN_MODE: const.GRID_POWER_SIGN_EXPORT_NEGATIVE,
        },
    )
    assert errors == {}
    assert patch.get(const.CONF_GRID_POWER_PHASES) is None
    assert const.CONF_GRID_POWER_SENSOR not in patch


def test_grid_tri_per_phase_export_requires_all_three_or_none() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_per_phase",
        {},
        {
            const.CONF_TRI_IMPORT_ENERGY_P1: "sensor.i1",
            const.CONF_TRI_IMPORT_ENERGY_P2: "sensor.i2",
            const.CONF_TRI_IMPORT_ENERGY_P3: "sensor.i3",
            const.CONF_TRI_EXPORT_ENERGY_P1: "sensor.e1",
            const.CONF_GRID_POWER_SIGN_MODE: const.GRID_POWER_SIGN_EXPORT_NEGATIVE,
        },
    )
    assert errors["base"] == config_validation.ERR_TRI_EXPORT_ALL_OR_NONE


def test_redact_mapping_masks_secret_password_token_keys() -> None:
    out = config_validation._redact_mapping(
        {
            "rte_client_secret": "s3cr3t",
            "api_password": "x",
            "user_token": "t",
            "plain": "visible",
        }
    )
    assert out["rte_client_secret"] == "***"
    assert out["api_password"] == "***"
    assert out["user_token"] == "***"
    assert out["plain"] == "visible"


def test_manual_tou_invalid_price_error_does_not_echo_secret_value() -> None:
    secret = "super-secret-token-12345"
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {
            "tou_r0_start": "22:00",
            "tou_r0_end": "06:00",
            "tou_r0_price": 0.1,
            "tou_r1_start": "06:00",
            "tou_r1_end": "22:00",
            "tou_r1_price": secret,
        },
    )
    assert errors.get("tou_r1_price") == config_validation.ERR_INVALID_PRICE
    for _k, v in errors.items():
        assert secret not in str(v)
    assert secret not in patch.values()


def test_grid_tri_layout_per_phase_clears_phase_lists() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_layout",
        {
            const.CONF_GRID_IMPORT_ENERGY_PHASES: [{"phase": 1, "entity_id": "sensor.old"}],
        },
        {const.CONF_GRID_TRI_SENSOR_LAYOUT: const.TRI_GRID_SENSOR_PER_PHASE},
    )
    assert errors == {}
    assert patch[const.CONF_GRID_TRI_SENSOR_LAYOUT] == const.TRI_GRID_SENSOR_PER_PHASE
    assert patch[const.CONF_GRID_IMPORT_ENERGY_PHASES] is None
    assert patch[const.CONF_GRID_EXPORT_ENERGY_PHASES] is None
    assert patch[const.CONF_GRID_POWER_PHASES] is None


def test_grid_tri_layout_total_does_not_clear_lists() -> None:
    existing = [{"phase": 1, "entity_id": "sensor.a"}]
    patch, errors = HubEnergieConfigValidator.validate_step(
        "grid_tri_layout",
        {const.CONF_GRID_IMPORT_ENERGY_PHASES: existing},
        {const.CONF_GRID_TRI_SENSOR_LAYOUT: const.TRI_GRID_SENSOR_TOTAL},
    )
    assert errors == {}
    assert patch[const.CONF_GRID_TRI_SENSOR_LAYOUT] == const.TRI_GRID_SENSOR_TOTAL
    assert const.CONF_GRID_IMPORT_ENERGY_PHASES not in patch


def test_tri_grid_phase_step_merges_one_phase() -> None:
    draft = {
        const.CONF_GRID_IMPORT_ENERGY_PHASES: [{"phase": 2, "entity_id": "sensor.l2"}],
    }
    patch, errors = HubEnergieConfigValidator.validate_step(
        "tri_grid_phase_1",
        draft,
        {
            const.CONF_TRI_PHASE_STEP_IMPORT_ENERGY: "sensor.l1_imp",
            const.CONF_TRI_PHASE_STEP_GRID_POWER: "sensor.l1_p",
        },
    )
    assert errors == {}
    assert patch[const.CONF_GRID_IMPORT_ENERGY_PHASES] == [
        {"phase": 2, "entity_id": "sensor.l2"},
        {"phase": 1, "entity_id": "sensor.l1_imp"},
    ]
    assert patch[const.CONF_GRID_EXPORT_ENERGY_PHASES] is None
    assert patch[const.CONF_GRID_POWER_PHASES] == [{"phase": 1, "entity_id": "sensor.l1_p"}]
