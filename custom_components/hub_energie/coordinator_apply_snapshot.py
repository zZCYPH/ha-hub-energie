"""Apply a freshly built snapshot under the coordinator state lock (shared notify/update path)."""

from __future__ import annotations

from typing import Any

from .coordinator_types import EnergyData


async def apply_snapshot_to_coordinator(
    co: Any,
    *,
    clear_trust_rebuilding_after_recorder: bool = False,
) -> EnergyData:
    """Build snapshot with lock held, sync ``co.data``, reinjection/save, then notify listeners."""
    async with co._state_lock:
        snapshot = co._build_snapshot()
        co.data = snapshot
        if co._reinjection_state.dirty:
            co._reinjection_state.mark_clean()
            co._schedule_store_save_locked()
    co.async_update_listeners()
    if clear_trust_rebuilding_after_recorder:
        co._trust_rebuilding_after_recorder = False
    return snapshot
