"""Config entry / bridge display title (supplier or site slug)."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .const.tariff_edf import CONF_SITE_SLUG, CONF_SUPPLIER, CONF_SUPPLIER_CUSTOM_NAME
from .site_slug import normalize_site_slug


def hub_energie_bridge_title(data: Mapping[str, Any]) -> str:
    """``Hub Energie - <site_slug>`` when slug set at install, else ``Hub Energie - <SUPPLIER>``."""
    slug = normalize_site_slug(data.get(CONF_SITE_SLUG))
    if slug:
        return f"Hub Energie - {slug}"
    supplier_label = str(data.get(CONF_SUPPLIER_CUSTOM_NAME) or "").strip() or str(
        data.get(CONF_SUPPLIER, "") or "",
    ).upper()
    return f"Hub Energie - {supplier_label}" if supplier_label else "Hub Energie"
