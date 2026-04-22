import { i as at, a as st, b as g, A as y, w as ut, I as Jt } from "./i18n.js";
import { C as tt, a as et, b as de, c as $t, d as Qt, e as he } from "./colors.js";
import { S as Gt, r as zt, s as K, C as te, a as Wt, b as Kt, m as ae, i as gt, d as ue, e as ge, c as me, f as be, g as Lt, j as ee, h as fe, o as we, t as O, k as re, l as xe, n as ye } from "./energy-utils.js";
const Ut = [24, 12, 6, 3, 1], it = 6;
function vt(s, t = it) {
  if (!Number.isFinite(s)) return t;
  const e = Math.trunc(s);
  return Ut.includes(e) ? e : Ut.reduce(
    (r, o) => Math.abs(o - e) < Math.abs(r - e) ? o : r,
    t
  );
}
const Pt = "Europe/Paris";
function se(s = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Pt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(s);
}
const I = () => se();
function Y(s) {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!t) return /* @__PURE__ */ new Date(NaN);
  const e = `${t[1]}-${t[2]}-${t[3]}`, r = Number(t[1]), o = Number(t[2]), a = Number(t[3]), i = Date.UTC(r, o - 1, a - 1, 18, 0, 0), l = Date.UTC(r, o - 1, a + 1, 6, 0, 0), c = new Intl.DateTimeFormat("en-CA", {
    timeZone: Pt,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let p = i; p <= l; p += 6e4) {
    const h = c.formatToParts(new Date(p)), d = (f) => h.find((_) => _.type === f)?.value ?? "";
    if (`${d("year")}-${d("month")}-${d("day")}` === e && d("hour") === "00" && d("minute") === "00" && d("second") === "00")
      return new Date(p);
  }
  return /* @__PURE__ */ new Date(NaN);
}
function Bt(s, t) {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!e) return I();
  const r = Number(e[1]), o = Number(e[2]), a = Number(e[3]);
  return new Date(Date.UTC(r, o - 1, a + t)).toISOString().slice(0, 10);
}
function _e(s) {
  const t = Y(s).getTime();
  if (!Number.isFinite(t)) return 0;
  const e = new Intl.DateTimeFormat("en-GB", {
    timeZone: Pt,
    weekday: "short"
  }).format(new Date(t));
  return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[e] ?? 0;
}
const ve = (s) => se(new Date(s));
function $e(s, t) {
  const r = /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? String(s) : I();
  let o;
  if (t === "week") {
    const a = _e(r);
    o = Bt(r, -a);
  } else t === "month" ? o = `${r.slice(0, 7)}-01` : t === "year" ? o = `${r.slice(0, 4)}-01-01` : o = r;
  return { startIso: o, endIso: r };
}
function Vt(s, t) {
  const e = Y(s);
  return Number.isFinite(e.getTime()) ? e.toLocaleDateString(t, {
    timeZone: Pt,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) : String(s);
}
function Se(s, t, e) {
  return s === t ? Vt(t, e) : `${Vt(s, e)} - ${Vt(t, e)}`;
}
const X = (s, t) => {
  const e = parseFloat(s?.[t]?.state);
  return Number.isFinite(e) ? e : 0;
}, W = (s, t, e) => {
  const r = parseFloat(s?.[t]?.attributes?.[e]);
  return Number.isFinite(r) ? r : 0;
}, A = (s, t, e) => {
  const r = s?.[t]?.attributes?.[e];
  if (r == null || r === "") return null;
  const o = Number(r);
  return Number.isFinite(o) ? o : null;
}, E = (s) => {
  const t = Number(s);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}, ke = (s) => {
  const t = Number(s), e = Number.isFinite(t) ? t : 0;
  return e < 1 ? `${Math.round(e * 1e3)} Wh` : `${e.toFixed(2)} kWh`;
}, yt = (s) => {
  const e = (s ?? []).map((r) => Number(r)).filter((r) => Number.isFinite(r)).some((r) => r >= 1);
  return (r) => {
    const o = Number(r), a = Number.isFinite(o) ? o : 0;
    return e ? `${a.toFixed(2)} kWh` : `${Math.round(a * 1e3)} Wh`;
  };
}, Fe = {
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
function Te(s) {
  const t = String(s ?? "").toLowerCase();
  for (const [e, r] of Object.entries(Fe))
    if (t.includes(e)) return r;
  return null;
}
function Me(s) {
  const t = String(s ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(t) || /\b(hc|hp)\b/.test(t);
}
function Le(s) {
  const t = String(s ?? "").toLowerCase();
  return t.includes(" hc") || t.endsWith("hc") || t.includes("heures creuses") || t.includes("off-peak");
}
function Ge(s) {
  const e = String(s ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (!e) return !1;
  const r = e[1], o = parseInt(r.slice(0, 2), 16), a = parseInt(r.slice(2, 4), 16), i = parseInt(r.slice(4, 6), 16);
  return (0.2126 * o + 0.7152 * a + 0.0722 * i) / 255 >= 0.68;
}
function oe(s) {
  const t = Math.max(0, Math.round(s)), e = Math.floor(t / 60), r = t % 60;
  return `${e}h ${r}min`;
}
function Be(s, t, e, r) {
  const o = s?.[t.cost], a = r && o && typeof o == "object" ? { ...s, [t.cost]: { ...o, attributes: r } } : s, i = a?.[t.cost]?.attributes ?? {}, l = String(i.offer ?? "tempo").toLowerCase(), c = String(i.contract_power ?? ""), p = String(i.current_slot ?? ""), h = i.tempo_days ?? null, d = i.today_color ?? null, m = i.tomorrow_color ?? null, f = {
    solarSurplus: W(a, t.cost, "export_due_to_solar_surplus_kwh"),
    batteryFull: W(a, t.cost, "export_due_to_battery_full_or_absent_kwh"),
    switchLatency: W(a, t.cost, "export_due_to_switch_latency_kwh"),
    unattributed: W(a, t.cost, "export_unattributed_kwh"),
    oppTotalEur: W(a, t.cost, "export_opportunity_cost_total_eur"),
    oppSolarEur: W(a, t.cost, "export_opportunity_cost_solar_surplus_eur"),
    oppBatteryEur: W(a, t.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
    oppLatencyEur: W(a, t.cost, "export_opportunity_cost_switch_latency_eur"),
    oppOtherEur: W(a, t.cost, "export_opportunity_cost_unattributed_eur")
  }, _ = i.grid_by_slot_kwh, $ = i.maison_by_slot_kwh, u = Gt.map((x) => ({
    ...x,
    label: K(x.id, l, e),
    v: zt(_, x.id),
    isHc: x.id.endsWith("_hc")
  })), M = Gt.map((x) => ({
    ...x,
    label: K(x.id, l, e),
    v: zt($, x.id),
    isHc: x.id.endsWith("_hc")
  })), S = X(a, t.cost), w = Gt.map((x) => ({
    ...x,
    label: K(x.id, l, e),
    v: W(a, t.cost, `${x.id}_eur`),
    tooltip: `${zt(_, x.id).toFixed(3)} kWh`,
    isHc: x.id.endsWith("_hc")
  })), N = W(a, t.cost, "abonnement_eur"), G = X(a, t.ecoSolar), C = X(a, t.ecoBatt), T = X(a, t.originGrid), b = X(a, t.originSolar), k = {
    gridDirect: { label: e.usageGridDirect, v: X(a, t.usageGridDirect), color: $t },
    gridBatt: { label: e.usageGridBatt, v: X(a, t.usageGridBatt), color: de },
    solarDirect: { label: e.usageSolarDirect, v: X(a, t.usageSolarDirect), color: et },
    solarBatt: { label: e.usageSolarBatt, v: X(a, t.usageSolarBatt), color: "#fbc02d" },
    battHome: { label: e.usageBattHome, v: X(a, t.usageBattHome), color: tt }
  };
  return {
    grid: u,
    maison: M,
    totalEur: S,
    costs: w,
    abo: N,
    ecoSolar: G,
    ecoBatt: C,
    og: T,
    os: b,
    usage: k,
    costEntityOk: !!a[t.cost],
    offer: l,
    contractPower: c,
    currentSlot: p,
    tempoDays: h,
    todayColor: d,
    tomorrowColor: m,
    reinj: f,
    gridBattBySlot: i.usage_grid_batt_charge_by_slot_kwh,
    solarBattBySlot: i.usage_solar_batt_charge_by_slot_kwh
  };
}
async function Ne(s, t, e, r, o, a) {
  const i = /^\d{4}-\d{2}-\d{2}$/.test(String(t)) ? String(t) : I(), l = /^\d{4}-\d{2}-\d{2}$/.test(String(e)) ? String(e) : I();
  let c = Y(i), p = Y(Bt(l, 1));
  Number.isFinite(c.getTime()) || (c = Y(I())), Number.isFinite(p.getTime()) || (p = Y(Bt(I(), 1)));
  const h = new URLSearchParams({
    filter_entity_id: r.join(","),
    end_time: p.toISOString()
  }), d = `history/period/${encodeURIComponent(c.toISOString())}?${h}`, m = await s.callApi("GET", d), f = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), M = a && a !== o ? a : null, S = /* @__PURE__ */ new Map(), w = new Set(r);
  for (const T of Array.isArray(m) ? m : [])
    if (Array.isArray(T))
      for (const b of T) {
        const k = b?.entity_id;
        if (!k || !w.has(k)) continue;
        const x = Date.parse(b?.last_changed ?? b?.last_updated ?? "");
        if (!Number.isFinite(x)) continue;
        const B = ve(x), P = parseFloat(b?.state);
        if (Number.isFinite(P)) {
          f.has(k) || f.set(k, /* @__PURE__ */ new Map());
          const v = f.get(k), F = v.get(B);
          (!F || x >= F.ts) && v.set(B, { ts: x, v: P });
        }
        if (k === o && b?.attributes && typeof b.attributes == "object")
          for (const v of te) {
            const F = parseFloat(b.attributes?.[v]);
            if (!Number.isFinite(F)) continue;
            _.has(v) || _.set(v, /* @__PURE__ */ new Map());
            const D = _.get(v), H = D.get(B);
            (!H || x >= H.ts) && D.set(B, { ts: x, v: F });
          }
        if (M && k === M && b?.attributes && typeof b.attributes == "object") {
          for (const v of Wt) {
            const F = parseFloat(b.attributes?.[v]);
            if (!Number.isFinite(F)) continue;
            $.has(v) || $.set(v, /* @__PURE__ */ new Map());
            const D = $.get(v), H = D.get(B);
            (!H || x >= H.ts) && D.set(B, { ts: x, v: F });
          }
          for (const v of Kt) {
            const F = b.attributes?.[v];
            if (!F || typeof F != "object") continue;
            u.has(v) || u.set(v, /* @__PURE__ */ new Map());
            const D = u.get(v), H = D.get(B);
            (!H || x >= H.ts) && D.set(B, { ts: x, dict: F });
          }
        }
        if (!M && k === o && b?.attributes && typeof b.attributes == "object") {
          for (const v of Wt) {
            const F = parseFloat(b.attributes?.[v]);
            if (!Number.isFinite(F)) continue;
            $.has(v) || $.set(v, /* @__PURE__ */ new Map());
            const D = $.get(v), H = D.get(B);
            (!H || x >= H.ts) && D.set(B, { ts: x, v: F });
          }
          for (const v of Kt) {
            const F = b.attributes?.[v];
            if (!F || typeof F != "object") continue;
            u.has(v) || u.set(v, /* @__PURE__ */ new Map());
            const D = u.get(v), H = D.get(B);
            (!H || x >= H.ts) && D.set(B, { ts: x, dict: F });
          }
        }
        const j = S.get(k);
        (!j || x > j.ts) && S.set(k, { ts: x, state: b });
      }
  const N = (T) => [...T?.values() ?? []].reduce((b, k) => b + (k?.v ?? 0), 0), G = (T) => {
    if (!T) return {};
    const b = {};
    for (const k of T.values())
      if (!(!k?.dict || typeof k.dict != "object"))
        for (const [x, B] of Object.entries(k.dict)) {
          const P = typeof B == "number" ? B : parseFloat(B);
          Number.isFinite(P) && (b[x] = (b[x] ?? 0) + P);
        }
    return b;
  }, C = {};
  for (const T of w) {
    let k = { ...S.get(T)?.state?.attributes ?? {} };
    if (T === o) {
      const x = S.get(o)?.state, B = M ? S.get(M)?.state : null;
      k = ae(B?.attributes, x?.attributes);
      for (const P of te) k[P] = N(_.get(P));
      for (const P of Wt) k[P] = N($.get(P));
      for (const P of Kt) k[P] = G(u.get(P));
    }
    C[T] = {
      entity_id: T,
      state: String(N(f.get(T))),
      attributes: k
    };
  }
  return C;
}
function Pe(s, t, e) {
  if (!s?.[t]) return null;
  const r = A(s, t, "grid_power_signed_w"), o = A(s, t, "solar_power_w") ?? A(s, t, "solar_estimate_power_w"), a = A(s, t, "batt_discharge_power_w"), i = A(s, t, "batt_charge_power_w"), l = A(s, t, "load_power_w"), c = A(s, t, "export_power_w"), p = [];
  return r != null ? p.push(r >= 0 ? `${e.segImport} ${r.toFixed(0)} W` : `${e.segExport} ${Math.abs(r).toFixed(0)} W`) : c != null && c > 0 && p.push(`${e.segExport} ${c.toFixed(0)} W`), o != null && p.push(`${e.segSolar} ${o.toFixed(0)} W`), a != null && a > 0 && p.push(`${e.segBattDis} ${a.toFixed(0)} W`), i != null && i > 0 && p.push(`${e.segBattChg} ${i.toFixed(0)} W`), {
    gridSigned: r,
    solar: o,
    battDis: a,
    battChg: i,
    load: l,
    exportW: c,
    tooltip: [e.powerBarTip, p.length ? p.join(" · ") : ""].filter(Boolean).join(" — ")
  };
}
function De(s, t) {
  const e = A(s, t, "battery_capacity_kwh"), r = A(s, t, "battery_soc_percent");
  if (e == null || e <= 0 || r == null) return null;
  const o = A(s, t, "battery_soc_min_percent"), a = A(s, t, "battery_soc_max_percent");
  return {
    soc: r,
    socMin: o ?? 0,
    socMax: a ?? 100,
    capacity: e,
    available: A(s, t, "battery_available_kwh"),
    chargeW: A(s, t, "batt_charge_power_w"),
    dischargeW: A(s, t, "batt_discharge_power_w")
  };
}
function Nt(...s) {
  const t = /* @__PURE__ */ new Set();
  for (const e of s)
    for (const r of e) t.add(r);
  return [...t].sort((e, r) => e - r);
}
function Q(s, t) {
  let e = 0, r = null;
  const o = [];
  for (const a of t) {
    for (; e < s.length && s[e].ts <= a; )
      r = s[e].w, e++;
    o.push(r);
  }
  return o;
}
function Ce(s) {
  if (typeof s == "number" && Number.isFinite(s)) return s;
  if (typeof s == "string") {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}
function mt(s, t = {}) {
  const e = !!t.allowNegative;
  if (!Array.isArray(s) || !s.length) return [];
  const r = [];
  for (const o of s) {
    const a = Ce(o?.start), i = o?.mean ?? o?.state ?? o?.min ?? o?.max;
    if (!Number.isFinite(a) || i == null) continue;
    const l = parseFloat(i);
    if (!Number.isFinite(l)) continue;
    const c = e ? l : Math.max(0, l);
    r.push({ ts: a, w: c });
  }
  return r.sort((o, a) => o.ts - a.ts), r;
}
function He(s) {
  if (!s || typeof s != "object") return [];
  const t = /* @__PURE__ */ new Set(), e = [], r = (o) => {
    if (o == null || typeof o != "string") return;
    const a = o.trim();
    !a || t.has(a) || (t.add(a), e.push(a));
  };
  for (const o of s.grid_entities ?? [])
    typeof o == "string" && r(o);
  r(s.solar_entity);
  for (const o of s.batteries ?? [])
    o?.mode === "net" ? r(o.entity) : o?.mode === "in_out" && (r(o.in), r(o.out));
  return r(s.load_entity), e;
}
async function Ie(s, { startTimeIso: t, endTimeIso: e, statisticIds: r, period: o = "5minute" }) {
  const a = s?.connection;
  if (!a?.sendMessagePromise)
    throw new Error("Home Assistant WebSocket not available");
  const i = await a.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: t,
    end_time: e,
    statistic_ids: r,
    period: o,
    types: ["mean", "state"]
  });
  if (i && typeof i == "object" && i.success === !1)
    throw new Error(i.error?.message ?? "recorder/statistics_during_period failed");
  if (i && typeof i == "object" && "result" in i && i.result !== void 0 && !Array.isArray(i.result)) {
    const l = i.result;
    if (l && typeof l == "object") return l;
  }
  return i;
}
function Re(s, t) {
  const e = s.grid_entities;
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const i of e) {
    const l = typeof i == "string" ? i.trim() : "";
    l && r.push(mt(t[l], { allowNegative: !0 }));
  }
  if (!r.length) return [];
  const o = Nt(...r.map((i) => i.map((l) => l.ts)));
  let a = o.map(() => 0);
  for (const i of r) {
    const l = Q(i, o);
    a = a.map((c, p) => c + (l[p] ?? 0));
  }
  return o.map((i, l) => ({ ts: i, w: a[l] }));
}
function Ee(s, t) {
  const e = s.batteries ?? [];
  if (!Array.isArray(e) || !e.length) return [];
  const r = [];
  for (const i of e)
    if (i?.mode === "net" && i.entity) {
      const l = String(i.entity), c = mt(t[l], { allowNegative: !0 }).map((p) => {
        const h = i.net_sign === "positive_charge" ? -p.w : p.w;
        return { ts: p.ts, w: h };
      });
      r.push(c);
    } else if (i?.mode === "in_out") {
      const l = i.in ? String(i.in) : "", c = i.out ? String(i.out) : "", p = l ? mt(t[l]) : [], h = c ? mt(t[c]) : [], d = Nt(
        p.map((_) => _.ts),
        h.map((_) => _.ts)
      );
      if (!d.length) {
        r.push([]);
        continue;
      }
      const m = p.length ? Q(p, d) : d.map(() => null), f = h.length ? Q(h, d) : d.map(() => null);
      r.push(
        d.map((_, $) => ({
          ts: _,
          w: (f[$] ?? 0) - (m[$] ?? 0)
        }))
      );
    }
  if (!r.length) return [];
  const o = Nt(...r.map((i) => i.map((l) => l.ts)));
  let a = o.map(() => 0);
  for (const i of r) {
    if (!i.length) continue;
    const l = Q(i, o);
    a = a.map((c, p) => c + (l[p] ?? 0));
  }
  return o.map((i, l) => ({ ts: i, w: a[l] }));
}
function je(s, t) {
  if (!s || typeof s != "object" || !t || typeof t != "object") return null;
  const e = typeof s.solar_entity == "string" ? s.solar_entity.trim() : "", r = typeof s.load_entity == "string" ? s.load_entity.trim() : "", o = Re(s, t), a = e ? mt(t[e]) : [], i = Ee(s, t), l = r ? mt(t[r]) : [], c = Nt(
    o.map((w) => w.ts),
    a.map((w) => w.ts),
    i.map((w) => w.ts),
    l.map((w) => w.ts)
  );
  if (!c.length) return null;
  const p = o.length ? Q(o, c) : c.map(() => null), h = a.length ? Q(a, c) : c.map(() => null), d = i.length ? Q(i, c) : c.map(() => null), m = l.length ? Q(l, c) : c.map(() => null), f = c.map((w, N) => ({
    ts: w,
    grid: p[N],
    solar: h[N],
    batt: d[N],
    load: m[N]
  }));
  if (!f.some((w) => w.grid != null || w.solar != null || w.batt != null || w.load != null))
    return null;
  let _ = 0, $ = 0, u = 0, M = l.length ? 0 : null;
  const S = [];
  for (const w of f)
    w.grid != null && (_ = w.grid), w.solar != null && ($ = w.solar), w.batt != null && (u = w.batt), l.length && w.load != null && (M = w.load), S.push({ ts: w.ts, grid: _, solar: $, batt: u, load: l.length ? M : null });
  return { filled: S };
}
function Oe(s) {
  let t = 0, e = 1;
  for (const r of s) {
    const o = [];
    r.load != null && Number.isFinite(r.load) && o.push(r.load), r.solar != null && Number.isFinite(r.solar) && o.push(r.solar);
    const a = r.batt;
    a != null && Number.isFinite(a) && o.push(Math.max(0, a), Math.max(0, -a)), r.grid != null && Number.isFinite(r.grid) && o.push(r.grid);
    for (const i of o)
      t = Math.min(t, i), e = Math.max(e, i);
  }
  return e - t < 1 && (e = t + 1), { yMin: t, yMax: e };
}
function Ae(s, t) {
  if (!s?.states || !t || typeof t != "object") return null;
  const e = s.states, r = (f) => {
    if (f == null || typeof f != "string") return null;
    const _ = f.trim();
    if (!_ || !e[_]) return null;
    const $ = parseFloat(e[_].state);
    return Number.isFinite($) ? $ : null;
  };
  let o = 0, a = 0;
  for (const f of t.grid_entities ?? []) {
    if (typeof f != "string") continue;
    const _ = r(f);
    _ != null && (o += _, a++);
  }
  const i = typeof t.solar_entity == "string" ? t.solar_entity.trim() : "", l = i ? r(i) : null, c = l != null ? Math.max(0, l) : null, p = typeof t.load_entity == "string" ? t.load_entity.trim() : "", h = p ? r(p) : null;
  let d = 0, m = 0;
  for (const f of t.batteries ?? [])
    if (f?.mode === "net" && f.entity) {
      const _ = r(String(f.entity));
      if (_ != null) {
        const $ = f.net_sign === "positive_charge" ? -_ : _;
        d += $, m++;
      }
    } else if (f?.mode === "in_out") {
      const _ = f.in ? r(String(f.in)) : null, $ = f.out ? r(String(f.out)) : null;
      (_ != null || $ != null) && (d += ($ ?? 0) - (_ ?? 0), m++);
    }
  return !a && c == null && !m && h == null ? null : {
    solar: c,
    batt: m > 0 ? d : null,
    grid: a > 0 ? o : null,
    load: h
  };
}
function ze(s, t) {
  if (!s?.length) return [];
  if (!t) return s;
  const e = s[s.length - 1], o = {
    ts: Math.max(Date.now(), e.ts + 1),
    solar: t.solar != null ? t.solar : e.solar ?? 0,
    batt: t.batt != null ? t.batt : e.batt ?? 0,
    grid: t.grid != null ? t.grid : e.grid ?? 0,
    load: t.load != null ? t.load : e.load != null ? e.load : null
  };
  return [...s, o];
}
class We extends at {
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
    return st`
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
    return e.map((o) => g`
      <span
        class="fill-seg ${o.className ?? ""}"
        style="width:${(Number(o.value) / r * 100).toFixed(1)}%;background-color:${o.color}"
      ></span>
    `);
  }
  _renderBreakdown() {
    const t = this.breakdown ?? [];
    if (!this.showBreakdown || !t.length) return y;
    const e = Number(this.total) || 0;
    return g`
      <div class="icon-brk">
        ${t.map((r) => {
      const o = r.icon ?? (Me(r.label) ? "mdi:transmission-tower" : Te(r.label)), a = Ge(r.color) ? "swatch-icon-dark" : "";
      return g`
            <span class="icon-brk-item">
              ${r.color ? g`<span
                    class="icon-brk-swatch ${Le(r.label) ? "fill-hc" : ""} ${a}"
                    style="background-color:${r.color}"
                  >
                    ${o ? g`<ha-icon icon=${o}></ha-icon>` : y}
                  </span>` : o ? g`<ha-icon icon=${o}></ha-icon>` : y}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${e > 0 && r.rawV != null ? g`<span class="icon-brk-pct">(${Math.round(Number(r.rawV) / e * 100)}%)</span>` : y}
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
      return g`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    const e = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return g`
      <div class="cons-strip">
        <div class="cons-strip-cap">${this.title}</div>
        <div class="bar-wrap" title=${this.tooltip || y}>
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
customElements.get("hub-energy-strip") || customElements.define("hub-energy-strip", We);
class Ke extends at {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      /** When true, power history panel is open (for aria-expanded). */
      graphOpen: { type: Boolean }
    };
  }
  static get styles() {
    return st`
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
    if (t == null) return y;
    const e = t.gridSigned != null ? Math.max(0, t.gridSigned) : 0, r = [];
    t.gridSigned != null && e > 0 && r.push({ w: e, c: $t, t: `${this.i18n.segImport} +${E(e)}` }), t.battDis != null && t.battDis > 0 && r.push({ w: t.battDis, c: tt, t: `${this.i18n.segBattDis} +${E(t.battDis)}` }), t.solar != null && t.solar > 0 && r.push({ w: t.solar, c: et, t: `${this.i18n.segSolar} ${E(t.solar)}` });
    const o = r.reduce((h, d) => h + d.w, 0), a = t.gridSigned != null ? E(t.gridSigned) : t.exportW != null && t.exportW > 0 ? E(-t.exportW) : "—", i = t.solar != null ? E(t.solar) : "—", l = t.battDis != null || t.battChg != null ? (t.battDis ?? 0) - (t.battChg ?? 0) : null, c = l != null ? E(l) : "—", p = t.load != null ? E(t.load) : "—";
    return g`
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
            ${o > 1 ? r.map((h) => g`
                  <span
                    class="pnl-seg"
                    style="width:${(h.w / o * 100).toFixed(1)}%;background:${h.c}"
                    title=${h.t}
                  ></span>
                `) : g`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${p} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${$t}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${a}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${et}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${i}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || y}>
            <span class="icon-brk-swatch" style="background-color:${tt}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${c}</b>
          </span>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-power-now") || customElements.define("hub-power-now", Ke);
class Ve extends at {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      /** kWh split: { segments: [{ label, value, color, icon? }], total, formatter, tooltip } */
      kwhData: { attribute: !1 }
    };
  }
  static get styles() {
    return st`
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
      return r.length ? g`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.i18n.solarProdTitle}</div>
          <div class="bar-wrap" title=${t.tooltip ?? y}>
            <div class="track">
              <div class="fill-stack" style="width:100%">
                ${r.map(
        (o) => g`
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
        (o) => g`
                <span class="icon-brk-item">
                  <span class="icon-brk-swatch" style="background-color:${o.color}">
                    ${o.icon ? g`<ha-icon icon=${o.icon}></ha-icon>` : y}
                  </span>
                  <span>${o.label}</span>&nbsp;<b>${e(o.value)}</b>
                  ${t.total > 0 ? g`<span class="icon-brk-pct"
                        >(${Math.round(Number(o.value) / t.total * 100)}%)</span
                      >` : y}
                </span>
              `
      )}
          </div>
        </div>
      ` : y;
    }
    return y;
  }
}
customElements.get("hub-solar-production-bar") || customElements.define("hub-solar-production-bar", Ve);
const Xe = 100, Ue = 12, qe = 168;
function Ye(s, t, e, r) {
  const o = Math.max(0, Number(t) || 0), a = Math.max(0, Number(e) || 0), i = Math.max(0, Number(r) || 0), l = Math.max(0, Number(s) || 0);
  if (l < 1e-6) return { b: 0, g: 0, s: 0 };
  const c = a + o + i;
  if (c > l + 1e-6) {
    const f = l / c;
    return { b: a * f, g: o * f, s: i * f };
  }
  let p = Math.min(a, l), h = l - p, d = Math.min(o, h);
  h -= d;
  let m = Math.min(i, h);
  return h -= m, h > 1 && (m += h), { b: p, g: d, s: m };
}
function Ze(s) {
  const t = s.length, e = new Array(t), r = new Array(t), o = new Array(t);
  for (let a = 0; a < t; a++) {
    const i = s[a];
    let c = i.load != null && Number.isFinite(i.load) ? Math.max(0, i.load) : NaN;
    const p = Math.max(0, i.grid ?? 0), h = Math.max(0, i.batt ?? 0), d = Math.max(0, i.solar ?? 0);
    Number.isFinite(c) || (c = p + h + d);
    const m = Ye(c, i.grid ?? 0, i.batt ?? 0, i.solar ?? 0);
    e[a] = m.b, r[a] = m.g, o[a] = m.s;
  }
  return { sliceBatt: e, sliceGrid: r, sliceSolar: o };
}
function _t(s, t, e, r, o) {
  if (!s?.length || !Number.isFinite(t) || !Number.isFinite(e) || e <= t) return "";
  const a = e - t, i = s.length, l = [], c = (h) => i === 1 ? 0 : h / (i - 1) * r, p = (h) => o - (Number(h) - t) / a * o;
  for (let h = 0; h < i; h++) {
    const d = Number(s[h]);
    l.push({ x: c(h), y: p(Number.isFinite(d) ? d : 0) });
  }
  return `M ${l[0].x.toFixed(2)} ${l[0].y.toFixed(2)} ${l.slice(1).map((h) => `L ${h.x.toFixed(2)} ${h.y.toFixed(2)}`).join(" ")}`;
}
function Xt(s, t, e, r, o, a) {
  if (!s?.length || s.length !== t?.length) return "";
  const i = Math.max(r - e, 1e-9), l = s.length, c = (d) => l === 1 ? 0 : d / (l - 1) * o, p = (d) => a - (Number(d) - e) / i * a;
  let h = "";
  for (let d = 0; d < l; d++) {
    const m = c(d), f = p(Number(t[d]));
    h += d === 0 ? `M ${m.toFixed(2)} ${f.toFixed(2)}` : ` L ${m.toFixed(2)} ${f.toFixed(2)}`;
  }
  for (let d = l - 1; d >= 0; d--) {
    const m = c(d), f = p(Number(s[d]));
    h += ` L ${m.toFixed(2)} ${f.toFixed(2)}`;
  }
  return h += " Z", h;
}
function ie(s, t) {
  if (!s || s.width <= 0) return 50;
  const e = (t - s.left) / s.width * 100, r = Ue, o = typeof window < "u" ? window : null, a = o?.visualViewport ?? null, i = Number.isFinite(a?.offsetLeft) ? a.offsetLeft : 0, l = a && Number.isFinite(a.width) && a.width > 0 ? a.width : o?.innerWidth ?? 1e9, c = Math.min(
    qe,
    Math.max(Xe, l * 0.48)
  );
  let p = Math.max(-8, Math.min(108, e)), h = s.left + p / 100 * s.width;
  if (Number.isFinite(l) && l > 2 * (c + r)) {
    const d = i + c + r, m = i + l - c - r;
    h = Math.max(d, Math.min(m, h)), p = (h - s.left) / s.width * 100;
  }
  return Math.round(p * 10) / 10;
}
class Je extends at {
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
    return st`
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
    const e = t.querySelector(".power-graph-svg-wrap"), r = e?.querySelector("svg"), o = this.displaySeries, a = e?.getBoundingClientRect(), i = r?.getBoundingClientRect();
    if (!o?.pts?.length || !a?.width || !i?.width) return;
    const l = o.pts.length, c = Math.max(0, Math.min(l - 1, this._hoverIdx)), p = l <= 1 ? 0.5 : c / Math.max(l - 1, 1), h = i.left + p * i.width, d = ie(a, h);
    this._tooltipXPct !== d && (this._tooltipXPct = d);
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
    const a = (e - o.left) / o.width, i = r.pts.length, l = Math.max(0, Math.min(i - 1, Math.round(a * Math.max(i - 1, 1)))), p = t.closest(".power-graph-svg-wrap")?.getBoundingClientRect(), h = p && p.width > 0 ? ie(p, e) : i <= 1 ? 50 : l / Math.max(i - 1, 1) * 100;
    this._hoverIdx !== l && (this._hoverIdx = l), this._tooltipXPct !== h && (this._tooltipXPct = h);
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
    if (!this.open) return y;
    const t = this.i18n ?? {}, e = this.locale ?? "fr-FR", r = $t, o = et, a = tt, i = "#2e7d32", l = "var(--primary-text-color, #e0e0e0)";
    if (this.loading)
      return g`<div class="power-graph"><div class="loader">${t.loading}</div></div>`;
    if (this.error)
      return g`<div class="power-graph"><div class="alert">${this.error}</div></div>`;
    const c = this.displaySeries;
    if (!c?.pts?.length)
      return g`<div class="power-graph"><div class="loader">${t.noData}</div></div>`;
    const p = 320, h = 120, d = c.yMin ?? 0, m = c.yMax ?? 1, f = c.pts.map((L) => L.solar ?? 0), _ = c.pts.map((L) => Math.max(0, L.batt ?? 0)), $ = c.pts.map((L) => Math.max(0, -(L.batt ?? 0))), u = c.pts.map((L) => L.grid ?? 0), M = c.hasLoadEntity === !0, S = M ? c.pts.map((L) => L.load == null ? 0 : L.load) : [], w = (L) => new Intl.DateTimeFormat(e, { hour: "2-digit", minute: "2-digit" }).format(new Date(L)), N = (L) => new Intl.DateTimeFormat(e, { dateStyle: "short", timeStyle: "short" }).format(new Date(L)), G = c.pts[0].ts, C = c.pts[c.pts.length - 1].ts, T = G + (C - G) / 3, b = G + (C - G) * 2 / 3, k = _t(f, d, m, p, h), x = _t(_, d, m, p, h), B = _t($, d, m, p, h), P = _t(u, d, m, p, h), j = M && S.length ? _t(S, d, m, p, h) : "";
    let v = "", F = "", D = "";
    if (M && S.length) {
      const { sliceBatt: L, sliceGrid: Tt, sliceSolar: Rt } = Ze(c.pts), J = L.length, Et = new Array(J).fill(0), Mt = L.slice(), xt = L.map((dt, ht) => dt + Tt[ht]), jt = L.map((dt, ht) => dt + Tt[ht] + Rt[ht]);
      v = Xt(Et, Mt, d, m, p, h), F = Xt(Mt, xt, d, m, p, h), D = Xt(xt, jt, d, m, p, h);
    }
    const H = `color-mix(in srgb, ${tt} 30%, transparent)`, Z = `color-mix(in srgb, ${$t} 30%, transparent)`, bt = `color-mix(in srgb, ${et} 30%, transparent)`, nt = "color-mix(in srgb, var(--divider-color) 70%, transparent)", lt = Math.max(m - d, 1e-9), ct = (L) => h - (L - d) / lt * h, pt = (d + m) / 2, ft = E(m), Dt = E(pt), z = E(d), rt = ct(pt), Ct = d < 0 && m > 0, St = ct(0), U = c.pts.length, q = this._hoverIdx, V = q != null && q >= 0 && q < U ? c.pts[q] : null, kt = U <= 1 ? p / 2 : (q ?? 0) / Math.max(U - 1, 1) * p, Ht = this._tooltipXPct != null ? this._tooltipXPct : U <= 1 ? 50 : (q ?? 0) / Math.max(U - 1, 1) * 100, Ft = Y(c.dayIso), It = Number.isFinite(Ft.getTime()) ? new Intl.DateTimeFormat(e, { dateStyle: "medium" }).format(Ft) : c.dayIso, ot = String(t.powerHistoryFullDay).replace("{date}", It), wt = vt(
      this.rollingHours,
      it
    );
    return g`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${t.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${this.isTodayGraph ? g`<div class="power-graph-window-btns">
                  <span class="range-label">${t.powerHistoryWindow}</span>
                  ${Ut.map(
      (L) => g`
                      <button
                        type="button"
                        class="range-btn ${wt === L ? "active" : ""}"
                        @click=${() => this._emitWindowHours(L)}
                      >
                        ${L}h
                      </button>
                    `
    )}
                </div>` : g`<div class="power-graph-archive-day">${ot}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${ft}</span>
            <span>${Dt}</span>
            <span>${z}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${V ? g`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${Ht}%">
                    <div class="power-graph-tooltip-h">
                      ${t.powerGraphTooltipTime}: ${N(V.ts)}
                    </div>
                    ${M ? g`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${l}"
                              >${t.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${V.load != null ? E(V.load) : t.emDash}</span
                            >
                          </div>
                        ` : y}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${o}"
                        >${t.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${E(V.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${a}"
                        >${t.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${E(Math.max(0, V.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${i}"
                        >${t.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${E(Math.max(0, -(V.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${r}"
                        >${t.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${E(V.grid ?? 0)}</span>
                    </div>
                  </div>
                ` : y}
            <svg
              viewBox="0 0 ${p} ${h}"
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
              <g class="power-grid-lines" stroke="${nt}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${p}" y2="0"></line>
                <line x1="0" y1="${rt}" x2="${p}" y2="${rt}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${h}" x2="${p}" y2="${h}"></line>
                ${Ct ? ut`<line
                      x1="0"
                      y1="${St}"
                      x2="${p}"
                      y2="${St}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>` : y}
                <line x1="0" y1="0" x2="0" y2="${h}" stroke-width="1"></line>
              </g>
              ${v ? ut`<path
                    d="${v}"
                    fill="${H}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              ${F ? ut`<path
                    d="${F}"
                    fill="${Z}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              ${D ? ut`<path
                    d="${D}"
                    fill="${bt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>` : y}
              <path
                d="${P}"
                fill="none"
                stroke="${r}"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${B}"
                fill="none"
                stroke="${i}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${x}"
                fill="none"
                stroke="${a}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${k}"
                fill="none"
                stroke="${o}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${j ? ut`<path
                    d="${j}"
                    fill="none"
                    stroke="${l}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>` : y}
              ${q != null ? ut`<line
                    pointer-events="none"
                    x1="${kt}"
                    y1="0"
                    x2="${kt}"
                    y2="${h}"
                    stroke="${nt}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>` : y}
            </svg>
          </div>
        </div>
        <div class="power-xaxis">
          <span>${w(G)}</span>
          <span>${w(T)}</span>
          <span>${w(b)}</span>
          <span>${w(C)}</span>
        </div>
        <div class="power-graph-legend" aria-hidden="true">
          ${M ? g`<span class="power-graph-chip"
                ><span
                  class="power-graph-swatch power-graph-swatch-line"
                  style="--swatch-line:${l}"
                ></span
                >${t.houseLoad}</span
              >` : y}
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
              style="--swatch-line:${i}"
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
customElements.get("hub-power-graph") || customElements.define("hub-power-graph", Je);
class Qe extends at {
  static get properties() {
    return {
      i18n: { attribute: !1 },
      data: { attribute: !1 },
      numberLocale: { type: String, attribute: "number-locale" }
    };
  }
  static get styles() {
    return st`
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
          time: oe(r / o * 60)
        };
    } else if (t.dischargeW != null && t.dischargeW > 0) {
      const e = t.capacity * (t.soc ?? 0) / 100, r = t.dischargeW / 1e3;
      if (r > 0)
        return {
          icon: "mdi:battery-low",
          time: oe(e / r * 60)
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
    if (!t || t.soc == null || t.capacity == null || t.capacity <= 0) return y;
    const e = Math.max(0, Math.min(100, Number(t.socMin ?? 0)));
    let r = Math.max(e, Math.min(100, Number(t.socMax ?? 100)));
    const o = Math.max(0, Math.min(100, Number(t.soc))), a = Math.min(r, Math.max(e, o));
    let i = a;
    const l = t.capacity, c = t.available;
    if (c != null && Number.isFinite(c) && l > 0) {
      const N = e + c / l * 100;
      i = Math.min(Math.max(N, e), a, r);
    }
    const p = c != null && Number.isFinite(c) ? c : l * Math.max(0, a - e) / 100, h = Math.round(o).toLocaleString(this.numberLocale ?? "fr-FR"), d = `${this._fmtKwh(p)} / ${this._fmtKwh(l)} kWh (${h} %)`, m = this._flowMode(t), f = m === "charging" ? "batt-green--charging" : m === "discharging" ? "batt-green--discharging" : "", _ = 18, $ = 100 / _, u = (N) => Math.max(0, Math.min(1, N)), M = (N, G, C, T) => Math.max(0, Math.min(G, T) - Math.max(N, C)), S = Array.from({ length: _ }, (N, G) => {
      const C = G * $, T = (G + 1) * $, b = M(C, T, C, e) / $ * 100, k = M(C, T, r, T) / $ * 100, x = Math.max(C, e), B = Math.min(T, i, r), P = M(C, T, x, B) / $ * 100, j = u((x - C) / $) * 100, v = `--hatch-l:${b.toFixed(3)};--hatch-r:${k.toFixed(3)};--fill-x:${j.toFixed(
        3
      )};--fill-w:${P.toFixed(3)};`;
      return g`<div class="batt-cell" style="${v}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    }), w = this._resolveEta();
    return g`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(o)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${f}">${S}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${d}</span>
              </div>
              ${w ? g`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${w.icon}></ha-icon>
                    <span>${w.time}</span>
                  </div>` : y}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.get("hub-energie-battery-bar") || customElements.define("hub-energie-battery-bar", Qe);
class tr extends at {
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
    return st`
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
    if (!(this.totalMaison > 0)) return y;
    const t = Math.max(
      0,
      Math.min(100, Math.round((1 - Math.min(this.originGrid, this.totalMaison) / this.totalMaison) * 100))
    ), e = t >= 60 ? "eco" : t >= 30 ? "" : "warn", r = this.ecoTotal >= 0 ? "−" : "+", o = this.ecoTotal >= 0 ? "eco" : "neg";
    return g`
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
customElements.get("hub-insight-bar") || customElements.define("hub-insight-bar", tr);
class er extends at {
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
    return st`
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
    super(), this._config = {}, this._date = I(), this._rangePreset = "day", this._showRaw = !1, this._hist = null, this._histLoading = !1, this._histErr = null, this.__lastKey = null, this._powerGraphOpen = !1, this._powerGraphLoading = !1, this._powerGraphErr = null, this._powerGraphSeries = null, this._hassRetryTimer = null, this._costMissingSinceMs = null, this._powerGraphPollTimer = null, this._liveStatePollTimer = null, this.__livePollSnap = null, this._powerGraphLoadId = 0, this._powerGraphRollingHours = it;
  }
  connectedCallback() {
    super.connectedCallback(), requestAnimationFrame(() => requestAnimationFrame(() => this.requestUpdate()));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearHassRetryTimer(), this._clearPowerGraphPollTimer(), this._clearLiveStatePollTimer(), this._costMissingSinceMs = null;
  }
  _clearPowerGraphPollTimer() {
    this._powerGraphPollTimer != null && (clearInterval(this._powerGraphPollTimer), this._powerGraphPollTimer = null);
  }
  _clearLiveStatePollTimer() {
    this._liveStatePollTimer != null && (clearInterval(this._liveStatePollTimer), this._liveStatePollTimer = null);
  }
  /**
   * Home Assistant may update entity attributes in-place on ``hass.states`` without replacing
   * the ``hass`` object, so Lit never runs ``shouldUpdate``. Poll the cost fingerprint in live
   * mode and force a repaint when it changes.
   */
  _syncLiveStatePollTimer() {
    if (this._clearLiveStatePollTimer(), !this.hass || !this._isLiveMode()) return;
    let t, e;
    try {
      t = this._map().cost, e = this._payloadEntityId() ?? t;
    } catch {
      return;
    }
    gt(this.hass.states, t) && (e !== t && !gt(this.hass.states, e) || (this._liveStatePollTimer = window.setInterval(() => {
      if (!this.hass || !this._isLiveMode()) return;
      let r;
      try {
        r = this._stateKey();
      } catch {
        this.__livePollSnap = null, this.requestUpdate();
        return;
      }
      r !== this.__livePollSnap && (this.__livePollSnap = r, this.__lastKey = null, this.requestUpdate());
    }, 4e3)));
  }
  /** Refresh interval only while the graph shows the current Paris day (live tail). */
  _syncPowerGraphPollTimer() {
    if (this._clearPowerGraphPollTimer(), !this._powerGraphOpen || !this.hass || (this._date ?? I()) !== I()) return;
    const e = parseFloat(this._config?.power_history_refresh_seconds), r = Number.isFinite(e) && e > 0 ? Math.max(15e3, Math.min(3e5, Math.round(e * 1e3))) : 12e4;
    this._powerGraphPollTimer = window.setInterval(() => {
      this._powerGraphOpen && this.hass && this._loadPowerGraph({ refresh: !0 });
    }, r);
  }
  _setPowerGraphRollingHours(t) {
    const e = vt(t, it);
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
    if (gt(r, t))
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
    const e = parseFloat(this._config?.power_history_hours), r = vt(
      Number.isFinite(e) ? e : NaN,
      it
    );
    this._powerGraphRollingHours !== r && (this._powerGraphRollingHours = r, this.__lastKey = null), this.requestUpdate();
  }
  /** 0-based Hub Énergie site index from card YAML (``site_index``); null = auto when only one site. */
  _siteIndexFromConfig() {
    const t = this._config?.site_index;
    if (t === "" || t === void 0 || t === null) return null;
    const e = Math.trunc(Number(t));
    return Number.isFinite(e) && e >= 0 ? e : null;
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
          if (!gt(this.hass.states, e.cost))
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
  firstUpdated(t) {
    super.firstUpdated(t), this.__livePollSnap = null, this._syncLiveStatePollTimer();
  }
  updated(t) {
    super.updated(t), (t.has("hass") || t.has("_date") || t.has("_rangePreset")) && (this._loadHistory(), this.__livePollSnap = null, this._syncLiveStatePollTimer()), this._powerGraphOpen && (t.has("_date") || t.has("_powerGraphRollingHours")) && this.hass && (this._powerGraphSeries = null, this._powerGraphErr = null, this._loadPowerGraph({ force: !0 }), this._syncPowerGraphPollTimer());
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? Jt.en : Jt.fr;
  }
  /** Section visibility: default on; explicit false hides. */
  _showSection(t) {
    const e = this._config?.[t];
    return e !== !1 && e !== "false";
  }
  _map() {
    const t = this.hass?.states, e = ue(t, this._siteIndexFromConfig()), r = t?.[e]?.attributes;
    return ge(r, ye(), e);
  }
  /** ``sensor.*_lovelace_card`` (Frontend) for live W / kWh card attrs; falls back to ``cost_detail``. */
  _payloadEntityId() {
    const t = this.hass?.states;
    if (!t) return null;
    let e;
    try {
      e = this._map();
    } catch {
      return null;
    }
    if (e.lovelaceCard && t[e.lovelaceCard]) return e.lovelaceCard;
    const r = me(t, this._siteIndexFromConfig());
    return r && t[r]?.attributes?.[be] === !0 ? r : e.cost;
  }
  _mergedCostAttributes() {
    const t = this.hass?.states;
    if (!t) return {};
    let e;
    try {
      e = this._map();
    } catch {
      return {};
    }
    const r = e.cost, o = this._payloadEntityId();
    return r ? ae(
      o ? t[o]?.attributes : void 0,
      t[r]?.attributes
    ) : {};
  }
  _getRange() {
    return $e(this._date ?? I(), this._rangePreset ?? "day");
  }
  _isLiveMode() {
    const t = this._getRange();
    return (this._rangePreset ?? "day") === "day" && t.endIso === I();
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
    const r = this._map(), o = this._payloadEntityId() ?? r.cost, a = [
      r.cost,
      r.lovelaceCard,
      r.ecoSolar,
      r.ecoBatt,
      r.originGrid,
      r.originSolar,
      r.usageGridDirect,
      r.usageGridBatt,
      r.usageSolarDirect,
      r.usageSolarBatt,
      r.usageBattHome
    ], i = this._mergedCostAttributes(), l = i.card_site_segment, c = i.card_entity_ids, p = c && typeof c == "object" ? Object.keys(c).sort().map((d) => `${d}:${c[d]}`).join("|") : "", h = [
      String(this._siteIndexFromConfig() ?? ""),
      r.cost,
      l ?? "",
      p,
      i.offer ?? "",
      i.contract_power ?? "",
      i.tariff_fetched_at ?? "",
      i.current_slot ?? "",
      i.reinjection_cause ?? "",
      String(i.reinjection_confidence ?? ""),
      this._fingerprintTempoDays(i.tempo_days),
      i.grid_power_signed_w ?? "",
      i.solar_power_w ?? "",
      i.solar_estimate_power_w ?? "",
      i.batt_discharge_power_w ?? "",
      i.batt_charge_power_w ?? "",
      i.load_power_w ?? "",
      i.export_power_w ?? "",
      i.battery_soc_percent ?? "",
      i.battery_capacity_kwh ?? "",
      Lt(i.grid_by_slot_kwh),
      Lt(i.maison_by_slot_kwh),
      Lt(i.usage_grid_batt_charge_by_slot_kwh),
      Lt(i.usage_solar_batt_charge_by_slot_kwh),
      e[r.cost]?.last_updated ?? "",
      e[o]?.last_updated ?? ""
    ].join("|");
    return `${a.map((d) => e[d]?.state ?? "").join("|")}|${h}`;
  }
  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }
  _extract(t) {
    const e = this._isLiveMode() ? this._mergedCostAttributes() : void 0;
    return Be(this._states(), this._map(), t, e);
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
  _onSiteChange(t) {
    t.stopPropagation();
    const e = t.target;
    if (e?.value === void 0) return;
    const r = e.value, o = { ...this._config, type: "custom:hub-energie-card" };
    r === "" || r === "__auto__" ? delete o.site_index : o.site_index = Math.max(0, Math.trunc(Number(r))), this._config = o, this.__lastKey = null, this._hist = null, this._histLoading = !1, this._histErr = null, this.requestUpdate(), this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: o }
      })
    );
  }
  _loadHistory() {
    if (this._isLiveMode() || !this.hass || this._histLoading || this._hist !== null) return;
    this._histLoading = !0;
    const t = this._map(), e = this._getRange(), r = t.lovelaceCard, o = [
      t.cost,
      ...r && r !== t.cost ? [r] : [],
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
    Ne(this.hass, e.startIso, e.endIso, o, t.cost, r !== t.cost ? r : void 0).then((a) => {
      this._hist = a, this._histErr = null;
    }).catch((a) => {
      this._histErr = a.message ?? String(a), this._hist = null;
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
    const a = this._map().cost, i = this._payloadEntityId() ?? a;
    if (!a) return;
    if (!e) {
      if (!r && (this._powerGraphLoading || this._powerGraphSeries !== null)) return;
      this._powerGraphLoading = !0, this._powerGraphErr = null;
    }
    let l;
    e ? l = this._powerGraphLoadId : (this._powerGraphLoadId += 1, l = this._powerGraphLoadId);
    const c = this._date ?? I(), p = vt(
      this._powerGraphRollingHours,
      it
    ), h = c === I();
    let d, m, f = !1, _ = "day", $ = null, u = 24;
    if (h) {
      _ = "rolling", $ = p, u = p;
      const w = /* @__PURE__ */ new Date();
      m = w, d = new Date(w.getTime() - p * 60 * 60 * 1e3), f = !0;
    } else if (d = Y(c), m = Y(Bt(c, 1)), !Number.isFinite(d.getTime()) || !Number.isFinite(m.getTime())) {
      !e && this._powerGraphLoadId === l && (this._powerGraphLoading = !1, this._powerGraphErr = this._i18n().noData, this._powerGraphSeries = null);
      return;
    }
    const M = {
      hoursBack: u,
      statsPts: [],
      hasLoadEntity: !1,
      useLiveTail: f,
      windowMode: _,
      rollingHours: $,
      dayIso: c
    }, S = this._i18n();
    try {
      const w = this.hass.states[i]?.attributes?.power_graph_entity_map, N = w && typeof w == "object" ? w : null, G = He(N);
      if (!G.length) {
        !e && this._powerGraphLoadId === l && (this._powerGraphErr = S.powerHistoryNoSensors, this._powerGraphSeries = { ...M });
        return;
      }
      const C = await Ie(this.hass, {
        startTimeIso: d.toISOString(),
        endTimeIso: m.toISOString(),
        statisticIds: G,
        period: "5minute"
      });
      if (this._powerGraphLoadId !== l || !this._powerGraphOpen || (this._date ?? I()) !== c || h && vt(this._powerGraphRollingHours, it) !== p)
        return;
      const T = je(N, C);
      if (!T?.filled?.length) {
        !e && this._powerGraphLoadId === l && (this._powerGraphErr = S.powerHistoryNoStatistics, this._powerGraphSeries = {
          ...M,
          hasLoadEntity: typeof N?.load_entity == "string" && N.load_entity.trim() !== ""
        });
        return;
      }
      const b = T.filled, k = 160, B = ((P) => {
        if (P.length <= k) return P;
        const j = P.length / k, v = [];
        for (let F = 0; F < k; F++)
          v.push(P[Math.floor(F * j)]);
        return v;
      })(b);
      this._powerGraphLoadId === l && (this._powerGraphSeries = {
        hoursBack: u,
        statsPts: B,
        hasLoadEntity: typeof N?.load_entity == "string" && N.load_entity.trim() !== "",
        useLiveTail: f,
        windowMode: _,
        rollingHours: $,
        dayIso: c
      });
    } catch (w) {
      !e && this._powerGraphLoadId === l && (this._powerGraphErr = w?.message ?? String(w), this._powerGraphSeries = null);
    } finally {
      !e && this._powerGraphLoadId === l && (this._powerGraphLoading = !1), this.__lastKey = null;
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
    const e = t.useLiveTail === !0, o = this._map().cost, a = this._payloadEntityId() ?? o, i = a ? this.hass?.states[a]?.attributes?.power_graph_entity_map : null, l = i && typeof i == "object" ? i : null, c = e && l && this.hass ? Ae(this.hass, l) : null, p = e ? ze(t.statsPts, c) : t.statsPts, { yMin: h, yMax: d } = Oe(p);
    return {
      hoursBack: t.hoursBack,
      pts: p,
      yMin: h,
      yMax: d,
      hasLoadEntity: t.hasLoadEntity === !0,
      windowMode: t.windowMode ?? "rolling",
      rollingHours: t.rollingHours ?? null,
      dayIso: t.dayIso ?? this._date ?? I(),
      useLiveTail: e
    };
  }
  _renderRedHpWarning(t, e, r, o, a) {
    if (e !== "tempo" || r <= 0) return y;
    const l = (t ?? []).find((p) => p.id === "rouge_hp")?.v ?? 0;
    if (l < 0.1) return y;
    const c = (o.solarDirect?.v ?? 0) + (o.solarBatt?.v ?? 0) + (o.battHome?.v ?? 0);
    return l / r < 0.35 || l <= c ? y : g`<div class="red-hp-banner">⚠️ ${a.redHpWarning}</div>`;
  }
  _renderSlotMapRaw(t, e, r) {
    const o = r.emDash;
    if (!t || typeof t != "object") return o;
    const a = Gt.map((i) => {
      const l = t[i.id], c = typeof l == "number" ? l : parseFloat(l);
      return Number.isFinite(c) && c > 1e-5 ? { label: K(i.id, e, r), v: c } : null;
    }).filter(Boolean);
    return a.length ? a.map((i, l) => g`${l > 0 ? g`<br />` : y}${i.label}: ${i.v.toFixed(3)} kWh`) : o;
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
      return g`<ha-card><div class="loader">${e}</div></ha-card>`;
    }
  }
  _renderCardImpl() {
    const t = this._i18n();
    if (!this.hass) return g`<ha-card></ha-card>`;
    const e = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR", r = this._isLiveMode(), o = this._map(), a = this._payloadEntityId() ?? o.cost;
    if (r && (!gt(this.hass?.states, o.cost) || a !== o.cost && !gt(this.hass?.states, a)))
      return this._liveBootstrapWaiting(o.cost) ? g`
          <ha-card>
            <div class="header"><h2>Hub Énergie</h2></div>
            <div class="loader">${t.waitingHassBootstrap}</div>
          </ha-card>
        ` : g`
        <ha-card>
          <div class="header"><h2>Hub Énergie</h2></div>
          <div class="alert">
            ${t.costEntityNotFoundBefore} <code>${o.cost}</code> ${t.costEntityNotFoundAfter}<br />
            ${t.costEntityCardHint}
          </div>
        </ha-card>
      `;
    const i = this._getRange(), {
      grid: l,
      maison: c,
      totalEur: p,
      costs: h,
      abo: d,
      ecoSolar: m,
      ecoBatt: f,
      og: _,
      os: $,
      usage: u,
      costEntityOk: M,
      offer: S,
      contractPower: w,
      currentSlot: N,
      tempoDays: G,
      todayColor: C,
      tomorrowColor: T,
      reinj: b,
      gridBattBySlot: k,
      solarBattBySlot: x
    } = this._extract(t), B = l.reduce((n, R) => n + R.v, 0), P = c.reduce((n, R) => n + R.v, 0), j = l.filter((n) => n.v > 1e-3), v = h.filter((n) => n.v > 5e-4), F = m + f, D = yt([B, ...l.map((n) => n.v), u.gridDirect.v, u.gridBatt.v]), H = u.gridDirect.v, Z = Math.max(0, u.solarDirect.v - u.solarBatt.v), bt = u.battHome.v, nt = H + Z + bt, lt = yt([nt, H, Z, bt]), ct = u.gridBatt.v + u.solarBatt.v, pt = M ? ee(S, k, t) : [], ft = M ? ee(S, x, t) : [], Dt = M && (pt.length > 0 || ft.length > 0), z = [];
    if (Dt) {
      if (ft.length) {
        const n = ft.reduce((R, Zt) => R + (Number.isFinite(Zt?.v) ? Zt.v : 0), 0);
        n > 1e-5 && z.push({
          label: t.brkTblSolar,
          v: n,
          color: u.solarBatt.color,
          isHc: !1
        });
      } else u.solarBatt.v > 1e-3 && z.push({
        label: t.brkTblSolar,
        v: u.solarBatt.v,
        color: u.solarBatt.color,
        isHc: !1
      });
      if (pt.length)
        for (const n of pt)
          z.push({
            label: `${t.brkTblGridHome} · ${n.label}`,
            v: n.v,
            color: n.color,
            isHc: n.isHc
          });
      else u.gridBatt.v > 1e-3 && z.push({
        label: t.brkTblGridHome,
        v: u.gridBatt.v,
        color: u.gridBatt.color,
        isHc: !1
      });
    } else
      u.gridBatt.v > 1e-3 && z.push({
        label: t.brkTblGridHome,
        v: u.gridBatt.v,
        color: u.gridBatt.color,
        isHc: !1
      }), u.solarBatt.v > 1e-3 && z.push({
        label: t.brkTblSolar,
        v: u.solarBatt.v,
        color: u.solarBatt.color,
        isHc: !1
      });
    const rt = yt([
      ct,
      ...z.map((n) => n.v)
    ]), Ct = j.map((n) => ({ value: n.v, color: n.color, className: n.isHc ? "fill-hc" : "" })), St = j.map((n) => ({
      label: K(n.id, S, t),
      value: D(n.v),
      color: n.color,
      rawV: n.v
    })), U = [
      { label: t.brkTblGridHome, v: H, color: u.gridDirect.color },
      { label: t.brkTblSolar, v: Z, color: u.solarDirect.color },
      { label: t.brkTblBattHome, v: bt, color: u.battHome.color }
    ].filter((n) => n.v > 1e-3), q = U.map((n) => ({ value: n.v, color: n.color })), V = U.map((n) => ({
      label: n.label,
      value: lt(n.v),
      color: n.color,
      rawV: n.v
    })), kt = z.map((n) => ({
      value: n.v,
      color: n.color,
      className: n.isHc ? "fill-hc" : ""
    })), Ht = z.map((n) => ({
      label: n.label,
      value: rt(n.v),
      color: n.color,
      rawV: n.v
    })), Ft = [
      ...v.map((n) => ({ value: n.v, color: n.color, className: n.isHc ? "fill-hc" : "" })),
      ...d > 5e-4 ? [{ value: d, color: Qt }] : []
    ], It = [
      ...v.map((n) => ({
        label: K(n.id, S, t),
        value: `${n.v.toFixed(2)} €`,
        color: n.color,
        rawV: n.v
      })),
      ...d > 5e-4 ? [{ label: t.costSubscription, value: `${d.toFixed(2)} €`, color: Qt, rawV: d }] : []
    ], ot = [
      { label: t.reinjCauseSolarSurplus, v: b.solarSurplus, eur: b.oppSolarEur, color: et },
      { label: t.reinjCauseBatteryFull, v: b.batteryFull, eur: b.oppBatteryEur, color: tt },
      { label: t.reinjCauseSwitchLatency, v: b.switchLatency, eur: b.oppLatencyEur, color: "#ff7043" },
      { label: t.reinjCauseOther, v: b.unattributed, eur: b.oppOtherEur, color: "#90a4ae" }
    ].filter((n) => n.v > 1e-4), wt = ot.reduce((n, R) => n + R.v, 0), L = yt([wt, ...ot.map((n) => n.v)]), Tt = ot.map((n) => ({ value: n.v, color: n.color })), Rt = ot.map((n) => ({
      label: n.label,
      value: `${L(n.v)} · ${n.eur.toFixed(2)} €`,
      color: n.color,
      rawV: n.v
    })), J = [
      { label: t.ecoSourceSolar, vAbs: Math.abs(m), color: et, fmt: `${m >= 0 ? "+" : ""}${m.toFixed(2)} €`, rawV: m },
      { label: t.ecoSourceBatt, vAbs: Math.abs(f), color: tt, fmt: `${f >= 0 ? "+" : ""}${f.toFixed(2)} €`, rawV: f }
    ].filter((n) => n.vAbs > 5e-4), Et = J.reduce((n, R) => n + R.vAbs, 0), Mt = J.length ? J.map((n) => ({ value: n.vAbs, color: n.color })) : Math.abs(F) > 5e-4 ? [{ value: 1, color: F >= 0 ? "#1976d2" : "#c62828" }] : [], xt = J.length ? J.map((n) => ({ label: n.label, value: n.fmt, color: n.color, rawV: n.vAbs })) : [], jt = this._states(), dt = this._payloadEntityId() ?? o.cost, ht = r && M ? Pe(jt, dt, t) : null, Ot = Z + u.solarBatt.v + b.solarSurplus, ne = yt([
      Ot,
      Z,
      u.solarBatt.v,
      b.solarSurplus
    ]), qt = M && Ot > 1e-3 ? {
      segments: [
        {
          label: t.solarProdSegHome,
          value: Z,
          color: et,
          icon: "mdi:home-lightning-bolt-outline"
        },
        {
          label: t.solarProdSegBattery,
          value: u.solarBatt.v,
          color: tt,
          icon: "mdi:battery-plus-variant"
        },
        {
          label: t.solarProdSegExport,
          value: b.solarSurplus,
          color: he,
          icon: "mdi:transmission-tower-export"
        }
      ],
      total: Ot,
      formatter: (n) => ne(n),
      tooltip: t.solarProdKwhTip
    } : null, le = M && this.hass?.states ? De(this.hass.states, dt) : null, ce = b.solarSurplus + b.batteryFull + b.switchLatency + b.unattributed, Yt = fe(this.hass?.states), At = this._siteIndexFromConfig(), pe = At == null ? "__auto__" : String(Math.max(0, Math.trunc(At)));
    return g`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${we(S)}${w ? ` ${w}kVA` : ""}</span>
          </div>
          <div class="controls">
            ${Yt.length >= 1 ? g`
                  <label>${t.siteLabel}</label>
                  <ha-select
                    .value=${pe}
                    @closed=${this._onSiteChange}
                    .fixedMenuPosition=${!0}
                    .naturalMenuWidth=${!0}
                    style="min-width:5.5rem"
                  >
                    <ha-list-item value="__auto__">${t.siteAuto}</ha-list-item>
                    ${Yt.map(
      (n) => g`
                        <ha-list-item value="${String(n.index)}">
                          ${O(t.editorSiteOption, { index: String(n.index), segment: n.segment })}
                        </ha-list-item>
                      `
    )}
                  </ha-select>
                ` : y}
            <label>${t.date}</label>
            <input type="date" .value=${this._date} max=${I()} @change=${this._onDateChange} />
            <label>${t.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((n) => g`
                <button class="range-btn ${this._rangePreset === n ? "active" : ""}" @click=${() => this._setRangePreset(n)}>
                  ${t[n]}
                </button>
              `)}
            </div>
            <span class="range-label">${Se(i.startIso, i.endIso, e)}</span>
            ${this._showSection("show_raw_control") ? g`<button class="btn" @click=${this._onRawToggle}>${this._showRaw ? t.hide : t.details}</button>` : y}
          </div>
        </div>

        ${this._histLoading ? g`<div class="loader">${t.loading}</div>` : y}

        ${this._showSection("show_day_slots") ? g` <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${S === "tempo" ? re(C) : "color-na"}">
              <span class="day-tile-line">${t.today} : ${K(N, S, t)}</span>
            </div>
            <div class="day-tile ${S === "tempo" ? re(T) : "color-na"}">
              <span class="day-tile-line">${t.tomorrow} : ${S === "tempo" ? xe(T, t) : t.emDash}</span>
            </div>
          </div>
          ${S === "tempo" && G && typeof G == "object" ? g`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${t.tempoDayBlue} : ${G.blue?.remaining ?? 0}/${(G.blue?.elapsed ?? 0) + (G.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${t.tempoDayWhite} : ${G.white?.remaining ?? 0}/${(G.white?.elapsed ?? 0) + (G.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${t.tempoDayRed} : ${G.red?.remaining ?? 0}/${(G.red?.elapsed ?? 0) + (G.red?.remaining ?? 0)}
                  </div>
                </div>
              ` : y}
        </div>` : y}

        ${this._showSection("show_live_power") ? g`
        <hub-power-now
          .i18n=${t}
          .data=${ht}
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
          .isTodayGraph=${(this._date ?? I()) === I()}
          @hub-power-graph-window=${(n) => {
      const R = n.detail?.hours;
      R != null && this._setPowerGraphRollingHours(R);
    }}
        ></hub-power-graph>` : y}
        ${this._showSection("show_battery_bar") ? g`<hub-energie-battery-bar .i18n=${t} .data=${le} .numberLocale=${e}></hub-energie-battery-bar>` : y}
        ${this._showSection("show_insights_bar") ? g`<hub-insight-bar .i18n=${t} .totalMaison=${P} .originGrid=${_} .totalEur=${p} .ecoTotal=${F}></hub-insight-bar>` : y}
        ${this._showSection("show_red_hp_warning") ? this._renderRedHpWarning(l, S, P, u, t) : y}

        ${this._showSection("show_consumption") ? g`<section>
          <div class="section-head">
            <h3>${t.sectionConsumption}</h3>
            <div class="section-metric">${t.totalEnergy} <b>${ke(P)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${S === "tempo" ? t.consStripGridTitleTempo : t.consStripGridTitle}
              .segments=${Ct}
              .total=${B}
              .formatter=${D}
              .tooltip=${j.map((n) => `${K(n.id, S, t)}: ${D(n.v)}`).join(" · ")}
              .breakdown=${St}
              .showBreakdown=${!0}
              .displayValue=${D(B)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            ${this._showSection("show_solar_production_bar") && qt ? g`<hub-solar-production-bar .i18n=${t} .kwhData=${qt}></hub-solar-production-bar>` : y}

            <hub-energy-strip
              .title=${t.consStripHomeTitle}
              .segments=${q}
              .total=${nt}
              .formatter=${lt}
              .tooltip=${U.map((n) => `${n.label}: ${lt(n.v)}`).join(" · ")}
              .breakdown=${V}
              .showBreakdown=${!0}
              .displayValue=${lt(nt)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${t.consStripBattTitle}
              .segments=${kt}
              .total=${ct}
              .formatter=${rt}
              .tooltip=${z.map((n) => `${n.label}: ${rt(n.v)}`).join(" · ")}
              .breakdown=${Ht}
              .showBreakdown=${!0}
              .displayValue=${rt(ct)}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : y}

        ${this._showSection("show_cost") ? g`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.costStripTitle}
              .segments=${Ft}
              .total=${p}
              .formatter=${(n) => `${Number(n).toFixed(2)} €`}
              .tooltip=${[
      ...v.map((n) => `${K(n.id, S, t)}: ${n.v.toFixed(2)} €${n.tooltip ? ` (${n.tooltip})` : ""}`),
      ...d > 5e-4 ? [`${t.costSubscription}: ${d.toFixed(2)} €`] : []
    ].join(" · ")}
              .breakdown=${It}
              .showBreakdown=${!0}
              .displayValue=${`${p.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : y}

        ${this._showSection("show_savings") ? g`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.ecoStripTitle}
              .segments=${Mt}
              .total=${Et}
              .formatter=${(n) => `${Number(n).toFixed(2)} €`}
              .tooltip=${J.map((n) => `${n.label}: ${n.fmt}`).join(" · ")}
              .breakdown=${xt.length ? xt : [{ label: t.emDash, value: `${F >= 0 ? "+" : ""}${F.toFixed(2)} €` }]}
              .showBreakdown=${!0}
              .displayValue=${`${F >= 0 ? "+" : ""}${F.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : y}

        ${this._showSection("show_reinjection") ? g`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${t.reinjStripTitle}
              .segments=${Tt}
              .total=${wt}
              .formatter=${L}
              .tooltip=${ot.map((n) => `${n.label}: ${L(n.v)} · ${n.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${Rt}
              .showBreakdown=${!0}
              .displayValue=${`${L(wt)} · ${b.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${t.noData}
            ></hub-energy-strip>
          </div>
        </section>` : y}

        ${this._showRaw && this._showSection("show_raw_control") ? g`
              <section>
                <h3>${t.rawDataTitle}</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>${t.rawSectionGridHome}</b>
                      ${O(t.rawLineGridTotal, { value: B.toFixed(3) })}<br />
                      ${O(t.rawLineHouseTotal, { value: P.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionCost}</b>
                      ${O(t.rawLineCostTotal, { value: p.toFixed(3) })}<br />
                      ${O(t.rawLineSubscription, { value: d.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionOrigin}</b>
                      ${O(t.rawLineOriginGrid, { value: _.toFixed(3) })}<br />
                      ${O(t.rawLineOriginSolar, { value: $.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionSavings}</b>
                      ${O(t.rawLineSavingsSolar, { value: m.toFixed(3) })}<br />
                      ${O(t.rawLineSavingsBattery, { value: f.toFixed(3) })}
                    </div>
                    <div>
                      <b>${t.rawSectionImportBySlot}</b>
                      ${j.length > 0 ? j.map((n, R) => g`${R > 0 ? g`<br />` : y}${K(n.id, S, t)}: ${n.v.toFixed(3)} kWh`) : t.emDash}
                    </div>
                    <div>
                      <b>${t.rawSectionCostBySlot}</b>
                      ${v.length > 0 ? v.map((n, R) => g`${R > 0 ? g`<br />` : y}${K(n.id, S, t)}: ${n.v.toFixed(3)} €`) : t.emDash}
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
                      ${this._renderSlotMapRaw(k, S, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionBattChargeSolarSlots}</b>
                      ${this._renderSlotMapRaw(x, S, t)}
                    </div>
                    <div>
                      <b>${t.rawSectionReinjection}</b>
                      ${t.reinjLabelSolarSurplus}
                      ${O(t.reinjLineKwhEur, { kwh: b.solarSurplus.toFixed(3), eur: b.oppSolarEur.toFixed(3) })}<br />
                      ${t.reinjLabelBatteryFull}
                      ${O(t.reinjLineKwhEur, { kwh: b.batteryFull.toFixed(3), eur: b.oppBatteryEur.toFixed(3) })}<br />
                      ${t.reinjLabelSwitchLatency}
                      ${O(t.reinjLineKwhEur, { kwh: b.switchLatency.toFixed(3), eur: b.oppLatencyEur.toFixed(3) })}<br />
                      ${t.reinjLabelOther}
                      ${O(t.reinjLineKwhEur, { kwh: b.unattributed.toFixed(3), eur: b.oppOtherEur.toFixed(3) })}<br />
                      ${t.reinjLabelTotal}
                      ${O(t.reinjLineKwhEur, { kwh: ce.toFixed(3), eur: b.oppTotalEur.toFixed(3) })}
                    </div>
                  </div>
                </div>
              </section>
            ` : y}
      </ha-card>
    `;
  }
}
customElements.get("hub-energie-card-core") || customElements.define("hub-energie-card-core", er);
