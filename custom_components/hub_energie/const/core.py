"""Core integration identifiers and documentation helpers."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "hub_energie"
LOGIC_VERSION: Final = "1"
INTEGRATION_TITLE: Final = "Hub Énergie"

DOCUMENTATION_SITE_URL: Final = "https://hub-energie.ts-devops.com"


def documentation_config_step_help_url(step_id: str) -> str:
    """Public doc vitrine URL for the initial setup wizard step (matches the site help anchors)."""
    return f"{DOCUMENTATION_SITE_URL}/doc/setup-help#{step_id}"


def documentation_options_step_help_url(step_id: str) -> str:
    """Public doc vitrine URL for Settings → Hub Énergie → Configure steps (``options-`` avoids id clashes with the wizard)."""
    return f"{DOCUMENTATION_SITE_URL}/doc/setup-help#options-{step_id}"


def scoped_device_name(short_label: str) -> str:
    """DeviceInfo `name` prefix so HA slugifies entity_ids as hub_energie_<scope>_<sensor>."""
    label = (short_label or "").strip()
    if not label:
        return INTEGRATION_TITLE
    return f"{INTEGRATION_TITLE} {label}"


# ---------------------------------------------------------------------------
# Device identifiers (one device per scope)
# ---------------------------------------------------------------------------
DEVICE_OFFER: Final = "offer"
DEVICE_GRID_CONFIG: Final = "grid_config"
DEVICE_SOLAR_CONFIG: Final = "solar_config"
DEVICE_ENERGY_BALANCE: Final = "energy_balance"
DEVICE_COST: Final = "cost"
DEVICE_DIAGNOSTICS: Final = "diagnostics"
DEVICE_BATTERY_SUMMARY: Final = "battery_summary"
