import { SLOTS } from "../constants/slots.js";

/** Per-slot € + subscription — stay on ``cost_detail`` (history aggregation). */
export const COST_AGG_MONETARY_ATTRS = Object.freeze([
  ...SLOTS.map((s) => `${s.id}_eur`),
  "abonnement_eur",
]);

/** kWh / reinjection € aggregates — read from ``lovelace_card`` in history. */
export const COST_AGG_CARD_ATTRS = Object.freeze([
  "export_due_to_solar_surplus_kwh",
  "export_due_to_battery_full_or_absent_kwh",
  "export_due_to_switch_latency_kwh",
  "export_unattributed_kwh",
  "export_opportunity_cost_total_eur",
  "export_opportunity_cost_solar_surplus_eur",
  "export_opportunity_cost_battery_full_or_absent_eur",
  "export_opportunity_cost_switch_latency_eur",
  "export_opportunity_cost_unattributed_eur",
]);

/** @deprecated Use COST_AGG_MONETARY_ATTRS + COST_AGG_CARD_ATTRS */
export const COST_AGG_ATTRS = Object.freeze([...COST_AGG_MONETARY_ATTRS, ...COST_AGG_CARD_ATTRS]);

/** Dict-valued attributes aggregated per-key across history days (on ``lovelace_card``). */
export const COST_AGG_DICT_ATTRS = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh",
]);

/** Default Hub Énergie sensor namespace (legacy fallbacks before ``card_entity_ids`` on cost_detail). */
export const DEFAULT_HUB_ENTITY_PREFIX = "sensor.hub_energie_";

/** Attribute on cost_detail: 0-based site index (stable slot; matches card ``site_index``). */
export const CARD_SITE_INDEX_ATTR = "card_site_index";
/** Segment in ``entity_id`` after ``hub_energie_`` (digits or site slug). */
export const CARD_SITE_SEGMENT_ATTR = "card_site_segment";
/** True on ``sensor.*_lovelace_card`` (Frontend device) for discovery. */
export const CARD_PAYLOAD_MARKER_ATTR = "hub_energie_card_payload";

/** Keys on ``cost_detail`` attribute ``card_entity_ids`` (matches integration). */
export const CARD_ENTITY_MAP_KEYS = Object.freeze([
  "ecoSolar",
  "ecoBatt",
  "originGrid",
  "originSolar",
  "usageGridDirect",
  "usageGridBatt",
  "usageSolarDirect",
  "usageSolarBatt",
  "usageBattHome",
]);

/**
 * Entity IDs the card reads via the history API and live state.
 * Legacy defaults use the ``hub_energie_`` prefix; current installs resolve via ``card_entity_ids``.
 */
export function makeEntityMap(prefix = DEFAULT_HUB_ENTITY_PREFIX) {
  const p = prefix;
  return {
    cost: `${p}cost_detail`,
    frontendData: `${p}frontend_data`,
    frontendMeta: `${p}frontend_meta`,
    ecoSolar: `${p}savings_solar_eur`,
    ecoBatt: `${p}savings_battery_eur`,
    originGrid: `${p}origin_grid_kwh`,
    originSolar: `${p}origin_solar_kwh`,
    usageGridDirect: `${p}usage_grid_direct_kwh`,
    usageGridBatt: `${p}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${p}usage_solar_direct_kwh`,
    usageSolarBatt: `${p}usage_solar_batt_charge_kwh`,
    usageBattHome: `${p}usage_batt_home_kwh`,
    lovelaceCard: `${p}lovelace_card`,
  };
}

/**
 * Hub Énergie installations visible in states (one row per ``cost_detail`` / legacy equivalent).
 * @returns {{ index: number, segment: string, costEntityId: string }[]}
 */
export function hubSitesFromStates(states) {
  if (!states) return [];
  /** @type {Map<number, { index: number, segment: string, costEntityId: string }>} */
  const byIdx = new Map();
  for (const [eid, st] of Object.entries(states)) {
    const a = st?.attributes;
    if (!a || typeof a !== "object") continue;
    const m = a.card_entity_ids;
    if (m && typeof m === "object" && m.cost === eid) {
      const idx = costSiteSlotFromState(st, eid) ?? 0;
      const segRaw = a[CARD_SITE_SEGMENT_ATTR];
      const segment =
        typeof segRaw === "string" && segRaw.trim() !== "" ? String(segRaw).trim() : String(idx);
      byIdx.set(idx, { index: idx, segment, costEntityId: eid });
      continue;
    }
    if (typeof a.eco_solar === "number" && a.grid_by_slot_kwh != null && typeof a.grid_by_slot_kwh === "object") {
      const idx = costSiteSlotFromState(st, eid) ?? 0;
      if (byIdx.has(idx)) continue;
      const segRaw = a[CARD_SITE_SEGMENT_ATTR];
      const segment =
        typeof segRaw === "string" && segRaw.trim() !== "" ? String(segRaw).trim() : String(idx);
      byIdx.set(idx, { index: idx, segment, costEntityId: eid });
    }
  }
  return [...byIdx.values()].sort((x, y) => x.index - y.index);
}

