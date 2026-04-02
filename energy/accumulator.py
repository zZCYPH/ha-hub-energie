"""Pure delta accumulation decisions (no I/O, logging, or side effects)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Mapping

__all__ = ("DeltaApplyResult", "DeltaStatePatch", "compute_delta_decision")


@dataclass(frozen=True)
class DeltaApplyResult:
    """Result of one delta-application attempt."""

    outcome: str
    should_save: bool
    delta_kwh: float = 0.0
    last_raw: float | None = None
    new_raw: float | None = None


@dataclass(frozen=True)
class DeltaStatePatch:
    """State updates to apply atomically after a decision (RuntimeState mutates from this)."""

    source_key: str
    entity_id: str
    update_last_raw: bool
    last_raw_value: float
    add_to_accum: tuple[str, str, str, float] | None


def compute_delta_decision(
    *,
    source_entity_by_source: Mapping[str, str],
    last_raw_by_source: Mapping[str, float],
    day: str,
    slot: str,
    source_key: str,
    entity_id: str,
    normalized_new: float,
    normalize_kwh: Callable[[float], float],
    max_delta_kwh_for_source: Callable[[str], float],
    is_plausible_reset: Callable[[str, float, float], bool],
) -> tuple[DeltaApplyResult, DeltaStatePatch]:
    """Return the observable outcome plus the exact patch RuntimeState should apply."""
    previous_entity = source_entity_by_source.get(source_key)
    if previous_entity is not None and previous_entity != entity_id:
        return (
            DeltaApplyResult(outcome="source_changed", should_save=True),
            DeltaStatePatch(
                source_key=source_key,
                entity_id=entity_id,
                update_last_raw=True,
                last_raw_value=normalized_new,
                add_to_accum=None,
            ),
        )

    last = last_raw_by_source.get(source_key)
    if last is None:
        return (
            DeltaApplyResult(outcome="initialized", should_save=True),
            DeltaStatePatch(
                source_key=source_key,
                entity_id=entity_id,
                update_last_raw=True,
                last_raw_value=normalized_new,
                add_to_accum=None,
            ),
        )

    delta_kwh = normalize_kwh(normalized_new - last)
    if delta_kwh < 0:
        if is_plausible_reset(source_key, last, normalized_new):
            return (
                DeltaApplyResult(
                    outcome="reset_rebased",
                    should_save=True,
                    delta_kwh=delta_kwh,
                    last_raw=last,
                    new_raw=normalized_new,
                ),
                DeltaStatePatch(
                    source_key=source_key,
                    entity_id=entity_id,
                    update_last_raw=True,
                    last_raw_value=normalized_new,
                    add_to_accum=None,
                ),
            )
        return (
            DeltaApplyResult(
                outcome="discarded_negative",
                should_save=False,
                delta_kwh=delta_kwh,
                last_raw=last,
                new_raw=normalized_new,
            ),
            DeltaStatePatch(
                source_key=source_key,
                entity_id=entity_id,
                update_last_raw=False,
                last_raw_value=normalized_new,
                add_to_accum=None,
            ),
        )

    if delta_kwh == 0:
        return (
            DeltaApplyResult(outcome="no_delta", should_save=False),
            DeltaStatePatch(
                source_key=source_key,
                entity_id=entity_id,
                update_last_raw=True,
                last_raw_value=normalized_new,
                add_to_accum=None,
            ),
        )

    if delta_kwh > max_delta_kwh_for_source(source_key):
        return (
            DeltaApplyResult(
                outcome="discarded_unrealistic",
                should_save=False,
                delta_kwh=delta_kwh,
            ),
            DeltaStatePatch(
                source_key=source_key,
                entity_id=entity_id,
                update_last_raw=False,
                last_raw_value=normalized_new,
                add_to_accum=None,
            ),
        )

    return (
        DeltaApplyResult(outcome="applied", should_save=True, delta_kwh=delta_kwh),
        DeltaStatePatch(
            source_key=source_key,
            entity_id=entity_id,
            update_last_raw=True,
            last_raw_value=normalized_new,
            add_to_accum=(day, slot, source_key, delta_kwh),
        ),
    )
