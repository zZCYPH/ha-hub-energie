"""Classify integration setup / first-refresh exceptions for operator logs."""

from __future__ import annotations

import asyncio
import enum
import json
import logging
from typing import Any

try:
    from aiohttp import ClientError as AiohttpClientError
except ImportError:  # pragma: no cover
    AiohttpClientError = ()  # type: ignore[misc, assignment]

try:
    from homeassistant.helpers.update_coordinator import UpdateFailed
except ImportError:  # pragma: no cover — tests use stub
    class UpdateFailed(Exception):
        """Stub when homeassistant is not installed."""

__all__ = (
    "StartupFailureCategory",
    "UpdateFailed",
    "classify_startup_failure",
    "log_first_refresh_failure",
    "unwrap_refresh_error",
)


class StartupFailureCategory(str, enum.Enum):
    NETWORK_PROVIDER = "network_provider"
    INVALID_VALUE = "invalid_value"
    INTERNAL = "internal"


def unwrap_refresh_error(exc: BaseException) -> BaseException:
    """Return the root cause under UpdateFailed or the exception itself."""
    current: BaseException = exc
    seen: set[int] = set()
    while id(current) not in seen:
        seen.add(id(current))
        if isinstance(current, UpdateFailed):
            cause = current.__cause__
            if isinstance(cause, BaseException):
                current = cause
                continue
            args = getattr(current, "args", ())
            if args and isinstance(args[0], BaseException):
                current = args[0]
                continue
            break
        cause = current.__cause__
        if isinstance(cause, BaseException) and cause is not current:
            current = cause
            continue
        break
    return current


def classify_startup_failure(root: BaseException) -> StartupFailureCategory:
    if isinstance(root, (TimeoutError, asyncio.TimeoutError)):
        return StartupFailureCategory.NETWORK_PROVIDER
    if AiohttpClientError and isinstance(root, AiohttpClientError):  # type: ignore[arg-type]
        return StartupFailureCategory.NETWORK_PROVIDER
    if isinstance(root, OSError) and getattr(root, "errno", None) is not None:
        # Connection errors often surface as OSError with errno
        return StartupFailureCategory.NETWORK_PROVIDER
    if isinstance(root, (ValueError, TypeError)):
        return StartupFailureCategory.INVALID_VALUE
    return StartupFailureCategory.INTERNAL


def log_first_refresh_failure(
    logger: logging.Logger,
    *,
    entry_id: str,
    exc: BaseException,
) -> None:
    root = unwrap_refresh_error(exc)
    category = classify_startup_failure(root)
    payload: dict[str, Any] = {
        "entry_id": entry_id,
        "category": str(category),
        "root_type": type(root).__name__,
        "message": str(root),
    }
    msg = json.dumps(payload, ensure_ascii=False)
    if category == StartupFailureCategory.INTERNAL:
        logger.error("First refresh failed %s", msg, exc_info=exc)
    else:
        logger.error("First refresh failed %s", msg)
