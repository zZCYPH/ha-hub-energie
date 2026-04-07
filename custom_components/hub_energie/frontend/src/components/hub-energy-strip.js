import { LitElement, html, css, nothing } from "lit";
import { iconForLabel, isGridSlotLabel, isLightHexColor, labelLooksHc } from "../utils/format-utils.js";

class HubEnergyStrip extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      segments: { attribute: false },
      total: { type: Number },
      formatter: { attribute: false },
      unit: { type: String },
      tooltip: { type: String },
      breakdown: { attribute: false },
      showBreakdown: { type: Boolean },
      displayValue: { type: String },
      fillPercent: { type: Number },
      emptyLabel: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .cons-strip {
        margin-bottom: 7px;
      }
      .cons-strip:last-child {
        margin-bottom: 0;
      }
      .cons-strip-cap {
        text-align: center;
        font-size: 0.64rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0 0 3px;
        line-height: 1.2;
      }
      .empty {
        font-size: 0.72rem;
        opacity: 0.55;
        margin: 4px 0 0;
      }
      .bar-wrap {
        position: relative;
        margin-bottom: 2px;
      }
      .track {
        border-radius: 8px;
        min-width: 48px;
        height: 24px;
        background: var(--divider-color);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        overflow: hidden;
      }
      .fill-stack {
        position: relative;
        height: 100%;
        display: flex;
        border-radius: 8px;
        overflow: hidden;
      }
      .fill-seg {
        height: 100%;
        display: inline-block;
      }
      .fill-hc {
        background-image: repeating-linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.35) 0px,
          rgba(255, 255, 255, 0.35) 4px,
          transparent 4px,
          transparent 8px
        );
      }
      .bar-total {
        position: absolute;
        left: 4px;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: none;
        z-index: 2;
      }
      .bar-total::before,
      .bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .bar-total-text {
        font-size: 0.66rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
        white-space: nowrap;
        flex-shrink: 0;
        color: #fff;
        text-shadow:
          0 0 14px rgba(0, 0, 0, 1),
          0 0 6px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 1px;
        padding: 0;
        font-size: 0.62rem;
        line-height: 1.25;
      }
      .icon-brk-item {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        padding: 1px 6px;
        border-radius: 5px;
        background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .icon-brk-item ha-icon {
        --mdc-icon-size: 10px;
        opacity: 0.85;
        flex-shrink: 0;
      }
      .icon-brk-item b {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
      }
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        max-height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 9px;
        color: #fff;
        opacity: 1;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
        pointer-events: none;
      }
      .icon-brk-swatch.swatch-icon-dark ha-icon {
        color: #111;
        filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.7));
      }
      .icon-brk-pct {
        opacity: 0.6;
        margin-left: 1px;
      }
    `;
  }

  constructor() {
    super();
    this.title = "";
    this.segments = [];
    this.total = 0;
    this.formatter = (v) => String(v);
    this.unit = "";
    this.tooltip = "";
    this.breakdown = [];
    this.showBreakdown = true;
    this.displayValue = "";
    this.fillPercent = 100;
    this.emptyLabel = "";
  }

  _renderStackedFill(segments) {
    const valid = (segments ?? []).filter((s) => Number(s?.value) > 0.001);
    const segTotal = valid.reduce((acc, s) => acc + Number(s.value), 0) || 1;
    return valid.map((s) => html`
      <span
        class="fill-seg ${s.className ?? ""}"
        style="width:${((Number(s.value) / segTotal) * 100).toFixed(1)}%;background-color:${s.color}"
      ></span>
    `);
  }

  _renderBreakdown() {
    const rows = this.breakdown ?? [];
    if (!this.showBreakdown || !rows.length) return nothing;
    const total = Number(this.total) || 0;
    return html`
      <div class="icon-brk">
        ${rows.map((r) => {
          const icon = r.icon ?? (isGridSlotLabel(r.label) ? "mdi:transmission-tower" : iconForLabel(r.label));
          const swatchIconClass = isLightHexColor(r.color) ? "swatch-icon-dark" : "";
          return html`
            <span class="icon-brk-item">
              ${r.color
                ? html`<span
                    class="icon-brk-swatch ${labelLooksHc(r.label) ? "fill-hc" : ""} ${swatchIconClass}"
                    style="background-color:${r.color}"
                  >
                    ${icon ? html`<ha-icon icon=${icon}></ha-icon>` : nothing}
                  </span>`
                : icon
                  ? html`<ha-icon icon=${icon}></ha-icon>`
                  : nothing}
              <span>${r.label}</span>&nbsp;<b>${r.value}</b>
              ${total > 0 && r.rawV != null
                ? html`<span class="icon-brk-pct">(${Math.round((Number(r.rawV) / total) * 100)}%)</span>`
                : nothing}
            </span>
          `;
        })}
      </div>
    `;
  }

  _displayTotal() {
    if (this.displayValue) return this.displayValue;
    if (typeof this.formatter === "function") return this.formatter(this.total);
    if (this.unit) return `${Number(this.total).toFixed(2)} ${this.unit}`;
    return String(this.total);
  }

  render() {
    const validSegs = (this.segments ?? []).filter((s) => Number(s?.value) > 0.001);
    if (!validSegs.length) {
      return html`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.title}</div>
          <p class="empty">${this.emptyLabel || "—"}</p>
        </div>
      `;
    }
    const clamped = Math.max(0, Math.min(100, Number(this.fillPercent) || 0));
    return html`
      <div class="cons-strip">
        <div class="cons-strip-cap">${this.title}</div>
        <div class="bar-wrap" title=${this.tooltip || nothing}>
          <div class="track">
            <div class="fill-stack" style="width:${clamped.toFixed(1)}%">
              ${this._renderStackedFill(validSegs)}
            </div>
          </div>
          <div class="bar-total">
            <span class="bar-total-text">${this._displayTotal()}</span>
          </div>
        </div>
        ${this._renderBreakdown()}
      </div>
    `;
  }
}

if (!customElements.get("hub-energy-strip")) {
  customElements.define("hub-energy-strip", HubEnergyStrip);
}