/**
 * Count Hub Énergie sites (see ``hubSitesFromStates``).
 * @param {Record<string, { attributes?: Record<string, unknown> }> | undefined} states
 */
export function hubEnergieSiteCountFromStates(states) {
  return hubSitesFromStates(states).length;
}

/**
 * Parse site index n from ``sensor.hub_energie_<n>_cost_detail`` (or legacy ids → null).
 * @param {string} entityId
 * @returns {number | null}
 */
export function siteIndexFromCostEntityId(entityId) {
  if (typeof entityId !== "string" || !entityId.startsWith("sensor.")) return null;
  const obj = entityId.slice("sensor.".length);
  const m = /^hub_energie_(\d+)_/.exec(obj);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

/** Prefer ``card_site_index`` on attributes; else parse numeric segment from ``entity_id``. */
export function costSiteSlotFromState(st, entityId) {
  const a = st?.attributes;
  if (a && typeof a === "object") {
    const declared = a[CARD_SITE_INDEX_ATTR];
    if (typeof declared === "number" && Number.isFinite(declared)) return Math.trunc(declared);
  }
  return siteIndexFromCostEntityId(entityId);
}

/**
 * Resolve the cost_detail ``entity_id``: legacy default, optional ``siteIndex`` filter,
 * ``card_entity_ids`` self-ref, then cost-shaped attributes (deterministic sort if several).
 * @param {Record<string, { attributes?: Record<string, unknown> }> | undefined} states
 * @param {number | null | undefined} siteIndex 0-based site; null/undefined = auto (single site or smallest id)
 */
export function discoverCostEntityId(states, siteIndex) {
  const base = makeEntityMap();
  const fallback = base.cost;
  if (!states) return fallback;
  const wantIdx =
    siteIndex === "" || siteIndex === undefined || siteIndex === null
      ? null
      : Math.max(0, Math.trunc(Number(siteIndex)));

  const withCardMap = [];
  for (const [eid, st] of Object.entries(states)) {
    const a = st?.attributes;
    if (!a || typeof a !== "object") continue;
    const m = a.card_entity_ids;
    if (!m || typeof m !== "object" || m.cost !== eid) continue;
    const effectiveIdx = costSiteSlotFromState(st, eid) ?? 0;
    if (wantIdx !== null && effectiveIdx !== wantIdx) continue;
    withCardMap.push(eid);
  }
  if (withCardMap.length === 1) return withCardMap[0];
  if (withCardMap.length > 1) return [...withCardMap].sort()[0];

  if (wantIdx === null && states[fallback]?.attributes) return fallback;

  const legacy = [];
  for (const [eid, st] of Object.entries(states)) {
    const a = st?.attributes;
    if (!a || typeof a !== "object") continue;
    if (typeof a.eco_solar === "number" && a.grid_by_slot_kwh != null && typeof a.grid_by_slot_kwh === "object") {
      const idx = costSiteSlotFromState(st, eid);
      if (wantIdx !== null && idx !== null && idx !== wantIdx) continue;
      if (wantIdx !== null && idx === null) continue;
      legacy.push(eid);
    }
  }
  if (legacy.length >= 1) return [...legacy].sort()[0];

  const nSites = hubEnergieSiteCountFromStates(states);
  if (wantIdx === null && nSites <= 1 && states[fallback]) return fallback;

  return fallback;
}

/**
 * ``sensor.*_lovelace_card`` for this site (live payload on Frontend device).
 * @param {Record<string, { attributes?: Record<string, unknown> }> | undefined} states
 */
export function discoverLovelaceCardEntityId(states, siteIndex) {
  const base = makeEntityMap();
  const fallback = base.lovelaceCard;
  if (!states) return fallback;
  const wantIdx =
    siteIndex === "" || siteIndex === undefined || siteIndex === null
      ? null
      : Math.max(0, Math.trunc(Number(siteIndex)));

  const hits = [];
  for (const [eid, st] of Object.entries(states)) {
    const a = st?.attributes;
    if (!a || typeof a !== "object") continue;
    if (a[CARD_PAYLOAD_MARKER_ATTR] !== true) continue;
    const effectiveIdx = costSiteSlotFromState(st, eid) ?? 0;
    if (wantIdx !== null && effectiveIdx !== wantIdx) continue;
    hits.push(eid);
  }
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) return [...hits].sort()[0];
  return fallback;
}

/**
 * Merge ``card_entity_ids`` from cost_detail attributes into the entity map.
 * @param {Record<string, unknown> | undefined} costAttrs
 * @param {ReturnType<typeof makeEntityMap>} baseMap
 * @param {string} costEntityId
 */
