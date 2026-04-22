"""Stable ``entity_id`` object_ids for Hub Énergie (translation-proof, multi-entry safe).

Home Assistant builds default ``entity_id`` from device + entity names when
``has_entity_name`` is True, so translated labels produce unpredictable slugs.

We steer registration with ``_attr_suggested_object_id`` and rename existing
registry rows on migration using the **entity** ``unique_id`` (globally unique
when the config flow unique id includes grid meter entity ids).

Formula: ``hub_energie_`` + slug(full ``unique_id``).
"""

from __future__ import annotations

import re
from typing import Any

from homeassistant.util import slugify as ha_slugify

from .const import DOMAIN

# All generated object_ids start with this prefix.
STABLE_OBJECT_ID_PREFIX = "hub_energie_"

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


def stable_object_id_from_unique_id(unique_id: str) -> str | None:
    """Return suggested ``object_id`` (without ``sensor.`` / ``binary_sensor.`` prefix)."""
    uid = str(unique_id).strip()
    if not uid:
        return None
    tail = ha_slugify(uid, separator="_")
    if not tail:
        return None
    safe = re.sub(r"_+", "_", tail).strip("_")
    if not safe:
        safe = "entity"
    return f"{STABLE_OBJECT_ID_PREFIX}{safe}"


def apply_stable_suggested_object_id(entity: Any) -> None:
    """Set ``_attr_suggested_object_id`` from ``_attr_unique_id`` when possible."""
    uid = getattr(entity, "_attr_unique_id", None)
    if not isinstance(uid, str):
        return
    sid = stable_object_id_from_unique_id(uid)
    if sid:
        entity._attr_suggested_object_id = sid


def build_card_entity_id_map(hass: Any, entry: Any) -> dict[str, str]:
    """Resolve Lovelace card sensor ``entity_id``\\ s from the entity registry (stable slugs)."""
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
