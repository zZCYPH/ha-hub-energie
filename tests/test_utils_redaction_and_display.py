"""Tests for ``utils.redaction`` and ``utils.config_display``."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path
from types import SimpleNamespace

HUB_DIR = Path(__file__).resolve().parents[1]


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.utils", HUB_DIR / "utils")

redaction = importlib.import_module("hub_energie.utils.redaction")
const = importlib.import_module("hub_energie.const")
config_display = importlib.import_module("hub_energie.utils.config_display")


def test_redact_sensitive_mapping() -> None:
    out = redaction.redact_sensitive_mapping(
        {"rte_client_secret": "x", "rte_client_id": "visible", "password_hint": "y"}
    )
    assert out["rte_client_secret"] == "***"
    assert out["password_hint"] == "***"
    assert out["rte_client_id"] == "visible"


def test_redact_entry_data_for_display_masks_rte_fields() -> None:
    data = {
        const.CONF_RTE_CLIENT_SECRET: "top-secret-value",
        const.CONF_RTE_CLIENT_ID: "abcdefghijklmnop",
    }
    out = config_display.redact_entry_data_for_display(data)
    assert out[const.CONF_RTE_CLIENT_SECRET] == "(stored)"
    assert "top-secret" not in str(out[const.CONF_RTE_CLIENT_ID])
    assert out[const.CONF_RTE_CLIENT_ID].endswith("mnop")


def test_config_overview_attributes_excludes_raw_secret() -> None:
    entry = SimpleNamespace(
        data={
            const.CONF_SUPPLIER: const.SUPPLIER_EDF,
            const.CONF_RTE_CLIENT_SECRET: "secret123",
            const.CONF_RTE_CLIENT_ID: "myclientid",
            const.CONF_TARIFF_OFFER: const.TARIFF_OFFER_TEMPO,
            const.CONF_TEMPO_MODE: const.TEMPO_MODE_API,
            const.CONF_HAS_SOLAR: False,
            const.CONF_HAS_BATTERIES: False,
        },
        options={},
    )
    attrs = config_display.config_overview_attributes(entry)  # type: ignore[arg-type]
    assert "data" not in attrs
    assert "options" not in attrs
    assert attrs["supplier"] == const.SUPPLIER_EDF
    assert attrs["offer"] == const.TARIFF_OFFER_TEMPO
    assert "secret123" not in str(attrs)