export function entityMapFromCostAttributes(costAttrs, baseMap, costEntityId) {
  const out = { ...baseMap, cost: costEntityId };
  const card = costAttrs?.card_entity_ids;
  if (!card || typeof card !== "object") return out;
  for (const k of CARD_ENTITY_MAP_KEYS) {
    const v = card[k];
    if (typeof v === "string" && v.includes(".")) out[k] = v;
  }
  if (typeof card.lovelaceCard === "string" && card.lovelaceCard.includes(".")) {
    out.lovelaceCard = card.lovelaceCard;
  }
  return out;
}

/**
 * Live / history view: monetary attrs stay on ``cost_detail``; card UI attrs on ``lovelace_card``.
 * @param {Record<string, unknown> | undefined} costAttrs
 * @param {Record<string, unknown> | undefined} lovelaceAttrs
 */
export function mergeHubCardAttributes(costAttrs, lovelaceAttrs) {
  const a = lovelaceAttrs && typeof lovelaceAttrs === "object" ? lovelaceAttrs : {};
  const b = costAttrs && typeof costAttrs === "object" ? costAttrs : {};
  return { ...a, ...b };
}

// ── Data access helpers ──────────────────────────────────────────────────

/** Read a numeric value from a per-slot dict attribute, defaulting to 0. */
export function readSlotValue(slotMap, slotId) {
  if (!slotMap || typeof slotMap !== "object") return 0;
  const raw = slotMap[slotId];
  const v = typeof raw === "number" ? raw : parseFloat(raw);
  return Number.isFinite(v) ? v : 0;
}

/** True when the cost_detail entity exists in the given states bag. */
export function isCardReady(states, costEntityId) {
  return !!states?.[costEntityId];
}

export function offerLabel(offer) {
  if (offer === "hphc") return "HP/HC";
  if (offer === "base") return "BASE";
  return "TEMPO";
}

/** @param {Record<string, string> | undefined} i18n Card strings from I18N.fr / I18N.en */
export function slotLabel(slotId, offer, i18n) {
  const dash = i18n?.emDash ?? "—";
  if (!slotId) return dash;
  if (offer === "base") return i18n?.slotBase ?? "Base";
  if (offer === "hphc") {
    return slotId.endsWith("_hc") ? (i18n?.slotHc ?? "HC") : (i18n?.slotHp ?? "HP");
  }
  const tempo = {
    bleu_hc: i18n?.slotBleuHc,
    bleu_hp: i18n?.slotBleuHp,
    blanc_hc: i18n?.slotBlancHc,
    blanc_hp: i18n?.slotBlancHp,
    rouge_hc: i18n?.slotRougeHc,
    rouge_hp: i18n?.slotRougeHp,
    unknown: i18n?.slotUnknown,
  };
  return tempo[slotId] ?? slotId;
}

/** @param {Record<string, string> | undefined} i18n Card strings from I18N.fr / I18N.en */
export function dayColorLabel(v, i18n) {
  const c = String(v ?? "").toLowerCase();
  if (c.includes("blue") || c.includes("bleu")) return i18n?.tempoDayBlue ?? "Blue";
  if (c.includes("white") || c.includes("blanc")) return i18n?.tempoDayWhite ?? "White";
  if (c.includes("red") || c.includes("rouge")) return i18n?.tempoDayRed ?? "Red";
  if (c === "n/a") return i18n?.dayColorNA ?? "N/A";
  return c || (i18n?.emDash ?? "—");
}

export function dayColorClass(v) {
  const c = String(v ?? "").toLowerCase();
  if (c.includes("blue") || c.includes("bleu")) return "color-blue";
  if (c.includes("white") || c.includes("blanc")) return "color-white";
  if (c.includes("red") || c.includes("rouge")) return "color-red";
  return "color-na";
}

export function battChargeSlotRowsFromAttrs(offer, slotMap, i18n) {
  if (!slotMap || typeof slotMap !== "object") return [];
  return SLOTS.map((s) => {
    const raw = slotMap[s.id];
    const v = typeof raw === "number" ? raw : parseFloat(raw);
    if (!Number.isFinite(v) || v <= 0.0001) return null;
    return {
      label: slotLabel(s.id, offer, i18n),
      v,
      color: s.color,
      isHc: s.id.endsWith("_hc"),
    };
  }).filter(Boolean);
}

export function slotMapFingerprint(slotMap) {
  if (!slotMap || typeof slotMap !== "object") return "";
  return SLOTS.map((s) => {
    const raw = slotMap[s.id];
    const v = typeof raw === "number" ? raw : parseFloat(raw);
    return `${s.id}:${Number.isFinite(v) ? v : 0}`;
  }).join(",");
}

