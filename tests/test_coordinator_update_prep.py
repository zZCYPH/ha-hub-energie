"""Tests for hub_energie.coordinator_update_prep."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from datetime import datetime
import logging
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

prep = importlib.import_module("hub_energie.coordinator.update_prep")
edf_mod = importlib.import_module("hub_energie.tariff.edf_state")
paris_time_mod = importlib.import_module("hub_energie.time.paris_time")


async def _run_non_edf_sets_defaults() -> None:
    PARIS_TZ = paris_time_mod.PARIS_TZ
    noon = datetime(2026, 6, 1, 14, 0, 0, tzinfo=PARIS_TZ)
    edf = edf_mod.EdfRuntimeFields()
    entry = SimpleNamespace()
    hass = object()
    build_tr = MagicMock(return_value="resolver")

    with patch.object(prep, "is_off_peak", return_value=True):
        r = await prep.refresh_tariff_resolver_and_edf_before_snapshot(
            hass=hass,
            entry=entry,
            edf=edf,
            is_edf=False,
            tariff_offer="base",
            tempo_mode="sensor",
            now_paris=noon,
            logger=logging.getLogger("t"),
            on_tempo_sensor_branch=lambda: None,
            update_edf_state_fn=AsyncMock(),
            build_tariff_resolver_fn=build_tr,
        )
    assert r == "resolver"
    build_tr.assert_called_once_with(entry)
    assert edf.today_color == "n/a"
    assert edf.tomorrow_color == "n/a"
    assert edf.current_slot == "bleu_hc"
    assert edf.tempo_days_api is None


def test_refresh_prep_non_edf_off_peak_slot() -> None:
    asyncio.run(_run_non_edf_sets_defaults())


async def _run_non_edf_hp_peak() -> None:
    PARIS_TZ = paris_time_mod.PARIS_TZ
    noon = datetime(2026, 6, 1, 14, 0, 0, tzinfo=PARIS_TZ)
    edf = edf_mod.EdfRuntimeFields()
    entry = SimpleNamespace()

    with patch.object(prep, "is_off_peak", return_value=False):
        await prep.refresh_tariff_resolver_and_edf_before_snapshot(
            hass=object(),
            entry=entry,
            edf=edf,
            is_edf=False,
            tariff_offer="base",
            tempo_mode="sensor",
            now_paris=noon,
            logger=logging.getLogger("t"),
            on_tempo_sensor_branch=lambda: None,
            update_edf_state_fn=AsyncMock(),
            build_tariff_resolver_fn=MagicMock(return_value="r"),
        )
    assert edf.current_slot == "bleu_hp"


def test_refresh_prep_non_edf_peak_slot() -> None:
    asyncio.run(_run_non_edf_hp_peak())


async def _run_edf_calls_update() -> None:
    PARIS_TZ = paris_time_mod.PARIS_TZ
    noon = datetime(2026, 6, 1, 14, 0, 0, tzinfo=PARIS_TZ)
    edf = edf_mod.EdfRuntimeFields()
    entry = SimpleNamespace()
    hass = object()
    update_mock = AsyncMock()
    build_tr = MagicMock(return_value="r2")

    branch = MagicMock()
    r = await prep.refresh_tariff_resolver_and_edf_before_snapshot(
        hass=hass,
        entry=entry,
        edf=edf,
        is_edf=True,
        tariff_offer="tempo",
        tempo_mode="api",
        now_paris=noon,
        logger=logging.getLogger("t"),
        on_tempo_sensor_branch=branch,
        update_edf_state_fn=update_mock,
        build_tariff_resolver_fn=build_tr,
    )
    assert r == "r2"
    update_mock.assert_awaited_once()
    kwargs = update_mock.await_args.kwargs
    assert kwargs["hass"] is hass
    assert kwargs["entry"] is entry
    assert kwargs["fields"] is edf
    assert kwargs["now_paris"] is noon
    assert kwargs["tariff_offer"] == "tempo"
    assert kwargs["tempo_mode"] == "api"
    assert kwargs["on_tempo_sensor_branch"] is branch


def test_refresh_prep_edf_delegates_to_update_edf_state() -> None:
    asyncio.run(_run_edf_calls_update())
