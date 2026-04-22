"""Tests for config entry migration (entity_id prefix ``hub_energie_``)."""

from __future__ import annotations

import asyncio
import importlib
import sys
import types
from dataclasses import dataclass
from types import SimpleNamespace

import homeassistant.core as ha_core

# ---------------------------------------------------------------------------
# Minimal HA shims (conftest does not provide entity_registry / split_entity_id)
# ---------------------------------------------------------------------------


def _split_entity_id(entity_id: str) -> tuple[str, str]:
    domain, _, object_id = entity_id.partition(".")
    return domain, object_id


ha_core.split_entity_id = _split_entity_id  # type: ignore[attr-defined]


@dataclass
class _RegEntry:
    entity_id: str
    platform: str
    config_entry_id: str
    unique_id: str | None = None
    id: str = ""


class _InMemoryEntityRegistry:
    """Enough of the entity registry API for ``migration._migrate_entity_ids_for_config_entry``."""

    def __init__(self) -> None:
        self._by_id: dict[str, _RegEntry] = {}
        self._next_id = 1

    def register(
        self,
        entity_id: str,
        platform: str,
        config_entry_id: str,
        *,
        unique_id: str | None = None,
    ) -> None:
        rid = f"reg_{self._next_id}"
        self._next_id += 1
        self._by_id[entity_id] = _RegEntry(
            entity_id, platform, config_entry_id, unique_id=unique_id, id=rid,
        )

    def async_get(self, entity_id: str) -> _RegEntry | None:
        return self._by_id.get(entity_id)

    def async_update_entity(self, entity_id: str, *, new_entity_id: str) -> None:
        ent = self._by_id.pop(entity_id)
        ent.entity_id = new_entity_id
        self._by_id[new_entity_id] = ent


def _async_entries_for_config_entry(
    registry: _InMemoryEntityRegistry, config_entry_id: str
) -> list[_RegEntry]:
    return sorted(
        (e for e in registry._by_id.values() if e.config_entry_id == config_entry_id),
        key=lambda e: e.entity_id,
    )


def _ensure_entity_registry_module() -> None:
    if "homeassistant.helpers.entity_registry" in sys.modules:
        return
    er_mod = types.ModuleType("homeassistant.helpers.entity_registry")

    def async_get(hass: object) -> _InMemoryEntityRegistry:
        return hass._entity_registry  # type: ignore[attr-defined]

    er_mod.async_get = async_get
    er_mod.async_entries_for_config_entry = _async_entries_for_config_entry
    sys.modules["homeassistant.helpers.entity_registry"] = er_mod


_ensure_entity_registry_module()

migration = importlib.import_module("hub_energie.migration")
stability = importlib.import_module("hub_energie.entity_id_stability")
DOMAIN = importlib.import_module("hub_energie.const").DOMAIN


class _ConfigEntries:
    def __init__(self) -> None:
        self.version_updates: list[int] = []

    def async_update_entry(self, entry: object, **kwargs: object) -> None:
        for key, value in kwargs.items():
            setattr(entry, key, value)
        if "version" in kwargs:
            self.version_updates.append(int(kwargs["version"]))  # type: ignore[arg-type]


def _hass_with_registry(registry: _InMemoryEntityRegistry) -> object:
    hass = ha_core.HomeAssistant()
    hass._entity_registry = registry  # type: ignore[attr-defined]
    hass.config_entries = _ConfigEntries()  # type: ignore[attr-defined]
    return hass


def _run_migrate(hass: object, entry: object) -> bool:
    return asyncio.run(migration.async_migrate_entry(hass, entry))


def test_migrate_v1_renames_legacy_hub_energie_entities() -> None:
    """v1 legacy object_ids get ``hub_energie_`` prefix; entry version becomes current."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.grid_power", DOMAIN, "ce_1")
    reg.register("binary_sensor.motion_flag", DOMAIN, "ce_1")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=1, entry_id="ce_1")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert hass.config_entries.version_updates == [  # type: ignore[attr-defined]
        migration.CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX,
        migration.CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3,
        migration.CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS,
        migration.CONFIG_ENTRY_VERSION,
    ]

    assert reg.async_get("sensor.grid_power") is None
    assert reg.async_get("sensor.hub_energie_grid_power") is not None
    assert reg.async_get("binary_sensor.motion_flag") is None
    assert reg.async_get("binary_sensor.hub_energie_motion_flag") is not None


def test_migrate_v1_skips_rename_when_target_entity_id_already_exists() -> None:
    """If ``hub_energie_<slug>`` is already taken, the legacy entity is left unchanged."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.clash", DOMAIN, "ce_2")
    reg.register("sensor.hub_energie_clash", DOMAIN, "ce_2")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=1, entry_id="ce_2")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert reg.async_get("sensor.clash") is not None
    assert reg.async_get("sensor.hub_energie_clash") is not None


