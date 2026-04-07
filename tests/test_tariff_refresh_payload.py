"""Tests for normalized tariff payload validation and ``refresh_tariffs`` persistence guards."""

from __future__ import annotations

import asyncio
import importlib
import logging
import sys
import types
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import pytest

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

const = importlib.import_module("hub_energie.const")
edf = importlib.import_module("hub_energie.providers.edf")
refresh_mod = importlib.import_module("hub_energie.tariff.refresh")


def _complete_api_payload(*, offer: str = const.TARIFF_OFFER_TEMPO) -> dict[str, object]:
    return {
        "offer": offer,
        "contract_power": "9",
        "source": "test",
        "fixed_ttc": 100.0,
        "hc_bleu_ttc": 0.11,
        "hp_bleu_ttc": 0.22,
        "hc_blanc_ttc": 0.33,
        "hp_blanc_ttc": 0.44,
        "hc_rouge_ttc": 0.55,
        "hp_rouge_ttc": 0.66,
        "fetched_at": "2026-06-15T12:00:00+02:00",
    }


def _complete_stored_options() -> dict[str, float]:
    return {
        const.OPT_BLEU_HC: 0.09,
        const.OPT_BLEU_HP: 0.19,
        const.OPT_BLANC_HC: 0.29,
        const.OPT_BLANC_HP: 0.39,
        const.OPT_ROUGE_HC: 0.49,
        const.OPT_ROUGE_HP: 0.59,
        const.OPT_FIXED_TTC: 80.0,
    }


def test_tariff_payload_completeness_full() -> None:
    assert edf.tariff_payload_completeness_issues(_complete_api_payload()) == []


def test_tariff_payload_completeness_missing_numeric_key() -> None:
    p = _complete_api_payload()
    del p["hc_bleu_ttc"]
    issues = edf.tariff_payload_completeness_issues(p, expected_offer=const.TARIFF_OFFER_TEMPO)
    assert any(x.startswith("missing:hc_bleu_ttc") for x in issues)


def test_tariff_payload_completeness_invalid_numeric() -> None:
    p = _complete_api_payload()
    p["hp_bleu_ttc"] = "not-a-number"
    issues = edf.tariff_payload_completeness_issues(p)
    assert any(x.startswith("invalid:hp_bleu_ttc") for x in issues)


def test_tariff_payload_completeness_non_finite() -> None:
    p = _complete_api_payload()
    p["fixed_ttc"] = float("nan")
    issues = edf.tariff_payload_completeness_issues(p)
    assert any(x.startswith("non_finite:fixed_ttc") for x in issues)


def test_tariff_payload_completeness_empty_fetched_at() -> None:
    p = _complete_api_payload()
    p["fetched_at"] = ""
    assert "missing_or_empty:fetched_at" in edf.tariff_payload_completeness_issues(p)


def test_tariff_payload_completeness_offer_mismatch() -> None:
    p = _complete_api_payload(offer=const.TARIFF_OFFER_TEMPO)
    issues = edf.tariff_payload_completeness_issues(
        p, expected_offer=const.TARIFF_OFFER_BASE
    )
    assert any("offer_mismatch" in x for x in issues)


def test_stored_tariff_options_complete_helper() -> None:
    assert refresh_mod._stored_tariff_options_complete(_complete_stored_options()) is True
    assert refresh_mod._stored_tariff_options_complete({}) is False
    bad = dict(_complete_stored_options())
    bad[const.OPT_BLEU_HC] = float("inf")
    assert refresh_mod._stored_tariff_options_complete(bad) is False


