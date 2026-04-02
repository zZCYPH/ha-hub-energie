"""Config flow for Hub Énergie."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Final

import voluptuous as vol
from aiohttp import ClientError

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback, split_entity_id
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    BooleanSelector,
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
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX,
    CONF_BATT_SOC_MIN,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_BATTERY_SYSTEMS,
    CONF_CONTRACT_NAME,
    CONF_CONTRACT_POWER,
    CONF_CURRENCY,
    CONF_ENERGY_PRICE,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
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
    DOMAIN,
    GRID_POWER_SIGN_EXPORT_NEGATIVE,
    GRID_POWER_SIGN_OPTIONS,
    OPT_ABONNEMENT,
    OPT_FIXED_TTC,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_TARIFF_FETCHED_AT,
    PHASE_MONO,
    PHASE_OPTIONS,
    PHASE_TRI,
    PRICE_BASIS_OPTIONS,
    PRICE_BASIS_TTC,
    PRICING_FLAT,
    PRICING_SCHEDULE,
    PRICING_TIME_OF_USE,
    SOLAR_PERF_OPTIONS,
    SOLAR_PERF_STANDARD,
    SOLAR_SHADING_NONE,
    SOLAR_SHADING_OPTIONS,
    SOLAR_TILT_AUTO,
    SOLAR_TILT_MANUAL,
    SUPPLIER_EDF,
    SUPPLIER_OTHER,
    TARIFF_MODE_AUTO,
    TARIFF_MODE_MANUAL,
    TARIFF_OFFER_OPTIONS,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_API,
    TEMPO_MODE_RTE,
)

_LOGGER = logging.getLogger(__name__)


def _redact_user_input(value: Any) -> Any:
    """Redact secrets from flow logs."""
    if not isinstance(value, dict):
        return value
    redacted: dict[str, Any] = {}
    for k, v in value.items():
        key = str(k)
        low = key.lower()
        if any(x in low for x in ("secret", "password", "token")):
            redacted[key] = "***"
        else:
            redacted[key] = v
    return redacted


class _StepLoggingMixin:
    """Wrap all async_step_* methods to log inputs/results/exceptions."""

    def __getattribute__(self, name: str):  # noqa: ANN001
        attr = super().__getattribute__(name)
        if not name.startswith("async_step_") or not callable(attr):
            return attr

        cache = super().__getattribute__("__dict__").setdefault(
            "_ha_step_log_wrappers", {}
        )
        if name in cache:
            return cache[name]

        async def _wrapped(*args, **kwargs):  # noqa: ANN202
            user_input = None
            if args:
                user_input = args[0]
            elif "user_input" in kwargs:
                user_input = kwargs.get("user_input")

            _LOGGER.debug(
                "[flow] enter %s.%s user_input=%s",
                self.__class__.__name__,
                name,
                _redact_user_input(user_input),
            )
            try:
                res = await attr(*args, **kwargs)
            except Exception as err:  # noqa: BLE001
                _LOGGER.exception(
                    "[flow] exception in %s.%s user_input=%s err=%s",
                    self.__class__.__name__,
                    name,
                    _redact_user_input(user_input),
                    err,
                )
                raise

            try:
                rtype = res.get("type") if isinstance(res, dict) else type(res).__name__
                step_id = res.get("step_id") if isinstance(res, dict) else None
            except Exception:  # noqa: BLE001
                rtype = type(res).__name__
                step_id = None

            _LOGGER.debug(
                "[flow] exit  %s.%s type=%s step_id=%s",
                self.__class__.__name__,
                name,
                rtype,
                step_id,
            )
            return res

        cache[name] = _wrapped
        return _wrapped


# ── Selectors ─────────────────────────────────────────────────────────────────

# Sensor, helper, or `number.*` (e.g. Zendure SOC limits).
_ENTITY_DOMAINS_NUMERIC: Final[list[str]] = ["sensor", "input_number", "number"]


def _energy_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain=["sensor"],
            device_class=SensorDeviceClass.ENERGY,
            multiple=False,
        )
    )


def _power_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain=["sensor"],
            device_class=SensorDeviceClass.POWER,
            multiple=False,
        )
    )


def _soc_entity_selector() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain=_ENTITY_DOMAINS_NUMERIC,
            multiple=False,
        )
    )


def _optional_energy_entity() -> vol.Any:
    return vol.Any(None, _energy_entity_selector())


def _optional_power_entity() -> vol.Any:
    return vol.Any(None, _power_entity_selector())


def _optional_soc_entity() -> vol.Any:
    return vol.Any(None, _soc_entity_selector())


def _optional_number_entity() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain=_ENTITY_DOMAINS_NUMERIC, multiple=False)
    )


def _optional_percentage_entity() -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain=_ENTITY_DOMAINS_NUMERIC, multiple=False)
    )


def _validate_not_both(
    errors: dict[str, str],
    user_input: dict[str, Any],
    value_key: str,
    entity_key: str,
    error_code: str,
) -> None:
    """Enforce that value_key and entity_key are not both provided."""
    if user_input.get(value_key) is not None and user_input.get(entity_key):
        errors["base"] = error_code


def _supplier_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=SUPPLIER_EDF, label="EDF"),
                SelectOptionDict(value=SUPPLIER_OTHER, label="Autre fournisseur"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _phase_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v.capitalize())
                for v in PHASE_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _tariff_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=TARIFF_MODE_AUTO, label="Automatique (API EDF)"),
                SelectOptionDict(value=TARIFF_MODE_MANUAL, label="Manuel"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _contract_power_selector_edf() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=f"{v} kVA")
                for v in CONTRACT_POWER_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _contract_power_selector_other() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=1,
            max=120,
            mode=NumberSelectorMode.BOX,
            unit_of_measurement="kVA",
        )
    )


def _offer_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v.upper())
                for v in TARIFF_OFFER_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _pricing_structure_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=PRICING_FLAT, label="Forfait fixe"),
                SelectOptionDict(value=PRICING_TIME_OF_USE, label="Heures pleines / creuses"),
                SelectOptionDict(value=PRICING_SCHEDULE, label="Grille horaire avancée"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _price_basis_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v)
                for v in PRICE_BASIS_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _grid_power_sign_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v)
                for v in GRID_POWER_SIGN_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _tempo_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=TEMPO_MODE_RTE, label="RTE (API officielle)"),
                SelectOptionDict(value=TEMPO_MODE_API, label="API Couleur Tempo"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _solar_shading_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v.capitalize())
                for v in SOLAR_SHADING_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _solar_performance_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=v, label=v.capitalize())
                for v in SOLAR_PERF_OPTIONS
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _solar_tilt_mode_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(value=SOLAR_TILT_AUTO, label="Auto (optimisé par latitude)"),
                SelectOptionDict(value=SOLAR_TILT_MANUAL, label="Manuel"),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


def _batt_net_sign_selector() -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=[
                SelectOptionDict(
                    value=BATT_SIGN_POSITIVE_DISCHARGE,
                    label="Positif = décharge",
                ),
                SelectOptionDict(
                    value=BATT_SIGN_POSITIVE_CHARGE,
                    label="Positif = charge",
                ),
            ],
            mode=SelectSelectorMode.DROPDOWN,
        )
    )


# ── Validation helpers ────────────────────────────────────────────────────────


async def _validate_energy_entity(
    hass: HomeAssistant, entity_id: str | None, *, required: bool
) -> str | None:
    if not entity_id:
        if required:
            raise vol.Invalid("required")
        return None
    state = hass.states.get(entity_id)
    if state is None:
        raise vol.Invalid("entity_not_found")
    sc = state.attributes.get("state_class")
    if sc not in ("total_increasing", "total", "measurement"):
        _LOGGER.warning(
            "Entity %s may lack correct state_class for energy (got %s)",
            entity_id,
            sc,
        )
    return entity_id


async def _validate_power_entity(
    hass: HomeAssistant, entity_id: str | None, *, required: bool
) -> str | None:
    if not entity_id:
        if required:
            raise vol.Invalid("required")
        return None
    state = hass.states.get(entity_id)
    if state is None:
        raise vol.Invalid("entity_not_found")
    uom = (state.attributes.get("unit_of_measurement") or "").lower()
    dc = state.attributes.get("device_class")
    if uom not in ("w", "kw") and dc not in (SensorDeviceClass.POWER, "power", None):
        raise vol.Invalid("not_power")
    return entity_id


async def _validate_soc_entity(
    hass: HomeAssistant, entity_id: str | None, *, required: bool
) -> str | None:
    if not entity_id:
        if required:
            raise vol.Invalid("required")
        return None
    state = hass.states.get(entity_id)
    if state is None:
        raise vol.Invalid("entity_not_found")
    attrs = state.attributes
    uom = str(
        attrs.get("unit_of_measurement") or attrs.get("native_unit_of_measurement") or ""
    ).strip()
    uom_l = uom.lower()
    if uom_l in ("%", "percent") or uom_l.endswith("%"):
        return entity_id
    if split_entity_id(entity_id)[0] == "number":
        try:
            v = float(state.state)
        except (TypeError, ValueError) as err:
            raise vol.Invalid("not_numeric") from err
        if not 0 <= v <= 100:
            raise vol.Invalid("invalid_soc_entity")
        return entity_id
    try:
        float(state.state)
    except (TypeError, ValueError) as err:
        raise vol.Invalid("not_numeric") from err
    return entity_id


def _parse_json_input(raw: str, *, field_name: str) -> list[dict[str, Any]]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as err:
        raise vol.Invalid(f"{field_name}_invalid_json") from err
    if not isinstance(data, list):
        raise vol.Invalid(f"{field_name}_not_list")
    for item in data:
        if not isinstance(item, dict):
            raise vol.Invalid(f"{field_name}_items_not_objects")
    return data


# ── Config flow ───────────────────────────────────────────────────────────────


class HubEnergieConfigFlow(_StepLoggingMixin, ConfigFlow, domain=DOMAIN):
    """Multi-step setup wizard for Hub Énergie."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._options: dict[str, Any] = {}
        self._batteries: list[dict[str, Any]] = []
        self._current_battery: dict[str, Any] = {}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: Any) -> OptionsFlow:
        return HubEnergieOptionsFlow()

    # ── Step 1: Supplier + phase type ─────────────────────────────────────────

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            supplier = user_input[CONF_SUPPLIER]
            phase_type = user_input[CONF_PHASE_TYPE]
            self._data[CONF_SUPPLIER] = supplier
            self._data[CONF_PHASE_TYPE] = phase_type

            if supplier == SUPPLIER_OTHER:
                return await self.async_step_supplier_custom()
            return await self.async_step_tariff_mode()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SUPPLIER, default=SUPPLIER_EDF
                    ): _supplier_selector(),
                    vol.Required(
                        CONF_PHASE_TYPE, default=PHASE_MONO
                    ): _phase_selector(),
                }
            ),
            errors=errors,
        )

    async def async_step_supplier_custom(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = (user_input.get(CONF_SUPPLIER_CUSTOM_NAME) or "").strip()
            if not name:
                errors["base"] = "supplier_name_required"
            else:
                self._data[CONF_SUPPLIER_CUSTOM_NAME] = name
                return await self.async_step_tariff_mode_manual_only()

        return self.async_show_form(
            step_id="supplier_custom",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SUPPLIER_CUSTOM_NAME): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                }
            ),
            errors=errors,
        )

    # ── Step 2: Tariff mode ───────────────────────────────────────────────────

    async def async_step_tariff_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_TARIFF_MODE] = user_input[CONF_TARIFF_MODE]
            return await self.async_step_contract()

        return self.async_show_form(
            step_id="tariff_mode",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TARIFF_MODE, default=TARIFF_MODE_AUTO
                    ): _tariff_mode_selector(),
                }
            ),
        )

    async def async_step_tariff_mode_manual_only(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            self._data[CONF_TARIFF_MODE] = TARIFF_MODE_MANUAL
            return await self.async_step_contract()

        return self.async_show_form(
            step_id="tariff_mode_manual_only",
            data_schema=vol.Schema({}),
            description_placeholders={
                "info": (
                    "La récupération automatique des tarifs n'est pas encore "
                    "disponible pour ce fournisseur. Le mode manuel sera utilisé."
                ),
            },
        )

    # ── Step 3: Contract basics ───────────────────────────────────────────────

    async def async_step_contract(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        is_edf = self._data.get(CONF_SUPPLIER) == SUPPLIER_EDF

        if user_input is not None:
            power_raw = user_input.get(CONF_CONTRACT_POWER)
            self._data[CONF_CONTRACT_POWER] = (
                str(power_raw) if is_edf else str(int(power_raw)) if power_raw else "9"
            )
            name = (user_input.get(CONF_CONTRACT_NAME) or "").strip()
            if name:
                self._data[CONF_CONTRACT_NAME] = name

            if self._data.get(CONF_TARIFF_MODE) == TARIFF_MODE_AUTO:
                return await self.async_step_edf_offer()
            return await self.async_step_manual_pricing()

        schema_dict: dict[Any, Any] = {}
        if is_edf:
            schema_dict[vol.Required(CONF_CONTRACT_POWER, default="9")] = (
                _contract_power_selector_edf()
            )
        else:
            schema_dict[vol.Required(CONF_CONTRACT_POWER, default=9)] = (
                _contract_power_selector_other()
            )
        schema_dict[vol.Optional(CONF_CONTRACT_NAME)] = TextSelector(
            TextSelectorConfig(type=TextSelectorType.TEXT)
        )

        return self.async_show_form(
            step_id="contract",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
        )

    # ── Step 4a: EDF auto path ────────────────────────────────────────────────

    async def async_step_edf_offer(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            offer = user_input[CONF_TARIFF_OFFER]
            self._data[CONF_TARIFF_OFFER] = offer
            if offer == TARIFF_OFFER_TEMPO:
                return await self.async_step_edf_tempo()
            return await self._edf_fetch_and_continue()

        return self.async_show_form(
            step_id="edf_offer",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TARIFF_OFFER, default=TARIFF_OFFER_TEMPO
                    ): _offer_selector(),
                }
            ),
            errors=errors,
        )

    async def async_step_edf_tempo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            tempo_mode = user_input.get(CONF_TEMPO_MODE, TEMPO_MODE_RTE)
            self._data[CONF_TEMPO_MODE] = tempo_mode
            if tempo_mode == TEMPO_MODE_RTE:
                return await self.async_step_edf_tempo_rte()
            return await self._edf_fetch_and_continue()

        return self.async_show_form(
            step_id="edf_tempo",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TEMPO_MODE, default=TEMPO_MODE_RTE
                    ): _tempo_mode_selector(),
                }
            ),
            errors=errors,
        )

    async def async_step_edf_tempo_rte(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """RTE credentials step (shown only when tempo_mode == RTE)."""
        errors: dict[str, str] = {}
        if user_input is not None:
            cid = (user_input.get(CONF_RTE_CLIENT_ID) or "").strip()
            secret = (user_input.get(CONF_RTE_CLIENT_SECRET) or "").strip()
            if not cid or not secret:
                errors["base"] = "rte_creds_required"
            else:
                session = async_get_clientsession(self.hass)
                try:
                    from .providers.edf import async_test_rte_credentials

                    await async_test_rte_credentials(session, cid, secret)
                except (ClientError, TimeoutError, ValueError) as err:
                    _LOGGER.warning("RTE credential test failed: %s", err)
                    errors["base"] = "rte_auth_failed"
                else:
                    self._data[CONF_RTE_CLIENT_ID] = cid
                    self._data[CONF_RTE_CLIENT_SECRET] = secret
                    return await self._edf_fetch_and_continue()

        return self.async_show_form(
            step_id="edf_tempo_rte",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_RTE_CLIENT_ID): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Required(CONF_RTE_CLIENT_SECRET): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.PASSWORD)
                    ),
                }
            ),
            errors=errors,
        )

    async def _edf_fetch_and_continue(self) -> ConfigFlowResult:
        offer = self._data.get(CONF_TARIFF_OFFER, "")
        power = self._data.get(CONF_CONTRACT_POWER, "9")

        session = async_get_clientsession(self.hass)
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
            return self.async_show_form(
                step_id="edf_offer",
                data_schema=vol.Schema(
                    {
                        vol.Required(
                            CONF_TARIFF_OFFER, default=offer
                        ): _offer_selector(),
                    }
                ),
                errors={"base": "tariff_fetch_failed"},
            )

        self._options.update(
            {
                OPT_BLEU_HC: tariffs.get("hc_bleu_ttc", 0),
                OPT_BLEU_HP: tariffs.get("hp_bleu_ttc", 0),
                OPT_BLANC_HC: tariffs.get("hc_blanc_ttc", 0),
                OPT_BLANC_HP: tariffs.get("hp_blanc_ttc", 0),
                OPT_ROUGE_HC: tariffs.get("hc_rouge_ttc", 0),
                OPT_ROUGE_HP: tariffs.get("hp_rouge_ttc", 0),
                OPT_FIXED_TTC: tariffs.get("fixed_ttc", 0),
                OPT_ABONNEMENT: 0,
                OPT_TARIFF_FETCHED_AT: tariffs.get("fetched_at"),
            }
        )
        self._data[CONF_TARIFF_SOURCE] = "auto"
        _LOGGER.info(
            "EDF tariffs fetched for offer=%s, %s kVA", offer, power
        )
        return await self.async_step_grid()

    # ── Step 4b: Manual tariff path ───────────────────────────────────────────

    async def async_step_manual_pricing(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            structure = user_input[CONF_PRICING_STRUCTURE]
            self._data[CONF_PRICING_STRUCTURE] = structure
            self._data[CONF_PRICE_BASIS] = user_input.get(
                CONF_PRICE_BASIS, PRICE_BASIS_TTC
            )
            self._data[CONF_CURRENCY] = (
                user_input.get(CONF_CURRENCY) or "EUR"
            ).strip()
            self._data[CONF_TARIFF_SOURCE] = "manual"

            if structure == PRICING_FLAT:
                return await self.async_step_manual_flat()
            if structure == PRICING_TIME_OF_USE:
                return await self.async_step_manual_tou()
            return await self.async_step_manual_schedule()

        return self.async_show_form(
            step_id="manual_pricing",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_PRICING_STRUCTURE, default=PRICING_FLAT
                    ): _pricing_structure_selector(),
                    vol.Required(
                        CONF_PRICE_BASIS, default=PRICE_BASIS_TTC
                    ): _price_basis_selector(),
                    vol.Optional(CONF_CURRENCY, default="EUR"): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_manual_flat(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            ep = user_input.get(CONF_ENERGY_PRICE)
            if ep is None or ep < 0:
                errors["base"] = "invalid_price"
            else:
                self._data[CONF_ENERGY_PRICE] = float(ep)
                sp = user_input.get(CONF_SUBSCRIPTION_PRICE, 0)
                self._data[CONF_SUBSCRIPTION_PRICE] = float(sp) if sp else 0.0
                return await self.async_step_grid()

        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self.async_show_form(
            step_id="manual_flat",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_ENERGY_PRICE): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=5,
                            step=0.01,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement=f"{currency}/kWh",
                        )
                    ),
                    vol.Optional(
                        CONF_SUBSCRIPTION_PRICE, default=0
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=1000,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement=f"{currency}/mois",
                        )
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_manual_tou(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            raw = user_input.get(CONF_TOU_PERIODS, "")
            try:
                periods = _parse_json_input(raw, field_name="tou_periods")
                if not periods:
                    raise vol.Invalid("tou_periods_empty")
                for p in periods:
                    if "price" not in p:
                        raise vol.Invalid("tou_periods_missing_price")
            except vol.Invalid as err:
                errors["base"] = str(err)
            else:
                self._data[CONF_TOU_PERIODS] = periods
                sp = user_input.get(CONF_SUBSCRIPTION_PRICE, 0)
                self._data[CONF_SUBSCRIPTION_PRICE] = float(sp) if sp else 0.0
                return await self.async_step_grid()

        currency = self._data.get(CONF_CURRENCY, "EUR")
        default_tou = json.dumps(
            [
                {
                    "name": "HC",
                    "price": 0.1296,
                    "start": "22:00",
                    "end": "06:00",
                },
                {
                    "name": "HP",
                    "price": 0.1609,
                    "start": "06:00",
                    "end": "22:00",
                },
            ],
            indent=2,
            ensure_ascii=False,
        )
        return self.async_show_form(
            step_id="manual_tou",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TOU_PERIODS, default=default_tou
                    ): TextSelector(
                        TextSelectorConfig(
                            type=TextSelectorType.TEXT, multiline=True
                        )
                    ),
                    vol.Optional(
                        CONF_SUBSCRIPTION_PRICE, default=0
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=1000,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement=f"{currency}/mois",
                        )
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_manual_schedule(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            raw = user_input.get(CONF_SCHEDULE_SLOTS, "")
            try:
                slots = _parse_json_input(raw, field_name="schedule_slots")
                if not slots:
                    raise vol.Invalid("schedule_slots_empty")
                for s in slots:
                    for k in ("start", "end", "price"):
                        if k not in s:
                            raise vol.Invalid(f"schedule_slots_missing_{k}")
            except vol.Invalid as err:
                errors["base"] = str(err)
            else:
                self._data[CONF_SCHEDULE_SLOTS] = slots
                sp = user_input.get(CONF_SUBSCRIPTION_PRICE, 0)
                self._data[CONF_SUBSCRIPTION_PRICE] = float(sp) if sp else 0.0
                return await self.async_step_grid()

        currency = self._data.get(CONF_CURRENCY, "EUR")
        default_slots = json.dumps(
            [
                {
                    "start": "00:00",
                    "end": "06:00",
                    "price": 0.12,
                    "day_type": "all",
                    "name": "Nuit",
                },
                {
                    "start": "06:00",
                    "end": "22:00",
                    "price": 0.18,
                    "day_type": "weekdays",
                    "name": "Jour semaine",
                },
                {
                    "start": "06:00",
                    "end": "22:00",
                    "price": 0.15,
                    "day_type": "weekends",
                    "name": "Jour week-end",
                },
                {
                    "start": "22:00",
                    "end": "00:00",
                    "price": 0.12,
                    "day_type": "all",
                    "name": "Soirée",
                },
            ],
            indent=2,
            ensure_ascii=False,
        )
        return self.async_show_form(
            step_id="manual_schedule",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SCHEDULE_SLOTS, default=default_slots
                    ): TextSelector(
                        TextSelectorConfig(
                            type=TextSelectorType.TEXT, multiline=True
                        )
                    ),
                    vol.Optional(
                        CONF_SUBSCRIPTION_PRICE, default=0
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=1000,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement=f"{currency}/mois",
                        )
                    ),
                }
            ),
            errors=errors,
        )

    # ── Step 5: Grid sensors ──────────────────────────────────────────────────

    async def async_step_grid(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await _validate_energy_entity(
                    self.hass,
                    user_input.get(CONF_GRID_IMPORT_ENERGY),
                    required=True,
                )
                await _validate_energy_entity(
                    self.hass,
                    user_input.get(CONF_GRID_EXPORT_ENERGY),
                    required=False,
                )
                await _validate_power_entity(
                    self.hass,
                    user_input.get(CONF_GRID_POWER_SENSOR),
                    required=False,
                )
                await _validate_power_entity(
                    self.hass,
                    user_input.get(CONF_LOAD_POWER_SENSOR),
                    required=False,
                )
            except vol.Invalid as err:
                errors["base"] = str(err)
            else:
                self._data[CONF_GRID_IMPORT_ENERGY] = user_input[
                    CONF_GRID_IMPORT_ENERGY
                ]
                self._data[CONF_GRID_POWER_SIGN_MODE] = user_input.get(
                    CONF_GRID_POWER_SIGN_MODE, GRID_POWER_SIGN_EXPORT_NEGATIVE
                )
                for key in (
                    CONF_GRID_EXPORT_ENERGY,
                    CONF_GRID_POWER_SENSOR,
                    CONF_LOAD_POWER_SENSOR,
                ):
                    val = user_input.get(key)
                    if val:
                        self._data[key] = val

                if self._data.get(CONF_PHASE_TYPE) == PHASE_TRI:
                    return await self.async_step_grid_phases()
                return await self.async_step_solar()

        return self.async_show_form(
            step_id="grid",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_GRID_IMPORT_ENERGY
                    ): _energy_entity_selector(),
                    vol.Optional(
                        CONF_GRID_EXPORT_ENERGY
                    ): _optional_energy_entity(),
                    vol.Optional(
                        CONF_GRID_POWER_SENSOR
                    ): _optional_power_entity(),
                    vol.Required(
                        CONF_GRID_POWER_SIGN_MODE,
                        default=GRID_POWER_SIGN_EXPORT_NEGATIVE,
                    ): _grid_power_sign_selector(),
                    vol.Optional(
                        CONF_LOAD_POWER_SENSOR
                    ): _optional_power_entity(),
                }
            ),
            errors=errors,
        )

    async def async_step_grid_phases(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            phase_data: dict[str, Any] = {}
            for key in (
                CONF_GRID_IMPORT_ENERGY_PHASES,
                CONF_GRID_EXPORT_ENERGY_PHASES,
                CONF_GRID_POWER_PHASES,
            ):
                raw = (user_input.get(key) or "").strip()
                if raw:
                    try:
                        parsed = _parse_json_input(raw, field_name=key)
                        phase_data[key] = parsed
                    except vol.Invalid as err:
                        errors["base"] = str(err)
                        break

            if not errors:
                self._data.update(phase_data)
                return await self.async_step_solar()

        default_phases = json.dumps(
            [
                {"phase": 1, "entity_id": ""},
                {"phase": 2, "entity_id": ""},
                {"phase": 3, "entity_id": ""},
            ],
            indent=2,
        )
        return self.async_show_form(
            step_id="grid_phases",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_GRID_IMPORT_ENERGY_PHASES, default=default_phases
                    ): TextSelector(
                        TextSelectorConfig(
                            type=TextSelectorType.TEXT, multiline=True
                        )
                    ),
                    vol.Optional(CONF_GRID_EXPORT_ENERGY_PHASES): TextSelector(
                        TextSelectorConfig(
                            type=TextSelectorType.TEXT, multiline=True
                        )
                    ),
                    vol.Optional(CONF_GRID_POWER_PHASES): TextSelector(
                        TextSelectorConfig(
                            type=TextSelectorType.TEXT, multiline=True
                        )
                    ),
                }
            ),
            errors=errors,
        )

    # ── Step 6: Solar ─────────────────────────────────────────────────────────

    async def async_step_solar(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            has_solar = user_input.get(CONF_HAS_SOLAR, False)
            self._data[CONF_HAS_SOLAR] = has_solar
            if has_solar:
                try:
                    return await self.async_step_solar_config()
                except Exception as err:  # noqa: BLE001
                    _LOGGER.exception("Solar step transition failed: %s", err)
                    errors["base"] = str(err) or "unknown_error"
            return await self.async_step_battery()

        return self.async_show_form(
            step_id="solar",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HAS_SOLAR, default=False
                    ): BooleanSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_solar_config(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await _validate_energy_entity(
                    self.hass,
                    user_input.get(CONF_SOLAR_ENERGY),
                    required=True,
                )
                await _validate_power_entity(
                    self.hass,
                    user_input.get(CONF_SOLAR_POWER_SENSOR),
                    required=False,
                )
            except vol.Invalid as err:
                errors["base"] = str(err)
            else:
                self._data[CONF_SOLAR_ENERGY] = user_input[CONF_SOLAR_ENERGY]
                val = user_input.get(CONF_SOLAR_POWER_SENSOR)
                if val:
                    self._data[CONF_SOLAR_POWER_SENSOR] = val

                resale = user_input.get(CONF_SOLAR_RESALE_CONTRACT, False)
                self._data[CONF_SOLAR_RESALE_CONTRACT] = resale
                if resale:
                    tariff = user_input.get(CONF_SOLAR_EXPORT_TARIFF)
                    if tariff is not None:
                        self._data[CONF_SOLAR_EXPORT_TARIFF] = float(tariff)

                estimation = user_input.get(
                    CONF_SOLAR_ESTIMATION_ENABLED, False
                )
                self._data[CONF_SOLAR_ESTIMATION_ENABLED] = estimation
                if estimation:
                    return await self.async_step_solar_estimation()
                return await self.async_step_battery()

        currency = self._data.get(CONF_CURRENCY, "EUR")
        return self.async_show_form(
            step_id="solar_config",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SOLAR_ENERGY
                    ): _energy_entity_selector(),
                    vol.Optional(
                        CONF_SOLAR_POWER_SENSOR
                    ): _optional_power_entity(),
                    vol.Required(
                        CONF_SOLAR_RESALE_CONTRACT, default=False
                    ): BooleanSelector(),
                    vol.Optional(CONF_SOLAR_EXPORT_TARIFF): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=1,
                            step=0.01,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement=f"{currency}/kWh",
                        )
                    ),
                    vol.Required(
                        CONF_SOLAR_ESTIMATION_ENABLED, default=False
                    ): BooleanSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_solar_estimation(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            peak = user_input.get(CONF_SOLAR_PEAK_POWER)
            if not peak or peak <= 0:
                errors["base"] = "peak_power_required"
            else:
                lat = user_input.get(CONF_SOLAR_LOCATION_LAT)
                lon = user_input.get(CONF_SOLAR_LOCATION_LON)
                self._data[CONF_SOLAR_LOCATION_LAT] = (
                    float(lat) if lat else self.hass.config.latitude
                )
                self._data[CONF_SOLAR_LOCATION_LON] = (
                    float(lon) if lon else self.hass.config.longitude
                )
                self._data[CONF_SOLAR_PEAK_POWER] = float(peak)
                self._data[CONF_SOLAR_ORIENTATION] = user_input.get(
                    CONF_SOLAR_ORIENTATION, 180
                )
                tilt_mode = user_input.get(
                    CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO
                )
                self._data[CONF_SOLAR_TILT_MODE] = tilt_mode
                if tilt_mode == SOLAR_TILT_MANUAL:
                    self._data[CONF_SOLAR_TILT] = user_input.get(
                        CONF_SOLAR_TILT, 35
                    )
                self._data[CONF_SOLAR_SHADING] = user_input.get(
                    CONF_SOLAR_SHADING, SOLAR_SHADING_NONE
                )
                self._data[CONF_SOLAR_PERFORMANCE] = user_input.get(
                    CONF_SOLAR_PERFORMANCE, SOLAR_PERF_STANDARD
                )
                return await self.async_step_battery()

        ha_lat = self.hass.config.latitude
        ha_lon = self.hass.config.longitude
        return self.async_show_form(
            step_id="solar_estimation",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SOLAR_LOCATION_LAT, default=ha_lat
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=-90,
                            max=90,
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Required(
                        CONF_SOLAR_LOCATION_LON, default=ha_lon
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=-180,
                            max=180,
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Required(CONF_SOLAR_PEAK_POWER): NumberSelector(
                        NumberSelectorConfig(
                            min=0.1,
                            max=1000,
                            step=0.01,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="kWc",
                        )
                    ),
                    vol.Required(
                        CONF_SOLAR_ORIENTATION, default=180
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=360,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="°",
                        )
                    ),
                    vol.Required(
                        CONF_SOLAR_TILT_MODE, default=SOLAR_TILT_AUTO
                    ): _solar_tilt_mode_selector(),
                    vol.Optional(
                        CONF_SOLAR_TILT, default=35
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=90,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="°",
                        )
                    ),
                    vol.Required(
                        CONF_SOLAR_SHADING, default=SOLAR_SHADING_NONE
                    ): _solar_shading_selector(),
                    vol.Required(
                        CONF_SOLAR_PERFORMANCE, default=SOLAR_PERF_STANDARD
                    ): _solar_performance_selector(),
                }
            ),
            errors=errors,
        )

    # ── Step 7: Battery ───────────────────────────────────────────────────────

    async def async_step_battery(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            has_batt = user_input.get(CONF_HAS_BATTERIES, False)
            self._data[CONF_HAS_BATTERIES] = has_batt
            if has_batt:
                self._batteries = []
                return await self.async_step_battery_add()
            self._data[CONF_BATTERY_SYSTEMS] = []
            return await self._create_entry()

        return self.async_show_form(
            step_id="battery",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HAS_BATTERIES, default=False
                    ): BooleanSelector(),
                }
            ),
        )

    async def async_step_battery_add(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = (user_input.get(CONF_BATT_NAME) or "").strip()
            if not name:
                errors["base"] = "battery_name_required"
            else:
                try:
                    await _validate_energy_entity(
                        self.hass,
                        user_input.get(CONF_BATT_ENERGY_IN),
                        required=True,
                    )
                    await _validate_energy_entity(
                        self.hass,
                        user_input.get(CONF_BATT_ENERGY_OUT),
                        required=True,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_IN),
                        required=False,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_OUT),
                        required=False,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_NET),
                        required=False,
                    )
                    await _validate_soc_entity(
                        self.hass,
                        user_input.get(CONF_BATT_SOC),
                        required=False,
                    )
                except vol.Invalid as err:
                    errors["base"] = str(err)
                else:
                    batt: dict[str, Any] = {
                        "id": uuid.uuid4().hex[:8],
                        CONF_BATT_NAME: name,
                        CONF_BATT_ENERGY_IN: user_input[CONF_BATT_ENERGY_IN],
                        CONF_BATT_ENERGY_OUT: user_input[CONF_BATT_ENERGY_OUT],
                    }
                    for key in (
                        CONF_BATT_POWER_IN,
                        CONF_BATT_POWER_OUT,
                        CONF_BATT_POWER_NET,
                        CONF_BATT_SOC,
                    ):
                        val = user_input.get(key)
                        if val:
                            batt[key] = val

                    if user_input.get(CONF_BATT_POWER_NET):
                        batt[CONF_BATT_POWER_NET_SIGN] = user_input.get(
                            CONF_BATT_POWER_NET_SIGN,
                            BATT_SIGN_POSITIVE_DISCHARGE,
                        )

                    self._current_battery = batt
                    want_advanced = user_input.get(CONF_BATT_ADVANCED, False)
                    if want_advanced:
                        return await self.async_step_battery_advanced()
                    self._batteries.append(batt)
                    return await self.async_step_battery_more()

        n = len(self._batteries) + 1
        # In HA config flows, the schema is static for the current step render.
        # We only show the "net sign" selector when using a net power sensor.
        show_net_sign = bool((user_input or {}).get(CONF_BATT_POWER_NET))
        return self.async_show_form(
            step_id="battery_add",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_BATT_NAME, default=f"Batterie {n}"
                    ): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Required(
                        CONF_BATT_ENERGY_IN
                    ): _energy_entity_selector(),
                    vol.Required(
                        CONF_BATT_ENERGY_OUT
                    ): _energy_entity_selector(),
                    vol.Optional(
                        CONF_BATT_POWER_IN
                    ): _optional_power_entity(),
                    vol.Optional(
                        CONF_BATT_POWER_OUT
                    ): _optional_power_entity(),
                    vol.Optional(
                        CONF_BATT_POWER_NET
                    ): _optional_power_entity(),
                    **(
                        {
                            vol.Optional(
                                CONF_BATT_POWER_NET_SIGN
                            ): _batt_net_sign_selector(),
                        }
                        if show_net_sign
                        else {}
                    ),
                    vol.Optional(CONF_BATT_SOC): _optional_soc_entity(),
                    vol.Optional(
                        CONF_BATT_ADVANCED, default=False
                    ): BooleanSelector(),
                }
            ),
            errors=errors,
            description_placeholders={"battery_number": str(n)},
        )

    async def async_step_battery_advanced(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_CAPACITY_KWH,
                CONF_BATT_CAPACITY_KWH_ENTITY,
                "battery_adv_capacity_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_MAX_CHARGE_W,
                CONF_BATT_MAX_CHARGE_W_ENTITY,
                "battery_adv_max_charge_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_MAX_DISCHARGE_W,
                CONF_BATT_MAX_DISCHARGE_W_ENTITY,
                "battery_adv_max_discharge_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_SOC_MIN,
                CONF_BATT_SOC_MIN_ENTITY,
                "battery_adv_soc_min_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_SOC_MAX,
                CONF_BATT_SOC_MAX_ENTITY,
                "battery_adv_soc_max_not_both",
            )

            if not errors:
                for key in (
                    CONF_BATT_CAPACITY_KWH,
                    CONF_BATT_MAX_CHARGE_W,
                    CONF_BATT_MAX_DISCHARGE_W,
                    CONF_BATT_SOC_MIN,
                    CONF_BATT_SOC_MAX,
                ):
                    val = user_input.get(key)
                    if val is not None:
                        self._current_battery[key] = float(val)
                    else:
                        self._current_battery.pop(key, None)

                for key in (
                    CONF_BATT_CAPACITY_KWH_ENTITY,
                    CONF_BATT_MAX_CHARGE_W_ENTITY,
                    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
                    CONF_BATT_SOC_MIN_ENTITY,
                    CONF_BATT_SOC_MAX_ENTITY,
                ):
                    ent = user_input.get(key)
                    if ent:
                        self._current_battery[key] = ent
                    else:
                        self._current_battery.pop(key, None)

            if not errors:
                self._batteries.append(self._current_battery)
                self._current_battery = {}
                return await self.async_step_battery_more()

        return self.async_show_form(
            step_id="battery_advanced",
            data_schema=vol.Schema(
                {
                    # For each setting: entity first, then manual value (same heading in
                    # translations) so the form reads as “X — capteur” then “X — saisie”.
                    vol.Optional(
                        CONF_BATT_CAPACITY_KWH_ENTITY
                    ): _optional_number_entity(),
                    vol.Optional(CONF_BATT_CAPACITY_KWH): NumberSelector(
                        NumberSelectorConfig(
                            min=0.1,
                            max=500,
                            step=0.01,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="kWh",
                        )
                    ),
                    vol.Optional(
                        CONF_BATT_MAX_CHARGE_W_ENTITY
                    ): _optional_number_entity(),
                    vol.Optional(CONF_BATT_MAX_CHARGE_W): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=50000,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="W",
                        )
                    ),
                    vol.Optional(
                        CONF_BATT_MAX_DISCHARGE_W_ENTITY
                    ): _optional_number_entity(),
                    vol.Optional(CONF_BATT_MAX_DISCHARGE_W): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=50000,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="W",
                        )
                    ),
                    vol.Optional(CONF_BATT_SOC_MIN_ENTITY): _optional_percentage_entity(),
                    vol.Optional(CONF_BATT_SOC_MIN): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=100,
                            step=0.1,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="%",
                        )
                    ),
                    vol.Optional(CONF_BATT_SOC_MAX_ENTITY): _optional_percentage_entity(),
                    vol.Optional(CONF_BATT_SOC_MAX): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=100,
                            step=0.1,
                            mode=NumberSelectorMode.BOX,
                            unit_of_measurement="%",
                        )
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_battery_more(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            if user_input.get("add_another", False):
                return await self.async_step_battery_add()
            self._data[CONF_BATTERY_SYSTEMS] = self._batteries
            return await self._create_entry()

        return self.async_show_form(
            step_id="battery_more",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "add_another", default=False
                    ): BooleanSelector(),
                }
            ),
            description_placeholders={
                "battery_count": str(len(self._batteries)),
            },
        )

    # ── Step 8: Create entry ──────────────────────────────────────────────────

    async def _create_entry(self) -> ConfigFlowResult:
        grid_entity = self._data.get(CONF_GRID_IMPORT_ENERGY, "unknown")
        supplier = self._data.get(CONF_SUPPLIER, "unknown")
        unique = f"{supplier}_{grid_entity}"

        await self.async_set_unique_id(unique)
        self._abort_if_unique_id_configured()

        supplier_label = (
            self._data.get(CONF_SUPPLIER_CUSTOM_NAME)
            or self._data.get(CONF_SUPPLIER, "").upper()
        )
        title = f"Hub Énergie – {supplier_label}"

        return self.async_create_entry(
            title=title,
            data=self._data,
            options=self._options,
        )


