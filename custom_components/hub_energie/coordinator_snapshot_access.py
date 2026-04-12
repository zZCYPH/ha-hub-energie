"""Read typed values from coordinator snapshot payloads (pure helpers)."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any


def snapshot_get_value(data: Mapping[str, Any] | None, key: str) -> Any | None:
    if not data:
        return None
    return data.get(key)


def snapshot_finite_number(value: Any) -> float | None:
    if value is None or not isinstance(value, (int, float)):
        return None
    numeric = float(value)
    return numeric if math.isfinite(numeric) else None


def snapshot_get_numeric_value(data: Mapping[str, Any] | None, key: str) -> float | None:
    return snapshot_finite_number(snapshot_get_value(data, key))


def snapshot_get_mapping_value(data: Mapping[str, Any] | None, key: str) -> dict[str, Any] | None:
    value = snapshot_get_value(data, key)
    return value if isinstance(value, dict) else None


def snapshot_get_nested_numeric_value(
    data: Mapping[str, Any] | None,
    section_key: str,
    key: str,
) -> float | None:
    section = snapshot_get_mapping_value(data, section_key)
    if not section:
        return None
    return snapshot_finite_number(section.get(key))


def snapshot_get_str(data: Mapping[str, Any] | None, key: str) -> str | None:
    value = snapshot_get_value(data, key)
    return str(value) if value is not None else None


def snapshot_get_list(data: Mapping[str, Any] | None, key: str) -> list[Any]:
    value = snapshot_get_value(data, key)
    return value if isinstance(value, list) else []
