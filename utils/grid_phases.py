"""Helpers for three-phase grid entity lists stored as [{phase, entity_id}, ...]."""

from __future__ import annotations

from typing import Any

__all__ = ("ordered_phase_entity_ids",)


def ordered_phase_entity_ids(phases: Any) -> list[str]:
    """Return entity ids for phases 1, 2, 3 in order, or [] if any phase is missing."""
    if not isinstance(phases, list):
        return []
    by_phase: dict[int, str] = {}
    for row in phases:
        if not isinstance(row, dict):
            continue
        try:
            p = int(row.get("phase", 0))
        except (TypeError, ValueError):
            continue
        eid = row.get("entity_id")
        if isinstance(eid, str) and eid.strip():
            by_phase[p] = eid.strip()
    out = [by_phase.get(1, ""), by_phase.get(2, ""), by_phase.get(3, "")]
    if not all(out):
        return []
    return out
