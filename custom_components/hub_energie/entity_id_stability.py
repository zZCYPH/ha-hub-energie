"""Short, stable ``entity_id`` object_ids for Hub Énergie (per config entry slot).

Home Assistant builds default ``entity_id`` from device + entity names when
``has_entity_name`` is True, so translated labels produce unpredictable slugs.

We steer registration with ``_attr_suggested_object_id`` using:

    ``hub_energie_<n>_<unique_id_suffix>``

where ``<n>`` is a stable 0-based index among all loaded Hub Énergie config
entries (sorted by ``entry_id``), and ``<unique_id_suffix>`` is the part of the
entity ``unique_id`` after ``{entry.unique_id}_`` (ASCII, from our code).

This stays short for a single bridge (e.g. ``sensor.hub_energie_0_frontend_data``),
remains unique across several entries, and does not embed supplier / meter
strings in every id.

Renames go through the entity registry (``async_update_entity``), which Home
Assistant uses to keep long-term statistics attached to the same logical entity.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

from homeassistant.util import slugify as ha_slugify

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant


def stable_object_id_from_unique_id_legacy(unique_id: str) -> str | None:
    """v5 migration only: ``hub_energie_`` + slug(full ``unique_id``)."""
    uid = str(unique_id).strip()
    if not uid:
        return None
    tail = ha_slugify(uid, separator="_")
    if not tail:
        return None
    safe = re.sub(r"_+", "_", tail).strip("_")
    if not safe:
        safe = "entity"
    return f"{DOMAIN}_{safe}"


# ``unique_id`` suffix (after ``{entry.unique_id}_``) → key on ``cost_detail.card_entity_ids``.
_CARD_ENTITY_SUFFIX_TO_KEY: dict[str, str] = {
    "cost_detail": "cost",
    "savings_solar_eur": "ecoSolar",
    "savings_battery_eur": "ecoBatt",
    "origin_grid_kwh": "originGrid",
    "origin_solar_kwh": "originSolar",
    "usage_grid_direct_kwh": "usageGridDirect",
    "usage_grid_batt_charge_kwh": "usageGridBatt",
    "usage_solar_direct_kwh": "usageSolarDirect",
    "usage_solar_batt_charge_kwh": "usageSolarBatt",
    "usage_batt_home_kwh": "usageBattHome",
}


def hub_entity_slot(hass: HomeAssistant, entry: ConfigEntry) -> int:
    """0-based stable slot for this config entry among all Hub Énergie entries."""
    entries = sorted(
        hass.config_entries.async_entries(DOMAIN),
        key=lambda e: e.entry_id,
    )
    for i, e in enumerate(entries):
        if e.entry_id == entry.entry_id:
            return i
    return 0


def indexed_object_id_from_entry(hass: HomeAssistant, entry: ConfigEntry, entity_unique_id: str) -> str | None:
    """Return ``object_id`` (no domain prefix) ``hub_energie_<n>_<suffix>``."""
    uid = str(entity_unique_id).strip()
    prefix = f"{entry.unique_id}_"
    if not uid.startswith(prefix):
        return None
    suffix = uid[len(prefix) :]
    if not suffix:
        return None
    n = hub_entity_slot(hass, entry)
    return f"{DOMAIN}_{n}_{suffix}"


def apply_stable_suggested_object_id(entity: Any) -> None:
    """Set ``_attr_suggested_object_id`` from coordinator entry + entity ``unique_id``."""
    uid = getattr(entity, "_attr_unique_id", None)
    if not isinstance(uid, str):
        return
    coordinator = getattr(entity, "coordinator", None)
    hass = getattr(coordinator, "hass", None) if coordinator else None
    entry = getattr(coordinator, "entry", None) if coordinator else None
    if hass is None or entry is None:
        return
    oid = indexed_object_id_from_entry(hass, entry, uid)
    if oid:
        entity._attr_suggested_object_id = oid


def build_card_entity_id_map(hass: Any, entry: Any) -> dict[str, str]:
    """Resolve Lovelace card sensor ``entity_id``\\ s from the entity registry."""
    from homeassistant.helpers import entity_registry as er

    registry = er.async_get(hass)
    prefix = f"{entry.unique_id}_"
    out: dict[str, str] = {}
    for reg in er.async_entries_for_config_entry(registry, entry.entry_id):
        if reg.platform != DOMAIN:
            continue
        uid = reg.unique_id
        if not isinstance(uid, str) or not uid.startswith(prefix):
            continue
        suffix = uid[len(prefix) :]
        key = _CARD_ENTITY_SUFFIX_TO_KEY.get(suffix)
        if key:
            out[key] = reg.entity_id
    return out
