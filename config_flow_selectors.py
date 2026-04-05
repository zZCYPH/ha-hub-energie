"""Selector builders and default form payloads for Hub Energie flows.

Config-entry flows serialize ``data_schema`` with ``voluptuous_serialize``: avoid
``vol.Any(..., selector)`` (especially with ``""`` / ``None`` branches). Use plain
selectors and rely on ``vol.Optional`` plus validation in ``config_validation``.
"""

from __future__ import annotations

import json
from typing import Final

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import (
    BATT_SIGN_POSITIVE_CHARGE,
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONTRACT_POWER_OPTIONS,
    DAY_TYPE_ALL,
    DAY_TYPE_WEEKDAYS,
    DAY_TYPE_WEEKENDS,
    GRID_POWER_SIGN_OPTIONS,
    PHASE_OPTIONS,
    PRICE_BASIS_OPTIONS,
    PRICING_FLAT,
    PRICING_SCHEDULE,
    PRICING_TIME_OF_USE,
    SOLAR_PERF_OPTIONS,
    SOLAR_SHADING_OPTIONS,
    SOLAR_TILT_AUTO,
    SOLAR_TILT_MANUAL,
    SUPPLIER_EDF,
    SUPPLIER_OTHER,
    TARIFF_MODE_AUTO,
    TARIFF_MODE_MANUAL,
    TARIFF_OFFER_OPTIONS,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
)

_ENTITY_DOMAINS_NUMERIC: Final[list[str]] = ["sensor", "input_number", "number"]


def energy_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain=["sensor"],
            device_class=SensorDeviceClass.ENERGY,
            multiple=False,
        )
    )


def power_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain=["sensor"],
            device_class=SensorDeviceClass.POWER,
            multiple=False,
        )
    )


def soc_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain=_ENTITY_DOMAINS_NUMERIC, multiple=False)
    )


def optional_energy_entity() -> EntitySelector:
    """Use with ``vol.Optional``; do not wrap in ``vol.Any(None, ...)`` (see module doc patterns)."""
    return energy_entity_selector()


def optional_power_entity() -> EntitySelector:
    return power_entity_selector()


def optional_soc_entity() -> EntitySelector:
    return soc_entity_selector()


def optional_number_entity() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain=_ENTITY_DOMAINS_NUMERIC, multiple=False)
    )


def optional_number_entity_or_empty() -> EntitySelector:
    """Numeric entity picker for battery advanced XOR fields.

    Do not wrap ``EntitySelector`` in ``vol.Any(..., "", ...)``: Home Assistant cannot
    serialize that shape for the config-flow API (voluptuous_serialize raises).
    A cleared picker sends ``""``, which validation treats as unset.
    """
    return optional_number_entity()


class OptionalEmptyTextSelector(TextSelector):
    """Like ``TextSelector`` but accepts ``null`` and JSON numbers from the frontend.

    Optional XOR manual fields are stored as floats in config; the UI may POST a number
    while ``TextSelector`` only accepts ``str`` (*expected str*). Empty entity-only rows
    often POST ``null`` for the manual key — also treated as empty string.
    """

    def __call__(self, data: Any) -> str:
        if data is None:
            return ""
        if type(data) in (int, float):
            return super().__call__(str(data))
        return super().__call__(data)


def optional_manual_kwh_selector() -> OptionalEmptyTextSelector:
    """Manual kWh text field; xor with entity. See ``OptionalEmptyTextSelector``."""
    return OptionalEmptyTextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))


def optional_manual_power_w_selector() -> OptionalEmptyTextSelector:
    return OptionalEmptyTextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))


def optional_manual_percent_selector() -> OptionalEmptyTextSelector:
    return OptionalEmptyTextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))


def optional_percentage_entity() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain=_ENTITY_DOMAINS_NUMERIC, multiple=False)
    )


def optional_percentage_entity_or_empty() -> EntitySelector:
    """Percentage entity picker for battery advanced XOR fields (see ``optional_number_entity_or_empty``)."""
    return optional_percentage_entity()


