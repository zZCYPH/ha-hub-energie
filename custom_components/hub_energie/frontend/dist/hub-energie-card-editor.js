import { i as S, a as y, I as p, A as $, b as _ } from "./i18n.js";
function v(o, t) {
  let e = String(o);
  for (const [r, n] of Object.entries(t))
    e = e.split(`{${r}}`).join(String(n));
  return e;
}
const b = Object.freeze([
  { id: "bleu_hc", label: "Blue HC", color: "#1e88e5" },
  { id: "bleu_hp", label: "Blue HP", color: "#1e88e5" },
  { id: "blanc_hc", label: "White HC", color: "#b0bec5" },
  { id: "blanc_hp", label: "White HP", color: "#b0bec5" },
  { id: "rouge_hc", label: "Red HC", color: "#e53935" },
  { id: "rouge_hp", label: "Red HP", color: "#e53935" },
  { id: "unknown", label: "Unknown", color: "#78909c" }
]), P = Object.freeze([
  ...b.map((o) => `${o.id}_eur`),
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
]), A = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), C = "sensor.hub_energie_", H = "card_site_index", x = Object.freeze([
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
function k(o = C) {
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
    usageBattHome: `${t}usage_batt_home_kwh`
  };
}
function m(o) {
  if (!o) return 0;
  let t = 0;
  for (const e of Object.values(o)) {
    const n = e?.attributes?.card_entity_ids;
    n && typeof n == "object" && typeof n.cost == "string" && n.cost && (t += 1);
  }
  return t;
}
function B(o) {
  if (typeof o != "string" || !o.startsWith("sensor.")) return null;
  const t = o.slice(7), e = /^hub_energie_(\d+)_/.exec(t);
  if (!e) return null;
  const r = parseInt(e[1], 10);
  return Number.isFinite(r) ? r : null;
}
function g(o, t) {
  const e = o?.attributes;
  if (e && typeof e == "object") {
    const r = e[H];
    if (typeof r == "number" && Number.isFinite(r)) return Math.trunc(r);
  }
  return B(t);
}
function F(o, t) {
  const r = k().cost;
  if (!o) return r;
  const n = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [s, u] of Object.entries(o)) {
    const c = u?.attributes;
    if (!c || typeof c != "object") continue;
    const l = c.card_entity_ids;
    if (!l || typeof l != "object" || l.cost !== s) continue;
    const w = g(u, s) ?? 0;
    n !== null && w !== n || i.push(s);
  }
  if (i.length === 1) return i[0];
  if (i.length > 1) return [...i].sort()[0];
  if (n === null && o[r]?.attributes) return r;
  const a = [];
  for (const [s, u] of Object.entries(o)) {
    const c = u?.attributes;
    if (!(!c || typeof c != "object") && typeof c.eco_solar == "number" && c.grid_by_slot_kwh != null && typeof c.grid_by_slot_kwh == "object") {
      const l = g(u, s);
      if (n !== null && l !== null && l !== n || n !== null && l === null) continue;
      a.push(s);
    }
  }
  if (a.length >= 1) return [...a].sort()[0];
  const d = m(o);
  return n === null && d <= 1 && o[r], r;
}
function D(o, t, e) {
  const r = { ...t, cost: e }, n = o?.card_entity_ids;
  if (!n || typeof n != "object") return r;
  for (const i of x) {
    const a = n[i];
    typeof a == "string" && a.includes(".") && (r[i] = a);
  }
  return r;
}
function N(o, t) {
  if (!o || typeof o != "object") return 0;
  const e = o[t], r = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(r) ? r : 0;
}
function M(o, t) {
  return !!o?.[t];
}
function W(o) {
  return o === "hphc" ? "HP/HC" : o === "base" ? "BASE" : "TEMPO";
}
function R(o, t, e) {
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
function G(o, t) {
  const e = String(o ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function I(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function L(o, t, e) {
  return !t || typeof t != "object" ? [] : b.map((r) => {
    const n = t[r.id], i = typeof n == "number" ? n : parseFloat(n);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: R(r.id, o, e),
      v: i,
      color: r.color,
      isHc: r.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function U(o) {
  return !o || typeof o != "object" ? "" : b.map((t) => {
    const e = o[t.id], r = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(r) ? r : 0}`;
  }).join(",");
}
const h = "custom:hub-energie-card", f = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), E = [1, 3, 6, 12, 24], T = [
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
class j extends S {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = y`
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
    this._config = t && typeof t == "object" ? { ...t } : { type: h }, this._config.type || (this._config.type = h);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? p.en : p.fr;
  }
  _sectionOn(t) {
    const e = this._config?.[t];
    return e !== !1 && e !== "false";
  }
  _siteCount() {
    return m(this.hass?.states);
  }
  _siteSelectValue() {
    const t = this._config?.site_index;
    if (t === "" || t === void 0 || t === null) return "__auto__";
    const e = Math.trunc(Number(t));
    return Number.isFinite(e) && e >= 0 ? String(e) : "__auto__";
  }
  render() {
    const t = this._config ?? {}, e = this._i18n(), r = parseFloat(t.power_history_hours), n = Math.trunc(r), i = f.has(n) ? n : 6, a = this._siteCount(), d = this._siteSelectValue();
    return _`
      <div class="card-config">
        ${a > 1 ? _`
              <div class="field">
                <ha-select
                  label=${e.editorSiteLabel}
                  .value=${d}
                  @closed=${this._onSiteClosed}
                  .fixedMenuPosition=${!0}
                  .naturalMenuWidth=${!0}
                >
                  <ha-list-item value="__auto__">${e.siteAuto}</ha-list-item>
                  ${Array.from({ length: a }, (s, u) => _`
                    <ha-list-item value="${String(u)}">${String(u)}</ha-list-item>
                  `)}
                </ha-select>
                <p class="hint">${e.editorSiteHint}</p>
              </div>
            ` : $}
        <div class="field">
          <ha-select
            label=${e.editorPowerGraphWindow}
            .value=${String(i)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${E.map(
      (s) => _`<ha-list-item value="${String(s)}">${v(e.editorPowerHoursUnit, { n: s })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${e.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${e.editorSectionsTitle}</div>
        ${T.map(
      ([s, u]) => _`
            <div class="field">
              <ha-formfield .label=${e[u]}>
                <ha-switch
                  .checked=${this._sectionOn(s)}
                  @change=${(c) => this._setSectionFlag(s, c.target.checked)}
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
    e.type = h, this.dispatchEvent(
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
    if (!f.has(r)) return;
    const n = parseFloat(this._config?.power_history_hours), i = f.has(Math.trunc(n)) ? Math.trunc(n) : 6;
    if (r === i) return;
    const a = { ...this._config, power_history_hours: r };
    this._emit(a);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", j);
export {
  P as C,
  b as S,
  A as a,
  U as b,
  L as c,
  F as d,
  D as e,
  I as f,
  G as g,
  m as h,
  M as i,
  k as m,
  W as o,
  N as r,
  R as s,
  v as t
};