def test_migrate_v2_unprefixed_frontend_entities_renamed_to_v3() -> None:
    """v2 entries get a second prefix pass (e.g. ``frontend_data`` added after v2 migration)."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.hub_energie_cost_detail", DOMAIN, "ce_3")
    reg.register("sensor.frontend_data", DOMAIN, "ce_3")
    reg.register("sensor.frontend_meta", DOMAIN, "ce_3")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=migration.CONFIG_ENTRY_VERSION_ENTITY_ID_PREFIX, entry_id="ce_3")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert hass.config_entries.version_updates == [  # type: ignore[attr-defined]
        migration.CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3,
        migration.CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS,
        migration.CONFIG_ENTRY_VERSION,
    ]
    assert reg.async_get("sensor.hub_energie_cost_detail") is not None
    assert reg.async_get("sensor.frontend_data") is None
    assert reg.async_get("sensor.hub_energie_frontend_data") is not None
    assert reg.async_get("sensor.frontend_meta") is None
    assert reg.async_get("sensor.hub_energie_frontend_meta") is not None


def test_migrate_entry_already_at_v5_is_noop() -> None:
    """Version already 5: no registry renames and no version update."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.hub_energie_legacy", DOMAIN, "ce_3b")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=migration.CONFIG_ENTRY_VERSION, entry_id="ce_3b")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert hass.config_entries.version_updates == []  # type: ignore[attr-defined]
    assert reg.async_get("sensor.hub_energie_legacy") is not None


def test_migrate_v3_to_v5_renames_entities_to_slug_of_unique_id() -> None:
    """v5 renames every entity to ``hub_energie_`` + slug(full unique_id)."""
    reg = _InMemoryEntityRegistry()
    uid_base = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    uid_solar = f"{uid_base}_savings_solar_eur"
    uid_batt = f"{uid_base}_savings_battery_eur"
    expected_solar = f"sensor.{stability.stable_object_id_from_unique_id(uid_solar)}"
    expected_batt = f"sensor.{stability.stable_object_id_from_unique_id(uid_batt)}"
    reg.register(
        "sensor.hub_energie_solaire_economies_solaire",
        DOMAIN,
        "ce_v4",
        unique_id=uid_solar,
    )
    reg.register(
        "sensor.hub_energie_toutes_batteries_economies_batterie",
        DOMAIN,
        "ce_v4",
        unique_id=uid_batt,
    )

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(
        version=migration.CONFIG_ENTRY_VERSION_ENTITY_PREFIX_V3,
        entry_id="ce_v4",
    )

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert hass.config_entries.version_updates == [  # type: ignore[attr-defined]
        migration.CONFIG_ENTRY_VERSION_CARD_SHORT_SLUGS,
        migration.CONFIG_ENTRY_VERSION,
    ]
    assert reg.async_get("sensor.hub_energie_solaire_economies_solaire") is None
    assert reg.async_get(expected_solar) is not None
    assert reg.async_get("sensor.hub_energie_toutes_batteries_economies_batterie") is None
    assert reg.async_get(expected_batt) is not None


def test_migrate_rejects_entry_newer_than_supported() -> None:
    """Config entry version above ours cannot be migrated."""
    reg = _InMemoryEntityRegistry()
    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=99, entry_id="ce_4")

    assert _run_migrate(hass, entry) is False
    assert entry.version == 99
    assert hass.config_entries.version_updates == []  # type: ignore[attr-defined]


def test_migrate_v1_only_touches_hub_energie_platform_entities() -> None:
    """Other platforms attached to the same config entry are not renamed."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.co2", "template", "ce_5")
    reg.register("sensor.native", DOMAIN, "ce_5")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=1, entry_id="ce_5")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert reg.async_get("sensor.co2") is not None
    assert reg.async_get("sensor.native") is None
    assert reg.async_get("sensor.hub_energie_native") is not None


def test_migrate_v1_leaves_already_prefixed_entity_ids_unchanged() -> None:
    """Legacy entries that already use ``hub_energie_*`` slugs are not double-prefixed."""
    reg = _InMemoryEntityRegistry()
    reg.register("sensor.hub_energie_day_rate", DOMAIN, "ce_6")

    hass = _hass_with_registry(reg)
    entry = SimpleNamespace(version=1, entry_id="ce_6")

    assert _run_migrate(hass, entry) is True
    assert entry.version == migration.CONFIG_ENTRY_VERSION
    assert reg.async_get("sensor.hub_energie_day_rate") is not None
    assert reg.async_get("sensor.hub_energie_hub_energie_day_rate") is None
