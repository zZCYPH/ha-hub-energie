"""Redact sensitive keys in mappings (logging, debug, previews)."""

from __future__ import annotations

from typing import Any, Mapping

__all__ = ("redact_sensitive_mapping",)


def redact_sensitive_mapping(values: Mapping[str, Any]) -> dict[str, Any]:
    """Mask values for keys whose name suggests a secret (flow / validation logging)."""
    return {
        str(key): (
            "***"
            if any(token in str(key).lower() for token in ("secret", "password", "token"))
            else value
        )
        for key, value in values.items()
    }
