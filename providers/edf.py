"""EDF provider – tariff fetcher, RTE calendar, api-couleur-tempo, slot engine.

Consolidates logic from the standalone edf_energy_tariffs integration into a
single provider module for hub_energie.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from aiohttp import ClientSession

from ..const import (
    API_CALENDAR_URL,
    API_COULEUR_TEMPO_BASE_URL,
    API_DATE_QUERY_FORMAT,
    API_TOKEN_URL,
    FR_TZ,
    HOUR_OF_CHANGE,
    OFF_PEAK_START,
    TABULAR_API_BASE,
    TARIFF_OFFER_BASE,
    TARIFF_OFFER_HPHC,
    TARIFF_OFFER_TEMPO,
    TARIFF_RESOURCE_BASE,
    TARIFF_RESOURCE_HPHC,
    TARIFF_RESOURCE_TEMPO,
    USER_AGENT,
)

_LOGGER = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# Tariff client – EDF tariffs fetcher (Tempo, HP/HC, Base) from data.gouv.fr
# ═══════════════════════════════════════════════════════════════════════════════

_OFFER_CONFIG: dict[str, dict[str, Any]] = {
    TARIFF_OFFER_TEMPO: {
        "resource_id": TARIFF_RESOURCE_TEMPO,
        "required_headers": frozenset({
            "P_SOUSCRITE",
            "DATE_DEBUT",
            "DATE_FIN",
            "PART_FIXE_TTC",
            "PART_VARIABLE_HCBleu_TTC",
            "PART_VARIABLE_HPBleu_TTC",
            "PART_VARIABLE_HCBlanc_TTC",
            "PART_VARIABLE_HPBlanc_TTC",
            "PART_VARIABLE_HCRouge_TTC",
            "PART_VARIABLE_HPRouge_TTC",
        }),
        "field_map": {
            "fixed_ttc": "PART_FIXE_TTC",
            "hc_bleu_ttc": "PART_VARIABLE_HCBleu_TTC",
            "hp_bleu_ttc": "PART_VARIABLE_HPBleu_TTC",
            "hc_blanc_ttc": "PART_VARIABLE_HCBlanc_TTC",
            "hp_blanc_ttc": "PART_VARIABLE_HPBlanc_TTC",
            "hc_rouge_ttc": "PART_VARIABLE_HCRouge_TTC",
            "hp_rouge_ttc": "PART_VARIABLE_HPRouge_TTC",
        },
    },
    TARIFF_OFFER_HPHC: {
        "resource_id": TARIFF_RESOURCE_HPHC,
        "required_headers": frozenset({
            "P_SOUSCRITE",
            "DATE_DEBUT",
            "DATE_FIN",
            "PART_FIXE_TTC",
            "PART_VARIABLE_HC_TTC",
            "PART_VARIABLE_HP_TTC",
        }),
        "field_map": {
            "fixed_ttc": "PART_FIXE_TTC",
            "hc_ttc": "PART_VARIABLE_HC_TTC",
            "hp_ttc": "PART_VARIABLE_HP_TTC",
        },
    },
    TARIFF_OFFER_BASE: {
        "resource_id": TARIFF_RESOURCE_BASE,
        "required_headers": frozenset({
            "P_SOUSCRITE",
            "DATE_DEBUT",
            "DATE_FIN",
            "PART_FIXE_TTC",
            "PART_VARIABLE_TTC",
        }),
        "field_map": {
            "fixed_ttc": "PART_FIXE_TTC",
            "base_ttc": "PART_VARIABLE_TTC",
        },
    },
}

# ── Pure helpers ──────────────────────────────────────────────────────────────


def parse_french_decimal(value: str) -> float:
    """Convert a French-format decimal string (comma or dot) to float."""
    cleaned = value.strip().replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        raise ValueError(f"Cannot parse decimal value: {value!r}") from None


def parse_french_date(value: str) -> date:
    """Parse DD/MM/YYYY or YYYY-MM-DD date string."""
    stripped = value.strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(stripped, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Cannot parse date: {value!r}")


def normalize_power(value: str) -> str:
    """Normalize power string: strip whitespace and optional 'kVA' suffix."""
    return value.strip().upper().removesuffix("KVA").strip()


def validate_headers(fieldnames: list[str], required_headers: frozenset[str]) -> None:
    """Raise ValueError if any required header is absent from the CSV."""
    missing = required_headers - set(fieldnames)
    if missing:
        raise ValueError(
            f"CSV is missing required headers: {', '.join(sorted(missing))}"
        )


def _extract_rows_from_json_payload(payload: dict[str, Any]) -> list[dict[str, str]]:
    """Extract tabular API rows from JSON payload."""
    data = payload.get("data")
    if not isinstance(data, list):
        raise ValueError("Tariff JSON payload is invalid: missing 'data' list")

    rows: list[dict[str, str]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        row: dict[str, str] = {}
        for k, v in item.items():
            row[str(k)] = "" if v is None else str(v)
        rows.append(row)
    if not rows:
        raise ValueError("Tariff JSON payload has no rows")
    return rows


# ── Row selection ─────────────────────────────────────────────────────────────


def _select_best_row(rows: list[dict[str, str]], contract_power: str) -> dict[str, str]:
    """Return the best row for *contract_power*.

    Priority:
      1. Row currently valid (DATE_DEBUT ≤ today ≤ DATE_FIN) — latest DATE_DEBUT first.
      2. Most recently ended row (largest DATE_FIN), when no current row exists.
    """
    norm = normalize_power(contract_power)
    matching = [r for r in rows if normalize_power(r.get("P_SOUSCRITE", "")) == norm]
    if not matching:
        available = sorted({normalize_power(r.get("P_SOUSCRITE", "")) for r in rows if r.get("P_SOUSCRITE")})
        raise ValueError(
            f"No tariff row found for P_SOUSCRITE={contract_power!r}. "
            f"Available powers: {available}"
        )

    today = date.today()
    dated: list[tuple[date, date, dict[str, str]]] = []
    for row in matching:
        try:
            debut = parse_french_date(row["DATE_DEBUT"])
            fin_raw = row.get("DATE_FIN", "").strip()
            fin = date.max if not fin_raw else parse_french_date(fin_raw)
        except ValueError:
            _LOGGER.debug("Skipping row with unparseable dates: %s", row)
            continue
        dated.append((debut, fin, row))

    if not dated:
        raise ValueError(f"No parseable date rows for P_SOUSCRITE={contract_power!r}")

    current = [(debut, fin, r) for debut, fin, r in dated if debut <= today <= fin]
    candidates = current if current else dated

    return max(candidates, key=lambda t: (t[0], t[1]))[2]


# ── Extraction ────────────────────────────────────────────────────────────────


def _extract_values(
    rows: list[dict[str, str]],
    contract_power: str,
    field_map: dict[str, str],
) -> dict[str, Any]:
    row = _select_best_row(rows, contract_power)

    result: dict[str, Any] = {"contract_power": contract_power}
    for key, col in field_map.items():
        raw = row.get(col, "").strip()
        if not raw:
            raise ValueError(f"Empty value for column {col!r} in selected row")
        result[key] = parse_french_decimal(raw)
    return result


def _normalize_for_slots(offer: str, raw_values: dict[str, Any]) -> dict[str, Any]:
    """Convert offer-specific tariffs to integration slot-compatible values.

    ``fixed_ttc`` comes from PART_FIXE_TTC (€ / year TTC), not per month.
    """
    fixed = raw_values["fixed_ttc"]
    if offer == TARIFF_OFFER_TEMPO:
        return {
            "fixed_ttc": fixed,
            "hc_bleu_ttc": raw_values["hc_bleu_ttc"],
            "hp_bleu_ttc": raw_values["hp_bleu_ttc"],
            "hc_blanc_ttc": raw_values["hc_blanc_ttc"],
            "hp_blanc_ttc": raw_values["hp_blanc_ttc"],
            "hc_rouge_ttc": raw_values["hc_rouge_ttc"],
            "hp_rouge_ttc": raw_values["hp_rouge_ttc"],
        }
    if offer == TARIFF_OFFER_HPHC:
        hc = raw_values["hc_ttc"]
        hp = raw_values["hp_ttc"]
        return {
            "fixed_ttc": fixed,
            "hc_bleu_ttc": hc,
            "hp_bleu_ttc": hp,
            "hc_blanc_ttc": hc,
            "hp_blanc_ttc": hp,
            "hc_rouge_ttc": hc,
            "hp_rouge_ttc": hp,
        }
    if offer == TARIFF_OFFER_BASE:
        base = raw_values["base_ttc"]
        return {
            "fixed_ttc": fixed,
            "hc_bleu_ttc": base,
            "hp_bleu_ttc": base,
            "hc_blanc_ttc": base,
            "hp_blanc_ttc": base,
            "hc_rouge_ttc": base,
            "hp_rouge_ttc": base,
        }
    raise ValueError(f"Unsupported offer: {offer!r}")


def extract_offer_tariffs(
    rows: list[dict[str, str]], offer: str, contract_power: str
) -> dict[str, Any]:
    """Extract and normalize tariffs for one offer and subscribed power."""
    cfg = _OFFER_CONFIG.get(offer)
    if not cfg:
        raise ValueError(f"Unsupported offer: {offer!r}")

    raw_values = _extract_values(rows, contract_power, cfg["field_map"])
    normalized = _normalize_for_slots(offer, raw_values)
    result = {"offer": offer, "contract_power": contract_power, **normalized}
    result["source"] = "data_gouv_tabular_api"
    result["fetched_at"] = datetime.now().astimezone().isoformat()
    return result


# ── Async fetch entry point ───────────────────────────────────────────────────


def _json_url_for_resource(resource_id: str) -> str:
    return f"{TABULAR_API_BASE}/{resource_id}/data/"


async def async_fetch_offer_tariffs(
    session: ClientSession, offer: str, contract_power: str
) -> dict[str, Any]:
    """Fetch and parse EDF tariffs for one offer and subscribed power."""
    cfg = _OFFER_CONFIG.get(offer)
    if not cfg:
        raise ValueError(f"Unsupported offer: {offer!r}")

    norm_power = normalize_power(contract_power)
    url = _json_url_for_resource(cfg["resource_id"])
    _LOGGER.debug("Fetching tariffs (offer=%s, power=%s)", offer, norm_power)
    headers = {
        "User-Agent": USER_AGENT,
        "Accept":     "application/json,text/plain,*/*",
    }
    params = {
        "P_SOUSCRITE__exact": norm_power,
        "P_SOUSCRITE__sort": "asc",
        "DATE_DEBUT__sort": "desc",
        "page_size": 100,
    }
    async with session.get(url, headers=headers, params=params, timeout=30) as resp:
        resp.raise_for_status()
        payload = await resp.json(content_type=None)

    if not isinstance(payload, dict):
        raise ValueError("Tariff JSON payload is invalid: expected object")

    rows = _extract_rows_from_json_payload(payload)
    validate_headers(list(rows[0].keys()), cfg["required_headers"])
    _LOGGER.debug("JSON parsed: %d rows for offer=%s", len(rows), offer)
    return extract_offer_tariffs(rows, offer, contract_power)


# ═══════════════════════════════════════════════════════════════════════════════
# RTE client – Async RTE Open Data client for Tempo-like calendar
# ═══════════════════════════════════════════════════════════════════════════════

# TMPLIKSUPCON_TMPLIKCAL_F04: end_date must not be greater than D+2 (system date).
_CALENDAR_MAX_END_DAYS_AFTER_TODAY = 2
# TMPLIKSUPCON_TMPLIKCAL_F03: max range per call — use chunks (see Swagger).
_CALENDAR_CHUNK_DAYS = 90
_CALENDAR_MIN_CHUNK_DAYS = 7
_CALENDAR_CHUNK_DELAY_S = 0.4


@dataclass(frozen=True)
class TempoCalendarRow:
    """One interval from RTE tempo_like_calendars API."""

    start: datetime
    end: datetime
    value: str  # BLUE, WHITE, RED
    hphc: str | None = None  # hp/hc when provided by API


def _fix_tz_colon(date_str: str) -> str:
    """RTE returns +01:00 but Python %z wants +0100 in strptime."""
    if len(date_str) >= 3 and date_str[-3] == ":":
        return date_str[:-3] + date_str[-2:]
    return date_str


def _parse_rte_datetime(date_str: str) -> datetime:
    return datetime.strptime(_fix_tz_colon(date_str), API_DATE_QUERY_FORMAT)


def adjust_tempo_time(dt: datetime) -> datetime:
    """RTE gives midnight-to-midnight; Tempo supply day runs 06:00–06:00 Paris."""
    return dt + timedelta(hours=HOUR_OF_CHANGE)


def _format_query_datetime(dt: datetime) -> str:
    """RTE expects YYYY-MM-DDThh:mm:ss+01:00 (offset with colon)."""
    s = dt.strftime(API_DATE_QUERY_FORMAT)
    if len(s) >= 5 and (s[-5] in "+-"):
        return s[:-2] + ":" + s[-2:]
    return s


def _calendar_interval_dicts(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Swagger: tempo_like_calendars may be an array of blocks, each with values[]."""
    raw = payload.get("tempo_like_calendars")
    if raw is None:
        return []
    if isinstance(raw, list):
        out: list[dict[str, Any]] = []
        for block in raw:
            if not isinstance(block, dict):
                continue
            vals = block.get("values")
            if isinstance(vals, list):
                out.extend(v for v in vals if isinstance(v, dict))
        return out
    if isinstance(raw, dict):
        vals = raw.get("values")
        if isinstance(vals, list):
            return [v for v in vals if isinstance(v, dict)]
    return []


