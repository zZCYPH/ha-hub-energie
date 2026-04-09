import { SLOTS } from "../constants/slots.js";

/** Numeric cost_detail attributes aggregated (summed) across history days. */
export const COST_AGG_ATTRS = Object.freeze([
  ...SLOTS.map((s) => `${s.id}_eur`),
  "abonnement_eur",
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

/** Dict-valued cost_detail attributes aggregated per-key across history days. */
export const COST_AGG_DICT_ATTRS = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh",
]);

/** Default Hub Énergie sensor namespace (entity object_ids follow this prefix). */
export const DEFAULT_HUB_ENTITY_PREFIX = "sensor.hub_energie_";

/**
 * Entity IDs the card reads via the history API and live state (fixed integration namespace).
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
  };
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

