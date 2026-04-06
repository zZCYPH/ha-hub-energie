import { LitElement, css, html } from "lit";
import { I18N } from "./constants/i18n.js";
import { tpl } from "./utils/i18n-template.js";

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

  _i18n() {
    const lang = String(this.hass?.locale?.language ?? "fr").toLowerCase();
    return lang.startsWith("en") ? I18N.en : I18N.fr;
  }

  render() {
    const c = this._config ?? {};
    const i18n = this._i18n();
    const gridSpan = Number(c.grid_span ?? 1);
    const spanVal = Number.isFinite(gridSpan) ? Math.max(1, Math.min(3, Math.trunc(gridSpan))) : 1;
    const hoursRaw = parseFloat(c.power_history_hours);
    const hoursTrunc = Math.trunc(hoursRaw);
    const hoursVal = POWER_HISTORY_HOURS_SET.has(hoursTrunc) ? hoursTrunc : 6;

    return html`
      <div class="card-config">
        <div class="field">
          <ha-select
            label=${i18n.editorGridWidth}
            .value=${String(spanVal)}
            @closed=${this._onGridSpanClosed}
            .fixedMenuPosition=${true}
            .naturalMenuWidth=${true}
          >
            <ha-list-item value="1">${i18n.editorGridSpanNarrow}</ha-list-item>
            <ha-list-item value="2">${i18n.editorGridSpanDefault}</ha-list-item>
            <ha-list-item value="3">${i18n.editorGridSpanFull}</ha-list-item>
          </ha-select>
        </div>

        <div class="field">
          <ha-select
            label=${i18n.editorPowerGraphWindow}
            .value=${String(hoursVal)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${true}
            .naturalMenuWidth=${true}
          >
            ${POWER_HISTORY_HOURS_UI.map(
              (h) =>
                html`<ha-list-item value="${String(h)}">${tpl(i18n.editorPowerHoursUnit, { n: h })}</ha-list-item>`,
            )}
          </ha-select>
          <p class="hint">${i18n.editorPowerHoursHint}</p>
        </div>

        <p class="hint">
          ${i18n.editorAdvancedYamlBefore}<code>power_history_refresh_seconds</code>${i18n.editorAdvancedYamlAfter}
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
