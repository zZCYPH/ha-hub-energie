import { i as u, a as f, I as l, b as n } from "./i18n.js";
function p(h, e) {
  let t = String(h);
  for (const [o, s] of Object.entries(e))
    t = t.split(`{${o}}`).join(String(s));
  return t;
}
const a = "custom:hub-energie-card", c = /* @__PURE__ */ new Set([24, 12, 6, 3, 1]), w = [1, 3, 6, 12, 24], g = [
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
class m extends u {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 }
  };
  static styles = f`
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
  setConfig(e) {
    this._config = e && typeof e == "object" ? { ...e } : { type: a }, this._config.type || (this._config.type = a);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? l.en : l.fr;
  }
  _sectionOn(e) {
    const t = this._config?.[e];
    return t !== !1 && t !== "false";
  }
  render() {
    const e = this._config ?? {}, t = this._i18n(), o = parseFloat(e.power_history_hours), s = Math.trunc(o), r = c.has(s) ? s : 6;
    return n`
      <div class="card-config">
        <div class="field">
          <ha-select
            label=${t.editorPowerGraphWindow}
            .value=${String(r)}
            @closed=${this._onPowerHoursClosed}
            .fixedMenuPosition=${!0}
            .naturalMenuWidth=${!0}
          >
            ${w.map(
      (i) => n`<ha-list-item value="${String(i)}">${p(t.editorPowerHoursUnit, { n: i })}</ha-list-item>`
    )}
          </ha-select>
          <p class="hint">${t.editorPowerHoursHint}</p>
        </div>

        <div class="sections-title">${t.editorSectionsTitle}</div>
        ${g.map(
      ([i, d]) => n`
            <div class="field">
              <ha-formfield .label=${t[d]}>
                <ha-switch
                  .checked=${this._sectionOn(i)}
                  @change=${(_) => this._setSectionFlag(i, _.target.checked)}
                ></ha-switch>
              </ha-formfield>
            </div>
          `
    )}

        <p class="hint">
          ${t.editorAdvancedYamlBefore}<code>power_history_refresh_seconds</code>${t.editorAdvancedYamlAfter}
        </p>
      </div>
    `;
  }
  _emit(e) {
    const t = { ...e };
    t.type = a, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: t }
      })
    );
  }
  _setSectionFlag(e, t) {
    const o = { ...this._config };
    t ? delete o[e] : o[e] = !1, this._emit(o);
  }
  _onPowerHoursClosed(e) {
    e.stopPropagation();
    const t = e.target;
    if (!t?.value) return;
    const o = Math.trunc(Number(t.value));
    if (!c.has(o)) return;
    const s = parseFloat(this._config?.power_history_hours), r = c.has(Math.trunc(s)) ? Math.trunc(s) : 6;
    if (o === r) return;
    const i = { ...this._config, power_history_hours: o };
    this._emit(i);
  }
}
customElements.get("hub-energie-card-editor") || customElements.define("hub-energie-card-editor", m);
export {
  p as t
};
