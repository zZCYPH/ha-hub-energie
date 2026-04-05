"""Synthetic trust level from observability signals (Home Assistant–free)."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Final, Literal

from ..const import TRUST_DRIFT_INCONSISTENT_KWH, TRUST_STALENESS_DEGRADED_SECONDS

__all__ = (
    "TrustInputs",
    "TrustResult",
    "compute_trust",
)

TrustLevel = Literal["ok", "degraded", "rebuilding", "inconsistent"]

# Aligned with coordinator._compute_data_quality heuristics.
_GAP_DEGRADED_S: Final = 7200
_UNKNOWN_BUCKET_EPS_KWH: Final = 0.01

_CAUSE_MESSAGES: dict[str, str] = {
    "ok": "All checked signals are within normal bounds.",
    "recorder_rebuild_from_store": (
        "Internal kWh state was rebuilt from recorder statistics after an invalid store."
    ),
    "internal_total_diverges_from_meter": (
        "Integration SSOT total diverges from meter increments since the last anchor "
        "(initialisation, entity change, or meter rebase) by more than the drift threshold."
    ),
    "tempo_rte_calendar_not_ready": (
        "EDF Tempo with RTE mode is selected but the RTE calendar is not ready yet."
    ),
    "tariff_payload_incomplete": (
        "Last tariff refresh returned an incomplete or invalid payload; displayed rates were not "
        "updated and may be stale."
    ),
    "missing_current_slot": "Current tariff slot is not available; cost slot breakdown may be wrong.",
    "unknown_tariff_bucket": (
        "Some grid energy was booked to the indeterminate tariff bucket (slot could not be resolved)."
    ),
    "attribution_not_direct": (
        "Last energy delta used a non-direct slot attribution (fallback or estimate)."
    ),
    "large_inter_delta_gap": "Long gap between applied meter deltas on at least one source.",
    "battery_data_partial_or_poor": "Battery power-flow or meter data is partial or unreliable.",
    "delta_discards_present": "At least one meter delta was discarded (negative or unrealistic).",
    "stale_meter_data": "No successful meter delta has been applied recently while sources are configured.",
}


@dataclass(frozen=True, slots=True)
class TrustResult:
    level: TrustLevel
    cause_code: str
    cause_message: str


@dataclass(frozen=True, slots=True)
class TrustInputs:
    """Inputs for compute_trust; all optional fields have safe defaults."""

    post_recorder_rebuild_pending: bool = False
    delta_telemetry: Mapping[str, Any] | None = None
    delta_discards: Mapping[str, int] | None = None
    grid_unknown_bucket_kwh_today: float = 0.0
    seconds_since_last_applied_delta: float | None = None
    has_configured_energy_sources: bool = False
    current_slot: str | None = None
    is_edf_tempo_rte_not_ready: bool = False
    tariff_refresh_rejected_incomplete: bool = False
    battery_data_quality: str = "ok"
    data_quality: str = "good"


def _first_large_drift_source(
    telemetry: Mapping[str, Any],
    *,
    threshold_kwh: float,
) -> str | None:
    for key in sorted(telemetry.keys()):
        tel = telemetry[key]
        if not isinstance(tel, dict):
            continue
        raw = tel.get("drift_kwh")
        if raw is None:
            continue
        try:
            drift = float(raw)
        except (TypeError, ValueError):
            continue
        if abs(drift) >= threshold_kwh:
            return str(key)
    return None


def _any_non_direct_method(telemetry: Mapping[str, Any]) -> bool:
    for tel in telemetry.values():
        if not isinstance(tel, dict):
            continue
        method = tel.get("last_method")
        if method not in (None, "direct"):
            return True
    return False


def _any_large_gap(telemetry: Mapping[str, Any], *, gap_s: float) -> bool:
    for tel in telemetry.values():
        if not isinstance(tel, dict):
            continue
        gs = tel.get("last_gap_seconds")
        if gs is None:
            continue
        try:
            if float(gs) > gap_s:
                return True
        except (TypeError, ValueError):
            continue
    return False


def _any_discards(discards: Mapping[str, int] | None) -> bool:
    if not discards:
        return False
    return any(int(v) > 0 for v in discards.values())


def _degraded_cause(inputs: TrustInputs, telemetry: Mapping[str, Any]) -> tuple[str, str] | None:
    if inputs.is_edf_tempo_rte_not_ready:
        return "tempo_rte_calendar_not_ready", _CAUSE_MESSAGES["tempo_rte_calendar_not_ready"]
    if inputs.tariff_refresh_rejected_incomplete:
        return "tariff_payload_incomplete", _CAUSE_MESSAGES["tariff_payload_incomplete"]
    slot = inputs.current_slot
    if not slot:
        return "missing_current_slot", _CAUSE_MESSAGES["missing_current_slot"]
    if float(inputs.grid_unknown_bucket_kwh_today) > _UNKNOWN_BUCKET_EPS_KWH:
        return "unknown_tariff_bucket", _CAUSE_MESSAGES["unknown_tariff_bucket"]
    if _any_non_direct_method(telemetry):
        return "attribution_not_direct", _CAUSE_MESSAGES["attribution_not_direct"]
    if _any_large_gap(telemetry, gap_s=_GAP_DEGRADED_S):
        return "large_inter_delta_gap", _CAUSE_MESSAGES["large_inter_delta_gap"]
    bq = str(inputs.battery_data_quality or "ok").lower()
    if bq in ("partial", "poor"):
        return "battery_data_partial_or_poor", _CAUSE_MESSAGES["battery_data_partial_or_poor"]
    if _any_discards(inputs.delta_discards):
        return "delta_discards_present", _CAUSE_MESSAGES["delta_discards_present"]
    if inputs.has_configured_energy_sources:
        stale_s = inputs.seconds_since_last_applied_delta
        if stale_s is not None and stale_s > TRUST_STALENESS_DEGRADED_SECONDS:
            return "stale_meter_data", _CAUSE_MESSAGES["stale_meter_data"]
    if inputs.data_quality == "degraded":
        return "data_quality_degraded", (
            "Data quality heuristics reported degraded (see delta telemetry and unknown bucket)."
        )
    return None


def compute_trust(inputs: TrustInputs) -> TrustResult:
    """Return trust level and primary human-readable cause (strict priority order)."""
    telemetry: Mapping[str, Any] = dict(inputs.delta_telemetry or {})

    if inputs.post_recorder_rebuild_pending:
        return TrustResult(
            "rebuilding",
            "recorder_rebuild_from_store",
            _CAUSE_MESSAGES["recorder_rebuild_from_store"],
        )

    drift_key = _first_large_drift_source(telemetry, threshold_kwh=TRUST_DRIFT_INCONSISTENT_KWH)
    if drift_key is not None:
        msg = _CAUSE_MESSAGES["internal_total_diverges_from_meter"]
        msg = f"{msg} (source: {drift_key})."
        return TrustResult(
            "inconsistent",
            "internal_total_diverges_from_meter",
            msg,
        )

    degraded = _degraded_cause(inputs, telemetry)
    if degraded is not None:
        code, msg = degraded
        return TrustResult("degraded", code, msg)

    return TrustResult("ok", "ok", _CAUSE_MESSAGES["ok"])
