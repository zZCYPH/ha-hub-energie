"""Short ASCII site slug for stable ``entity_id`` prefixes (per config entry)."""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

from homeassistant.core import split_entity_id
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const.core import DOMAIN, INTEGRATION_TITLE
from .const.tariff_edf import CONF_SITE_SLUG, CONF_SITE_SLUG_LOCKED

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

SITE_SLUG_PATTERN: re.Pattern[str] = re.compile(r"^[a-z0-9]{2,10}$")


def normalize_site_slug(raw: str | None) -> str | None:
    """Return lowercased slug or None if invalid."""
    if raw is None:
        return None
    s = str(raw).strip().lower()
    if not s or not SITE_SLUG_PATTERN.fullmatch(s):
        return None
    return s


def site_slug_for_entry(entry: ConfigEntry) -> str | None:
    """Committed site slug from entry data, or None (use numeric segment)."""
    return normalize_site_slug(entry.data.get(CONF_SITE_SLUG))


def site_slug_is_locked(entry: ConfigEntry) -> bool:
    return bool(entry.data.get(CONF_SITE_SLUG_LOCKED))


def rename_hub_entities_to_site_slug(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    *,
    slug: str | None = None,
) -> None:
    """Registry rename: ``hub_energie_<n|long>_`` → ``hub_energie_<slug>_`` for this entry's entities."""
    slug = slug or site_slug_for_entry(config_entry)
    if not slug:
        return
    registry = er.async_get(hass)
    prefix_uid = f"{config_entry.unique_id}_"
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for reg in sorted(entries, key=lambda e: e.entity_id):
        if reg.platform != DOMAIN:
            continue
        uid = reg.unique_id
        if not isinstance(uid, str) or not uid.startswith(prefix_uid):
            continue
        suffix = uid[len(prefix_uid) :]
        if not suffix:
            continue
        domain_part, _old_obj = split_entity_id(reg.entity_id)
        new_entity_id = f"{domain_part}.{DOMAIN}_{slug}_{suffix}"
        if reg.entity_id == new_entity_id:
            continue
        existing = registry.async_get(new_entity_id)
        if existing is not None and existing.id != reg.id:
            _LOGGER.warning(
                "Site slug rename: cannot rename %s -> %s (target already used)",
                reg.entity_id,
                new_entity_id,
            )
            continue
        _LOGGER.info("Site slug rename: %s -> %s", reg.entity_id, new_entity_id)
        registry.async_update_entity(reg.entity_id, new_entity_id=new_entity_id)


def update_site_device_name(hass: HomeAssistant, entry: ConfigEntry, slug: str | None) -> None:
    """Refresh the per-entry Site device display name after slug change."""
    reg = dr.async_get(hass)
    dev = reg.async_get_device({(DOMAIN, f"{entry.entry_id}_site")})
    if not dev:
        return
    label = (slug or "").strip() or "Site"
    reg.async_update_device(dev.id, name_by_user=f"{INTEGRATION_TITLE} {label}")


def other_entries_with_same_site_slug(
    hass: HomeAssistant,
    slug: str,
    exclude_entry_id: str | None,
) -> list[ConfigEntry]:
    """Other Hub Énergie entries already using this slug (exclude ``entry_id`` if set)."""
    out: list[ConfigEntry] = []
    for e in hass.config_entries.async_entries(DOMAIN):
        if exclude_entry_id and e.entry_id == exclude_entry_id:
            continue
        other = normalize_site_slug(e.data.get(CONF_SITE_SLUG))
        if other == slug:
            out.append(e)
    return out