def _raise_rte_calendar_http_error(status: int, body_text: str) -> None:
    """Raise ValueError with RTE error / error_description when present (Swagger #/definitions/error)."""
    msg = body_text.strip() or f"HTTP {status}"
    try:
        err = json.loads(body_text)
        if isinstance(err, dict):
            short = str(err.get("error") or "").strip()
            long_desc = str(err.get("error_description") or "").strip()
            if short and long_desc:
                msg = f"{short}: {long_desc}"
            elif long_desc:
                msg = long_desc
            elif short:
                msg = short
    except (TypeError, ValueError):
        pass
    raise ValueError(msg)


def _dedupe_calendar_rows(rows: list[TempoCalendarRow]) -> list[TempoCalendarRow]:
    seen: set[tuple[datetime, datetime, str, str | None]] = set()
    out: list[TempoCalendarRow] = []
    for r in rows:
        key = (r.start, r.end, r.value, r.hphc)
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    out.sort(key=lambda x: x.start)
    return out


def _calendar_chunk_windows(
    start: datetime, end: datetime, *, max_days: int = _CALENDAR_CHUNK_DAYS
) -> list[tuple[datetime, datetime]]:
    """Split [start, end] into windows; avoid a trailing window shorter than F05 minimum."""
    parts: list[tuple[datetime, datetime]] = []
    cur = start
    while cur < end:
        nxt = min(cur + timedelta(days=max_days), end)
        parts.append((cur, nxt))
        cur = nxt
    if len(parts) >= 2:
        s1, e1 = parts[-2]
        s2, e2 = parts[-1]
        if (e2 - s2).days < _CALENDAR_MIN_CHUNK_DAYS:
            parts[-2] = (s1, e2)
            parts.pop()
    return parts


