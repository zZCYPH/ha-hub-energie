import "./hub-energie-card-editor.js";
import { i as c, a as h, b as d, I as n } from "./i18n.js";
const r = "custom:hub-energie-flow-card", a = ["auto", "full", "compact"];
class u extends c {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = h`
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
  setConfig(e) {
    this._config = e && typeof e == "object" ? { ...e } : { type: r }, this._config.type || (this._config.type = r);
  }
  render() {
    const e = this._i18n(), t = a.includes(this._config?.layout) ? this._config.layout : "auto", i = this._config?.debug === !0 || this._config?.debug === "true";
    return d`
      <div class="field">
        <ha-textfield
          label=${e.flowEditorTitle}
          .value=${this._config?.title ?? ""}
          @input=${this._onTitleInput}
        ></ha-textfield>
      </div>
      <div class="field">
        <ha-select
          label=${e.flowEditorLayout}
          .value=${t}
          @closed=${this._onLayoutClosed}
          .fixedMenuPosition=${!0}
          .naturalMenuWidth=${!0}
        >
          <ha-list-item value="auto">${e.flowEditorLayoutAuto}</ha-list-item>
          <ha-list-item value="full">${e.flowEditorLayoutFull}</ha-list-item>
          <ha-list-item value="compact">${e.flowEditorLayoutCompact}</ha-list-item>
        </ha-select>
        <p class="hint">${e.flowEditorLayoutHint}</p>
      </div>
      <div class="field">
        <ha-formfield .label=${e.flowEditorDebug}>
          <ha-switch
            .checked=${i}
            @change=${(s) => this._setBool("debug", s.target.checked)}
          ></ha-switch>
        </ha-formfield>
        <p class="hint">${e.flowEditorDebugHint}</p>
      </div>
    `;
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? n.en : n.fr;
  }
  _emit(e) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: { ...e, type: r } }
      })
    );
  }
  _onTitleInput(e) {
    const t = { ...this._config }, i = String(e.target?.value ?? "").trim();
    i ? t.title = i : delete t.title, this._emit(t);
  }
  _onLayoutClosed(e) {
    e.stopPropagation();
    const t = String(e.target?.value ?? "auto");
    if (!a.includes(t)) return;
    const i = { ...this._config };
    t === "auto" ? delete i.layout : i.layout = t, this._emit(i);
  }
  _setBool(e, t) {
    const i = { ...this._config };
    t ? i[e] = !0 : delete i[e], this._emit(i);
  }
}
customElements.get("hub-energie-flow-card-editor") || customElements.define("hub-energie-flow-card-editor", u);
function l(o) {
  const e = new URL(import.meta.url), t = e.searchParams.get("v"), i = new URL(o, e);
  return t && i.searchParams.set("v", t), i.href;
}
import(l("./hub-energie-flow-card.js")).catch((o) => {
  console.error("[hub-energie-card-boot] flow module failed to load", o);
});
const f = `
  <style>
    :host { display: block; min-height: 96px; }
    .wrap { padding: 16px; font: 14px/1.4 var(--paper-font-body1_-_font-family, Roboto, sans-serif); color: var(--primary-text-color, #212121); }
  </style>
  <ha-card><div class="wrap">Hub Énergie…</div></ha-card>
`;
class g extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._core = null, this._hass = void 0, this._config = void 0, this._loadPromise = null;
  }
  connectedCallback() {
    this._loadPromise || (this.shadowRoot.innerHTML = f), this._ensureCore();
  }
  _ensureCore() {
    return this._loadPromise ? this._loadPromise : (this._loadPromise = (async () => {
      try {
        await import(l("./hub-energie-card.js"));
      } catch (s) {
        console.error("[hub-energie-card-boot] core module failed to load", s), this.shadowRoot.innerHTML = '<style>:host{display:block}</style><ha-card><div style="padding:16px">Hub Énergie (load error)</div></ha-card>';
        return;
      }
      if (!customElements.get("hub-energie-card-core") || this._core) return;
      const t = document.createElement("hub-energie-card-core");
      this._config !== void 0 && t.setConfig(this._config), this._hass !== void 0 && (t.hass = this._hass), this.shadowRoot.innerHTML = "";
      const i = document.createElement("style");
      i.textContent = ":host { display: block; }", this.shadowRoot.appendChild(i), this.shadowRoot.appendChild(t), this._core = t;
    })(), this._loadPromise);
  }
  set hass(e) {
    this._hass = e, this._core ? this._core.hass = e : this._ensureCore().then(() => {
      this._core && this._hass !== void 0 && (this._core.hass = this._hass);
    });
  }
  get hass() {
    return this._core ? this._core.hass : this._hass;
  }
  setConfig(e) {
    this._config = e, this._core ? this._core.setConfig(e) : this._ensureCore().then(() => {
      this._core && this._config !== void 0 && this._core.setConfig(this._config);
    });
  }
  getCardSize() {
    return this._core?.getCardSize?.() ?? 8;
  }
  getGridOptions() {
    if (this._core?.getGridOptions) return this._core.getGridOptions();
    const e = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(e) ? Math.max(1, Math.min(3, Math.trunc(e))) : 1) * 12,
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
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", g);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Editor: layout, graph window, section visibility; YAML for refresh interval.",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
