"""Mutable runtime state container for coordinator data."""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from typing import Any, Callable, Mapping

from ..const import SLOTS
from ..diagnostics.reinjection_state import ReinjectionState
from ..energy.accumulator import DeltaApplyResult, compute_delta_decision
from ..energy.delta_policy import DeltaPolicy

__all__ = ("DeltaApplyResult", "RuntimeState")


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
    batt_charge_power_split_slot_kwh: dict[str, dict[str, dict[str, float]]] = field(
        default_factory=dict
    )
    last_stable_attribution_slot: str | None = None
    delta_telemetry: dict[str, dict[str, Any]] = field(default_factory=dict)
    delta_discards: dict[str, int] = field(default_factory=dict)
    last_delta_rejection_by_source: dict[str, dict[str, Any]] = field(default_factory=dict)
    lts_cumulative_kwh_by_statistic_id: dict[str, float] = field(default_factory=dict)

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
        self.last_stable_attribution_slot = None
        self.delta_telemetry = {}
        self.delta_discards = {}
        self.last_delta_rejection_by_source = {}
        self.lts_cumulative_kwh_by_statistic_id = {}
        self.reinjection_state.hydrate(diag_export_kwh={}, diag_export_slot_kwh={})

    def note_delta_discard(self, kind: str) -> None:
        self.delta_discards[kind] = int(self.delta_discards.get(kind, 0)) + 1

    def record_last_delta_rejection(
        self,
        source_key: str,
        *,
        reason: str,
        at_iso: str,
        delta_kwh: float | None = None,
        last_raw: float | None = None,
        new_raw: float | None = None,
    ) -> None:
        """Last non-applied delta outcome per source (debug; not persisted across restart)."""
        payload: dict[str, Any] = {"reason": reason, "at": at_iso}
        if delta_kwh is not None:
            payload["delta_kwh"] = delta_kwh
        if last_raw is not None:
            payload["last_raw"] = last_raw
        if new_raw is not None:
            payload["new_raw"] = new_raw
        self.last_delta_rejection_by_source[str(source_key)] = payload

    def record_applied_delta_telemetry(
        self,
        source_key: str,
        *,
        applied_at_iso: str,
        delta_kwh: float,
        slot: str,
        method: str,
        gap_seconds: float | None,
        drift_kwh: float | None,
    ) -> None:
        self.delta_telemetry[source_key] = {
            "last_applied_at": applied_at_iso,
            "last_delta_kwh": delta_kwh,
            "last_slot": slot,
            "last_method": method,
            "last_gap_seconds": gap_seconds,
            "drift_kwh": drift_kwh,
        }
        if slot in SLOTS:
            self.last_stable_attribution_slot = slot

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
        raw_stable = payload.get("last_stable_attribution_slot")
        self.last_stable_attribution_slot = (
            str(raw_stable) if isinstance(raw_stable, str) and raw_stable in SLOTS else None
        )
        raw_lts = payload.get("lts_cumulative_kwh_by_statistic_id")
        if isinstance(raw_lts, dict):
            lts: dict[str, float] = {}
            for str_key, raw_val in raw_lts.items():
                val = safe_float(raw_val)
                if val is None or val < 0:
                    continue
                lts[str(str_key)] = normalize_kwh(val)
            self.lts_cumulative_kwh_by_statistic_id = lts

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
            last_stable_attribution_slot=self.last_stable_attribution_slot,
            lts_cumulative_kwh_by_statistic_id=self.lts_cumulative_kwh_by_statistic_id,
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
        delta_policy: DeltaPolicy,
    ) -> DeltaApplyResult:
        result, patch = compute_delta_decision(
            source_entity_by_source=self.source_entity_by_source,
            last_raw_by_source=self.last_raw,
            day=day,
            slot=slot,
            source_key=source_key,
            entity_id=entity_id,
            normalized_new=normalized_new,
            normalize_kwh=normalize_kwh,
            max_delta_kwh_for_source=delta_policy.max_delta_kwh,
            is_plausible_reset=delta_policy.is_plausible_reset,
            small_negative_rebase_max_kwh=delta_policy.small_negative_rebase_band_kwh(),
        )
        self.source_entity_by_source[patch.source_key] = patch.entity_id
        if patch.update_last_raw:
            self.last_raw[patch.source_key] = patch.last_raw_value
        if patch.add_to_accum is not None:
            acc_day, acc_slot, acc_source, dkwh = patch.add_to_accum
            day_map = self.accum.setdefault(acc_day, {})
            slot_map = day_map.setdefault(acc_source, self._empty_slots())
            slot_map[acc_slot] = normalize_kwh(slot_map.get(acc_slot, 0.0) + dkwh)
            self.totals_kwh_by_source[acc_source] = normalize_kwh(
                self.totals_kwh_by_source.get(acc_source, 0.0) + dkwh
            )
        return result
