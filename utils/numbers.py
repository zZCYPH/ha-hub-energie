"""Numeric parsing helpers (pure)."""

from __future__ import annotations

import math
from typing import Any

__all__ = ("safe_float",)


def safe_float(value: Any) -> float | None:
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(out):
        return None
    return out
