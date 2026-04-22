"""Tests for hub_energie.coordinator_snapshot_build."""

from __future__ import annotations

import importlib
import logging
import sys
import types
from pathlib import Path
from types import SimpleNamespace
import pytest
from unittest.mock import MagicMock, patch

HUB_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "hub_energie"


def _ensure_pkg(name: str, path: Path) -> None:
    if name in sys.modules:
        return
    pkg = types.ModuleType(name)
    pkg.__path__ = [str(path)]  # type: ignore[attr-defined]
    sys.modules[name] = pkg


_ensure_pkg("hub_energie", HUB_DIR)

sb = importlib.import_module("hub_energie.coordinator.snapshot_build")


def test_run_coordinator_snapshot_build_updates_flow_ts_and_probe_flags() -> None:
    inputs = SimpleNamespace(day="2026-01-01", debug_enabled=False)
    result = SimpleNamespace(
        next_last_flow_warn_ts="ts",
        should_warn_flow_mismatch=False,
        raw_home_power_w=0.0,
        modeled_home_power_w=0.0,
        flow_gap_w=0.0,
        snapshot={"cost_total": 1.0, "export_power_w": 2.0, "debug_flow_gap_w": 0.0},
    )
    co = SimpleNamespace(
        _snapshot_pipeline=MagicMock(),
        _edf=SimpleNamespace(current_slot="bleu_hp"),
        _runtime_state=MagicMock(
            delta_telemetry={},
            delta_discards={},
            last_delta_rejection_by_source={},
            snapshot_data=lambda _d: {},
        ),
        _expected_source_keys=lambda: set(),
        hass=object(),
        entry=object(),
        _reader=object(),
        _trust_rebuilding_after_recorder=False,
        is_edf=True,
        tariff_offer="tempo",
        tempo_mode="api",
        tempo_rte_calendar_ready=True,
        _tariff_refresh_rejected_incomplete=False,
        _first_input_probe_logged=False,
        _last_input_probe_signature=None,
    )
    co._snapshot_pipeline.run.return_value = result

    out_snap = {"x": 1}
    with patch.object(sb, "build_snapshot_inputs", return_value=inputs):
        with patch.object(sb, "finalize_snapshot_after_pipeline", return_value=(out_snap, True, "sig")) as fin:
            snap, ts, first, sig = sb.run_coordinator_snapshot_build(
                co,
                logger=logging.getLogger("test"),
            )

    assert snap is out_snap
    assert ts == "ts"
    assert first is True
    assert sig == "sig"
    fin.assert_called_once()


def test_run_coordinator_snapshot_build_logs_flow_mismatch(caplog: pytest.LogCaptureFixture) -> None:
    inputs = SimpleNamespace(day="2026-01-01", debug_enabled=True)
    result = SimpleNamespace(
        next_last_flow_warn_ts=None,
        should_warn_flow_mismatch=True,
        raw_home_power_w=100.0,
        modeled_home_power_w=50.0,
        flow_gap_w=50.0,
        snapshot={"cost_total": 0.0, "export_power_w": 0.0, "debug_flow_gap_w": 0.0},
    )
    co = SimpleNamespace(
        _snapshot_pipeline=MagicMock(),
        _edf=SimpleNamespace(current_slot="x"),
        _runtime_state=MagicMock(
            delta_telemetry={},
            delta_discards={},
            last_delta_rejection_by_source={},
            snapshot_data=lambda _d: {},
        ),
        _expected_source_keys=lambda: set(),
        hass=object(),
        entry=object(),
        _reader=object(),
        _trust_rebuilding_after_recorder=False,
        is_edf=False,
        tariff_offer="base",
        tempo_mode="sensor",
        tempo_rte_calendar_ready=True,
        _tariff_refresh_rejected_incomplete=False,
        _first_input_probe_logged=False,
        _last_input_probe_signature=None,
    )
    co._snapshot_pipeline.run.return_value = result
    log = logging.getLogger("test_flow")
    with caplog.at_level(logging.WARNING, logger="test_flow"):
        with patch.object(sb, "build_snapshot_inputs", return_value=inputs):
            with patch.object(sb, "finalize_snapshot_after_pipeline", return_value=({}, False, None)):
                sb.run_coordinator_snapshot_build(co, logger=log)
    assert any("Flow model mismatch" in r.message for r in caplog.records)


def test_run_coordinator_snapshot_build_debug_log_when_enabled(caplog: pytest.LogCaptureFixture) -> None:
    inputs = SimpleNamespace(day="2026-02-01", debug_enabled=True)
    result = SimpleNamespace(
        next_last_flow_warn_ts=None,
        should_warn_flow_mismatch=False,
        raw_home_power_w=0.0,
        modeled_home_power_w=0.0,
        flow_gap_w=0.0,
        snapshot={"cost_total": 3.0, "export_power_w": 4.0, "debug_flow_gap_w": 0.1},
    )
    co = SimpleNamespace(
        _snapshot_pipeline=MagicMock(),
        _edf=SimpleNamespace(current_slot="bleu_hp"),
        _runtime_state=MagicMock(
            delta_telemetry={},
            delta_discards={},
            last_delta_rejection_by_source={},
            snapshot_data=lambda _d: {},
        ),
        _expected_source_keys=lambda: set(),
        hass=object(),
        entry=object(),
        _reader=object(),
        _trust_rebuilding_after_recorder=False,
        is_edf=True,
        tariff_offer="tempo",
        tempo_mode="api",
        tempo_rte_calendar_ready=True,
        _tariff_refresh_rejected_incomplete=False,
        _first_input_probe_logged=False,
        _last_input_probe_signature=None,
    )
    co._snapshot_pipeline.run.return_value = result
    log = logging.getLogger("test_dbg")
    with caplog.at_level(logging.DEBUG, logger="test_dbg"):
        with patch.object(sb, "build_snapshot_inputs", return_value=inputs):
            with patch.object(sb, "finalize_snapshot_after_pipeline", return_value=({}, False, None)):
                sb.run_coordinator_snapshot_build(co, logger=log)
    assert any("Snapshot debug" in r.message for r in caplog.records)
