"""Backward-compatible import path for persistence."""

from __future__ import annotations

from .runtime.persistence import PersistenceManager

__all__ = ("PersistenceManager",)
