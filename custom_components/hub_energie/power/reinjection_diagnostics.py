"""Reinjection diagnostics accumulation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Callable

from .power_flow import PowerFlowModel


@dataclass(frozen=True)
class ReinjectionDiagnosticsResult:
    diag_day: dict[str, float]
    diag_slot_day: dict[str, dict[str, float]]
    opportunity_by_cause: dict[str, float]
    opportunity_total: float
    diag_dirty: bool
    next_last_ts: datetime
    next_last_cause: str
    next_last_slot: str | None
    clear_export_active_since: bool


def update_reinjection_diagnostics(
    *,
    day: str,
    now_paris: datetime,
    rates: dict[str, float],
    flow: PowerFlowModel,
    cause: str,
    slots: tuple[str, ...],
    diag_causes: tuple[str, ...],
    current_slot: str | None,
    last_ts: datetime | None,
    last_cause: str,
    last_slot: str | None,
    export_ignore_below_w: float,
    max_power_integration_seconds: float,
    battery_power_split_available: bool,
    ensure_diag_day: Callable[[str], dict[str, float]],
    ensure_diag_slot_day: Callable[[str], dict[str, dict[str, float]]],
    ensure_batt_charge_split_day: Callable[[str], dict[str, float]],
    ensure_batt_charge_split_slot_day: Callable[[str], tuple[dict[str, float], dict[str, float]]],
) -> ReinjectionDiagnosticsResult:
    clear_export_active_since = flow.p_export <= export_ignore_below_w
    diag_dirty = False

    if last_ts is not None:
        elapsed_s = max(0.0, (now_paris - last_ts).total_seconds())
        elapsed_h = min(max_power_integration_seconds, elapsed_s) / 3600.0
        if elapsed_h > 0:
            day_diag = ensure_diag_day(day)
            day_diag_slots = ensure_diag_slot_day(day)
            export_kwh = (flow.p_export * elapsed_h) / 1000.0
            day_diag[last_cause] = day_diag.get(last_cause, 0.0) + export_kwh

            slot_diag = last_slot or current_slot or "bleu_hp"
            if slot_diag not in slots:
                slot_diag = "bleu_hp"
            cause_slots = day_diag_slots[last_cause]
            cause_slots[slot_diag] = cause_slots.get(slot_diag, 0.0) + export_kwh
            diag_dirty = True

            if (
                battery_power_split_available
                and flow.p_grid_signed is not None
                and flow.p_batt_charge is not None
                and flow.p_batt_charge > 0
                and flow.p_load is not None
            ):
                split_day = ensure_batt_charge_split_day(day)
                surplus = max(0.0, flow.p_solar - flow.p_load)
                solar_kwh = min(flow.p_batt_charge, surplus) * elapsed_h / 1000.0
                grid_kwh = (flow.p_batt_charge - min(flow.p_batt_charge, surplus)) * elapsed_h / 1000.0
                split_day["solar"] = split_day.get("solar", 0.0) + solar_kwh
                split_day["grid"] = split_day.get("grid", 0.0) + grid_kwh
                grid_slots, solar_slots = ensure_batt_charge_split_slot_day(day)
                grid_slots[slot_diag] = grid_slots.get(slot_diag, 0.0) + grid_kwh
                solar_slots[slot_diag] = solar_slots.get(slot_diag, 0.0) + solar_kwh
                diag_dirty = True

    diag_day = ensure_diag_day(day)
    diag_slot_day = ensure_diag_slot_day(day)
    opportunity_by_cause: dict[str, float] = {}
    for diag_cause in diag_causes:
        slot_map = diag_slot_day.get(diag_cause, {})
        opportunity_by_cause[diag_cause] = sum(
            float(slot_map.get(slot, 0.0)) * float(rates.get(slot, 0.0))
            for slot in slots
        )
    opportunity_total = sum(opportunity_by_cause.values())
    return ReinjectionDiagnosticsResult(
        diag_day=diag_day,
        diag_slot_day=diag_slot_day,
        opportunity_by_cause=opportunity_by_cause,
        opportunity_total=opportunity_total,
        diag_dirty=diag_dirty,
        next_last_ts=now_paris,
        next_last_cause=cause,
        next_last_slot=current_slot,
        clear_export_active_since=clear_export_active_since,
    )
