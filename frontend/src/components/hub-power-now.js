import { LitElement, html, css, nothing } from "lit";
import { COLOR_BATTERY, COLOR_GRID_SOURCE, COLOR_SOLAR } from "../constants/colors.js";
import { fmtPowerCompact } from "../utils/format-utils.js";

class HubPowerNow extends LitElement {
  static get properties() {
    return {
      i18n: { attribute: false },
      data: { attribute: false },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .power-now-wrap {
        margin: 0 0 6px;
        padding: 4px 6px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        font-size: 0.68rem;
        min-width: 0;
      }
      .power-now-wrap[role="button"] {
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .power-now-wrap[role="button"]:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--primary-color) 65%, transparent);
        outline-offset: 2px;
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
      .pnl-wrap {
        position: relative;
      }
      .pnl-bar {
        width: 100%;
        height: 20px;
        display: flex;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .pnl-seg {
        height: 100%;
        min-width: 2px;
        transition: width 0.2s ease;
      }
      .pnl-load-overlay {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.73rem;
        font-weight: 800;
        white-space: nowrap;
        pointer-events: none;
        z-index: 2;
        color: #fff;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9);
      }
      .icon-brk {
        display: flex;
        flex-wrap: wrap;
        gap: 3px 5px;
        justify-content: center;
        margin-top: 4px;
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
      .icon-brk-swatch {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .icon-brk-swatch ha-icon {
        --mdc-icon-size: 8px;
        color: #fff;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
      }
    `;
  }

  constructor() {
    super();
    this.i18n = {};
    this.data = null;
  }

  _emitToggle() {
    this.dispatchEvent(
      new CustomEvent("hub-power-now-toggle", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeyDown(ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      this._emitToggle();
    }
  }

  render() {
    const d = this.data;
    if (d == null) return nothing;

    const gridImp = d.gridSigned != null ? Math.max(0, d.gridSigned) : 0;
    const segs = [];
    if (d.gridSigned != null && gridImp > 0) {
      segs.push({ w: gridImp, c: COLOR_GRID_SOURCE, t: `${this.i18n.segImport} +${fmtPowerCompact(gridImp)}` });
    }
    if (d.battDis != null && d.battDis > 0) {
      segs.push({ w: d.battDis, c: COLOR_BATTERY, t: `${this.i18n.segBattDis} +${fmtPowerCompact(d.battDis)}` });
    }
    if (d.solar != null && d.solar > 0) {
      segs.push({ w: d.solar, c: COLOR_SOLAR, t: `${this.i18n.segSolar} ${fmtPowerCompact(d.solar)}` });
    }
    const sumSeg = segs.reduce((a, s) => a + s.w, 0);

    const gridCell = d.gridSigned != null
      ? fmtPowerCompact(d.gridSigned)
      : d.exportW != null && d.exportW > 0
        ? fmtPowerCompact(-d.exportW)
        : "—";
    const solarCell = d.solar != null ? fmtPowerCompact(d.solar) : "—";
    const battNetW = d.battDis != null || d.battChg != null ? (d.battDis ?? 0) - (d.battChg ?? 0) : null;
    const battCell = battNetW != null ? fmtPowerCompact(battNetW) : "—";
    const loadStr = d.load != null ? fmtPowerCompact(d.load) : "—";

    return html`
      <div
        class="power-now-wrap"
        role="button"
        tabindex="0"
        aria-label=${this.i18n?.powerNowAria ?? this.i18n?.powerNow ?? "Power now"}
        @click=${this._emitToggle}
        @keydown=${this._onKeyDown}
      >
        <div class="cons-strip-cap">${this.i18n.powerNow}</div>
        <div class="pnl-wrap">
          <div class="pnl-bar" title=${d.tooltip}>
            ${sumSeg > 1
              ? segs.map((s) => html`
                  <span
                    class="pnl-seg"
                    style="width:${((s.w / sumSeg) * 100).toFixed(1)}%;background:${s.c}"
                    title=${s.t}
                  ></span>
                `)
              : html`<span
                  class="pnl-seg"
                  style="width:100%;background:color-mix(in srgb, var(--divider-color) 85%, transparent)"
                  title="—"
                ></span>`}
          </div>
          <div class="pnl-load-overlay">${loadStr} ${this.i18n.loadConsumed}</div>
        </div>
        <div class="icon-brk">
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${COLOR_GRID_SOURCE}">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
            </span>
            <span>${this.i18n.colGrid}</span>&nbsp;<b>${gridCell}</b>
          </span>
          <span class="icon-brk-item">
            <span class="icon-brk-swatch" style="background-color:${COLOR_SOLAR}">
              <ha-icon icon="mdi:weather-sunny"></ha-icon>
            </span>
            <span>${this.i18n.colSolar}</span>&nbsp;<b>${solarCell}</b>
          </span>
          <span class="icon-brk-item" title=${this.i18n.colBattTip || nothing}>
            <span class="icon-brk-swatch" style="background-color:${COLOR_BATTERY}">
              <ha-icon icon="mdi:battery"></ha-icon>
            </span>
            <span>${this.i18n.colBatt}</span>&nbsp;<b>${battCell}</b>
          </span>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("hub-power-now")) {
  customElements.define("hub-power-now", HubPowerNow);
}
