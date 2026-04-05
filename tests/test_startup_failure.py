"""Tests for utils/startup_failure.py."""

from __future__ import annotations

import asyncio

import pytest

from hub_energie.utils.startup_failure import (
    StartupFailureCategory,
    UpdateFailed,
    classify_startup_failure,
    unwrap_refresh_error,
)


def test_unwrap_returns_cause() -> None:
    root = ValueError("bad")
    err = UpdateFailed("wrapped")
    err.__cause__ = root
    assert unwrap_refresh_error(err) is root


def test_unwrap_update_failed_first_arg_exception() -> None:
    root = TypeError("x")
    err = UpdateFailed(root)
    assert unwrap_refresh_error(err) is root


def test_classify_timeout() -> None:
    assert classify_startup_failure(TimeoutError()) == StartupFailureCategory.NETWORK_PROVIDER
    assert (
        classify_startup_failure(asyncio.TimeoutError())
        == StartupFailureCategory.NETWORK_PROVIDER
    )


def test_classify_value_type() -> None:
    assert classify_startup_failure(ValueError()) == StartupFailureCategory.INVALID_VALUE
    assert classify_startup_failure(TypeError()) == StartupFailureCategory.INVALID_VALUE


def test_classify_internal() -> None:
    assert classify_startup_failure(RuntimeError()) == StartupFailureCategory.INTERNAL


@pytest.mark.parametrize(
    "errno",
    [10061, 111],
    ids=["winerror", "econnrefused"],
)
def test_classify_oserror_network(errno: int) -> None:
    assert classify_startup_failure(OSError(errno, "msg")) == StartupFailureCategory.NETWORK_PROVIDER
