"""Stable ``entity_id`` object_ids for Hub Énergie (per config entry).

Uses ``hub_energie_<segment>_<unique_id_suffix>`` where ``<segment>`` is either a
user-chosen ASCII **site slug** (``[a-z0-9]{2,10}``, immutable once locked) or
the numeric **site index** among Hub Énergie entries (sorted by ``entry_id``).
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


def object_id_entity_segment(hass: HomeAssistant, entry: ConfigEntry) -> str:
    """Segment between ``hub_energie_`` and ``_<suffix>`` in suggested ``entity_id``."""
    from .site_slug import site_slug_for_entry

    slug = site_slug_for_entry(entry)
    if slug:
        return slug
    return str(hub_entity_slot(hass, entry))


def indexed_object_id_from_entry(hass: HomeAssistant, entry: ConfigEntry, entity_unique_id: str) -> str | None:
    """Return ``object_id`` ``hub_energie_<segment>_<suffix>`` (segment = slug or index)."""
    uid = str(entity_unique_id).strip()
    prefix = f"{entry.unique_id}_"
    if not uid.startswith(prefix):
        return None
    suffix = uid[len(prefix) :]
    if not suffix:
        return None
    seg = object_id_entity_segment(hass, entry)
    return f"{DOMAIN}_{seg}_{suffix}"


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
