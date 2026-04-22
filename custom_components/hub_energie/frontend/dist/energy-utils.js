function H(e, t) {
  let o = String(e);
  for (const [n, r] of Object.entries(t))
    o = o.split(`{${n}}`).join(String(r));
  return o;
}
const b = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), g = Object.freeze([
  ...b.map((e) => `${e.id}_eur`),
  "abonnement_eur"
]), y = Object.freeze([
  "export_due_to_solar_surplus_kwh",
  "export_due_to_battery_full_or_absent_kwh",
  "export_due_to_switch_latency_kwh",
  "export_unattributed_kwh",
  "export_opportunity_cost_total_eur",
  "export_opportunity_cost_solar_surplus_eur",
  "export_opportunity_cost_battery_full_or_absent_eur",
  "export_opportunity_cost_switch_latency_eur",
  "export_opportunity_cost_unattributed_eur"
]);
Object.freeze([...g, ...y]);
const A = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), m = "sensor.hub_energie_", S = "card_site_index", d = "card_site_segment", w = "hub_energie_card_payload", C = Object.freeze([
  "ecoSolar",
  "ecoBatt",
  "originGrid",
  "originSolar",
  "usageGridDirect",
  "usageGridBatt",
  "usageSolarDirect",
  "usageSolarBatt",
  "usageBattHome"
]);
function p(e = m) {
  const t = e;
  return {
    cost: `${t}cost_detail`,
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`,
    ecoSolar: `${t}savings_solar_eur`,
    ecoBatt: `${t}savings_battery_eur`,
    originGrid: `${t}origin_grid_kwh`,
    originSolar: `${t}origin_solar_kwh`,
    usageGridDirect: `${t}usage_grid_direct_kwh`,
    usageGridBatt: `${t}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${t}usage_solar_direct_kwh`,
    usageSolarBatt: `${t}usage_solar_batt_charge_kwh`,
    usageBattHome: `${t}usage_batt_home_kwh`,
    lovelaceCard: `${t}lovelace_card`
  };
}
function j(e) {
  if (!e) return [];
  const t = /* @__PURE__ */ new Map();
  for (const [o, n] of Object.entries(e)) {
    const r = n?.attributes;
    if (!r || typeof r != "object") continue;
    const i = r.card_entity_ids;
    if (i && typeof i == "object" && i.cost === o) {
      const c = f(n, o) ?? 0, u = r[d], s = typeof u == "string" && u.trim() !== "" ? String(u).trim() : String(c);
      t.set(c, { index: c, segment: s, costEntityId: o });
      continue;
    }
    if (typeof r.eco_solar == "number" && r.grid_by_slot_kwh != null && typeof r.grid_by_slot_kwh == "object") {
      const c = f(n, o) ?? 0;
      if (t.has(c)) continue;
      const u = r[d], s = typeof u == "string" && u.trim() !== "" ? String(u).trim() : String(c);
      t.set(c, { index: c, segment: s, costEntityId: o });
    }
  }
  return [...t.values()].sort((o, n) => o.index - n.index);
}
function k(e) {
  return j(e).length;
}
function T(e) {
  if (typeof e != "string" || !e.startsWith("sensor.")) return null;
  const t = e.slice(7), o = /^hub_energie_(\d+)_/.exec(t);
  if (!o) return null;
  const n = parseInt(o[1], 10);
  return Number.isFinite(n) ? n : null;
}
function f(e, t) {
  const o = e?.attributes;
  if (o && typeof o == "object") {
    const n = o[S];
    if (typeof n == "number" && Number.isFinite(n)) return Math.trunc(n);
  }
  return T(t);
}
function x(e, t) {
  const n = p().cost;
  if (!e) return n;
  const r = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [s, l] of Object.entries(e)) {
    const a = l?.attributes;
    if (!a || typeof a != "object") continue;
    const _ = a.card_entity_ids;
    if (!_ || typeof _ != "object" || _.cost !== s) continue;
    const h = f(l, s) ?? 0;
    r !== null && h !== r || i.push(s);
  }
  if (i.length === 1) return i[0];
  if (i.length > 1) return [...i].sort()[0];
  if (r === null && e[n]?.attributes) return n;
  const c = [];
  for (const [s, l] of Object.entries(e)) {
    const a = l?.attributes;
    if (!(!a || typeof a != "object") && typeof a.eco_solar == "number" && a.grid_by_slot_kwh != null && typeof a.grid_by_slot_kwh == "object") {
      const _ = f(l, s);
      if (r !== null && _ !== null && _ !== r || r !== null && _ === null) continue;
      c.push(s);
    }
  }
  if (c.length >= 1) return [...c].sort()[0];
  const u = k(e);
  return r === null && u <= 1 && e[n], n;
}
function B(e, t) {
  const n = p().lovelaceCard;
  if (!e) return n;
  const r = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [c, u] of Object.entries(e)) {
    const s = u?.attributes;
    if (!s || typeof s != "object" || s[w] !== !0) continue;
    const l = f(u, c) ?? 0;
    r !== null && l !== r || i.push(c);
  }
  return i.length === 1 ? i[0] : i.length > 1 ? [...i].sort()[0] : n;
}
function E(e, t, o) {
  const n = { ...t, cost: o }, r = e?.card_entity_ids;
  if (!r || typeof r != "object") return n;
  for (const i of C) {
    const c = r[i];
    typeof c == "string" && c.includes(".") && (n[i] = c);
  }
  return typeof r.lovelaceCard == "string" && r.lovelaceCard.includes(".") && (n.lovelaceCard = r.lovelaceCard), n;
}
function D(e, t) {
  return { ...t && typeof t == "object" ? t : {}, ...e && typeof e == "object" ? e : {} };
}
function v(e, t) {
  if (!e || typeof e != "object") return 0;
  const o = e[t], n = typeof o == "number" ? o : parseFloat(o);
  return Number.isFinite(n) ? n : 0;
}
function O(e, t) {
  return !!e?.[t];
}
function F(e) {
  return e === "hphc" ? "HP/HC" : e === "base" ? "BASE" : "TEMPO";
}
function R(e, t, o) {
  const n = o?.emDash ?? "—";
  return e ? t === "base" ? o?.slotBase ?? "Base" : t === "hphc" ? e.endsWith("_hc") ? o?.slotHc ?? "HC" : o?.slotHp ?? "HP" : {
    bleu_hc: o?.slotBleuHc,
    bleu_hp: o?.slotBleuHp,
    blanc_hc: o?.slotBlancHc,
    blanc_hp: o?.slotBlancHp,
    rouge_hc: o?.slotRougeHc,
    rouge_hp: o?.slotRougeHp,
    unknown: o?.slotUnknown
  }[e] ?? e : n;
}
function $(e, t) {
  const o = String(e ?? "").toLowerCase();
  return o.includes("blue") || o.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : o.includes("white") || o.includes("blanc") ? t?.tempoDayWhite ?? "White" : o.includes("red") || o.includes("rouge") ? t?.tempoDayRed ?? "Red" : o === "n/a" ? t?.dayColorNA ?? "N/A" : o || (t?.emDash ?? "—");
}
function N(e) {
  const t = String(e ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function G(e, t, o) {
  return !t || typeof t != "object" ? [] : b.map((n) => {
    const r = t[n.id], i = typeof r == "number" ? r : parseFloat(r);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: R(n.id, e, o),
      v: i,
      color: n.color,
      isHc: n.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function M(e) {
  return !e || typeof e != "object" ? "" : b.map((t) => {
    const o = e[t.id], n = typeof o == "number" ? o : parseFloat(o);
    return `${t.id}:${Number.isFinite(n) ? n : 0}`;
  }).join(",");
}
export {
  g as C,
  b as S,
  y as a,
  A as b,
  B as c,
  x as d,
  E as e,
  w as f,
  M as g,
  j as h,
  O as i,
  G as j,
  N as k,
  $ as l,
  D as m,
  p as n,
  F as o,
  v as r,
  R as s,
  H as t
};
