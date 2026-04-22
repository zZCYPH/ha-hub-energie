"""Shim: wiring lives in ``hub_energie.coordinator.hub``."""

from __future__ import annotations

from .coordinator.hub import wire_hub_energie_coordinator_after_super

__all__ = ["wire_hub_energie_coordinator_after_super"]
