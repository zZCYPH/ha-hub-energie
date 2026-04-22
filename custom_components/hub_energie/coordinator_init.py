"""HubEnergieCoordinator construction wiring (keeps coordinator.py readable)."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const.core import DOMAIN
from .const.energy_data import ENERGY_ROUND_DECIMALS
from .const.reinjection import DIAG_CAUSE_UNATTRIBUTED
from .const.tariff_edf import ATTRIBUTION_SLOTS
from .coordinator_policy import DIAG_CAUSES, delta_policy_from_entry
from .coordinator_tariff_wiring import (
    tariff_refresh_enabled as entry_tariff_refresh_enabled,
    tariff_refresh_hours as entry_tariff_refresh_hours,
)
from .coordinator_types import SAVE_DEBOUNCE_S, STORE_MODEL_VERSION
from .diagnostics.reinjection_state import ReinjectionState
from .ha.reader import HAReader
from .runtime.persistence import PersistenceManager
from .runtime.state import RuntimeState
from .scheduler import Scheduler
from .snapshot.coordinator_bridge import build_pipeline_deps
from .snapshot.pipeline import SnapshotPipeline
from .storage.statistics import statistic_id as statistic_id_for_domain
from .storage.store_manager import StoreManager
from .tariff import EdfRuntimeFields
from .tariff_manager import TariffResolver
from .utils.energy import normalize_kwh
from .utils.numbers import safe_float

if TYPE_CHECKING:
    from .coordinator import HubEnergieCoordinator


def wire_hub_energie_coordinator_after_super(
    co: HubEnergieCoordinator,
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    logger: logging.Logger,
) -> None:
    """Populate coordinator fields after ``DataUpdateCoordinator.__init__``."""
    co.data = {}  # type: ignore[assignment]
    co._state_lock = asyncio.Lock()
    co._store_manager = StoreManager(
        model_version=STORE_MODEL_VERSION,
        slots=ATTRIBUTION_SLOTS,
        decimals=ENERGY_ROUND_DECIMALS,
    )
    co._reader = HAReader(hass, entry, normalize_kwh=normalize_kwh)

    co._edf = EdfRuntimeFields()
    co._energy_attrib_date = None
    co._last_flow_warn_ts = None

    co._reinjection_state = ReinjectionState(
        slots=ATTRIBUTION_SLOTS,
        diag_causes=DIAG_CAUSES,
        default_cause=DIAG_CAUSE_UNATTRIBUTED,
    )
    co._runtime_state = RuntimeState(
        slots=ATTRIBUTION_SLOTS,
        reinjection_state=co._reinjection_state,
    )
    co._delta_policy = delta_policy_from_entry(entry)
    co._trust_rebuilding_after_recorder = False
    co._tariff_refresh_rejected_incomplete = False
    co._first_input_probe_logged = False
    co._last_input_probe_signature = None

    co._persistence = PersistenceManager(
        hass=co.hass,
        entry=co.entry,
        domain=DOMAIN,
        slots=ATTRIBUTION_SLOTS,
        state_lock=co._state_lock,
        runtime_state=co._runtime_state,
        store_manager=co._store_manager,
        save_debounce_s=SAVE_DEBOUNCE_S,
        logger=logger,
        store_model_version=STORE_MODEL_VERSION,
        source_map=co.source_map,
        expected_source_keys=co._expected_source_keys,
        read_energy_kwh=co._read_energy_kwh_for_persistence,
        normalize_kwh=normalize_kwh,
        safe_float=safe_float,
        statistic_id=lambda sk, sl: statistic_id_for_domain(DOMAIN, sk, sl),
    )
    co._snapshot_pipeline = SnapshotPipeline(ATTRIBUTION_SLOTS, build_pipeline_deps(co))

    co._tariff = None
    co._scheduler = Scheduler(
        hass=co.hass,
        entry=co.entry,
        next_poll_fire_local=co._next_poll_fire_local,
        on_scheduled_poll=co._async_scheduled_poll,
        on_midnight=co._async_midnight_maintenance,
        on_tariff_refresh=lambda: co._async_refresh_tariffs(update_entry=True),
        tariff_refresh_enabled=lambda: co.is_edf
        and entry_tariff_refresh_enabled(dict(co.entry.options)),
        tariff_refresh_hours=lambda: entry_tariff_refresh_hours(dict(co.entry.options)),
    )
