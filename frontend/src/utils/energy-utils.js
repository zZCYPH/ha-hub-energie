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

/**
 * Legacy prefix-based entity map. Kept for backward compatibility in history
 * fetching where explicit entity IDs are required by the HA history API.
 */
export function makeEntityMap(prefix) {
  const p = prefix;
  return {
    cost: `${p}cost_detail`,
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

export function slotLabel(slotId, offer) {
  if (!slotId) return "—";
  if (offer === "base") return "Base";
  if (offer === "hphc") return slotId.endsWith("_hc") ? "HC" : "HP";
  const s = slotId.replace("_", " ").toUpperCase();
  return s.replace("BLEU", "Bleu").replace("BLANC", "Blanc").replace("ROUGE", "Rouge");
}

export function dayColorLabel(v) {
  const c = String(v ?? "").toLowerCase();
  if (c.includes("blue") || c.includes("bleu")) return "Bleu";
  if (c.includes("white") || c.includes("blanc")) return "Blanc";
  if (c.includes("red") || c.includes("rouge")) return "Rouge";
  if (c === "n/a") return "N/A";
  return c || "—";
}

export function dayColorClass(v) {
  const c = String(v ?? "").toLowerCase();
  if (c.includes("blue") || c.includes("bleu")) return "color-blue";
  if (c.includes("white") || c.includes("blanc")) return "color-white";
  if (c.includes("red") || c.includes("rouge")) return "color-red";
  return "color-na";
}

export function battChargeSlotRowsFromAttrs(offer, slotMap) {
  if (!slotMap || typeof slotMap !== "object") return [];
  return SLOTS.map((s) => {
    const raw = slotMap[s.id];
    const v = typeof raw === "number" ? raw : parseFloat(raw);
    if (!Number.isFinite(v) || v <= 0.0001) return null;
    return {
      label: slotLabel(s.id, offer),
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

