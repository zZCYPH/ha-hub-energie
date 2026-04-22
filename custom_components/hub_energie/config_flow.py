"""Config flow for Hub Energie."""

from __future__ import annotations

import json
import logging
import math
import uuid
from typing import Any, Final, Mapping

import voluptuous as vol
from aiohttp import ClientError

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import AbortFlow, section
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .config_entity_checks import validate_entities
from .utils.redaction import redact_sensitive_mapping
from .config_flow_selectors import (
    batt_net_sign_selector,
    contract_power_selector_edf,
    contract_power_selector_other,
    default_phase_json,
    default_schedule_json,
    energy_entity_selector,
    flow_nav_selector,
    grid_power_sign_selector,
    offer_selector,
    optional_energy_entity,
    optional_manual_kwh_selector,
    optional_manual_percent_selector,
    optional_manual_power_w_selector,
    optional_number_entity_or_empty,
    optional_percentage_entity_or_empty,
    optional_power_entity,
    optional_soc_entity,
    phase_selector,
    tri_grid_energy_mode_selector,
    tri_grid_sensor_layout_selector,
    price_basis_selector,
    pricing_structure_selector,
    schedule_day_type_selector,
    solar_performance_selector,
    solar_shading_selector,
    solar_tilt_mode_selector,
    supplier_selector,
    tariff_mode_selector,
    tempo_mode_selector,
    text_selector,
    time_slot_selector,
)
from .config_models import BATTERY_ID
from .config_validation import (
    ERR_RTE_CREDS_REQUIRED,
    ERR_TARIFF_PAYLOAD_INCOMPLETE,
    HubEnergieConfigValidator,
    _SOLAR_CLEAR_KEYS,
)
from .providers.edf import tariff_payload_completeness_issues
from .utils.grid_phases import ordered_phase_entity_ids
from .const import (
    BATT_SIGN_POSITIVE_DISCHARGE,
    CONF_BATTERY_SYSTEMS,
    CONF_BATT_ADVANCED,
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_BATT_MAX_CHARGE_W,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATT_NAME,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_NET_SIGN,
    CONF_BATT_POWER_OUT,
    CONF_BATT_REMOVE_SELECTED,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_CONTRACT_NAME,
    CONF_CONTRACT_POWER,
    CONF_CURRENCY,
    CONF_ENERGY_PRICE,
    CONF_FLOW_NAV,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_POWER_SIGN_MODE,
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_GRID_TRI_SENSOR_LAYOUT,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    CONF_TRI_EXPORT_ENERGY_P1,
    CONF_TRI_EXPORT_ENERGY_P2,
    CONF_TRI_EXPORT_ENERGY_P3,
    CONF_TRI_GRID_POWER_P1,
    CONF_TRI_GRID_POWER_P2,
    CONF_TRI_GRID_POWER_P3,
    CONF_TRI_IMPORT_ENERGY_P1,
    CONF_TRI_IMPORT_ENERGY_P2,
    CONF_TRI_IMPORT_ENERGY_P3,
    CONF_TRI_PHASE_STEP_EXPORT_ENERGY,
    CONF_TRI_PHASE_STEP_GRID_POWER,
    CONF_TRI_PHASE_STEP_IMPORT_ENERGY,
    CONF_PRICE_BASIS,
    CONF_PRICING_STRUCTURE,
    CONF_RTE_CLIENT_ID,
    CONF_RTE_CLIENT_SECRET,
    CONF_SCHEDULE_SLOTS,
    DAY_TYPE_ALL,
    DEFAULT_MAX_DELTA_KWH_BATTERY,
    DEFAULT_MAX_DELTA_KWH_GRID,
    DEFAULT_MAX_DELTA_KWH_SOLAR,
    DELTA_CAP_KWH_MAX,
    DELTA_CAP_KWH_MIN,
    FLOW_NAV_BACK,
    FLOW_NAV_CONTINUE,
    SCHEDULE_FORM_MAX_SLOTS,
    SCHEDULE_FORM_SECTION_PREFIX,
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
    TOU_FORM_MAX_SLOTS,
    TOU_FORM_SECTION_PREFIX,
    DOMAIN,
    documentation_config_step_help_url,
    documentation_options_step_help_url,
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    MAX_DELTA_KWH_DEFAULT,
    GRID_TRI_DETAIL_KEYS,
    OPT_ABONNEMENT,
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_FIXED_TTC,
    OPT_MAX_DELTA_KWH_BATTERY,
    OPT_MAX_DELTA_KWH_GRID,
    OPT_MAX_DELTA_KWH_OTHER,
    OPT_MAX_DELTA_KWH_SOLAR,
    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
    OPT_REINJECTION_EXPORT_MIN_ABS_W,
    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
    REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
    REINJECTION_BATT_FULL_MIN_SOC_FRAC,
    REINJECTION_EXPORT_IGNORE_BELOW_W,
    REINJECTION_EXPORT_MIN_ABS_W,
    REINJECTION_EXPORT_VS_SOLAR_FRACTION,
    REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
    REINJECTION_OPTION_KEYS,
    REINJECTION_SHORT_EXPORT_MAX_S,
    REINJECTION_SHORT_EXPORT_MAX_W,
    REINJECTION_UI_DURATION_S_MAX,
    REINJECTION_UI_POWER_W_MAX,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_TARIFF_FETCHED_AT,
    PHASE_MONO,
    PHASE_TRI,
    TRI_GRID_ENERGY_PER_PHASE,
    TRI_GRID_ENERGY_SINGLE,
    TRI_GRID_SENSOR_PER_PHASE,
    TRI_GRID_SENSOR_TOTAL,
    PRICE_BASIS_TTC,
    PRICING_FLAT,
    PRICING_TIME_OF_USE,
    SOLAR_PERF_STANDARD,
    SOLAR_SHADING_NONE,
    SOLAR_TILT_AUTO,
    SUPPLIER_EDF,
    SUPPLIER_OTHER,
    TARIFF_MODE_AUTO,
    TARIFF_MODE_MANUAL,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_RTE,
)

_LOGGER = logging.getLogger(__name__)
_MISSING: Final = object()
_BATTERY_ADV_KEYS: Final[tuple[str, ...]] = (
    CONF_BATT_CAPACITY_KWH,
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_MAX_CHARGE_W,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MAX_ENTITY,
)
# (entity_key, manual_key) — same order as config_validation._BATTERY_ADVANCED_RULES
_BATTERY_ADV_XOR_PAIRS: Final[
    tuple[tuple[str, str], ...]
] = (
    (CONF_BATT_CAPACITY_KWH_ENTITY, CONF_BATT_CAPACITY_KWH),
    (CONF_BATT_MAX_CHARGE_W_ENTITY, CONF_BATT_MAX_CHARGE_W),
    (CONF_BATT_MAX_DISCHARGE_W_ENTITY, CONF_BATT_MAX_DISCHARGE_W),
    (CONF_BATT_SOC_MIN_ENTITY, CONF_BATT_SOC_MIN),
    (CONF_BATT_SOC_MAX_ENTITY, CONF_BATT_SOC_MAX),
)
_BATTERY_ADV_FORM_KEYS: Final[tuple[str, ...]] = tuple(
    k for pair in _BATTERY_ADV_XOR_PAIRS for k in pair
)

_GRID_TRI_PER_PHASE_SIGN_SECTION: Final = "tri_grid_sign"
_GRID_TRI_PER_PHASE_LOAD_SECTION: Final = "tri_phase_load"
_GRID_TRI_PER_PHASE_PHASE_SPECS: Final[
    tuple[tuple[str, str, str, str], ...]
] = (
    ("tri_phase_l1", CONF_TRI_IMPORT_ENERGY_P1, CONF_TRI_EXPORT_ENERGY_P1, CONF_TRI_GRID_POWER_P1),
    ("tri_phase_l2", CONF_TRI_IMPORT_ENERGY_P2, CONF_TRI_EXPORT_ENERGY_P2, CONF_TRI_GRID_POWER_P2),
    ("tri_phase_l3", CONF_TRI_IMPORT_ENERGY_P3, CONF_TRI_EXPORT_ENERGY_P3, CONF_TRI_GRID_POWER_P3),
)
_GRID_TRI_PER_PHASE_SECTION_KEYS: Final[frozenset[str]] = frozenset(
    (
        _GRID_TRI_PER_PHASE_SIGN_SECTION,
        _GRID_TRI_PER_PHASE_LOAD_SECTION,
        *(spec[0] for spec in _GRID_TRI_PER_PHASE_PHASE_SPECS),
    )
)


def _flatten_grid_tri_per_phase_user_input(user_input: dict[str, Any]) -> dict[str, Any]:
    """HA ``section()`` nests fields; validation still expects a flat mapping."""
    if not user_input:
        return user_input
    out: dict[str, Any] = {}
    for k, v in user_input.items():
        if k in _GRID_TRI_PER_PHASE_SECTION_KEYS and isinstance(v, dict):
            out.update(v)
        else:
            out[k] = v
    return out


def _redact_user_input(value: Any) -> Any:
    if not isinstance(value, dict):
        return value
    return redact_sensitive_mapping(value)


def _strip_flow_nav(user_input: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in user_input.items() if k != CONF_FLOW_NAV}


def _vol_schema_to_dict(schema: vol.Schema) -> dict[Any, Any]:
    """Copy a dict-shaped ``vol.Schema`` mapping (keys may be markers or plain strings)."""
    for attr in ("schema", "_schema"):
        raw = getattr(schema, attr, None)
        if isinstance(raw, dict):
            return dict(raw)
    raise TypeError("Expected a dict-based voluptuous Schema")


def _vol_schema_extra(schema: vol.Schema) -> int:
    ex = getattr(schema, "extra", None)
    if ex is not None:
        return int(ex)
    return int(getattr(schema, "_extra", vol.PREVENT_EXTRA))


def _wrap_setup_wizard_schema(flow: object, schema: vol.Schema) -> vol.Schema:
    """Always include ``flow_nav`` with a default so HA validation accepts missing keys from the UI.

    Do not wrap in ``vol.Any``: ``voluptuous_serialize`` cannot convert that for the config-flow JSON API.

    * First setup step: only *Continue* is offered (no *Back*).
    * After at least one forward navigation: *Back* is offered; other fields use schema defaults when omitted.
    """
    nav_stack = getattr(flow, "_nav_stack", None)
    if not isinstance(nav_stack, list):
        nav_stack = []
    allow_back = bool(nav_stack)
    d = _vol_schema_to_dict(schema)
    hass = getattr(flow, "hass", None)
    d[vol.Required(CONF_FLOW_NAV, default=FLOW_NAV_CONTINUE)] = flow_nav_selector(hass, allow_back=allow_back)
    return vol.Schema(d, extra=_vol_schema_extra(schema))


async def _wizard_nav_forward(flow: object, from_step: str, coroutine: Any) -> ConfigFlowResult:
    nav = getattr(flow, "_nav_stack", None)
    if isinstance(nav, list):
        nav.append(from_step)
    return await coroutine


