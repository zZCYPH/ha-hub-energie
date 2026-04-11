"""Tests for ``async_get_config_entry_diagnostics``."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from typing import Any

from hub_energie.const import (
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    DOMAIN,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
)
import hub_energie.diagnostics as diag_pkg
from hub_energie.diagnostics.entry import async_get_config_entry_diagnostics


def test_diagnostics_package_exports_callback_for_ha_loader() -> None:
    assert hasattr(diag_pkg, "async_get_config_entry_diagnostics")
    assert callable(diag_pkg.async_get_config_entry_diagnostics)


def test_diagnostics_redacts_rte_and_includes_overview() -> None:
    hass = SimpleNamespace(data={DOMAIN: {}})
    entry = SimpleNamespace(
        entry_id="test-entry",
        title="Maison",
        version=1,
        data={
            CONF_SUPPLIER: SUPPLIER_EDF,
            CONF_TARIFF_OFFER: TARIFF_OFFER_TEMPO,
            "rte_client_secret": "super-secret",
            "rte_client_id": "abcdefghijklmnop",
        },
        options={},
    )
    out = asyncio.run(async_get_config_entry_diagnostics(hass, entry))  # type: ignore[arg-type]
    assert out["title"] == "Maison"
    assert out["config_overview"]["supplier"] == SUPPLIER_EDF
    assert "super-secret" not in str(out)
    assert out["entry_data"].get("rte_client_secret") == "**REDACTED**"
    assert out["coordinator"] is None


def test_diagnostics_includes_coordinator_snapshot() -> None:
    class _Coord:
        last_update_success = True
        data: dict[str, Any] = {"day": "2026-01-01", "trust_level": "ok"}

    hass = SimpleNamespace(data={DOMAIN: {"e1": _Coord()}})
    entry = SimpleNamespace(
        entry_id="e1",
        title="T",
        version=1,
        data={CONF_SUPPLIER: SUPPLIER_EDF, CONF_TARIFF_OFFER: TARIFF_OFFER_TEMPO},
        options={},
    )
    out = asyncio.run(async_get_config_entry_diagnostics(hass, entry))  # type: ignore[arg-type]
    assert out["coordinator"] is not None
    assert out["coordinator"]["last_update_success"] is True
    assert out["coordinator"]["data"]["trust_level"] == "ok"
