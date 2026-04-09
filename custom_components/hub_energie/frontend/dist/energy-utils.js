const d = "#9e9e9e", b = "#8d6e63", m = "#7e57c2", h = "#fdd835", f = "#29b6f6", p = "#66bb6a", a = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), g = (r, e) => {
  const t = parseFloat(r?.[e]?.state);
  return Number.isFinite(t) ? t : 0;
}, w = (r, e, t) => {
  const n = parseFloat(r?.[e]?.attributes?.[t]);
  return Number.isFinite(n) ? n : 0;
}, y = (r, e, t) => {
  const n = r?.[e]?.attributes?.[t];
  if (n == null || n === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, C = (r) => {
  const e = Number(r);
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e3 ? `${(e / 1e3).toFixed(t >= 1e4 ? 0 : 1)} kW` : `${Math.round(e)} W`;
}, O = (r) => {
  const e = Number(r), t = Number.isFinite(e) ? e : 0;
  return t < 1 ? `${Math.round(t * 1e3)} Wh` : `${t.toFixed(2)} kWh`;
}, S = (r) => {
  const t = (r ?? []).map((n) => Number(n)).filter((n) => Number.isFinite(n)).some((n) => n >= 1);
  return (n) => {
    const o = Number(n), s = Number.isFinite(o) ? o : 0;
    return t ? `${s.toFixed(2)} kWh` : `${Math.round(s * 1e3)} Wh`;
  };
}, u = {
  reseau: "mdi:transmission-tower",
  réseau: "mdi:transmission-tower",
  grid: "mdi:transmission-tower",
  solaire: "mdi:weather-sunny",
  solar: "mdi:weather-sunny",
  batterie: "mdi:battery",
  battery: "mdi:battery",
  "surplus pv": "mdi:solar-power-variant",
  "solar surplus": "mdi:solar-power-variant",
  "batt pleine": "mdi:battery-off",
  "battery full": "mdi:battery-off",
  latence: "mdi:timer-sand",
  "switch latency": "mdi:timer-sand",
  autre: "mdi:help-circle-outline",
  other: "mdi:help-circle-outline",
  abonnement: "mdi:calendar-month",
  subscription: "mdi:calendar-month"
};
function k(r) {
  const e = String(r ?? "").toLowerCase();
  for (const [t, n] of Object.entries(u))
    if (e.includes(t)) return n;
  return null;
}
function F(r) {
  const e = String(r ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(e) || /\b(hc|hp)\b/.test(e);
}
function R(r) {
  const e = String(r ?? "").toLowerCase();
  return e.includes(" hc") || e.endsWith("hc") || e.includes("heures creuses") || e.includes("off-peak");
}
function $(r) {
  const t = String(r ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!t) return !1;
  const n = t[1], o = parseInt(n.slice(0, 2), 16), s = parseInt(n.slice(2, 4), 16), i = parseInt(n.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * s + 0.0722 * i) / 255 >= 0.68;
}
function H(r) {
  const e = Math.max(0, Math.round(r)), t = Math.floor(e / 60), n = e % 60;
  return `${t}h ${n}min`;
}
const L = Object.freeze([
  ...a.map((r) => `${r.id}_eur`),
  "abonnement_eur",
  "export_due_to_solar_surplus_kwh",
  "export_due_to_battery_full_or_absent_kwh",
  "export_due_to_switch_latency_kwh",
  "export_unattributed_kwh",
  "export_opportunity_cost_total_eur",
  "export_opportunity_cost_solar_surplus_eur",
  "export_opportunity_cost_battery_full_or_absent_eur",
  "export_opportunity_cost_switch_latency_eur",
  "export_opportunity_cost_unattributed_eur"
]), N = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), c = "sensor.hub_energie_";
function x(r = c) {
  const e = r;
  return {
    cost: `${e}cost_detail`,
    frontendData: `${e}frontend_data`,
    frontendMeta: `${e}frontend_meta`,
    ecoSolar: `${e}savings_solar_eur`,
    ecoBatt: `${e}savings_battery_eur`,
    originGrid: `${e}origin_grid_kwh`,
    originSolar: `${e}origin_solar_kwh`,
    usageGridDirect: `${e}usage_grid_direct_kwh`,
    usageGridBatt: `${e}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${e}usage_solar_direct_kwh`,
    usageSolarBatt: `${e}usage_solar_batt_charge_kwh`,
    usageBattHome: `${e}usage_batt_home_kwh`
  };
}
function B(r, e) {
  if (!r || typeof r != "object") return 0;
  const t = r[e], n = typeof t == "number" ? t : parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}
function T(r, e) {
  return !!r?.[e];
}
function A(r) {
  return r === "hphc" ? "HP/HC" : r === "base" ? "BASE" : "TEMPO";
}
function l(r, e, t) {
  const n = t?.emDash ?? "—";
  return r ? e === "base" ? t?.slotBase ?? "Base" : e === "hphc" ? r.endsWith("_hc") ? t?.slotHc ?? "HC" : t?.slotHp ?? "HP" : {
    bleu_hc: t?.slotBleuHc,
    bleu_hp: t?.slotBleuHp,
    blanc_hc: t?.slotBlancHc,
    blanc_hp: t?.slotBlancHp,
    rouge_hc: t?.slotRougeHc,
    rouge_hp: t?.slotRougeHp,
    unknown: t?.slotUnknown
  }[r] ?? r : n;
}
function W(r, e) {
  const t = String(r ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? e?.tempoDayBlue ?? "Blue" : t.includes("white") || t.includes("blanc") ? e?.tempoDayWhite ?? "White" : t.includes("red") || t.includes("rouge") ? e?.tempoDayRed ?? "Red" : t === "n/a" ? e?.dayColorNA ?? "N/A" : t || (e?.emDash ?? "—");
}
function D(r) {
  const e = String(r ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? "color-blue" : e.includes("white") || e.includes("blanc") ? "color-white" : e.includes("red") || e.includes("rouge") ? "color-red" : "color-na";
}
function E(r, e, t) {
  return !e || typeof e != "object" ? [] : a.map((n) => {
    const o = e[n.id], s = typeof o == "number" ? o : parseFloat(o);
    return !Number.isFinite(s) || s <= 1e-4 ? null : {
      label: l(n.id, r, t),
      v: s,
      color: n.color,
      isHc: n.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function P(r) {
  return !r || typeof r != "object" ? "" : a.map((e) => {
    const t = r[e.id], n = typeof t == "number" ? t : parseFloat(t);
    return `${e.id}:${Number.isFinite(n) ? n : 0}`;
  }).join(",");
}
export {
  O as A,
  p as C,
  a as S,
  B as a,
  g as b,
  h as c,
  b as d,
  m as e,
  L as f,
  N as g,
  y as h,
  F as i,
  k as j,
  $ as k,
  R as l,
  C as m,
  H as n,
  T as o,
  x as p,
  P as q,
  w as r,
  l as s,
  S as t,
  E as u,
  d as v,
  f as w,
  A as x,
  D as y,
  W as z
};
