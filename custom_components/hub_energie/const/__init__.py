"""Integration package marker; import symbols from ``const.*`` submodules directly."""

from __future__ import annotations

# Stable entry point for ``hub_energie.const`` (manifest, ``__init__``, migrations).
from .core import DOMAIN

__all__ = ("DOMAIN",)