async def _async_fetch_calendar_single_chunk(
    session: ClientSession,
    access_token: str,
    start: datetime,
    end: datetime,
    *,
    min_days: int = _CALENDAR_MIN_CHUNK_DAYS,
) -> list[TempoCalendarRow]:
    """Fetch one window; on F03 split recursively until range is small enough."""
    if end <= start:
        return []
    try:
        return await async_fetch_tempo_calendar(session, access_token, start, end)
    except ValueError as err:
        err_s = str(err)
        span_days = (end - start).total_seconds() / 86400
        if "F03" not in err_s and "TMPLIKCAL_F03" not in err_s:
            raise
        if span_days <= min_days + 0.5:
            _LOGGER.error(
                "RTE calendar chunk still too long after splits (%s → %s days): %s",
                start.isoformat(),
                end.isoformat(),
                span_days,
            )
            raise
        mid = start + timedelta(seconds=(end - start).total_seconds() / 2)
        if mid <= start or mid >= end:
            raise
        left = await _async_fetch_calendar_single_chunk(
            session, access_token, start, mid, min_days=min_days
        )
        right = await _async_fetch_calendar_single_chunk(
            session, access_token, mid, end, min_days=min_days
        )
        return left + right


async def async_fetch_tempo_calendar_chunked(
    session: ClientSession,
    access_token: str,
    start: datetime,
    end: datetime,
) -> list[TempoCalendarRow]:
    """Fetch calendar over a long span using several API calls (F03 compliance)."""
    merged: list[TempoCalendarRow] = []
    for i, (a, b) in enumerate(_calendar_chunk_windows(start, end)):
        if i:
            await asyncio.sleep(_CALENDAR_CHUNK_DELAY_S)
        merged.extend(
            await _async_fetch_calendar_single_chunk(session, access_token, a, b)
        )
    return _dedupe_calendar_rows(merged)


