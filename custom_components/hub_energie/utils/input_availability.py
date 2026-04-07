"""Configured entity presence vs Home Assistant state (readability for input_status)."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Literal, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import (
    CONF_BATT_CAPACITY_KWH_ENTITY,
    CONF_BATT_ENERGY_IN,
    CONF_BATT_ENERGY_OUT,
    CONF_BATT_MAX_CHARGE_W_ENTITY,
    CONF_BATT_MAX_DISCHARGE_W_ENTITY,
    CONF_BATT_POWER_IN,
    CONF_BATT_POWER_NET,
    CONF_BATT_POWER_OUT,
    CONF_BATT_SOC,
    CONF_BATT_SOC_MAX_ENTITY,
    CONF_BATT_SOC_MIN_ENTITY,
    CONF_BATT_ADVANCED,
    CONF_BATTERY_SYSTEMS,
    CONF_CURRENT_SLOT_SENSOR,
    CONF_GRID_EXPORT_ENERGY,
    CONF_GRID_EXPORT_ENERGY_PHASES,
    CONF_GRID_IMPORT_ENERGY,
    CONF_GRID_IMPORT_ENERGY_PHASES,
    CONF_GRID_POWER_PHASES,
    CONF_GRID_POWER_SENSOR,
    CONF_GRID_TRI_ENERGY_MODE,
    CONF_HAS_BATTERIES,
    CONF_HAS_SOLAR,
    CONF_LOAD_POWER_SENSOR,
    CONF_PHASE_TYPE,
    CONF_SOLAR_ENERGY,
    CONF_SOLAR_POWER_SENSOR,
    CONF_SUPPLIER,
    CONF_TARIFF_OFFER,
    CONF_TEMPO_MODE,
    INPUT_REASON_DATA_QUALITY_DEGRADED,
    INPUT_REASON_MISSING_ENTITIES,
    INPUT_REASON_NO_GRID_IMPORT_READABLE,
    INPUT_REASON_TRUST_DEGRADED,
    INPUT_REASON_TRUST_INCONSISTENT,
    INPUT_REASON_UNAVAILABLE_ENTITIES,
    INPUT_STATUS_DEGRADED,
    INPUT_STATUS_ERROR,
    INPUT_STATUS_NO_INPUT,
    INPUT_STATUS_OK,
    PHASE_TRI,
    SUPPLIER_EDF,
    TARIFF_OFFER_TEMPO,
    TEMPO_MODE_SENSOR,
    TRI_GRID_ENERGY_PER_PHASE,
)
from ..ha.reader import HAReader
from ..utils.grid_phases import ordered_phase_entity_ids

Presence = Literal["missing", "unavailable", "ok"]

__all__ = (
    "InputProbeResult",
    "classify_presence",
    "compute_input_probe",
    "derive_input_status",
    "format_probe_log_dict",
    "grid_import_kwh_readable",
    "iter_monitored_entity_roles",
    "probe_signature",
)


def classify_presence(hass: HomeAssistant, entity_id: str) -> Presence:
    """Whether the entity registry entry exists in state machine and is numeric-readable."""
    st = hass.states.get(entity_id)
    if st is None:
        return "missing"
    if st.state in ("unknown", "unavailable", ""):
        return "unavailable"
    return "ok"


def _add_entity(
    out: list[tuple[str, str]],
    role: str,
    entity_id: str | None,
) -> None:
    eid = str(entity_id).strip() if entity_id else ""
    if not eid:
        return
    out.append((role, eid))


def iter_monitored_entity_roles(entry: ConfigEntry) -> list[tuple[str, str]]:
    """Return (role, entity_id) for all configured inputs we surface in diagnostics."""
    data = entry.data
    opts = entry.options
    out: list[tuple[str, str]] = []

    def pick(key: str) -> str | None:
        v = opts.get(key, data.get(key))
        return str(v).strip() if v else None

    # Grid import / export (expand tri-phase to real entity ids)
    if (
        data.get(CONF_PHASE_TYPE) == PHASE_TRI
        and data.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE
    ):
        for eid in ordered_phase_entity_ids(data.get(CONF_GRID_IMPORT_ENERGY_PHASES)):
            _add_entity(out, "grid_import_energy_phase", eid)
        for eid in ordered_phase_entity_ids(data.get(CONF_GRID_EXPORT_ENERGY_PHASES)):
            _add_entity(out, "grid_export_energy_phase", eid)
    else:
        _add_entity(out, "grid_import_energy", pick(CONF_GRID_IMPORT_ENERGY))
        _add_entity(out, "grid_export_energy", pick(CONF_GRID_EXPORT_ENERGY))

    if data.get(CONF_HAS_SOLAR):
        _add_entity(out, "solar_energy", pick(CONF_SOLAR_ENERGY))
        _add_entity(out, "solar_power", pick(CONF_SOLAR_POWER_SENSOR))

    _add_entity(out, "grid_power", pick(CONF_GRID_POWER_SENSOR))
    _add_entity(out, "load_power", pick(CONF_LOAD_POWER_SENSOR))

    for item in data.get(CONF_GRID_POWER_PHASES, []) or []:
        if isinstance(item, dict):
            _add_entity(out, "grid_power_phase", cast(str | None, item.get("entity_id")))

    if (
        data.get(CONF_SUPPLIER, SUPPLIER_EDF) == SUPPLIER_EDF
        and opts.get(CONF_TARIFF_OFFER, data.get(CONF_TARIFF_OFFER)) == TARIFF_OFFER_TEMPO
        and data.get(CONF_TEMPO_MODE) == TEMPO_MODE_SENSOR
    ):
        _add_entity(out, "tempo_slot_sensor", pick(CONF_CURRENT_SLOT_SENSOR))

    if data.get(CONF_HAS_BATTERIES):
        for batt in data.get(CONF_BATTERY_SYSTEMS, []) or []:
            if not isinstance(batt, dict):
                continue
            bid = str(batt.get("id", "")).strip() or "?"
            _add_entity(out, f"battery.{bid}.energy_in", cast(str | None, batt.get(CONF_BATT_ENERGY_IN)))
            _add_entity(out, f"battery.{bid}.energy_out", cast(str | None, batt.get(CONF_BATT_ENERGY_OUT)))
            _add_entity(out, f"battery.{bid}.power_in", cast(str | None, batt.get(CONF_BATT_POWER_IN)))
            _add_entity(out, f"battery.{bid}.power_out", cast(str | None, batt.get(CONF_BATT_POWER_OUT)))
            _add_entity(out, f"battery.{bid}.power_net", cast(str | None, batt.get(CONF_BATT_POWER_NET)))
            _add_entity(out, f"battery.{bid}.soc", cast(str | None, batt.get(CONF_BATT_SOC)))
            adv = bool(batt.get(CONF_BATT_ADVANCED))
            if adv:
                _add_entity(
                    out,
                    f"battery.{bid}.capacity_entity",
                    cast(str | None, batt.get(CONF_BATT_CAPACITY_KWH_ENTITY)),
                )
                _add_entity(
                    out,
                    f"battery.{bid}.max_charge_entity",
                    cast(str | None, batt.get(CONF_BATT_MAX_CHARGE_W_ENTITY)),
                )
                _add_entity(
                    out,
                    f"battery.{bid}.max_discharge_entity",
                    cast(str | None, batt.get(CONF_BATT_MAX_DISCHARGE_W_ENTITY)),
                )
                _add_entity(
                    out,
                    f"battery.{bid}.soc_min_entity",
                    cast(str | None, batt.get(CONF_BATT_SOC_MIN_ENTITY)),
                )
                _add_entity(
                    out,
                    f"battery.{bid}.soc_max_entity",
                    cast(str | None, batt.get(CONF_BATT_SOC_MAX_ENTITY)),
                )

    # Dedupe by entity_id keeping first role (stable order)
    seen: set[str] = set()
    deduped: list[tuple[str, str]] = []
    for role, eid in out:
        if eid in seen:
            continue
        seen.add(eid)
        deduped.append((role, eid))
    return deduped


def grid_import_kwh_readable(reader: HAReader, entry: ConfigEntry) -> bool:
    """True when grid import energy can be read like coordinator persistence (kWh)."""
    d = entry.data
    if (
        d.get(CONF_PHASE_TYPE) == PHASE_TRI
        and d.get(CONF_GRID_TRI_ENERGY_MODE) == TRI_GRID_ENERGY_PER_PHASE
    ):
        ids = ordered_phase_entity_ids(d.get(CONF_GRID_IMPORT_ENERGY_PHASES))
        if len(ids) != 3:
            return False
        v = reader.sum_energy_kwh(ids)
        return v is not None and v >= 0
    eid = d.get(CONF_GRID_IMPORT_ENERGY)
    if not eid or not str(eid).strip():
        return False
    v = reader.read_energy_kwh(str(eid).strip())
    return v is not None and v >= 0


@dataclass(slots=True)
class InputProbeResult:
    """Outcome of scanning configured entities against hass.states."""

    missing_entity_ids: list[str] = field(default_factory=list)
    unavailable_entity_ids: list[str] = field(default_factory=list)
    grid_import_readable: bool = False
    roles_by_entity_id: dict[str, str] = field(default_factory=dict)

    def sorted_signature_parts(self) -> tuple[str, ...]:
        return (
            str(self.grid_import_readable),
            ",".join(sorted(self.missing_entity_ids)),
            ",".join(sorted(self.unavailable_entity_ids)),
        )


def compute_input_probe(hass: HomeAssistant, entry: ConfigEntry, reader: HAReader) -> InputProbeResult:
    roles = iter_monitored_entity_roles(entry)
    roles_by_id: dict[str, str] = {}
    missing: list[str] = []
    unavailable: list[str] = []
    for role, eid in roles:
        roles_by_id.setdefault(eid, role)
        p = classify_presence(hass, eid)
        if p == "missing":
            missing.append(eid)
        elif p == "unavailable":
            unavailable.append(eid)
    missing.sort()
    unavailable.sort()
    return InputProbeResult(
        missing_entity_ids=missing,
        unavailable_entity_ids=unavailable,
        grid_import_readable=grid_import_kwh_readable(reader, entry),
        roles_by_entity_id=roles_by_id,
    )


def derive_input_status(
    probe: InputProbeResult,
    *,
    trust_level: str,
    data_quality: str,
) -> tuple[str, list[str]]:
    """Map probe + trust + data_quality to input_status and stable reason codes."""
    reasons: list[str] = []

    if not probe.grid_import_readable:
        reasons.append(INPUT_REASON_NO_GRID_IMPORT_READABLE)
    if probe.missing_entity_ids:
        reasons.append(INPUT_REASON_MISSING_ENTITIES)
    if probe.unavailable_entity_ids:
        reasons.append(INPUT_REASON_UNAVAILABLE_ENTITIES)

    if not probe.grid_import_readable:
        return INPUT_STATUS_NO_INPUT, reasons

    if trust_level == "inconsistent":
        reasons.append(INPUT_REASON_TRUST_INCONSISTENT)
        return INPUT_STATUS_ERROR, _unique_preserve(reasons)

    degraded = False
    if trust_level in ("degraded", "rebuilding"):
        reasons.append(INPUT_REASON_TRUST_DEGRADED)
        degraded = True
    if data_quality == "degraded":
        if INPUT_REASON_DATA_QUALITY_DEGRADED not in reasons:
            reasons.append(INPUT_REASON_DATA_QUALITY_DEGRADED)
        degraded = True
    if probe.missing_entity_ids or probe.unavailable_entity_ids:
        degraded = True

    if degraded:
        return INPUT_STATUS_DEGRADED, _unique_preserve(reasons)

    return INPUT_STATUS_OK, []


def _unique_preserve(seq: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def probe_signature(input_status: str, probe: InputProbeResult) -> str:
    """Stable string for change detection in logs."""
    payload = {
        "input_status": input_status,
        "missing": probe.missing_entity_ids,
        "unavailable": probe.unavailable_entity_ids,
        "grid_import_readable": probe.grid_import_readable,
    }
    return json.dumps(payload, sort_keys=True)


def format_probe_log_dict(
    *,
    entry_id: str,
    input_status: str,
    reasons: list[str],
    probe: InputProbeResult,
) -> dict[str, object]:
    """JSON-serializable dict for structured logging."""
    return {
        "entry_id": entry_id,
        "input_status": input_status,
        "reasons": list(reasons),
        "missing_entity_ids": list(probe.missing_entity_ids),
        "unavailable_entity_ids": list(probe.unavailable_entity_ids),
        "grid_import_readable": probe.grid_import_readable,
    }
