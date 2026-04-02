"""Backward-compatible import path for runtime state."""

from __future__ import annotations

from .runtime.state import DeltaApplyResult, RuntimeState

__all__ = ("DeltaApplyResult", "RuntimeState")
