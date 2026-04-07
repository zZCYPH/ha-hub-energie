import "./hub-energie-card-editor.js";
const o = `
  <style>
    :host { display: block; min-height: 96px; }
    .wrap { padding: 16px; font: 14px/1.4 var(--paper-font-body1_-_font-family, Roboto, sans-serif); color: var(--primary-text-color, #212121); }
  </style>
  <ha-card><div class="wrap">Hub Énergie…</div></ha-card>
`;
class r extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._core = null, this._hass = void 0, this._config = void 0, this._loadPromise = null;
  }
  connectedCallback() {
    this._loadPromise || (this.shadowRoot.innerHTML = o), this._ensureCore();
  }
  _ensureCore() {
    return this._loadPromise ? this._loadPromise : (this._loadPromise = (async () => {
      try {
        await import("./hub-energie-card.js");
      } catch (i) {
        console.error("[hub-energie-card-boot] core module failed to load", i), this.shadowRoot.innerHTML = '<style>:host{display:block}</style><ha-card><div style="padding:16px">Hub Énergie (load error)</div></ha-card>';
        return;
      }
      if (!customElements.get("hub-energie-card-core") || this._core) return;
      const t = document.createElement("hub-energie-card-core");
      this._config !== void 0 && t.setConfig(this._config), this._hass !== void 0 && (t.hass = this._hass), this.shadowRoot.innerHTML = "";
      const s = document.createElement("style");
      s.textContent = ":host { display: block; }", this.shadowRoot.appendChild(s), this.shadowRoot.appendChild(t), this._core = t;
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
customElements.get("hub-energie-card") || customElements.define("hub-energie-card", r);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-card",
  name: "Hub Énergie",
  description: "Daily energy, cost and savings. Editor: layout, graph window, section visibility; YAML for refresh interval.",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
