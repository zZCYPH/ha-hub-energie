"""Remote tariff fetch and config entry update."""

from __future__ import annotations

import logging

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
from ..providers.edf import async_fetch_offer_tariffs

__all__ = ("refresh_tariffs",)


async def refresh_tariffs(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    update_entry: bool,
    is_edf: bool,
    tariff_offer: str,
    logger: logging.Logger,
) -> bool:
    if not is_edf:
        logger.debug("Tariff refresh skipped: not EDF supplier")
        return False
    offer = tariff_offer
    power = str(
        entry.options.get(CONF_CONTRACT_POWER, entry.data.get(CONF_CONTRACT_POWER, "")),
    ).strip()
    if not power:
        logger.warning("Tariff refresh skipped: missing contract power")
        return False

    session = async_get_clientsession(hass)
    try:
        tariffs = await async_fetch_offer_tariffs(session, offer, power)
    except Exception as err:  # noqa: BLE001
        logger.warning("Tariff refresh failed (offer=%s, power=%s): %s", offer, power, err)
        return False

    new_options = dict(entry.options)
    new_options.update({
        CONF_TARIFF_OFFER: offer,
        CONF_CONTRACT_POWER: power,
        OPT_BLEU_HC: float(tariffs.get("hc_bleu_ttc", 0)),
        OPT_BLEU_HP: float(tariffs.get("hp_bleu_ttc", 0)),
        OPT_BLANC_HC: float(tariffs.get("hc_blanc_ttc", 0)),
        OPT_BLANC_HP: float(tariffs.get("hp_blanc_ttc", 0)),
        OPT_ROUGE_HC: float(tariffs.get("hc_rouge_ttc", 0)),
        OPT_ROUGE_HP: float(tariffs.get("hp_rouge_ttc", 0)),
        OPT_FIXED_TTC: float(tariffs.get("fixed_ttc", 0)),
        OPT_ABONNEMENT: 0.0,
        OPT_TARIFF_FETCHED_AT: tariffs.get("fetched_at"),
    })
    if update_entry:
        hass.config_entries.async_update_entry(entry, options=new_options)
        await hass.config_entries.async_reload(entry.entry_id)
    return True
