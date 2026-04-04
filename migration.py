"""Config entry migrations for Hub Énergie."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, split_entity_id
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Bumped together with HubEnergieConfigFlow.VERSION
CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX = 2


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


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Migrate config entry; v2 prefixes legacy entity IDs with hub_energie_."""
    version = config_entry.version

    if version > CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX:
        _LOGGER.error(
            "Migration not possible: config entry version %s is newer than %s",
            version,
            CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX,
        )
        return False

    if version < CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX,
        )

    return True
