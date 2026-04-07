import { i as st, a as nt, b as m, A as x, w as gt, I as Xt, t as j } from "./hub-energie-card-editor.js";
const Ut = "#9e9e9e", ie = "#8d6e63", kt = "#7e57c2", Y = "#fdd835", ae = "#29b6f6", J = "#66bb6a", Wt = [24, 12, 6, 3, 1], it = 6;
function $t(i, t = it) {
  if (!Number.isFinite(i)) return t;
  const e = Math.trunc(i);
  return Wt.includes(e) ? e : Wt.reduce(
    (r, o) => Math.abs(o - e) < Math.abs(r - e) ? o : r,
    t
  );
}
const at = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), Ht = "Europe/Paris";
function ee(i = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Ht,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(i);
}
const H = () => ee();
function V(i) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), o = Number(t[2]), a = Number(t[3]), s = Date.UTC(r, o - 1, a - 1, 18, 0, 0), l = Date.UTC(r, o - 1, a + 1, 6, 0, 0), c = new Intl.DateTimeFormat("en-CA", {
    timeZone: Ht,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let d = s; d <= l; d += 6e4) {
    const p = c.formatToParts(new Date(d)), h = (f) => p.find((_) => _.type === f)?.value ?? "";
    if (`${h("year")}-${h("month")}-${h("day")}` === e && h("hour") === "00" && h("minute") === "00" && h("second") === "00")
      return new Date(d);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function Mt(i, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(i));
  if (!e) return H();
  const r = Number(e[1]), o = Number(e[2]), a = Number(e[3]);
  return new Date(Date.UTC(r, o - 1, a + t)).toISOString().slice(0, 10);
}
function se(i) {
  const t = V(i).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: Ht,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const ne = (i) => ee(new Date(i));
function le(i, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(i)) ? String(i) : H();
  let o;
  if (t === "week") {
    const a = se(r);
    o = Mt(r, -a);
  } else t === "month" ? o = `${r.slice(0, 7)}-01` : t === "year" ? o = `${r.slice(0, 4)}-01-01` : o = r;
  return { startIso: o, endIso: r };
}
function Ot(i, t) {
  const e = V(i);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: Ht,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(i);
}
function ce(i, t, e) {
  return i === t ? Ot(t, e) : `${Ot(i, e)} - ${Ot(t, e)}`;
}
const W = (i, t) => {
  const e = parseFloat(i?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, A = (i, t, e) => {
  const r = parseFloat(i?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, E = (i, t, e) => {
  const r = i?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const o = Number(r);
  return Number.isFinite(o) ? o : null;
}, P = (i) => {
  const t = Number(i);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, pe = (i) => {
  const t = Number(i), e = Number.isFinite(t) ? t : 0;
  return e < 1 ? `${Math.round(e * 1e3)} Wh` : `${e.toFixed(2)} kWh`;
}, _t = (i) => {
  const e = (i ?? []).map((r) => Number(r)).filter((r) => Number.isFinite(r)).some((r) => r >= 1);
  return (r) => {
    const o = Number(r), a = Number.isFinite(o) ? o : 0;
    return e ? `${a.toFixed(2)} kWh` : `${Math.round(a * 1e3)} Wh`;
  };
}, de = {
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
function he(i) {
  const t = String(i ?? "").toLowerCase();
  for (const [e, r] of Object.entries(de))
    if (t.includes(e)) return r;
  return null;
}
function ue(i) {
  const t = String(i ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function ge(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function be(i) {
  const e = String(i ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], o = parseInt(r.slice(0, 2), 16), a = parseInt(r.slice(2, 4), 16), s = parseInt(r.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * a + 0.0722 * s) / 255 >= 0.68;
}
function qt(i) {
  const t = Math.max(0, Math.round(i)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
const Zt = Object.freeze([
  ...at.map((i) => `${i.id}_eur`),
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
]), Yt = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), me = "sensor.hub_energie_";
function fe(i = me) {
  const t = i;
  return {
    cost: `${t}cost_detail`,
    ecoSolar: `${t}savings_solar_eur`,
    ecoBatt: `${t}savings_battery_eur`,
    originGrid: `${t}origin_grid_kwh`,
    originSolar: `${t}origin_solar_kwh`,
    usageGridDirect: `${t}usage_grid_direct_kwh`,
    usageGridBatt: `${t}usage_grid_batt_charge_kwh`,
    usageSolarDirect: `${t}usage_solar_direct_kwh`,
    usageSolarBatt: `${t}usage_solar_batt_charge_kwh`,
    usageBattHome: `${t}usage_batt_home_kwh`
  };
}
function It(i, t) {
  if (!i || typeof i != "object") return 0;
  const e = i[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function At(i, t) {
  return !!i?.[t];
}
function we(i) {
  return i === "hphc" ? "HP/HC" : i === "base" ? "BASE" : "TEMPO";
}
function I(i, t, e) {
  const r = e?.emDash ?? "—";
  return i ? t === "base" ? e?.slotBase ?? "Base" : t === "hphc" ? i.endsWith("_hc") ? e?.slotHc ?? "HC" : e?.slotHp ?? "HP" : {
    bleu_hc: e?.slotBleuHc,
    bleu_hp: e?.slotBleuHp,
    blanc_hc: e?.slotBlancHc,
    blanc_hp: e?.slotBlancHp,
    rouge_hc: e?.slotRougeHc,
    rouge_hp: e?.slotRougeHp,
    unknown: e?.slotUnknown
  }[i] ?? i : r;
}
function xe(i, t) {
  const e = String(i ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function Jt(i) {
  const t = String(i ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function Qt(i, t, e) {
  return !t || typeof t != "object" ? [] : at.map((r) => {
    const o = t[r.id], a = typeof o == "number" ? o : parseFloat(o);
    return !Number.isFinite(a) || a <= 1e-4 ? null : {
      label: I(r.id, i, e),
      v: a,
      color: r.color,
      isHc: r.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function Lt(i) {
  return !i || typeof i != "object" ? "" : at.map((t) => {
    const e = i[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
function ye(i, t, e) {
  const r = i, o = r?.[t.cost]?.attributes ?? {}, a = String(o.offer ?? "tempo").toLowerCase(), s = String(o.contract_power ?? ""), l = String(o.current_slot ?? ""), c = o.tempo_days ?? null, d = o.today_color ?? null, p = o.tomorrow_color ?? null, h = {
    solarSurplus: A(r, t.cost, "export_due_to_solar_surplus_kwh"),
    batteryFull: A(r, t.cost, "export_due_to_battery_full_or_absent_kwh"),
    switchLatency: A(r, t.cost, "export_due_to_switch_latency_kwh"),
    unattributed: A(r, t.cost, "export_unattributed_kwh"),
    oppTotalEur: A(r, t.cost, "export_opportunity_cost_total_eur"),
    oppSolarEur: A(r, t.cost, "export_opportunity_cost_solar_surplus_eur"),
    oppBatteryEur: A(r, t.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
    oppLatencyEur: A(r, t.cost, "export_opportunity_cost_switch_latency_eur"),
    oppOtherEur: A(r, t.cost, "export_opportunity_cost_unattributed_eur")
  }, g = o.grid_by_slot_kwh, f = o.maison_by_slot_kwh, _ = at.map((k) => ({
    ...k,
    label: I(k.id, a, e),
    v: It(g, k.id),
    isHc: k.id.endsWith("_hc")
  })), u = at.map((k) => ({
    ...k,
    label: I(k.id, a, e),
    v: It(f, k.id),
    isHc: k.id.endsWith("_hc")
  })), L = W(r, t.cost), v = at.map((k) => ({
    ...k,
    label: I(k.id, a, e),
    v: A(r, t.cost, `${k.id}_eur`),
    tooltip: `${It(g, k.id).toFixed(3)} kWh`,
    isHc: k.id.endsWith("_hc")
  })), B = A(r, t.cost, "abonnement_eur"), w = W(r, t.ecoSolar), y = W(r, t.ecoBatt), S = W(r, t.originGrid), $ = W(r, t.originSolar), b = {
    gridDirect: { label: e.usageGridDirect, v: W(r, t.usageGridDirect), color: kt },
    gridBatt: { label: e.usageGridBatt, v: W(r, t.usageGridBatt), color: ie },
    solarDirect: { label: e.usageSolarDirect, v: W(r, t.usageSolarDirect), color: Y },
    solarBatt: { label: e.usageSolarBatt, v: W(r, t.usageSolarBatt), color: "#fbc02d" },
    battHome: { label: e.usageBattHome, v: W(r, t.usageBattHome), color: J }
  };
  return {
    grid: _,
    maison: u,
    totalEur: L,
    costs: v,
    abo: B,
    ecoSolar: w,
    ecoBatt: y,
    og: S,
    os: $,
    usage: b,
    costEntityOk: !!r[t.cost],
    offer: a,
    contractPower: s,
    currentSlot: l,
    tempoDays: c,
    todayColor: d,
    tomorrowColor: p,
    reinj: h,
    gridBattBySlot: o.usage_grid_batt_charge_by_slot_kwh,
    solarBattBySlot: o.usage_solar_batt_charge_by_slot_kwh
  };
}
async function _e(i, t, e, r, o) {
  const a = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : H(), s = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : H();
  let l = V(a), c = V(Mt(s, 1));
  Number.isFinite(l.getTime()) || (l = V(H())), Number.isFinite(c.getTime()) || (c = V(Mt(H(), 1)));
  const d = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: c.toISOString()
  }), p = `history/period/${encodeURIComponent(l.toISOString())}?${d}`, h = await i.callApi("GET", p), g = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), L = new Set(r);
  for (const y of Array.isArray(h) ? h : [])
    if (Array.isArray(y))
      for (const S of y) {
        const $ = S?.entity_id;
        if (!$ || !L.has($)) continue;
        const b = Date.parse(S?.last_changed ?? S?.last_updated ?? "");
        if (!Number.isFinite(b)) continue;
        const k = ne(b), R = parseFloat(S?.state);
        if (Number.isFinite(R)) {
          g.has($) || g.set($, /* @__PURE__ */ new Map());
          const T = g.get($), M = T.get(k);
          (!M || b >= M.ts) && T.set(k, { ts: b, v: R });
        }
        if ($ === o && S?.attributes && typeof S.attributes == "object") {
          for (const T of Zt) {
            const M = parseFloat(S.attributes?.[T]);
            if (!Number.isFinite(M)) continue;
            f.has(T) || f.set(T, /* @__PURE__ */ new Map());
            const N = f.get(T), G = N.get(k);
            (!G || b >= G.ts) && N.set(k, { ts: b, v: M });
          }
          for (const T of Yt) {
            const M = S.attributes?.[T];
            if (!M || typeof M != "object") continue;
            _.has(T) || _.set(T, /* @__PURE__ */ new Map());
            const N = _.get(T), G = N.get(k);
            (!G || b >= G.ts) && N.set(k, { ts: b, dict: M });
          }
        }
        const C = u.get($);
        (!C || b > C.ts) && u.set($, { ts: b, state: S });
      }
  const v = (y) => [...y?.values() ?? []].reduce((S, $) => S + ($?.v ?? 0), 0), B = (y) => {
    if (!y) return {};
    const S = {};
    for (const $ of y.values())
      if (!(!$?.dict || typeof $.dict != "object"))
        for (const [b, k] of Object.entries($.dict)) {
          const R = typeof k == "number" ? k : parseFloat(k);
          Number.isFinite(R) && (S[b] = (S[b] ?? 0) + R);
        }
    return S;
  }, w = {};
  for (const y of L) {
    const $ = { ...u.get(y)?.state?.attributes ?? {} };
    if (y === o) {
      for (const b of Zt) $[b] = v(f.get(b));
      for (const b of Yt) $[b] = B(_.get(b));
    }
    w[y] = {
      entity_id: y,
      state: String(v(g.get(y))),
      attributes: $
    };
  }
  return w;
}
function ve(i, t, e) {
  if (!i?.[t]) return null;
  const r = E(i, t, "grid_power_signed_w"), o = E(i, t, "solar_power_w") ?? E(i, t, "solar_estimate_power_w"), a = E(i, t, "batt_discharge_power_w"), s = E(i, t, "batt_charge_power_w"), l = E(i, t, "load_power_w"), c = E(i, t, "export_power_w"), d = [];
  return r != null ? d.push(r >= 0 ? `${e.segImport} ${r.toFixed(0)} W` : `${e.segExport} ${Math.abs(r).toFixed(0)} W`) : c != null && c > 0 && d.push(`${e.segExport} ${c.toFixed(0)} W`), o != null && d.push(`${e.segSolar} ${o.toFixed(0)} W`), a != null && a > 0 && d.push(`${e.segBattDis} ${a.toFixed(0)} W`), s != null && s > 0 && d.push(`${e.segBattChg} ${s.toFixed(0)} W`), {
    gridSigned: r,
    solar: o,
    battDis: a,
    battChg: s,
    load: l,
    exportW: c,
    tooltip: [e.powerBarTip, d.length ? d.join(" · ") : ""].filter(Boolean).join(" — ")
  };
}
function $e(i, t) {
  const e = E(i, t, "battery_capacity_kwh"), r = E(i, t, "battery_soc_percent");
  if (e == null || e <= 0 || r == null) return null;
  const o = E(i, t, "battery_soc_min_percent"), a = E(i, t, "battery_soc_max_percent");
  return {
    soc: r,
    socMin: o ?? 0,
    socMax: a ?? 100,
    capacity: e,
    available: E(i, t, "battery_available_kwh"),
    chargeW: E(i, t, "batt_charge_power_w"),
    dischargeW: E(i, t, "batt_discharge_power_w")
  };
}
function Nt(...i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i)
    for (const r of e) t.add(r);
  return [...t].sort((e, r) => e - r);
}
function Z(i, t) {
  let e = 0, r = null;
  const o = [];
  for (const a of t) {
    for (; e < i.length && i[e].ts <= a; )
      r = i[e].w, e++;
    o.push(r);
  }
  return o;
}
function ke(i) {
  if (typeof i == "number" && Number.isFinite(i)) return i;
  if (typeof i == "string") {
    const t = Date.parse(i);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}
function bt(i, t = {}) {
  const e = !!t.allowNegative;
  if (!Array.isArray(i) || !i.length) return [];
  const r = [];
  for (const o of i) {
    const a = ke(o?.start), s = o?.mean ?? o?.state ?? o?.min ?? o?.max;
    if (!Number.isFinite(a) || s == null) continue;
    const l = parseFloat(s);
    if (!Number.isFinite(l)) continue;
    const c = e ? l : Math.max(0, l);
    r.push({ ts: a, w: c });
  }
  return r.sort((o, a) => o.ts - a.ts), r;
}
function Se(i) {
  if (!i || typeof i != "object") return [];
  const t = /* @__PURE__ */ new Set(), e = [], r = (o) => {
    if (o == null || typeof o != "string") return;
    const a = o.trim();
    !a || t.has(a) || (t.add(a), e.push(a));
  };
  for (const o of i.grid_entities ?? [])
    typeof o == "string" && r(o);
  r(i.solar_entity);
  for (const o of i.batteries ?? [])
    o?.mode === "net" ? r(o.entity) : o?.mode === "in_out" && (r(o.in), r(o.out));
  return r(i.load_entity), e;
}
async function Fe(i, { startTimeIso: t, endTimeIso: e, statisticIds: r, period: o = "5minute" }) {
  const a = i?.connection;
  if (!a?.sendMessagePromise)
    throw new Error("Home Assistant WebSocket not available");
  const s = await a.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: t,
    end_time: e,
    statistic_ids: r,
    period: o,
    types: ["mean", "state"]
  });
  if (s && typeof s == "object" && s.success === !1)
    throw new Error(s.error?.message ?? "recorder/statistics_during_period failed");
  if (s && typeof s == "object" && "result" in s && s.result !== void 0 && !Array.isArray(s.result)) {
    const l = s.result;
    if (l && typeof l == "object") return l;
  }
  return s;
}
function Te(i, t) {
  const e = i.grid_entities;
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const s of e) {
    const l = typeof s == "string" ? s.trim() : "";
    l && r.push(bt(t[l], { allowNegative: !0 }));
  }
  if (!r.length) return [];
  const o = Nt(...r.map((s) => s.map((l) => l.ts)));
  let a = o.map(() => 0);
  for (const s of r) {
    const l = Z(s, o);
    a = a.map((c, d) => c + (l[d] ?? 0));
  }
  return o.map((s, l) => ({ ts: s, w: a[l] }));
}
function Be(i, t) {
  const e = i.batteries ?? [];
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const s of e)
    if (s?.mode === "net" && s.entity) {
      const l = String(s.entity), c = bt(t[l], { allowNegative: !0 }).map((d) => {
        const p = s.net_sign === "positive_charge" ? -d.w : d.w;
        return { ts: d.ts, w: p };
      });
      r.push(c);
    } else if (s?.mode === "in_out") {
      const l = s.in ? String(s.in) : "", c = s.out ? String(s.out) : "", d = l ? bt(t[l]) : [], p = c ? bt(t[c]) : [], h = Nt(
        d.map((_) => _.ts),
        p.map((_) => _.ts)
      );
      if (!h.length) {
        r.push([]);
        continue;
      }
      const g = d.length ? Z(d, h) : h.map(() => null), f = p.length ? Z(p, h) : h.map(() => null);
      r.push(
        h.map((_, u) => ({
          ts: _,
          w: (f[u] ?? 0) - (g[u] ?? 0)
        }))
      );
    }
  if (!r.length) return [];
  const o = Nt(...r.map((s) => s.map((l) => l.ts)));
  let a = o.map(() => 0);
  for (const s of r) {
    if (!s.length) continue;
    const l = Z(s, o);
    a = a.map((c, d) => c + (l[d] ?? 0));
  }
  return o.map((s, l) => ({ ts: s, w: a[l] }));
}
function Ge(i, t) {
  if (!i || typeof i != "object" || !t || typeof t != "object") return null;
  const e = typeof i.solar_entity == "string" ? i.solar_entity.trim() : "", r = typeof i.load_entity == "string" ? i.load_entity.trim() : "", o = Te(i, t), a = e ? bt(t[e]) : [], s = Be(i, t), l = r ? bt(t[r]) : [], c = Nt(
    o.map((w) => w.ts),
    a.map((w) => w.ts),
    s.map((w) => w.ts),
    l.map((w) => w.ts)
  );
  if (!c.length) return null;
  const d = o.length ? Z(o, c) : c.map(() => null), p = a.length ? Z(a, c) : c.map(() => null), h = s.length ? Z(s, c) : c.map(() => null), g = l.length ? Z(l, c) : c.map(() => null), f = c.map((w, y) => ({
    ts: w,
    grid: d[y],
    solar: p[y],
    batt: h[y],
    load: g[y]
  }));
  if (!f.some((w) => w.grid != null || w.solar != null || w.batt != null || w.load != null))
    return null;
  let _ = 0, u = 0, L = 0, v = l.length ? 0 : null;
  const B = [];
  for (const w of f)
    w.grid != null && (_ = w.grid), w.solar != null && (u = w.solar), w.batt != null && (L = w.batt), l.length && w.load != null && (v = w.load), B.push({ ts: w.ts, grid: _, solar: u, batt: L, load: l.length ? v : null });
  return { filled: B };
}
function Le(i) {
  let t = 0, e = 1;
  for (const r of i) {
    const o = [];
    r.load != null && Number.isFinite(r.load) && o.push(r.load), r.solar != null && Number.isFinite(r.solar) && o.push(r.solar);
    const a = r.batt;
    a != null && Number.isFinite(a) && o.push(Math.max(0, a), Math.max(0, -a)), r.grid != null && Number.isFinite(r.grid) && o.push(r.grid);
    for (const s of o)
      t = Math.min(t, s), e = Math.max(e, s);
  }
  return e - t < 1 && (e = t + 1), { yMin: t, yMax: e };
}
function Me(i, t) {
  if (!i?.states || !t || typeof t != "object") return null;
  const e = i.states, r = (f) => {
    if (f == null || typeof f != "string") return null;
    const _ = f.trim();
    if (!_ || !e[_]) return null;
    const u = parseFloat(e[_].state);
    return Number.isFinite(u) ? u : null;
  };
  let o = 0, a = 0;
  for (const f of t.grid_entities ?? []) {
    if (typeof f != "string") continue;
    const _ = r(f);
    _ != null && (o += _, a++);
  }
  const s = typeof t.solar_entity == "string" ? t.solar_entity.trim() : "", l = s ? r(s) : null, c = l != null ? Math.max(0, l) : null, d = typeof t.load_entity == "string" ? t.load_entity.trim() : "", p = d ? r(d) : null;
  let h = 0, g = 0;
  for (const f of t.batteries ?? [])
    if (f?.mode === "net" && f.entity) {
      const _ = r(String(f.entity));
      if (_ != null) {
        const u = f.net_sign === "positive_charge" ? -_ : _;
        h += u, g++;
      }
    } else if (f?.mode === "in_out") {
      const _ = f.in ? r(String(f.in)) : null, u = f.out ? r(String(f.out)) : null;
      (_ != null || u != null) && (h += (u ?? 0) - (_ ?? 0), g++);
    }
  return !a && c == null && !g && p == null ? null : {
    solar: c,
    batt: g > 0 ? h : null,
    grid: a > 0 ? o : null,
    load: p
  };
}
function Ne(i, t) {
  if (!i?.length) return [];
  if (!t) return i;
  const e = i[i.length - 1], o = {
    ts: Math.max(Date.now(), e.ts + 1),
    solar: t.solar != null ? t.solar : e.solar ?? 0,
    batt: t.batt != null ? t.batt : e.batt ?? 0,
    grid: t.grid != null ? t.grid : e.grid ?? 0,
    load: t.load != null ? t.load : e.load != null ? e.load : null
  };
  return [...i, o];
}
class He extends st {
  static get properties() {
    return {
      title: { type: String },
      segments: { attribute: !1 },
      total: { type: Number },
      formatter: { attribute: !1 },
      unit: { type: String },
      tooltip: { type: String },
      breakdown: { attribute: !1 },
      showBreakdown: { type: Boolean },
      displayValue: { type: String },
      fillPercent: { type: Number },
      emptyLabel: { type: String }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
      }
      .cons-strip {
        margin-bottom: 7px;
      }
      .cons-strip:last-child {
        margin-bottom: 0;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .empty {
        font-size: 0.72rem;
        opacity: 0.55;
        margin: 4px 0 0;
      }
      .bar-wrap {
        position: relative;
        margin-bottom: 2px;
      }
      .track {
        border-radius: 8px;
        min-width: 48px;
        height: 24px;
        background: var(--divider-color);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        overflow: hidden;
      }
      .fill-stack {
        position: relative;
        height: 100%;
        display: flex;
        border-radius: 8px;
        overflow: hidden;
      }
      .fill-seg {
        height: 100%;
        display: inline-block;
      }
      .fill-hc {
        background-image: repeating-linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.35) 0px,
          rgba(255, 255, 255, 0.35) 4px,
          transparent 4px,
          transparent 8px
        );
      }
      .bar-total {
        position: absolute;
        left: 4px;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: none;
        z-index: 2;
      }
      .bar-total::before,
      .bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .bar-total-text {
        font-size: 0.66rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 1px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-item ha-icon {
        --mdc-icon-size: 10px;
        opacity: 0.85;
        flex-shrink: 0;
      }
      .icon-brk-item b {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        max-height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 9px;
        color: #fff;
        opacity: 1;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
        pointer-events: none;
      }
      .icon-brk-swatch.swatch-icon-dark ha-icon {
        color: #111;
        filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.7));
      }
      .icon-brk-pct {
        opacity: 0.6;
        margin-left: 1px;
      }
    `;
  }
  constructor() {
    super(), this.title = "", this.segments = [], this.total = 0, this.formatter = (t) => String(t), this.unit = "", this.tooltip = "", this.breakdown = [], this.showBreakdown = !0, this.displayValue = "", this.fillPercent = 100, this.emptyLabel = "";
  }
  _renderStackedFill(t) {
    const e = (t ?? []).filter((o) => Number(o?.value) > 1e-3), r = e.reduce((o, a) => o + Number(a.value), 0) || 1;
    return e.map((o) => m`
      <span
        class="fill-seg ${o.className ?? ""}"
        style="width:${(Number(o.value) / r * 100).toFixed(1)}%;background-color:${o.color}"
      ></span>
    `);
  }
  _renderBreakdown() {
    const t = this.breakdown ?? [];
    if (!this.showBreakdown || !t.length) return x;
    const e = Number(this.total) || 0;
    return m`
      <div class="icon-brk">
        ${t.map((r) => {
      const o = r.icon ?? (ue(r.label) ? "mdi:transmission-tower" : he(r.label)), a = be(r.color) ? "swatch-icon-dark" : "";
      return m`
            <span class="icon-brk-item">
              ${r.color ? m`<span
                    class="icon-brk-swatch ${ge(r.label) ? "fill-hc" : ""} ${a}"
                    style="background-color:${r.color}"
                  >
                    ${o ? m`<ha-icon icon=${o}></ha-icon>` : x}
                  </span>` : o ? m`<ha-icon icon=${o}></ha-icon>` : x}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? m`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : x}
            </span>
          `;
    })}
      </div>
    `;
  }
  _displayTotal() {
    return this.displayValue ? this.displayValue : typeof this.formatter == "function" ? this.formatter(this.total) : this.unit ? `${Number(this.total).toFixed(2)} ${this.unit}` : String(this.total);
  }
  render() {
    const t = (this.segments ?? []).filter((r) => Number(r?.value) > 1e-3);
    if (!t.length)
      return m`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    const e = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return m`
      <div class="cons-strip">
        <div class="cons-strip-cap">${this.title}</div>
        <div class="bar-wrap" title=${this.tooltip || x}>
          <div class="track">
            <div class="fill-stack" style="width:${e.toFixed(1)}%">
              ${this._renderStackedFill(t)}
            </div>
          </div>
          <div class="bar-total">
            <span class="bar-total-text">${this._displayTotal()}</span>
          </div>
        </div>
        ${this._renderBreakdown()}
      </div>
    `;
  }
}
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", He);
class De extends st {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      /** When true, power history panel is open (for aria-expanded). */
      graphOpen: { type: Boolean }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
      }
      .power-now-wrap {
        margin: 0 0 6px;
        padding: 4px 6px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        font-size: 0.68rem;
        min-width: 0;
      }
      .power-now-wrap[role="button"] {
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .power-now-wrap[role="button"]:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--primary-color) 65%, transparent);
        outline-offset: 2px;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .pnl-wrap {
        position: relative;
      }
      .pnl-bar {
        width: 100%;
        height: 20px;
        display: flex;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .pnl-seg {
        height: 100%;
        min-width: 2px;
        transition: width 0.2s ease;
      }
      .pnl-load-overlay {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.73rem;
        font-weight: 800;
        white-space: nowrap;
        pointer-events: none;
        z-index: 2;
        color: #fff;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 4px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 8px;
        color: #fff;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.data = null, this.graphOpen = !1;
  }
  _emitToggle() {
    this.dispatchEvent(
      new CustomEvent("hub-power-now-toggle", {
        bubbles: !0,
        composed: !0
      })
    );
  }
  _onKeyDown(t) {
    (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this._emitToggle());
  }
  render() {
    const t = this.data;
    if (t == null) return x;
    const e = t.gridSigned != null ? Math.max(0, t.gridSigned) : 0, r = [];
    t.gridSigned != null && e > 0 && r.push({ w: e, c: kt, t: `${this.i18n.segImport} +${P(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: J, t: `${this.i18n.segBattDis} +${P(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: Y, t: `${this.i18n.segSolar} ${P(t.solar)}` });
    const o = r.reduce((p, h) => p + h.w, 0), a = t.gridSigned != null ? P(t.gridSigned) : t.exportW != null && t.exportW > 0 ? P(-t.exportW) : "—", s = t.solar != null ? P(t.solar) : "—", l = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, c = l != null ? P(l) : "—", d = t.load != null ? P(t.load) : "—";
    return m`
      <div
        class="power-now-wrap"
        role="button"
        tabindex="0"
        aria-label=${this.i18n?.powerNowAria ?? this.i18n?.powerNow ?? "Power now"}
        aria-expanded=${this.graphOpen ? "true" : "false"}
        @click=${this._emitToggle}
        @keydown=${this._onKeyDown}
      >
        <div class="cons-strip-cap">${this.i18n.powerNow}</div>
        <div class="pnl-wrap">
          <div class="pnl-bar" title=${t.tooltip}>
            ${o > 1 ? r.map((p) => m`
                  <span
                    class="pnl-seg"
                    style="width:${(p.w / o * 100).toFixed(1)}%;background:${p.c}"
                    title=${p.t}
                  ></span>
                `) : m`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${d} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${kt}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${a}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${Y}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${s}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || x}>
            <span class="icon-brk-swatch" style="background-color:${J}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${c}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", De);
class Pe extends st {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      /** kWh split: { segments: [{ label, value, color, icon? }], total, formatter, tooltip } */
      kwhData: { attribute: !1 }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .cons-strip {
        margin-bottom: 7px;
      }
      .cons-strip:last-child {
        margin-bottom: 0;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .bar-wrap {
        position: relative;
        margin-bottom: 2px;
      }
      .track {
        border-radius: 8px;
        min-width: 48px;
        height: 24px;
        background: var(--divider-color);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        overflow: hidden;
      }
      .fill-stack {
        position: relative;
        height: 100%;
        display: flex;
        border-radius: 8px;
        overflow: hidden;
      }
      .fill-seg {
        height: 100%;
        display: inline-block;
        min-width: 2px;
        transition: width 0.2s ease;
      }
      .bar-total {
        position: absolute;
        left: 4px;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: none;
        z-index: 2;
      }
      .bar-total::before,
      .bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .bar-total-text {
        font-size: 0.66rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 1px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 8px;
        color: #fff;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
      }
      .icon-brk-pct {
        opacity: 0.6;
        margin-left: 1px;
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.kwhData = null;
  }
  render() {
    const t = this.kwhData;
    if (t?.segments?.length && t.total > 5e-4) {
      const e = t.formatter ?? ((o) => String(o)), r = t.segments.filter((o) => Number(o.value) > 5e-4);
      return r.length ? m`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.i18n.solarProdTitle}</div>
          <div class="bar-wrap" title=${t.tooltip ?? x}>
            <div class="track">
              <div class="fill-stack" style="width:100%">
                ${r.map(
        (o) => m`
                    <span
                      class="fill-seg"
                      style="width:${(Number(o.value) / t.total * 100).toFixed(1)}%;background-color:${o.color}"
                      title=${`${o.label}: ${e(o.value)}`}
                    ></span>
                  `
      )}
              </div>
            </div>
            <div class="bar-total">
              <span class="bar-total-text">${e(t.total)}</span>
            </div>
          </div>
          <div class="icon-brk">
            ${r.map(
        (o) => m`
                <span class="icon-brk-item">
                  <span class="icon-brk-swatch" style="background-color:${o.color}">
                    ${o.icon ? m`<ha-icon icon=${o.icon}></ha-icon>` : x}
                  </span>
                  <span>${o.label}</span>&nbsp;<b>${e(o.value)}</b>
                  ${t.total > 0 ? m`<span class="icon-brk-pct"
                        >(${Math.round(Number(o.value) / t.total * 100)}%)</span
                      >` : x}
                </span>
              `
      )}
          </div>
        </div>
      ` : x;
    }
    return x;
  }
}
customElements.get("hub-solar-production-bar") || customElements.define("hub-solar-production-bar", Pe);
const Ce = 100, Ee = 12, Re = 168;
function je(i, t, e, r) {
  const o = Math.max(0, Number(t) || 0), a = Math.max(0, Number(e) || 0), s = Math.max(0, Number(r) || 0), l = Math.max(0, Number(i) || 0);
  if (l < 1e-6) return { b: 0, g: 0, s: 0 };
  const c = a + o + s;
  if (c > l + 1e-6) {
    const f = l / c;
    return { b: a * f, g: o * f, s: s * f };
  }
  let d = Math.min(a, l), p = l - d, h = Math.min(o, p);
  p -= h;
  let g = Math.min(s, p);
  return p -= g, p > 1 && (g += p), { b: d, g: h, s: g };
}
function Oe(i) {
  const t = i.length, e = new Array(t), r = new Array(t), o = new Array(t);
  for (let a = 0; a < t; a++) {
    const s = i[a];
    let c = s.load != null && Number.isFinite(s.load) ? Math.max(0, s.load) : NaN;
    const d = Math.max(0, s.grid ?? 0), p = Math.max(0, s.batt ?? 0), h = Math.max(0, s.solar ?? 0);
    Number.isFinite(c) || (c = d + p + h);
    const g = je(c, s.grid ?? 0, s.batt ?? 0, s.solar ?? 0);
    e[a] = g.b, r[a] = g.g, o[a] = g.s;
  }
  return { sliceBatt: e, sliceGrid: r, sliceSolar: o };
}
function vt(i, t, e, r, o) {
  if (!i?.length || !Number.isFinite(t) || !Number.isFinite(e) || e <= t) return "";
  const a = e - t, s = i.length, l = [], c = (p) => s === 1 ? 0 : p / (s - 1) * r, d = (p) => o - (Number(p) - t) / a * o;
  for (let p = 0; p < s; p++) {
    const h = Number(i[p]);
    l.push({ x: c(p), y: d(Number.isFinite(h) ? h : 0) });
  }
  return `M ${l[0].x.toFixed(2)} ${l[0].y.toFixed(2)} ${l.slice(1).map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}`;
}
function zt(i, t, e, r, o, a) {
  if (!i?.length || i.length !== t?.length) return "";
  const s = Math.max(r - e, 1e-9), l = i.length, c = (h) => l === 1 ? 0 : h / (l - 1) * o, d = (h) => a - (Number(h) - e) / s * a;
  let p = "";
  for (let h = 0; h < l; h++) {
    const g = c(h), f = d(Number(t[h]));
    p += h === 0 ? `M ${g.toFixed(2)} ${f.toFixed(2)}` : ` L ${g.toFixed(2)} ${f.toFixed(2)}`;
  }
  for (let h = l - 1; h >= 0; h--) {
    const g = c(h), f = d(Number(i[h]));
    p += ` L ${g.toFixed(2)} ${f.toFixed(2)}`;
  }
  return p += " Z", p;
}
function te(i, t) {
  if (!i || i.width <= 0) return 50;
  const e = (t - i.left) / i.width * 100, r = Ee, o = typeof window < "u" ? window : null, a = o?.visualViewport ?? null, s = Number.isFinite(a?.offsetLeft) ? a.offsetLeft : 0, l = a && Number.isFinite(a.width) && a.width > 0 ? a.width : o?.innerWidth ?? 1e9, c = Math.min(
    Re,
    Math.max(Ce, l * 0.48)
  );
  let d = Math.max(-8, Math.min(108, e)), p = i.left + d / 100 * i.width;
  if (Number.isFinite(l) && l > 2 * (c + r)) {
    const h = s + c + r, g = s + l - c - r;
    p = Math.max(h, Math.min(g, p)), d = (p - i.left) / i.width * 100;
  }
  return Math.round(d * 10) / 10;
}
class Ie extends st {
  static get properties() {
    return {
      open: { type: Boolean },
      i18n: { attribute: !1 },
      locale: { attribute: !1 },
      loading: { type: Boolean },
      /** Error message string, or null when none */
      error: { attribute: !1 },
      /** @type {{ pts: unknown[]; yMin: number; yMax: number; hasLoadEntity: boolean; dayIso: string } | null} */
      displaySeries: { attribute: !1 },
      rollingHours: { type: Number },
      isTodayGraph: { type: Boolean },
      _hoverIdx: { state: !0 },
      _tooltipXPct: { state: !0 }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
      }
      .power-graph {
        margin: 0 0 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      .power-graph-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0 0 6px;
        flex-wrap: wrap;
      }
      .power-graph-title {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        flex: 0 0 auto;
      }
      .power-graph-head-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1 1 auto;
        min-width: 0;
      }
      .power-graph-archive-day {
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        text-align: right;
        line-height: 1.3;
      }
      .power-graph-window-btns {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin: 0;
      }
      .power-graph-window-btns .range-label {
        margin-right: 2px;
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .range-btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        padding: 2px 8px;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .range-btn.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .power-graph-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        margin-top: 6px;
        font-size: 0.72rem;
        color: var(--secondary-text-color);
      }
      .power-graph-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .power-graph-swatch {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        display: inline-block;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .power-graph-swatch-line {
        width: 14px;
        height: 0;
        border-radius: 0;
        border-bottom: 3px solid var(--swatch-line, currentColor);
        background: transparent;
        box-shadow: none;
      }
      .power-graph-chart-wrap {
        display: flex;
        align-items: stretch;
        gap: 6px;
        margin-top: 2px;
      }
      .power-yaxis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 0 0 auto;
        width: 2.75rem;
        min-height: 120px;
        padding: 0 2px 0 0;
        box-sizing: border-box;
        text-align: right;
        font-size: 0.68rem;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
      }
      .power-graph-svg-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
      }
      .power-graph-svg-wrap > svg {
        touch-action: none;
        display: block;
      }
      .power-graph-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: var(--power-tooltip-x, 50%);
        transform: translateX(-50%);
        z-index: 3;
        pointer-events: none;
        box-sizing: border-box;
        width: max-content;
        min-width: min(10.5rem, calc(100vw - 1.5rem));
        max-width: min(16rem, calc(100vw - 1.25rem));
        padding: 9px 11px;
        border-radius: 10px;
        font-size: 0.72rem;
        line-height: 1.5;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 94%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .power-graph-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border: 6px solid transparent;
        border-top-color: color-mix(in srgb, var(--divider-color) 45%, var(--card-background-color) 55%);
      }
      .power-graph-tooltip-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-variant-numeric: tabular-nums;
      }
      .power-graph-tooltip-row + .power-graph-tooltip-row {
        margin-top: 4px;
      }
      .power-graph-tooltip-k {
        flex: 0 0 auto;
        font-weight: 600;
      }
      .power-graph-tooltip-v {
        font-weight: 600;
        text-align: right;
        min-width: 0;
      }
      .power-graph-tooltip-h {
        font-weight: 700;
        font-size: 0.74rem;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
      }
      .power-xaxis {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 6px;
        margin-left: calc(2.75rem + 6px);
        font-size: 0.68rem;
        color: color-mix(in srgb, var(--primary-text-color) 35%, var(--secondary-text-color) 65%);
        font-variant-numeric: tabular-nums;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
      }
      .alert {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #fff);
        font-size: 0.83rem;
        line-height: 1.5;
      }
    `;
  }
  constructor() {
    super(), this.open = !1, this.i18n = {}, this.locale = "fr-FR", this.loading = !1, this.error = null, this.displaySeries = null, this.rollingHours = 6, this.isTodayGraph = !0, this._hoverIdx = null, this._tooltipXPct = null;
  }
  willUpdate(t) {
    t.has("open") && !this.open && (this._hoverIdx = null, this._tooltipXPct = null), t.has("loading") && this.loading && (this._hoverIdx = null, this._tooltipXPct = null);
  }
  updated(t) {
    super.updated(t);
    const e = this.displaySeries?.pts?.length ?? 0;
    if (this._hoverIdx != null && e) {
      const r = e - 1;
      this._hoverIdx > r && (this._hoverIdx = r);
    }
    this.open && this._hoverIdx != null && (t.has("_hoverIdx") || t.has("displaySeries") || t.has("open") && this.open) && queueMicrotask(() => this._syncTooltipXFromHover());
  }
  /** Re-apply viewport clamp from hover index after layout / series refresh (tooltip % vs SVG grid). */
  _syncTooltipXFromHover() {
    if (!this.open || this._hoverIdx == null) return;
    const t = this.renderRoot;
    if (!t) return;
    const e = t.querySelector(".power-graph-svg-wrap"), r = e?.querySelector("svg"), o = this.displaySeries, a = e?.getBoundingClientRect(), s = r?.getBoundingClientRect();
    if (!o?.pts?.length || !a?.width || !s?.width) return;
    const l = o.pts.length, c = Math.max(0, Math.min(l - 1, this._hoverIdx)), d = l <= 1 ? 0.5 : c / Math.max(l - 1, 1), p = s.left + d * s.width, h = te(a, p);
    this._tooltipXPct !== h && (this._tooltipXPct = h);
  }
  _emitWindowHours(t) {
    this.dispatchEvent(
      new CustomEvent("hub-power-graph-window", {
        bubbles: !0,
        composed: !0,
        detail: { hours: t }
      })
    );
  }
  /** @param {SVGSVGElement} el */
  _updateHoverFromClientX(t, e) {
    const r = this.displaySeries;
    if (!r?.pts?.length) return;
    const o = t.getBoundingClientRect();
    if (o.width <= 0) return;
    const a = (e - o.left) / o.width, s = r.pts.length, l = Math.max(0, Math.min(s - 1, Math.round(a * Math.max(s - 1, 1)))), d = t.closest(".power-graph-svg-wrap")?.getBoundingClientRect(), p = d && d.width > 0 ? te(d, e) : s <= 1 ? 50 : l / Math.max(s - 1, 1) * 100;
    this._hoverIdx !== l && (this._hoverIdx = l), this._tooltipXPct !== p && (this._tooltipXPct = p);
  }
  /** @param {MouseEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgMove(t) {
    this._updateHoverFromClientX(t.currentTarget, t.clientX);
  }
  _onSvgLeave() {
    this._hoverIdx != null && (this._hoverIdx = null), this._tooltipXPct != null && (this._tooltipXPct = null);
  }
  /** @param {TouchEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgTouch(t) {
    const e = t.touches?.[0];
    e && this._updateHoverFromClientX(t.currentTarget, e.clientX);
  }
  _onSvgTouchEnd() {
    this._hoverIdx != null && (this._hoverIdx = null), this._tooltipXPct != null && (this._tooltipXPct = null);
  }
  render() {
    if (!this.open) return x;
    const t = this.i18n ?? {}, e = this.locale ?? "fr-FR", r = kt, o = Y, a = J, s = "#2e7d32", l = "var(--primary-text-color, #e0e0e0)";
    if (this.loading)
      return m`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this.error)
      return m`<div class="power-graph"><div class="alert">${this.error}</div></div>`;
    const c = this.displaySeries;
    if (!c?.pts?.length)
      return m`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const d = 320, p = 120, h = c.yMin ?? 0, g = c.yMax ?? 1, f = c.pts.map((F) => F.solar ?? 0), _ = c.pts.map((F) => Math.max(0, F.batt ?? 0)), u = c.pts.map((F) => Math.max(0, -(F.batt ?? 0))), L = c.pts.map((F) => F.grid ?? 0), v = c.hasLoadEntity === !0, B = v ? c.pts.map((F) => F.load == null ? 0 : F.load) : [], w = (F) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(F)), y = (F) => new Intl.DateTimeFormat(e, { dateStyle: "short", timeStyle: "short" }).format(new Date(F)), S = c.pts[0].ts, $ = c.pts[c.pts.length - 1].ts, b = S + ($ - S) / 3, k = S + ($ - S) * 2 / 3, R = vt(f, h, g, d, p), C = vt(_, h, g, d, p), T = vt(u, h, g, d, p), M = vt(L, h, g, d, p), N = v && B.length ? vt(B, h, g, d, p) : "";
    let G = "", X = "", Q = "";
    if (v && B.length) {
      const { sliceBatt: F, sliceGrid: Bt, sliceSolar: q } = Oe(c.pts), Et = F.length, Rt = new Array(Et).fill(0), yt = F.slice(), Gt = F.map((ot, ut) => ot + Bt[ut]), jt = F.map((ot, ut) => ot + Bt[ut] + q[ut]);
      G = zt(Rt, yt, h, g, d, p), X = zt(yt, Gt, h, g, d, p), Q = zt(Gt, jt, h, g, d, p);
    }
    const U = `color-mix(in srgb, ${J} 30%, transparent)`, mt = `color-mix(in srgb, ${kt} 30%, transparent)`, ft = `color-mix(in srgb, ${Y} 30%, transparent)`, tt = "color-mix(in srgb, var(--divider-color) 70%, transparent)", wt = Math.max(g - h, 1e-9), lt = (F) => p - (F - h) / wt * p, ct = (h + g) / 2, Dt = P(g), O = P(ct), pt = P(h), St = lt(ct), Pt = h < 0 && g > 0, dt = lt(0), et = c.pts.length, K = this._hoverIdx, z = K != null && K >= 0 && K < et ? c.pts[K] : null, Ft = et <= 1 ? d / 2 : (K ?? 0) / Math.max(et - 1, 1) * d, Ct = this._tooltipXPct != null ? this._tooltipXPct : et <= 1 ? 50 : (K ?? 0) / Math.max(et - 1, 1) * 100, Tt = V(c.dayIso), rt = Number.isFinite(Tt.getTime()) ? new Intl.DateTimeFormat(e, { dateStyle: "medium" }).format(Tt) : c.dayIso, xt = String(t.powerHistoryFullDay).replace("{date}", rt), ht = $t(
      this.rollingHours,
      it
    );
    return m`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${this.isTodayGraph ? m`<div class="power-graph-window-btns">
                  <span class="range-label">${t.powerHistoryWindow}</span>
                  ${Wt.map(
      (F) => m`
                      <button
                        type="button"
                        class="range-btn ${ht === F ? "active" : ""}"
                        @click=${() => this._emitWindowHours(F)}
                      >
                        ${F}h
                      </button>
                    `
    )}
                </div>` : m`<div class="power-graph-archive-day">${xt}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${Dt}</span>
            <span>${O}</span>
            <span>${pt}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${z ? m`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${Ct}%">
                    <div class="power-graph-tooltip-h">
                      ${t.powerGraphTooltipTime}: ${y(z.ts)}
                    </div>
                    ${v ? m`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${l}"
                              >${t.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${z.load != null ? P(z.load) : t.emDash}</span
                            >
                          </div>
                        ` : x}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${o}"
                        >${t.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${P(z.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${a}"
                        >${t.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${P(Math.max(0, z.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${s}"
                        >${t.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${P(Math.max(0, -(z.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${r}"
                        >${t.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${P(z.grid ?? 0)}</span>
                    </div>
                  </div>
                ` : x}
            <svg
              viewBox="0 0 ${d} ${p}"
              width="100%"
              height="120"
              preserveAspectRatio="none"
              aria-label="power history chart"
              @mousemove=${this._onSvgMove}
              @mouseleave=${this._onSvgLeave}
              @touchstart=${this._onSvgTouch}
              @touchmove=${this._onSvgTouch}
              @touchend=${this._onSvgTouchEnd}
              @touchcancel=${this._onSvgTouchEnd}
            >
              <g class="power-grid-lines" stroke="${tt}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${d}" y2="0"></line>
                <line x1="0" y1="${St}" x2="${d}" y2="${St}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${p}" x2="${d}" y2="${p}"></line>
                ${Pt ? gt`<line
                      x1="0"
                      y1="${dt}"
                      x2="${d}"
                      y2="${dt}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>` : x}
                <line x1="0" y1="0" x2="0" y2="${p}" stroke-width="1"></line>
              </g>
              ${G ? gt`<path
                    d="${G}"
                    fill="${U}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : x}
              ${X ? gt`<path
                    d="${X}"
                    fill="${mt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : x}
              ${Q ? gt`<path
                    d="${Q}"
                    fill="${ft}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : x}
              <path
                d="${M}"
                fill="none"
                stroke="${r}"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${T}"
                fill="none"
                stroke="${s}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${C}"
                fill="none"
                stroke="${a}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${R}"
                fill="none"
                stroke="${o}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${N ? gt`<path
                    d="${N}"
                    fill="none"
                    stroke="${l}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>` : x}
              ${K != null ? gt`<line
                    pointer-events="none"
                    x1="${Ft}"
                    y1="0"
                    x2="${Ft}"
                    y2="${p}"
                    stroke="${tt}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>` : x}
            </svg>
          </div>
        </div>
        <div class="power-xaxis">
          <span>${w(S)}</span>
          <span>${w(b)}</span>
          <span>${w(k)}</span>
          <span>${w($)}</span>
        </div>
        <div class="power-graph-legend" aria-hidden="true">
          ${v ? m`<span class="power-graph-chip"
                ><span
                  class="power-graph-swatch power-graph-swatch-line"
                  style="--swatch-line:${l}"
                ></span
                >${t.houseLoad}</span
              >` : x}
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${o}"
            ></span
            >${t.colSolar}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${a}"
            ></span
            >${t.segBattDis}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${s}"
            ></span
            >${t.segBattChg}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${r}"
            ></span
            >${t.colGrid}</span
          >
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-graph") || customElements.define("hub-power-graph", Ie);
class Ae extends st {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
        width: 100%;
      }
      .batt-bar-container {
        margin: 4px 0 6px;
        width: 100%;
      }
      .batt-section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .batt-section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .batt-track-wrap {
        position: relative;
        width: 100%;
        margin-bottom: 2px;
      }
      .batt-track {
        position: relative;
        width: 100%;
        height: 32px;
        border-radius: 8px;
        background: #0b0b0b;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, #333) inset,
          0 0 0 1px color-mix(in srgb, var(--divider-color) 40%, transparent);
        overflow: hidden;
        box-sizing: border-box;
      }
      .batt-segments {
        position: absolute;
        inset: 0;
        z-index: 1;
        padding: 3px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: 3px;
        align-items: stretch;
      }
      .batt-cell {
        flex: 1;
        min-width: 2px;
        border-radius: 3px;
        background: transparent;
        border: 1px solid #333333;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        position: relative;
        overflow: hidden;
      }
      .batt-cell-fill {
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--fill-x, 0) * 1%);
        width: calc(var(--fill-w, 0) * 1%);
        background: #2e7d32;
        box-shadow: 0 0 0 1px color-mix(in srgb, #1b5e20 65%, transparent) inset;
      }
      .batt-cell-hatch {
        position: absolute;
        top: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.03);
        background-image: repeating-linear-gradient(
          135deg,
          rgba(150, 150, 150, 0.42) 0px,
          rgba(150, 150, 150, 0.42) 3px,
          transparent 3px,
          transparent 6px
        );
      }
      .batt-cell-hatch--left {
        left: 0;
        width: calc(var(--hatch-l, 0) * 1%);
      }
      .batt-cell-hatch--right {
        right: 0;
        width: calc(var(--hatch-r, 0) * 1%);
      }
      .batt-segments.batt-green--charging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #66bb6a 0%,
          #2e7d32 45%,
          #1b5e20 100%
        );
        animation: batt-cell-pulse 2.2s ease-in-out infinite;
      }
      .batt-segments.batt-green--charging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.15s;
      }
      .batt-segments.batt-green--discharging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #9ccc65 0%,
          #558b2f 50%,
          #33691e 100%
        );
        animation: batt-cell-pulse 2.4s ease-in-out infinite reverse;
      }
      .batt-segments.batt-green--discharging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.12s;
      }
      @keyframes batt-cell-pulse {
        0%,
        100% {
          filter: brightness(1);
        }
        50% {
          filter: brightness(1.12);
        }
      }
      .batt-bar-total {
        position: absolute;
        left: 6px;
        right: 6px;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        pointer-events: none;
        z-index: 3;
      }
      .batt-bar-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        line-height: 1;
        flex: 0 0 auto;
      }
      .batt-bar-row-main {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        line-height: 1.05;
      }
      .batt-bar-total::before,
      .batt-bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .batt-bar-total-text {
        font-size: 0.65rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .batt-bar-eta-inline {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-top: 1px;
        font-size: 0.85rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        color: rgba(255, 255, 255, 0.92);
        text-align: center;
        white-space: nowrap;
        text-shadow:
          0 0 10px rgba(0, 0, 0, 1),
          0 1px 2px rgba(0, 0, 0, 0.95);
      }
      .batt-eta-icon {
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.95);
        --mdc-icon-size: 13px;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.data = null, this.numberLocale = "fr-FR";
  }
  _fmtKwh(t) {
    return t == null || !Number.isFinite(Number(t)) ? "—" : Number(t).toLocaleString(this.numberLocale ?? "fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  /** @returns {{ icon: string; time: string } | null} */
  _resolveEta() {
    const t = this.data;
    if (!t || t.capacity == null || t.capacity <= 0) return null;
    if (t.chargeW != null && t.chargeW > 0) {
      const e = t.soc ?? 0, r = t.capacity * (1 - e / 100), o = t.chargeW / 1e3;
      if (o > 0)
        return {
          icon: "mdi:battery-charging-high",
          time: qt(r / o * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: qt(e / r * 60)
        };
    }
    return null;
  }
  /** @returns {"charging" | "discharging" | "idle"} */
  _flowMode(t) {
    if (!t) return "idle";
    const e = 40, r = t.chargeW != null ? Number(t.chargeW) : 0, o = t.dischargeW != null ? Number(t.dischargeW) : 0;
    return r > e ? "charging" : o > e ? "discharging" : "idle";
  }
  render() {
    const t = this.data;
    if (!t || t.soc == null || t.capacity == null || t.capacity <= 0) return x;
    const e = Math.max(0, Math.min(100, Number(t.socMin ?? 0)));
    let r = Math.max(e, Math.min(100, Number(t.socMax ?? 100)));
    const o = Math.max(0, Math.min(100, Number(t.soc))), a = Math.min(r, Math.max(e, o));
    let s = a;
    const l = t.capacity, c = t.available;
    if (c != null && Number.isFinite(c) && l > 0) {
      const y = e + c / l * 100;
      s = Math.min(Math.max(y, e), a, r);
    }
    const d = c != null && Number.isFinite(c) ? c : l * Math.max(0, a - e) / 100, p = Math.round(o).toLocaleString(this.numberLocale ?? "fr-FR"), h = `${this._fmtKwh(d)} / ${this._fmtKwh(l)} kWh (${p} %)`, g = this._flowMode(t), f = g === "charging" ? "batt-green--charging" : g === "discharging" ? "batt-green--discharging" : "", _ = 18, u = 100 / _, L = (y) => Math.max(0, Math.min(1, y)), v = (y, S, $, b) => Math.max(0, Math.min(S, b) - Math.max(y, $)), B = Array.from({ length: _ }, (y, S) => {
      const $ = S * u, b = (S + 1) * u, k = v($, b, $, e) / u * 100, R = v($, b, r, b) / u * 100, C = Math.max($, e), T = Math.min(b, s, r), M = v($, b, C, T) / u * 100, N = L((C - $) / u) * 100, G = `--hatch-l:${k.toFixed(3)};--hatch-r:${R.toFixed(3)};--fill-x:${N.toFixed(
        3
      )};--fill-w:${M.toFixed(3)};`;
      return m`<div class="batt-cell" style="${G}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    }), w = this._resolveEta();
    return m`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(o)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${f}">${B}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${h}</span>
              </div>
              ${w ? m`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${w.icon}></ha-icon>
                    <span>${w.time}</span>
                  </div>` : x}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", Ae);
class ze extends st {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      totalMaison: { type: Number },
      originGrid: { type: Number },
      totalEur: { type: Number },
      ecoTotal: { type: Number }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
      }
      .insight-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 6px;
        justify-content: center;
        margin-bottom: 5px;
      }
      .insight-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        white-space: nowrap;
        letter-spacing: 0.01em;
      }
      .insight-chip.eco {
        color: #43a047;
      }
      .insight-chip.warn {
        color: #f9a825;
      }
      .insight-chip.neg {
        color: #e53935;
      }
    `;
  }
  constructor() {
    super(), this.i18n = {}, this.totalMaison = 0, this.originGrid = 0, this.totalEur = 0, this.ecoTotal = 0;
  }
  render() {
    if (!(this.totalMaison > 0)) return x;
    const t = Math.max(
      0,
      Math.min(100, Math.round((1 - Math.min(this.originGrid, this.totalMaison) / this.totalMaison) * 100))
    ), e = t >= 60 ? "eco" : t >= 30 ? "" : "warn", r = this.ecoTotal >= 0 ? "−" : "+", o = this.ecoTotal >= 0 ? "eco" : "neg";
    return m`
      <div class="insight-bar">
        <span class="insight-chip ${e}">☀️ ${t}% ${this.i18n.insightAutosuff}</span>
        <span class="insight-chip">💸 ${this.totalEur.toFixed(2)} €</span>
        <span class="insight-chip ${o}">
          ⚡ ${r}${Math.abs(this.ecoTotal).toFixed(2)}€ ${this.i18n.insightVsGrid}
        </span>
      </div>
    `;
  }
}
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", ze);
class We extends st {
  static get properties() {
    return {
      hass: { attribute: !1 },
      _config: { state: !0 },
      _date: { state: !0 },
      _rangePreset: { state: !0 },
      _showRaw: { state: !0 },
      _hist: { state: !0 },
      _histLoading: { state: !0 },
      _histErr: { state: !0 },
      _powerGraphOpen: { state: !0 },
      _powerGraphLoading: { state: !0 },
      _powerGraphErr: { state: !0 },
      _powerGraphSeries: { state: !0 },
      _powerGraphRollingHours: { state: !0 }
    };
  }
  static get styles() {
    return nt`
      :host {
        display: block;
        width: 100%;
      }
      ha-card {
        width: 100%;
        padding: 8px 12px 10px;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }
      .header-title-side {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 8px 12px;
        min-width: 0;
      }
      .header h2 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .header-subtitle {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: min(280px, 100%);
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .controls label {
        font-size: 0.82rem;
        opacity: 0.7;
      }
      .range-btns {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .range-btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        padding: 2px 8px;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .range-btn.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      input[type="date"] {
        background: var(--input-fill-color, var(--secondary-background-color));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.82rem;
        font-family: inherit;
        cursor: pointer;
      }
      .btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 6px;
        padding: 4px 10px;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .btn:hover {
        background: var(--secondary-background-color);
      }
      .alert {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #fff);
        font-size: 0.83rem;
        line-height: 1.5;
      }
      .alert code {
        background: rgba(0, 0, 0, 0.18);
        padding: 1px 4px;
        border-radius: 3px;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
      }
      .meta-tempo-wrap {
        margin: 0 0 6px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 8px;
      }
      /* Tempo: 6-row grid — left tiles span 3 rows each; right counters 2 rows each. auto rows = compact height. */
      .meta-tempo-wrap:has(.tempo-days) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: repeat(6, auto);
        gap: 4px;
        align-items: stretch;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / 4;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(2) {
        grid-column: 1;
        grid-row: 4 / 7;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-days {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(1) {
        grid-column: 2;
        grid-row: 1 / 3;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(2) {
        grid-column: 2;
        grid-row: 3 / 5;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(3) {
        grid-column: 2;
        grid-row: 5 / 7;
        min-height: 0;
      }
      .meta-days-stack {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .day-tile {
        border-radius: 8px;
        padding: 4px 8px;
        min-height: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-sizing: border-box;
      }
      .meta-tempo-wrap:has(.tempo-days) .day-tile {
        min-height: 0;
        padding: 3px 8px;
      }
      .day-tile-label {
        font-size: 0.58rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.92;
        margin-bottom: 1px;
      }
      .day-tile-value {
        font-size: 0.74rem;
        font-weight: 700;
        line-height: 1.15;
      }
      .day-tile.color-blue {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-blue .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-white {
        background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
        color: #eceff1;
        border-color: rgba(255, 255, 255, 0.22);
      }
      .day-tile.color-white .day-tile-label {
        color: rgba(236, 239, 241, 0.88);
      }
      .day-tile.color-red {
        background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-red .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-na {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-color: var(--divider-color);
      }
      .day-tile.color-na .day-tile-label {
        color: var(--secondary-text-color);
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        background: var(--secondary-background-color);
      }
      .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .color-blue {
        background: #1e88e5;
      }
      .color-white {
        background: #b0bec5;
      }
      .color-red {
        background: #e53935;
      }
      .color-na {
        background: #757575;
      }
      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        vertical-align: middle;
      }
      .status-green {
        background: #43a047;
      }
      .status-amber {
        background: #f9a825;
      }
      .status-red {
        background: #e53935;
      }
      .red-hp-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
        padding: 7px 12px;
        border-radius: 8px;
        background: color-mix(in srgb, #e53935 14%, var(--card-background-color, #1c1c1c));
        border: 1px solid color-mix(in srgb, #e53935 48%, transparent);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--primary-text-color);
      }
      .tempo-days {
        flex: 1;
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .tempo-day {
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 0.68rem;
        font-weight: 700;
        line-height: 1.2;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tempo-blue {
        border-left: 3px solid #42a5f5;
      }
      .tempo-white {
        border-left: 3px solid #9e9e9e;
      }
      .tempo-red {
        border-left: 3px solid #ef5350;
      }
      section {
        margin-bottom: 10px;
        padding: 6px 8px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 70%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      section:last-of-type {
        margin-bottom: 0;
      }
      .section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-metric {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        color: var(--secondary-text-color);
        font-size: 0.68rem;
        white-space: nowrap;
      }
      .section-metric b {
        color: var(--primary-text-color);
        font-weight: 900;
        font-variant-numeric: tabular-nums;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .raw {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 10px;
        font-size: 0.78rem;
        font-family: var(--ha-font-family-code, monospace);
        line-height: 1.7;
      }
      .raw-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .raw-grid b {
        display: block;
        margin-bottom: 2px;
      }
    `;
  }
  constructor() {
    super(), this._config = {}, this._date = H(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null, this._hassRetryTimer = null, this._costMissingSinceMs = null, this._powerGraphPollTimer = null, this._powerGraphLoadId = 0, this._powerGraphRollingHours = it;
  }
  connectedCallback() {
    super.connectedCallback(), requestAnimationFrame(() => requestAnimationFrame(() => this.requestUpdate()));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearHassRetryTimer(), this._clearPowerGraphPollTimer(), this._costMissingSinceMs = null;
  }
  _clearPowerGraphPollTimer() {
    this._powerGraphPollTimer != null && (clearInterval(this._powerGraphPollTimer), this._powerGraphPollTimer = null);
  }
  /** Refresh interval only while the graph shows the current Paris day (live tail). */
  _syncPowerGraphPollTimer() {
    if (this._clearPowerGraphPollTimer(), !this._powerGraphOpen || !this.hass || (this._date ?? H()) !== H()) return;
    const e = parseFloat(this._config?.power_history_refresh_seconds), r = Number.isFinite(e) && e > 0 ? Math.max(15e3, Math.min(3e5, Math.round(e * 1e3))) : 12e4;
    this._powerGraphPollTimer = window.setInterval(() => {
      this._powerGraphOpen && this.hass && this._loadPowerGraph({ refresh: !0 });
    }, r);
  }
  _setPowerGraphRollingHours(t) {
    const e = $t(t, it);
    this._powerGraphRollingHours !== e && (this._powerGraphRollingHours = e, this.__lastKey = null);
  }
  _clearHassRetryTimer() {
    this._hassRetryTimer != null && (clearTimeout(this._hassRetryTimer), this._hassRetryTimer = null);
  }
  _scheduleHassRetry(t = 96) {
    this._hassRetryTimer == null && (this._hassRetryTimer = setTimeout(() => {
      this._hassRetryTimer = null, this.requestUpdate();
    }, t));
  }
  /**
   * Live mode + cost_detail not in hass.states yet: wait for HA/WebSocket instead of error UI.
   * Returns true when we should show the bootstrap placeholder (and schedule retries).
   */
  _liveBootstrapWaiting(t) {
    const e = this.hass;
    if (!e || !this._isLiveMode()) return !1;
    const r = e.states;
    if (At(r, t))
      return this._costMissingSinceMs = null, !1;
    if (e.connected === !1)
      return this._scheduleHassRetry(), !0;
    if ((r && typeof r == "object" ? Object.keys(r).length : 0) === 0)
      return this._scheduleHassRetry(), !0;
    const a = performance.now();
    return this._costMissingSinceMs == null && (this._costMissingSinceMs = a), a - this._costMissingSinceMs < 1800 ? (this._scheduleHassRetry(), !0) : !1;
  }
  setConfig(t) {
    this._config = t ?? {}, this.__lastKey = null, this._config.show_raw_control === !1 && (this._showRaw = !1), this._config.show_live_power === !1 && this._powerGraphOpen && (this._powerGraphOpen = !1, this._clearPowerGraphPollTimer());
    const e = parseFloat(this._config?.power_history_hours), r = $t(
      Number.isFinite(e) ? e : NaN,
      it
    );
    this._powerGraphRollingHours !== r && (this._powerGraphRollingHours = r, this.__lastKey = null), this.requestUpdate();
  }
  getCardSize() {
    return 8;
  }
  /** Default size from grid_span; loose min bounds so sections "Layout" can resize / full width. */
  getGridOptions() {
    const t = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(t) ? Math.max(1, Math.min(3, Math.trunc(t))) : 1) * 12,
      min_columns: 3,
      rows: 8,
      min_rows: 4
    };
  }
  static getConfigElement() {
    return document.createElement("hub-energie-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:hub-energie-card",
      grid_span: 2
    };
  }
  shouldUpdate(t) {
    if (t.has("hass") && t.size === 1 && this.hass)
      try {
        if (this._isLiveMode()) {
          const e = this._map();
          if (!At(this.hass.states, e.cost))
            return this.__lastKey = null, !0;
        }
      } catch {
        return this.__lastKey = null, !0;
      }
    if (t.has("hass") && t.size === 1) {
      let e;
      try {
        e = this._stateKey();
      } catch {
        e = null;
      }
      return e !== null && e === this.__lastKey ? !1 : (this.__lastKey = e, !0);
    }
    return !0;
  }
  updated(t) {
    super.updated(t), (t.has("hass") || t.has("_date") || t.has("_rangePreset")) && this._loadHistory(), this._powerGraphOpen && (t.has("_date") || t.has("_powerGraphRollingHours")) && this.hass && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph({ force: !0 }), this._syncPowerGraphPollTimer());
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? Xt.en : Xt.fr;
  }
  /** Section visibility: default on; explicit false hides. */
  _showSection(t) {
    const e = this._config?.[t];
    return e !== !1 && e !== "false";
  }
  _map() {
    return fe();
  }
  _getRange() {
    return le(this._date ?? H(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === H();
  }
  /** Safe fingerprint for change detection; must never throw (used from shouldUpdate). */
  _fingerprintTempoDays(t) {
    if (t == null) return "";
    if (typeof t != "object") return String(t);
    try {
      return JSON.stringify(t);
    } catch {
      return "";
    }
  }
  _stateKey() {
    const t = this._getRange();
    if (!this._isLiveMode())
      return `hist:${t.startIso}:${t.endIso}:${this._rangePreset ?? "day"}:${this._histLoading ? "loading" : this._hist ? "ok" : "none"}:${this._histErr ?? ""}`;
    const e = this.hass?.states;
    if (!e) return null;
    const r = this._map(), o = [
      r.cost,
      r.ecoSolar,
      r.ecoBatt,
      r.originGrid,
      r.originSolar,
      r.usageGridDirect,
      r.usageGridBatt,
      r.usageSolarDirect,
      r.usageSolarBatt,
      r.usageBattHome
    ], a = e[r.cost]?.attributes ?? {}, s = [
      a.offer ?? "",
      a.contract_power ?? "",
      a.tariff_fetched_at ?? "",
      a.current_slot ?? "",
      this._fingerprintTempoDays(a.tempo_days),
      a.grid_power_signed_w ?? "",
      a.solar_power_w ?? "",
      a.solar_estimate_power_w ?? "",
      a.batt_discharge_power_w ?? "",
      a.batt_charge_power_w ?? "",
      a.load_power_w ?? "",
      a.export_power_w ?? "",
      a.battery_soc_percent ?? "",
      a.battery_capacity_kwh ?? "",
      Lt(a.grid_by_slot_kwh),
      Lt(a.maison_by_slot_kwh),
      Lt(a.usage_grid_batt_charge_by_slot_kwh),
      Lt(a.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? ""
    ].join("|");
    return `${o.map((l) => e[l]?.state ?? "").join("|")}|${s}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract(t) {
    return ye(this._states(), this._map(), t);
  }
  _onDateChange(t) {
    this._date = t.target.value, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null;
  }
  _setRangePreset(t) {
    this._rangePreset = t, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null;
  }
  _onRawToggle() {
    this._showRaw = !this._showRaw, this.__lastKey = null;
  }
  _loadHistory() {
    if (this._isLiveMode() || !this.hass || this._histLoading || this._hist !== null) return;
    this._histLoading = !0;
    const t = this._map(), e = this._getRange(), r = [
      t.cost,
      t.ecoSolar,
      t.ecoBatt,
      t.originGrid,
      t.originSolar,
      t.usageGridDirect,
      t.usageGridBatt,
      t.usageSolarDirect,
      t.usageSolarBatt,
      t.usageBattHome
    ];
    _e(this.hass, e.startIso, e.endIso, r, t.cost).then((o) => {
      this._hist = o, this._histErr = null;
    }).catch((o) => {
      this._histErr = o.message ?? String(o), this._hist = null;
    }).finally(() => {
      this._histLoading = !1, this.__lastKey = null;
    });
  }
  /**
   * @param {{ refresh?: boolean; force?: boolean }} [opts]
   *   refresh: reload statistics while the graph stays open (no full-screen loading).
   *   force: new window fetch even if a previous load is still in flight (date / duration change).
   */
  async _loadPowerGraph(t = {}) {
    const e = t.refresh === !0, r = t.force === !0;
    if (!this.hass || !this._powerGraphOpen) return;
    const a = this._map().cost;
    if (!a) return;
    if (!e) {
      if (!r && (this._powerGraphLoading || this._powerGraphSeries !== null)) return;
      this._powerGraphLoading = !0, this._powerGraphErr = null;
    }
    let s;
    e ? s = this._powerGraphLoadId : (this._powerGraphLoadId += 1, s = this._powerGraphLoadId);
    const l = this._date ?? H(), c = $t(
      this._powerGraphRollingHours,
      it
    ), d = l === H();
    let p, h, g = !1, f = "day", _ = null, u = 24;
    if (d) {
      f = "rolling", _ = c, u = c;
      const B = /* @__PURE__ */ new Date();
      h = B, p = new Date(B.getTime() - c * 60 * 60 * 1e3), g = !0;
    } else if (p = V(l), h = V(Mt(l, 1)), !Number.isFinite(p.getTime()) || !Number.isFinite(h.getTime())) {
      !e && this._powerGraphLoadId === s && (this._powerGraphLoading = !1, this._powerGraphErr = this._i18n().noData, this._powerGraphSeries = null);
      return;
    }
    const L = {
      hoursBack: u,
      statsPts: [],
      hasLoadEntity: !1,
      useLiveTail: g,
      windowMode: f,
      rollingHours: _,
      dayIso: l
    }, v = this._i18n();
    try {
      const B = this.hass.states[a]?.attributes?.power_graph_entity_map, w = B && typeof B == "object" ? B : null, y = Se(w);
      if (!y.length) {
        !e && this._powerGraphLoadId === s && (this._powerGraphErr = v.powerHistoryNoSensors, this._powerGraphSeries = { ...L });
        return;
      }
      const S = await Fe(this.hass, {
        startTimeIso: p.toISOString(),
        endTimeIso: h.toISOString(),
        statisticIds: y,
        period: "5minute"
      });
      if (this._powerGraphLoadId !== s || !this._powerGraphOpen || (this._date ?? H()) !== l || d && $t(this._powerGraphRollingHours, it) !== c)
        return;
      const $ = Ge(w, S);
      if (!$?.filled?.length) {
        !e && this._powerGraphLoadId === s && (this._powerGraphErr = v.powerHistoryNoStatistics, this._powerGraphSeries = {
          ...L,
          hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== ""
        });
        return;
      }
      const b = $.filled, k = 160, C = ((T) => {
        if (T.length <= k) return T;
        const M = T.length / k, N = [];
        for (let G = 0; G < k; G++)
          N.push(T[Math.floor(G * M)]);
        return N;
      })(b);
      this._powerGraphLoadId === s && (this._powerGraphSeries = {
        hoursBack: u,
        statsPts: C,
        hasLoadEntity: typeof w?.load_entity == "string" && w.load_entity.trim() !== "",
        useLiveTail: g,
        windowMode: f,
        rollingHours: _,
        dayIso: l
      });
    } catch (B) {
      !e && this._powerGraphLoadId === s && (this._powerGraphErr = B?.message ?? String(B), this._powerGraphSeries = null);
    } finally {
      !e && this._powerGraphLoadId === s && (this._powerGraphLoading = !1), this.__lastKey = null;
    }
  }
  _togglePowerGraph() {
    const t = !this._powerGraphOpen;
    this._powerGraphOpen = t, this.__lastKey = null, t || this._clearPowerGraphPollTimer(), t && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph(), this._syncPowerGraphPollTimer());
  }
  _powerGraphDisplaySeries() {
    if (!this._powerGraphOpen) return null;
    const t = this._powerGraphSeries;
    if (!t?.statsPts?.length) return null;
    const e = t.useLiveTail === !0, o = this._map().cost, a = o ? this.hass?.states[o]?.attributes?.power_graph_entity_map : null, s = a && typeof a == "object" ? a : null, l = e && s && this.hass ? Me(this.hass, s) : null, c = e ? Ne(t.statsPts, l) : t.statsPts, { yMin: d, yMax: p } = Le(c);
    return {
      hoursBack: t.hoursBack,
      pts: c,
      yMin: d,
      yMax: p,
      hasLoadEntity: t.hasLoadEntity === !0,
      windowMode: t.windowMode ?? "rolling",
      rollingHours: t.rollingHours ?? null,
      dayIso: t.dayIso ?? this._date ?? H(),
      useLiveTail: e
    };
  }
  _renderRedHpWarning(t, e, r, o, a) {
    if (e !== "tempo" || r <= 0) return x;
    const l = (t ?? []).find((d) => d.id === "rouge_hp")?.v ?? 0;
    if (l < 0.1) return x;
    const c = (o.solarDirect?.v ?? 0) + (o.solarBatt?.v ?? 0) + (o.battHome?.v ?? 0);
    return l / r < 0.35 || l <= c ? x : m`<div class="red-hp-banner">⚠️ ${a.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e, r) {
    const o = r.emDash;
    if (!t || typeof t != "object") return o;
    const a = at.map((s) => {
      const l = t[s.id], c = typeof l == "number" ? l : parseFloat(l);
      return Number.isFinite(c) && c > 1e-5 ? { label: I(s.id, e, r), v: c } : null;
    }).filter(Boolean);
    return a.length ? a.map((s, l) => m`${l > 0 ? m`<br />` : x}${s.label}: ${s.v.toFixed(3)} kWh`) : o;
  }
  render() {
    try {
      return this._renderCardImpl();
    } catch (t) {
      console.warn("[hub-energie-card] render error", t);
      let e = "…";
      try {
        e = this._i18n()?.waitingHassBootstrap ?? "…";
      } catch {
      }
      return m`<ha-card><div class="loader">${e}</div></ha-card>`;
    }
  }
  _renderCardImpl() {
    const t = this._i18n();
    if (!this.hass) return m`<ha-card></ha-card>`;
    const e = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR", r = this._isLiveMode(), o = this._map();
    if (r && !At(this.hass?.states, o.cost))
      return this._liveBootstrapWaiting(o.cost) ? m`
          <ha-card>
            <div class="header"><h2>Hub Énergie</h2></div>
            <div class="loader">${t.waitingHassBootstrap}</div>
          </ha-card>
        ` : m`
        <ha-card>
          <div class="header"><h2>Hub Énergie</h2></div>
          <div class="alert">
            ${t.costEntityNotFoundBefore} <code>${o.cost}</code> ${t.costEntityNotFoundAfter}<br />
            ${t.costEntityCardHint}
          </div>
        </ha-card>
      `;
    const a = this._getRange(), {
      grid: s,
      maison: l,
      totalEur: c,
      costs: d,
      abo: p,
      ecoSolar: h,
      ecoBatt: g,
      og: f,
      os: _,
      usage: u,
      costEntityOk: L,
      offer: v,
      contractPower: B,
      currentSlot: w,
      tempoDays: y,
      todayColor: S,
      tomorrowColor: $,
      reinj: b,
      gridBattBySlot: k,
      solarBattBySlot: R
    } = this._extract(t), C = s.reduce((n, D) => n + D.v, 0), T = l.reduce((n, D) => n + D.v, 0), M = s.filter((n) => n.v > 1e-3), N = d.filter((n) => n.v > 5e-4), G = h + g, X = _t([C, ...s.map((n) => n.v), u.gridDirect.v, u.gridBatt.v]), Q = u.gridDirect.v, U = Math.max(0, u.solarDirect.v - u.solarBatt.v), mt = u.battHome.v, ft = Q + U + mt, tt = _t([ft, Q, U, mt]), wt = u.gridBatt.v + u.solarBatt.v, lt = L ? Qt(v, k, t) : [], ct = L ? Qt(v, R, t) : [], Dt = L && (lt.length > 0 || ct.length > 0), O = [];
    if (Dt) {
      if (ct.length) {
        const n = ct.reduce((D, Vt) => D + (Number.isFinite(Vt?.v) ? Vt.v : 0), 0);
        n > 1e-5 && O.push({
          label: t.brkTblSolar,
          v: n,
          color: u.solarBatt.color,
          isHc: !1
        });
      } else u.solarBatt.v > 1e-3 && O.push({
        label: t.brkTblSolar,
        v: u.solarBatt.v,
        color: u.solarBatt.color,
        isHc: !1
      });
      if (lt.length)
        for (const n of lt)
          O.push({
            label: `${t.brkTblGridHome} · ${n.label}`,
            v: n.v,
            color: n.color,
            isHc: n.isHc
          });
      else u.gridBatt.v > 1e-3 && O.push({
        label: t.brkTblGridHome,
        v: u.gridBatt.v,
        color: u.gridBatt.color,
        isHc: !1
      });
    } else
      u.gridBatt.v > 1e-3 && O.push({
        label: t.brkTblGridHome,
        v: u.gridBatt.v,
        color: u.gridBatt.color,
        isHc: !1
      }), u.solarBatt.v > 1e-3 && O.push({
        label: t.brkTblSolar,
        v: u.solarBatt.v,
        color: u.solarBatt.color,
        isHc: !1
      });
    const pt = _t([
      wt,
      ...O.map((n) => n.v)
    ]), St = M.map((n) => ({ value: n.v, color: n.color, className: n.isHc ? "fill-hc" : "" })), Pt = M.map((n) => ({
      label: I(n.id, v, t),
      value: X(n.v),
      color: n.color,
      rawV: n.v
    })), dt = [
      { label: t.brkTblGridHome, v: Q, color: u.gridDirect.color },
      { label: t.brkTblSolar, v: U, color: u.solarDirect.color },
      { label: t.brkTblBattHome, v: mt, color: u.battHome.color }
    ].filter((n) => n.v > 1e-3), et = dt.map((n) => ({ value: n.v, color: n.color })), K = dt.map((n) => ({
      label: n.label,
      value: tt(n.v),
      color: n.color,
      rawV: n.v
    })), z = O.map((n) => ({
      value: n.v,
      color: n.color,
      className: n.isHc ? "fill-hc" : ""
    })), Ft = O.map((n) => ({
      label: n.label,
      value: pt(n.v),
      color: n.color,
      rawV: n.v
    })), Ct = [
      ...N.map((n) => ({ value: n.v, color: n.color, className: n.isHc ? "fill-hc" : "" })),
      ...p > 5e-4 ? [{ value: p, color: Ut }] : []
    ], Tt = [
      ...N.map((n) => ({
        label: I(n.id, v, t),
        value: `${n.v.toFixed(2)} €`,
        color: n.color,
        rawV: n.v
      })),
      ...p > 5e-4 ? [{ label: t.costSubscription, value: `${p.toFixed(2)} €`, color: Ut, rawV: p }] : []
    ], rt = [
      { label: t.reinjCauseSolarSurplus, v: b.solarSurplus, eur: b.oppSolarEur, color: Y },
      { label: t.reinjCauseBatteryFull, v: b.batteryFull, eur: b.oppBatteryEur, color: J },
      { label: t.reinjCauseSwitchLatency, v: b.switchLatency, eur: b.oppLatencyEur, color: "#ff7043" },
      { label: t.reinjCauseOther, v: b.unattributed, eur: b.oppOtherEur, color: "#90a4ae" }
    ].filter((n) => n.v > 1e-4), xt = rt.reduce((n, D) => n + D.v, 0), ht = _t([xt, ...rt.map((n) => n.v)]), F = rt.map((n) => ({ value: n.v, color: n.color })), Bt = rt.map((n) => ({
      label: n.label,
      value: `${ht(n.v)} · ${n.eur.toFixed(2)} €`,
      color: n.color,
      rawV: n.v
    })), q = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(h), color: Y, fmt: `${h >= 0 ? "+" : ""}${h.toFixed(2)} €`, rawV: h },
      { label: t.ecoSourceBatt, vAbs: Math.abs(g), color: J, fmt: `${g >= 0 ? "+" : ""}${g.toFixed(2)} €`, rawV: g }
    ].filter((n) => n.vAbs > 5e-4), Et = q.reduce((n, D) => n + D.vAbs, 0), Rt = q.length ? q.map((n) => ({ value: n.vAbs, color: n.color })) : Math.abs(G) > 5e-4 ? [{ value: 1, color: G >= 0 ? "#1976d2" : "#c62828" }] : [], yt = q.length ? q.map((n) => ({ label: n.label, value: n.fmt, color: n.color, rawV: n.vAbs })) : [], Gt = this._states(), jt = r && L ? ve(Gt, o.cost, t) : null, ot = U + u.solarBatt.v + b.solarSurplus, ut = _t([
      ot,
      U,
      u.solarBatt.v,
      b.solarSurplus
    ]), Kt = L && ot > 1e-3 ? {
      segments: [
        {
          label: t.solarProdSegHome,
          value: U,
          color: Y,
          icon: "mdi:home-lightning-bolt-outline"
        },
        {
          label: t.solarProdSegBattery,
          value: u.solarBatt.v,
          color: J,
          icon: "mdi:battery-plus-variant"
        },
        {
          label: t.solarProdSegExport,
          value: b.solarSurplus,
          color: ae,
          icon: "mdi:transmission-tower-export"
        }
      ],
      total: ot,
      formatter: (n) => ut(n),
      tooltip: t.solarProdKwhTip
    } : null, re = L && this.hass?.states ? $e(this.hass.states, o.cost) : null, oe = b.solarSurplus + b.batteryFull + b.switchLatency + b.unattributed;
    return m`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${we(v)}${B ? ` ${B}kVA` : ""}</span>
          </div>
          <div class="controls">
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${H()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((n) => m`
                <button class="range-btn ${this._rangePreset === n ? "active" : ""}" @click=${() => this._setRangePreset(n)}>
                  ${t[n]}
                </button>
              `)}
            </div>
            <span class="range-label">${ce(a.startIso, a.endIso, e)}</span>
            ${this._showSection("show_raw_control") ? m`<button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>` : x}
          </div>
        </div>

        ${this._histLoading ? m`<div class="loader">${t.loading}</div>` : x}

        ${this._showSection("show_day_slots") ? m` <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${v === "tempo" ? Jt(S) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${I(w, v, t)}</span>
            </div>
            <div class="day-tile ${v === "tempo" ? Jt($) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${v === "tempo" ? xe($, t) : t.emDash}</span>
            </div>
          </div>
          ${v === "tempo" && y && typeof y == "object" ? m`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${t.tempoDayBlue} : ${y.blue?.remaining ?? 0}/${(y.blue?.elapsed ?? 0) + (y.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${t.tempoDayWhite} : ${y.white?.remaining ?? 0}/${(y.white?.elapsed ?? 0) + (y.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${t.tempoDayRed} : ${y.red?.remaining ?? 0}/${(y.red?.elapsed ?? 0) + (y.red?.remaining ?? 0)}
                  </div>
                </div>
              ` : x}
        </div>` : x}

        ${this._showSection("show_live_power") ? m`
        <hub-power-now
          .i18n=${t}
          .data=${jt}
          .graphOpen=${this._powerGraphOpen}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        <hub-power-graph
          .open=${this._powerGraphOpen}
          .i18n=${t}
          .locale=${e}
          .loading=${this._powerGraphLoading}
          .error=${this._powerGraphErr}
          .displaySeries=${this._powerGraphDisplaySeries()}
          .rollingHours=${this._powerGraphRollingHours}
          .isTodayGraph=${(this._date ?? H()) === H()}
          @hub-power-graph-window=${(n) => {
      const D = n.detail?.hours;
      D != null && this._setPowerGraphRollingHours(D);
    }}
        ></hub-power-graph>` : x}
        ${this._showSection("show_battery_bar") ? m`<hub-energie-battery-bar .i18n=${t} .data=${re} .numberLocale=${e}></hub-energie-battery-bar>` : x}
        ${this._showSection("show_insights_bar") ? m`<hub-insight-bar .i18n=${t} .totalMaison=${T} .originGrid=${f} .totalEur=${c} .ecoTotal=${G}></hub-insight-bar>` : x}
        ${this._showSection("show_red_hp_warning") ? this._renderRedHpWarning(s, v, T, u, t) : x}

        ${this._showSection("show_consumption") ? m`<section>
          <div class="section-head">
            <h3>${t.sectionConsumption}</h3>
            <div class="section-metric">${t.totalEnergy} <b>${pe(T)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${v === "tempo" ? t.consStripGridTitleTempo : t.consStripGridTitle}
              .segments=${St}
              .total=${C}
              .formatter=${X}
              .tooltip=${M.map((n) => `${I(n.id, v, t)}: ${X(n.v)}`).join(" · ")}
              .breakdown=${Pt}
              .showBreakdown=${!0}
              .displayValue=${X(C)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            ${this._showSection("show_solar_production_bar") && Kt ? m`<hub-solar-production-bar .i18n=${t} .kwhData=${Kt}></hub-solar-production-bar>` : x}

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${et}
              .total=${ft}
              .formatter=${tt}
              .tooltip=${dt.map((n) => `${n.label}: ${tt(n.v)}`).join(" · ")}
              .breakdown=${K}
              .showBreakdown=${!0}
              .displayValue=${tt(ft)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${z}
              .total=${wt}
              .formatter=${pt}
              .tooltip=${O.map((n) => `${n.label}: ${pt(n.v)}`).join(" · ")}
              .breakdown=${Ft}
              .showBreakdown=${!0}
              .displayValue=${pt(wt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : x}

        ${this._showSection("show_cost") ? m`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${Ct}
              .total=${c}
              .formatter=${(n) => `${Number(n).toFixed(2)} €`}
              .tooltip=${[
      ...N.map((n) => `${I(n.id, v, t)}: ${n.v.toFixed(2)} €${n.tooltip ? ` (${n.tooltip})` : ""}`),
      ...p > 5e-4 ? [`${t.costSubscription}: ${p.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${Tt}
              .showBreakdown=${!0}
              .displayValue=${`${c.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : x}

        ${this._showSection("show_savings") ? m`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.ecoStripTitle}
              .segments=${Rt}
              .total=${Et}
              .formatter=${(n) => `${Number(n).toFixed(2)} €`}
              .tooltip=${q.map((n) => `${n.label}: ${n.fmt}`).join(" · ")}
              .breakdown=${yt.length ? yt : [{ label: t.emDash, value: `${G >= 0 ? "+" : ""}${G.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${G >= 0 ? "+" : ""}${G.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : x}

        ${this._showSection("show_reinjection") ? m`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${F}
              .total=${xt}
              .formatter=${ht}
              .tooltip=${rt.map((n) => `${n.label}: ${ht(n.v)} · ${n.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${Bt}
              .showBreakdown=${!0}
              .displayValue=${`${ht(xt)} · ${b.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : x}

        ${this._showRaw && this._showSection("show_raw_control") ? m`
              <section>
                <h3>${t.rawDataTitle}</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>${t.rawSectionGridHome}</b>
                      ${j(t.rawLineGridTotal, { value: C.toFixed(3) })}<br />
                      ${j(t.rawLineHouseTotal, { value: T.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionCost}</b>
                      ${j(t.rawLineCostTotal, { value: c.toFixed(3) })}<br />
                      ${j(t.rawLineSubscription, { value: p.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionOrigin}</b>
                      ${j(t.rawLineOriginGrid, { value: f.toFixed(3) })}<br />
                      ${j(t.rawLineOriginSolar, { value: _.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionSavings}</b>
                      ${j(t.rawLineSavingsSolar, { value: h.toFixed(3) })}<br />
                      ${j(t.rawLineSavingsBattery, { value: g.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionImportBySlot}</b>
                      ${M.length > 0 ? M.map((n, D) => m`${D > 0 ? m`<br />` : x}${I(n.id, v, t)}: ${n.v.toFixed(3)} kWh`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionCostBySlot}</b>
                      ${N.length > 0 ? N.map((n, D) => m`${D > 0 ? m`<br />` : x}${I(n.id, v, t)}: ${n.v.toFixed(3)} €`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionUsageDetail}</b>
                      ${u.gridDirect.label} : ${u.gridDirect.v.toFixed(3)}<br />
                      ${u.gridBatt.label} : ${u.gridBatt.v.toFixed(3)}<br />
                      ${u.solarDirect.label} : ${u.solarDirect.v.toFixed(3)}<br />
                      ${u.solarBatt.label} : ${u.solarBatt.v.toFixed(3)}<br />
                      ${u.battHome.label} : ${u.battHome.v.toFixed(3)}
                    </div>
                    <div>
                      <b>${t.rawSectionBattChargeGridSlots}</b>
                      ${this._renderSlotMapRaw(k, v, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionBattChargeSolarSlots}</b>
                      ${this._renderSlotMapRaw(R, v, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionReinjection}</b>
                      ${t.reinjLabelSolarSurplus}
                      ${j(t.reinjLineKwhEur, { kwh: b.solarSurplus.toFixed(3), eur: b.oppSolarEur.toFixed(3) })}<br />
                      ${t.reinjLabelBatteryFull}
                      ${j(t.reinjLineKwhEur, { kwh: b.batteryFull.toFixed(3), eur: b.oppBatteryEur.toFixed(3) })}<br />
                      ${t.reinjLabelSwitchLatency}
                      ${j(t.reinjLineKwhEur, { kwh: b.switchLatency.toFixed(3), eur: b.oppLatencyEur.toFixed(3) })}<br />
                      ${t.reinjLabelOther}
                      ${j(t.reinjLineKwhEur, { kwh: b.unattributed.toFixed(3), eur: b.oppOtherEur.toFixed(3) })}<br />
                      ${t.reinjLabelTotal}
                      ${j(t.reinjLineKwhEur, { kwh: oe.toFixed(3), eur: b.oppTotalEur.toFixed(3) })}
                    </div>
                  </div>
                </div>
              </section>
            ` : x}
      </ha-card>
    `;
  }
}
customElements.get("hub-energie-card-core") || customElements.define("hub-energie-card-core", We);
