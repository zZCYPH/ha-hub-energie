"""Numeric parsing helpers (pure)."""

from __future__ import annotations

import math
from typing import Any

__all__ = ("normalize_user_number_string", "safe_float")


def normalize_user_number_string(raw: str) -> str:
    """Strip UI noise and treat ``,`` as decimal separator when no ``.`` is present (e.g. French ``2,76``)."""
    s = raw.strip().replace("\u00a0", "").replace(" ", "")
    if not s:
        return s
    if "," in s and "." not in s:
        return s.replace(",", ".")
    return s


def safe_float(value: Any) -> float | None:
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(out):
        return None
    return out
