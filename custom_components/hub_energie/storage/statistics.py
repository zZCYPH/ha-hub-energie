"""Recorder / external statistic ID helpers (pure)."""

from __future__ import annotations

import re

__all__ = ("source_stat_suffix", "statistic_id")


def source_stat_suffix(source_key: str) -> str:
    return re.sub(r"[^a-z0-9_]+", "_", source_key.lower().replace(":", "_"))


def statistic_id(domain: str, source_key: str, slot: str) -> str:
    return f"{domain}:slot_{source_stat_suffix(source_key)}_{slot}_kwh"
