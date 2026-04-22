"""Midnight maintenance: day statistics, accumulator cleanup, persist, refresh."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any


async def run_midnight_maintenance(
    *,
    yesterday_iso: str,
    write_day_statistics: Callable[[str], Awaitable[None]],
    state_lock: Any,
    cleanup_accumulators: Callable[[int], None],
    schedule_save_locked: Callable[[], None],
    flush_pending_store_save: Callable[[], Awaitable[None]],
    request_refresh: Callable[[], Awaitable[None]],
    keep_days: int = 7,
) -> None:
    await write_day_statistics(yesterday_iso)
    async with state_lock:
        cleanup_accumulators(keep_days=keep_days)
        schedule_save_locked()
    await flush_pending_store_save()
    await request_refresh()
