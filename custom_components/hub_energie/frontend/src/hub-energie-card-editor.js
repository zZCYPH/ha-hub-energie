import { LitElement, css, html, nothing } from "lit";
import { I18N } from "./constants/i18n.js";
import { tpl } from "./utils/i18n-template.js";
import { hubSitesFromStates } from "./utils/energy-utils.js";

/** Site row label for ha-list-item (avoid tpl from another chunk in boot bundle). */
function siteOptionLabel(i18n, site) {
  const t = i18n?.editorSiteOption ?? "{index} — {segment}";
  const idx = String(site?.index ?? "");
  const seg = site?.segment != null && String(site.segment).trim() !== "" ? String(site.segment).trim() : idx;
  return String(t).split("{index}").join(idx).split("{segment}").join(seg);
}

const CARD_TYPE = "custom:hub-energie-card";

/** Allowed values; must match snap list in hub-energie-card.js */
const POWER_HISTORY_HOURS_SET = new Set([24, 12, 6, 3, 1]);
/** Ascending order for the select UI */
const POWER_HISTORY_HOURS_UI = [1, 3, 6, 12, 24];

/** [yamlKey, i18n label property on I18N.fr / I18N.en] */
const SECTION_TOGGLES = [
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
  ["show_raw_control", "editorShowRawControl"],
];

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

  setConfig(config) {
    this._config = config && typeof config === "object" ? { ...config } : { type: CARD_TYPE };
    if (!this._config.type) this._config.type = CARD_TYPE;
  }

  _i18n() {
    const lang = String(this.hass?.locale?.language ?? "fr").toLowerCase();
    return lang.startsWith("en") ? I18N.en : I18N.fr;
  }

  _sectionOn(key) {
    const v = this._config?.[key];
    return v !== false && v !== "false";
  }

  _hubSites() {
    return hubSitesFromStates(this.hass?.states);
  }

  _siteSelectValue() {
    const raw = this._config?.site_index;
    if (raw === "" || raw === undefined || raw === null) return "__auto__";
    const n = Math.trunc(Number(raw));
    return Number.isFinite(n) && n >= 0 ? String(n) : "__auto__";
  }

  render() {
    const c = this._config ?? {};
    const i18n = this._i18n();
    const hoursRaw = parseFloat(c.power_history_hours);
    const hoursTrunc = Math.trunc(hoursRaw);
    const hoursVal = POWER_HISTORY_HOURS_SET.has(hoursTrunc) ? hoursTrunc : 6;

    const sites = this._hubSites();
    const siteSel = this._siteSelectValue();

    return html`
      <div class="card-config">
        ${sites.length >= 1
          ? html`
              <div class="field">
                <ha-select
                  label=${i18n.editorSiteLabel}
                  .value=${siteSel}
                  @closed=${this._onSiteClosed}
                  .fixedMenuPosition=${true}
                  .naturalMenuWidth=${true}
                >
                  <ha-list-item value="__auto__">${i18n.siteAuto}</ha-list-item>
                  ${sites.map(
                    (s) => html`
                      <ha-list-item value="${String(s.index)}">${siteOptionLabel(i18n, s)}</ha-list-item>
                    `,
                  )}
                </ha-select>
                <p class="hint">${i18n.editorSiteHint}</p>
              </div>
            `
          : nothing}
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

        <div class="sections-title">${i18n.editorSectionsTitle}</div>
        ${SECTION_TOGGLES.map(
          ([key, labelProp]) => html`
            <div class="field">
              <ha-formfield .label=${i18n[labelProp]}>
                <ha-switch
                  .checked=${this._sectionOn(key)}
                  @change=${(e) => this._setSectionFlag(key, e.target.checked)}
                ></ha-switch>
              </ha-formfield>
            </div>
          `,
        )}

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

  _setSectionFlag(key, on) {
    const next = { ...this._config };
    if (on) delete next[key];
    else next[key] = false;
    this._emit(next);
  }

  _onSiteClosed(ev) {
    ev.stopPropagation();
    const sel = ev.target;
    if (sel?.value === undefined) return;
    const next = { ...this._config };
    if (sel.value === "__auto__") delete next.site_index;
    else next.site_index = Math.max(0, Math.trunc(Number(sel.value)));
    this._emit(next);
  }

  _onPowerHoursClosed(ev) {
    /* ha-select fires a bubbling "closed" event; HA card config dialog listens for it too. */
    ev.stopPropagation();
    const sel = ev.target;
    if (sel.value === "" || sel.value === undefined) return;
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
