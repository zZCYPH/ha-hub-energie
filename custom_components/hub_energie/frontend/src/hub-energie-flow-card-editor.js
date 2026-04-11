import { LitElement, css, html } from "lit";
import { I18N } from "./constants/i18n.js";

const CARD_TYPE = "custom:hub-energie-flow-card";
const LAYOUT_OPTIONS = ["auto", "full", "compact"];

export class HubEnergieFlowCardEditor extends LitElement {
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
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
    ha-formfield {
      display: block;
    }
    .motion-note {
      margin: 10px 0 0;
      font-size: 11px;
      line-height: 1.35;
      color: var(--disabled-text-color, #9e9e9e);
    }
  `;

  setConfig(config) {
    this._config = config && typeof config === "object" ? { ...config } : { type: CARD_TYPE };
    if (!this._config.type) this._config.type = CARD_TYPE;
  }

  render() {
    const i18n = this._i18n();
    const layout = LAYOUT_OPTIONS.includes(this._config?.layout) ? this._config.layout : "auto";
    const debug = this._config?.debug === true || this._config?.debug === "true";
    return html`
      <div class="field">
        <ha-textfield
          label=${i18n.flowEditorTitle}
          .value=${this._config?.title ?? ""}
          @input=${this._onTitleInput}
        ></ha-textfield>
      </div>
      <div class="field">
        <ha-select
          label=${i18n.flowEditorLayout}
          .value=${layout}
          @closed=${this._onLayoutClosed}
          .fixedMenuPosition=${true}
          .naturalMenuWidth=${true}
        >
          <ha-list-item value="auto">${i18n.flowEditorLayoutAuto}</ha-list-item>
          <ha-list-item value="full">${i18n.flowEditorLayoutFull}</ha-list-item>
          <ha-list-item value="compact">${i18n.flowEditorLayoutCompact}</ha-list-item>
        </ha-select>
        <p class="hint">${i18n.flowEditorLayoutHint}</p>
      </div>
      <div class="field">
        <ha-formfield .label=${i18n.flowEditorDebug}>
          <ha-switch
            .checked=${debug}
            @change=${(event) => this._setBool("debug", event.target.checked)}
          ></ha-switch>
        </ha-formfield>
        <p class="hint">${i18n.flowEditorDebugHint}</p>
        <p class="motion-note">${i18n.flowEditorReducedMotionNote}</p>
      </div>
      <div class="field">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.frontend_data_entity ?? ""}
          label=${i18n.flowEditorDataEntity}
          .includeDomains=${["sensor"]}
          allow-custom-entity
          @value-changed=${(event) => this._onEntityChanged("frontend_data_entity", event)}
        ></ha-entity-picker>
      </div>
      <div class="field">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.frontend_meta_entity ?? ""}
          label=${i18n.flowEditorMetaEntity}
          .includeDomains=${["sensor"]}
          allow-custom-entity
          @value-changed=${(event) => this._onEntityChanged("frontend_meta_entity", event)}
        ></ha-entity-picker>
        <p class="hint">${i18n.flowEditorEntityHint}</p>
      </div>
    `;
  }

  _i18n() {
    const lang = String(this.hass?.locale?.language ?? "fr").toLowerCase();
    return lang.startsWith("en") ? I18N.en : I18N.fr;
  }

  _emit(config) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: { ...config, type: CARD_TYPE } },
      }),
    );
  }

  _onTitleInput(event) {
    const next = { ...this._config };
    const value = String(event.target?.value ?? "").trim();
    if (value) next.title = value;
    else delete next.title;
    this._emit(next);
  }

  _onLayoutClosed(event) {
    event.stopPropagation();
    const value = String(event.target?.value ?? "auto");
    if (!LAYOUT_OPTIONS.includes(value)) return;
    const next = { ...this._config };
    if (value === "auto") delete next.layout;
    else next.layout = value;
    this._emit(next);
  }

  _setBool(key, on) {
    const next = { ...this._config };
    if (on) next[key] = true;
    else delete next[key];
    this._emit(next);
  }

  _onEntityChanged(key, event) {
    const raw = event.detail?.value ?? "";
    const value = String(raw).trim();
    const next = { ...this._config };
    if (value) next[key] = value;
    else delete next[key];
    this._emit(next);
  }
}

if (!customElements.get("hub-energie-flow-card-editor")) {
  customElements.define("hub-energie-flow-card-editor", HubEnergieFlowCardEditor);
}
