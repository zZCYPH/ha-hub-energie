"""Coordinator implementation package (lazy ``HubEnergieCoordinator`` export)."""

from __future__ import annotations

from importlib import import_module
from typing import TYPE_CHECKING

__all__ = ["HubEnergieCoordinator"]


def __getattr__(name: str):
    if name == "HubEnergieCoordinator":
        return import_module(f"{__name__}.hub").HubEnergieCoordinator
    msg = f"module {__name__!r} has no attribute {name!r}"
    raise AttributeError(msg)


if TYPE_CHECKING:
    from .hub import HubEnergieCoordinator
