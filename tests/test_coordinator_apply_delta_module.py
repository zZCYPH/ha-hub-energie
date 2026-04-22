"""Unit tests for hub_energie.coordinator_apply_delta.apply_energy_delta."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
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

const = importlib.import_module("hub_energie.const")
apply_delta_mod = importlib.import_module("hub_energie.coordinator.apply_delta")
accum_mod = importlib.import_module("hub_energie.energy.accumulator")
slot_attribution = importlib.import_module("hub_energie.tariff.slot_attribution")


def _fake_result_applied() -> accum_mod.DeltaApplyResult:
    return accum_mod.DeltaApplyResult(
        outcome="applied",
        should_save=False,
        delta_kwh=1.0,
        last_raw=10.0,
        new_raw=11.0,
    )


async def _run_apply_energy_delta(
    *,
    resolve_results: list[slot_attribution.SlotAttributionResult],
    energy_date_ref: list[str | None],
) -> tuple[int, int]:
    """Returns (resolve_call_count, refresh_call_count)."""
    resolve_calls = 0

    def _resolve(**_kwargs: object) -> slot_attribution.SlotAttributionResult:
        nonlocal resolve_calls
        resolve_calls += 1
        return resolve_results[resolve_calls - 1]

    refresh = AsyncMock()
    notify = AsyncMock()
    schedule_save = MagicMock()

    rt = MagicMock()
    rt.delta_telemetry = {}
    rt.last_stable_attribution_slot = None
    rt.apply_delta.return_value = _fake_result_applied()
    rt.relative_meter_drift_kwh.return_value = 0.0

    lock = asyncio.Lock()
    edf = SimpleNamespace(current_slot=None)
    entry = object()
    hass = object()
    read_kwh = MagicMock(return_value=11.0)

    dp = MagicMock()

    with patch.object(apply_delta_mod, "resolve_attribution_slot", side_effect=_resolve):
        await apply_delta_mod.apply_energy_delta(
            hass=hass,
            entry=entry,
            edf=edf,
            runtime_state=rt,
            state_lock=lock,
            delta_policy=dp,
            normalize_kwh=lambda x: float(x),
            read_energy_kwh_for_persistence=read_kwh,
            schedule_save_locked=schedule_save,
            async_request_refresh=refresh,
            async_notify_all=notify,
            is_edf=True,
            tariff_offer=const.TARIFF_OFFER_BASE,
            tempo_mode=const.TEMPO_MODE_SENSOR,
            entity_id="sensor.e",
            source_key=const.SOURCE_GRID,
            new_val=11.0,
            energy_attrib_date_ref=energy_date_ref,
        )

    return resolve_calls, refresh.call_count


def test_apply_energy_delta_second_resolve_after_unknown_slot() -> None:
    """UNKNOWN on first attribution triggers refresh then a second resolve (same as coordinator)."""
    results = [
        slot_attribution.SlotAttributionResult(const.SLOT_UNKNOWN, "unknown"),
        slot_attribution.SlotAttributionResult("bleu_hp", "direct"),
    ]

    resolve_calls, refresh_calls = asyncio.run(
        _run_apply_energy_delta(
            resolve_results=results,
            energy_date_ref=["already-set"],  # skip Tempo API day branch
        )
    )
    assert resolve_calls == 2
    assert refresh_calls == 1


def test_apply_energy_delta_single_resolve_when_direct() -> None:
    results = [
        slot_attribution.SlotAttributionResult("bleu_hp", "direct"),
    ]
    resolve_calls, refresh_calls = asyncio.run(
        _run_apply_energy_delta(
            resolve_results=results,
            energy_date_ref=[None],
        )
    )
    assert resolve_calls == 1
    assert refresh_calls == 0
