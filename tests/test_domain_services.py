"""Tests for domain services ``refresh`` / ``refresh_tariffs`` (optional config entry scope)."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from typing import Any

import pytest

from homeassistant.exceptions import ServiceValidationError

from hub_energie.const.core import DOMAIN
from hub_energie.service_handlers import (
    async_handle_refresh,
    async_handle_refresh_tariffs,
    async_register_domain_services,
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


def test_config_entry_id_stripped() -> None:
    c = _FakeCoordinator("e1")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c}})
    call = SimpleNamespace(data={"config_entry_id": "  e1  "})
    asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]
    assert c.refresh_count == 1


def test_empty_config_entry_id_means_all() -> None:
    c1 = _FakeCoordinator("e1")
    c2 = _FakeCoordinator("e2")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c1, "e2": c2}})
    for payload in ({}, {"config_entry_id": ""}, {"config_entry_id": "   "}):
        c1.refresh_count = c2.refresh_count = 0
        call = SimpleNamespace(data=payload)
        asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]
        assert c1.refresh_count == 1 and c2.refresh_count == 1


def test_non_string_config_entry_id_raises() -> None:
    hass = SimpleNamespace(data={DOMAIN: {"e1": _FakeCoordinator("e1")}})
    call = SimpleNamespace(data={"config_entry_id": 123})

    async def _run() -> None:
        await async_handle_refresh(hass, call)  # type: ignore[arg-type]

    with pytest.raises(ServiceValidationError):
        asyncio.run(_run())


def test_unknown_config_entry_raises() -> None:
    hass = SimpleNamespace(data={DOMAIN: {}})
    call = SimpleNamespace(data={"config_entry_id": "missing"})

    async def _run() -> None:
        await async_handle_refresh(hass, call)  # type: ignore[arg-type]

    with pytest.raises(ServiceValidationError):
        asyncio.run(_run())


def test_wrong_type_under_entry_id_raises() -> None:
    """Key exists but value is not a coordinator-like object."""
    hass = SimpleNamespace(data={DOMAIN: {"e1": object()}})
    call = SimpleNamespace(data={"config_entry_id": "e1"})

    async def _run() -> None:
        await async_handle_refresh(hass, call)  # type: ignore[arg-type]

    with pytest.raises(ServiceValidationError):
        asyncio.run(_run())


def test_refresh_skips_non_coordinator_values_in_domain_map() -> None:
    c = _FakeCoordinator("e1")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c, "noise": object(), "other": "not-a-coord"}})
    call = SimpleNamespace(data={})
    asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]
    assert c.refresh_count == 1


def test_refresh_tariffs_scoped() -> None:
    c1 = _FakeCoordinator("e1")
    hass = SimpleNamespace(data={DOMAIN: {"e1": c1}})
    call = SimpleNamespace(data={"config_entry_id": "e1"})
    asyncio.run(async_handle_refresh_tariffs(hass, call))  # type: ignore[arg-type]
    assert c1.tariff_refresh_count == 1


def test_refresh_no_op_when_domain_empty() -> None:
    hass = SimpleNamespace(data={})
    call = SimpleNamespace(data={})
    asyncio.run(async_handle_refresh(hass, call))  # type: ignore[arg-type]


def test_async_register_domain_services_registers_handlers() -> None:
    registered: list[tuple[str, str, Any]] = []

    class _Svcs:
        def async_register(self, domain: str, name: str, handler: Any) -> None:
            registered.append((domain, name, handler))

    hass = SimpleNamespace(services=_Svcs(), data={DOMAIN: {}})
    async_register_domain_services(hass)  # type: ignore[arg-type]

    assert [r[:2] for r in registered] == [
        (DOMAIN, "refresh"),
        (DOMAIN, "refresh_tariffs"),
    ]
    _refresh = registered[0][2]
    _tariffs = registered[1][2]
    c = _FakeCoordinator("e1")
    hass.data[DOMAIN]["e1"] = c
    asyncio.run(_refresh(SimpleNamespace(data={})))  # type: ignore[arg-type]
    assert c.refresh_count == 1
    asyncio.run(_tariffs(SimpleNamespace(data={"config_entry_id": "e1"})))  # type: ignore[arg-type]
    assert c.tariff_refresh_count == 1