class _StepLoggingMixin:
    """Log config flow step inputs, outputs, and uncaught exceptions (ERROR + traceback)."""

    def __getattribute__(self, name: str):  # noqa: ANN001
        attr = super().__getattribute__(name)
        if not name.startswith("async_step_") or not callable(attr):
            return attr
        cache = super().__getattribute__("__dict__").setdefault("_ha_step_log_wrappers", {})
        if name in cache:
            return cache[name]

        async def _wrapped(*args, **kwargs):  # noqa: ANN202
            user_input = args[0] if args else kwargs.get("user_input")
            _LOGGER.debug(
                "[flow] enter %s.%s user_input=%s",
                self.__class__.__name__,
                name,
                _redact_user_input(user_input),
            )
            try:
                result = await attr(*args, **kwargs)
            except AbortFlow:
                raise
            except Exception:
                # HA often turns these into HTTP 400 with little detail; this gives a full traceback.
                _LOGGER.exception(
                    "◆ HUB_ENERGIE CONFIG_FLOW ◆ uncaught exception in %s.%s (user_input=%s)",
                    self.__class__.__name__,
                    name,
                    _redact_user_input(user_input),
                )
                raise
            step_id = result.get("step_id") if isinstance(result, dict) else None
            result_type = result.get("type") if isinstance(result, dict) else type(result).__name__
            _LOGGER.debug(
                "[flow] exit  %s.%s type=%s step_id=%s",
                self.__class__.__name__,
                name,
                result_type,
                step_id,
            )
            return result

        cache[name] = _wrapped
        return _wrapped


def _solar_options_entry_patch(merged: Mapping[str, Any]) -> dict[str, Any]:
    """Keys written when saving solar from the options flow (has_solar + all solar fields)."""
    keys = (CONF_HAS_SOLAR, *_SOLAR_CLEAR_KEYS)
    return {k: merged.get(k) for k in keys}


def _apply_patch(target: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    for key, value in patch.items():
        if value is None:
            target.pop(key, None)
        else:
            target[key] = value
    return target


def _patched_copy(source: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    return _apply_patch(dict(source), patch)


def _add_optional(
    schema: dict[Any, Any], key: str, selector: Any, default: Any = _MISSING
) -> None:
    if default is _MISSING or default is None:
        schema[vol.Optional(key)] = selector
        return
    schema[vol.Optional(key, default=default)] = selector


def _wizard_step_energy_entity(key: str, stored: Any) -> dict[Any, Any]:
    """Energy entity optional in Voluptuous so *Back* can submit without filling the picker.

    HA validates ``data_schema`` before ``async_step_*``; ``vol.Required`` would block that.
    Step validators (``validate_step`` for ``grid``, ``grid_tri_per_phase``, ``solar_config``)
    still require the entity when continuing forward.
    """
    if isinstance(stored, str) and stored.strip():
        return {vol.Optional(key, default=stored.strip()): energy_entity_selector()}
    return {vol.Optional(key): energy_entity_selector()}


def _battery_add_form_energy_entity(key: str, stored: Any) -> dict[Any, Any]:
    """Energy pickers are Optional in the Voluptuous schema so HA does not reject stray payloads.

    (e.g. ``{has_batteries: true}`` submitted while ``cur_step`` is still ``battery_add`` after a duplicate
    request or UI refresh). Required fields are still enforced in ``HubEnergieConfigValidator`` (``battery_add``).
    """
    if isinstance(stored, str) and stored.strip():
        return {vol.Optional(key, default=stored): energy_entity_selector()}
    return {vol.Optional(key): energy_entity_selector()}


def _json_default(value: Any, fallback: str) -> str:
    if isinstance(value, list):
        return json.dumps(value, indent=2)
    return fallback


def _schedule_form_defaults_from_slots(slots: Any) -> dict[str, Any]:
    """Defaults for ``sched_r{i}_*`` keys from stored ``CONF_SCHEDULE_SLOTS`` list."""
    out: dict[str, Any] = {}
    data = slots if isinstance(slots, list) else []
    for i in range(SCHEDULE_FORM_MAX_SLOTS):
        p = f"sched_r{i}_"
        if i < len(data) and isinstance(data[i], dict):
            item = data[i]
            out[f"{p}start"] = str(item.get("start") or "")
            out[f"{p}end"] = str(item.get("end") or "")
            out[f"{p}price"] = float(item.get("price") or 0.0)
            out[f"{p}day_type"] = str(item.get("day_type") or DAY_TYPE_ALL)
            out[f"{p}name"] = str(item.get("name") or "")
        else:
            out[f"{p}start"] = ""
            out[f"{p}end"] = ""
            out[f"{p}price"] = 0.0
            out[f"{p}day_type"] = DAY_TYPE_ALL
            out[f"{p}name"] = ""
    return out


def _tou_form_defaults_from_periods(periods: Any) -> dict[str, Any]:
    """Defaults for ``tou_r{i}_*`` from ``CONF_TOU_PERIODS`` or built-in HP/HC example."""
    fallback_rows = (
        {"start": "22:00", "end": "06:00", "price": 0.1296},
        {"start": "06:00", "end": "22:00", "price": 0.1609},
    )
    data = periods if isinstance(periods, list) else []
    out: dict[str, Any] = {}
    for i in range(TOU_FORM_MAX_SLOTS):
        p = f"tou_r{i}_"
        fb = fallback_rows[i]
        if i < len(data) and isinstance(data[i], dict):
            item = data[i]
            out[f"{p}start"] = str(item.get("start") or fb["start"])
            out[f"{p}end"] = str(item.get("end") or fb["end"])
            try:
                out[f"{p}price"] = float(item.get("price", fb["price"]))
            except (TypeError, ValueError):
                out[f"{p}price"] = fb["price"]
        else:
            out[f"{p}start"] = fb["start"]
            out[f"{p}end"] = fb["end"]
            out[f"{p}price"] = fb["price"]
    return out


def _subscription_price_uom(hass: HomeAssistant, currency: str) -> str:
    """Suffix for monthly subscription number fields (not translated by strings.json)."""
    lang = (getattr(hass.config, "language", None) or "").lower()
    if lang.startswith("fr"):
        return f"{currency}/mois"
    return f"{currency}/month"


def _manual_tou_form_schema(
    hass: HomeAssistant,
    draft: dict[str, Any],
    currency: str,
    *,
    setup_flow: object | None = None,
) -> vol.Schema:
    dfn = _tou_form_defaults_from_periods(draft.get(CONF_TOU_PERIODS))
    fields: dict[Any, Any] = {}
    for i in range(TOU_FORM_MAX_SLOTS):
        p = f"tou_r{i}_"
        inner: dict[Any, Any] = {
            vol.Optional(f"{p}start", default=dfn[f"{p}start"]): time_slot_selector(),
            vol.Optional(f"{p}end", default=dfn[f"{p}end"]): time_slot_selector(),
            vol.Optional(f"{p}price", default=dfn[f"{p}price"]): NumberSelector(
                NumberSelectorConfig(
                    min=0,
                    max=5,
                    step=0.01,
                    mode=NumberSelectorMode.BOX,
                    unit_of_measurement=f"{currency}/kWh",
                )
            ),
        }
        fields[vol.Required(f"{TOU_FORM_SECTION_PREFIX}{i}")] = section(
            vol.Schema(inner),
            {"collapsed": False},
        )
    fields[vol.Optional(CONF_SUBSCRIPTION_PRICE, default=draft.get(CONF_SUBSCRIPTION_PRICE, 0.0))] = NumberSelector(
        NumberSelectorConfig(
            min=0,
            max=1000,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement=_subscription_price_uom(hass, currency),
        )
    )
    nav_stack = getattr(setup_flow, "_nav_stack", None) if setup_flow is not None else None
    if isinstance(nav_stack, list) and nav_stack:
        fields[vol.Required(CONF_FLOW_NAV, default=FLOW_NAV_CONTINUE)] = flow_nav_selector(hass, allow_back=True)
    return vol.Schema(fields)


def _manual_schedule_form_schema(
    hass: HomeAssistant,
    draft: dict[str, Any],
    currency: str,
    *,
    setup_flow: object | None = None,
) -> vol.Schema:
    dfn = _schedule_form_defaults_from_slots(draft.get(CONF_SCHEDULE_SLOTS))
    fields: dict[Any, Any] = {}
    for i in range(SCHEDULE_FORM_MAX_SLOTS):
        p = f"sched_r{i}_"
        inner: dict[Any, Any] = {
            vol.Optional(f"{p}start", default=dfn[f"{p}start"]): time_slot_selector(),
            vol.Optional(f"{p}end", default=dfn[f"{p}end"]): time_slot_selector(),
            vol.Optional(f"{p}price", default=dfn[f"{p}price"]): NumberSelector(
                NumberSelectorConfig(
                    min=0,
                    max=5,
                    step=0.01,
                    mode=NumberSelectorMode.BOX,
                    unit_of_measurement=f"{currency}/kWh",
                )
            ),
            vol.Optional(f"{p}day_type", default=dfn[f"{p}day_type"]): schedule_day_type_selector(),
            vol.Optional(f"{p}name", default=dfn[f"{p}name"]): text_selector(),
        }
        fields[vol.Required(f"{SCHEDULE_FORM_SECTION_PREFIX}{i}")] = section(
            vol.Schema(inner),
            {"collapsed": False},
        )
    fields[vol.Optional(CONF_SUBSCRIPTION_PRICE, default=draft.get(CONF_SUBSCRIPTION_PRICE, 0.0))] = NumberSelector(
        NumberSelectorConfig(
            min=0,
            max=1000,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement=_subscription_price_uom(hass, currency),
        )
    )
    nav_stack = getattr(setup_flow, "_nav_stack", None) if setup_flow is not None else None
    if isinstance(nav_stack, list) and nav_stack:
        fields[vol.Required(CONF_FLOW_NAV, default=FLOW_NAV_CONTINUE)] = flow_nav_selector(hass, allow_back=True)
    return vol.Schema(fields)


async def _async_validate_step(
    hass: HomeAssistant,
    scope: str,
    draft: dict[str, Any],
    user_input: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, str]]:
    merged = {**draft, **user_input}
    patch, errors = HubEnergieConfigValidator.validate_step(scope, merged, user_input)
    _LOGGER.debug("Step %s patch=%s errors=%s", scope, _redact_user_input(patch), errors)
    if errors:
        return patch, errors
    entity_errors = await validate_entities(hass, patch)
    errors.update(entity_errors)
    return patch, errors


def _validate_step(
    scope: str,
    draft: dict[str, Any],
    user_input: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, str]]:
    merged = {**draft, **user_input}
    patch, errors = HubEnergieConfigValidator.validate_step(scope, merged, user_input)
    _LOGGER.debug("Step %s patch=%s errors=%s", scope, _redact_user_input(patch), errors)
    return patch, errors


async def _async_test_rte_credentials(
    hass: HomeAssistant, client_id: str, client_secret: str
) -> str | None:
    session = async_get_clientsession(hass)
    try:
        from .providers.edf import async_test_rte_credentials

        await async_test_rte_credentials(session, client_id, client_secret)
    except (ClientError, TimeoutError, ValueError) as err:
        _LOGGER.warning("RTE credential test failed: %s", err)
        return "rte_auth_failed"
    return None


async def _async_fetch_edf_tariffs(
    hass: HomeAssistant, offer: str, power: str
) -> tuple[dict[str, Any] | None, str | None]:
    session = async_get_clientsession(hass)
    try:
        from .providers.edf import async_fetch_offer_tariffs

        tariffs = await async_fetch_offer_tariffs(session, offer, power)
    except (ClientError, TimeoutError, ValueError, ImportError) as err:
        _LOGGER.warning(
            "EDF tariff fetch failed (offer=%s, %s kVA): %s",
            offer,
            power,
            err,
        )
        return None, "tariff_fetch_failed"
    return tariffs, None


