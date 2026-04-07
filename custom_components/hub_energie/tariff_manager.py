"""Hub Énergie – generic tariff manager.

Consumes the generic tariff data model (flat / time_of_use / schedule)
and provides pricing resolution for the coordinator, independent of any
specific supplier.
"""

from __future__ import annotations

import logging
from datetime import datetime, time
from typing import Any

from .const import (
    CONF_CURRENCY,
    CONF_ENERGY_PRICE,
    CONF_PRICE_BASIS,
    CONF_PRICING_STRUCTURE,
    CONF_SCHEDULE_SLOTS,
    CONF_SUBSCRIPTION_PRICE,
    CONF_TARIFF_MODE,
    CONF_TOU_PERIODS,
    DAY_TYPE_ALL,
    DAY_TYPE_WEEKDAYS,
    DAY_TYPE_WEEKENDS,
    OPT_ABONNEMENT,
    OPT_BLEU_HC,
    OPT_BLEU_HP,
    OPT_BLANC_HC,
    OPT_BLANC_HP,
    OPT_ROUGE_HC,
    OPT_ROUGE_HP,
    OPT_FIXED_TTC,
    PRICING_FLAT,
    PRICING_SCHEDULE,
    PRICING_TIME_OF_USE,
    SLOT_UNKNOWN,
    SLOTS,
    SUPPLIER_EDF,
    TARIFF_MODE_AUTO,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
)

_LOGGER = logging.getLogger(__name__)


