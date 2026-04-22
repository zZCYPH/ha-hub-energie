"""Coordinator scheduling manager."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_time_change,
)
from homeassistant.util import dt as dt_util

from .time.paris_time import LocalTime  # HA default time zone


class Scheduler:
    """Owns poll/midnight/tariff schedule lifecycle."""

    def __init__(
        self,
        *,
        hass: HomeAssistant,
        entry: ConfigEntry,
        next_poll_fire_local: Callable[[datetime], datetime],
        on_scheduled_poll: Callable[[], Awaitable[None]],
        on_midnight: Callable[[], Awaitable[None]],
        on_tariff_refresh: Callable[[], Awaitable[None]],
        tariff_refresh_enabled: Callable[[], bool],
        tariff_refresh_hours: Callable[[], int],
    ) -> None:
        self._hass = hass
        self._entry = entry
        self._next_poll_fire_local = next_poll_fire_local
        self._on_scheduled_poll = on_scheduled_poll
        self._on_midnight = on_midnight
        self._on_tariff_refresh = on_tariff_refresh
        self._tariff_refresh_enabled = tariff_refresh_enabled
        self._tariff_refresh_hours = tariff_refresh_hours
        self._unsub_midnight: CALLBACK_TYPE | None = None
        self._unsub_tariff_refresh: CALLBACK_TYPE | None = None
        self._unsub_poll_schedule: CALLBACK_TYPE | None = None

    def start(self) -> None:
        self.schedule_midnight()
        self.schedule_tariff_refresh()
        self.schedule_poll()
        self._entry.async_on_unload(self.stop)

    def stop(self) -> None:
        self.cancel_poll()
        if self._unsub_tariff_refresh is not None:
            self._unsub_tariff_refresh()
            self._unsub_tariff_refresh = None
        if self._unsub_midnight is not None:
            self._unsub_midnight()
            self._unsub_midnight = None

    def schedule_midnight(self) -> None:
        if self._unsub_midnight is not None:
            self._unsub_midnight()
            self._unsub_midnight = None

        @callback
        def _midnight_local(_dt: datetime | None = None) -> None:
            self._hass.async_create_task(self._on_midnight())

        self._unsub_midnight = async_track_time_change(
            self._hass,
            _midnight_local,
            hour=0,
            minute=0,
            second=3,
        )

    def schedule_tariff_refresh(self) -> None:
        if self._unsub_tariff_refresh is not None:
            self._unsub_tariff_refresh()
            self._unsub_tariff_refresh = None
        if not self._tariff_refresh_enabled():
            return
        from homeassistant.helpers.event import async_track_time_interval

        self._unsub_tariff_refresh = async_track_time_interval(
            self._hass,
            lambda _dt: self._hass.async_create_task(self._on_tariff_refresh()),
            timedelta(hours=self._tariff_refresh_hours()),
        )

    def cancel_poll(self) -> None:
        if self._unsub_poll_schedule is not None:
            self._unsub_poll_schedule()
            self._unsub_poll_schedule = None

    @callback
    def _on_poll_fire(self, _now: datetime) -> None:
        self._hass.async_create_task(self._async_run_poll())

    async def _async_run_poll(self) -> None:
        await self._on_scheduled_poll()
        self.schedule_poll()

    def schedule_poll(self) -> None:
        self.cancel_poll()
        now_local = LocalTime.now()
        next_local = self._next_poll_fire_local(now_local)
        next_utc = next_local.astimezone(dt_util.UTC)
        self._unsub_poll_schedule = async_track_point_in_time(
            self._hass,
            self._on_poll_fire,
            next_utc,
        )