def _tariff_options_from_payload(
    tariffs: dict[str, Any],
    *,
    expected_offer: str | None = None,
) -> dict[str, Any] | None:
    exp = (expected_offer or "").strip() or None
    issues = tariff_payload_completeness_issues(tariffs, expected_offer=exp)
    if issues:
        _LOGGER.warning(
            "EDF tariff payload incomplete or invalid; not merging tariff options (issues=%s)",
            issues,
        )
        return None
    return {
        OPT_BLEU_HC: float(tariffs["hc_bleu_ttc"]),
        OPT_BLEU_HP: float(tariffs["hp_bleu_ttc"]),
        OPT_BLANC_HC: float(tariffs["hc_blanc_ttc"]),
        OPT_BLANC_HP: float(tariffs["hp_blanc_ttc"]),
        OPT_ROUGE_HC: float(tariffs["hc_rouge_ttc"]),
        OPT_ROUGE_HP: float(tariffs["hp_rouge_ttc"]),
        OPT_FIXED_TTC: float(tariffs["fixed_ttc"]),
        OPT_ABONNEMENT: 0,
        OPT_TARIFF_FETCHED_AT: tariffs["fetched_at"],
    }


def _show_net_sign(user_input: dict[str, Any] | None, battery: dict[str, Any]) -> bool:
    return bool((user_input or {}).get(CONF_BATT_POWER_NET) or battery.get(CONF_BATT_POWER_NET))


def _wants_advanced(battery: dict[str, Any]) -> bool:
    return any(key in battery for key in _BATTERY_ADV_KEYS)


def _battery_advanced_toggle_default(battery: dict[str, Any]) -> bool:
    """Default for the advanced toggle when opening ``battery_add``."""
    if CONF_BATT_ADVANCED in battery:
        return bool(battery[CONF_BATT_ADVANCED])
    return _wants_advanced(battery)


def _battery_add_schema(
    battery: dict[str, Any],
    *,
    number: int,
    user_input: dict[str, Any] | None = None,
) -> vol.Schema:
    schema: dict[Any, Any] = {
        vol.Required(CONF_BATT_NAME, default=battery.get(CONF_BATT_NAME, f"Battery {number}")): text_selector(),
    }
    schema.update(_battery_add_form_energy_entity(CONF_BATT_ENERGY_IN, battery.get(CONF_BATT_ENERGY_IN)))
    schema.update(_battery_add_form_energy_entity(CONF_BATT_ENERGY_OUT, battery.get(CONF_BATT_ENERGY_OUT)))
    _add_optional(schema, CONF_BATT_POWER_IN, optional_power_entity(), battery.get(CONF_BATT_POWER_IN))
    _add_optional(schema, CONF_BATT_POWER_OUT, optional_power_entity(), battery.get(CONF_BATT_POWER_OUT))
    _add_optional(schema, CONF_BATT_POWER_NET, optional_power_entity(), battery.get(CONF_BATT_POWER_NET))
    if _show_net_sign(user_input, battery):
        _add_optional(
            schema,
            CONF_BATT_POWER_NET_SIGN,
            batt_net_sign_selector(),
            battery.get(CONF_BATT_POWER_NET_SIGN, BATT_SIGN_POSITIVE_DISCHARGE),
        )
    _add_optional(schema, CONF_BATT_SOC, optional_soc_entity(), battery.get(CONF_BATT_SOC))
    schema[vol.Optional(CONF_BATT_ADVANCED, default=_battery_advanced_toggle_default(battery))] = BooleanSelector()
    # Absorb stray keys (e.g. has_batteries) if the UI step and in-memory schema diverge.
    return vol.Schema(schema, extra=vol.ALLOW_EXTRA)


def _manual_xor_default(battery: dict[str, Any], key: str) -> str:
    """String default for manual XOR rows (TextSelector / JSON text field)."""
    v = battery.get(key)
    if v is None:
        return ""
    if type(v) in (int, float):
        return str(v)
    return str(v)


def _battery_advanced_base_schema() -> vol.Schema:
    """XOR fields without ``vol.Optional`` defaults (cleared entity pickers must stay empty)."""
    return vol.Schema(
        {
            vol.Optional(CONF_BATT_CAPACITY_KWH_ENTITY): optional_number_entity_or_empty(),
            vol.Optional(CONF_BATT_CAPACITY_KWH): optional_manual_kwh_selector(),
            vol.Optional(CONF_BATT_MAX_CHARGE_W_ENTITY): optional_number_entity_or_empty(),
            vol.Optional(CONF_BATT_MAX_CHARGE_W): optional_manual_power_w_selector(),
            vol.Optional(CONF_BATT_MAX_DISCHARGE_W_ENTITY): optional_number_entity_or_empty(),
            vol.Optional(CONF_BATT_MAX_DISCHARGE_W): optional_manual_power_w_selector(),
            vol.Optional(CONF_BATT_SOC_MIN_ENTITY): optional_percentage_entity_or_empty(),
            vol.Optional(CONF_BATT_SOC_MIN): optional_manual_percent_selector(),
            vol.Optional(CONF_BATT_SOC_MAX_ENTITY): optional_percentage_entity_or_empty(),
            vol.Optional(CONF_BATT_SOC_MAX): optional_manual_percent_selector(),
        },
        extra=vol.ALLOW_EXTRA,
    )


def _battery_advanced_suggested_values(battery: dict[str, Any]) -> dict[str, Any]:
    """Pre-fill the advanced battery form from in-memory / saved battery dict."""
    suggested: dict[str, Any] = {}
    for entity_key, manual_key in _BATTERY_ADV_XOR_PAIRS:
        raw_e = battery.get(entity_key)
        if isinstance(raw_e, str) and raw_e.strip():
            suggested[entity_key] = raw_e.strip()
        if battery.get(manual_key) not in (None, ""):
            suggested[manual_key] = _manual_xor_default(battery, manual_key)
    return suggested


def _battery_advanced_data_schema(
    flow: ConfigFlow | OptionsFlow,
    battery: dict[str, Any],
    user_input: dict[str, Any] | None = None,
) -> vol.Schema:
    """Schema with suggested values only (no vol defaults) so clearing an entity is not re-filled."""
    suggested = _battery_advanced_suggested_values(battery)
    if user_input:
        for key in _BATTERY_ADV_FORM_KEYS:
            if key in user_input:
                suggested[key] = user_input[key]
    return flow.add_suggested_values_to_schema(
        _battery_advanced_base_schema(), suggested
    )


def _coerce_select_bool(value: Any) -> bool:
    """Parse values from ``yes_no_dropdown_selector`` (string options or legacy bool)."""
    if isinstance(value, bool):
        return value
    if value in (None, ""):
        return False
    return str(value).strip().lower() in ("true", "1", "yes", "on")


def _grid_schema(data: dict[str, Any]) -> vol.Schema:
    schema: dict[Any, Any] = {
        vol.Required(CONF_GRID_POWER_SIGN_MODE, default=data.get(CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE)): grid_power_sign_selector(),
    }
    schema.update(_wizard_step_energy_entity(CONF_GRID_IMPORT_ENERGY, data.get(CONF_GRID_IMPORT_ENERGY)))
    _add_optional(schema, CONF_GRID_EXPORT_ENERGY, optional_energy_entity(), data.get(CONF_GRID_EXPORT_ENERGY))
    _add_optional(schema, CONF_GRID_POWER_SENSOR, optional_power_entity(), data.get(CONF_GRID_POWER_SENSOR))
    _add_optional(schema, CONF_LOAD_POWER_SENSOR, optional_power_entity(), data.get(CONF_LOAD_POWER_SENSOR))
    return vol.Schema(schema)


def _grid_phases_schema(data: dict[str, Any]) -> vol.Schema:
    schema: dict[Any, Any] = {}
    _add_optional(schema, CONF_GRID_IMPORT_ENERGY_PHASES, text_selector(multiline=True), _json_default(data.get(CONF_GRID_IMPORT_ENERGY_PHASES), default_phase_json()))
    _add_optional(schema, CONF_GRID_EXPORT_ENERGY_PHASES, text_selector(multiline=True), _json_default(data.get(CONF_GRID_EXPORT_ENERGY_PHASES), default_phase_json()))
    _add_optional(schema, CONF_GRID_POWER_PHASES, text_selector(multiline=True), _json_default(data.get(CONF_GRID_POWER_PHASES), default_phase_json()))
    return vol.Schema(schema)


def _tri_phase_entity_default(data: dict[str, Any], phase: int, field: str) -> str:
    for item in data.get(field) or []:
        if not isinstance(item, dict):
            continue
        try:
            p = int(item.get("phase", 0))
        except (TypeError, ValueError):
            continue
        if p != phase:
            continue
        eid = item.get("entity_id")
        if isinstance(eid, str) and eid.strip():
            return eid.strip()
    return ""


def _grid_tri_layout_schema(data: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(
                CONF_GRID_TRI_SENSOR_LAYOUT,
                default=data.get(CONF_GRID_TRI_SENSOR_LAYOUT, TRI_GRID_SENSOR_TOTAL),
            ): tri_grid_sensor_layout_selector()
        }
    )


def _grid_tri_energy_mode_schema(data: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(
                CONF_GRID_TRI_ENERGY_MODE,
                default=data.get(CONF_GRID_TRI_ENERGY_MODE, TRI_GRID_ENERGY_SINGLE),
            ): tri_grid_energy_mode_selector(),
        }
    )


def _tri_per_phase_import_default(data: dict[str, Any], phase: int) -> str:
    return _tri_phase_entity_default(data, phase, CONF_GRID_IMPORT_ENERGY_PHASES)


def _tri_per_phase_export_default(data: dict[str, Any], phase: int) -> str:
    return _tri_phase_entity_default(data, phase, CONF_GRID_EXPORT_ENERGY_PHASES)


def _tri_per_phase_grid_power_default(data: dict[str, Any], phase: int) -> str:
    return _tri_phase_entity_default(data, phase, CONF_GRID_POWER_PHASES)


def _grid_tri_per_phase_schema(data: dict[str, Any]) -> vol.Schema:
    schema: dict[Any, Any] = {
        vol.Required(_GRID_TRI_PER_PHASE_SIGN_SECTION): section(
            vol.Schema(
                {
                    vol.Required(
                        CONF_GRID_POWER_SIGN_MODE,
                        default=data.get(CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE),
                    ): grid_power_sign_selector(),
                }
            ),
            {"collapsed": False},
        )
    }
    for phase_idx, (sec_key, imp_k, ex_k, pw_k) in enumerate(_GRID_TRI_PER_PHASE_PHASE_SPECS, start=1):
        inner: dict[Any, Any] = {}
        inner.update(_wizard_step_energy_entity(imp_k, _tri_per_phase_import_default(data, phase_idx)))
        _add_optional(inner, ex_k, optional_energy_entity(), _tri_per_phase_export_default(data, phase_idx))
        _add_optional(inner, pw_k, optional_power_entity(), _tri_per_phase_grid_power_default(data, phase_idx))
        schema[vol.Required(sec_key)] = section(vol.Schema(inner), {"collapsed": False})
    load_inner: dict[Any, Any] = {}
    _add_optional(load_inner, CONF_LOAD_POWER_SENSOR, optional_power_entity(), data.get(CONF_LOAD_POWER_SENSOR))
    schema[vol.Required(_GRID_TRI_PER_PHASE_LOAD_SECTION)] = section(
        vol.Schema(load_inner),
        {"collapsed": False},
    )
    return vol.Schema(schema)


