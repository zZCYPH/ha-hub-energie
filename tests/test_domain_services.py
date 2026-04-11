"""Tests for domain services ``refresh`` / ``refresh_tariffs`` (optional config entry scope)."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest

from hub_energie.const.core import DOMAIN
from hub_energie.service_handlers import (
    async_handle_refresh,
    async_handle_refresh_tariffs,
)


class _FakeCoordinator:
    def __init__(self, entry_id: str) -> None:
        self.entry_id = entry_id
        self.refresh_count = 0
        self.tariff_refresh_count = 0

    async def async_request_refresh(self) -> None:
        self.refresh_count += 1

    async def async_manual_tariff_refresh(self) -> None:
        self.tariff_refresh_count += 1


def test_refresh_all_when_no_config_entry_id() -> None:
    c1 = _FakeCoordinator("e1")
    c2 = _FakeCoordinator("e2")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c1, "e2": c2}})
    call = SimpleNamespace(data={})
    asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]
    assert c1.refresh_count == 1 and c2.refresh_count == 1


def test_refresh_single_config_entry() -> None:
    c1 = _FakeCoordinator("e1")
    c2 = _FakeCoordinator("e2")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c1, "e2": c2}})
    call = SimpleNamespace(data={"config_entry_id": "e2"})
    asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]
    assert c1.refresh_count == 0 and c2.refresh_count == 1


def test_refresh_tariffs_scoped() -> None:
    c1 = _FakeCoordinator("e1")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c1}})
    call = SimpleNamespace(data={"config_entry_id": "e1"})
    asyncio.run(async_handle_refresh_tariffs(hass, call))  # type: ignore[arg-type]
    assert c1.tariff_refresh_count == 1


def test_unknown_config_entry_raises() -> None:
    from homeassistant.exceptions import ServiceValidationError

    hass = SimpleNamespace(data={DOMAIN: {}})
    call = SimpleNamespace(data={"config_entry_id": "missing"})

    async def _run() -> None:
        await async_handle_refresh(hass, call)  # type: ignore[arg-type]

    with pytest.raises(ServiceValidationError):
        asyncio.run(_run())
