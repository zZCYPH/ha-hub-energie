"""Build redacted data for Home Assistant “Download diagnostics”."""

from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import DOMAIN, OPT_DIAGNOSTICS_HISTORY_DAYS
from ..time.paris_time import ParisTime
from ..utils.config_display import redact_entry_data_for_display

_MANIFEST_PATH = Path(__file__).resolve().parents[1] / "manifest.json"


def _integration_version() -> str | None:
    try:
        data = json.loads(_MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return None
    v = data.get("version")
    return str(v) if v is not None else None


def _coordinator(hass: HomeAssistant, entry: ConfigEntry) -> Any | None:
    domain_data = hass.data.get(DOMAIN)
    if not isinstance(domain_data, dict):
        return None
    return domain_data.get(entry.entry_id)


def _paris_day_window(*, history_days: int) -> tuple[date, date]:
    """Inclusive Paris calendar dates: earliest .. today (``history_days`` long)."""
    today = ParisTime.now().date()
    earliest = today - timedelta(days=max(1, history_days) - 1)
    return earliest, today


def _day_key_in_window(day_key: str, *, earliest: date, latest: date) -> bool:
    try:
        d = datetime.strptime(day_key, "%Y-%m-%d").date()
    except ValueError:
        return False
    return earliest <= d <= latest


def _filter_day_mapping(mapping: dict[str, Any], *, earliest: date, latest: date) -> dict[str, Any]:
    return {k: v for k, v in mapping.items() if _day_key_in_window(k, earliest=earliest, latest=latest)}


def build_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Structured diagnostics for support (redacted entry data + runtime energy slice)."""
    opts = dict(entry.options)
    raw_days = opts.get(OPT_DIAGNOSTICS_HISTORY_DAYS, 14)
    try:
        history_days = int(raw_days)
    except (TypeError, ValueError):
        history_days = 14
    history_days = max(1, min(90, history_days))
    earliest, latest = _paris_day_window(history_days=history_days)

    payload: dict[str, Any] = {
        "integration_version": _integration_version(),
        "diagnostics_history_days": history_days,
        "entry": {
            "title": entry.title,
            "entry_id": entry.entry_id,
            "data": redact_entry_data_for_display(dict(entry.data)),
            "options": redact_entry_data_for_display(opts),
        },
    }

    coord = _coordinator(hass, entry)
    if coord is None:
        payload["coordinator"] = None
        return payload

    rs = coord._runtime_state  # noqa: SLF001 — intentional diagnostics bridge
    all_days = sorted(rs.accum.keys())
    selected_days = [d for d in all_days if _day_key_in_window(d, earliest=earliest, latest=latest)]

    slot_day_slice: dict[str, Any] = {}
    for d in selected_days:
        day_acc = rs.copy_day_acc(d)
        if day_acc is not None:
            slot_day_slice[d] = day_acc

    reinj = rs.reinjection_state
    diag_export = _filter_day_mapping(dict(reinj.diag_export_kwh), earliest=earliest, latest=latest)
    diag_export_slot = _filter_day_mapping(
        dict(reinj.diag_export_slot_kwh), earliest=earliest, latest=latest
    )
    batt_split = _filter_day_mapping(dict(rs.batt_charge_power_split_kwh), earliest=earliest, latest=latest)
    batt_split_slot = _filter_day_mapping(
        dict(rs.batt_charge_power_split_slot_kwh), earliest=earliest, latest=latest
    )

    snap = dict(coord.data) if isinstance(coord.data, dict) else {}

    payload["coordinator"] = {
        "last_update_success": coord.last_update_success,
        "data": snap,
        "runtime": {
            "paris_today": ParisTime.today(),
            "paris_history_earliest": earliest.isoformat(),
            "paris_history_latest": latest.isoformat(),
            "days_in_memory": len(all_days),
            "history_window_days": history_days,
            "days_included": selected_days,
            "totals_kwh_by_source": dict(rs.totals_kwh_by_source),
            "last_raw_by_source": dict(rs.last_raw),
            "drift_anchor_meter_by_source": dict(rs.drift_anchor_meter_by_source),
            "source_entity_by_source": dict(rs.source_entity_by_source),
            "written_stats_days": sorted(rs.written_stats_days),
            "last_stable_attribution_slot": rs.last_stable_attribution_slot,
            "slot_day_kwh": slot_day_slice,
            "delta_telemetry": {
                k: dict(v) if isinstance(v, dict) else v for k, v in rs.delta_telemetry.items()
            },
            "delta_discards": dict(rs.delta_discards),
            "delta_last_rejection": dict(rs.last_delta_rejection_by_source),
            "diag_export_kwh": diag_export,
            "diag_export_slot_kwh": diag_export_slot,
            "batt_charge_power_split_kwh": batt_split,
            "batt_charge_power_split_slot_kwh": batt_split_slot,
            "reinjection_runtime": {
                "last_cause": reinj.last_cause,
                "last_slot": reinj.last_slot,
                "last_ts": reinj.last_ts.isoformat() if reinj.last_ts else None,
                "export_active_since": reinj.export_active_since.isoformat()
                if reinj.export_active_since
                else None,
            },
        },
    }
    return payload