def _flow_unique_id(data: dict[str, Any]) -> str:
    supplier = str(data.get(CONF_SUPPLIER, "unknown"))
    if data.get(CONF_PHASE_TYPE) == PHASE_TRI and data.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE:
        ids = ordered_phase_entity_ids(data.get(CONF_GRID_IMPORT_ENERGY_PHASES))
        if len(ids) == 3:
            return f"{supplier}_{'+'.join(ids)}"
    return f"{supplier}_{data.get(CONF_GRID_IMPORT_ENERGY, 'unknown')}"


def _tri_phase_grid_schema(data: dict[str, Any], phase: int) -> vol.Schema:
    return vol.Schema(
        {
            vol.Optional(
                CONF_TRI_PHASE_STEP_IMPORT_ENERGY,
                default=_tri_phase_entity_default(data, phase, CONF_GRID_IMPORT_ENERGY_PHASES),
            ): optional_energy_entity(),
            vol.Optional(
                CONF_TRI_PHASE_STEP_EXPORT_ENERGY,
                default=_tri_phase_entity_default(data, phase, CONF_GRID_EXPORT_ENERGY_PHASES),
            ): optional_energy_entity(),
            vol.Optional(
                CONF_TRI_PHASE_STEP_GRID_POWER,
                default=_tri_phase_entity_default(data, phase, CONF_GRID_POWER_PHASES),
            ): optional_power_entity(),
        }
    )


def _solar_config_schema(data: dict[str, Any]) -> vol.Schema:
    currency = data.get(CONF_CURRENCY, "EUR")
    schema: dict[Any, Any] = {
        vol.Required(CONF_SOLAR_RESALE_CONTRACT, default=bool(data.get(CONF_SOLAR_RESALE_CONTRACT, False))): BooleanSelector(),
        vol.Required(CONF_SOLAR_ESTIMATION_ENABLED, default=bool(data.get(CONF_SOLAR_ESTIMATION_ENABLED, False))): BooleanSelector(),
    }
    schema.update(_wizard_step_energy_entity(CONF_SOLAR_ENERGY, data.get(CONF_SOLAR_ENERGY)))
    _add_optional(schema, CONF_SOLAR_POWER_SENSOR, optional_power_entity(), data.get(CONF_SOLAR_POWER_SENSOR))
    _add_optional(
        schema,
        CONF_SOLAR_EXPORT_TARIFF,
        NumberSelector(NumberSelectorConfig(min=0, max=1, step=0.01, mode=NumberSelectorMode.BOX, unit_of_measurement=f"{currency}/kWh")),
        data.get(CONF_SOLAR_EXPORT_TARIFF),
    )
    return vol.Schema(schema)


def _solar_estimation_schema(data: dict[str, Any], lat: float, lon: float) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_SOLAR_LOCATION_LAT, default=data.get(CONF_SOLAR_LOCATION_LAT, lat)): NumberSelector(
                NumberSelectorConfig(min=-90, max=90, mode=NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_SOLAR_LOCATION_LON, default=data.get(CONF_SOLAR_LOCATION_LON, lon)): NumberSelector(
                NumberSelectorConfig(min=-180, max=180, mode=NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_SOLAR_PEAK_POWER, default=data.get(CONF_SOLAR_PEAK_POWER, 1.0)): NumberSelector(
                NumberSelectorConfig(min=0.1, max=1000, step=0.01, mode=NumberSelectorMode.BOX, unit_of_measurement="kWc")
            ),
            vol.Required(CONF_SOLAR_ORIENTATION, default=data.get(CONF_SOLAR_ORIENTATION, 180)): NumberSelector(
                NumberSelectorConfig(min=0, max=360, mode=NumberSelectorMode.BOX, unit_of_measurement="°")
            ),
            vol.Required(CONF_SOLAR_TILT_MODE, default=data.get(CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO)): solar_tilt_mode_selector(),
            vol.Optional(CONF_SOLAR_TILT, default=data.get(CONF_SOLAR_TILT, 35)): NumberSelector(
                NumberSelectorConfig(min=0, max=90, mode=NumberSelectorMode.BOX, unit_of_measurement="°")
            ),
            vol.Required(CONF_SOLAR_SHADING, default=data.get(CONF_SOLAR_SHADING, SOLAR_SHADING_NONE)): solar_shading_selector(),
            vol.Required(CONF_SOLAR_PERFORMANCE, default=data.get(CONF_SOLAR_PERFORMANCE, SOLAR_PERF_STANDARD)): solar_performance_selector(),
        }
    )


def _merge_step_help_placeholders(
    step_id: str,
    *,
    options_flow: bool,
    description_placeholders: dict[str, str] | None = None,
) -> dict[str, str]:
    """Inject per-step doc vitrine URL for ``{step_help_url}`` in translated step descriptions."""
    url = (
        documentation_options_step_help_url(step_id)
        if options_flow
        else documentation_config_step_help_url(step_id)
    )
    merged: dict[str, str] = {"step_help_url": url}
    if description_placeholders:
        merged.update(description_placeholders)
    return merged


class _BatteryWizardMixin(_StepLoggingMixin):
    _batteries: list[dict[str, Any]]
    _current_battery: dict[str, Any]
    _edit_batt_index: int | None

    def _show_doc_form(self, step_id: str, **kwargs: Any) -> ConfigFlowResult:
        options_flow = isinstance(self, OptionsFlow)
        extra = kwargs.pop("description_placeholders", None)
        kwargs["description_placeholders"] = _merge_step_help_placeholders(
            step_id,
            options_flow=options_flow,
            description_placeholders=extra,
        )
        return self.async_show_form(step_id=step_id, **kwargs)

    def _show_doc_menu(self, step_id: str, **kwargs: Any) -> ConfigFlowResult:
        options_flow = isinstance(self, OptionsFlow)
        extra = kwargs.pop("description_placeholders", None)
        kwargs["description_placeholders"] = _merge_step_help_placeholders(
            step_id,
            options_flow=options_flow,
            description_placeholders=extra,
        )
        return self.async_show_menu(step_id=step_id, **kwargs)

    async def _after_batteries_finished(self) -> ConfigFlowResult:
        raise NotImplementedError

    async def _commit_current_battery(self, *, from_step: str = "battery_add") -> ConfigFlowResult:
        if self._edit_batt_index is None:
            self._batteries.append(dict(self._current_battery))
        else:
            self._batteries[self._edit_batt_index] = dict(self._current_battery)
        self._current_battery = {}
        self._edit_batt_index = None
        return await _wizard_nav_forward(self, from_step, self.async_step_battery_more())

    async def async_step_battery_add(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        battery = dict(self._current_battery or {BATTERY_ID: uuid.uuid4().hex[:8]})
        if user_input is not None and CONF_HAS_BATTERIES in user_input:
            if set(user_input) == {CONF_HAS_BATTERIES}:
                user_input = None
            else:
                user_input = {k: v for k, v in user_input.items() if k != CONF_HAS_BATTERIES}
        if user_input is not None:
            back_coro = getattr(self, "_setup_flow_nav_back", None)
            if callable(back_coro):
                back_res = await back_coro(user_input)
                if back_res is not None:
                    return back_res
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "battery_add", battery, user_input)
            if not errors:
                updated = dict(battery)
                updated.setdefault(BATTERY_ID, uuid.uuid4().hex[:8])
                _apply_patch(updated, patch)
                self._current_battery = updated
                if updated.get(CONF_BATT_ADVANCED):
                    return await _wizard_nav_forward(self, "battery_add", self.async_step_battery_advanced())
                return await self._commit_current_battery(from_step="battery_add")
        number = (self._edit_batt_index + 1) if self._edit_batt_index is not None else (len(self._batteries) + 1)
        return self._show_doc_form(
            step_id="battery_add",
            data_schema=_wrap_setup_wizard_schema(self, _battery_add_schema(battery, number=number, user_input=user_input)),
            errors=errors,
            description_placeholders={"battery_number": str(number)},
        )

    async def async_step_battery_advanced(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        battery = dict(self._current_battery)
        if not battery.get(CONF_BATT_ADVANCED):
            return await self.async_step_battery_add(user_input)
        last_input: dict[str, Any] | None = None
        if user_input is not None:
            back_coro = getattr(self, "_setup_flow_nav_back", None)
            if callable(back_coro):
                back_res = await back_coro(user_input)
                if back_res is not None:
                    return back_res
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "battery_advanced", battery, user_input)
            if not errors:
                _apply_patch(self._current_battery, patch)
                return await self._commit_current_battery(from_step="battery_advanced")
            last_input = user_input
        number = (self._edit_batt_index + 1) if self._edit_batt_index is not None else (len(self._batteries) + 1)
        return self._show_doc_form(
            step_id="battery_advanced",
            data_schema=_wrap_setup_wizard_schema(self, _battery_advanced_data_schema(self, battery, last_input)),
            errors=errors,
            description_placeholders={"battery_number": str(number)},
        )

    async def async_step_battery_more(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            back_coro = getattr(self, "_setup_flow_nav_back", None)
            if callable(back_coro):
                back_res = await back_coro(user_input)
                if back_res is not None:
                    return back_res
            user_input = _strip_flow_nav(user_input)
            if bool(user_input.get("add_another", False)):
                self._edit_batt_index = None
                self._current_battery = {BATTERY_ID: uuid.uuid4().hex[:8]}
                return await _wizard_nav_forward(self, "battery_more", self.async_step_battery_add())
            return await self._after_batteries_finished()
        return self._show_doc_form(
            step_id="battery_more",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {vol.Required("add_another", default=False): BooleanSelector()},
                    extra=vol.ALLOW_EXTRA,
                ),
            ),
            description_placeholders={"battery_count": str(len(self._batteries))},
        )


