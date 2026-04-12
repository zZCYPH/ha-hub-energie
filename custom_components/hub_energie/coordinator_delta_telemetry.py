"""Recompute delta telemetry drift for all configured meter sources."""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping

from .runtime.state import RuntimeState


async def refresh_delta_telemetry_drift_all_sources(
    state_lock: asyncio.Lock,
    runtime_state: RuntimeState,
    source_map: Mapping[str, str | None],
    read_energy_kwh_for_persistence: Callable[[str | None], float | None],
    normalize_kwh: Callable[[float], float],
) -> None:
    """Recompute relative meter drift in existing telemetry (e.g. after restart / anchor migration)."""
    async with state_lock:
        for source_key, ent in source_map.items():
            if not ent:
                continue
            meter_kwh = read_energy_kwh_for_persistence(ent)
            drift = runtime_state.relative_meter_drift_kwh(
                source_key,
                meter_kwh=meter_kwh,
                normalize_kwh=normalize_kwh,
            )
            runtime_state.patch_delta_telemetry_drift(source_key, drift)
