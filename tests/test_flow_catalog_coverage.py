"""Ensure the vitrine flow catalog covers every setup ``async_step_*`` plus whitelisted options steps.

Run (repository root)::

    python -m pytest tests/test_flow_catalog_coverage.py -v --no-cov

With only ``pytest`` installed (no ``pytest-cov``), clear the repo addopts instead::

    python -m pytest tests/test_flow_catalog_coverage.py -v --override-ini addopts=

``--no-cov`` avoids failing the repo-wide coverage gate when ``pytest-cov`` is installed: these tests do not import integration code.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parent.parent
CATALOG_PATH = REPO / "site/src/data/flowCatalog.generated.json"
EXTRACT_SCRIPT = REPO / "scripts/extract_config_flow_catalog.py"


@pytest.fixture(scope="module")
def extract_mod():
    spec = importlib.util.spec_from_file_location("extract_config_flow_catalog", EXTRACT_SCRIPT)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


@pytest.fixture(scope="module")
def committed_catalog() -> dict:
    if not CATALOG_PATH.is_file():
        pytest.skip(f"Missing {CATALOG_PATH} — run: python scripts/extract_config_flow_catalog.py")
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def test_setup_async_step_handlers_all_in_catalog(extract_mod, committed_catalog):
    expected = {h for _, h in extract_mod.iter_setup_flow_handlers()}
    expected |= extract_mod.iter_options_catalog_handlers()
    actual = {s["handler"] for s in committed_catalog["steps"]}
    missing = expected - actual
    extra = actual - expected
    assert not missing and not extra, (
        f"Handler set mismatch.\nMissing in catalog: {sorted(missing)}\n"
        f"Extra in catalog: {sorted(extra)}\n"
        f"Run: python scripts/extract_config_flow_catalog.py"
    )


def test_catalog_step_rows_unique_step_ids(committed_catalog):
    from collections import Counter

    allowed_dup = frozenset({"solar", "solar_config", "solar_estimation"})
    ids = [s["step_id"] for s in committed_catalog["steps"]]
    counts = Counter(ids)
    bad = sorted(sid for sid, n in counts.items() if n > 1 and sid not in allowed_dup)
    assert not bad, f"Unexpected duplicate step_id in catalog: {bad}"
    for sid in allowed_dup:
        rows = [s for s in committed_catalog["steps"] if s["step_id"] == sid]
        if len(rows) <= 1:
            continue
        classes = {r.get("source_class") for r in rows}
        assert classes == {"HubEnergieConfigFlow", "HubEnergieOptionsFlow"}, (
            f"Expected setup+options rows for {sid!r}, got {rows!r}"
        )


def test_committed_catalog_matches_fresh_build_stable_blob(extract_mod, committed_catalog):
    """Same assertion as ``extract_config_flow_catalog.py --check`` (stable JSON, no generated_at)."""
    fresh = extract_mod.build_doc()
    assert extract_mod._stable_json_blob(committed_catalog) == extract_mod._stable_json_blob(fresh)