async def async_fetch_access_token(
    session: ClientSession, client_id: str, client_secret: str
) -> str:
    """OAuth2 client_credentials."""
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    headers = {
        "Authorization": f"Basic {basic}",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
    }
    async with session.post(
        API_TOKEN_URL,
        headers=headers,
        data="grant_type=client_credentials",
        timeout=30,
    ) as resp:
        resp.raise_for_status()
        data: dict[str, Any] = await resp.json()
    token = data.get("access_token")
    if not token:
        raise ValueError("RTE token response missing access_token")
    return str(token)


async def async_fetch_tempo_calendar(
    session: ClientSession,
    access_token: str,
    start: datetime,
    end: datetime,
) -> list[TempoCalendarRow]:
    """Fetch tempo_like_calendars between start and end (Paris-aware datetimes).

    Per Swagger: if start_date or end_date is sent, both are mandatory (F01).
    Use midnight-aligned bounds; ranges that are too short can return 400 (F05).
    """
    params = {
        "start_date": _format_query_datetime(start),
        "end_date": _format_query_datetime(end),
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    async with session.get(
        API_CALENDAR_URL, headers=headers, params=params, timeout=45
    ) as resp:
        if resp.status >= 400:
            text = await resp.text()
            _raise_rte_calendar_http_error(resp.status, text)
        payload: dict[str, Any] = await resp.json()

    values = _calendar_interval_dicts(payload)
    rows: list[TempoCalendarRow] = []
    for item in values:
        try:
            start_raw = _parse_rte_datetime(item["start_date"])
            end_raw = _parse_rte_datetime(item["end_date"])
            raw_colour = item.get("values", item.get("value", ""))
            val = str(raw_colour).upper()
            hphc: str | None = None
            for key in ("consumption_type", "price_period", "tempo_like_period", "period", "hphc"):
                raw = str(item.get(key, "")).lower()
                if "hc" in raw:
                    hphc = "hc"
                    break
                if "hp" in raw:
                    hphc = "hp"
                    break
            rows.append(
                TempoCalendarRow(
                    start=adjust_tempo_time(start_raw),
                    end=adjust_tempo_time(end_raw),
                    value=val,
                    hphc=hphc,
                )
            )
        except (KeyError, ValueError, TypeError) as err:
            _LOGGER.warning("Skipping malformed tempo row %s: %s", item, err)
    return rows


async def async_test_rte_credentials(
    session: ClientSession, client_id: str, client_secret: str
) -> None:
    """Validate credentials: token + GET calendar without query (same as hekmon/rtetempo).

    Sending a small start/end window can return 400 TMPLIKCAL_F05 (period too short).
    """
    token = await async_fetch_access_token(session, client_id, client_secret)
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    async with session.get(API_CALENDAR_URL, headers=headers, timeout=45) as resp:
        if resp.status >= 400:
            text = await resp.text()
            _raise_rte_calendar_http_error(resp.status, text)


async def async_get_calendar_rows(
    session: ClientSession, client_id: str, client_secret: str
) -> list[TempoCalendarRow]:
    """Fetch extended calendar for coordinator (~1y back + horizon).

    RTE rejects overly long single queries (TMPLIKSUPCON_TMPLIKCAL_F03); we chunk.
    """
    token = await async_fetch_access_token(session, client_id, client_secret)

    tz = ZoneInfo(FR_TZ)
    ref = datetime.now(tz)
    localized_midnight = datetime.combine(ref.date(), datetime.min.time(), tzinfo=tz)
    start = localized_midnight - timedelta(days=364)
    end = datetime.combine(
        ref.date() + timedelta(days=_CALENDAR_MAX_END_DAYS_AFTER_TODAY),
        datetime.min.time(),
        tzinfo=tz,
    )
    return await async_fetch_tempo_calendar_chunked(session, token, start, end)


# ═══════════════════════════════════════════════════════════════════════════════
# API Couleur Tempo – day colors and stats from api-couleur-tempo.fr
# ═══════════════════════════════════════════════════════════════════════════════


def _normalize_color(label: str | None) -> str | None:
    if not label:
        return None
    s = str(label).strip().lower()
    if s == "bleu":
        return "bleu"
    if s == "blanc":
        return "blanc"
    if s == "rouge":
        return "rouge"
    return None


async def _get_json(session: ClientSession, path: str) -> dict[str, Any]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json,text/plain,*/*",
    }
    async with session.get(
        f"{API_COULEUR_TEMPO_BASE_URL}{path}", headers=headers, timeout=20
    ) as resp:
        resp.raise_for_status()
        payload = await resp.json(content_type=None)
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid payload for {path}: expected object")
    return payload


async def async_get_today_tomorrow_colors(
    session: ClientSession,
) -> tuple[str | None, str | None]:
    today = await _get_json(session, "/api/jourTempo/today")
    tomorrow = await _get_json(session, "/api/jourTempo/tomorrow")
    return (
        _normalize_color(today.get("libCouleur")),
        _normalize_color(tomorrow.get("libCouleur")),
    )


def _normalize_tempo_stats_payload(s: dict[str, Any]) -> dict[str, dict[str, int]] | None:
    """Normalize /api/stats JSON to blue/white/red elapsed+remaining."""
    needed = (
        "joursBleusConsommes",
        "joursBleusRestants",
        "joursBlancsConsommes",
        "joursBlancsRestants",
        "joursRougesConsommes",
        "joursRougesRestants",
    )
    if any(k not in s for k in needed):
        return None
    try:
        return {
            "blue": {
                "elapsed": int(s["joursBleusConsommes"]),
                "remaining": int(s["joursBleusRestants"]),
            },
            "white": {
                "elapsed": int(s["joursBlancsConsommes"]),
                "remaining": int(s["joursBlancsRestants"]),
            },
            "red": {
                "elapsed": int(s["joursRougesConsommes"]),
                "remaining": int(s["joursRougesRestants"]),
            },
        }
    except (TypeError, ValueError):
        return None


async def async_get_tempo_stats(
    session: ClientSession,
) -> dict[str, dict[str, int]] | None:
    """Return Tempo counters by color from /api/stats."""
    s = await _get_json(session, "/api/stats")
    return _normalize_tempo_stats_payload(s)


async def async_get_tempo_stats_with_raw(
    session: ClientSession,
) -> tuple[dict[str, dict[str, int]] | None, dict[str, Any]]:
    """Return (normalized counters or None, full /api/stats payload)."""
    s = await _get_json(session, "/api/stats")
    return _normalize_tempo_stats_payload(s), s


# ═══════════════════════════════════════════════════════════════════════════════
# Slot engine – Resolve current Tempo colour + HC/HP slot
# ═══════════════════════════════════════════════════════════════════════════════

_PARIS_TZ = ZoneInfo(FR_TZ)

COLOUR_MAP = {
    "BLUE": "bleu",
    "WHITE": "blanc",
    "RED": "rouge",
}


def is_off_peak(local_dt: datetime) -> bool:
    """HC = 22:00–06:00 Paris (standard Tempo contact)."""
    h = local_dt.hour
    return h >= OFF_PEAK_START or h < HOUR_OF_CHANGE


def colour_from_rte_value(value: str) -> str | None:
    v = value.upper()
    return COLOUR_MAP.get(v)


def _to_paris(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=_PARIS_TZ)
    return dt.astimezone(_PARIS_TZ)


def tempo_supply_day_start_paris(now: datetime) -> datetime:
    """Start (06:00) of the Tempo supply day that contains ``now`` (6h→6h, Europe/Paris)."""
    now = _to_paris(now)
    today_6 = now.replace(
        hour=HOUR_OF_CHANGE, minute=0, second=0, microsecond=0
    )
    if now >= today_6:
        return today_6
    return today_6 - timedelta(days=1)


def _colour_at_anchor(
    rows: list[TempoCalendarRow], anchor: datetime
) -> str | None:
    """Colour for the Tempo day anchored at ``anchor`` (typically a 06:00 Paris).

    If several RTE rows contain ``anchor`` (HP/HC splits + décalage +6h), keep the
    **longest** interval so the journée complète wins over a stray short segment.
    """
    anchor = _to_paris(anchor)
    best: tuple[timedelta, str] | None = None
    for row in rows:
        if row.start <= anchor < row.end:
            c = colour_from_rte_value(row.value)
            if not c:
                continue
            span = row.end - row.start
            if best is None or span > best[0]:
                best = (span, c)
    return best[1] if best else None


def current_colour_from_calendar(
    rows: list[TempoCalendarRow], local_now: datetime
) -> str | None:
    """Couleur jour Tempo (bleu/blanc/rouge) au 6h→6h, pas à la tranche HP/HC RTE."""
    local_now = _to_paris(local_now)
    anchor = tempo_supply_day_start_paris(local_now)
    c = _colour_at_anchor(rows, anchor)
    if c is not None:
        return c
    for row in rows:
        if row.start <= local_now < row.end:
            return colour_from_rte_value(row.value)
    return None


def current_slot_from_calendar(
    rows: list[TempoCalendarRow], local_now: datetime
) -> str | None:
    """Slot = couleur du jour Tempo (ancre 6h) + HC/HP selon l'heure locale (22h–6h)."""
    colour = current_colour_from_calendar(rows, local_now)
    if not colour:
        return None
    return build_current_slot(colour, local_now)


def tomorrow_colour_from_calendar(
    rows: list[TempoCalendarRow], local_now: datetime
) -> str | None:
    """Couleur du **prochain** jour Tempo (prochain 06:00 après maintenant)."""
    local_now = _to_paris(local_now)
    nxt = next_tempo_day_boundary_paris(local_now)
    anchor = tempo_supply_day_start_paris(nxt)
    return _colour_at_anchor(rows, anchor)


def colour_at_instant(rows: list[TempoCalendarRow], t: datetime) -> str | None:
    """Couleur « jour Tempo » à l'instant ``t`` (même logique que le calendrier agrégé)."""
    t = _to_paris(t)
    return _colour_at_anchor(rows, tempo_supply_day_start_paris(t))


def next_tempo_colour_change_at(
    rows: list[TempoCalendarRow], now: datetime
) -> datetime | None:
    """Premier 06:00 Paris strictement après ``now`` où la couleur jour ≠ couleur actuelle."""
    if not rows:
        return None
    now = _to_paris(now)
    cur = current_colour_from_calendar(rows, now)
    if cur is None:
        return None
    b = next_tempo_day_boundary_paris(now)
    for _ in range(400):
        anchor = tempo_supply_day_start_paris(b)
        nxt_col = _colour_at_anchor(rows, anchor)
        if nxt_col is not None and nxt_col != cur:
            return b
        b = next_tempo_day_boundary_paris(b)
    return None


def next_tempo_day_boundary_paris(now: datetime) -> datetime:
    """Next 06:00 Europe/Paris (Tempo supply day rollover, API / capteur sans calendrier détaillé)."""
    now = _to_paris(now)
    boundary = now.replace(
        hour=HOUR_OF_CHANGE, minute=0, second=0, microsecond=0
    )
    if now < boundary:
        return boundary
    return boundary + timedelta(days=1)


def next_hc_window_start_paris(now: datetime) -> datetime:
    """Start of next HC window (22:00 Paris). If already in HC before 06:00, next is today 22:00."""
    now = _to_paris(now)
    today_22 = now.replace(
        hour=OFF_PEAK_START, minute=0, second=0, microsecond=0
    )
    tomorrow_22 = today_22 + timedelta(days=1)
    if not is_off_peak(now):
        return today_22 if now < today_22 else tomorrow_22
    if now.hour >= OFF_PEAK_START:
        return tomorrow_22
    return today_22


def build_current_slot(colour: str | None, local_now: datetime) -> str | None:
    if not colour:
        return None
    hc = "hc" if is_off_peak(local_now) else "hp"
    return f"{colour}_{hc}"


def parse_slot_from_sensor_state(state: str | None) -> str | None:
    """Normalize external sensor to bleu_hc, etc."""
    if state in (None, "", "unknown", "unavailable"):
        return None
    s = str(state).strip().lower().replace(" ", "_")
    s = s.replace("-", "_")
    if re.match(r"^(bleu|blanc|rouge)_(hc|hp)$", s):
        return s
    if "bleu" in s and "_hc" in s:
        return "bleu_hc"
    if "bleu" in s and "_hp" in s:
        return "bleu_hp"
    if "blanc" in s and "_hc" in s:
        return "blanc_hc"
    if "blanc" in s and "_hp" in s:
        return "blanc_hp"
    if "rouge" in s and "_hc" in s:
        return "rouge_hc"
    if "rouge" in s and "_hp" in s:
        return "rouge_hp"
    _LOGGER.debug("Could not parse slot from state: %s", state)
    return None
