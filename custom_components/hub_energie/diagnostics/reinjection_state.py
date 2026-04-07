"""State holder for reinjection diagnostics data."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class ReinjectionState:
    """Owns reinjection diagnostics mutable runtime state."""

    slots: tuple[str, ...]
    diag_causes: tuple[str, ...]
    default_cause: str
    diag_export_kwh: dict[str, dict[str, float]] = field(default_factory=dict)
    diag_export_slot_kwh: dict[str, dict[str, dict[str, float]]] = field(default_factory=dict)
    last_ts: datetime | None = None
    last_cause: str = ""
    last_slot: str | None = None
    export_active_since: datetime | None = None
    dirty: bool = False

    def __post_init__(self) -> None:
        if not self.last_cause:
            self.last_cause = self.default_cause

    def ensure_day(self, day: str) -> dict[str, float]:
        row = self.diag_export_kwh.setdefault(day, {})
        for cause in self.diag_causes:
            row.setdefault(cause, 0.0)
        return row

    def ensure_slot_day(self, day: str) -> dict[str, dict[str, float]]:
        row = self.diag_export_slot_kwh.setdefault(day, {})
        for cause in self.diag_causes:
            slot_map = row.setdefault(cause, {})
            for slot in self.slots:
                slot_map.setdefault(slot, 0.0)
        return row

    def cleanup_day(self, day: str) -> None:
        self.diag_export_kwh.pop(day, None)
        self.diag_export_slot_kwh.pop(day, None)

    def mark_clean(self) -> None:
        self.dirty = False

    def reset_if_needed(self, clear_export_active_since: bool) -> None:
        if clear_export_active_since:
            self.export_active_since = None

    def apply_update_result(self, result: Any) -> None:
        self.reset_if_needed(bool(getattr(result, "clear_export_active_since", False)))
        if bool(getattr(result, "diag_dirty", False)):
            self.dirty = True
        self.last_ts = getattr(result, "next_last_ts", self.last_ts)
        self.last_cause = getattr(result, "next_last_cause", self.last_cause)
        self.last_slot = getattr(result, "next_last_slot", self.last_slot)

    def update(self, result: Any) -> None:
        """Public update entry-point for coordinator integration."""
        self.apply_update_result(result)

    def snapshot(self) -> dict[str, Any]:
        return {
            "diag_export_kwh": self.diag_export_kwh,
            "diag_export_slot_kwh": self.diag_export_slot_kwh,
        }

    def hydrate(self, *, diag_export_kwh: dict[str, Any], diag_export_slot_kwh: dict[str, Any]) -> None:
        self.diag_export_kwh = dict(diag_export_kwh)
        self.diag_export_slot_kwh = dict(diag_export_slot_kwh)
        self.last_ts = None
        self.last_cause = self.default_cause
        self.last_slot = None
        self.export_active_since = None
        self.dirty = False
