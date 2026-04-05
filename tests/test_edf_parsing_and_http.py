"""EDF/RTE parsing and async client branches (no real network)."""

from __future__ import annotations

import asyncio
import importlib
from datetime import date
from unittest.mock import patch

import pytest

edf = importlib.import_module("hub_energie.providers.edf")
const = importlib.import_module("hub_energie.const")


def test_extract_rows_from_json_payload_errors() -> None:
    with pytest.raises(ValueError, match="missing 'data' list"):
        edf._extract_rows_from_json_payload({"data": {}})  # type: ignore[attr-defined]
    with pytest.raises(ValueError, match="missing 'data' list"):
        edf._extract_rows_from_json_payload({})
    with pytest.raises(ValueError, match="no rows"):
        edf._extract_rows_from_json_payload({"data": []})
    with pytest.raises(ValueError, match="no rows"):
        edf._extract_rows_from_json_payload({"data": ["bad", 1]})


def test_extract_rows_from_json_payload_coerces_cells_to_str() -> None:
    rows = edf._extract_rows_from_json_payload(  # type: ignore[attr-defined]
        {"data": [{"a": 1, "b": None}]}
    )
    assert rows == [{"a": "1", "b": ""}]


def test_raise_rte_calendar_http_error_parses_json_swagger_shape() -> None:
    body = '{"error":"invalid_client","error_description":"Bad credentials"}'
    with pytest.raises(ValueError, match="invalid_client: Bad credentials"):
        edf._raise_rte_calendar_http_error(401, body)

    with pytest.raises(ValueError, match="HTTP 502"):
        edf._raise_rte_calendar_http_error(502, "")


def test_normalize_tempo_stats_payload_partial_or_bad_types() -> None:
    assert edf._normalize_tempo_stats_payload({}) is None
    assert edf._normalize_tempo_stats_payload({"joursBleusConsommes": 1}) is None
    bad = {k: 0 for k in (
        "joursBleusConsommes",
        "joursBleusRestants",
        "joursBlancsConsommes",
        "joursBlancsRestants",
        "joursRougesConsommes",
        "joursRougesRestants",
    )}
    bad["joursBleusConsommes"] = "nope"
    assert edf._normalize_tempo_stats_payload(bad) is None


def test_normalize_tempo_stats_payload_ok() -> None:
    raw = {
        "joursBleusConsommes": 1,
        "joursBleusRestants": 2,
        "joursBlancsConsommes": 3,
        "joursBlancsRestants": 4,
        "joursRougesConsommes": 5,
        "joursRougesRestants": 6,
    }
    out = edf._normalize_tempo_stats_payload(raw)
    assert out == {
        "blue": {"elapsed": 1, "remaining": 2},
        "white": {"elapsed": 3, "remaining": 4},
        "red": {"elapsed": 5, "remaining": 6},
    }


@patch("hub_energie.providers.edf.date")
def test_extract_offer_tariffs_tempo_selects_row(mock_date) -> None:
    mock_date.today.return_value = date(2026, 6, 15)
    row = {
        "P_SOUSCRITE": "9",
        "DATE_DEBUT": "01/01/2026",
        "DATE_FIN": "31/12/2026",
        "PART_FIXE_TTC": "100",
        "PART_VARIABLE_HCBleu_TTC": "0,10",
        "PART_VARIABLE_HPBleu_TTC": "0,20",
        "PART_VARIABLE_HCBlanc_TTC": "0,11",
        "PART_VARIABLE_HPBlanc_TTC": "0,21",
        "PART_VARIABLE_HCRouge_TTC": "0,12",
        "PART_VARIABLE_HPRouge_TTC": "0,22",
    }
    out = edf.extract_offer_tariffs([row], const.TARIFF_OFFER_TEMPO, "9")
    assert out["offer"] == const.TARIFF_OFFER_TEMPO
    assert out["hc_bleu_ttc"] == pytest.approx(0.1)
    assert out["hp_rouge_ttc"] == pytest.approx(0.22)


def test_async_fetch_access_token_missing_access_token_raises() -> None:
    class _Resp:
        status = 200

        async def json(self) -> dict:
            return {"token_type": "Bearer"}

        def raise_for_status(self) -> None:
            return None

        async def __aenter__(self) -> _Resp:
            return self

        async def __aexit__(self, *_a: object) -> None:
            return None

    class _Session:
        def post(self, *_a: object, **_kw: object) -> _Resp:
            return _Resp()

    async def _run() -> None:
        with pytest.raises(ValueError, match="missing access_token"):
            await edf.async_fetch_access_token(_Session(), "id", "secret")  # type: ignore[arg-type]

    asyncio.run(_run())


def test_get_json_rejects_non_object_payload() -> None:
    class _Resp:
        status = 200

        async def json(self, content_type: object = None) -> object:
            return []

        def raise_for_status(self) -> None:
            return None

        async def __aenter__(self) -> _Resp:
            return self

        async def __aexit__(self, *_a: object) -> None:
            return None

    class _Session:
        def get(self, *_a: object, **_kw: object) -> _Resp:
            return _Resp()

    async def _run() -> None:
        with pytest.raises(ValueError, match="expected object"):
            await edf._get_json(_Session(), "/api/stats")  # type: ignore[arg-type]

    asyncio.run(_run())
