"""Config entry migrations for Hub Énergie."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, split_entity_id
from homeassistant.helpers import entity_registry as er

from .const import CONF_SITE_SLUG_LOCKED, DOMAIN
from .entity_id_stability import (
    indexed_object_id_from_entry,
    stable_object_id_from_unique_id_legacy,
)
from .site_slug import rename_hub_entities_to_site_slug, site_slug_for_entry

_LOGGER = logging.getLogger(__name__)

# First entity_id prefix sweep (legacy slugs → hub_energie_*).
CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX = 2
# v3 re-runs the prefix sweep so entities created after v2 (e.g. frontend_data) are renamed.
CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3 = 3
# v4 renamed a fixed list of card-facing sensors to short ``hub_energie_*`` slugs (collision-prone with multiple entries).
CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS = 4
# v5 renames **all** integration entities to ``hub_energie_`` + slug(full unique_id) (translation-proof, entry-unique).
CONFIG_ENTRY_VERSION_LONG_SLUG = 5
# v6 short ids: ``hub_energie_<n>_<suffix>`` (n = stable index among Hub Énergie entries).
CONFIG_ENTRY_VERSION_INDEXED_IDS = 6
# v7 optional rename to ``hub_energie_<site_slug>_<suffix>`` when site slug is locked in config.
CONFIG_ENTRY_VERSION = 7


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


def _migrate_stable_unique_id_slugs(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> None:
    """Rename every ``hub_energie`` platform entity to ``<domain>.hub_energie_<slug(unique_id)>``."""
    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for reg in sorted(entries, key=lambda e: e.entity_id):
        if reg.platform != DOMAIN:
            continue
        uid = reg.unique_id
        if not isinstance(uid, str) or not uid.strip():
            continue
        domain_part, _old_obj = split_entity_id(reg.entity_id)
        new_tail = stable_object_id_from_unique_id_legacy(uid)
        if not new_tail:
            continue
        new_entity_id = f"{domain_part}.{new_tail}"
        if reg.entity_id == new_entity_id:
            continue
        existing = registry.async_get(new_entity_id)
        if existing is not None and existing.id != reg.id:
            _LOGGER.warning(
                "Entity ID migration v5: cannot rename %s -> %s (target already used by another entity); "
                "rename manually or free the entity id",
                reg.entity_id,
                new_entity_id,
            )
            continue
        _LOGGER.info(
            "Entity ID migration v5 (stable slug from unique_id): %s -> %s",
            reg.entity_id,
            new_entity_id,
        )
        registry.async_update_entity(reg.entity_id, new_entity_id=new_entity_id)


def _migrate_indexed_hub_entity_ids(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> None:
    """Rename to ``hub_energie_<slot>_<suffix>`` (short, multi-entry safe; statistics follow registry id)."""
    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for reg in sorted(entries, key=lambda e: e.entity_id):
        if reg.platform != DOMAIN:
            continue
        uid = reg.unique_id
        if not isinstance(uid, str) or not uid.strip():
            continue
        domain_part, _old_obj = split_entity_id(reg.entity_id)
        new_tail = indexed_object_id_from_entry(hass, config_entry, uid)
        if not new_tail:
            continue
        new_entity_id = f"{domain_part}.{new_tail}"
        if reg.entity_id == new_entity_id:
            continue
        existing = registry.async_get(new_entity_id)
        if existing is not None and existing.id != reg.id:
            _LOGGER.warning(
                "Entity ID migration v6: cannot rename %s -> %s (target already used by another entity); "
                "rename manually or free the entity id",
                reg.entity_id,
                new_entity_id,
            )
            continue
        _LOGGER.info(
            "Entity ID migration v6 (indexed hub_energie_<n>_<suffix>): %s -> %s",
            reg.entity_id,
            new_entity_id,
        )
        registry.async_update_entity(reg.entity_id, new_entity_id=new_entity_id)


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Migrate config entry: ``hub_energie_`` prefix (v2/v3), long slugs (v5), indexed ids (v6)."""
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

    if config_entry.version < CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS,
        )

    if config_entry.version < CONFIG_ENTRY_VERSION_LONG_SLUG:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        _migrate_stable_unique_id_slugs(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_LONG_SLUG,
        )

    if config_entry.version < CONFIG_ENTRY_VERSION_INDEXED_IDS:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        _migrate_indexed_hub_entity_ids(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION_INDEXED_IDS,
        )

    if config_entry.version < CONFIG_ENTRY_VERSION:
        _migrate_entity_ids_for_config_entry(hass, config_entry)
        if config_entry.data.get(CONF_SITE_SLUG_LOCKED) and site_slug_for_entry(config_entry):
            rename_hub_entities_to_site_slug(hass, config_entry)
        hass.config_entries.async_update_entry(
            config_entry,
            version=CONFIG_ENTRY_VERSION,
        )

    return True
