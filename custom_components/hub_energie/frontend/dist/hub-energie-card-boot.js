import { i as g, a as m, I as c, A as y, b as l } from "./i18n.js";
import { h as $, t as _ } from "./energy-utils.js";
const h = "custom:hub-energie-card", d = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), S = [1, 3, 6, 12, 24], E = [
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
class C extends g {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = m`
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
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? c.en : c.fr;
  }
  _sectionOn(t) {
    const e = this._config?.[t];
    return e !== !1 && e !== "false";
  }
  _hubSites() {
    return $(this.hass?.states);
  }
  _siteSelectValue() {
    const t = this._config?.site_index;
    if (t === "" || t === void 0 || t === null) return "__auto__";
    const e = Math.trunc(Number(t));
    return Number.isFinite(e) && e >= 0 ? String(e) : "__auto__";
  }
  render() {
    const t = this._config ?? {}, e = this._i18n(), i = parseFloat(t.power_history_hours), s = Math.trunc(i), n = d.has(s) ? s : 6, a = this._hubSites(), w = this._siteSelectValue();
    return l`
      <div class="card-config">
        ${a.length >= 1 ? l`
              <div class="field">
                <ha-select
                  label=${e.editorSiteLabel}
                  .value=${w}
                  @closed=${this._onSiteClosed}
                  .fixedMenuPosition=${!0}
                  .naturalMenuWidth=${!0}
                >
                  <ha-list-item value="__auto__">${e.siteAuto}</ha-list-item>
                  ${a.map(
      (o) => l`
                      <ha-list-item value="${String(o.index)}">
                        ${_(e.editorSiteOption, { index: String(o.index), segment: o.segment })}
                      </ha-list-item>
                    `
    )}
                </ha-select>
                <p class="hint">${e.editorSiteHint}</p>
              </div>
            ` : y}
        <div class="field">
          <ha-select
            label=${e.editorPowerGraphWindow}
            .value=${String(n)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${S.map(
      (o) => l`<ha-list-item value="${String(o)}">${_(e.editorPowerHoursUnit, { n: o })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${e.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${e.editorSectionsTitle}</div>
        ${E.map(
      ([o, b]) => l`
            <div class="field">
              <ha-formfield .label=${e[b]}>
                <ha-switch
                  .checked=${this._sectionOn(o)}
                  @change=${(v) => this._setSectionFlag(o, v.target.checked)}
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
    const i = { ...this._config };
    e ? delete i[t] : i[t] = !1, this._emit(i);
  }
  _onSiteClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e?.value === void 0) return;
    const i = { ...this._config };
    e.value === "__auto__" ? delete i.site_index : i.site_index = Math.max(0, Math.trunc(Number(e.value))), this._emit(i);
  }
  _onPowerHoursClosed(t) {
    t.stopPropagation();
    const e = t.target;
    if (e.value === "" || e.value === void 0) return;
    const i = Math.trunc(Number(e.value));
    if (!d.has(i)) return;
    const s = parseFloat(this._config?.power_history_hours), n = d.has(Math.trunc(s)) ? Math.trunc(s) : 6;
    if (i === n) return;
    const a = { ...this._config, power_history_hours: i };
    this._emit(a);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", C);
const u = "custom:hub-energie-flow-card", f = ["auto", "full", "compact"];
class x extends g {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = m`
    :host {
      display: block;
    }
    .field {
      display: block;
      margin-bottom: 16px;
    }
    .hint {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
    ha-formfield {
      display: block;
    }
  `;
  setConfig(t) {
    this._config = t && typeof t == "object" ? { ...t } : { type: u }, this._config.type || (this._config.type = u);
  }
  render() {
    const t = this._i18n(), e = f.includes(this._config?.layout) ? this._config.layout : "auto", i = this._config?.debug === !0 || this._config?.debug === "true";
    return l`
      <div class="field">
        <ha-textfield
          label=${t.flowEditorTitle}
          .value=${this._config?.title ?? ""}
          @input=${this._onTitleInput}
        ></ha-textfield>
      </div>
      <div class="field">
        <ha-select
          label=${t.flowEditorLayout}
          .value=${e}
          @closed=${this._onLayoutClosed}
          .fixedMenuPosition=${!0}
          .naturalMenuWidth=${!0}
        >
          <ha-list-item value="auto">${t.flowEditorLayoutAuto}</ha-list-item>
          <ha-list-item value="full">${t.flowEditorLayoutFull}</ha-list-item>
          <ha-list-item value="compact">${t.flowEditorLayoutCompact}</ha-list-item>
        </ha-select>
        <p class="hint">${t.flowEditorLayoutHint}</p>
      </div>
      <div class="field">
        <ha-formfield .label=${t.flowEditorDebug}>
          <ha-switch
            .checked=${i}
            @change=${(s) => this._setBool("debug", s.target.checked)}
          ></ha-switch>
        </ha-formfield>
        <p class="hint">${t.flowEditorDebugHint}</p>
      </div>
      <div class="field">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.frontend_data_entity ?? ""}
          label=${t.flowEditorDataEntity}
          .includeDomains=${["sensor"]}
          allow-custom-entity
          @value-changed=${(s) => this._onEntityChanged("frontend_data_entity", s)}
        ></ha-entity-picker>
      </div>
      <div class="field">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.frontend_meta_entity ?? ""}
          label=${t.flowEditorMetaEntity}
          .includeDomains=${["sensor"]}
          allow-custom-entity
          @value-changed=${(s) => this._onEntityChanged("frontend_meta_entity", s)}
        ></ha-entity-picker>
        <p class="hint">${t.flowEditorEntityHint}</p>
      </div>
    `;
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? c.en : c.fr;
  }
  _emit(t) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: { ...t, type: u } }
      })
    );
  }
  _onTitleInput(t) {
    const e = { ...this._config }, i = String(t.target?.value ?? "").trim();
    i ? e.title = i : delete e.title, this._emit(e);
  }
  _onLayoutClosed(t) {
    t.stopPropagation();
    const e = String(t.target?.value ?? "auto");
    if (!f.includes(e)) return;
    const i = { ...this._config };
    e === "auto" ? delete i.layout : i.layout = e, this._emit(i);
  }
  _setBool(t, e) {
    const i = { ...this._config };
    e ? i[t] = !0 : delete i[t], this._emit(i);
  }
  _onEntityChanged(t, e) {
    const i = e.detail?.value ?? "", s = String(i).trim(), n = { ...this._config };
    s ? n[t] = s : delete n[t], this._emit(n);
  }
}
customElements.get("hub-energie-flow-card-editor") || customElements.define("hub-energie-flow-card-editor", x);
function p(r) {
  const t = new URL(import.meta.url), e = t.searchParams.get("v"), i = new URL(r, t);
  return e && i.searchParams.set("v", e), i.href;
}
import(p("./hub-energie-flow-card.js")).catch((r) => {
  console.error("[hub-energie-card-boot] flow module failed to load", r);
});
const H = `
  <style>
    :host { display: block; min-height: 96px; }
    .wrap { padding: 16px; font: 14px/1.4 var(--paper-font-body1_-_font-family, Roboto, sans-serif); color: var(--primary-text-color, #212121); }
  </style>
  <ha-card><div class="wrap">Hub Énergie…</div></ha-card>
`;
class L extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._core = null, this._hass = void 0, this._config = void 0, this._loadPromise = null;
  }
  connectedCallback() {
    this._loadPromise || (this.shadowRoot.innerHTML = H), this._ensureCore();
  }
  _ensureCore() {
    return this._loadPromise ? this._loadPromise : (this._loadPromise = (async () => {
      try {
        await import(p("./hub-energie-card.js"));
      } catch (s) {
        console.error("[hub-energie-card-boot] core module failed to load", s);
        const a = (s && (s.message || String(s)) ? String(s.message || s) : "unknown").replace(/</g, "&lt;").slice(0, 400);
        this.shadowRoot.innerHTML = `<style>:host{display:block}</style><ha-card><div style="padding:16px;font:14px/1.4 sans-serif"><strong>Hub Énergie</strong> (load error)<br/><small style="opacity:.85">${a}</small></div></ha-card>`;
        return;
      }
      if (!customElements.get("hub-energie-card-core") || this._core) return;
      const e = document.createElement("hub-energie-card-core");
      this._config !== void 0 && e.setConfig(this._config), this._hass !== void 0 && (e.hass = this._hass), this.shadowRoot.innerHTML = "";
      const i = document.createElement("style");
      i.textContent = ":host { display: block; }", this.shadowRoot.appendChild(i), this.shadowRoot.appendChild(e), this._core = e;
    })(), this._loadPromise);
  }
  set hass(t) {
    this._hass = t, this._core ? this._core.hass = t : this._ensureCore().then(() => {
      this._core && this._hass !== void 0 && (this._core.hass = this._hass);
    });
  }
  get hass() {
    return this._core ? this._core.hass : this._hass;
  }
  setConfig(t) {
    this._config = t, this._core ? this._core.setConfig(t) : this._ensureCore().then(() => {
      this._core && this._config !== void 0 && this._core.setConfig(this._config);
    });
  }
  getCardSize() {
    return this._core?.getCardSize?.() ?? 8;
  }
  getGridOptions() {
    if (this._core?.getGridOptions) return this._core.getGridOptions();
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
}
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", L);
window.customCards ??= [];
window.customCards.push(
  {
    type: "hub-energie-card",
    name: "Hub Énergie — dashboard",
    description: "Daily energy, cost and savings. Editor: layout, power graph window, section visibility; YAML for refresh interval.",
    preview: !1,
    documentationURL: "https://hub-energie.ts-devops.com"
  },
  {
    type: "hub-energie-flow-card",
    name: "Hub Énergie — power flow",
    description: "Live power-flow diagram (frontend_data / frontend_meta). Editor: layout and debug; YAML for title.",
    preview: !0,
    documentationURL: "https://hub-energie.ts-devops.com"
  }
);