# ── Options flow (menu-based) ─────────────────────────────────────────────────


class HubEnergieOptionsFlow(_StepLoggingMixin, OptionsFlow):
    """Post-setup configuration via menu."""

    def __init__(self) -> None:
        self._updated: dict[str, Any] = {}
        self._batteries: list[dict[str, Any]] = []
        self._current_battery: dict[str, Any] = {}
        self._edit_batt_index: int | None = None

    def _menu_options(self) -> list[str]:
        data = self.config_entry.data
        opts = ["offer", "grid", "solar", "battery"]
        if data.get(CONF_SUPPLIER) == SUPPLIER_EDF:
            opts.append("tariff_refresh")
            if data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_TEMPO:
                opts.append("tempo")
        return opts

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return self.async_show_menu(
            step_id="init",
            menu_options=self._menu_options(),
        )

    # ── Options: Offer ────────────────────────────────────────────────────────

    async def async_step_offer(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        data = self.config_entry.data

        if user_input is not None:
            new_data = {**data}
            new_data[CONF_SUPPLIER] = user_input.get(
                CONF_SUPPLIER, data.get(CONF_SUPPLIER)
            )
            custom = (
                user_input.get(CONF_SUPPLIER_CUSTOM_NAME, "") or ""
            ).strip()
            if custom:
                new_data[CONF_SUPPLIER_CUSTOM_NAME] = custom
            else:
                new_data.pop(CONF_SUPPLIER_CUSTOM_NAME, None)

            is_edf = new_data[CONF_SUPPLIER] == SUPPLIER_EDF
            power_raw = user_input.get(CONF_CONTRACT_POWER)
            if power_raw is not None:
                new_data[CONF_CONTRACT_POWER] = (
                    str(power_raw) if is_edf else str(int(power_raw))
                )
            name = (user_input.get(CONF_CONTRACT_NAME) or "").strip()
            if name:
                new_data[CONF_CONTRACT_NAME] = name
            else:
                new_data.pop(CONF_CONTRACT_NAME, None)

            self.hass.config_entries.async_update_entry(
                self.config_entry, data=new_data
            )
            await self.hass.config_entries.async_reload(
                self.config_entry.entry_id
            )
            return self.async_abort(reason="options_updated")

        is_edf = data.get(CONF_SUPPLIER) == SUPPLIER_EDF
        schema_dict: dict[Any, Any] = {
            vol.Required(
                CONF_SUPPLIER,
                default=data.get(CONF_SUPPLIER, SUPPLIER_EDF),
            ): _supplier_selector(),
        }
        if data.get(CONF_SUPPLIER) == SUPPLIER_OTHER:
            schema_dict[
                vol.Optional(
                    CONF_SUPPLIER_CUSTOM_NAME,
                    default=data.get(CONF_SUPPLIER_CUSTOM_NAME, ""),
                )
            ] = TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))

        if is_edf:
            schema_dict[
                vol.Required(
                    CONF_CONTRACT_POWER,
                    default=data.get(CONF_CONTRACT_POWER, "9"),
                )
            ] = _contract_power_selector_edf()
        else:
            schema_dict[
                vol.Required(
                    CONF_CONTRACT_POWER,
                    default=int(data.get(CONF_CONTRACT_POWER, 9)),
                )
            ] = _contract_power_selector_other()

        schema_dict[
            vol.Optional(
                CONF_CONTRACT_NAME,
                default=data.get(CONF_CONTRACT_NAME, ""),
            )
        ] = TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT))

        return self.async_show_form(
            step_id="offer",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
        )

    # ── Options: Grid ─────────────────────────────────────────────────────────

    async def async_step_grid(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        data = self.config_entry.data

        if user_input is not None:
            try:
                await _validate_energy_entity(
                    self.hass,
                    user_input.get(CONF_GRID_IMPORT_ENERGY),
                    required=True,
                )
                await _validate_energy_entity(
                    self.hass,
                    user_input.get(CONF_GRID_EXPORT_ENERGY),
                    required=False,
                )
                await _validate_power_entity(
                    self.hass,
                    user_input.get(CONF_GRID_POWER_SENSOR),
                    required=False,
                )
                await _validate_power_entity(
                    self.hass,
                    user_input.get(CONF_LOAD_POWER_SENSOR),
                    required=False,
                )
            except vol.Invalid as err:
                errors["base"] = str(err)
            else:
                new_data = {**data}
                new_data[CONF_GRID_IMPORT_ENERGY] = user_input[
                    CONF_GRID_IMPORT_ENERGY
                ]
                new_data[CONF_GRID_POWER_SIGN_MODE] = user_input.get(
                    CONF_GRID_POWER_SIGN_MODE,
                    GRID_POWER_SIGN_EXPORT_NEGATIVE,
                )
                for key in (
                    CONF_GRID_EXPORT_ENERGY,
                    CONF_GRID_POWER_SENSOR,
                    CONF_LOAD_POWER_SENSOR,
                ):
                    val = user_input.get(key)
                    if val:
                        new_data[key] = val
                    else:
                        new_data.pop(key, None)

                self.hass.config_entries.async_update_entry(
                    self.config_entry, data=new_data
                )
                await self.hass.config_entries.async_reload(
                    self.config_entry.entry_id
                )
                return self.async_abort(reason="options_updated")

        schema_dict: dict[Any, Any] = {
            vol.Required(
                CONF_GRID_IMPORT_ENERGY,
                default=data.get(CONF_GRID_IMPORT_ENERGY),
            ): _energy_entity_selector(),
        }
        preset = data.get(CONF_GRID_EXPORT_ENERGY)
        if preset:
            schema_dict[
                vol.Optional(CONF_GRID_EXPORT_ENERGY, default=preset)
            ] = _optional_energy_entity()
        else:
            schema_dict[
                vol.Optional(CONF_GRID_EXPORT_ENERGY)
            ] = _optional_energy_entity()

        schema_dict[
            vol.Required(
                CONF_GRID_POWER_SIGN_MODE,
                default=data.get(
                    CONF_GRID_POWER_SIGN_MODE,
                    GRID_POWER_SIGN_EXPORT_NEGATIVE,
                ),
            )
        ] = _grid_power_sign_selector()

        for key in (CONF_GRID_POWER_SENSOR, CONF_LOAD_POWER_SENSOR):
            preset = data.get(key)
            if preset:
                schema_dict[
                    vol.Optional(key, default=preset)
                ] = _optional_power_entity()
            else:
                schema_dict[vol.Optional(key)] = _optional_power_entity()

        return self.async_show_form(
            step_id="grid",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
        )

    # ── Options: Solar ────────────────────────────────────────────────────────

    async def async_step_solar(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        data = self.config_entry.data

        if user_input is not None:
            new_data = {**data}
            has_solar = user_input.get(CONF_HAS_SOLAR, False)
            new_data[CONF_HAS_SOLAR] = has_solar

            if has_solar:
                try:
                    await _validate_energy_entity(
                        self.hass,
                        user_input.get(CONF_SOLAR_ENERGY),
                        required=True,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_SOLAR_POWER_SENSOR),
                        required=False,
                    )
                except vol.Invalid as err:
                    errors["base"] = str(err)
                else:
                    new_data[CONF_SOLAR_ENERGY] = user_input[
                        CONF_SOLAR_ENERGY
                    ]
                    val = user_input.get(CONF_SOLAR_POWER_SENSOR)
                    if val:
                        new_data[CONF_SOLAR_POWER_SENSOR] = val
                    else:
                        new_data.pop(CONF_SOLAR_POWER_SENSOR, None)

                    new_data[CONF_SOLAR_RESALE_CONTRACT] = user_input.get(
                        CONF_SOLAR_RESALE_CONTRACT, False
                    )
                    if new_data[CONF_SOLAR_RESALE_CONTRACT]:
                        tariff = user_input.get(CONF_SOLAR_EXPORT_TARIFF)
                        if tariff is not None:
                            new_data[CONF_SOLAR_EXPORT_TARIFF] = float(tariff)
                    else:
                        new_data.pop(CONF_SOLAR_EXPORT_TARIFF, None)

                    est_enabled = bool(user_input.get(CONF_SOLAR_ESTIMATION_ENABLED, False))
                    new_data[CONF_SOLAR_ESTIMATION_ENABLED] = est_enabled
                    # Save base solar config first, then optionally go to estimation details.
                    if est_enabled:
                        self._updated = new_data
                        return await self.async_step_solar_estimation()
            else:
                for key in (
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
                ):
                    new_data.pop(key, None)

            if not errors:
                self.hass.config_entries.async_update_entry(
                    self.config_entry, data=new_data
                )
                await self.hass.config_entries.async_reload(
                    self.config_entry.entry_id
                )
                return self.async_abort(reason="options_updated")

        has_solar = data.get(CONF_HAS_SOLAR, False)
        currency = data.get(CONF_CURRENCY, "EUR")
        schema_dict: dict[Any, Any] = {
            vol.Required(
                CONF_HAS_SOLAR, default=has_solar
            ): BooleanSelector(),
        }
        if has_solar:
            schema_dict[
                vol.Required(
                    CONF_SOLAR_ENERGY,
                    default=data.get(CONF_SOLAR_ENERGY),
                )
            ] = _energy_entity_selector()
            preset = data.get(CONF_SOLAR_POWER_SENSOR)
            if preset:
                schema_dict[
                    vol.Optional(
                        CONF_SOLAR_POWER_SENSOR, default=preset
                    )
                ] = _optional_power_entity()
            else:
                schema_dict[
                    vol.Optional(CONF_SOLAR_POWER_SENSOR)
                ] = _optional_power_entity()
            schema_dict[
                vol.Required(
                    CONF_SOLAR_RESALE_CONTRACT,
                    default=data.get(CONF_SOLAR_RESALE_CONTRACT, False),
                )
            ] = BooleanSelector()
            schema_dict[
                vol.Optional(
                    CONF_SOLAR_EXPORT_TARIFF,
                    default=data.get(CONF_SOLAR_EXPORT_TARIFF),
                )
            ] = NumberSelector(
                NumberSelectorConfig(
                    min=0,
                    max=1,
                    step=0.01,
                    mode=NumberSelectorMode.BOX,
                    unit_of_measurement=f"{currency}/kWh",
                )
            )
            schema_dict[
                vol.Required(
                    CONF_SOLAR_ESTIMATION_ENABLED,
                    default=bool(data.get(CONF_SOLAR_ESTIMATION_ENABLED, False)),
                )
            ] = BooleanSelector()

        return self.async_show_form(
            step_id="solar",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
        )

    async def async_step_solar_estimation(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """PV estimation details (only when enabled in solar step)."""
        errors: dict[str, str] = {}
        data = self._updated or self.config_entry.data

        if not data.get(CONF_HAS_SOLAR):
            return self.async_abort(reason="no_solar_configured")
        if not data.get(CONF_SOLAR_ESTIMATION_ENABLED):
            # Should not be reachable; fallback to save.
            self.hass.config_entries.async_update_entry(self.config_entry, data=data)
            await self.hass.config_entries.async_reload(self.config_entry.entry_id)
            return self.async_abort(reason="options_updated")

        if user_input is not None:
            new_data = {**data}
            peak = user_input.get(CONF_SOLAR_PEAK_POWER)
            if not peak or float(peak) <= 0:
                errors["base"] = "peak_power_required"
            else:
                lat = user_input.get(CONF_SOLAR_LOCATION_LAT)
                lon = user_input.get(CONF_SOLAR_LOCATION_LON)
                new_data[CONF_SOLAR_LOCATION_LAT] = float(lat) if lat is not None else self.hass.config.latitude
                new_data[CONF_SOLAR_LOCATION_LON] = float(lon) if lon is not None else self.hass.config.longitude
                new_data[CONF_SOLAR_PEAK_POWER] = float(peak)
                new_data[CONF_SOLAR_ORIENTATION] = float(user_input.get(CONF_SOLAR_ORIENTATION, 180))
                tilt_mode = user_input.get(CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO)
                new_data[CONF_SOLAR_TILT_MODE] = tilt_mode
                if tilt_mode == SOLAR_TILT_MANUAL:
                    new_data[CONF_SOLAR_TILT] = float(user_input.get(CONF_SOLAR_TILT, 35))
                else:
                    new_data.pop(CONF_SOLAR_TILT, None)
                new_data[CONF_SOLAR_SHADING] = user_input.get(CONF_SOLAR_SHADING, SOLAR_SHADING_NONE)
                new_data[CONF_SOLAR_PERFORMANCE] = user_input.get(CONF_SOLAR_PERFORMANCE, SOLAR_PERF_STANDARD)

            if not errors:
                self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
                await self.hass.config_entries.async_reload(self.config_entry.entry_id)
                return self.async_abort(reason="options_updated")

        ha_lat = self.hass.config.latitude
        ha_lon = self.hass.config.longitude
        schema_dict: dict[Any, Any] = {
            vol.Required(CONF_SOLAR_LOCATION_LAT, default=data.get(CONF_SOLAR_LOCATION_LAT, ha_lat)): NumberSelector(
                NumberSelectorConfig(min=-90, max=90, mode=NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_SOLAR_LOCATION_LON, default=data.get(CONF_SOLAR_LOCATION_LON, ha_lon)): NumberSelector(
                NumberSelectorConfig(min=-180, max=180, mode=NumberSelectorMode.BOX)
            ),
            vol.Required(CONF_SOLAR_PEAK_POWER, default=data.get(CONF_SOLAR_PEAK_POWER, 1.0)): NumberSelector(
                NumberSelectorConfig(min=0.1, max=1000, step=0.01, mode=NumberSelectorMode.BOX, unit_of_measurement="kWc")
            ),
            vol.Required(CONF_SOLAR_ORIENTATION, default=data.get(CONF_SOLAR_ORIENTATION, 180)): NumberSelector(
                NumberSelectorConfig(min=0, max=360, mode=NumberSelectorMode.BOX, unit_of_measurement="°")
            ),
            vol.Required(CONF_SOLAR_TILT_MODE, default=data.get(CONF_SOLAR_TILT_MODE, SOLAR_TILT_AUTO)): _solar_tilt_mode_selector(),
            vol.Optional(CONF_SOLAR_TILT, default=data.get(CONF_SOLAR_TILT, 35)): NumberSelector(
                NumberSelectorConfig(min=0, max=90, mode=NumberSelectorMode.BOX, unit_of_measurement="°")
            ),
            vol.Required(CONF_SOLAR_SHADING, default=data.get(CONF_SOLAR_SHADING, SOLAR_SHADING_NONE)): _solar_shading_selector(),
            vol.Required(CONF_SOLAR_PERFORMANCE, default=data.get(CONF_SOLAR_PERFORMANCE, SOLAR_PERF_STANDARD)): _solar_performance_selector(),
        }
        return self.async_show_form(
            step_id="solar_estimation",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
        )

    # ── Options: Battery ──────────────────────────────────────────────────────

    async def async_step_battery(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        data = self.config_entry.data
        current_batteries = data.get(CONF_BATTERY_SYSTEMS, []) if isinstance(data.get(CONF_BATTERY_SYSTEMS), list) else []

        if user_input is not None:
            has_batt = bool(user_input.get(CONF_HAS_BATTERIES, False))
            new_data = {**data, CONF_HAS_BATTERIES: has_batt}
            if not has_batt:
                new_data[CONF_BATTERY_SYSTEMS] = []
                self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
                await self.hass.config_entries.async_reload(self.config_entry.entry_id)
                return self.async_abort(reason="options_updated")

            # Batteries enabled: launch edit/add wizard.
            self._batteries = list(current_batteries)
            self._current_battery = {}
            self._edit_batt_index = None
            if self._batteries:
                return await self.async_step_battery_pick()
            return await self.async_step_battery_add()

        return self.async_show_form(
            step_id="battery",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HAS_BATTERIES,
                        default=bool(data.get(CONF_HAS_BATTERIES, False)),
                    ): BooleanSelector(),
                }
            ),
            description_placeholders={"battery_count": str(len(current_batteries))},
        )

    async def async_step_battery_pick(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick a battery to edit, or add a new one."""
        errors: dict[str, str] = {}
        batteries = self._batteries or (self.config_entry.data.get(CONF_BATTERY_SYSTEMS, []) or [])
        if not isinstance(batteries, list) or not batteries:
            return await self.async_step_battery_add()

        options = []
        for idx, b in enumerate(batteries):
            bid = str(b.get("id") or idx)
            name = str(b.get(CONF_BATT_NAME) or f"Batterie {idx + 1}")
            options.append(SelectOptionDict(value=str(idx), label=f"{name} ({bid})"))

        if user_input is not None:
            if user_input.get("add_new", False):
                self._edit_batt_index = None
                self._current_battery = {"id": uuid.uuid4().hex[:8]}
                return await self.async_step_battery_add()
            raw_idx = user_input.get("battery_index")
            try:
                idx = int(raw_idx)
            except (TypeError, ValueError):
                errors["base"] = "invalid_battery_choice"
            else:
                if idx < 0 or idx >= len(batteries):
                    errors["base"] = "invalid_battery_choice"
                else:
                    self._edit_batt_index = idx
                    self._current_battery = dict(batteries[idx])
                    return await self.async_step_battery_add()

        return self.async_show_form(
            step_id="battery_pick",
            data_schema=vol.Schema(
                {
                    vol.Required("battery_index", default="0"): SelectSelector(
                        SelectSelectorConfig(options=options, mode=SelectSelectorMode.DROPDOWN)
                    ),
                    vol.Optional("add_new", default=False): BooleanSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_battery_add(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Edit/create one battery (same schema as install)."""
        errors: dict[str, str] = {}
        batt = self._current_battery or {"id": uuid.uuid4().hex[:8]}

        if user_input is not None:
            name = (user_input.get(CONF_BATT_NAME) or "").strip()
            if not name:
                errors["base"] = "battery_name_required"
            else:
                try:
                    await _validate_energy_entity(
                        self.hass,
                        user_input.get(CONF_BATT_ENERGY_IN),
                        required=True,
                    )
                    await _validate_energy_entity(
                        self.hass,
                        user_input.get(CONF_BATT_ENERGY_OUT),
                        required=True,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_IN),
                        required=False,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_OUT),
                        required=False,
                    )
                    await _validate_power_entity(
                        self.hass,
                        user_input.get(CONF_BATT_POWER_NET),
                        required=False,
                    )
                    await _validate_soc_entity(
                        self.hass,
                        user_input.get(CONF_BATT_SOC),
                        required=False,
                    )
                except vol.Invalid as err:
                    errors["base"] = str(err)
                else:
                    new_batt: dict[str, Any] = {
                        "id": batt.get("id") or uuid.uuid4().hex[:8],
                        CONF_BATT_NAME: name,
                        CONF_BATT_ENERGY_IN: user_input[CONF_BATT_ENERGY_IN],
                        CONF_BATT_ENERGY_OUT: user_input[CONF_BATT_ENERGY_OUT],
                    }
                    for key in (
                        CONF_BATT_POWER_IN,
                        CONF_BATT_POWER_OUT,
                        CONF_BATT_POWER_NET,
                        CONF_BATT_SOC,
                    ):
                        val = user_input.get(key)
                        if val:
                            new_batt[key] = val

                    if user_input.get(CONF_BATT_POWER_NET):
                        new_batt[CONF_BATT_POWER_NET_SIGN] = user_input.get(
                            CONF_BATT_POWER_NET_SIGN,
                            batt.get(CONF_BATT_POWER_NET_SIGN, BATT_SIGN_POSITIVE_DISCHARGE),
                        )

                    # Preserve any advanced fields already present when editing.
                    for k in (
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
                    ):
                        if k in batt:
                            new_batt[k] = batt[k]

                    self._current_battery = new_batt
                    want_advanced = user_input.get(CONF_BATT_ADVANCED, False)
                    if want_advanced:
                        return await self.async_step_battery_advanced()
                    return await self._commit_battery_and_continue()

        n = (len(self._batteries) + 1) if self._edit_batt_index is None else (self._edit_batt_index + 1)
        show_net_sign = bool((user_input or {}).get(CONF_BATT_POWER_NET) or batt.get(CONF_BATT_POWER_NET))
        want_adv_default = any(
            k in batt
            for k in (
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
        )
        return self.async_show_form(
            step_id="battery_add",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_BATT_NAME, default=batt.get(CONF_BATT_NAME, f"Batterie {n}")): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Required(CONF_BATT_ENERGY_IN, default=batt.get(CONF_BATT_ENERGY_IN)): _energy_entity_selector(),
                    vol.Required(CONF_BATT_ENERGY_OUT, default=batt.get(CONF_BATT_ENERGY_OUT)): _energy_entity_selector(),
                    vol.Optional(CONF_BATT_POWER_IN, default=batt.get(CONF_BATT_POWER_IN)): _optional_power_entity(),
                    vol.Optional(CONF_BATT_POWER_OUT, default=batt.get(CONF_BATT_POWER_OUT)): _optional_power_entity(),
                    vol.Optional(CONF_BATT_POWER_NET, default=batt.get(CONF_BATT_POWER_NET)): _optional_power_entity(),
                    **(
                        {
                            vol.Optional(
                                CONF_BATT_POWER_NET_SIGN,
                                default=batt.get(CONF_BATT_POWER_NET_SIGN, BATT_SIGN_POSITIVE_DISCHARGE),
                            ): _batt_net_sign_selector(),
                        }
                        if show_net_sign
                        else {}
                    ),
                    vol.Optional(CONF_BATT_SOC, default=batt.get(CONF_BATT_SOC)): _optional_soc_entity(),
                    vol.Optional(CONF_BATT_ADVANCED, default=want_adv_default): BooleanSelector(),
                }
            ),
            errors=errors,
            description_placeholders={"battery_number": str(n)},
        )

    async def async_step_battery_advanced(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Advanced fields for current battery (same as install)."""
        errors: dict[str, str] = {}
        batt = self._current_battery or {}

        if user_input is not None:
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_CAPACITY_KWH,
                CONF_BATT_CAPACITY_KWH_ENTITY,
                "battery_adv_capacity_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_MAX_CHARGE_W,
                CONF_BATT_MAX_CHARGE_W_ENTITY,
                "battery_adv_max_charge_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_MAX_DISCHARGE_W,
                CONF_BATT_MAX_DISCHARGE_W_ENTITY,
                "battery_adv_max_discharge_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_SOC_MIN,
                CONF_BATT_SOC_MIN_ENTITY,
                "battery_adv_soc_min_not_both",
            )
            _validate_not_both(
                errors,
                user_input,
                CONF_BATT_SOC_MAX,
                CONF_BATT_SOC_MAX_ENTITY,
                "battery_adv_soc_max_not_both",
            )

            if not errors:
                for key in (
                    CONF_BATT_CAPACITY_KWH,
                    CONF_BATT_MAX_CHARGE_W,
                    CONF_BATT_MAX_DISCHARGE_W,
                    CONF_BATT_SOC_MIN,
                    CONF_BATT_SOC_MAX,
                ):
                    val = user_input.get(key)
                    if val is not None:
                        batt[key] = float(val)
                    else:
                        batt.pop(key, None)

                for key in (
                    CONF_BATT_CAPACITY_KWH_ENTITY,
                    CONF_BATT_MAX_CHARGE_W_ENTITY,
                    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
                    CONF_BATT_SOC_MIN_ENTITY,
                    CONF_BATT_SOC_MAX_ENTITY,
                ):
                    ent = user_input.get(key)
                    if ent:
                        batt[key] = ent
                    else:
                        batt.pop(key, None)

                self._current_battery = batt
                return await self._commit_battery_and_continue()

        return self.async_show_form(
            step_id="battery_advanced",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_BATT_CAPACITY_KWH_ENTITY, default=batt.get(CONF_BATT_CAPACITY_KWH_ENTITY)): _optional_number_entity(),
                    vol.Optional(CONF_BATT_CAPACITY_KWH, default=batt.get(CONF_BATT_CAPACITY_KWH)): NumberSelector(
                        NumberSelectorConfig(min=0.1, max=500, step=0.01, mode=NumberSelectorMode.BOX, unit_of_measurement="kWh")
                    ),
                    vol.Optional(CONF_BATT_MAX_CHARGE_W_ENTITY, default=batt.get(CONF_BATT_MAX_CHARGE_W_ENTITY)): _optional_number_entity(),
                    vol.Optional(CONF_BATT_MAX_CHARGE_W, default=batt.get(CONF_BATT_MAX_CHARGE_W)): NumberSelector(
                        NumberSelectorConfig(min=0, max=50000, mode=NumberSelectorMode.BOX, unit_of_measurement="W")
                    ),
                    vol.Optional(CONF_BATT_MAX_DISCHARGE_W_ENTITY, default=batt.get(CONF_BATT_MAX_DISCHARGE_W_ENTITY)): _optional_number_entity(),
                    vol.Optional(CONF_BATT_MAX_DISCHARGE_W, default=batt.get(CONF_BATT_MAX_DISCHARGE_W)): NumberSelector(
                        NumberSelectorConfig(min=0, max=50000, mode=NumberSelectorMode.BOX, unit_of_measurement="W")
                    ),
                    vol.Optional(CONF_BATT_SOC_MIN_ENTITY, default=batt.get(CONF_BATT_SOC_MIN_ENTITY)): _optional_percentage_entity(),
                    vol.Optional(CONF_BATT_SOC_MIN, default=batt.get(CONF_BATT_SOC_MIN)): NumberSelector(
                        NumberSelectorConfig(min=0, max=100, step=0.1, mode=NumberSelectorMode.BOX, unit_of_measurement="%")
                    ),
                    vol.Optional(CONF_BATT_SOC_MAX_ENTITY, default=batt.get(CONF_BATT_SOC_MAX_ENTITY)): _optional_percentage_entity(),
                    vol.Optional(CONF_BATT_SOC_MAX, default=batt.get(CONF_BATT_SOC_MAX)): NumberSelector(
                        NumberSelectorConfig(min=0, max=100, step=0.1, mode=NumberSelectorMode.BOX, unit_of_measurement="%")
                    ),
                }
            ),
            errors=errors,
        )

    async def _commit_battery_and_continue(self) -> ConfigFlowResult:
        if self._edit_batt_index is None:
            self._batteries.append(self._current_battery)
        else:
            self._batteries[self._edit_batt_index] = self._current_battery
        self._current_battery = {}
        self._edit_batt_index = None
        return await self.async_step_battery_more()

    async def async_step_battery_more(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            if user_input.get("add_another", False):
                self._edit_batt_index = None
                self._current_battery = {"id": uuid.uuid4().hex[:8]}
                return await self.async_step_battery_add()

            # Save all batteries back.
            data = self.config_entry.data
            new_data = {**data, CONF_HAS_BATTERIES: True, CONF_BATTERY_SYSTEMS: self._batteries}
            self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
            await self.hass.config_entries.async_reload(self.config_entry.entry_id)
            return self.async_abort(reason="options_updated")

        return self.async_show_form(
            step_id="battery_more",
            data_schema=vol.Schema(
                {
                    vol.Required("add_another", default=False): BooleanSelector(),
                }
            ),
            description_placeholders={"battery_count": str(len(self._batteries))},
        )

    async def async_step_tempo(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Tempo options: choose API vs RTE; if RTE, ask credentials."""
        errors: dict[str, str] = {}
        data = self.config_entry.data

        if not (data.get(CONF_SUPPLIER) == SUPPLIER_EDF and data.get(CONF_TARIFF_OFFER) == TARIFF_OFFER_TEMPO):
            return self.async_abort(reason="not_tempo_offer")

        if user_input is not None:
            tempo_mode = user_input.get(CONF_TEMPO_MODE, data.get(CONF_TEMPO_MODE, TEMPO_MODE_RTE))
            self._updated = {**data, CONF_TEMPO_MODE: tempo_mode}
            if tempo_mode == TEMPO_MODE_RTE:
                return await self.async_step_tempo_rte()

            # Non-RTE mode: save mode and reload.
            self.hass.config_entries.async_update_entry(self.config_entry, data=self._updated)
            await self.hass.config_entries.async_reload(self.config_entry.entry_id)
            return self.async_abort(reason="options_updated")

        return self.async_show_form(
            step_id="tempo",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TEMPO_MODE,
                        default=data.get(CONF_TEMPO_MODE, TEMPO_MODE_RTE),
                    ): _tempo_mode_selector(),
                }
            ),
            errors=errors,
        )

    async def async_step_tempo_rte(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """RTE credentials step (options flow)."""
        errors: dict[str, str] = {}
        data = self._updated or self.config_entry.data
        if user_input is not None:
            cid = (user_input.get(CONF_RTE_CLIENT_ID) or "").strip()
            secret = (user_input.get(CONF_RTE_CLIENT_SECRET) or "").strip()

            new_data = {**data}
            if cid:
                new_data[CONF_RTE_CLIENT_ID] = cid
            if secret:
                new_data[CONF_RTE_CLIENT_SECRET] = secret

            if not (new_data.get(CONF_RTE_CLIENT_ID) and new_data.get(CONF_RTE_CLIENT_SECRET)):
                errors["base"] = "rte_creds_required"
            else:
                session = async_get_clientsession(self.hass)
                try:
                    from .providers.edf import async_test_rte_credentials

                    await async_test_rte_credentials(
                        session,
                        str(new_data.get(CONF_RTE_CLIENT_ID)),
                        str(new_data.get(CONF_RTE_CLIENT_SECRET)),
                    )
                except (ClientError, TimeoutError, ValueError) as err:
                    _LOGGER.warning("RTE credential test failed: %s", err)
                    errors["base"] = "rte_auth_failed"
                else:
                    self.hass.config_entries.async_update_entry(self.config_entry, data=new_data)
                    await self.hass.config_entries.async_reload(self.config_entry.entry_id)
                    return self.async_abort(reason="options_updated")

        return self.async_show_form(
            step_id="tempo_rte",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_RTE_CLIENT_ID, default=data.get(CONF_RTE_CLIENT_ID, "")): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Optional(CONF_RTE_CLIENT_SECRET, default=""): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.PASSWORD)
                    ),
                }
            ),
            errors=errors,
        )

    # ── Options: Tariff refresh (EDF only) ────────────────────────────────────

    async def async_step_tariff_refresh(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        data = self.config_entry.data

        if data.get(CONF_SUPPLIER) != SUPPLIER_EDF:
            return self.async_abort(reason="not_edf_supplier")

        current_offer = data.get(CONF_TARIFF_OFFER, TARIFF_OFFER_TEMPO)
        current_power = data.get(CONF_CONTRACT_POWER, "9")

        if user_input is not None:
            offer = (
                user_input.get(CONF_TARIFF_OFFER) or current_offer
            ).strip()
            power = (
                user_input.get(CONF_CONTRACT_POWER) or current_power
            ).strip()

            session = async_get_clientsession(self.hass)
            try:
                from .providers.edf import async_fetch_offer_tariffs

                tariffs = await async_fetch_offer_tariffs(
                    session, offer, power
                )
            except (
                ClientError,
                TimeoutError,
                ValueError,
                ImportError,
            ) as err:
                _LOGGER.warning(
                    "EDF tariff refresh failed (offer=%s, %s kVA): %s",
                    offer,
                    power,
                    err,
                )
                errors["base"] = "tariff_fetch_failed"
            else:
                new_opts = {**self.config_entry.options}
                new_opts.update(
                    {
                        OPT_BLEU_HC: tariffs.get("hc_bleu_ttc", 0),
                        OPT_BLEU_HP: tariffs.get("hp_bleu_ttc", 0),
                        OPT_BLANC_HC: tariffs.get("hc_blanc_ttc", 0),
                        OPT_BLANC_HP: tariffs.get("hp_blanc_ttc", 0),
                        OPT_ROUGE_HC: tariffs.get("hc_rouge_ttc", 0),
                        OPT_ROUGE_HP: tariffs.get("hp_rouge_ttc", 0),
                        OPT_FIXED_TTC: tariffs.get("fixed_ttc", 0),
                        OPT_ABONNEMENT: 0,
                        OPT_TARIFF_FETCHED_AT: tariffs.get("fetched_at"),
                    }
                )
                new_data = {
                    **data,
                    CONF_TARIFF_OFFER: offer,
                    CONF_CONTRACT_POWER: power,
                }
                self.hass.config_entries.async_update_entry(
                    self.config_entry, data=new_data, options=new_opts
                )
                await self.hass.config_entries.async_reload(
                    self.config_entry.entry_id
                )
                return self.async_abort(reason="tariffs_fetched")

        return self.async_show_form(
            step_id="tariff_refresh",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_TARIFF_OFFER, default=current_offer
                    ): _offer_selector(),
                    vol.Required(
                        CONF_CONTRACT_POWER, default=current_power
                    ): _contract_power_selector_edf(),
                }
            ),
            errors=errors,
        )
