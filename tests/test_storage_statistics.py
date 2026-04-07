"""Pure statistic_id helpers (recorder / LTS naming)."""

from __future__ import annotations

import importlib
import sys
import types
from pathlib import Path

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)
_ensure_pkg("hub_energie.storage", HUB_DIR / "storage")

stats_mod = importlib.import_module("hub_energie.storage.statistics")


def test_source_stat_suffix_normalizes_key() -> None:
    assert stats_mod.source_stat_suffix("Grid:Import") == "grid_import"
    assert stats_mod.source_stat_suffix("solar") == "solar"


def test_statistic_id_format() -> None:
    sid = stats_mod.statistic_id("hub_energie", "grid", "bleu_hp")
    assert sid == "hub_energie:slot_grid_bleu_hp_kwh"
