/**
 * Thin shell registered as hub-energie-card so Lovelace always finds the custom element.
 * Loads the real card module asynchronously and swaps the loader for hub-energie-card-core.
 *
 * Lovelace resource URL should include ?v=<ms> (refreshed on integration reload) so this
 * boot module refetches. The core bundle is loaded via import() with the same ?v= so it
 * is not stuck in the module cache after a deploy/reload.
 */
import "./hub-energie-card-editor.js";
import "./hub-energie-flow-card-editor.js";

function cacheBustedSibling(relativeHref) {
  const base = new URL(import.meta.url);
  const v = base.searchParams.get("v");
  const resolved = new URL(relativeHref, base);
  if (v) {
    resolved.searchParams.set("v", v);
  }
  return resolved.href;
}

void import(cacheBustedSibling("./hub-energie-flow-card.js")).catch((err) => {
  console.error("[hub-energie-card-boot] flow module failed to load", err);
});

const LOADER_HTML = `
  <style>
    :host { display: block; min-height: 96px; }
    .wrap { padding: 16px; font: 14px/1.4 var(--paper-font-body1_-_font-family, Roboto, sans-serif); color: var(--primary-text-color, #212121); }
  </style>
  <ha-card><div class="wrap">Hub Énergie…</div></ha-card>
`;

class HubEnergieCardBoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._core = null;
    this._hass = undefined;
    this._config = undefined;
    this._loadPromise = null;
  }

  connectedCallback() {
    if (!this._loadPromise) {
      this.shadowRoot.innerHTML = LOADER_HTML;
    }
    void this._ensureCore();
  }

  _ensureCore() {
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      try {
        await import(cacheBustedSibling("./hub-energie-card.js"));
      } catch (err) {
        console.error("[hub-energie-card-boot] core module failed to load", err);
        const msg = err && (err.message || String(err)) ? String(err.message || err) : "unknown";
        const safe = msg.replace(/</g, "&lt;").slice(0, 400);
        this.shadowRoot.innerHTML =
          `<style>:host{display:block}</style><ha-card><div style="padding:16px;font:14px/1.4 sans-serif">` +
          `<strong>Hub Énergie</strong> (load error)<br/><small style="opacity:.85">${safe}</small></div></ha-card>`;
        return;
      }
      const Core = customElements.get("hub-energie-card-core");
      if (!Core || this._core) return;

      const core = document.createElement("hub-energie-card-core");
      if (this._config !== undefined) core.setConfig(this._config);
      if (this._hass !== undefined) core.hass = this._hass;

      this.shadowRoot.innerHTML = "";
      const slotStyle = document.createElement("style");
      slotStyle.textContent = ":host { display: block; }";
      this.shadowRoot.appendChild(slotStyle);
      this.shadowRoot.appendChild(core);
      this._core = core;
    })();
    return this._loadPromise;
  }

  set hass(value) {
    this._hass = value;
    if (this._core) this._core.hass = value;
    else void this._ensureCore().then(() => {
      if (this._core && this._hass !== undefined) this._core.hass = this._hass;
    });
  }

  get hass() {
    return this._core ? this._core.hass : this._hass;
  }

  setConfig(config) {
    this._config = config;
    if (this._core) {
      this._core.setConfig(config);
    } else {
      void this._ensureCore().then(() => {
        if (this._core && this._config !== undefined) this._core.setConfig(this._config);
      });
    }
  }

  getCardSize() {
    return this._core?.getCardSize?.() ?? 8;
  }

  getGridOptions() {
    if (this._core?.getGridOptions) return this._core.getGridOptions();
    const raw = Number(this._config?.grid_span ?? 1);
    const span = Number.isFinite(raw) ? Math.max(1, Math.min(3, Math.trunc(raw))) : 1;
    const defaultCols = span * 12;
    return {
      columns: defaultCols,
      min_columns: 3,
      rows: 8,
      min_rows: 4,
    };
  }

  static getConfigElement() {
    return document.createElement("hub-energie-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:hub-energie-card",
      grid_span: 2,
    };
  }
}

if (!customElements.get("hub-energie-card")) {
  customElements.define("hub-energie-card", HubEnergieCardBoot);
}

window.customCards ??= [];
window.customCards.push(
  {
    type: "hub-energie-card",
    name: "Hub Énergie — dashboard",
    description:
      "Daily energy, cost and savings. Editor: layout, power graph window, section visibility; YAML for refresh interval.",
    preview: false,
    documentationURL: "https://hub-energie.ts-devops.com",
  },
  {
    type: "hub-energie-flow-card",
    name: "Hub Énergie — power flow",
    description:
      "Live power-flow diagram (frontend_data / frontend_meta). Editor: layout and debug; YAML for title.",
    preview: true,
    documentationURL: "https://hub-energie.ts-devops.com",
  },
);
