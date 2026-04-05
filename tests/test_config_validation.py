"""Unit tests for Hub Energie config validation."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path


HUB_DIR = Path(__file__).resolve().parents[1]


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


def test_manual_tou_returns_field_error_for_invalid_json() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_TOU_PERIODS: "{bad json}", const.CONF_SUBSCRIPTION_PRICE: 5},
    )

    assert patch[const.CONF_SUBSCRIPTION_PRICE] == 5.0
    assert errors == {const.CONF_TOU_PERIODS: config_validation.ERR_INVALID_JSON}


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


def test_manual_tou_valid_json_normalizes_periods() -> None:
    raw = '[{"start": "08:00", "end": "20:00", "price": 0.12, "name": "day"}]'
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_TOU_PERIODS: raw, const.CONF_SUBSCRIPTION_PRICE: 0},
    )
    assert errors == {}
    assert patch[const.CONF_SUBSCRIPTION_PRICE] == 0.0
    periods = patch[const.CONF_TOU_PERIODS]
    assert isinstance(periods, list)
    assert periods[0]["start"] == "08:00"
    assert periods[0]["end"] == "20:00"
    assert periods[0]["price"] == 0.12


def test_manual_tou_invalid_time_on_period() -> None:
    raw = '[{"start": "25:00", "end": "20:00", "price": 0.1}]'
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_TOU_PERIODS: raw},
    )
    assert errors[const.CONF_TOU_PERIODS] == config_validation.ERR_INVALID_JSON
    assert const.CONF_TOU_PERIODS not in patch


def test_manual_tou_empty_list_after_parse_requires_periods() -> None:
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_TOU_PERIODS: "[]"},
    )
    assert errors[const.CONF_TOU_PERIODS] == config_validation.ERR_REQUIRED


def test_manual_schedule_valid_json() -> None:
    raw = (
        '[{"start": "06:00", "end": "08:00", "price": 0.1, '
        f'"day_type": "{const.DAY_TYPE_WEEKDAYS}"}}]'
    )
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_schedule",
        {},
        {const.CONF_SCHEDULE_SLOTS: raw},
    )
    assert errors == {}
    slots = patch[const.CONF_SCHEDULE_SLOTS]
    assert slots[0]["day_type"] == const.DAY_TYPE_WEEKDAYS


def test_manual_schedule_invalid_day_type() -> None:
    raw = '[{"start": "06:00", "end": "08:00", "price": 0.1, "day_type": "mars"}]'
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_schedule",
        {},
        {const.CONF_SCHEDULE_SLOTS: raw},
    )
    assert errors[const.CONF_SCHEDULE_SLOTS] == config_validation.ERR_INVALID_OPTION


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


def test_manual_tou_invalid_json_error_does_not_echo_secret_value() -> None:
    secret = "super-secret-token-12345"
    patch, errors = HubEnergieConfigValidator.validate_step(
        "manual_tou",
        {},
        {const.CONF_TOU_PERIODS: secret},
    )
    assert errors[const.CONF_TOU_PERIODS] == config_validation.ERR_INVALID_JSON
    for _k, v in errors.items():
        assert secret not in str(v)
    assert secret not in patch.values()
