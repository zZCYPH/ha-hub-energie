import { i as C, a as $, I as g, A as x, b as d } from "./i18n.js";
function m(o, t) {
  let e = String(o);
  for (const [n, r] of Object.entries(t))
    e = e.split(`{${n}}`).join(String(r));
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
]), R = Object.freeze([
  ...p.map((o) => `${o.id}_eur`),
  "abonnement_eur"
]), H = Object.freeze([
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
Object.freeze([...R, ...H]);
const N = Object.freeze([
  "grid_by_slot_kwh",
  "maison_by_slot_kwh"
]), T = "sensor.hub_energie_", j = "card_site_index", w = "card_site_segment", E = "hub_energie_card_payload", k = Object.freeze([
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
function S(o = T) {
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
function y(o) {
  if (!o) return [];
  const t = /* @__PURE__ */ new Map();
  for (const [e, n] of Object.entries(o)) {
    const r = n?.attributes;
    if (!r || typeof r != "object") continue;
    const i = r.card_entity_ids;
    if (i && typeof i == "object" && i.cost === e) {
      const s = h(n, e) ?? 0, c = r[w], a = typeof c == "string" && c.trim() !== "" ? String(c).trim() : String(s);
      t.set(s, { index: s, segment: a, costEntityId: e });
      continue;
    }
    if (typeof r.eco_solar == "number" && r.grid_by_slot_kwh != null && typeof r.grid_by_slot_kwh == "object") {
      const s = h(n, e) ?? 0;
      if (t.has(s)) continue;
      const c = r[w], a = typeof c == "string" && c.trim() !== "" ? String(c).trim() : String(s);
      t.set(s, { index: s, segment: a, costEntityId: e });
    }
  }
  return [...t.values()].sort((e, n) => e.index - n.index);
}
function O(o) {
  return y(o).length;
}
function A(o) {
  if (typeof o != "string" || !o.startsWith("sensor.")) return null;
  const t = o.slice(7), e = /^hub_energie_(\d+)_/.exec(t);
  if (!e) return null;
  const n = parseInt(e[1], 10);
  return Number.isFinite(n) ? n : null;
}
function h(o, t) {
  const e = o?.attributes;
  if (e && typeof e == "object") {
    const n = e[j];
    if (typeof n == "number" && Number.isFinite(n)) return Math.trunc(n);
  }
  return A(t);
}
function G(o, t) {
  const n = S().cost;
  if (!o) return n;
  const r = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [a, l] of Object.entries(o)) {
    const u = l?.attributes;
    if (!u || typeof u != "object") continue;
    const _ = u.card_entity_ids;
    if (!_ || typeof _ != "object" || _.cost !== a) continue;
    const v = h(l, a) ?? 0;
    r !== null && v !== r || i.push(a);
  }
  if (i.length === 1) return i[0];
  if (i.length > 1) return [...i].sort()[0];
  if (r === null && o[n]?.attributes) return n;
  const s = [];
  for (const [a, l] of Object.entries(o)) {
    const u = l?.attributes;
    if (!(!u || typeof u != "object") && typeof u.eco_solar == "number" && u.grid_by_slot_kwh != null && typeof u.grid_by_slot_kwh == "object") {
      const _ = h(l, a);
      if (r !== null && _ !== null && _ !== r || r !== null && _ === null) continue;
      s.push(a);
    }
  }
  if (s.length >= 1) return [...s].sort()[0];
  const c = O(o);
  return r === null && c <= 1 && o[n], n;
}
function I(o, t) {
  const n = S().lovelaceCard;
  if (!o) return n;
  const r = t === "" || t === void 0 || t === null ? null : Math.max(0, Math.trunc(Number(t))), i = [];
  for (const [s, c] of Object.entries(o)) {
    const a = c?.attributes;
    if (!a || typeof a != "object" || a[E] !== !0) continue;
    const l = h(c, s) ?? 0;
    r !== null && l !== r || i.push(s);
  }
  return i.length === 1 ? i[0] : i.length > 1 ? [...i].sort()[0] : n;
}
function W(o, t, e) {
  const n = { ...t, cost: e }, r = o?.card_entity_ids;
  if (!r || typeof r != "object") return n;
  for (const i of k) {
    const s = r[i];
    typeof s == "string" && s.includes(".") && (n[i] = s);
  }
  return typeof r.lovelaceCard == "string" && r.lovelaceCard.includes(".") && (n.lovelaceCard = r.lovelaceCard), n;
}
function L(o, t) {
  return { ...t && typeof t == "object" ? t : {}, ...o && typeof o == "object" ? o : {} };
}
function Y(o, t) {
  if (!o || typeof o != "object") return 0;
  const e = o[t], n = typeof e == "number" ? e : parseFloat(e);
  return Number.isFinite(n) ? n : 0;
}
function z(o, t) {
  return !!o?.[t];
}
function U(o) {
  return o === "hphc" ? "HP/HC" : o === "base" ? "BASE" : "TEMPO";
}
function B(o, t, e) {
  const n = e?.emDash ?? "—";
  return o ? t === "base" ? e?.slotBase ?? "Base" : t === "hphc" ? o.endsWith("_hc") ? e?.slotHc ?? "HC" : e?.slotHp ?? "HP" : {
    bleu_hc: e?.slotBleuHc,
    bleu_hp: e?.slotBleuHp,
    blanc_hc: e?.slotBlancHc,
    blanc_hp: e?.slotBlancHp,
    rouge_hc: e?.slotRougeHc,
    rouge_hp: e?.slotRougeHp,
    unknown: e?.slotUnknown
  }[o] ?? o : n;
}
function V(o, t) {
  const e = String(o ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function K(o) {
  const t = String(o ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? "color-blue" : t.includes("white") || t.includes("blanc") ? "color-white" : t.includes("red") || t.includes("rouge") ? "color-red" : "color-na";
}
function X(o, t, e) {
  return !t || typeof t != "object" ? [] : p.map((n) => {
    const r = t[n.id], i = typeof r == "number" ? r : parseFloat(r);
    return !Number.isFinite(i) || i <= 1e-4 ? null : {
      label: B(n.id, o, e),
      v: i,
      color: n.color,
      isHc: n.id.endsWith("_hc")
    };
  }).filter(Boolean);
}
function q(o) {
  return !o || typeof o != "object" ? "" : p.map((t) => {
    const e = o[t.id], n = typeof e == "number" ? e : parseFloat(e);
    return `${t.id}:${Number.isFinite(n) ? n : 0}`;
  }).join(",");
}
const f = "custom:hub-energie-card", b = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), P = [1, 3, 6, 12, 24], F = [
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
class D extends C {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = $`
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
  _hubSites() {
    return y(this.hass?.states);
  }
  _siteSelectValue() {
    const t = this._config?.site_index;
    if (t === "" || t === void 0 || t === null) return "__auto__";
    const e = Math.trunc(Number(t));
    return Number.isFinite(e) && e >= 0 ? String(e) : "__auto__";
  }
  render() {
    const t = this._config ?? {}, e = this._i18n(), n = parseFloat(t.power_history_hours), r = Math.trunc(n), i = b.has(r) ? r : 6, s = this._hubSites(), c = this._siteSelectValue();
    return d`
      <div class="card-config">
        ${s.length >= 1 ? d`
              <div class="field">
                <ha-select
                  label=${e.editorSiteLabel}
                  .value=${c}
                  @closed=${this._onSiteClosed}
                  .fixedMenuPosition=${!0}
                  .naturalMenuWidth=${!0}
                >
                  <ha-list-item value="__auto__">${e.siteAuto}</ha-list-item>
                  ${s.map(
      (a) => d`
                      <ha-list-item value="${String(a.index)}">
                        ${m(e.editorSiteOption, { index: String(a.index), segment: a.segment })}
                      </ha-list-item>
                    `
    )}
                </ha-select>
                <p class="hint">${e.editorSiteHint}</p>
              </div>
            ` : x}
        <div class="field">
          <ha-select
            label=${e.editorPowerGraphWindow}
            .value=${String(i)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${P.map(
      (a) => d`<ha-list-item value="${String(a)}">${m(e.editorPowerHoursUnit, { n: a })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${e.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${e.editorSectionsTitle}</div>
        ${F.map(
      ([a, l]) => d`
            <div class="field">
              <ha-formfield .label=${e[l]}>
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
    const n = { ...this._config };
    e ? delete n[t] : n[t] = !1, this._emit(n);
  }
  _onSiteClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e?.value === void 0) return;
    const n = { ...this._config };
    e.value === "__auto__" ? delete n.site_index : n.site_index = Math.max(0, Math.trunc(Number(e.value))), this._emit(n);
  }
  _onPowerHoursClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e.value === "" || e.value === void 0) return;
    const n = Math.trunc(Number(e.value));
    if (!b.has(n)) return;
    const r = parseFloat(this._config?.power_history_hours), i = b.has(Math.trunc(r)) ? Math.trunc(r) : 6;
    if (n === i) return;
    const s = { ...this._config, power_history_hours: n };
    this._emit(s);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", D);
export {
  R as C,
  p as S,
  H as a,
  N as b,
  I as c,
  G as d,
  W as e,
  E as f,
  q as g,
  X as h,
  z as i,
  y as j,
  K as k,
  V as l,
  L as m,
  S as n,
  U as o,
  Y as r,
  B as s,
  m as t
};
