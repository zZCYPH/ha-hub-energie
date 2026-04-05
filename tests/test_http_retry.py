"""Tests for ``providers.http_retry`` transient retry helper."""

from __future__ import annotations

import asyncio
import importlib
import logging
import sys
import types
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.providers", HUB_DIR / "providers")

http_retry = importlib.import_module("hub_energie.providers.http_retry")
aiohttp_mod = sys.modules["aiohttp"]


@pytest.fixture
def retry_logger() -> logging.Logger:
    return logging.getLogger("hub_energie.tests.http_retry")


def test_async_run_immediate_success(retry_logger: logging.Logger) -> None:
    n = 0

    async def factory() -> int:
        nonlocal n
        n += 1
        return 7

    async def _run() -> None:
        with patch.object(http_retry.asyncio, "sleep", new=AsyncMock()):
            out = await http_retry.async_run_with_transient_retry(
                factory, logger=retry_logger, operation="op"
            )
        assert out == 7
        assert n == 1

    asyncio.run(_run())


def test_async_run_success_after_transient_http_error(retry_logger: logging.Logger) -> None:
    n = 0

    async def factory() -> str:
        nonlocal n
        n += 1
        if n == 1:
            raise http_retry.TransientHttpError(503)
        return "ok"

    async def _run() -> None:
        sleep_m = AsyncMock()
        with patch.object(http_retry.asyncio, "sleep", new=sleep_m):
            out = await http_retry.async_run_with_transient_retry(
                factory, logger=retry_logger, operation="op"
            )
        assert out == "ok"
        assert n == 2
        sleep_m.assert_awaited_once()

    asyncio.run(_run())


def test_async_run_exhausts_attempts(retry_logger: logging.Logger) -> None:
    n = 0

    async def factory() -> None:
        nonlocal n
        n += 1
        raise http_retry.TransientHttpError(502)

    async def _run() -> None:
        with patch.object(http_retry.asyncio, "sleep", new=AsyncMock()):
            with pytest.raises(http_retry.TransientHttpError):
                await http_retry.async_run_with_transient_retry(
                    factory, logger=retry_logger, operation="op"
                )
        assert n == http_retry.MAX_TRANSIENT_HTTP_ATTEMPTS

    asyncio.run(_run())


def test_async_run_no_retry_on_value_error(retry_logger: logging.Logger) -> None:
    n = 0

    async def factory() -> None:
        nonlocal n
        n += 1
        raise ValueError("business")

    async def _run() -> None:
        sleep_m = AsyncMock()
        with patch.object(http_retry.asyncio, "sleep", new=sleep_m):
            with pytest.raises(ValueError, match="business"):
                await http_retry.async_run_with_transient_retry(
                    factory, logger=retry_logger, operation="op"
                )
        assert n == 1
        sleep_m.assert_not_awaited()

    asyncio.run(_run())


def test_async_run_no_retry_on_client_response_401(retry_logger: logging.Logger) -> None:
    n = 0
    ClientResponseError = aiohttp_mod.ClientResponseError

    async def factory() -> None:
        nonlocal n
        n += 1
        raise ClientResponseError(None, (), status=401, message="Unauthorized")

    async def _run() -> None:
        sleep_m = AsyncMock()
        with patch.object(http_retry.asyncio, "sleep", new=sleep_m):
            with pytest.raises(ClientResponseError):
                await http_retry.async_run_with_transient_retry(
                    factory, logger=retry_logger, operation="op"
                )
        assert n == 1
        sleep_m.assert_not_awaited()

    asyncio.run(_run())


def test_is_retryable_client_response_503() -> None:
    err = aiohttp_mod.ClientResponseError(None, (), status=503)
    assert http_retry.is_retryable_exception(err) is True


def test_is_retryable_client_connection_error() -> None:
    assert http_retry.is_retryable_exception(aiohttp_mod.ClientConnectionError("boom")) is True


def test_is_retryable_timeout() -> None:
    assert http_retry.is_retryable_exception(TimeoutError()) is True


def test_get_json_retries_on_503_then_ok() -> None:
    """Thin wiring test: ``edf._get_json`` uses retry around ``raise_for_status``."""
    edf = importlib.import_module("hub_energie.providers.edf")
    ClientResponseError = aiohttp_mod.ClientResponseError
    calls = 0

    class _Resp503:
        status = 503

        def raise_for_status(self) -> None:
            raise ClientResponseError(None, (), status=503)

        async def json(self, content_type: object = None) -> object:
            return {}

        async def __aenter__(self) -> _Resp503:
            return self

        async def __aexit__(self, *_a: object) -> None:
            return None

    class _Resp200:
        status = 200

        def raise_for_status(self) -> None:
            return None

        async def json(self, content_type: object = None) -> object:
            return {"a": 1}

        async def __aenter__(self) -> _Resp200:
            return self

        async def __aexit__(self, *_a: object) -> None:
            return None

    class _Session:
        def get(self, *_a: object, **_kw: object) -> _Resp503 | _Resp200:
            nonlocal calls
            calls += 1
            if calls == 1:
                return _Resp503()
            return _Resp200()

    async def _run() -> None:
        with patch.object(http_retry.asyncio, "sleep", new=AsyncMock()):
            out = await edf._get_json(_Session(), "/api/stats")  # type: ignore[arg-type]
        assert out == {"a": 1}
        assert calls == 2

    asyncio.run(_run())