def supplier_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=SUPPLIER_EDF, label="EDF"),
                SelectOptionDict(value=SUPPLIER_OTHER, label="Other supplier"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def phase_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=value, label=value.capitalize())
                for value in PHASE_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def tariff_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=TARIFF_MODE_AUTO, label="Automatic (provider API)"),
                SelectOptionDict(value=TARIFF_MODE_MANUAL, label="Manual"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def contract_power_selector_edf() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=value, label=f"{value} kVA")
                for value in CONTRACT_POWER_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def contract_power_selector_other() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=1,
            max=120,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement="kVA",
        )
    )


def offer_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=value, label=value.upper())
                for value in TARIFF_OFFER_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def schedule_day_type_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=DAY_TYPE_ALL, label="All days"),
                SelectOptionDict(value=DAY_TYPE_WEEKDAYS, label="Weekdays"),
                SelectOptionDict(value=DAY_TYPE_WEEKENDS, label="Weekends"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def time_slot_selector() -> TextSelector:
    return TextSelector(TextSelectorConfig(type=TextSelectorType.TIME))


def pricing_structure_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=PRICING_FLAT, label="Flat"),
                SelectOptionDict(value=PRICING_TIME_OF_USE, label="Time of use"),
                SelectOptionDict(value=PRICING_SCHEDULE, label="Advanced schedule"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def price_basis_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[SelectOptionDict(value=value, label=value) for value in PRICE_BASIS_OPTIONS],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def grid_power_sign_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[SelectOptionDict(value=value, label=value) for value in GRID_POWER_SIGN_OPTIONS],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def tempo_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=TEMPO_MODE_RTE, label="RTE"),
                SelectOptionDict(value=TEMPO_MODE_API, label="API Couleur Tempo"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def solar_shading_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=value, label=value.capitalize())
                for value in SOLAR_SHADING_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def solar_performance_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=value, label=value.capitalize())
                for value in SOLAR_PERF_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def solar_tilt_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=SOLAR_TILT_AUTO, label="Auto"),
                SelectOptionDict(value=SOLAR_TILT_MANUAL, label="Manual"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def batt_net_sign_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(
                    value=BATT_SIGN_POSITIVE_DISCHARGE,
                    label="Positive = discharge",
                ),
                SelectOptionDict(
                    value=BATT_SIGN_POSITIVE_CHARGE,
                    label="Positive = charge",
                ),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def text_selector(*, multiline: bool = False, password: bool = False) -> TextSelector:
    selector_type = TextSelectorType.PASSWORD if password else TextSelectorType.TEXT
    return TextSelector(
        TextSelectorConfig(type=selector_type, multiline=multiline)
    )


def default_tou_json() -> str:
    return json.dumps(
        [
            {"name": "HC", "price": 0.1296, "start": "22:00", "end": "06:00"},
            {"name": "HP", "price": 0.1609, "start": "06:00", "end": "22:00"},
        ],
        indent=2,
    )


def default_schedule_json() -> str:
    return json.dumps(
        [
            {
                "start": "00:00",
                "end": "06:00",
                "price": 0.12,
                "day_type": "all",
                "name": "Night",
            },
            {
                "start": "06:00",
                "end": "22:00",
                "price": 0.18,
                "day_type": "weekdays",
                "name": "Weekday",
            },
            {
                "start": "06:00",
                "end": "22:00",
                "price": 0.15,
                "day_type": "weekends",
                "name": "Weekend",
            },
            {
                "start": "22:00",
                "end": "00:00",
                "price": 0.12,
                "day_type": "all",
                "name": "Evening",
            },
        ],
        indent=2,
    )


def default_phase_json() -> str:
    return json.dumps(
        [
            {"phase": 1, "entity_id": ""},
            {"phase": 2, "entity_id": ""},
            {"phase": 3, "entity_id": ""},
        ],
        indent=2,
    )
