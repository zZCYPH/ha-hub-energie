"""Async Home Assistant entity checks for Hub Energie config flows."""

from __future__ import annotations

from typing import Any, Final, Mapping

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.core import HomeAssistant, split_entity_id

from .utils.numbers import normalize_user_number_string

from .const.config_keys import (
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_LOAD_POWER_SENSOR,
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_POWER_SENSOR,
)

ERR_INVALID_ENTITY: Final = "invalid_entity"
ERR_INVALID_ENERGY_ENTITY: Final = "invalid_energy_entity"
ERR_INVALID_POWER_ENTITY: Final = "invalid_power_entity"
ERR_INVALID_SOC_ENTITY: Final = "invalid_soc_entity"
ERR_INVALID_PRICE: Final = "invalid_price"

_PHASE_FIELDS: Final[set[str]] = {
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
}
ENTITY_FIELDS: Final[tuple[tuple[str, str], ...]] = (
    (CONF_GRID_IMPORT_ENERGY, "energy"),
    (CONF_GRID_EXPORT_ENERGY, "energy"),
    (CONF_SOLAR_ENERGY, "energy"),
    (CONF_BATT_ENERGY_IN, "energy"),
    (CONF_BATT_ENERGY_OUT, "energy"),
    (CONF_GRID_POWER_SENSOR, "power"),
    (CONF_LOAD_POWER_SENSOR, "power"),
    (CONF_SOLAR_POWER_SENSOR, "power"),
    (CONF_BATT_POWER_IN, "power"),
    (CONF_BATT_POWER_OUT, "power"),
    (CONF_BATT_POWER_NET, "power"),
    (CONF_BATT_SOC, "soc"),
    (CONF_BATT_SOC_MIN_ENTITY, "soc"),
    (CONF_BATT_SOC_MAX_ENTITY, "soc"),
    (CONF_BATT_CAPACITY_KWH_ENTITY, "numeric"),
    (CONF_BATT_MAX_CHARGE_W_ENTITY, "numeric"),
    (CONF_BATT_MAX_DISCHARGE_W_ENTITY, "numeric"),
)


def _state(hass: HomeAssistant, entity_id: str) -> Any:
    return hass.states.get(entity_id)


def _check_energy_entity(hass: HomeAssistant, entity_id: str) -> str | None:
    state = _state(hass, entity_id)
    if state is None:
        return ERR_INVALID_ENTITY
    state_class = state.attributes.get("state_class")
    if state_class not in ("total_increasing", "total", "measurement"):
        return ERR_INVALID_ENERGY_ENTITY
    return None


def _check_power_entity(hass: HomeAssistant, entity_id: str) -> str | None:
    state = _state(hass, entity_id)
    if state is None:
        return ERR_INVALID_ENTITY
    unit = str(state.attributes.get("unit_of_measurement") or "").lower()
    device_class = state.attributes.get("device_class")
    if unit not in ("w", "kw") and device_class not in (
        SensorDeviceClass.POWER,
        "power",
        None,
    ):
        return ERR_INVALID_POWER_ENTITY
    return None


def _check_soc_entity(hass: HomeAssistant, entity_id: str) -> str | None:
    state = _state(hass, entity_id)
    if state is None:
        return ERR_INVALID_ENTITY
    attrs = state.attributes
    unit = str(
        attrs.get("unit_of_measurement") or attrs.get("native_unit_of_measurement") or ""
    ).strip()
    if unit.lower() in ("%", "percent") or unit.endswith("%"):
        return None
    if split_entity_id(entity_id)[0] == "number":
        try:
            value = float(normalize_user_number_string(str(state.state)))
        except (TypeError, ValueError):
            return ERR_INVALID_PRICE
        return None if 0 <= value <= 100 else ERR_INVALID_SOC_ENTITY
    try:
        float(normalize_user_number_string(str(state.state)))
    except (TypeError, ValueError):
        return ERR_INVALID_SOC_ENTITY
    return None


def _check_numeric_entity(hass: HomeAssistant, entity_id: str) -> str | None:
    state = _state(hass, entity_id)
    if state is None:
        return ERR_INVALID_ENTITY
    domain = split_entity_id(entity_id)[0]
    if domain not in {"sensor", "input_number", "number"}:
        return ERR_INVALID_ENTITY
    try:
        float(normalize_user_number_string(str(state.state)))
    except (TypeError, ValueError):
        return ERR_INVALID_PRICE
    return None


def _phase_entries(
    patch: Mapping[str, Any], field: str
) -> list[dict[str, Any]]:
    value = patch.get(field)
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


async def validate_entities(
    hass: HomeAssistant, patch: Mapping[str, Any]
) -> dict[str, str]:
    """Validate entity existence and runtime characteristics for a patch."""
    errors: dict[str, str] = {}

    for field, kind in ENTITY_FIELDS:
        value = patch.get(field)
        if value in (None, ""):
            continue
        if kind == "energy" and isinstance(value, str):
            error = _check_energy_entity(hass, value)
            if error is not None:
                errors[field] = error
        elif kind == "power" and isinstance(value, str):
            error = _check_power_entity(hass, value)
            if error is not None:
                errors[field] = error
        elif kind == "soc" and isinstance(value, str):
            error = _check_soc_entity(hass, value)
            if error is not None:
                errors[field] = error
        elif kind == "numeric" and isinstance(value, str):
            error = _check_numeric_entity(hass, value)
            if error is not None:
                errors[field] = error

    for field in _PHASE_FIELDS:
        for item in _phase_entries(patch, field):
            entity_id = item.get("entity_id")
            if not isinstance(entity_id, str):
                continue
            checker = _check_power_entity if field == CONF_GRID_POWER_PHASES else _check_energy_entity
            error = checker(hass, entity_id)
            if error is not None:
                errors[field] = error
                break

    return errors