class TariffResolver:
    """Resolve the current energy price from the stored tariff model."""

    def __init__(self, options: dict[str, Any], data: dict[str, Any]) -> None:
        self._options = options
        self._data = data
        self._supplier: str = data.get("supplier", SUPPLIER_EDF)
        self._tariff_mode: str = data.get(CONF_TARIFF_MODE, TARIFF_MODE_AUTO)
        self._pricing: str = data.get(CONF_PRICING_STRUCTURE, PRICING_FLAT)
        self._currency: str = data.get(CONF_CURRENCY, "EUR")
        self._price_basis: str = data.get(CONF_PRICE_BASIS, "TTC")

    @property
    def currency(self) -> str:
        return self._currency

    @property
    def price_basis(self) -> str:
        return self._price_basis

    @property
    def is_edf_auto(self) -> bool:
        return self._supplier == SUPPLIER_EDF and self._tariff_mode == TARIFF_MODE_AUTO

    @property
    def is_tempo(self) -> bool:
        return (
            self._supplier == SUPPLIER_EDF
            and self._options.get("tariff_offer") == TARIFF_OFFER_TEMPO
        )

    @property
    def is_hphc(self) -> bool:
        return (
            self._supplier == SUPPLIER_EDF
            and self._options.get("tariff_offer") == TARIFF_OFFER_HPHC
        )

    @property
    def is_base(self) -> bool:
        return (
            self._supplier == SUPPLIER_EDF
            and self._options.get("tariff_offer") == TARIFF_OFFER_BASE
        )

    # ------------------------------------------------------------------
    # EDF slot-based pricing (auto and manual-with-EDF)
    # ------------------------------------------------------------------

    def rate_for_slot(self, slot: str) -> float:
        """Return €/kWh for a Tempo/HPHC/Base slot key (e.g. 'bleu_hc')."""
        if slot == SLOT_UNKNOWN:
            return 0.0
        if self.is_edf_auto:
            return self._edf_auto_rate(slot)
        if self._supplier == SUPPLIER_EDF:
            return self._edf_manual_rate(slot)
        return self._generic_rate_now(datetime.now())

    def _edf_auto_rate(self, slot: str) -> float:
        key_map = {
            OPT_BLEU_HC: "hc_bleu_ttc",
            OPT_BLEU_HP: "hp_bleu_ttc",
            OPT_BLANC_HC: "hc_blanc_ttc",
            OPT_BLANC_HP: "hp_blanc_ttc",
            OPT_ROUGE_HC: "hc_rouge_ttc",
            OPT_ROUGE_HP: "hp_rouge_ttc",
        }
        fetched = self._options
        api_key = key_map.get(slot)
        if api_key and api_key in fetched:
            try:
                return float(fetched[api_key])
            except (ValueError, TypeError):
                pass
        return self._options.get(slot, 0.0)

    def _edf_manual_rate(self, slot: str) -> float:
        return float(self._options.get(slot, 0.0))

    def subscription_daily(self) -> float:
        """Return the daily prorated subscription cost (€ / day)."""
        if self.is_edf_auto:
            # PART_FIXE_TTC from data.gouv is an annual fixed charge (€ / year).
            annual_raw = self._options.get(OPT_FIXED_TTC)
            if annual_raw is None or annual_raw == "":
                # Legacy configs stored the same value under OPT_ABONNEMENT only.
                annual_raw = self._options.get(OPT_ABONNEMENT, 0.0)
            try:
                annual = float(annual_raw)
            except (TypeError, ValueError):
                annual = 0.0
            if annual:
                return round(annual / 365.0, 6)
            manual = float(self._data.get(CONF_SUBSCRIPTION_PRICE, 0.0))
            if manual:
                return round(manual / 30.0, 6)
            return 0.0

        monthly = float(self._options.get(OPT_ABONNEMENT, 0.0))
        if not monthly:
            monthly = float(self._data.get(CONF_SUBSCRIPTION_PRICE, 0.0))
        return round(monthly / 30.0, 6)

    # ------------------------------------------------------------------
    # Generic (non-EDF) pricing
    # ------------------------------------------------------------------

    def _generic_rate_now(self, now: datetime) -> float:
        """Resolve current rate from manual tariff model."""
        if self._pricing == PRICING_FLAT:
            return float(self._data.get(CONF_ENERGY_PRICE, 0.0))
        if self._pricing == PRICING_TIME_OF_USE:
            return self._resolve_tou(now)
        if self._pricing == PRICING_SCHEDULE:
            return self._resolve_schedule(now)
        return 0.0

    def _resolve_tou(self, now: datetime) -> float:
        periods = self._data.get(CONF_TOU_PERIODS, [])
        if not periods:
            return 0.0
        for period in periods:
            start_str = period.get("start", "00:00")
            end_str = period.get("end", "00:00")
            start = _parse_time(start_str)
            end = _parse_time(end_str)
            t = now.time()
            if _time_in_window(t, start, end):
                return float(period.get("price", 0.0))
        return float(periods[0].get("price", 0.0))

    def _resolve_schedule(self, now: datetime) -> float:
        slots = self._data.get(CONF_SCHEDULE_SLOTS, [])
        if not slots:
            return 0.0
        weekday = now.weekday()
        month = now.month
        t = now.time()
        for slot in slots:
            if not _day_type_matches(slot.get("day_type", DAY_TYPE_ALL), weekday):
                continue
            if not _season_matches(slot.get("season"), month):
                continue
            start = _parse_time(slot.get("start", "00:00"))
            end = _parse_time(slot.get("end", "00:00"))
            if _time_in_window(t, start, end):
                return float(slot.get("price", 0.0))
        return 0.0

    def cost_for_slot(self, slot: str, kwh: float) -> float:
        """Compute cost for a given slot and energy amount."""
        return round(self.rate_for_slot(slot) * kwh, 6)

    def all_slot_rates(self) -> dict[str, float]:
        """Return rate for every EDF slot (for snapshot attributes)."""
        return {s: self.rate_for_slot(s) for s in (*SLOTS, SLOT_UNKNOWN)}


def _parse_time(s: str) -> time:
    parts = s.split(":")
    return time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)


def _time_in_window(t: time, start: time, end: time) -> bool:
    if start <= end:
        return start <= t < end
    return t >= start or t < end


def _day_type_matches(day_type: str, weekday: int) -> bool:
    if day_type == DAY_TYPE_ALL:
        return True
    if day_type == DAY_TYPE_WEEKDAYS:
        return weekday < 5
    if day_type == DAY_TYPE_WEEKENDS:
        return weekday >= 5
    return True


def _season_matches(season: Any, month: int) -> bool:
    if season is None:
        return True
    if isinstance(season, list):
        for rng in season:
            if isinstance(rng, dict):
                m_start = rng.get("start_month", 1)
                m_end = rng.get("end_month", 12)
                if m_start <= month <= m_end:
                    return True
            elif isinstance(rng, int) and rng == month:
                return True
        return False
    return True
