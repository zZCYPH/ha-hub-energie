"""Narrow coordinator tests: delta path with mocked attribution (no full HA)."""

from __future__ import annotations

import asyncio
import importlib
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
coord_mod = importlib.import_module("hub_energie.coordinator")
coordinator_apply_delta = importlib.import_module("hub_energie.coordinator_apply_delta")
coordinator_policy = importlib.import_module("hub_energie.coordinator_policy")
slot_attribution = importlib.import_module("hub_energie.tariff.slot_attribution")


def _minimal_entry() -> SimpleNamespace:
    return SimpleNamespace(
        entry_id="coord-test",
        data={
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
        },
        options={},
        async_on_unload=lambda _fn: None,
    )


async def _unknown_then_bleu_hp() -> None:
    from homeassistant.core import HomeAssistant

    hass = HomeAssistant()
    entry = _minimal_entry()
    coord = coord_mod.HubEnergieCoordinator(hass, entry)
    refresh_calls = 0

    async def _count_refresh() -> None:
        nonlocal refresh_calls
        refresh_calls += 1

    coord.async_request_refresh = AsyncMock(side_effect=_count_refresh)
    coord._async_notify_all = AsyncMock()
    coord._reader.read_energy_kwh = lambda _eid: 12.0
    # Skip Tempo day-boundary refresh so we only count the UNKNOWN-slot retry.
    coord._energy_attrib_date = coordinator_policy.local_today_iso()

    results = [
        slot_attribution.SlotAttributionResult(const.SLOT_UNKNOWN, "unknown"),
        slot_attribution.SlotAttributionResult("bleu_hp", "direct"),
    ]

    def _resolve(**_kwargs: object) -> slot_attribution.SlotAttributionResult:
        return results.pop(0)

    with patch.object(coordinator_apply_delta, "resolve_attribution_slot", side_effect=_resolve):
        await coord._async_apply_delta("sensor.grid_import", const.SOURCE_GRID, 12.0)

    assert refresh_calls == 1
    assert coord._async_notify_all.await_count == 1
    assert coord._runtime_state.last_raw.get(const.SOURCE_GRID) is not None


def test_async_apply_delta_requests_refresh_when_first_slot_is_unknown() -> None:
    asyncio.run(_unknown_then_bleu_hp())


async def _discarded_negative_telemetry() -> None:
    from homeassistant.core import HomeAssistant

    hass = HomeAssistant()
    entry = _minimal_entry()
    coord = coord_mod.HubEnergieCoordinator(hass, entry)
    coord.async_request_refresh = AsyncMock()
    coord._async_notify_all = AsyncMock()
    coord._reader.read_energy_kwh = lambda _eid: None

    def _resolve(**_kwargs: object) -> slot_attribution.SlotAttributionResult:
        return slot_attribution.SlotAttributionResult("bleu_hp", "direct")

    with patch.object(coordinator_apply_delta, "resolve_attribution_slot", side_effect=_resolve):
        await coord._async_apply_delta("sensor.grid_import", const.SOURCE_GRID, 100.0)
        # 50 would be plausible reset (new <= last * 0.5); 51 is a large negative discard.
        await coord._async_apply_delta("sensor.grid_import", const.SOURCE_GRID, 51.0)

    rej = coord._runtime_state.last_delta_rejection_by_source.get(const.SOURCE_GRID)
    assert rej is not None
    assert rej["reason"] == "discarded_negative"


def test_async_apply_delta_records_discarded_negative_rejection() -> None:
    asyncio.run(_discarded_negative_telemetry())
