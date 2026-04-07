"""Solar PV estimation model for the hub_energie integration.

Estimates photovoltaic production from panel configuration and solar geometry.
Uses only Python standard library — no external dependencies.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Orientation / azimuth presets (degrees, north = 0, clockwise)
# ---------------------------------------------------------------------------

AZIMUTH_PRESETS: dict[str, float] = {
    "N": 0.0,
    "NE": 45.0,
    "E": 90.0,
    "SE": 135.0,
    "S": 180.0,
    "SW": 225.0,
    "W": 270.0,
    "NW": 315.0,
}

# ---------------------------------------------------------------------------
# Shading presets → loss factor (0 = no loss, 1 = total loss)
# ---------------------------------------------------------------------------

SHADING_PRESETS: dict[str, float] = {
    "none": 0.00,
    "light": 0.05,
    "medium": 0.15,
    "heavy": 0.30,
}

# ---------------------------------------------------------------------------
# Performance-ratio presets
# ---------------------------------------------------------------------------

PERFORMANCE_PRESETS: dict[str, float] = {
    "high": 0.85,
    "standard": 0.75,
    "low": 0.65,
}

# ---------------------------------------------------------------------------
# Physical constants
# ---------------------------------------------------------------------------

_SOLAR_CONSTANT = 1361.0  # W/m² (extraterrestrial irradiance)
_DEFAULT_ALBEDO = 0.2
_DEFAULT_DEGRADATION_RATE = 0.005  # 0.5 %/year
_DEFAULT_ATMOSPHERIC_TRANSMITTANCE = 0.7


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def azimuth_from_orientation(orientation: str) -> float:
    """Return azimuth in degrees for a compass direction string."""
    key = orientation.strip().upper()
    if key not in AZIMUTH_PRESETS:
        raise ValueError(
            f"Unknown orientation '{orientation}'. "
            f"Choose from {', '.join(AZIMUTH_PRESETS)}"
        )
    return AZIMUTH_PRESETS[key]


def shading_factor_from_preset(preset: str) -> float:
    """Return the shading loss factor (0–1) for a named preset."""
    key = preset.strip().lower()
    if key not in SHADING_PRESETS:
        raise ValueError(
            f"Unknown shading preset '{preset}'. "
            f"Choose from {', '.join(SHADING_PRESETS)}"
        )
    return SHADING_PRESETS[key]


def performance_ratio_from_preset(preset: str) -> float:
    """Return the performance ratio (0–1) for a named preset."""
    key = preset.strip().lower()
    if key not in PERFORMANCE_PRESETS:
        raise ValueError(
            f"Unknown performance preset '{preset}'. "
            f"Choose from {', '.join(PERFORMANCE_PRESETS)}"
        )
    return PERFORMANCE_PRESETS[key]


def optimal_tilt(latitude: float) -> float:
    """Estimate the optimal fixed-tilt angle from latitude.

    Simple empirical formula: tilt ≈ |latitude| × 0.76 + 3.1
    """
    return abs(latitude) * 0.76 + 3.1


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class SolarArray:
    """A single PV array (group of panels sharing orientation)."""

    peak_power_kwc: float
    tilt_deg: float
    azimuth_deg: float
    shading_factor: float = 0.0
    name: str = ""


@dataclass
class SolarSystem:
    """Complete PV installation, possibly with several arrays."""

    arrays: list[SolarArray] = field(default_factory=list)
    latitude: float = 0.0
    longitude: float = 0.0
    performance_ratio: float = 0.75
    commissioning_year: int | None = None
    degradation_rate: float = _DEFAULT_DEGRADATION_RATE


# ---------------------------------------------------------------------------
# Solar position (simplified astronomical formulas)
# ---------------------------------------------------------------------------


def _day_of_year(dt: datetime) -> int:
    return dt.timetuple().tm_yday


def _decimal_hour_utc(dt: datetime) -> float:
    utc = dt.astimezone(timezone.utc)
    return utc.hour + utc.minute / 60.0 + utc.second / 3600.0


def _solar_declination(day_of_year: int) -> float:
    """Solar declination in radians (Spencer, 1971 approximation)."""
    b = math.radians(360.0 / 365.0 * (day_of_year - 81))
    return math.radians(23.45) * math.sin(b)


def _equation_of_time(day_of_year: int) -> float:
    """Equation of time in *minutes* (Spencer approximation)."""
    b = math.radians(360.0 / 365.0 * (day_of_year - 81))
    return 9.87 * math.sin(2 * b) - 7.53 * math.cos(b) - 1.5 * math.sin(b)


def _hour_angle(decimal_hour_utc: float, longitude: float, eot_minutes: float) -> float:
    """Hour angle in radians.  Noon → 0, morning → negative."""
    solar_time = decimal_hour_utc + longitude / 15.0 + eot_minutes / 60.0
    return math.radians(15.0 * (solar_time - 12.0))


@dataclass
class _SolarPosition:
    elevation_rad: float
    azimuth_rad: float


def _solar_position(dt: datetime, lat: float, lon: float) -> _SolarPosition:
    """Compute solar elevation and azimuth for a given instant and location."""
    doy = _day_of_year(dt)
    dec = _solar_declination(doy)
    eot = _equation_of_time(doy)
    ha = _hour_angle(_decimal_hour_utc(dt), lon, eot)

    lat_r = math.radians(lat)

    sin_elev = (
        math.sin(lat_r) * math.sin(dec)
        + math.cos(lat_r) * math.cos(dec) * math.cos(ha)
    )
    elevation = math.asin(max(-1.0, min(1.0, sin_elev)))

    cos_az_num = math.sin(dec) - math.sin(lat_r) * math.sin(elevation)
    cos_az_den = math.cos(lat_r) * math.cos(elevation)

    if abs(cos_az_den) < 1e-10:
        azimuth = 0.0
    else:
        cos_az = max(-1.0, min(1.0, cos_az_num / cos_az_den))
        azimuth = math.acos(cos_az)
        if ha > 0:
            azimuth = 2 * math.pi - azimuth

    return _SolarPosition(elevation_rad=elevation, azimuth_rad=azimuth)


# ---------------------------------------------------------------------------
# Irradiance models
# ---------------------------------------------------------------------------


def _clear_sky_ghi(elevation_rad: float) -> float:
    """Simplified clear-sky GHI (W/m²).

    GHI = S × sin(elevation) × τ^(1/sin(elevation))
    where S = solar constant, τ = atmospheric transmittance.
    Returns 0 when the sun is below the horizon.
    """
    sin_elev = math.sin(elevation_rad)
    if sin_elev <= 0.01:
        return 0.0
    air_mass = 1.0 / sin_elev
    ghi = _SOLAR_CONSTANT * sin_elev * (_DEFAULT_ATMOSPHERIC_TRANSMITTANCE ** air_mass)
    return max(0.0, ghi)


def _split_ghi(ghi: float, elevation_rad: float) -> tuple[float, float]:
    """Approximate DNI and DHI from GHI using the Erbs diffuse-fraction model.

    Returns (DNI, DHI).
    """
    sin_elev = math.sin(elevation_rad)
    if sin_elev <= 0.01 or ghi <= 0.0:
        return 0.0, 0.0

    extra = _SOLAR_CONSTANT * sin_elev
    kt = min(ghi / extra, 1.0) if extra > 0 else 0.0

    if kt <= 0.22:
        kd = 1.0 - 0.09 * kt
    elif kt <= 0.80:
        kd = 0.9511 - 0.1604 * kt + 4.388 * kt**2 - 16.638 * kt**3 + 12.336 * kt**4
    else:
        kd = 0.165

    dhi = kd * ghi
    dni = (ghi - dhi) / sin_elev if sin_elev > 0.01 else 0.0
    return max(0.0, dni), max(0.0, dhi)


def _incidence_angle(
    elevation_rad: float,
    solar_azimuth_rad: float,
    tilt_rad: float,
    panel_azimuth_rad: float,
) -> float:
    """Angle of incidence on a tilted surface (radians)."""
    cos_inc = (
        math.sin(elevation_rad) * math.cos(tilt_rad)
        + math.cos(elevation_rad)
        * math.sin(tilt_rad)
        * math.cos(solar_azimuth_rad - panel_azimuth_rad)
    )
    return math.acos(max(-1.0, min(1.0, cos_inc)))


def _poa_irradiance(
    ghi: float,
    dni: float,
    dhi: float,
    elevation_rad: float,
    solar_azimuth_rad: float,
    tilt_rad: float,
    panel_azimuth_rad: float,
    albedo: float = _DEFAULT_ALBEDO,
) -> float:
    """Plane-of-array irradiance (W/m²) using the isotropic sky model."""
    inc = _incidence_angle(elevation_rad, solar_azimuth_rad, tilt_rad, panel_azimuth_rad)

    beam = max(0.0, dni * math.cos(inc))
    diffuse = dhi * (1.0 + math.cos(tilt_rad)) / 2.0
    reflected = ghi * albedo * (1.0 - math.cos(tilt_rad)) / 2.0

    return beam + diffuse + reflected


# ---------------------------------------------------------------------------
# Aging model
# ---------------------------------------------------------------------------


def _aging_factor(commissioning_year: int | None, degradation_rate: float, ref_year: int) -> float:
    if commissioning_year is None:
        return 1.0
    years = ref_year - commissioning_year
    if years < 0:
        return 1.0
    return max(0.0, 1.0 - degradation_rate * years)


# ---------------------------------------------------------------------------
# Single-array instantaneous power
# ---------------------------------------------------------------------------


def _array_power_w(
    array: SolarArray,
    pos: _SolarPosition,
    ghi: float,
    dni: float,
    dhi: float,
    performance_ratio: float,
    aging: float,
) -> float:
    if pos.elevation_rad <= 0:
        return 0.0

    tilt_rad = math.radians(array.tilt_deg)
    panel_az_rad = math.radians(array.azimuth_deg)

    poa = _poa_irradiance(
        ghi, dni, dhi, pos.elevation_rad, pos.azimuth_rad, tilt_rad, panel_az_rad
    )

    power_w = (
        array.peak_power_kwc
        * 1000.0
        * (poa / 1000.0)
        * performance_ratio
        * aging
        * (1.0 - array.shading_factor)
    )
    return max(0.0, power_w)


# ---------------------------------------------------------------------------
# Public estimation API
# ---------------------------------------------------------------------------


def estimate_power_now(system: SolarSystem, now: datetime) -> float:
    """Estimated instantaneous AC power output in **watts**.

    Uses the clear-sky irradiance model — actual cloud cover is not modelled.
    """
    if not system.arrays:
        return 0.0

    pos = _solar_position(now, system.latitude, system.longitude)
    if pos.elevation_rad <= 0:
        return 0.0

    ghi = _clear_sky_ghi(pos.elevation_rad)
    dni, dhi = _split_ghi(ghi, pos.elevation_rad)
    aging = _aging_factor(system.commissioning_year, system.degradation_rate, now.year)

    total = 0.0
    for arr in system.arrays:
        total += _array_power_w(arr, pos, ghi, dni, dhi, system.performance_ratio, aging)
    return total


def estimate_daily_energy(system: SolarSystem, day: date) -> float:
    """Estimated daily energy production in **kWh** (clear-sky)."""
    if not system.arrays:
        return 0.0

    step_minutes = 10
    total_wh = 0.0
    dt = datetime(day.year, day.month, day.day, 0, 0, tzinfo=timezone.utc)
    end = dt + timedelta(days=1)

    while dt < end:
        power_w = estimate_power_now(system, dt)
        total_wh += power_w * (step_minutes / 60.0)
        dt += timedelta(minutes=step_minutes)

    return total_wh / 1000.0


def estimate_yearly_energy(system: SolarSystem, year: int) -> float:
    """Estimated annual energy production in **kWh** (clear-sky).

    Samples one day per week (52 samples) and scales to 365 days for speed.
    """
    if not system.arrays:
        return 0.0

    sample_day = date(year, 1, 1)
    end_day = date(year, 12, 31)
    step = timedelta(days=7)

    total_kwh = 0.0
    samples = 0
    while sample_day <= end_day:
        total_kwh += estimate_daily_energy(system, sample_day)
        samples += 1
        sample_day += step

    if samples == 0:
        return 0.0
    return total_kwh / samples * 365.0
