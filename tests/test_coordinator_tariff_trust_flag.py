"""Coordinator tariff refresh outcome updates trust latch (no full snapshot)."""

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
refresh_mod = importlib.import_module("hub_energie.tariff.refresh")


def _minimal_entry() -> SimpleNamespace:
    return SimpleNamespace(
        entry_id="tariff-trust-test",
        data={
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_PHASE_TYPE: const.PHASE_MONO,
            const.CONF_GRID_IMPORT_ENERGY: "sensor.grid_import",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
            const.CONF_CONTRACT_POWER: "9",
        },
        options={},
        async_on_unload=lambda _fn: None,
    )


async def _run_flag_scenario() -> None:
    from homeassistant.core import HomeAssistant

    hass = HomeAssistant()
    entry = _minimal_entry()
    coord = coord_mod.HubEnergieCoordinator(hass, entry)

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
    net_fail = refresh_mod.TariffRefreshOutcome(
        ok=False,
        rejected_incomplete_payload=False,
        complete_payload_accepted=False,
    )

    with patch.object(coord_mod, "refresh_tariffs", new=AsyncMock(return_value=rejected)):
        await coord._async_refresh_tariffs(update_entry=True)
    assert coord._tariff_refresh_rejected_incomplete is True

    with patch.object(coord_mod, "refresh_tariffs", new=AsyncMock(return_value=net_fail)):
        await coord._async_refresh_tariffs(update_entry=True)
    assert coord._tariff_refresh_rejected_incomplete is True

    with patch.object(coord_mod, "refresh_tariffs", new=AsyncMock(return_value=ok_full)):
        await coord._async_refresh_tariffs(update_entry=True)
    assert coord._tariff_refresh_rejected_incomplete is False


def test_coordinator_tariff_trust_latch_set_clear() -> None:
    asyncio.run(_run_flag_scenario())
