"""Store payload normalization/validation helpers."""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from ..utils.energy import normalize_kwh_to_decimals as normalize_kwh
from ..utils.numbers import safe_float


def validate_store_payload(
    *,
    payload: dict[str, Any],
    model_version: int,
    slots: tuple[str, ...],
) -> bool:
    if payload.get("model_version") not in {model_version}:
        return False

    totals = payload.get("totals_kwh_by_source")
    slot_day = payload.get("slot_day_kwh")
    last_raw = payload.get("last_raw_by_source")
    written = payload.get("written_stats_days")
    if not isinstance(totals, dict) or not isinstance(slot_day, dict) or not isinstance(last_raw, dict):
        return False
    if not isinstance(written, (list, set, tuple)):
        return False

    slot_set = set(slots)
    for day_key, by_source in slot_day.items():
        if not isinstance(day_key, str):
            return False
        try:
            datetime.strptime(day_key, "%Y-%m-%d")
        except ValueError:
            return False
        if not isinstance(by_source, dict):
            return False
        for source_key, by_slot in by_source.items():
            if not isinstance(source_key, str) or not isinstance(by_slot, dict):
                return False
            for slot_key, slot_val in by_slot.items():
                if slot_key not in slot_set:
                    return False
                val = safe_float(slot_val)
                if val is None or val < 0:
                    return False

    for mapping in (totals, last_raw):
        for key, value in mapping.items():
            if not isinstance(key, str):
                return False
            val = safe_float(value)
            if val is None or val < 0:
                return False

    for day in written:
        if not isinstance(day, str):
            return False
        try:
            datetime.strptime(day, "%Y-%m-%d")
        except ValueError:
            return False

    lts = payload.get("lts_cumulative_kwh_by_statistic_id")
    if lts is not None:
        if not isinstance(lts, dict):
            return False
        for lts_key, lts_val in lts.items():
            if not isinstance(lts_key, str):
                return False
            lts_f = safe_float(lts_val)
            if lts_f is None or lts_f < 0:
                return False

    anchors = payload.get("drift_anchor_meter_by_source")
    if anchors is not None:
        if not isinstance(anchors, dict):
            return False
        for ak, av in anchors.items():
            if not isinstance(ak, str):
                return False
            af = safe_float(av)
            if af is None or not math.isfinite(af):
                return False
    return True


def build_store_payload(
    *,
    model_version: int,
    totals_kwh_by_source: dict[str, float],
    slot_day_kwh: dict[str, dict[str, dict[str, float]]],
    last_raw_by_source: dict[str, float],
    drift_anchor_meter_by_source: dict[str, float],
    written_stats_days: set[str],
    source_entity_by_source: dict[str, str],
    diag_export_kwh: dict[str, Any],
    diag_export_slot_kwh: dict[str, Any],
    batt_charge_power_split_kwh: dict[str, Any],
    batt_charge_power_split_slot_kwh: dict[str, Any],
    last_stable_attribution_slot: str | None,
    lts_cumulative_kwh_by_statistic_id: dict[str, float],
    decimals: int,
) -> dict[str, Any]:
    return {
        "model_version": model_version,
        "totals_kwh_by_source": {
            k: normalize_kwh(float(v), decimals)
            for k, v in totals_kwh_by_source.items()
        },
        "slot_day_kwh": {
            day: {
                src: {
                    slot: normalize_kwh(float(slot_val), decimals)
                    for slot, slot_val in slots.items()
                }
                for src, slots in by_source.items()
            }
            for day, by_source in slot_day_kwh.items()
        },
        "last_raw_by_source": {
            k: normalize_kwh(float(v), decimals)
            for k, v in last_raw_by_source.items()
        },
        "drift_anchor_meter_by_source": {
            k: normalize_kwh(float(v), decimals)
            for k, v in drift_anchor_meter_by_source.items()
        },
        "written_stats_days": sorted(written_stats_days),
        "source_entity_by_source": dict(source_entity_by_source),
        "diag_export_kwh": diag_export_kwh,
        "diag_export_slot_kwh": diag_export_slot_kwh,
        "batt_charge_power_split_kwh": batt_charge_power_split_kwh,
        "batt_charge_power_split_slot_kwh": batt_charge_power_split_slot_kwh,
        "last_stable_attribution_slot": last_stable_attribution_slot,
        "lts_cumulative_kwh_by_statistic_id": {
            k: normalize_kwh(float(v), decimals)
            for k, v in lts_cumulative_kwh_by_statistic_id.items()
        },
    }


@dataclass(frozen=True)
class StoreManager:
    """Object-oriented facade for store payload operations."""

    model_version: int
    slots: tuple[str, ...]
    decimals: int

    def validate_payload(self, payload: dict[str, Any]) -> bool:
        return validate_store_payload(
            payload=payload,
            model_version=self.model_version,
            slots=self.slots,
        )

    def build_payload(
        self,
        *,
        totals_kwh_by_source: dict[str, float],
        slot_day_kwh: dict[str, dict[str, dict[str, float]]],
        last_raw_by_source: dict[str, float],
        drift_anchor_meter_by_source: dict[str, float],
        written_stats_days: set[str],
        source_entity_by_source: dict[str, str],
        diag_export_kwh: dict[str, Any],
        diag_export_slot_kwh: dict[str, Any],
        batt_charge_power_split_kwh: dict[str, Any],
        batt_charge_power_split_slot_kwh: dict[str, Any],
        last_stable_attribution_slot: str | None,
        lts_cumulative_kwh_by_statistic_id: dict[str, float],
    ) -> dict[str, Any]:
        return build_store_payload(
            model_version=self.model_version,
            totals_kwh_by_source=totals_kwh_by_source,
            slot_day_kwh=slot_day_kwh,
            last_raw_by_source=last_raw_by_source,
            drift_anchor_meter_by_source=drift_anchor_meter_by_source,
            written_stats_days=written_stats_days,
            source_entity_by_source=source_entity_by_source,
            diag_export_kwh=diag_export_kwh,
            diag_export_slot_kwh=diag_export_slot_kwh,
            batt_charge_power_split_kwh=batt_charge_power_split_kwh,
            batt_charge_power_split_slot_kwh=batt_charge_power_split_slot_kwh,
            last_stable_attribution_slot=last_stable_attribution_slot,
            lts_cumulative_kwh_by_statistic_id=lts_cumulative_kwh_by_statistic_id,
            decimals=self.decimals,
        )