class HubEnergieConfigFlow(_BatteryWizardMixin, ConfigFlow, domain=DOMAIN):
    """Multi-step setup wizard for Hub Energie."""

    VERSION = 5

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._options: dict[str, Any] = {}
        self._batteries: list[dict[str, Any]] = []
        self._current_battery: dict[str, Any] = {}
        self._edit_batt_index: int | None = None
        self._nav_stack: list[str] = []

    async def _setup_flow_nav_back(self, user_input: dict[str, Any] | None) -> ConfigFlowResult | None:
        if user_input is None or user_input.get(CONF_FLOW_NAV) != FLOW_NAV_BACK:
            return None
        if not self._nav_stack:
            return None
        prev = self._nav_stack.pop()
        return await getattr(self, f"async_step_{prev}")()

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return HubEnergieOptionsFlow()

    def _supplier_custom_show_form(self, errors: dict[str, str]) -> ConfigFlowResult:
        return self._show_doc_form(
            step_id="supplier_custom",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(
                            CONF_SUPPLIER_CUSTOM_NAME,
                            default=self._data.get(CONF_SUPPLIER_CUSTOM_NAME, ""),
                        ): text_selector(),
                    },
                    extra=vol.ALLOW_EXTRA,
                ),
            ),
            errors=errors,
        )

    async def _after_batteries_finished(self) -> ConfigFlowResult:
        self._data[CONF_BATTERY_SYSTEMS] = list(self._batteries)
        return await self._create_entry()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "user", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_SUPPLIER) == SUPPLIER_OTHER:
                    self._nav_stack.append("user")
                    return self._supplier_custom_show_form({})
                return await _wizard_nav_forward(self, "user", self.async_step_tariff_mode())
        return self._show_doc_form(
            step_id="user",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(CONF_SUPPLIER, default=self._data.get(CONF_SUPPLIER, SUPPLIER_EDF)): supplier_selector(),
                        vol.Required(CONF_PHASE_TYPE, default=self._data.get(CONF_PHASE_TYPE, PHASE_MONO)): phase_selector(),
                    },
                    extra=vol.ALLOW_EXTRA,
                ),
            ),
            errors=errors,
        )

    async def async_step_supplier_custom(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("supplier_custom", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "supplier_custom", self.async_step_tariff_mode_manual_only())
        return self._supplier_custom_show_form(errors)

    async def async_step_tariff_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("tariff_mode", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "tariff_mode", self.async_step_contract())
        return self._show_doc_form(
            step_id="tariff_mode",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {vol.Required(CONF_TARIFF_MODE, default=self._data.get(CONF_TARIFF_MODE, TARIFF_MODE_AUTO)): tariff_mode_selector()}
                ),
            ),
            errors=errors,
        )

    async def async_step_tariff_mode_manual_only(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            self._data[CONF_TARIFF_MODE] = TARIFF_MODE_MANUAL
            return await _wizard_nav_forward(self, "tariff_mode_manual_only", self.async_step_contract())
        return self._show_doc_form(
            step_id="tariff_mode_manual_only",
            data_schema=_wrap_setup_wizard_schema(self, vol.Schema({})),
        )

    async def async_step_contract(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("contract", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_TARIFF_MODE) == TARIFF_MODE_AUTO:
                    return await _wizard_nav_forward(self, "contract", self.async_step_edf_offer())
                return await _wizard_nav_forward(self, "contract", self.async_step_manual_pricing())
        is_edf = self._data.get(CONF_SUPPLIER) == SUPPLIER_EDF
        schema: dict[Any, Any] = {}
        if is_edf:
            schema[vol.Required(CONF_CONTRACT_POWER, default=self._data.get(CONF_CONTRACT_POWER, "9"))] = contract_power_selector_edf()
        else:
            schema[vol.Required(CONF_CONTRACT_POWER, default=int(self._data.get(CONF_CONTRACT_POWER, "9")))] = contract_power_selector_other()
        _add_optional(schema, CONF_CONTRACT_NAME, text_selector(), self._data.get(CONF_CONTRACT_NAME, ""))
        return self._show_doc_form(
            step_id="contract",
            data_schema=_wrap_setup_wizard_schema(self, vol.Schema(schema)),
            errors=errors,
        )

    async def async_step_edf_offer(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("edf_offer", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_TEMPO:
                    return await _wizard_nav_forward(self, "edf_offer", self.async_step_edf_tempo())
                return await _wizard_nav_forward(self, "edf_offer", self._edf_fetch_and_continue())
        return self._show_doc_form(
            step_id="edf_offer",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {vol.Required(CONF_TARIFF_OFFER, default=self._data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)): offer_selector()}
                ),
            ),
            errors=errors,
        )

    async def async_step_edf_tempo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("tempo_mode", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_TEMPO_MODE) == TEMPO_MODE_RTE:
                    return await _wizard_nav_forward(self, "edf_tempo", self.async_step_edf_tempo_rte())
                return await _wizard_nav_forward(self, "edf_tempo", self._edf_fetch_and_continue())
        return self._show_doc_form(
            step_id="edf_tempo",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {vol.Required(CONF_TEMPO_MODE, default=self._data.get(CONF_TEMPO_MODE, TEMPO_MODE_RTE)): tempo_mode_selector()}
                ),
            ),
            errors=errors,
        )

    async def async_step_edf_tempo_rte(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("rte_credentials", self._data, user_input)
            if not errors:
                client_id = patch.get(CONF_RTE_CLIENT_ID, self._data.get(CONF_RTE_CLIENT_ID))
                client_secret = patch.get(CONF_RTE_CLIENT_SECRET, self._data.get(CONF_RTE_CLIENT_SECRET))
                auth_error = await _async_test_rte_credentials(self.hass, str(client_id), str(client_secret))
                if auth_error:
                    errors["base"] = auth_error
                else:
                    _apply_patch(self._data, patch)
                    return await _wizard_nav_forward(self, "edf_tempo_rte", self._edf_fetch_and_continue())
            elif errors == {"base": ERR_RTE_CREDS_REQUIRED}:
                errors = {"base": ERR_RTE_CREDS_REQUIRED}
        return self._show_doc_form(
            step_id="edf_tempo_rte",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(CONF_RTE_CLIENT_ID, default=self._data.get(CONF_RTE_CLIENT_ID, "")): text_selector(),
                        vol.Required(CONF_RTE_CLIENT_SECRET, default=self._data.get(CONF_RTE_CLIENT_SECRET, "")): text_selector(password=True),
                    }
                ),
            ),
            errors=errors,
        )

    async def _edf_fetch_and_continue(self) -> ConfigFlowResult:
        tariffs, error = await _async_fetch_edf_tariffs(
            self.hass,
            str(self._data.get(CONF_TARIFF_OFFER, "")),
            str(self._data.get(CONF_CONTRACT_POWER, "9")),
        )
        if error:
            return self._show_doc_form(
                step_id="edf_offer",
                data_schema=_wrap_setup_wizard_schema(
                    self,
                    vol.Schema(
                        {vol.Required(CONF_TARIFF_OFFER, default=self._data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)): offer_selector()}
                    ),
                ),
                errors={"base": error},
            )
        offer_key = str(self._data.get(CONF_TARIFF_OFFER, "") or "").strip() or None
        tariff_patch = _tariff_options_from_payload(tariffs or {}, expected_offer=offer_key)
        if tariff_patch is None:
            return self._show_doc_form(
                step_id="edf_offer",
                data_schema=_wrap_setup_wizard_schema(
                    self,
                    vol.Schema(
                        {vol.Required(CONF_TARIFF_OFFER, default=self._data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)): offer_selector()}
                    ),
                ),
                errors={"base": ERR_TARIFF_PAYLOAD_INCOMPLETE},
            )
        self._options.update(tariff_patch)
        self._data[CONF_TARIFF_SOURCE] = "auto"
        return await self.async_step_grid()

    async def async_step_manual_pricing(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("manual_pricing", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                structure = self._data.get(CONF_PRICING_STRUCTURE)
                if structure == PRICING_FLAT:
                    return await _wizard_nav_forward(self, "manual_pricing", self.async_step_manual_flat())
                if structure == PRICING_TIME_OF_USE:
                    return await _wizard_nav_forward(self, "manual_pricing", self.async_step_manual_tou())
                return await _wizard_nav_forward(self, "manual_pricing", self.async_step_manual_schedule())
        return self._show_doc_form(
            step_id="manual_pricing",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(CONF_PRICING_STRUCTURE, default=self._data.get(CONF_PRICING_STRUCTURE, PRICING_FLAT)): pricing_structure_selector(),
                        vol.Required(CONF_PRICE_BASIS, default=self._data.get(CONF_PRICE_BASIS, PRICE_BASIS_TTC)): price_basis_selector(),
                        vol.Optional(CONF_CURRENCY, default=self._data.get(CONF_CURRENCY, "EUR")): text_selector(),
                    }
                ),
            ),
            errors=errors,
        )

    async def async_step_manual_flat(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("manual_flat", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "manual_flat", self.async_step_grid())
        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self._show_doc_form(
            step_id="manual_flat",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(CONF_ENERGY_PRICE, default=self._data.get(CONF_ENERGY_PRICE, 0.0)): NumberSelector(
                            NumberSelectorConfig(min=0, max=5, step=0.01, mode=NumberSelectorMode.BOX, unit_of_measurement=f"{currency}/kWh")
                        ),
                        vol.Optional(CONF_SUBSCRIPTION_PRICE, default=self._data.get(CONF_SUBSCRIPTION_PRICE, 0.0)): NumberSelector(
                            NumberSelectorConfig(
                                min=0,
                                max=1000,
                                mode=NumberSelectorMode.BOX,
                                unit_of_measurement=_subscription_price_uom(self.hass, currency),
                            )
                        ),
                    }
                ),
            ),
            errors=errors,
        )

    async def async_step_manual_tou(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("manual_tou", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "manual_tou", self.async_step_grid())
        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self._show_doc_form(
            step_id="manual_tou",
            data_schema=_manual_tou_form_schema(self.hass, self._data, currency, setup_flow=self),
            errors=errors,
        )

    async def async_step_manual_schedule(
        self, _user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self._show_doc_menu(
            step_id="manual_schedule",
            menu_options=["manual_schedule_form", "manual_schedule_json", "manual_schedule_prev"],
        )

    async def async_step_manual_schedule_prev(
        self, _user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._nav_stack:
            self._nav_stack.pop()
        return await self.async_step_manual_pricing()

    async def async_step_manual_schedule_form(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is None:
            if not self._nav_stack or self._nav_stack[-1] != "manual_schedule":
                self._nav_stack.append("manual_schedule")
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("manual_schedule_form", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "manual_schedule_form", self.async_step_grid())
        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self._show_doc_form(
            step_id="manual_schedule_form",
            data_schema=_manual_schedule_form_schema(self.hass, self._data, currency, setup_flow=self),
            errors=errors,
        )

    async def async_step_manual_schedule_json(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is None:
            if not self._nav_stack or self._nav_stack[-1] != "manual_schedule":
                self._nav_stack.append("manual_schedule")
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("manual_schedule_json", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "manual_schedule_json", self.async_step_grid())
        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self._show_doc_form(
            step_id="manual_schedule_json",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(
                            CONF_SCHEDULE_SLOTS,
                            default=_json_default(self._data.get(CONF_SCHEDULE_SLOTS), default_schedule_json()),
                        ): text_selector(multiline=True),
                        vol.Optional(CONF_SUBSCRIPTION_PRICE, default=self._data.get(CONF_SUBSCRIPTION_PRICE, 0.0)): NumberSelector(
                            NumberSelectorConfig(
                                min=0,
                                max=1000,
                                mode=NumberSelectorMode.BOX,
                                unit_of_measurement=_subscription_price_uom(self.hass, currency),
                            )
                        ),
                    }
                ),
            ),
            errors=errors,
        )

    async def async_step_grid(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._data.get(CONF_PHASE_TYPE) == PHASE_TRI:
            if self._data.get(CONF_GRID_TRI_ENERGY_MODE) not in (
                TRI_GRID_ENERGY_SINGLE,
                TRI_GRID_ENERGY_PER_PHASE,
            ):
                return await self.async_step_grid_tri_energy_mode()
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "grid", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_PHASE_TYPE) == PHASE_TRI:
                    if self._data.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE:
                        return await _wizard_nav_forward(self, "grid", self.async_step_solar())
                    return await _wizard_nav_forward(self, "grid", self.async_step_grid_tri_layout())
                return await _wizard_nav_forward(self, "grid", self.async_step_solar())
        return self._show_doc_form(
            step_id="grid",
            data_schema=_wrap_setup_wizard_schema(self, _grid_schema(self._data)),
            errors=errors,
        )

    async def async_step_grid_tri_energy_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(
                self.hass, "grid_tri_energy_mode", self._data, user_input
            )
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE:
                    return await _wizard_nav_forward(self, "grid_tri_energy_mode", self.async_step_grid_tri_per_phase())
                return await self.async_step_grid()
        return self._show_doc_form(
            step_id="grid_tri_energy_mode",
            data_schema=_wrap_setup_wizard_schema(self, _grid_tri_energy_mode_schema(self._data)),
            errors=errors,
        )

    async def async_step_grid_tri_per_phase(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            user_input = _flatten_grid_tri_per_phase_user_input(user_input)
            patch, errors = await _async_validate_step(
                self.hass, "grid_tri_per_phase", self._data, user_input
            )
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "grid_tri_per_phase", self.async_step_solar())
        return self._show_doc_form(
            step_id="grid_tri_per_phase",
            data_schema=_wrap_setup_wizard_schema(self, _grid_tri_per_phase_schema(self._data)),
            errors=errors,
        )

    async def async_step_grid_tri_layout(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "grid_tri_layout", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_GRID_TRI_SENSOR_LAYOUT) == TRI_GRID_SENSOR_PER_PHASE:
                    return await _wizard_nav_forward(self, "grid_tri_layout", self.async_step_tri_grid_phase_1())
                return await _wizard_nav_forward(self, "grid_tri_layout", self.async_step_grid_phases())
        return self._show_doc_form(
            step_id="grid_tri_layout",
            data_schema=_wrap_setup_wizard_schema(self, _grid_tri_layout_schema(self._data)),
            errors=errors,
        )

    async def async_step_grid_phases(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "grid_phases", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "grid_phases", self.async_step_solar())
        return self._show_doc_form(
            step_id="grid_phases",
            data_schema=_wrap_setup_wizard_schema(self, _grid_phases_schema(self._data)),
            errors=errors,
        )

    async def async_step_tri_grid_phase_1(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._async_step_tri_grid_phase_n(1, user_input)

    async def async_step_tri_grid_phase_2(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._async_step_tri_grid_phase_n(2, user_input)

    async def async_step_tri_grid_phase_3(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._async_step_tri_grid_phase_n(3, user_input)

    async def _async_step_tri_grid_phase_n(
        self, phase: int, user_input: dict[str, Any] | None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        scope = f"tri_grid_phase_{phase}"
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, scope, self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if phase == 1:
                    return await _wizard_nav_forward(self, scope, self.async_step_tri_grid_phase_2())
                if phase == 2:
                    return await _wizard_nav_forward(self, scope, self.async_step_tri_grid_phase_3())
                return await _wizard_nav_forward(self, scope, self.async_step_solar())
        return self._show_doc_form(
            step_id=scope,
            data_schema=_wrap_setup_wizard_schema(self, _tri_phase_grid_schema(self._data, phase)),
            errors=errors,
        )

    async def async_step_solar(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("solar_toggle", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_HAS_SOLAR):
                    return await _wizard_nav_forward(self, "solar", self.async_step_solar_config())
                return await _wizard_nav_forward(self, "solar", self.async_step_battery())
        return self._show_doc_form(
            step_id="solar",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema({vol.Required(CONF_HAS_SOLAR, default=bool(self._data.get(CONF_HAS_SOLAR, False))): BooleanSelector()}),
            ),
            errors=errors,
        )

    async def async_step_solar_config(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = await _async_validate_step(self.hass, "solar_config", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_SOLAR_ESTIMATION_ENABLED):
                    return await _wizard_nav_forward(self, "solar_config", self.async_step_solar_estimation())
                return await _wizard_nav_forward(self, "solar_config", self.async_step_battery())
        return self._show_doc_form(
            step_id="solar_config",
            data_schema=_wrap_setup_wizard_schema(self, _solar_config_schema(self._data)),
            errors=errors,
        )

    async def async_step_solar_estimation(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("solar_estimation", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                return await _wizard_nav_forward(self, "solar_estimation", self.async_step_battery())
        return self._show_doc_form(
            step_id="solar_estimation",
            data_schema=_wrap_setup_wizard_schema(
                self,
                _solar_estimation_schema(self._data, self.hass.config.latitude, self.hass.config.longitude),
            ),
            errors=errors,
        )

    async def async_step_battery(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._setup_flow_nav_back(user_input)
            if back is not None:
                return back
            user_input = _strip_flow_nav(user_input)
            patch, errors = _validate_step("battery_toggle", self._data, user_input)
            if not errors:
                _apply_patch(self._data, patch)
                if self._data.get(CONF_HAS_BATTERIES):
                    self._batteries = []
                    self._current_battery = {BATTERY_ID: uuid.uuid4().hex[:8]}
                    self._edit_batt_index = None
                    return await _wizard_nav_forward(self, "battery", self.async_step_battery_add())
                return await self._create_entry()
        return self._show_doc_form(
            step_id="battery",
            data_schema=_wrap_setup_wizard_schema(
                self,
                vol.Schema(
                    {
                        vol.Required(
                            CONF_HAS_BATTERIES,
                            default=bool(self._data.get(CONF_HAS_BATTERIES, False)),
                        ): BooleanSelector()
                    },
                    extra=vol.ALLOW_EXTRA,
                ),
            ),
            errors=errors,
        )

    async def _create_entry(self) -> ConfigFlowResult:
        errors = HubEnergieConfigValidator.validate_full(self._data)
        if errors:
            step_id = "battery_more" if self._data.get(CONF_HAS_BATTERIES) else "battery"
            return self._show_doc_form(
                step_id=step_id,
                data_schema=vol.Schema(
                    {vol.Required("add_another", default=False): BooleanSelector()},
                    extra=vol.ALLOW_EXTRA,
                )
                if step_id == "battery_more"
                else vol.Schema(
                    {
                        vol.Required(
                            CONF_HAS_BATTERIES,
                            default=bool(self._data.get(CONF_HAS_BATTERIES, False)),
                        ): BooleanSelector()
                    },
                    extra=vol.ALLOW_EXTRA,
                ),
                errors=errors,
                description_placeholders={"battery_count": str(len(self._batteries))}
                if step_id == "battery_more"
                else None,
            )
        self._nav_stack.clear()
        await self.async_set_unique_id(_flow_unique_id(self._data))
        self._abort_if_unique_id_configured()
        supplier_label = self._data.get(CONF_SUPPLIER_CUSTOM_NAME) or str(self._data.get(CONF_SUPPLIER, "")).upper()
        return self.async_create_entry(
            title=f"Hub Energie - {supplier_label}",
            data=self._data,
            options=self._options,
        )


class HubEnergieOptionsFlow(_BatteryWizardMixin, OptionsFlow):
    """Post-setup configuration via menu."""

    def __init__(self) -> None:
        self._updated: dict[str, Any] = {}
        self._solar_options_merged: dict[str, Any] | None = None
        self._batteries: list[dict[str, Any]] = []
        self._current_battery: dict[str, Any] = {}
        self._edit_batt_index: int | None = None
        self._grid_tri_draft: dict[str, Any] | None = None

    def _menu_options(self) -> list[str]:
        data = self.config_entry.data
        options = ["offer", "grid", "solar", "battery"]
        if data.get(CONF_PHASE_TYPE) == PHASE_TRI:
            options.insert(2, "grid_tri")
        if data.get(CONF_SUPPLIER) == SUPPLIER_EDF:
            options.append("tariff_refresh")
            if data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_TEMPO:
                options.append("tempo")
        options.append("expert")
        return options

    async def async_step_expert(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self._show_doc_menu(
            step_id="expert",
            menu_options=["reinjection", "advanced_energy", "expert_back"],
        )

    async def async_step_expert_back(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self._show_doc_menu(step_id="init", menu_options=self._menu_options())

    async def _persist(
        self,
        *,
        data_patch: dict[str, Any] | None = None,
        options_patch: dict[str, Any] | None = None,
        base_data: dict[str, Any] | None = None,
        reason: str = "options_updated",
    ) -> ConfigFlowResult:
        new_data = _patched_copy(base_data or dict(self.config_entry.data), data_patch or {})
        new_options = _patched_copy(dict(self.config_entry.options), options_patch or {})
        errors = HubEnergieConfigValidator.validate_full(new_data)
        _LOGGER.debug("Persist candidate data=%s errors=%s", _redact_user_input(new_data), errors)
        if errors:
            raise ValueError(errors)
        if options_patch is None:
            self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
        else:
            self.hass.config_entries.async_update_entry(self.config_entry, data=new_data, options=new_options)
        await self.hass.config_entries.async_reload(self.config_entry.entry_id)
        return self.async_abort(reason=reason)

    async def _after_batteries_finished(self) -> ConfigFlowResult:
        try:
            return await self._persist(
                data_patch={CONF_HAS_BATTERIES: True, CONF_BATTERY_SYSTEMS: list(self._batteries)}
            )
        except ValueError as err:
            errors = dict(err.args[0])
            return self._show_doc_form(
                step_id="battery_more",
                data_schema=vol.Schema(
                    {vol.Required("add_another", default=False): BooleanSelector()},
                    extra=vol.ALLOW_EXTRA,
                ),
                errors=errors,
                description_placeholders={"battery_count": str(len(self._batteries))},
            )

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self._show_doc_menu(step_id="init", menu_options=self._menu_options())

    async def async_step_advanced_energy(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        opts = dict(self.config_entry.options)

        def eff(key: str, default: float) -> float:
            raw = opts.get(key)
            if raw is None:
                return float(default)
            try:
                v = float(raw)
            except (TypeError, ValueError):
                return float(default)
            if not math.isfinite(v):
                return float(default)
            return max(float(DELTA_CAP_KWH_MIN), min(float(DELTA_CAP_KWH_MAX), v))

        defaults = {
            OPT_MAX_DELTA_KWH_GRID: eff(OPT_MAX_DELTA_KWH_GRID, DEFAULT_MAX_DELTA_KWH_GRID),
            OPT_MAX_DELTA_KWH_SOLAR: eff(OPT_MAX_DELTA_KWH_SOLAR, DEFAULT_MAX_DELTA_KWH_SOLAR),
            OPT_MAX_DELTA_KWH_BATTERY: eff(OPT_MAX_DELTA_KWH_BATTERY, DEFAULT_MAX_DELTA_KWH_BATTERY),
            OPT_MAX_DELTA_KWH_OTHER: eff(OPT_MAX_DELTA_KWH_OTHER, MAX_DELTA_KWH_DEFAULT),
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                g = float(user_input[OPT_MAX_DELTA_KWH_GRID])
                s = float(user_input[OPT_MAX_DELTA_KWH_SOLAR])
                b = float(user_input[OPT_MAX_DELTA_KWH_BATTERY])
                o = float(user_input[OPT_MAX_DELTA_KWH_OTHER])
            except (TypeError, ValueError, KeyError):
                errors["base"] = "invalid_delta_cap"
            else:
                caps = (g, s, b, o)
                if not all(float(DELTA_CAP_KWH_MIN) <= x <= float(DELTA_CAP_KWH_MAX) for x in caps):
                    errors["base"] = "invalid_delta_cap"
                else:
                    try:
                        return await self._persist(
                            options_patch={
                                OPT_MAX_DELTA_KWH_GRID: g,
                                OPT_MAX_DELTA_KWH_SOLAR: s,
                                OPT_MAX_DELTA_KWH_BATTERY: b,
                                OPT_MAX_DELTA_KWH_OTHER: o,
                            },
                        )
                    except ValueError as err:
                        errors = dict(err.args[0])
        cap_selector = NumberSelector(
            NumberSelectorConfig(
                min=float(DELTA_CAP_KWH_MIN),
                max=float(DELTA_CAP_KWH_MAX),
                step=1,
                mode=NumberSelectorMode.BOX,
                unit_of_measurement="kWh",
            )
        )
        schema = vol.Schema(
            {
                vol.Required(
                    OPT_MAX_DELTA_KWH_GRID,
                    default=defaults[OPT_MAX_DELTA_KWH_GRID],
                ): cap_selector,
                vol.Required(
                    OPT_MAX_DELTA_KWH_SOLAR,
                    default=defaults[OPT_MAX_DELTA_KWH_SOLAR],
                ): cap_selector,
                vol.Required(
                    OPT_MAX_DELTA_KWH_BATTERY,
                    default=defaults[OPT_MAX_DELTA_KWH_BATTERY],
                ): cap_selector,
                vol.Required(
                    OPT_MAX_DELTA_KWH_OTHER,
                    default=defaults[OPT_MAX_DELTA_KWH_OTHER],
                ): cap_selector,
            }
        )
        return self._show_doc_form(step_id="advanced_energy", data_schema=schema, errors=errors)

    async def async_step_reinjection(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        opts = dict(self.config_entry.options)

        def eff(key: str, default: float) -> float:
            raw = opts.get(key)
            if raw is None:
                return float(default)
            try:
                v = float(raw)
            except (TypeError, ValueError):
                return float(default)
            if not math.isfinite(v):
                return float(default)
            return v

        defaults = {
            OPT_REINJECTION_EXPORT_IGNORE_BELOW_W: eff(
                OPT_REINJECTION_EXPORT_IGNORE_BELOW_W, REINJECTION_EXPORT_IGNORE_BELOW_W
            ),
            OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W: eff(
                OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W, REINJECTION_BATT_CHARGE_SIGNIFICANT_W
            ),
            OPT_REINJECTION_SHORT_EXPORT_MAX_S: eff(
                OPT_REINJECTION_SHORT_EXPORT_MAX_S, REINJECTION_SHORT_EXPORT_MAX_S
            ),
            OPT_REINJECTION_SHORT_EXPORT_MAX_W: eff(
                OPT_REINJECTION_SHORT_EXPORT_MAX_W, REINJECTION_SHORT_EXPORT_MAX_W
            ),
            OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W: eff(
                OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W, REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W
            ),
            OPT_REINJECTION_EXPORT_MIN_ABS_W: eff(
                OPT_REINJECTION_EXPORT_MIN_ABS_W, REINJECTION_EXPORT_MIN_ABS_W
            ),
            OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION: eff(
                OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION, REINJECTION_EXPORT_VS_SOLAR_FRACTION
            ),
            OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC: eff(
                OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC, REINJECTION_BATT_FULL_MIN_SOC_FRAC
            ),
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                parsed: dict[str, float] = {}
                for k in REINJECTION_OPTION_KEYS:
                    parsed[k] = float(user_input[k])
            except (TypeError, ValueError, KeyError):
                errors["base"] = "invalid_reinjection_thresholds"
            else:
                ign = parsed[OPT_REINJECTION_EXPORT_IGNORE_BELOW_W]
                short_s = parsed[OPT_REINJECTION_SHORT_EXPORT_MAX_S]
                short_w = parsed[OPT_REINJECTION_SHORT_EXPORT_MAX_W]
                min_sol = parsed[OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W]
                exp_min = parsed[OPT_REINJECTION_EXPORT_MIN_ABS_W]
                frac = parsed[OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION]
                batt_chg = parsed[OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W]
                soc_frac = parsed[OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC]
                if not (
                    0.0 <= ign <= REINJECTION_UI_POWER_W_MAX
                    and 0.0 <= batt_chg <= REINJECTION_UI_POWER_W_MAX
                    and 0.0 < short_s <= REINJECTION_UI_DURATION_S_MAX
                    and 0.0 < short_w <= REINJECTION_UI_POWER_W_MAX
                    and 0.0 <= min_sol <= REINJECTION_UI_POWER_W_MAX
                    and 0.0 <= exp_min <= REINJECTION_UI_POWER_W_MAX
                    and 0.0 <= frac <= 1.0
                    and 0.0 <= soc_frac <= 1.0
                ):
                    errors["base"] = "invalid_reinjection_thresholds"
                else:
                    try:
                        return await self._persist(options_patch=parsed)
                    except ValueError as err:
                        errors = dict(err.args[0])
        power_sel = NumberSelector(
            NumberSelectorConfig(
                min=0.0,
                max=float(REINJECTION_UI_POWER_W_MAX),
                step=1,
                mode=NumberSelectorMode.BOX,
                unit_of_measurement="W",
            )
        )
        duration_sel = NumberSelector(
            NumberSelectorConfig(
                min=0.01,
                max=float(REINJECTION_UI_DURATION_S_MAX),
                step=1,
                mode=NumberSelectorMode.BOX,
                unit_of_measurement="s",
            )
        )
        ratio_sel = NumberSelector(
            NumberSelectorConfig(
                min=0.0,
                max=1.0,
                step=0.01,
                mode=NumberSelectorMode.BOX,
            )
        )
        schema = vol.Schema(
            {
                vol.Required(
                    OPT_REINJECTION_EXPORT_IGNORE_BELOW_W,
                    default=defaults[OPT_REINJECTION_EXPORT_IGNORE_BELOW_W],
                ): power_sel,
                vol.Required(
                    OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W,
                    default=defaults[OPT_REINJECTION_BATT_CHARGE_SIGNIFICANT_W],
                ): power_sel,
                vol.Required(
                    OPT_REINJECTION_SHORT_EXPORT_MAX_S,
                    default=defaults[OPT_REINJECTION_SHORT_EXPORT_MAX_S],
                ): duration_sel,
                vol.Required(
                    OPT_REINJECTION_SHORT_EXPORT_MAX_W,
                    default=defaults[OPT_REINJECTION_SHORT_EXPORT_MAX_W],
                ): power_sel,
                vol.Required(
                    OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W,
                    default=defaults[OPT_REINJECTION_MIN_SOLAR_FOR_CLASSIFY_W],
                ): power_sel,
                vol.Required(
                    OPT_REINJECTION_EXPORT_MIN_ABS_W,
                    default=defaults[OPT_REINJECTION_EXPORT_MIN_ABS_W],
                ): power_sel,
                vol.Required(
                    OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION,
                    default=defaults[OPT_REINJECTION_EXPORT_VS_SOLAR_FRACTION],
                ): ratio_sel,
                vol.Required(
                    OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC,
                    default=defaults[OPT_REINJECTION_BATT_FULL_MIN_SOC_FRAC],
                ): ratio_sel,
            }
        )
        return self._show_doc_form(step_id="reinjection", data_schema=schema, errors=errors)

    async def async_step_offer(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = dict(self.config_entry.data)
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("offer_options", data, user_input)
            if not errors:
                try:
                    return await self._persist(data_patch=patch)
                except ValueError as err:
                    errors = dict(err.args[0])
        schema: dict[Any, Any] = {
            vol.Required(CONF_SUPPLIER, default=data.get(CONF_SUPPLIER, SUPPLIER_EDF)): supplier_selector()
        }
        if data.get(CONF_SUPPLIER) == SUPPLIER_OTHER:
            _add_optional(schema, CONF_SUPPLIER_CUSTOM_NAME, text_selector(), data.get(CONF_SUPPLIER_CUSTOM_NAME, ""))
        if data.get(CONF_SUPPLIER) == SUPPLIER_EDF:
            schema[vol.Required(CONF_CONTRACT_POWER, default=data.get(CONF_CONTRACT_POWER, "9"))] = contract_power_selector_edf()
        else:
            schema[vol.Required(CONF_CONTRACT_POWER, default=int(data.get(CONF_CONTRACT_POWER, "9")))] = contract_power_selector_other()
        _add_optional(schema, CONF_CONTRACT_NAME, text_selector(), data.get(CONF_CONTRACT_NAME, ""))
        return self._show_doc_form(step_id="offer", data_schema=vol.Schema(schema), errors=errors)

    async def async_step_grid(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = dict(self.config_entry.data)
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(self.hass, "grid", data, user_input)
            if not errors:
                try:
                    return await self._persist(data_patch=patch)
                except ValueError as err:
                    errors = dict(err.args[0])
        return self._show_doc_form(step_id="grid", data_schema=_grid_schema(data), errors=errors)

    async def _persist_grid_tri_draft(self, *, errors_form: tuple[str, vol.Schema]) -> ConfigFlowResult:
        """Persist ``GRID_TRI_DETAIL_KEYS`` from ``_grid_tri_draft``; on validation error re-show a form."""
        draft = self._grid_tri_draft
        assert draft is not None
        step_id, data_schema = errors_form
        base = dict(self.config_entry.data)
        data_patch = {k: draft.get(k) for k in GRID_TRI_DETAIL_KEYS}
        try:
            result = await self._persist(data_patch=data_patch, base_data=base)
        except ValueError as err:
            return self._show_doc_form(
                step_id=step_id,
                data_schema=data_schema,
                errors=dict(err.args[0]),
            )
        self._grid_tri_draft = None
        return result

    async def async_step_grid_tri(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        self._grid_tri_draft = dict(self.config_entry.data)
        return await self.async_step_grid_tri_energy_mode()

    async def async_step_grid_tri_energy_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        draft = self._grid_tri_draft
        assert draft is not None
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(
                self.hass, "grid_tri_energy_mode", draft, user_input
            )
            if not errors:
                _apply_patch(draft, patch)
                if draft.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE:
                    return await self.async_step_grid_tri_per_phase()
                return await self.async_step_grid_tri_layout()
        return self._show_doc_form(
            step_id="grid_tri_energy_mode",
            data_schema=_grid_tri_energy_mode_schema(draft),
            errors=errors,
        )

    async def async_step_grid_tri_per_phase(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        draft = self._grid_tri_draft
        assert draft is not None
        errors: dict[str, str] = {}
        if user_input is not None:
            user_input = _flatten_grid_tri_per_phase_user_input(user_input)
            patch, errors = await _async_validate_step(
                self.hass, "grid_tri_per_phase", draft, user_input
            )
            if not errors:
                _apply_patch(draft, patch)
                return await self._persist_grid_tri_draft(
                    errors_form=("grid_tri_per_phase", _grid_tri_per_phase_schema(draft)),
                )
        return self._show_doc_form(
            step_id="grid_tri_per_phase",
            data_schema=_grid_tri_per_phase_schema(draft),
            errors=errors,
        )

    async def async_step_grid_tri_layout(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        draft = self._grid_tri_draft
        assert draft is not None
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(self.hass, "grid_tri_layout", draft, user_input)
            if not errors:
                _apply_patch(draft, patch)
                if draft.get(CONF_GRID_TRI_SENSOR_LAYOUT) == TRI_GRID_SENSOR_PER_PHASE:
                    return await self.async_step_tri_grid_phase_1()
                return await self.async_step_grid_phases()
        return self._show_doc_form(
            step_id="grid_tri_layout",
            data_schema=_grid_tri_layout_schema(draft),
            errors=errors,
        )

    async def async_step_grid_phases(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        draft = self._grid_tri_draft
        if draft is None:
            draft = dict(self.config_entry.data)
            self._grid_tri_draft = draft
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(self.hass, "grid_phases", draft, user_input)
            if not errors:
                _apply_patch(draft, patch)
                return await self._persist_grid_tri_draft(
                    errors_form=("grid_phases", _grid_phases_schema(draft)),
                )
        return self._show_doc_form(step_id="grid_phases", data_schema=_grid_phases_schema(draft), errors=errors)

    async def async_step_tri_grid_phase_1(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._options_tri_grid_phase_n(1, user_input)

    async def async_step_tri_grid_phase_2(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._options_tri_grid_phase_n(2, user_input)

    async def async_step_tri_grid_phase_3(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self._options_tri_grid_phase_n(3, user_input)

    async def _options_tri_grid_phase_n(
        self, phase: int, user_input: dict[str, Any] | None
    ) -> ConfigFlowResult:
        draft = self._grid_tri_draft
        assert draft is not None
        scope = f"tri_grid_phase_{phase}"
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(self.hass, scope, draft, user_input)
            if not errors:
                _apply_patch(draft, patch)
                if phase == 1:
                    return await self.async_step_tri_grid_phase_2()
                if phase == 2:
                    return await self.async_step_tri_grid_phase_3()
                return await self._persist_grid_tri_draft(
                    errors_form=(scope, _tri_phase_grid_schema(draft, phase)),
                )
        return self._show_doc_form(
            step_id=scope,
            data_schema=_tri_phase_grid_schema(draft, phase),
            errors=errors,
        )

    async def async_step_solar(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        base_data = dict(self.config_entry.data)
        errors: dict[str, str] = {}
        if user_input is None:
            self._solar_options_merged = None
        if user_input is not None:
            patch, errors = _validate_step("solar_toggle", base_data, user_input)
            if not errors:
                if not patch.get(CONF_HAS_SOLAR):
                    self._solar_options_merged = None
                    try:
                        return await self._persist(data_patch=patch, base_data=base_data)
                    except ValueError as err:
                        errors = dict(err.args[0])
                else:
                    self._solar_options_merged = _patched_copy(base_data, patch)
                    return await self.async_step_solar_config()
        return self._show_doc_form(
            step_id="solar",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HAS_SOLAR,
                        default=bool(base_data.get(CONF_HAS_SOLAR, False)),
                    ): BooleanSelector()
                },
                extra=vol.ALLOW_EXTRA,
            ),
            errors=errors,
        )

    async def async_step_solar_config(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        merged = self._solar_options_merged
        if merged is None:
            return await self.async_step_solar()
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = await _async_validate_step(self.hass, "solar_config", merged, user_input)
            if not errors:
                next_merged = _patched_copy(merged, patch)
                if next_merged.get(CONF_SOLAR_ESTIMATION_ENABLED):
                    self._solar_options_merged = next_merged
                    return await self.async_step_solar_estimation()
                self._solar_options_merged = None
                try:
                    return await self._persist(
                        data_patch=_solar_options_entry_patch(next_merged),
                        base_data=dict(self.config_entry.data),
                    )
                except ValueError as err:
                    self._solar_options_merged = merged
                    errors = dict(err.args[0])
        return self._show_doc_form(
            step_id="solar_config",
            data_schema=_solar_config_schema(merged),
            errors=errors,
        )

    async def async_step_solar_estimation(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = self._solar_options_merged
        if data is None:
            return await self.async_step_solar()
        if not data.get(CONF_HAS_SOLAR):
            return self.async_abort(reason="no_solar_configured")
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("solar_estimation", data, user_input)
            if not errors:
                next_merged = _patched_copy(data, patch)
                self._solar_options_merged = None
                try:
                    return await self._persist(
                        data_patch=_solar_options_entry_patch(next_merged),
                        base_data=dict(self.config_entry.data),
                    )
                except ValueError as err:
                    self._solar_options_merged = data
                    errors = dict(err.args[0])
        return self._show_doc_form(
            step_id="solar_estimation",
            data_schema=_solar_estimation_schema(data, self.hass.config.latitude, self.hass.config.longitude),
            errors=errors,
        )

    async def async_step_battery(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = dict(self.config_entry.data)
        batteries = data.get(CONF_BATTERY_SYSTEMS, []) if isinstance(data.get(CONF_BATTERY_SYSTEMS), list) else []
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("battery_toggle", data, user_input)
            if not errors:
                if not bool(patch.get(CONF_HAS_BATTERIES, False)):
                    try:
                        return await self._persist(data_patch=patch)
                    except ValueError as err:
                        errors = dict(err.args[0])
                else:
                    self._batteries = list(batteries)
                    self._current_battery = {BATTERY_ID: uuid.uuid4().hex[:8]}
                    self._edit_batt_index = None
                    if self._batteries:
                        return await self.async_step_battery_pick()
                    return await self.async_step_battery_add()
        return self._show_doc_form(
            step_id="battery",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HAS_BATTERIES,
                        default=bool(data.get(CONF_HAS_BATTERIES, False)),
                    ): BooleanSelector()
                },
                extra=vol.ALLOW_EXTRA,
            ),
            errors=errors,
            description_placeholders={"battery_count": str(len(batteries))},
        )

    async def async_step_battery_pick(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        batteries = self._batteries or list(self.config_entry.data.get(CONF_BATTERY_SYSTEMS, []) or [])
        if not batteries:
            return await self.async_step_battery_add()
        errors: dict[str, str] = {}
        if user_input is not None:
            remove = _coerce_select_bool(user_input.get(CONF_BATT_REMOVE_SELECTED))
            add_new_flag = _coerce_select_bool(user_input.get("add_new"))
            if remove and add_new_flag:
                errors["base"] = "battery_pick_conflicting_options"
            elif remove:
                try:
                    index = int(user_input.get("battery_index"))
                except (TypeError, ValueError):
                    errors["base"] = "invalid_battery_choice"
                else:
                    if not (0 <= index < len(batteries)):
                        errors["base"] = "invalid_battery_choice"
                    else:
                        new_batteries = [b for i, b in enumerate(batteries) if i != index]
                        patch: dict[str, Any] = {CONF_BATTERY_SYSTEMS: new_batteries}
                        if not new_batteries:
                            patch[CONF_HAS_BATTERIES] = False
                        try:
                            return await self._persist(data_patch=patch)
                        except ValueError as err:
                            errors = dict(err.args[0])
            elif add_new_flag:
                self._edit_batt_index = None
                self._current_battery = {BATTERY_ID: uuid.uuid4().hex[:8]}
                return await self.async_step_battery_add()
            else:
                try:
                    index = int(user_input.get("battery_index"))
                except (TypeError, ValueError):
                    errors["base"] = "invalid_battery_choice"
                else:
                    if 0 <= index < len(batteries):
                        self._edit_batt_index = index
                        self._current_battery = dict(batteries[index])
                        return await self.async_step_battery_add()
                    errors["base"] = "invalid_battery_choice"
        options = [
            SelectOptionDict(
                value=str(index),
                label=f"{battery.get(CONF_BATT_NAME, f'Battery {index + 1}')} ({battery.get(BATTERY_ID, index)})",
            )
            for index, battery in enumerate(batteries)
        ]
        return self._show_doc_form(
            step_id="battery_pick",
            data_schema=vol.Schema(
                {
                    vol.Required("battery_index", default="0"): SelectSelector(
                        SelectSelectorConfig(options=options, mode=SelectSelectorMode.DROPDOWN)
                    ),
                    vol.Optional(CONF_BATT_REMOVE_SELECTED, default=False): BooleanSelector(),
                    vol.Optional("add_new", default=False): BooleanSelector(),
                },
                extra=vol.ALLOW_EXTRA,
            ),
            errors=errors,
        )

    async def async_step_tempo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = dict(self.config_entry.data)
        if not (data.get(CONF_SUPPLIER) == SUPPLIER_EDF and data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_TEMPO):
            return self.async_abort(reason="not_tempo_offer")
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("tempo_mode", data, user_input)
            if not errors:
                updated = _patched_copy(data, patch)
                self._updated = updated
                if updated.get(CONF_TEMPO_MODE) == TEMPO_MODE_RTE:
                    return await self.async_step_tempo_rte()
                try:
                    return await self._persist(data_patch=patch)
                except ValueError as err:
                    errors = dict(err.args[0])
        return self._show_doc_form(
            step_id="tempo",
            data_schema=vol.Schema({vol.Required(CONF_TEMPO_MODE, default=data.get(CONF_TEMPO_MODE, TEMPO_MODE_RTE)): tempo_mode_selector()}),
            errors=errors,
        )

    async def async_step_tempo_rte(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = self._updated or dict(self.config_entry.data)
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("rte_credentials", data, user_input)
            if not errors:
                merged = _patched_copy(data, patch)
                auth_error = await _async_test_rte_credentials(
                    self.hass,
                    str(merged.get(CONF_RTE_CLIENT_ID)),
                    str(merged.get(CONF_RTE_CLIENT_SECRET)),
                )
                if auth_error:
                    errors["base"] = auth_error
                else:
                    try:
                        return await self._persist(data_patch=patch, base_data=data)
                    except ValueError as err:
                        errors = dict(err.args[0])
            elif errors == {"base": ERR_RTE_CREDS_REQUIRED}:
                errors = {"base": ERR_RTE_CREDS_REQUIRED}
        return self._show_doc_form(
            step_id="tempo_rte",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_RTE_CLIENT_ID, default=data.get(CONF_RTE_CLIENT_ID, "")): text_selector(),
                    vol.Optional(CONF_RTE_CLIENT_SECRET, default=""): text_selector(password=True),
                }
            ),
            errors=errors,
        )

    async def async_step_tariff_refresh(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = dict(self.config_entry.data)
        if data.get(CONF_SUPPLIER) != SUPPLIER_EDF:
            return self.async_abort(reason="not_edf_supplier")
        errors: dict[str, str] = {}
        if user_input is not None:
            patch, errors = _validate_step("tariff_refresh", data, user_input)
            if not errors:
                merged = _patched_copy(data, patch)
                tariffs, error = await _async_fetch_edf_tariffs(
                    self.hass,
                    str(merged.get(CONF_TARIFF_OFFER)),
                    str(merged.get(CONF_CONTRACT_POWER)),
                )
                if error:
                    errors["base"] = error
                else:
                    offer_key = str(merged.get(CONF_TARIFF_OFFER, "") or "").strip() or None
                    opt_patch = _tariff_options_from_payload(tariffs or {}, expected_offer=offer_key)
                    if opt_patch is None:
                        errors["base"] = ERR_TARIFF_PAYLOAD_INCOMPLETE
                    else:
                        try:
                            return await self._persist(
                                data_patch=patch,
                                options_patch=opt_patch,
                                reason="tariffs_fetched",
                            )
                        except ValueError as err:
                            errors = dict(err.args[0])
        return self._show_doc_form(
            step_id="tariff_refresh",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_TARIFF_OFFER, default=data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)): offer_selector(),
                    vol.Required(CONF_CONTRACT_POWER, default=data.get(CONF_CONTRACT_POWER, "9")): contract_power_selector_edf(),
                }
            ),
            errors=errors,
        )
