"""Pure validation and normalization for Hub Energie config data."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Final, Mapping

from .config_models import HubEnergieConfigPartial, ValidationScope
from .utils.grid_phases import ordered_phase_entity_ids
from .utils.numbers import normalize_user_number_string
from .utils.redaction import redact_sensitive_mapping
from .const import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATTERY_SYSTEMS,
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_BATT_MAX_CHARGE_W,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATT_NAME,
    CONF_BATT_ADVANCED,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_CONTRACT_NAME,
    CONF_CONTRACT_POWER,
    CONF_CURRENCY,
    CONF_ENERGY_PRICE,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_GRID_TRI_SENSOR_LAYOUT,
    CONF_TRI_EXPORT_ENERGY_P1,
    CONF_TRI_EXPORT_ENERGY_P2,
    CONF_TRI_EXPORT_ENERGY_P3,
    CONF_TRI_IMPORT_ENERGY_P1,
    CONF_TRI_IMPORT_ENERGY_P2,
    CONF_TRI_IMPORT_ENERGY_P3,
    CONF_TRI_PHASE_STEP_EXPORT_ENERGY,
    CONF_TRI_PHASE_STEP_GRID_POWER,
    CONF_TRI_PHASE_STEP_IMPORT_ENERGY,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    CONF_PRICE_BASIS,
    CONF_PRICING_STRUCTURE,
    CONF_RTE_CLIENT_ID,
    CONF_RTE_CLIENT_SECRET,
    CONF_SCHEDULE_SLOTS,
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
    CONF_SUBSCRIPTION_PRICE,
    CONF_SUPPLIER,
    CONF_SUPPLIER_CUSTOM_NAME,
    CONF_TARIFF_MODE,
    CONF_TARIFF_OFFER,
    CONF_TARIFF_SOURCE,
    CONF_TEMPO_MODE,
    CONF_TOU_PERIODS,
    CONTRACT_POWER_OPTIONS,
    DAY_TYPE_ALL,
    DAY_TYPE_OPTIONS,
    GRID_POWER_SIGN_OPTIONS,
    PHASE_OPTIONS,
    PHASE_TRI,
    PRICE_BASIS_OPTIONS,
    PRICE_BASIS_TTC,
    PRICING_FLAT,
    PRICING_OPTIONS,
    PRICING_SCHEDULE,
    SCHEDULE_FORM_MAX_SLOTS,
    SCHEDULE_FORM_SECTION_PREFIX,
    PRICING_TIME_OF_USE,
    SOLAR_PERF_OPTIONS,
    TRI_GRID_ENERGY_OPTIONS,
    TRI_GRID_ENERGY_PER_PHASE,
    TRI_GRID_ENERGY_SINGLE,
    TRI_GRID_SENSOR_OPTIONS,
    TRI_GRID_SENSOR_PER_PHASE,
    TRI_GRID_SENSOR_TOTAL,
    SOLAR_PERF_STANDARD,
    SOLAR_SHADING_NONE,
    SOLAR_SHADING_OPTIONS,
    SOLAR_TILT_AUTO,
    SOLAR_TILT_MANUAL,
    SUPPLIER_EDF,
    SUPPLIER_OPTIONS,
    TARIFF_MODE_AUTO,
    TARIFF_MODE_MANUAL,
    TARIFF_OFFER_OPTIONS,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
    TEMPO_MODE_SENSOR,
)

ERR_REQUIRED: Final = "required"
ERR_INVALID_ENTITY: Final = "invalid_entity"
ERR_INVALID_OPTION: Final = "invalid_option"
ERR_INVALID_PRICE: Final = "invalid_price"
ERR_INVALID_JSON: Final = "invalid_json"
ERR_SUPPLIER_NAME_REQUIRED: Final = "supplier_name_required"
ERR_BATTERY_NAME_REQUIRED: Final = "battery_name_required"
ERR_RTE_CREDS_REQUIRED: Final = "rte_creds_required"
ERR_TARIFF_PAYLOAD_INCOMPLETE: Final = "tariff_payload_incomplete"
ERR_PEAK_POWER_REQUIRED: Final = "peak_power_required"
ERR_INVALID_BATTERY_CHOICE: Final = "invalid_battery_choice"
ERR_BATTERY_ADV_CAPACITY_NOT_BOTH: Final = "battery_adv_capacity_not_both"
ERR_BATTERY_ADV_MAX_CHARGE_NOT_BOTH: Final = "battery_adv_max_charge_not_both"
ERR_BATTERY_ADV_MAX_DISCHARGE_NOT_BOTH: Final = "battery_adv_max_discharge_not_both"
ERR_BATTERY_ADV_SOC_MIN_NOT_BOTH: Final = "battery_adv_soc_min_not_both"
ERR_BATTERY_ADV_SOC_MAX_NOT_BOTH: Final = "battery_adv_soc_max_not_both"
ERR_NO_ENERGY_SENSOR: Final = "no_energy_sensor"
ERR_SCHEDULE_INCOMPLETE_ROW: Final = "schedule_incomplete_row"
ERR_TRI_EXPORT_ALL_OR_NONE: Final = "tri_export_all_or_none"
ERR_TRI_IMPORT_PHASES_INCOMPLETE: Final = "tri_import_phases_incomplete"

_LOGGER = logging.getLogger(__name__)

_TRI_GRID_PHASE_SCOPE_TO_NUM: Final[dict[str, int]] = {
    "tri_grid_phase_1": 1,
    "tri_grid_phase_2": 2,
    "tri_grid_phase_3": 3,
}

_ENTITY_ID_RE: Final = re.compile(r"^[a-z0-9_]+\.[a-z0-9_]+$")
_TIME_RE: Final = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")

_BATTERY_ADVANCED_RULES: Final[tuple[tuple[str, str, float, float, str], ...]] = (
    (
        CONF_BATT_CAPACITY_KWH,
        CONF_BATT_CAPACITY_KWH_ENTITY,
        0.1,
        500.0,
        ERR_BATTERY_ADV_CAPACITY_NOT_BOTH,
    ),
    (
        CONF_BATT_MAX_CHARGE_W,
        CONF_BATT_MAX_CHARGE_W_ENTITY,
        0.0,
        50000.0,
        ERR_BATTERY_ADV_MAX_CHARGE_NOT_BOTH,
    ),
    (
        CONF_BATT_MAX_DISCHARGE_W,
        CONF_BATT_MAX_DISCHARGE_W_ENTITY,
        0.0,
        50000.0,
        ERR_BATTERY_ADV_MAX_DISCHARGE_NOT_BOTH,
    ),
    (
        CONF_BATT_SOC_MIN,
        CONF_BATT_SOC_MIN_ENTITY,
        0.0,
        100.0,
        ERR_BATTERY_ADV_SOC_MIN_NOT_BOTH,
    ),
    (
        CONF_BATT_SOC_MAX,
        CONF_BATT_SOC_MAX_ENTITY,
        0.0,
        100.0,
        ERR_BATTERY_ADV_SOC_MAX_NOT_BOTH,
    ),
)

_SOLAR_CLEAR_KEYS: Final[tuple[str, ...]] = (
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_POWER_SENSOR,
    CONF_SOLAR_RESALE_CONTRACT,
    CONF_SOLAR_EXPORT_TARIFF,
    CONF_SOLAR_ESTIMATION_ENABLED,
    CONF_SOLAR_LOCATION_LAT,
    CONF_SOLAR_LOCATION_LON,
    CONF_SOLAR_PEAK_POWER,
    CONF_SOLAR_ORIENTATION,
    CONF_SOLAR_TILT_MODE,
    CONF_SOLAR_TILT,
    CONF_SOLAR_SHADING,
    CONF_SOLAR_PERFORMANCE,
)


def _merged(
    draft: Mapping[str, Any], user_input: Mapping[str, Any]
) -> dict[str, Any]:
    return {**dict(draft), **dict(user_input)}


def _redact_mapping(values: Mapping[str, Any]) -> dict[str, Any]:
    return redact_sensitive_mapping(values)


def _clean_text(value: Any) -> str:
    return str(value or "").strip()


def _clean_optional_text(value: Any) -> str | None:
    cleaned = _clean_text(value)
    return cleaned or None


def _normalize_bool(value: Any) -> bool:
    return bool(value)


def _optional_entity_id(
    value: Any, errors: dict[str, str], field: str, *, required: bool = False
) -> str | None:
    cleaned = _clean_optional_text(value)
    if cleaned is None:
        if required:
            errors[field] = ERR_REQUIRED
        return None
    if not _ENTITY_ID_RE.match(cleaned):
        errors[field] = ERR_INVALID_ENTITY
        return None
    return cleaned


def _normalize_float(
    value: Any,
    errors: dict[str, str],
    field: str,
    *,
    required: bool = False,
    minimum: float | None = None,
    maximum: float | None = None,
) -> float | None:
    if value in (None, ""):
        if required:
            errors[field] = ERR_REQUIRED
        return None
    if isinstance(value, str):
        value = normalize_user_number_string(value)
        if value == "":
            if required:
                errors[field] = ERR_REQUIRED
            return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        errors[field] = ERR_INVALID_PRICE
        return None
    if minimum is not None and number < minimum:
        errors[field] = ERR_INVALID_PRICE
        return None
    if maximum is not None and number > maximum:
        errors[field] = ERR_INVALID_PRICE
        return None
    return number


def _normalize_enum(
    value: Any,
    *,
    default: str | None,
    allowed: set[str],
    errors: dict[str, str],
    field: str,
) -> str | None:
    candidate = _clean_optional_text(value)
    if candidate is None:
        if default is None:
            errors[field] = ERR_REQUIRED
            return None
        candidate = default
    if candidate not in allowed:
        errors[field] = ERR_INVALID_OPTION
        return None
    return candidate


def _parse_json_list(
    raw: Any, errors: dict[str, str], field: str
) -> list[dict[str, Any]] | None:
    if raw in (None, ""):
        errors[field] = ERR_REQUIRED
        return None
    try:
        parsed = json.loads(str(raw))
    except json.JSONDecodeError:
        errors[field] = ERR_INVALID_JSON
        return None
    if not isinstance(parsed, list):
        errors[field] = ERR_INVALID_JSON
        return None
    if any(not isinstance(item, dict) for item in parsed):
        errors[field] = ERR_INVALID_JSON
        return None
    return parsed


def _validate_time(value: Any, errors: dict[str, str], field: str) -> str | None:
    cleaned = _clean_optional_text(value)
    if cleaned is None:
        errors[field] = ERR_REQUIRED
        return None
    if len(cleaned) >= 8 and cleaned[2] == ":" and cleaned[5] == ":":
        cleaned = cleaned[:5]
    if not _TIME_RE.match(cleaned):
        errors[field] = ERR_INVALID_JSON
        return None
    return cleaned


def _flatten_schedule_form_input(user_input: Mapping[str, Any]) -> dict[str, Any]:
    """Expand ``sched_slot_N`` section payloads to flat ``sched_r*`` keys (HA ``section()``)."""
    if not any(f"{SCHEDULE_FORM_SECTION_PREFIX}{i}" in user_input for i in range(SCHEDULE_FORM_MAX_SLOTS)):
        return dict(user_input)
    flat: dict[str, Any] = {}
    for i in range(SCHEDULE_FORM_MAX_SLOTS):
        key = f"{SCHEDULE_FORM_SECTION_PREFIX}{i}"
        block = user_input.get(key)
        if isinstance(block, dict):
            flat.update(block)
    for k, v in user_input.items():
        if isinstance(k, str) and k.startswith(SCHEDULE_FORM_SECTION_PREFIX):
            continue
        flat[k] = v
    return flat


def _schedule_items_from_form_input(
    user_input: Mapping[str, Any], errors: dict[str, str]
) -> list[dict[str, Any]] | None:
    """Build slot dicts from ``sched_r{i}_*`` form keys; skip empty rows."""
    user_input = _flatten_schedule_form_input(user_input)
    rows: list[dict[str, Any]] = []
    for i in range(SCHEDULE_FORM_MAX_SLOTS):
        p = f"sched_r{i}_"
        start = _clean_optional_text(user_input.get(f"{p}start"))
        end = _clean_optional_text(user_input.get(f"{p}end"))
        if start is None and end is None:
            continue
        if start is None or end is None:
            errors["base"] = ERR_SCHEDULE_INCOMPLETE_ROW
            return None
        rows.append(
            {
                "start": start,
                "end": end,
                "price": user_input.get(f"{p}price"),
                "day_type": user_input.get(f"{p}day_type") or DAY_TYPE_ALL,
                "name": user_input.get(f"{p}name"),
            }
        )
    return rows


def _clear_patch(keys: tuple[str, ...]) -> dict[str, Any]:
    return {key: None for key in keys}


def _validate_phase_entries(
    items: list[dict[str, Any]], errors: dict[str, str], field: str
) -> list[dict[str, Any]] | None:
    normalized: list[dict[str, Any]] = []
    for item in items:
        phase = item.get("phase")
        entity_id = _clean_optional_text(item.get("entity_id"))
        if phase is None or entity_id is None:
            errors[field] = ERR_INVALID_JSON
            return None
        if not _ENTITY_ID_RE.match(entity_id):
            errors[field] = ERR_INVALID_ENTITY
            return None
        try:
            phase_number = int(phase)
        except (TypeError, ValueError):
            errors[field] = ERR_INVALID_JSON
            return None
        normalized.append({"phase": phase_number, "entity_id": entity_id})
    return normalized


def _phase_list_drop_phase(items: Any, phase: int) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        return []
    out: list[dict[str, Any]] = []
    for x in items:
        if not isinstance(x, dict):
            continue
        try:
            p = int(x.get("phase", 0))
        except (TypeError, ValueError):
            continue
        if p != phase:
            out.append(x)
    return out


def _merge_tri_phase_step_patch(
    merged: Mapping[str, Any],
    user_input: Mapping[str, Any],
    phase: int,
    errors: dict[str, str],
) -> dict[str, Any]:
    """Build patch for import/export/power phase lists for one wizard step."""
    patch: dict[str, Any] = {}
    step_fields = (
        (CONF_GRID_IMPORT_ENERGY_PHASES, CONF_TRI_PHASE_STEP_IMPORT_ENERGY),
        (CONF_GRID_EXPORT_ENERGY_PHASES, CONF_TRI_PHASE_STEP_EXPORT_ENERGY),
        (CONF_GRID_POWER_PHASES, CONF_TRI_PHASE_STEP_GRID_POWER),
    )
    for field, ukey in step_fields:
        base = _phase_list_drop_phase(merged.get(field), phase)
        eid = _optional_entity_id(user_input.get(ukey), errors, ukey)
        if eid:
            base = [*base, {"phase": phase, "entity_id": eid}]
        patch[field] = base if base else None
    return patch


def _validate_tou_items(
    items: list[dict[str, Any]], errors: dict[str, str], field: str
) -> list[dict[str, Any]] | None:
    if not items:
        errors[field] = ERR_REQUIRED
        return None
    normalized: list[dict[str, Any]] = []
    for item in items:
        price = _normalize_float(item.get("price"), errors, field, minimum=0.0)
        start = _validate_time(item.get("start"), errors, field)
        end = _validate_time(item.get("end"), errors, field)
        if field in errors or price is None or start is None or end is None:
            return None
        normalized_item = dict(item)
        normalized_item["price"] = price
        normalized_item["start"] = start
        normalized_item["end"] = end
        name = _clean_optional_text(item.get("name"))
        if name is not None:
            normalized_item["name"] = name
        normalized.append(normalized_item)
    return normalized


def _validate_schedule_items(
    items: list[dict[str, Any]], errors: dict[str, str], field: str
) -> list[dict[str, Any]] | None:
    if not items:
        errors[field] = ERR_REQUIRED
        return None
    normalized: list[dict[str, Any]] = []
    for item in items:
        price = _normalize_float(item.get("price"), errors, field, minimum=0.0)
        start = _validate_time(item.get("start"), errors, field)
        end = _validate_time(item.get("end"), errors, field)
        day_type = _clean_optional_text(item.get("day_type")) or DAY_TYPE_OPTIONS[0]
        if day_type not in DAY_TYPE_OPTIONS:
            errors[field] = ERR_INVALID_OPTION
            return None
        if field in errors or price is None or start is None or end is None:
            return None
        normalized_item = dict(item)
        normalized_item["price"] = price
        normalized_item["start"] = start
        normalized_item["end"] = end
        normalized_item["day_type"] = day_type
        name = _clean_optional_text(item.get("name"))
        if name is not None:
            normalized_item["name"] = name
        normalized.append(normalized_item)
    return normalized


def _manual_numeric_provided(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return True


def _validate_battery_advanced(
    user_input: Mapping[str, Any],
) -> tuple[HubEnergieConfigPartial, dict[str, str]]:
    patch: HubEnergieConfigPartial = {}
    errors: dict[str, str] = {}
    for value_key, entity_key, minimum, maximum, error_code in _BATTERY_ADVANCED_RULES:
        manual_on = _manual_numeric_provided(user_input.get(value_key))
        entity_on = _clean_optional_text(user_input.get(entity_key)) is not None

        if manual_on and entity_on:
            errors[value_key] = error_code
            errors[entity_key] = error_code
            continue

        if manual_on:
            number = _normalize_float(
                user_input.get(value_key),
                errors,
                value_key,
                minimum=minimum,
                maximum=maximum,
            )
            if value_key in errors:
                continue
            patch[value_key] = number
            patch[entity_key] = None
            continue

        if entity_on:
            entity_id = _optional_entity_id(
                user_input.get(entity_key), errors, entity_key
            )
            if entity_key in errors:
                continue
            patch[value_key] = None
            patch[entity_key] = entity_id
            continue

        patch[value_key] = None
        patch[entity_key] = None

    if (
        CONF_BATT_SOC_MIN in patch
        and CONF_BATT_SOC_MAX in patch
        and isinstance(patch.get(CONF_BATT_SOC_MIN), float)
        and isinstance(patch.get(CONF_BATT_SOC_MAX), float)
        and patch[CONF_BATT_SOC_MIN] > patch[CONF_BATT_SOC_MAX]
    ):
        errors[CONF_BATT_SOC_MIN] = ERR_INVALID_PRICE
        errors[CONF_BATT_SOC_MAX] = ERR_INVALID_PRICE
    return patch, errors


def _validate_solar_fields(
    merged: Mapping[str, Any], user_input: Mapping[str, Any]
) -> tuple[HubEnergieConfigPartial, dict[str, str]]:
    patch: HubEnergieConfigPartial = {}
    errors: dict[str, str] = {}
    patch[CONF_SOLAR_ENERGY] = _optional_entity_id(
        user_input.get(CONF_SOLAR_ENERGY),
        errors,
        CONF_SOLAR_ENERGY,
        required=True,
    )
    patch[CONF_SOLAR_POWER_SENSOR] = _optional_entity_id(
        user_input.get(CONF_SOLAR_POWER_SENSOR),
        errors,
        CONF_SOLAR_POWER_SENSOR,
    )
    resale = _normalize_bool(user_input.get(CONF_SOLAR_RESALE_CONTRACT))
    patch[CONF_SOLAR_RESALE_CONTRACT] = resale
    if resale:
        patch[CONF_SOLAR_EXPORT_TARIFF] = _normalize_float(
            user_input.get(CONF_SOLAR_EXPORT_TARIFF),
            errors,
            CONF_SOLAR_EXPORT_TARIFF,
            required=True,
            minimum=0.0,
            maximum=1.0,
        )
    else:
        patch[CONF_SOLAR_EXPORT_TARIFF] = None
    estimation = _normalize_bool(user_input.get(CONF_SOLAR_ESTIMATION_ENABLED))
    patch[CONF_SOLAR_ESTIMATION_ENABLED] = estimation
    if not estimation and merged.get(CONF_SOLAR_ESTIMATION_ENABLED):
        patch.update(
            {
                CONF_SOLAR_LOCATION_LAT: None,
                CONF_SOLAR_LOCATION_LON: None,
                CONF_SOLAR_PEAK_POWER: None,
                CONF_SOLAR_ORIENTATION: None,
                CONF_SOLAR_TILT_MODE: None,
                CONF_SOLAR_TILT: None,
                CONF_SOLAR_SHADING: None,
                CONF_SOLAR_PERFORMANCE: None,
            }
        )
    return patch, errors


class HubEnergieConfigValidator:
    """Pure step-based validation for config and options flows."""

    @staticmethod
    def validate_step(
        scope: ValidationScope,
        draft: Mapping[str, Any],
        user_input: Mapping[str, Any],
    ) -> tuple[HubEnergieConfigPartial, dict[str, str]]:
        """Validate one step and return a normalized patch plus UI errors."""
        patch, errors = HubEnergieConfigValidator._validate_step_impl(
            scope, draft, user_input
        )
        _LOGGER.debug(
            "Validation step %s patch=%s errors=%s",
            scope,
            _redact_mapping(patch),
            errors,
        )
        return patch, errors

    @staticmethod
    def _validate_step_impl(
        scope: ValidationScope,
        draft: Mapping[str, Any],
        user_input: Mapping[str, Any],
    ) -> tuple[HubEnergieConfigPartial, dict[str, str]]:
        """Validate one step and return a normalized patch plus UI errors."""
        merged = _merged(draft, user_input)
        patch: HubEnergieConfigPartial = {}
        errors: dict[str, str] = {}

        if scope == "user":
            supplier = _normalize_enum(
                user_input.get(CONF_SUPPLIER),
                default=SUPPLIER_EDF,
                allowed=set(SUPPLIER_OPTIONS),
                errors=errors,
                field=CONF_SUPPLIER,
            )
            phase = _normalize_enum(
                user_input.get(CONF_PHASE_TYPE),
                default=PHASE_OPTIONS[0],
                allowed=set(PHASE_OPTIONS),
                errors=errors,
                field=CONF_PHASE_TYPE,
            )
            if supplier is not None:
                patch[CONF_SUPPLIER] = supplier
            if phase is not None:
                patch[CONF_PHASE_TYPE] = phase
            return patch, errors

        if scope == "supplier_custom":
            name = _clean_optional_text(user_input.get(CONF_SUPPLIER_CUSTOM_NAME))
            if name is None:
                errors[CONF_SUPPLIER_CUSTOM_NAME] = ERR_SUPPLIER_NAME_REQUIRED
            else:
                patch[CONF_SUPPLIER_CUSTOM_NAME] = name
            return patch, errors

        if scope == "tariff_mode":
            mode = _normalize_enum(
                user_input.get(CONF_TARIFF_MODE),
                default=TARIFF_MODE_AUTO,
                allowed={TARIFF_MODE_AUTO, TARIFF_MODE_MANUAL},
                errors=errors,
                field=CONF_TARIFF_MODE,
            )
            if mode is not None:
                patch[CONF_TARIFF_MODE] = mode
            return patch, errors

        if scope == "contract":
            is_edf = merged.get(CONF_SUPPLIER) == SUPPLIER_EDF
            power_raw = user_input.get(CONF_CONTRACT_POWER)
            if is_edf:
                power = _clean_optional_text(power_raw)
                if power is None:
                    errors[CONF_CONTRACT_POWER] = ERR_REQUIRED
                elif power not in CONTRACT_POWER_OPTIONS:
                    errors[CONF_CONTRACT_POWER] = ERR_INVALID_OPTION
                else:
                    patch[CONF_CONTRACT_POWER] = power
            else:
                power_value = _normalize_float(
                    power_raw,
                    errors,
                    CONF_CONTRACT_POWER,
                    required=True,
                    minimum=1.0,
                    maximum=120.0,
                )
                if power_value is not None:
                    patch[CONF_CONTRACT_POWER] = str(int(power_value))
            contract_name = _clean_optional_text(user_input.get(CONF_CONTRACT_NAME))
            patch[CONF_CONTRACT_NAME] = contract_name
            return patch, errors

        if scope == "edf_offer":
            offer = _normalize_enum(
                user_input.get(CONF_TARIFF_OFFER),
                default=TARIFF_OFFER_OPTIONS[0],
                allowed=set(TARIFF_OFFER_OPTIONS),
                errors=errors,
                field=CONF_TARIFF_OFFER,
            )
            if offer is not None:
                patch[CONF_TARIFF_OFFER] = offer
            return patch, errors

        if scope == "tempo_mode":
            tempo_mode = _normalize_enum(
                user_input.get(CONF_TEMPO_MODE),
                default=TEMPO_MODE_RTE,
                allowed={TEMPO_MODE_RTE, TEMPO_MODE_API, TEMPO_MODE_SENSOR},
                errors=errors,
                field=CONF_TEMPO_MODE,
            )
            if tempo_mode is not None:
                patch[CONF_TEMPO_MODE] = tempo_mode
            return patch, errors

        if scope == "rte_credentials":
            client_id = _clean_optional_text(user_input.get(CONF_RTE_CLIENT_ID))
            client_secret = _clean_optional_text(user_input.get(CONF_RTE_CLIENT_SECRET))
            merged_client_id = client_id or _clean_optional_text(merged.get(CONF_RTE_CLIENT_ID))
            merged_client_secret = client_secret or _clean_optional_text(
                merged.get(CONF_RTE_CLIENT_SECRET)
            )
            if merged_client_id is None or merged_client_secret is None:
                errors["base"] = ERR_RTE_CREDS_REQUIRED
            if client_id is not None:
                patch[CONF_RTE_CLIENT_ID] = client_id
            if client_secret is not None:
                patch[CONF_RTE_CLIENT_SECRET] = client_secret
            return patch, errors

        if scope == "manual_pricing":
            structure = _normalize_enum(
                user_input.get(CONF_PRICING_STRUCTURE),
                default=PRICING_FLAT,
                allowed=set(PRICING_OPTIONS),
                errors=errors,
                field=CONF_PRICING_STRUCTURE,
            )
            basis = _normalize_enum(
                user_input.get(CONF_PRICE_BASIS),
                default=PRICE_BASIS_TTC,
                allowed=set(PRICE_BASIS_OPTIONS),
                errors=errors,
                field=CONF_PRICE_BASIS,
            )
            currency = _clean_optional_text(user_input.get(CONF_CURRENCY)) or "EUR"
            if structure is not None:
                patch[CONF_PRICING_STRUCTURE] = structure
            if basis is not None:
                patch[CONF_PRICE_BASIS] = basis
            patch[CONF_CURRENCY] = currency
            patch[CONF_TARIFF_SOURCE] = "manual"
            return patch, errors

        if scope == "manual_flat":
            price = _normalize_float(
                user_input.get(CONF_ENERGY_PRICE),
                errors,
                CONF_ENERGY_PRICE,
                required=True,
                minimum=0.0,
                maximum=5.0,
            )
            subscription = _normalize_float(
                user_input.get(CONF_SUBSCRIPTION_PRICE),
                errors,
                CONF_SUBSCRIPTION_PRICE,
                minimum=0.0,
                maximum=1000.0,
            )
            if price is not None:
                patch[CONF_ENERGY_PRICE] = price
            patch[CONF_SUBSCRIPTION_PRICE] = subscription or 0.0
            return patch, errors

        if scope == "manual_tou":
            items = _parse_json_list(user_input.get(CONF_TOU_PERIODS), errors, CONF_TOU_PERIODS)
            if items is not None:
                normalized = _validate_tou_items(items, errors, CONF_TOU_PERIODS)
                if normalized is not None:
                    patch[CONF_TOU_PERIODS] = normalized
            subscription = _normalize_float(
                user_input.get(CONF_SUBSCRIPTION_PRICE),
                errors,
                CONF_SUBSCRIPTION_PRICE,
                minimum=0.0,
                maximum=1000.0,
            )
            patch[CONF_SUBSCRIPTION_PRICE] = subscription or 0.0
            return patch, errors

        if scope == "manual_schedule_form":
            items = _schedule_items_from_form_input(user_input, errors)
            if items is not None:
                normalized = _validate_schedule_items(items, errors, CONF_SCHEDULE_SLOTS)
                if normalized is not None:
                    patch[CONF_SCHEDULE_SLOTS] = normalized
            subscription = _normalize_float(
                user_input.get(CONF_SUBSCRIPTION_PRICE),
                errors,
                CONF_SUBSCRIPTION_PRICE,
                minimum=0.0,
                maximum=1000.0,
            )
            patch[CONF_SUBSCRIPTION_PRICE] = subscription or 0.0
            return patch, errors

        if scope == "manual_schedule_json":
            items = _parse_json_list(
                user_input.get(CONF_SCHEDULE_SLOTS),
                errors,
                CONF_SCHEDULE_SLOTS,
            )
            if items is not None:
                normalized = _validate_schedule_items(items, errors, CONF_SCHEDULE_SLOTS)
                if normalized is not None:
                    patch[CONF_SCHEDULE_SLOTS] = normalized
            subscription = _normalize_float(
                user_input.get(CONF_SUBSCRIPTION_PRICE),
                errors,
                CONF_SUBSCRIPTION_PRICE,
                minimum=0.0,
                maximum=1000.0,
            )
            patch[CONF_SUBSCRIPTION_PRICE] = subscription or 0.0
            return patch, errors

        if scope == "grid_tri_energy_mode":
            mode = _normalize_enum(
                user_input.get(CONF_GRID_TRI_ENERGY_MODE),
                default=TRI_GRID_ENERGY_SINGLE,
                allowed=set(TRI_GRID_ENERGY_OPTIONS),
                errors=errors,
                field=CONF_GRID_TRI_ENERGY_MODE,
            )
            if mode is not None:
                patch[CONF_GRID_TRI_ENERGY_MODE] = mode
            return patch, errors

        if scope == "grid_tri_per_phase":
            imp_ids: list[str] = []
            for key in (
                CONF_TRI_IMPORT_ENERGY_P1,
                CONF_TRI_IMPORT_ENERGY_P2,
                CONF_TRI_IMPORT_ENERGY_P3,
            ):
                eid = _optional_entity_id(user_input.get(key), errors, key, required=True)
                if eid:
                    imp_ids.append(eid)
            if len(imp_ids) == 3:
                patch[CONF_GRID_IMPORT_ENERGY_PHASES] = [
                    {"phase": i + 1, "entity_id": imp_ids[i]} for i in range(3)
                ]
            patch[CONF_GRID_IMPORT_ENERGY] = None
            raw_ex = (
                _clean_optional_text(user_input.get(CONF_TRI_EXPORT_ENERGY_P1)),
                _clean_optional_text(user_input.get(CONF_TRI_EXPORT_ENERGY_P2)),
                _clean_optional_text(user_input.get(CONF_TRI_EXPORT_ENERGY_P3)),
            )
            nf = sum(1 for x in raw_ex if x)
            if nf not in (0, 3):
                errors["base"] = ERR_TRI_EXPORT_ALL_OR_NONE
            elif nf == 3:
                ex_keys = (
                    CONF_TRI_EXPORT_ENERGY_P1,
                    CONF_TRI_EXPORT_ENERGY_P2,
                    CONF_TRI_EXPORT_ENERGY_P3,
                )
                ex_ids: list[str] = []
                for key, raw in zip(ex_keys, raw_ex):
                    eid = _optional_entity_id(raw, errors, key, required=True)
                    if eid:
                        ex_ids.append(eid)
                if len(ex_ids) == 3:
                    patch[CONF_GRID_EXPORT_ENERGY_PHASES] = [
                        {"phase": i + 1, "entity_id": ex_ids[i]} for i in range(3)
                    ]
            else:
                patch[CONF_GRID_EXPORT_ENERGY_PHASES] = None
            patch[CONF_GRID_EXPORT_ENERGY] = None
            patch[CONF_GRID_POWER_SENSOR] = _optional_entity_id(
                user_input.get(CONF_GRID_POWER_SENSOR),
                errors,
                CONF_GRID_POWER_SENSOR,
            )
            patch[CONF_LOAD_POWER_SENSOR] = _optional_entity_id(
                user_input.get(CONF_LOAD_POWER_SENSOR),
                errors,
                CONF_LOAD_POWER_SENSOR,
            )
            sign_mode = _normalize_enum(
                user_input.get(CONF_GRID_POWER_SIGN_MODE),
                default=GRID_POWER_SIGN_OPTIONS[0],
                allowed=set(GRID_POWER_SIGN_OPTIONS),
                errors=errors,
                field=CONF_GRID_POWER_SIGN_MODE,
            )
            if sign_mode is not None:
                patch[CONF_GRID_POWER_SIGN_MODE] = sign_mode
            return patch, errors

        if scope == "grid":
            patch[CONF_GRID_IMPORT_ENERGY] = _optional_entity_id(
                user_input.get(CONF_GRID_IMPORT_ENERGY),
                errors,
                CONF_GRID_IMPORT_ENERGY,
                required=True,
            )
            patch[CONF_GRID_EXPORT_ENERGY] = _optional_entity_id(
                user_input.get(CONF_GRID_EXPORT_ENERGY),
                errors,
                CONF_GRID_EXPORT_ENERGY,
            )
            patch[CONF_GRID_POWER_SENSOR] = _optional_entity_id(
                user_input.get(CONF_GRID_POWER_SENSOR),
                errors,
                CONF_GRID_POWER_SENSOR,
            )
            patch[CONF_LOAD_POWER_SENSOR] = _optional_entity_id(
                user_input.get(CONF_LOAD_POWER_SENSOR),
                errors,
                CONF_LOAD_POWER_SENSOR,
            )
            sign_mode = _normalize_enum(
                user_input.get(CONF_GRID_POWER_SIGN_MODE),
                default=GRID_POWER_SIGN_OPTIONS[0],
                allowed=set(GRID_POWER_SIGN_OPTIONS),
                errors=errors,
                field=CONF_GRID_POWER_SIGN_MODE,
            )
            if sign_mode is not None:
                patch[CONF_GRID_POWER_SIGN_MODE] = sign_mode
            return patch, errors

        if scope == "grid_tri_layout":
            layout = _normalize_enum(
                user_input.get(CONF_GRID_TRI_SENSOR_LAYOUT),
                default=TRI_GRID_SENSOR_OPTIONS[0],
                allowed=set(TRI_GRID_SENSOR_OPTIONS),
                errors=errors,
                field=CONF_GRID_TRI_SENSOR_LAYOUT,
            )
            if layout is not None:
                patch[CONF_GRID_TRI_SENSOR_LAYOUT] = layout
            if layout == TRI_GRID_SENSOR_PER_PHASE:
                patch[CONF_GRID_IMPORT_ENERGY_PHASES] = None
                patch[CONF_GRID_EXPORT_ENERGY_PHASES] = None
                patch[CONF_GRID_POWER_PHASES] = None
            return patch, errors

        if scope in _TRI_GRID_PHASE_SCOPE_TO_NUM:
            phase_num = _TRI_GRID_PHASE_SCOPE_TO_NUM[scope]
            patch.update(_merge_tri_phase_step_patch(merged, user_input, phase_num, errors))
            return patch, errors

        if scope == "grid_phases":
            for field in (
                CONF_GRID_IMPORT_ENERGY_PHASES,
                CONF_GRID_EXPORT_ENERGY_PHASES,
                CONF_GRID_POWER_PHASES,
            ):
                raw = _clean_optional_text(user_input.get(field))
                if raw is None:
                    patch[field] = None
                    continue
                items = _parse_json_list(raw, errors, field)
                if items is None:
                    continue
                normalized = _validate_phase_entries(items, errors, field)
                if normalized is not None:
                    patch[field] = normalized
            return patch, errors

        if scope == "solar_toggle":
            has_solar = _normalize_bool(user_input.get(CONF_HAS_SOLAR))
            patch[CONF_HAS_SOLAR] = has_solar
            if not has_solar:
                patch.update(_clear_patch(_SOLAR_CLEAR_KEYS))
            return patch, errors

        if scope == "solar_config":
            return _validate_solar_fields(merged, user_input)

        if scope == "solar_options":
            has_solar = _normalize_bool(user_input.get(CONF_HAS_SOLAR))
            patch[CONF_HAS_SOLAR] = has_solar
            if not has_solar:
                patch.update(_clear_patch(_SOLAR_CLEAR_KEYS))
                return patch, errors
            solar_patch, solar_errors = _validate_solar_fields(merged, user_input)
            patch.update(solar_patch)
            errors.update(solar_errors)
            return patch, errors

        if scope == "solar_estimation":
            patch[CONF_SOLAR_LOCATION_LAT] = _normalize_float(
                user_input.get(CONF_SOLAR_LOCATION_LAT),
                errors,
                CONF_SOLAR_LOCATION_LAT,
                required=True,
                minimum=-90.0,
                maximum=90.0,
            )
            patch[CONF_SOLAR_LOCATION_LON] = _normalize_float(
                user_input.get(CONF_SOLAR_LOCATION_LON),
                errors,
                CONF_SOLAR_LOCATION_LON,
                required=True,
                minimum=-180.0,
                maximum=180.0,
            )
            peak = _normalize_float(
                user_input.get(CONF_SOLAR_PEAK_POWER),
                errors,
                CONF_SOLAR_PEAK_POWER,
                required=True,
                minimum=0.1,
                maximum=1000.0,
            )
            if peak is None:
                errors[CONF_SOLAR_PEAK_POWER] = ERR_PEAK_POWER_REQUIRED
            else:
                patch[CONF_SOLAR_PEAK_POWER] = peak
            patch[CONF_SOLAR_ORIENTATION] = _normalize_float(
                user_input.get(CONF_SOLAR_ORIENTATION),
                errors,
                CONF_SOLAR_ORIENTATION,
                required=True,
                minimum=0.0,
                maximum=360.0,
            )
            tilt_mode = _normalize_enum(
                user_input.get(CONF_SOLAR_TILT_MODE),
                default=SOLAR_TILT_AUTO,
                allowed={SOLAR_TILT_AUTO, SOLAR_TILT_MANUAL},
                errors=errors,
                field=CONF_SOLAR_TILT_MODE,
            )
            if tilt_mode is not None:
                patch[CONF_SOLAR_TILT_MODE] = tilt_mode
            if tilt_mode == SOLAR_TILT_MANUAL:
                patch[CONF_SOLAR_TILT] = _normalize_float(
                    user_input.get(CONF_SOLAR_TILT),
                    errors,
                    CONF_SOLAR_TILT,
                    required=True,
                    minimum=0.0,
                    maximum=90.0,
                )
            else:
                patch[CONF_SOLAR_TILT] = None
            shading = _normalize_enum(
                user_input.get(CONF_SOLAR_SHADING),
                default=SOLAR_SHADING_NONE,
                allowed=set(SOLAR_SHADING_OPTIONS),
                errors=errors,
                field=CONF_SOLAR_SHADING,
            )
            perf = _normalize_enum(
                user_input.get(CONF_SOLAR_PERFORMANCE),
                default=SOLAR_PERF_STANDARD,
                allowed=set(SOLAR_PERF_OPTIONS),
                errors=errors,
                field=CONF_SOLAR_PERFORMANCE,
            )
            if shading is not None:
                patch[CONF_SOLAR_SHADING] = shading
            if perf is not None:
                patch[CONF_SOLAR_PERFORMANCE] = perf
            return patch, errors

        if scope == "battery_toggle":
            has_batteries = _normalize_bool(user_input.get(CONF_HAS_BATTERIES))
            patch[CONF_HAS_BATTERIES] = has_batteries
            if not has_batteries:
                patch[CONF_BATTERY_SYSTEMS] = []
            return patch, errors

        if scope == "battery_add":
            name = _clean_optional_text(user_input.get(CONF_BATT_NAME))
            if name is None:
                errors[CONF_BATT_NAME] = ERR_BATTERY_NAME_REQUIRED
            else:
                patch[CONF_BATT_NAME] = name
            patch[CONF_BATT_ENERGY_IN] = _optional_entity_id(
                user_input.get(CONF_BATT_ENERGY_IN),
                errors,
                CONF_BATT_ENERGY_IN,
                required=True,
            )
            patch[CONF_BATT_ENERGY_OUT] = _optional_entity_id(
                user_input.get(CONF_BATT_ENERGY_OUT),
                errors,
                CONF_BATT_ENERGY_OUT,
                required=True,
            )
            for field in (
                CONF_BATT_POWER_IN,
                CONF_BATT_POWER_OUT,
                CONF_BATT_POWER_NET,
                CONF_BATT_SOC,
            ):
                patch[field] = _optional_entity_id(user_input.get(field), errors, field)
            if patch.get(CONF_BATT_POWER_NET):
                sign = _normalize_enum(
                    user_input.get(CONF_BATT_POWER_NET_SIGN),
                    default=BATT_SIGN_POSITIVE_DISCHARGE,
                    allowed={
                        BATT_SIGN_POSITIVE_DISCHARGE,
                        BATT_SIGN_POSITIVE_CHARGE,
                    },
                    errors=errors,
                    field=CONF_BATT_POWER_NET_SIGN,
                )
                if sign is not None:
                    patch[CONF_BATT_POWER_NET_SIGN] = sign
            else:
                patch[CONF_BATT_POWER_NET_SIGN] = None

            wants_adv = _normalize_bool(user_input.get(CONF_BATT_ADVANCED))
            patch[CONF_BATT_ADVANCED] = wants_adv
            if wants_adv:
                # Advanced XOR is validated on the separate ``battery_advanced`` step.
                pass
            else:
                for value_key, entity_key, *_rest in _BATTERY_ADVANCED_RULES:
                    patch[value_key] = None
                    patch[entity_key] = None
            return patch, errors

        if scope == "battery_advanced":
            return _validate_battery_advanced(user_input)

        if scope == "offer_options":
            patch, errors = HubEnergieConfigValidator.validate_step(
                "contract",
                {**draft, CONF_SUPPLIER: user_input.get(CONF_SUPPLIER, draft.get(CONF_SUPPLIER))},
                user_input,
            )
            supplier = _normalize_enum(
                user_input.get(CONF_SUPPLIER),
                default=_clean_text(draft.get(CONF_SUPPLIER) or SUPPLIER_EDF),
                allowed=set(SUPPLIER_OPTIONS),
                errors=errors,
                field=CONF_SUPPLIER,
            )
            if supplier is not None:
                patch[CONF_SUPPLIER] = supplier
            custom_name = _clean_optional_text(user_input.get(CONF_SUPPLIER_CUSTOM_NAME))
            patch[CONF_SUPPLIER_CUSTOM_NAME] = custom_name
            return patch, errors

        if scope == "tariff_refresh":
            offer = _normalize_enum(
                user_input.get(CONF_TARIFF_OFFER),
                default=_clean_text(draft.get(CONF_TARIFF_OFFER) or TARIFF_OFFER_OPTIONS[0]),
                allowed=set(TARIFF_OFFER_OPTIONS),
                errors=errors,
                field=CONF_TARIFF_OFFER,
            )
            power = _clean_optional_text(user_input.get(CONF_CONTRACT_POWER))
            if power is None:
                errors[CONF_CONTRACT_POWER] = ERR_REQUIRED
            elif power not in CONTRACT_POWER_OPTIONS:
                errors[CONF_CONTRACT_POWER] = ERR_INVALID_OPTION
            else:
                patch[CONF_CONTRACT_POWER] = power
            if offer is not None:
                patch[CONF_TARIFF_OFFER] = offer
            return patch, errors

        return patch, errors

    @staticmethod
    def validate_full(data: Mapping[str, Any]) -> dict[str, str]:
        """Validate a full data snapshot for broad feature consistency."""
        errors: dict[str, str] = {}

        for field in (
            CONF_SUPPLIER,
            CONF_PHASE_TYPE,
            CONF_TARIFF_MODE,
            CONF_CONTRACT_POWER,
        ):
            if not _clean_optional_text(data.get(field)):
                errors[field] = ERR_REQUIRED

        phase_type = _clean_optional_text(data.get(CONF_PHASE_TYPE))
        tri_energy = _clean_optional_text(data.get(CONF_GRID_TRI_ENERGY_MODE))
        if phase_type == PHASE_TRI and tri_energy == TRI_GRID_ENERGY_PER_PHASE:
            imp = ordered_phase_entity_ids(data.get(CONF_GRID_IMPORT_ENERGY_PHASES))
            if len(imp) != 3:
                errors[CONF_GRID_IMPORT_ENERGY_PHASES] = ERR_TRI_IMPORT_PHASES_INCOMPLETE
            exp_raw = data.get(CONF_GRID_EXPORT_ENERGY_PHASES)
            if exp_raw:
                exp = ordered_phase_entity_ids(exp_raw)
                if len(exp) != 3:
                    errors[CONF_GRID_EXPORT_ENERGY_PHASES] = ERR_TRI_EXPORT_ALL_OR_NONE
        elif not _clean_optional_text(data.get(CONF_GRID_IMPORT_ENERGY)):
            errors[CONF_GRID_IMPORT_ENERGY] = ERR_NO_ENERGY_SENSOR

        if data.get(CONF_HAS_SOLAR):
            solar_required = (
                CONF_SOLAR_ENERGY,
                CONF_SOLAR_RESALE_CONTRACT,
                CONF_SOLAR_ESTIMATION_ENABLED,
            )
            for field in solar_required:
                if field not in data:
                    errors[field] = ERR_REQUIRED
            if data.get(CONF_SOLAR_RESALE_CONTRACT) and data.get(CONF_SOLAR_EXPORT_TARIFF) in (
                None,
                "",
            ):
                errors[CONF_SOLAR_EXPORT_TARIFF] = ERR_REQUIRED
            if data.get(CONF_SOLAR_ESTIMATION_ENABLED):
                for field in (
                    CONF_SOLAR_LOCATION_LAT,
                    CONF_SOLAR_LOCATION_LON,
                    CONF_SOLAR_PEAK_POWER,
                    CONF_SOLAR_ORIENTATION,
                    CONF_SOLAR_TILT_MODE,
                    CONF_SOLAR_SHADING,
                    CONF_SOLAR_PERFORMANCE,
                ):
                    if field not in data:
                        errors[field] = ERR_REQUIRED

        if data.get(CONF_HAS_BATTERIES):
            batteries = data.get(CONF_BATTERY_SYSTEMS)
            if not isinstance(batteries, list) or not batteries:
                errors[CONF_BATTERY_SYSTEMS] = ERR_REQUIRED
            else:
                for index, battery in enumerate(batteries):
                    if not isinstance(battery, dict):
                        errors[CONF_BATTERY_SYSTEMS] = ERR_INVALID_OPTION
                        break
                    for field in (CONF_BATT_NAME, CONF_BATT_ENERGY_IN, CONF_BATT_ENERGY_OUT):
                        if not _clean_optional_text(battery.get(field)):
                            errors[f"{CONF_BATTERY_SYSTEMS}_{index}_{field}"] = ERR_REQUIRED
                    for value_key, entity_key, _min, _max, error_code in _BATTERY_ADVANCED_RULES:
                        if battery.get(value_key) not in (None, "") and _clean_optional_text(
                            battery.get(entity_key)
                        ):
                            errors[f"{CONF_BATTERY_SYSTEMS}_{index}_{value_key}"] = error_code

        if data.get(CONF_TARIFF_MODE) == TARIFF_MODE_AUTO:
            if not _clean_optional_text(data.get(CONF_TARIFF_OFFER)):
                errors[CONF_TARIFF_OFFER] = ERR_REQUIRED
            if (
                data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_OPTIONS[0]
                and data.get(CONF_TEMPO_MODE) == TEMPO_MODE_RTE
            ):
                if not _clean_optional_text(data.get(CONF_RTE_CLIENT_ID)):
                    errors[CONF_RTE_CLIENT_ID] = ERR_REQUIRED
                if not _clean_optional_text(data.get(CONF_RTE_CLIENT_SECRET)):
                    errors[CONF_RTE_CLIENT_SECRET] = ERR_REQUIRED

        if data.get(CONF_TARIFF_MODE) == TARIFF_MODE_MANUAL:
            for field in (CONF_PRICING_STRUCTURE, CONF_PRICE_BASIS, CONF_CURRENCY):
                if not _clean_optional_text(data.get(field)):
                    errors[field] = ERR_REQUIRED

        mode = _clean_optional_text(data.get(CONF_TARIFF_MODE))
        if mode is not None and mode not in {TARIFF_MODE_AUTO, TARIFF_MODE_MANUAL}:
            errors[CONF_TARIFF_MODE] = ERR_INVALID_OPTION
        if data.get(CONF_PRICING_STRUCTURE) == PRICING_FLAT and data.get(CONF_ENERGY_PRICE) in (
            None,
            "",
        ):
            errors[CONF_ENERGY_PRICE] = ERR_REQUIRED
        if data.get(CONF_PRICING_STRUCTURE) == PRICING_TIME_OF_USE and not isinstance(
            data.get(CONF_TOU_PERIODS), list
        ):
            errors[CONF_TOU_PERIODS] = ERR_REQUIRED
        if data.get(CONF_PRICING_STRUCTURE) == PRICING_SCHEDULE and not isinstance(
            data.get(CONF_SCHEDULE_SLOTS), list
        ):
            errors[CONF_SCHEDULE_SLOTS] = ERR_REQUIRED
        _LOGGER.debug(
            "Validation full errors=%s data=%s",
            errors,
            _redact_mapping(data),
        )
        return errors
