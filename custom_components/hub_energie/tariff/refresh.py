"""Remote tariff fetch and config entry update."""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from typing import Any, Mapping

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from ..const import (
    CONF_CONTRACT_POWER,
    CONF_TARIFF_OFFER,
    OPT_ABONNEMENT,
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_FIXED_TTC,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_TARIFF_FETCHED_AT,
)
from ..providers.edf import async_fetch_offer_tariffs, tariff_payload_completeness_issues

__all__ = ("TariffRefreshOutcome", "refresh_tariffs")


@dataclass(frozen=True, slots=True)
class TariffRefreshOutcome:
    """Result of ``refresh_tariffs`` for callers and coordinator trust state."""

    ok: bool
    """Same as the historical boolean return (config update / soft-success semantics)."""

    rejected_incomplete_payload: bool
    """Fetched data failed completeness validation (payload not applied)."""

    complete_payload_accepted: bool
    """A full valid tariff payload was received (persisted only if ``update_entry``)."""

_STORED_TARIFF_OPTION_KEYS: tuple[str, ...] = (
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_FIXED_TTC,
)


def _stored_tariff_options_complete(options: Mapping[str, Any]) -> bool:
    """True when *options* already holds a full finite numeric tariff set from a prior successful fetch."""
    for key in _STORED_TARIFF_OPTION_KEYS:
        if key not in options:
            return False
        try:
            v = float(options[key])
        except (TypeError, ValueError):
            return False
        if not math.isfinite(v):
            return False
    return True


async def refresh_tariffs(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    update_entry: bool,
    is_edf: bool,
    tariff_offer: str,
    logger: logging.Logger,
) -> TariffRefreshOutcome:
    if not is_edf:
        logger.debug("Tariff refresh skipped: not EDF supplier")
        return TariffRefreshOutcome(
            ok=False,
            rejected_incomplete_payload=False,
            complete_payload_accepted=False,
        )
    offer = tariff_offer
    power = str(
        entry.options.get(CONF_CONTRACT_POWER, entry.data.get(CONF_CONTRACT_POWER, "")),
    ).strip()
    if not power:
        logger.warning("Tariff refresh skipped: missing contract power")
        return TariffRefreshOutcome(
            ok=False,
            rejected_incomplete_payload=False,
            complete_payload_accepted=False,
        )

    session = async_get_clientsession(hass)
    try:
        tariffs = await async_fetch_offer_tariffs(session, offer, power)
    except Exception as err:  # noqa: BLE001
        logger.warning("Tariff refresh failed (offer=%s, power=%s): %s", offer, power, err)
        return TariffRefreshOutcome(
            ok=False,
            rejected_incomplete_payload=False,
            complete_payload_accepted=False,
        )

    issues = tariff_payload_completeness_issues(tariffs, expected_offer=offer)
    if issues:
        logger.warning(
            "Tariff refresh rejected incomplete or invalid payload (offer=%s, power=%s, issues=%s); "
            "config options were not updated to avoid false zero rates",
            offer,
            power,
            issues,
        )
        if _stored_tariff_options_complete(entry.options):
            return TariffRefreshOutcome(
                ok=True,
                rejected_incomplete_payload=True,
                complete_payload_accepted=False,
            )
        # No complete prior tariff row in options: do not invent defaults (e.g. DEFAULT_RATES).
        # Operator must fix the API response or complete setup; state stays unchanged.
        logger.warning(
            "Tariff refresh could not apply new data and no complete prior tariff set exists in "
            "config to retain"
        )
        return TariffRefreshOutcome(
            ok=False,
            rejected_incomplete_payload=True,
            complete_payload_accepted=False,
        )

    new_options = dict(entry.options)
    new_options.update({
        CONF_TARIFF_OFFER: offer,
        CONF_CONTRACT_POWER: power,
        OPT_BLEU_HC: float(tariffs["hc_bleu_ttc"]),
        OPT_BLEU_HP: float(tariffs["hp_bleu_ttc"]),
        OPT_BLANC_HC: float(tariffs["hc_blanc_ttc"]),
        OPT_BLANC_HP: float(tariffs["hp_blanc_ttc"]),
        OPT_ROUGE_HC: float(tariffs["hc_rouge_ttc"]),
        OPT_ROUGE_HP: float(tariffs["hp_rouge_ttc"]),
        OPT_FIXED_TTC: float(tariffs["fixed_ttc"]),
        OPT_ABONNEMENT: 0.0,
        OPT_TARIFF_FETCHED_AT: tariffs["fetched_at"],
    })
    if update_entry:
        hass.config_entries.async_update_entry(entry, options=new_options)
        await hass.config_entries.async_reload(entry.entry_id)
    return TariffRefreshOutcome(
        ok=True,
        rejected_incomplete_payload=False,
        complete_payload_accepted=True,
    )
