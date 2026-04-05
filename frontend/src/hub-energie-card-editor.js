import { LitElement, css, html } from "lit";

const CARD_TYPE = "custom:hub-energie-card";

/** Allowed values; must match snap list in hub-energie-card.js */
const POWER_HISTORY_HOURS_SET = new Set([24, 12, 6, 3, 1]);
/** Ascending order for the select UI */
const POWER_HISTORY_HOURS_UI = [1, 3, 6, 12, 24];

export class HubEnergieCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = css`
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
  `;

  setConfig(config) {
    this._config = config && typeof config === "object" ? { ...config } : { type: CARD_TYPE };
    if (!this._config.type) this._config.type = CARD_TYPE;
  }

  async firstUpdated() {
    await this._ensureEntityPicker();
    this.requestUpdate();
  }

  async _ensureEntityPicker() {
    if (customElements.get("ha-entity-picker")) return;
    try {
      const load = window.loadCardHelpers;
      if (typeof load !== "function") return;
      const helpers = await load();
      const el = await helpers.createCardElement({ type: "entities", entities: [] });
      const Card = el.constructor;
      if (typeof Card.getConfigElement === "function") {
        Card.getConfigElement();
      }
    } catch {
      /* ha-entity-picker may already be registered by the dashboard editor */
    }
  }

  render() {
    const c = this._config ?? {};
    const gridSpan = Number(c.grid_span ?? 1);
    const spanVal = Number.isFinite(gridSpan) ? Math.max(1, Math.min(3, Math.trunc(gridSpan))) : 1;
    const hoursRaw = parseFloat(c.power_history_hours);
    const hoursTrunc = Math.trunc(hoursRaw);
    const hoursVal = POWER_HISTORY_HOURS_SET.has(hoursTrunc) ? hoursTrunc : 6;

    return html`
      <div class="card-config">
        <div class="field">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${c.cost_entity ?? ""}
            label="Cost detail entity"
            .includeDomains=${["sensor"]}
            .allowCustomEntity=${true}
            @value-changed=${this._onCostEntity}
          ></ha-entity-picker>
          <p class="hint">
            Hub Énergie <code>…_cost_detail</code> sensor. Leave empty to use the default
            <code>sensor.hub_energie_</code> prefix.
          </p>
        </div>

        <div class="field">
          <ha-textfield
            label="Entity prefix (optional)"
            .value=${c.entity_prefix ?? ""}
            placeholder="sensor.hub_energie_"
            @change=${this._onEntityPrefix}
          ></ha-textfield>
          <p class="hint">
            Optional. Overrides automatic prefix for non-default entity namespaces; a trailing
            <code>_</code> is added if missing.
          </p>
        </div>

        <div class="field">
          <ha-select
            label="Section width (grid columns)"
            .value=${String(spanVal)}
            @closed=${this._onGridSpanClosed}
            .fixedMenuPosition=${true}
            .naturalMenuWidth=${true}
          >
            <ha-list-item value="1">1 × 12 (narrow)</ha-list-item>
            <ha-list-item value="2">2 × 12 (default in card picker)</ha-list-item>
            <ha-list-item value="3">3 × 12 (full width)</ha-list-item>
          </ha-select>
        </div>

        <div class="field">
          <ha-select
            label="Power graph default window"
            .value=${String(hoursVal)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${true}
            .naturalMenuWidth=${true}
          >
            ${POWER_HISTORY_HOURS_UI.map(
              (h) => html`<ha-list-item value="${String(h)}">${h} hours</ha-list-item>`,
            )}
          </ha-select>
          <p class="hint">Rolling history length when opening the live power graph.</p>
        </div>

        <p class="hint">
          Advanced: <code>power_history_refresh_seconds</code> (live graph poll interval, default 120s)
          remains YAML-only for this version.
        </p>
      </div>
    `;
  }

  _emit(next) {
    const config = { ...next };
    config.type = CARD_TYPE;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config },
      }),
    );
  }

  _onCostEntity(ev) {
    const value = ev.detail?.value ?? "";
    const next = { ...this._config };
    if (value) next.cost_entity = value;
    else delete next.cost_entity;
    this._emit(next);
  }

  _onEntityPrefix(ev) {
    const raw = ev.target?.value ?? "";
    const next = { ...this._config };
    const trimmed = String(raw).trim();
    if (trimmed) next.entity_prefix = trimmed;
    else delete next.entity_prefix;
    this._emit(next);
  }

  _onGridSpanClosed(ev) {
    const sel = ev.target;
    if (!sel?.value) return;
    const n = Math.max(1, Math.min(3, Math.trunc(Number(sel.value))));
    if (!Number.isFinite(n)) return;
    const prev = Math.max(1, Math.min(3, Math.trunc(Number(this._config?.grid_span ?? 1))));
    if (n === prev) return;
    const next = { ...this._config, grid_span: n };
    this._emit(next);
  }

  _onPowerHoursClosed(ev) {
    const sel = ev.target;
    if (!sel?.value) return;
    const n = Math.trunc(Number(sel.value));
    if (!POWER_HISTORY_HOURS_SET.has(n)) return;
    const prevRaw = parseFloat(this._config?.power_history_hours);
    const prev = POWER_HISTORY_HOURS_SET.has(Math.trunc(prevRaw))
      ? Math.trunc(prevRaw)
      : 6;
    if (n === prev) return;
    const next = { ...this._config, power_history_hours: n };
    this._emit(next);
  }
}

if (!customElements.get("hub-energie-card-editor")) {
  customElements.define("hub-energie-card-editor", HubEnergieCardEditor);
}
