import { i as y, a as C, I as g, A as v, b as d } from "./i18n.js";
function $(o, t) {
  let e = String(o);
  for (const [r, n] of Object.entries(t))
    e = e.split(`{${r}}`).join(String(n));
  return e;
}
const p = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), H = Object.freeze([
  ...p.map((o) => `${o.id}_eur`),
  "abonnement_eur"
]), R = Object.freeze([
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
Object.freeze([...H, ...R]);
const D = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), j = "sensor.hub_energie_", x = "card_site_index", T = "hub_energie_card_payload", k = Object.freeze([
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
function m(o = j) {
  const t = o;
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
function w(o) {
  if (!o) return 0;
  const t = /* @__PURE__ */ new Set();
  for (const [e, r] of Object.entries(o)) {
    const n = r?.attributes;
    if (!n || typeof n != "object") continue;
    const i = n.card_entity_ids;
    if (!i || typeof i != "object" || typeof i.cost != "string" || !i.cost) continue;
    const s = h(r, e) ?? 0;
    t.add(s);
  }
  return t.size;
}
function E(o) {
  if (typeof o != "string" || !o.startsWith("sensor.")) return null;
  const t = o.slice(7), e = /^hub_energie_(\d+)_/.exec(t);
  if (!e) return null;
  const r = parseInt(e[1], 10);
  return Number.isFinite(r) ? r : null;
}
function h(o, t) {
  const e = o?.attributes;
  if (e && typeof e == "object") {
    const r = e[x];
    if (typeof r == "number" && Number.isFinite(r)) return Math.trunc(r);
  }
  return E(t);
}
function M(o, t) {
  const r = m().cost;
  if (!o) return r;
  const n = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [a, c] of Object.entries(o)) {
    const u = c?.attributes;
    if (!u || typeof u != "object") continue;
    const l = u.card_entity_ids;
    if (!l || typeof l != "object" || l.cost !== a) continue;
    const S = h(c, a) ?? 0;
    n !== null && S !== n || i.push(a);
  }
  if (i.length === 1) return i[0];
  if (i.length > 1) return [...i].sort()[0];
  if (n === null && o[r]?.attributes) return r;
  const s = [];
  for (const [a, c] of Object.entries(o)) {
    const u = c?.attributes;
    if (!(!u || typeof u != "object") && typeof u.eco_solar == "number" && u.grid_by_slot_kwh != null && typeof u.grid_by_slot_kwh == "object") {
      const l = h(c, a);
      if (n !== null && l !== null && l !== n || n !== null && l === null) continue;
      s.push(a);
    }
  }
  if (s.length >= 1) return [...s].sort()[0];
  const _ = w(o);
  return n === null && _ <= 1 && o[r], r;
}
function N(o, t) {
  const r = m().lovelaceCard;
  if (!o) return r;
  const n = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [s, _] of Object.entries(o)) {
    const a = _?.attributes;
    if (!a || typeof a != "object" || a[T] !== !0) continue;
    const c = h(_, s) ?? 0;
    n !== null && c !== n || i.push(s);
  }
  return i.length === 1 ? i[0] : i.length > 1 ? [...i].sort()[0] : r;
}
function G(o, t, e) {
  const r = { ...t, cost: e }, n = o?.card_entity_ids;
  if (!n || typeof n != "object") return r;
  for (const i of k) {
    const s = n[i];
    typeof s == "string" && s.includes(".") && (r[i] = s);
  }
  return typeof n.lovelaceCard == "string" && n.lovelaceCard.includes(".") && (r.lovelaceCard = n.lovelaceCard), r;
}
function W(o, t) {
  return { ...t && typeof t == "object" ? t : {}, ...o && typeof o == "object" ? o : {} };
}
function L(o, t) {
  if (!o || typeof o != "object") return 0;
  const e = o[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function I(o, t) {
  return !!o?.[t];
}
function Y(o) {
  return o === "hphc" ? "HP/HC" : o === "base" ? "BASE" : "TEMPO";
}
function O(o, t, e) {
  const r = e?.emDash ?? "—";
  return o ? t === "base" ? e?.slotBase ?? "Base" : t === "hphc" ? o.endsWith("_hc") ? e?.slotHc ?? "HC" : e?.slotHp ?? "HP" : {
    bleu_hc: e?.slotBleuHc,
    bleu_hp: e?.slotBleuHp,
    blanc_hc: e?.slotBlancHc,
    blanc_hp: e?.slotBlancHp,
    rouge_hc: e?.slotRougeHc,
    rouge_hp: e?.slotRougeHp,
    unknown: e?.slotUnknown
  }[o] ?? o : r;
}
function z(o, t) {
  const e = String(o ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function U(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function V(o, t, e) {
  return !t || typeof t != "object" ? [] : p.map((r) => {
    const n = t[r.id], i = typeof n == "number" ? n : parseFloat(n);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: O(r.id, o, e),
      v: i,
      color: r.color,
      isHc: r.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function K(o) {
  return !o || typeof o != "object" ? "" : p.map((t) => {
    const e = o[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
const f = "custom:hub-energie-card", b = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), A = [1, 3, 6, 12, 24], B = [
  ["show_day_slots", "editorShowDaySlots"],
  ["show_live_power", "editorShowLivePower"],
  ["show_solar_production_bar", "editorShowSolarProductionBar"],
  ["show_battery_bar", "editorShowBatteryBar"],
  ["show_insights_bar", "editorShowInsightsBar"],
  ["show_red_hp_warning", "editorShowRedHpWarning"],
  ["show_consumption", "editorShowConsumption"],
  ["show_cost", "editorShowCost"],
  ["show_savings", "editorShowSavings"],
  ["show_reinjection", "editorShowReinjection"],
  ["show_raw_control", "editorShowRawControl"]
];
class P extends y {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = C`
    :host {
      display: block;
    }
    .field {
      display: block;
      margin-bottom: 16px;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin: 6px 0 0;
      line-height: 1.4;
    }
    .sections-title {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 20px 0 10px;
      color: var(--primary-text-color);
    }
    ha-formfield {
      display: block;
    }
  `;
  setConfig(t) {
    this._config = t && typeof t == "object" ? { ...t } : { type: f }, this._config.type || (this._config.type = f);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? g.en : g.fr;
  }
  _sectionOn(t) {
    const e = this._config?.[t];
    return e !== !1 && e !== "false";
  }
  _siteCount() {
    return w(this.hass?.states);
  }
  _siteSelectValue() {
    const t = this._config?.site_index;
    if (t === "" || t === void 0 || t === null) return "__auto__";
    const e = Math.trunc(Number(t));
    return Number.isFinite(e) && e >= 0 ? String(e) : "__auto__";
  }
  render() {
    const t = this._config ?? {}, e = this._i18n(), r = parseFloat(t.power_history_hours), n = Math.trunc(r), i = b.has(n) ? n : 6, s = this._siteCount(), _ = this._siteSelectValue();
    return d`
      <div class="card-config">
        ${s > 1 ? d`
              <div class="field">
                <ha-select
                  label=${e.editorSiteLabel}
                  .value=${_}
                  @closed=${this._onSiteClosed}
                  .fixedMenuPosition=${!0}
                  .naturalMenuWidth=${!0}
                >
                  <ha-list-item value="__auto__">${e.siteAuto}</ha-list-item>
                  ${Array.from({ length: s }, (a, c) => d`
                    <ha-list-item value="${String(c)}">${String(c)}</ha-list-item>
                  `)}
                </ha-select>
                <p class="hint">${e.editorSiteHint}</p>
              </div>
            ` : v}
        <div class="field">
          <ha-select
            label=${e.editorPowerGraphWindow}
            .value=${String(i)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${A.map(
      (a) => d`<ha-list-item value="${String(a)}">${$(e.editorPowerHoursUnit, { n: a })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${e.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${e.editorSectionsTitle}</div>
        ${B.map(
      ([a, c]) => d`
            <div class="field">
              <ha-formfield .label=${e[c]}>
                <ha-switch
                  .checked=${this._sectionOn(a)}
                  @change=${(u) => this._setSectionFlag(a, u.target.checked)}
                ></ha-switch>
              </ha-formfield>
            </div>
          `
    )}

        <p class="hint">
          ${e.editorAdvancedYamlBefore}<code>power_history_refresh_seconds</code>${e.editorAdvancedYamlAfter}
        </p>
      </div>
    `;
  }
  _emit(t) {
    const e = { ...t };
    e.type = f, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: e }
      })
    );
  }
  _setSectionFlag(t, e) {
    const r = { ...this._config };
    e ? delete r[t] : r[t] = !1, this._emit(r);
  }
  _onSiteClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e?.value === void 0) return;
    const r = { ...this._config };
    e.value === "__auto__" ? delete r.site_index : r.site_index = Math.max(0, Math.trunc(Number(e.value))), this._emit(r);
  }
  _onPowerHoursClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e.value === "" || e.value === void 0) return;
    const r = Math.trunc(Number(e.value));
    if (!b.has(r)) return;
    const n = parseFloat(this._config?.power_history_hours), i = b.has(Math.trunc(n)) ? Math.trunc(n) : 6;
    if (r === i) return;
    const s = { ...this._config, power_history_hours: r };
    this._emit(s);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", P);
export {
  H as C,
  p as S,
  R as a,
  D as b,
  N as c,
  M as d,
  G as e,
  T as f,
  K as g,
  V as h,
  I as i,
  w as j,
  U as k,
  z as l,
  W as m,
  m as n,
  Y as o,
  L as r,
  O as s,
  $ as t
};
