"""Coordinator setup and scheduling helpers (thin glue around persistence/scheduler)."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import Any

from .tariff_wiring import build_tariff_resolver
from ..runtime.events import create_state_changed_handler
from ..runtime.poll_schedule import resolve_next_poll


async def coordinator_async_setup(co: Any) -> None:
    """Initial load, tariff resolver, state listener, scheduler, delta telemetry drift."""
    _, rebuilt = await co._persistence.load()
    co._trust_rebuilding_after_recorder = rebuilt
    co._tariff = build_tariff_resolver(co.entry)
    co.entry.async_on_unload(
        co.hass.bus.async_listen("state_changed", create_state_changed_handler(co)),
    )
    co._scheduler.start()
    await co._async_refresh_delta_telemetry_drift_all_sources()


async def coordinator_rebuild_from_recorder(co: Any) -> None:
    await co._persistence.rebuild_from_recorder()


def coordinator_next_poll_fire_paris(
    after: datetime,
    *,
    is_edf: bool,
    tariff_offer: str,
    tempo_mode: str,
    tomorrow_color: str,
) -> datetime:
    return resolve_next_poll(
        after,
        is_edf=is_edf,
        tariff_offer=tariff_offer,
        tempo_mode=tempo_mode,
        tomorrow_color=tomorrow_color,
    )


def coordinator_cancel_poll_schedule(co: Any) -> None:
    co._scheduler.cancel_poll()


async def coordinator_run_scheduled_poll(
    co: Any,
    *,
    async_request_refresh: Callable[[], Awaitable[None]],
) -> None:
    await async_request_refresh()


def coordinator_arm_next_poll(co: Any) -> None:
    co._scheduler.schedule_poll()
