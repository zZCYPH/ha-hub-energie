"""Config entry migrations for Hub Énergie."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, split_entity_id
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# First entity_id prefix sweep (legacy slugs → hub_energie_*).
CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX = 2
# v3 re-runs the prefix sweep so entities created after v2 (e.g. frontend_data) are renamed.
CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3 = 3
# v4 aligns Lovelace card-facing sensors to stable ``hub_energie_*`` object_ids (translation-proof).
CONFIG_ENTRY_VERSION = 4


def _entity_needs_domain_prefix(object_id: str) -> bool:
    if object_id == DOMAIN:
        return False
    return not object_id.startswith(f"{DOMAIN}_")


def _migrate_entity_ids_for_config_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> None:
    """Prepend hub_energie_ to entity object_ids that still use legacy slugs."""
    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for reg in sorted(entries, key=lambda e: e.entity_id):
        if reg.platform != DOMAIN:
            continue
        domain_part, object_id = split_entity_id(reg.entity_id)
        if not _entity_needs_domain_prefix(object_id):
            continue
        new_entity_id = f"{domain_part}.{DOMAIN}_{object_id}"
        if registry.async_get(new_entity_id) is not None:
            _LOGGER.warning(
                "Entity ID migration: cannot rename %s -> %s (target already exists); "
                "rename or resolve the conflict manually",
                reg.entity_id,
                new_entity_id,
            )
            continue
        _LOGGER.info(
            "Entity ID migration: %s -> %s",
            reg.entity_id,
            new_entity_id,
        )
        registry.async_update_entity(reg.entity_id, new_entity_id=new_entity_id)


# unique_id suffix (after config entry uuid) → stable object_id (``sensor.<object_id>``).
_CARD_STABLE_ENTITY_OBJECT_IDS: tuple[tuple[str, str], ...] = (
    ("_cost_detail", "hub_energie_cost_detail"),
    ("_savings_solar_eur", "hub_energie_savings_solar_eur"),
    ("_savings_battery_eur", "hub_energie_savings_battery_eur"),
    ("_origin_grid_kwh", "hub_energie_origin_grid_kwh"),
    ("_origin_solar_kwh", "hub_energie_origin_solar_kwh"),
    ("_usage_grid_direct_kwh", "hub_energie_usage_grid_direct_kwh"),
    ("_usage_grid_batt_charge_kwh", "hub_energie_usage_grid_batt_charge_kwh"),
    ("_usage_solar_direct_kwh", "hub_energie_usage_solar_direct_kwh"),
    ("_usage_solar_batt_charge_kwh", "hub_energie_usage_solar_batt_charge_kwh"),
    ("_usage_batt_home_kwh", "hub_energie_usage_batt_home_kwh"),
)


def _migrate_card_facing_entity_ids(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> None:
    """Rename sensors the Lovelace card reads to stable ``hub_energie_*`` slugs (matches suggested_object_id)."""
    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for reg in entries:
        if reg.platform != DOMAIN:
            continue
        uid = reg.unique_id
        if not isinstance(uid, str):
            continue
        object_id: str | None = None
        for unique_suffix, stable_object_id in _CARD_STABLE_ENTITY_OBJECT_IDS:
            if uid.endswith(unique_suffix):
                object_id = stable_object_id
                break
        if object_id is None:
            continue
        domain_part, _old_obj = split_entity_id(reg.entity_id)
        if domain_part != "sensor":
            continue
        new_entity_id = f"sensor.{object_id}"
        if reg.entity_id == new_entity_id:
            continue
        if registry.async_get(new_entity_id) is not None:
            existing = registry.async_get(new_entity_id)
            if existing is not None and existing.id != reg.id:
                _LOGGER.warning(
                    "Entity ID migration v4: cannot rename %s -> %s (target already used by another entity); "
                    "rename manually or free the entity id",
                    reg.entity_id,
                    new_entity_id,
                )
            continue
        _LOGGER.info(
            "Entity ID migration v4 (card-facing stable slug): %s -> %s",
            reg.entity_id,
            new_entity_id,
        )
        registry.async_update_entity(reg.entity_id, new_entity_id=new_entity_id)


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Migrate config entry: ``hub_energie_`` prefix (v2/v3) and stable card-facing slugs (v4)."""
    version = config_entry.version

    if version > CONFIG_ENTRY_VERSION:
        _LOGGER.error(
            "Migration not possible: config entry version %s is newer than %s",
            version,
            CONFIG_ENTRY_VERSION,
        )
        return False

    if version < CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX,
        )

    if config_entry.version < CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3,
        )

    if config_entry.version < CONFIG_ENTRY_VERSION:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        _migrate_card_facing_entity_ids(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION,
        )

    return True
