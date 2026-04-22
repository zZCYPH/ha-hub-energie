"""Tests for hub_energie.coordinator_tariff_wiring."""

from __future__ import annotations

import asyncio
import importlib
import logging
import sys
import types
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

const = importlib.import_module("hub_energie.const")
tw = importlib.import_module("hub_energie.coordinator.tariff_wiring")
refresh_mod = importlib.import_module("hub_energie.tariff.refresh")


def test_tariff_refresh_hours_clamps_invalid() -> None:
    assert tw.tariff_refresh_hours({const.OPT_TARIFF_REFRESH_HOURS: "x"}) == const.DEFAULT_TARIFF_REFRESH_HOURS
    assert tw.tariff_refresh_hours({const.OPT_TARIFF_REFRESH_HOURS: 0}) == 1


def test_tariff_refresh_enabled_default() -> None:
    assert tw.tariff_refresh_enabled({}) is False
    assert tw.tariff_refresh_enabled({const.OPT_TARIFF_AUTO_REFRESH: True}) is True
    assert tw.tariff_refresh_enabled({const.OPT_TARIFF_AUTO_REFRESH: False}) is False


def test_next_tariff_refresh_rejected_incomplete_transitions() -> None:
    rejected = refresh_mod.TariffRefreshOutcome(
        ok=True,
        rejected_incomplete_payload=True,
        complete_payload_accepted=False,
    )
    ok_full = refresh_mod.TariffRefreshOutcome(
        ok=True,
        rejected_incomplete_payload=False,
        complete_payload_accepted=True,
    )
    noop = refresh_mod.TariffRefreshOutcome(
        ok=False,
        rejected_incomplete_payload=False,
        complete_payload_accepted=False,
    )
    assert tw.next_tariff_refresh_rejected_incomplete(False, rejected) is True
    assert tw.next_tariff_refresh_rejected_incomplete(True, noop) is True
    assert tw.next_tariff_refresh_rejected_incomplete(True, ok_full) is False


def test_build_tariff_resolver_returns_resolver() -> None:
    entry = SimpleNamespace(
        options={},
        data={const.CONF_SUPPLIER: const.SUPPLIER_EDF},
    )
    r = tw.build_tariff_resolver(entry)
    assert type(r).__name__ == "TariffResolver"


async def _call_async_refresh() -> object:
    entry = SimpleNamespace()
    hass = object()
    out = refresh_mod.TariffRefreshOutcome(
        ok=True,
        rejected_incomplete_payload=False,
        complete_payload_accepted=False,
    )
    with patch.object(tw, "refresh_tariffs", new=AsyncMock(return_value=out)) as m:
        got = await tw.async_refresh_tariffs(
            hass,
            entry,
            update_entry=False,
            is_edf=True,
            tariff_offer="base",
            logger=logging.getLogger("test"),
        )
    m.assert_awaited_once()
    return got


def test_async_refresh_tariffs_delegates_to_refresh_tariffs() -> None:
    got = asyncio.run(_call_async_refresh())
    assert got.ok is True
