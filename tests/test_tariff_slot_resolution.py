"""Tests for tariff slot resolution and attribution (light HA stubs via conftest)."""

from __future__ import annotations

import importlib
from datetime import datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

const = importlib.import_module("hub_energie.const")
edf_state = importlib.import_module("hub_energie.tariff.edf_state")
slot_resolver = importlib.import_module("hub_energie.tariff.slot_resolver")
slot_attribution = importlib.import_module("hub_energie.tariff.slot_attribution")

PARIS = ZoneInfo(const.FR_TZ)


def test_resolve_slot_schedule_only_non_edf_and_base() -> None:
    hp = datetime(2026, 6, 1, 14, 0, tzinfo=PARIS)
    hc = datetime(2026, 6, 1, 23, 0, tzinfo=PARIS)
    f = edf_state.EdfRuntimeFields()

    assert slot_attribution.resolve_slot_schedule_only(
        now_paris=hp,
        is_edf=False,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_API,
        edf_fields=f,
    ) == "bleu_hp"

    assert slot_attribution.resolve_slot_schedule_only(
        now_paris=hc,
        is_edf=False,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_API,
        edf_fields=f,
    ) == "bleu_hc"

    assert (
        slot_attribution.resolve_slot_schedule_only(
            now_paris=hp,
            is_edf=True,
            tariff_offer=const.TARIFF_OFFER_BASE,
            tempo_mode=const.TEMPO_MODE_API,
            edf_fields=f,
        )
        == "bleu_hp"
    )


def test_resolve_slot_schedule_only_tempo_api_uses_today_color() -> None:
    now = datetime(2026, 6, 1, 14, 0, tzinfo=PARIS)
    f = edf_state.EdfRuntimeFields(today_color="blanc")
    slot = slot_attribution.resolve_slot_schedule_only(
        now_paris=now,
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_API,
        edf_fields=f,
    )
    assert slot == "blanc_hp"


def test_resolve_slot_sensor_reads_hass_state() -> None:
    now = datetime(2026, 6, 1, 14, 0, tzinfo=PARIS)
    f = edf_state.EdfRuntimeFields()

    class _State:
        state = "rouge_hc"

    hass = SimpleNamespace(
        states=SimpleNamespace(get=lambda _eid: _State()),
    )
    entry = SimpleNamespace(data={const.CONF_CURRENT_SLOT_SENSOR: "sensor.tempo_slot"})

    slot = slot_resolver.resolve_slot(
        now_paris=now,
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_SENSOR,
        edf_fields=f,
        hass=hass,
        entry=entry,
    )
    assert slot == "rouge_hc"
    assert f.current_slot == "rouge_hc"


def test_resolve_attribution_slot_fallback_chain() -> None:
    now = datetime(2026, 6, 1, 14, 0, tzinfo=PARIS)
    f = edf_state.EdfRuntimeFields(today_color="unknown")
    hass = SimpleNamespace(states=SimpleNamespace(get=lambda _eid: None))
    entry = SimpleNamespace(data={})

    bad = slot_resolver.resolve_slot(
        now_paris=now,
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode="invalid_mode",
        edf_fields=f,
        hass=hass,
        entry=entry,
    )
    assert bad is None

    r1 = slot_attribution.resolve_attribution_slot(
        now_paris=now,
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode="invalid_mode",
        edf_fields=f,
        hass=hass,
        entry=entry,
        last_stable_slot="bleu_hp",
    )
    assert r1.slot == "bleu_hp"
    assert r1.method == "fallback_last_known"

    r2 = slot_attribution.resolve_attribution_slot(
        now_paris=now,
        is_edf=True,
        tariff_offer=const.TARIFF_OFFER_TEMPO,
        tempo_mode=const.TEMPO_MODE_API,
        edf_fields=edf_state.EdfRuntimeFields(today_color="unknown"),
        hass=hass,
        entry=entry,
        last_stable_slot=None,
    )
    assert r2.slot == const.SLOT_UNKNOWN
    assert r2.method == "unknown"
