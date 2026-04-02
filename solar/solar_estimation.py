"""Solar estimation model (pure)."""

from __future__ import annotations

import math
from calendar import isleap
from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo


_SHADING_FACTORS: dict[str, float] = {
    "none": 1.0,
    "light": 0.90,
    "medium": 0.75,
    "heavy": 0.55,
}
_PERF_FACTORS: dict[str, float] = {
    "high": 0.90,
    "standard": 0.85,
    "low": 0.78,
}


@dataclass(frozen=True)
class SolarEstimate:
    power_w: float | None
    daily_kwh: float | None
    yearly_kwh: float | None


def optimal_tilt(lat: float) -> float:
    return max(0.0, min(60.0, abs(lat) * 0.76 + 3.1))


def _solar_declination_deg(day_of_year: int) -> float:
    return 23.45 * math.sin(math.radians(360.0 / 365.0 * (day_of_year - 81)))


def _solar_position(lat: float, lon: float, now: datetime) -> tuple[float, float]:
    doy = now.timetuple().tm_yday
    dec = math.radians(_solar_declination_deg(doy))
    hour = now.hour + now.minute / 60.0 + now.second / 3600.0
    utc_offset = now.utcoffset()
    utc_h = utc_offset.total_seconds() / 3600.0 if utc_offset else 0.0
    hour_angle = math.radians(15.0 * (hour - 12.0 - lon / 15.0 + utc_h))
    lat_r = math.radians(lat)
    sin_alt = math.sin(lat_r) * math.sin(dec) + math.cos(lat_r) * math.cos(dec) * math.cos(hour_angle)
    alt = math.degrees(math.asin(max(-1.0, min(1.0, sin_alt))))
    if alt <= 0:
        return alt, 0.0
    cos_az = (math.sin(dec) - math.sin(lat_r) * sin_alt) / max(
        1e-9, math.cos(lat_r) * math.cos(math.radians(alt))
    )
    az = math.degrees(math.acos(max(-1.0, min(1.0, cos_az))))
    if math.sin(hour_angle) > 0:
        az = 360.0 - az
    return alt, az


def _estimate_power_w(
    lat: float,
    lon: float,
    peak_kwp: float,
    orientation_deg: float,
    tilt_deg: float,
    shading: str,
    performance: str,
    now: datetime,
) -> float:
    alt, az = _solar_position(lat, lon, now)
    if alt <= 1.0:
        return 0.0
    alt_r = math.radians(alt)
    air_mass = 1.0 / max(0.01, math.sin(alt_r))
    clearsky_ghi = 1000.0 * 0.7 ** (air_mass**0.678)
    tilt_r = math.radians(tilt_deg)
    cos_inc = (
        math.sin(alt_r) * math.cos(tilt_r)
        + math.cos(alt_r)
        * math.sin(tilt_r)
        * math.cos(math.radians(az) - math.radians(orientation_deg))
    )
    if cos_inc <= 0:
        return 0.0
    poa = min(1200.0, clearsky_ghi * cos_inc / max(0.01, math.sin(alt_r)))
    sf = _SHADING_FACTORS.get(shading, 1.0)
    pf = _PERF_FACTORS.get(performance, 0.85)
    return max(0.0, peak_kwp * 1000.0 * (poa / 1000.0) * sf * pf)


def _estimate_daily_kwh(
    lat: float,
    lon: float,
    peak_kwp: float,
    orientation_deg: float,
    tilt_deg: float,
    shading: str,
    performance: str,
    day: datetime,
) -> float:
    base = day.replace(hour=0, minute=0, second=0, microsecond=0)
    total_wh = 0.0
    for half in range(48):
        t = base + timedelta(minutes=30 * half)
        total_wh += _estimate_power_w(
            lat,
            lon,
            peak_kwp,
            orientation_deg,
            tilt_deg,
            shading,
            performance,
            t,
        ) * 0.5
    return total_wh / 1000.0


def _estimate_yearly_kwh(
    lat: float,
    lon: float,
    peak_kwp: float,
    orientation_deg: float,
    tilt_deg: float,
    shading: str,
    performance: str,
    ref_year: int,
    tz: ZoneInfo,
) -> float:
    total = 0.0
    for month in range(1, 13):
        sample = datetime(ref_year, month, 15, tzinfo=tz)
        daily = _estimate_daily_kwh(
            lat,
            lon,
            peak_kwp,
            orientation_deg,
            tilt_deg,
            shading,
            performance,
            sample,
        )
        dim = 30 if month in (4, 6, 9, 11) else (31 if month != 2 else (29 if isleap(ref_year) else 28))
        total += daily * dim
    return total


def compute_solar_estimation(
    *,
    lat: float | None,
    lon: float | None,
    peak_kwp: float | None,
    orientation_deg: float,
    tilt_deg: float,
    tilt_auto: bool,
    shading: str,
    performance: str,
    now_paris: datetime,
    paris_tz: ZoneInfo,
) -> SolarEstimate:
    if lat is None or lon is None or not peak_kwp:
        return SolarEstimate(None, None, None)
    tilt = optimal_tilt(lat) if tilt_auto else tilt_deg
    power_w = _estimate_power_w(
        lat, lon, peak_kwp, orientation_deg, tilt, shading, performance, now_paris
    )
    daily_kwh = _estimate_daily_kwh(
        lat, lon, peak_kwp, orientation_deg, tilt, shading, performance, now_paris
    )
    yearly_kwh = _estimate_yearly_kwh(
        lat,
        lon,
        peak_kwp,
        orientation_deg,
        tilt,
        shading,
        performance,
        now_paris.year,
        paris_tz,
    )
    return SolarEstimate(
        power_w=round(power_w, 1),
        daily_kwh=round(daily_kwh, 2),
        yearly_kwh=round(yearly_kwh, 1),
    )
