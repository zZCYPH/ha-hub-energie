"""Mutable runtime state container for coordinator data."""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Mapping

from .diagnostics.reinjection_state import ReinjectionState


@dataclass(frozen=True)
class DeltaApplyResult:
    """Result of one delta-application attempt."""

    outcome: str
    should_save: bool
    delta_kwh: float = 0.0
    last_raw: float | None = None
    new_raw: float | None = None


@dataclass
class RuntimeState:
    """Owns mutable runtime energy/diagnostics accumulation structures."""

    slots: tuple[str, ...]
    reinjection_state: ReinjectionState
    accum: dict[str, dict[str, dict[str, float]]] = field(default_factory=dict)
    last_raw: dict[str, float] = field(default_factory=dict)
    totals_kwh_by_source: dict[str, float] = field(default_factory=dict)
    written_stats_days: set[str] = field(default_factory=set)
    source_entity_by_source: dict[str, str] = field(default_factory=dict)
    batt_charge_power_split_kwh: dict[str, dict[str, float]] = field(default_factory=dict)
    batt_charge_power_split_slot_kwh: dict[str, dict[str, dict[str, float]]] = field(default_factory=dict)

    def _empty_slots(self) -> dict[str, float]:
        return {slot: 0.0 for slot in self.slots}

    def reset(self) -> None:
        self.accum = {}
        self.last_raw = {}
        self.totals_kwh_by_source = {}
        self.written_stats_days = set()
        self.source_entity_by_source = {}
        self.batt_charge_power_split_kwh = {}
        self.batt_charge_power_split_slot_kwh = {}
        self.reinjection_state.hydrate(diag_export_kwh={}, diag_export_slot_kwh={})

    def source_total(self, prefix_or_key: str, *, normalize_kwh: Callable[[float], float]) -> float:
        if prefix_or_key.endswith(":"):
            return normalize_kwh(
                sum(
                    float(value)
                    for key, value in self.totals_kwh_by_source.items()
                    if key.startswith(prefix_or_key)
                )
            )
        return normalize_kwh(float(self.totals_kwh_by_source.get(prefix_or_key, 0.0)))

    def ensure_batt_charge_split_day(self, day: str) -> dict[str, float]:
        row = self.batt_charge_power_split_kwh.setdefault(day, {})
        row.setdefault("solar", 0.0)
        row.setdefault("grid", 0.0)
        return row

    def ensure_batt_charge_split_slot_day(self, day: str) -> tuple[dict[str, float], dict[str, float]]:
        entry = self.batt_charge_power_split_slot_kwh.setdefault(day, {})
        grid_map = entry.setdefault("grid", {})
        solar_map = entry.setdefault("solar", {})
        for slot in self.slots:
            grid_map.setdefault(slot, 0.0)
            solar_map.setdefault(slot, 0.0)
        return grid_map, solar_map

    def cleanup(self, *, keep_days: int) -> None:
        days = sorted(self.accum.keys())
        while len(days) > keep_days:
            oldest = days.pop(0)
            self.accum.pop(oldest, None)
            self.reinjection_state.cleanup_day(oldest)
            self.batt_charge_power_split_kwh.pop(oldest, None)
            self.batt_charge_power_split_slot_kwh.pop(oldest, None)

    def hydrate(
        self,
        payload: dict[str, Any],
        *,
        normalize_kwh: Callable[[float], float],
        safe_float: Callable[[Any], float | None],
    ) -> None:
        self.totals_kwh_by_source = {
            str(key): normalize_kwh(float(value))
            for key, value in dict(payload.get("totals_kwh_by_source", {})).items()
        }
        self.accum = {}
        slot_day = dict(payload.get("slot_day_kwh", {}))
        for day_key, by_source_any in slot_day.items():
            by_source = dict(by_source_any)
            day_map: dict[str, dict[str, float]] = {}
            for source_key, by_slot_any in by_source.items():
                by_slot = dict(by_slot_any)
                slots = self._empty_slots()
                for slot in self.slots:
                    value = safe_float(by_slot.get(slot, 0.0))
                    slots[slot] = normalize_kwh(value if value is not None and value >= 0 else 0.0)
                day_map[str(source_key)] = slots
            self.accum[str(day_key)] = day_map
        self.last_raw = {
            str(key): normalize_kwh(float(value))
            for key, value in dict(payload.get("last_raw_by_source", {})).items()
        }
        self.written_stats_days = {
            str(value) for value in list(payload.get("written_stats_days", []))
        }
        self.source_entity_by_source = {
            str(key): str(value)
            for key, value in dict(payload.get("source_entity_by_source", {})).items()
            if isinstance(value, str)
        }
        self.batt_charge_power_split_kwh = dict(payload.get("batt_charge_power_split_kwh", {}))
        self.batt_charge_power_split_slot_kwh = dict(
            payload.get("batt_charge_power_split_slot_kwh", {})
        )
        self.reinjection_state.hydrate(
            diag_export_kwh=dict(payload.get("diag_export_kwh", {})),
            diag_export_slot_kwh=dict(payload.get("diag_export_slot_kwh", {})),
        )

    def export_store_payload(self, *, store_manager: Any) -> dict[str, Any]:
        diag_payload = self.reinjection_state.snapshot()
        return store_manager.build_payload(
            totals_kwh_by_source=self.totals_kwh_by_source,
            slot_day_kwh=self.accum,
            last_raw_by_source=self.last_raw,
            written_stats_days=self.written_stats_days,
            source_entity_by_source=self.source_entity_by_source,
            diag_export_kwh=diag_payload["diag_export_kwh"],
            diag_export_slot_kwh=diag_payload["diag_export_slot_kwh"],
            batt_charge_power_split_kwh=self.batt_charge_power_split_kwh,
            batt_charge_power_split_slot_kwh=self.batt_charge_power_split_slot_kwh,
        )

    def snapshot_data(self, day: str) -> Mapping[str, Any]:
        return self.accum.get(day, {})

    def copy_day_acc(self, day: str) -> dict[str, Any] | None:
        day_acc = self.accum.get(day)
        if day_acc is None:
            return None
        return copy.deepcopy(day_acc)

    def mark_written_day(self, day: str) -> None:
        self.written_stats_days.add(day)

    def is_day_written(self, day: str) -> bool:
        return day in self.written_stats_days

    def add_rebuilt_value(
        self,
        *,
        day: str,
        source_key: str,
        slot: str,
        value: float,
        normalize_kwh: Callable[[float], float],
    ) -> None:
        day_map = self.accum.setdefault(day, {})
        source_map_day = day_map.setdefault(source_key, self._empty_slots())
        source_map_day[slot] = normalize_kwh(source_map_day.get(slot, 0.0) + value)
        self.totals_kwh_by_source[source_key] = normalize_kwh(
            self.totals_kwh_by_source.get(source_key, 0.0) + value
        )

    def apply_delta(
        self,
        *,
        day: str,
        slot: str,
        source_key: str,
        entity_id: str,
        normalized_new: float,
        normalize_kwh: Callable[[float], float],
        max_delta_kwh_for_source: Callable[[str], float],
        is_plausible_reset: Callable[[str, float, float], bool],
    ) -> DeltaApplyResult:
        previous_entity = self.source_entity_by_source.get(source_key)
        if previous_entity is not None and previous_entity != entity_id:
            self.source_entity_by_source[source_key] = entity_id
            self.last_raw[source_key] = normalized_new
            return DeltaApplyResult(outcome="source_changed", should_save=True)

        self.source_entity_by_source[source_key] = entity_id
        last = self.last_raw.get(source_key)
        if last is None:
            self.last_raw[source_key] = normalized_new
            return DeltaApplyResult(outcome="initialized", should_save=True)

        delta_kwh = normalize_kwh(normalized_new - last)
        if delta_kwh < 0:
            if is_plausible_reset(source_key, last, normalized_new):
                self.last_raw[source_key] = normalized_new
                return DeltaApplyResult(
                    outcome="reset_rebased",
                    should_save=True,
                    delta_kwh=delta_kwh,
                    last_raw=last,
                    new_raw=normalized_new,
                )
            return DeltaApplyResult(
                outcome="discarded_negative",
                should_save=False,
                delta_kwh=delta_kwh,
                last_raw=last,
                new_raw=normalized_new,
            )

        if delta_kwh == 0:
            self.last_raw[source_key] = normalized_new
            return DeltaApplyResult(outcome="no_delta", should_save=False)

        if delta_kwh > max_delta_kwh_for_source(source_key):
            return DeltaApplyResult(
                outcome="discarded_unrealistic",
                should_save=False,
                delta_kwh=delta_kwh,
            )

        self.last_raw[source_key] = normalized_new
        day_map = self.accum.setdefault(day, {})
        slot_map = day_map.setdefault(source_key, self._empty_slots())
        slot_map[slot] = normalize_kwh(slot_map.get(slot, 0.0) + delta_kwh)
        self.totals_kwh_by_source[source_key] = normalize_kwh(
            self.totals_kwh_by_source.get(source_key, 0.0) + delta_kwh
        )
        return DeltaApplyResult(outcome="applied", should_save=True, delta_kwh=delta_kwh)
