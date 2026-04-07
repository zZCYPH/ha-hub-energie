"""Transient HTTP retry with bounded attempts and light backoff (hub_energie providers)."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Final, TypeVar

from aiohttp import ClientConnectionError, ClientResponseError

__all__ = (
    "BACKOFF_BASE_S",
    "MAX_TRANSIENT_HTTP_ATTEMPTS",
    "RETRYABLE_HTTP_STATUSES",
    "TransientHttpError",
    "async_run_with_transient_retry",
    "is_retryable_exception",
)

# One initial try plus (N - 1) retries — keep modest to avoid hammering APIs.
MAX_TRANSIENT_HTTP_ATTEMPTS: Final[int] = 3
BACKOFF_BASE_S: Final[float] = 0.4

RETRYABLE_HTTP_STATUSES: Final[frozenset[int]] = frozenset({408, 429, 500, 502, 503, 504})

_T = TypeVar("_T")


class TransientHttpError(Exception):
    """RTE calendar path: retryable HTTP status before normal ValueError handling."""

    __slots__ = ("status",)

    def __init__(self, status: int) -> None:
        super().__init__(f"HTTP {status}")
        self.status = status


def is_retryable_exception(exc: BaseException) -> bool:
    """True for timeouts, connection errors, and selected HTTP statuses only."""
    if isinstance(exc, TimeoutError):
        return True
    if isinstance(exc, TransientHttpError):
        return True
    if isinstance(exc, ClientResponseError):
        return exc.status in RETRYABLE_HTTP_STATUSES
    if isinstance(exc, ClientConnectionError):
        return True
    return False


async def async_run_with_transient_retry(
    coro_factory: Callable[[], Awaitable[_T]],
    *,
    logger: logging.Logger,
    operation: str,
) -> _T:
    """Run *coro_factory* up to ``MAX_TRANSIENT_HTTP_ATTEMPTS`` times on transient errors.

    Logs warning per retry (no URLs, bodies, or headers). Re-raises immediately on
    non-retryable errors.
    """
    for attempt in range(MAX_TRANSIENT_HTTP_ATTEMPTS):
        try:
            return await coro_factory()
        except BaseException as exc:
            if not is_retryable_exception(exc):
                raise
            if attempt >= MAX_TRANSIENT_HTTP_ATTEMPTS - 1:
                raise
            status = getattr(exc, "status", None)
            extra = f" HTTP {status}" if status is not None else ""
            logger.warning(
                "%s: transient failure (attempt %d/%d): %s%s",
                operation,
                attempt + 1,
                MAX_TRANSIENT_HTTP_ATTEMPTS,
                type(exc).__name__,
                extra,
            )
            await asyncio.sleep(BACKOFF_BASE_S * (2**attempt))
    raise RuntimeError("unreachable")  # pragma: no cover