async def _run_refresh(
    *,
    entry_options: dict,
    entry_data: dict,
    payload: dict | BaseException | None,
    update_entry: bool = True,
) -> tuple[refresh_mod.TariffRefreshOutcome, Mock, list[str]]:
    update_mock = Mock()
    reload_ids: list[str] = []

    async def async_reload(entry_id: str) -> None:
        reload_ids.append(entry_id)

    hass = SimpleNamespace(
        config_entries=SimpleNamespace(
            async_update_entry=update_mock,
            async_reload=async_reload,
        )
    )
    entry = SimpleNamespace(options=dict(entry_options), data=dict(entry_data), entry_id="test_entry")

    async def async_fetch(_session: object, _offer: str, _power: str) -> dict:
        if isinstance(payload, BaseException):
            raise payload
        assert payload is not None
        return payload

    log = logging.getLogger("hub_energie.tests.tariff_refresh")

    def sync_get_clientsession(_hass: object) -> object:
        return object()

    with patch.object(refresh_mod, "async_fetch_offer_tariffs", new=async_fetch):
        with patch.object(refresh_mod, "async_get_clientsession", new=sync_get_clientsession):
            outcome = await refresh_mod.refresh_tariffs(
                hass,
                entry,
                update_entry=update_entry,
                is_edf=True,
                tariff_offer=const.TARIFF_OFFER_TEMPO,
                logger=log,
            )
    return outcome, update_mock, reload_ids


def test_refresh_tariffs_complete_persists_options() -> None:
    payload = _complete_api_payload()

    async def _t() -> None:
        outcome, update_mock, reload_ids = await _run_refresh(
            entry_options={},
            entry_data={const.CONF_CONTRACT_POWER: "9"},
            payload=payload,
        )
        assert outcome.ok is True
        assert outcome.complete_payload_accepted is True
        assert outcome.rejected_incomplete_payload is False
        update_mock.assert_called_once()
        opts = update_mock.call_args.kwargs["options"]
        assert opts[const.OPT_BLEU_HC] == pytest.approx(0.11)
        assert opts[const.OPT_FIXED_TTC] == pytest.approx(100.0)
        assert opts[const.OPT_TARIFF_FETCHED_AT] == payload["fetched_at"]
        assert reload_ids == ["test_entry"]

    asyncio.run(_t())


def test_refresh_tariffs_partial_with_prior_returns_true_no_update(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.WARNING)
    partial = _complete_api_payload()
    del partial["hp_rouge_ttc"]

    async def _t() -> None:
        outcome, update_mock, reload_ids = await _run_refresh(
            entry_options=_complete_stored_options(),
            entry_data={const.CONF_CONTRACT_POWER: "9"},
            payload=partial,
        )
        assert outcome.ok is True
        assert outcome.rejected_incomplete_payload is True
        assert outcome.complete_payload_accepted is False
        update_mock.assert_not_called()
        assert reload_ids == []

    asyncio.run(_t())
    assert any("rejected incomplete" in r.message for r in caplog.records)


def test_refresh_tariffs_partial_without_prior_returns_false(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.WARNING)
    partial = _complete_api_payload()
    partial["hc_blanc_ttc"] = "x"

    async def _t() -> None:
        outcome, update_mock, reload_ids = await _run_refresh(
            entry_options={},
            entry_data={const.CONF_CONTRACT_POWER: "9"},
            payload=partial,
        )
        assert outcome.ok is False
        assert outcome.rejected_incomplete_payload is True
        update_mock.assert_not_called()
        assert reload_ids == []

    asyncio.run(_t())
    assert any("no complete prior tariff set" in r.message for r in caplog.records)


def test_refresh_tariffs_fetch_exception_returns_false() -> None:
    async def _t() -> None:
        outcome, update_mock, reload_ids = await _run_refresh(
            entry_options=_complete_stored_options(),
            entry_data={const.CONF_CONTRACT_POWER: "9"},
            payload=ValueError("network"),
        )
        assert outcome.ok is False
        assert outcome.rejected_incomplete_payload is False
        update_mock.assert_not_called()
        assert reload_ids == []

    asyncio.run(_t())


def test_refresh_tariffs_complete_without_update_entry_skips_persist() -> None:
    async def _t() -> None:
        outcome, update_mock, reload_ids = await _run_refresh(
            entry_options={},
            entry_data={const.CONF_CONTRACT_POWER: "9"},
            payload=_complete_api_payload(),
            update_entry=False,
        )
        assert outcome.ok is True
        assert outcome.complete_payload_accepted is True
        update_mock.assert_not_called()
        assert reload_ids == []

    asyncio.run(_t())
