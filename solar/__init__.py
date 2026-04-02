"""Solar domain public API."""

from .solar_estimation import SolarEstimate, compute_solar_estimation, optimal_tilt

__all__ = [
    "SolarEstimate",
    "compute_solar_estimation",
    "optimal_tilt",
]
