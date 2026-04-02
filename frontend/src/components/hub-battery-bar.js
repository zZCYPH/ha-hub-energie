import { LitElement, html, css, nothing } from "lit";
import { formatEtaTimeOnly } from "../utils/format-utils.js";

class HubBatteryBar extends LitElement {
  static get properties() {
    return {
      i18n: { attribute: false },
      data: { attribute: false },
      numberLocale: { type: String, attribute: "number-locale" },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }
      .batt-bar-container {
        margin: 4px 0 6px;
        width: 100%;
      }
      .batt-section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .batt-section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .batt-track-wrap {
        position: relative;
        width: 100%;
        margin-bottom: 2px;
      }
      .batt-track {
        position: relative;
        width: 100%;
        height: 32px;
        border-radius: 8px;
        background: #0b0b0b;
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, #333) inset,
          0 0 0 1px color-mix(in srgb, var(--divider-color) 40%, transparent);
        overflow: hidden;
        box-sizing: border-box;
      }
      .batt-segments {
        position: absolute;
        inset: 0;
        z-index: 1;
        padding: 3px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: 3px;
        align-items: stretch;
      }
      .batt-cell {
        flex: 1;
        min-width: 2px;
        border-radius: 3px;
        background: transparent;
        border: 1px solid #333333;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
        position: relative;
        overflow: hidden;
      }
      .batt-cell-fill {
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--fill-x, 0) * 1%);
        width: calc(var(--fill-w, 0) * 1%);
        background: #2e7d32;
        box-shadow: 0 0 0 1px color-mix(in srgb, #1b5e20 65%, transparent) inset;
      }
      .batt-cell-hatch {
        position: absolute;
        top: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.03);
        background-image: repeating-linear-gradient(
          135deg,
          rgba(150, 150, 150, 0.42) 0px,
          rgba(150, 150, 150, 0.42) 3px,
          transparent 3px,
          transparent 6px
        );
      }
      .batt-cell-hatch--left {
        left: 0;
        width: calc(var(--hatch-l, 0) * 1%);
      }
      .batt-cell-hatch--right {
        right: 0;
        width: calc(var(--hatch-r, 0) * 1%);
      }
      .batt-segments.batt-green--charging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #66bb6a 0%,
          #2e7d32 45%,
          #1b5e20 100%
        );
        animation: batt-cell-pulse 2.2s ease-in-out infinite;
      }
      .batt-segments.batt-green--charging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.15s;
      }
      .batt-segments.batt-green--discharging .batt-cell-fill {
        background: linear-gradient(
          180deg,
          #9ccc65 0%,
          #558b2f 50%,
          #33691e 100%
        );
        animation: batt-cell-pulse 2.4s ease-in-out infinite reverse;
      }
      .batt-segments.batt-green--discharging .batt-cell:nth-child(odd) .batt-cell-fill {
        animation-delay: 0.12s;
      }
      @keyframes batt-cell-pulse {
        0%,
        100% {
          filter: brightness(1);
        }
        50% {
          filter: brightness(1.12);
        }
      }
      .batt-bar-total {
        position: absolute;
        left: 6px;
        right: 6px;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        pointer-events: none;
        z-index: 3;
      }
      .batt-bar-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        line-height: 1;
        flex: 0 0 auto;
      }
      .batt-bar-row-main {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        line-height: 1.05;
      }
      .batt-bar-total::before,
      .batt-bar-total::after {
        content: "";
        flex: 1 1 0;
        height: 1px;
        min-width: 4px;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(0, 0, 0, 0.6);
      }
      .batt-bar-total-text {
        font-size: 0.65rem;
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
      .batt-bar-eta-inline {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-top: 1px;
        font-size: 0.85rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        color: rgba(255, 255, 255, 0.92);
        text-align: center;
        white-space: nowrap;
        text-shadow:
          0 0 10px rgba(0, 0, 0, 1),
          0 1px 2px rgba(0, 0, 0, 0.95);
      }
      .batt-eta-icon {
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.95);
        --mdc-icon-size: 13px;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
      }
    `;
  }

  constructor() {
    super();
    this.i18n = {};
    this.data = null;
    this.numberLocale = "fr-FR";
  }

  _fmtKwh(v) {
    if (v == null || !Number.isFinite(Number(v))) return "—";
    return Number(v).toLocaleString(this.numberLocale ?? "fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /** @returns {{ icon: string; time: string } | null} */
  _resolveEta() {
    const d = this.data;
    if (!d || d.capacity == null || d.capacity <= 0) return null;
    if (d.chargeW != null && d.chargeW > 0) {
      const soc = d.soc ?? 0;
      const remainingKwh = d.capacity * (1 - soc / 100);
      const chargePowerKw = d.chargeW / 1000;
      if (chargePowerKw > 0) {
        return {
          icon: "mdi:battery-charging-high",
          time: formatEtaTimeOnly((remainingKwh / chargePowerKw) * 60),
        };
      }
    } else if (d.dischargeW != null && d.dischargeW > 0) {
      const storedKwh = (d.capacity * (d.soc ?? 0)) / 100;
      const dischargePowerKw = d.dischargeW / 1000;
      if (dischargePowerKw > 0) {
        return {
          icon: "mdi:battery-low",
          time: formatEtaTimeOnly((storedKwh / dischargePowerKw) * 60),
        };
      }
    }
    return null;
  }

  /** @returns {"charging" | "discharging" | "idle"} */
  _flowMode(d) {
    if (!d) return "idle";
    const threshold = 40;
    const charge = d.chargeW != null ? Number(d.chargeW) : 0;
    const discharge = d.dischargeW != null ? Number(d.dischargeW) : 0;
    if (charge > threshold) return "charging";
    if (discharge > threshold) return "discharging";
    return "idle";
  }

  render() {
    const d = this.data;
    if (!d || d.soc == null || d.capacity == null || d.capacity <= 0) return nothing;

    const socMin = Math.max(0, Math.min(100, Number(d.socMin ?? 0)));
    let socMax = Math.max(socMin, Math.min(100, Number(d.socMax ?? 100)));
    const socRaw = Math.max(0, Math.min(100, Number(d.soc)));
    const soc = Math.min(socMax, Math.max(socMin, socRaw));

    let greenEnd = soc;
    const cap = d.capacity;
    const avail = d.available;
    if (avail != null && Number.isFinite(avail) && cap > 0) {
      const fromAvail = socMin + (avail / cap) * 100;
      greenEnd = Math.min(Math.max(fromAvail, socMin), soc, socMax);
    }

    const availShow = avail != null && Number.isFinite(avail) ? avail : (cap * Math.max(0, soc - socMin)) / 100;
    const pctLabel = Math.round(socRaw).toLocaleString(this.numberLocale ?? "fr-FR");
    const overlayText = `${this._fmtKwh(availShow)} / ${this._fmtKwh(cap)} kWh (${pctLabel}\u00a0%)`;
    const flow = this._flowMode(d);
    const segmentFlowClass =
      flow === "charging"
        ? "batt-green--charging"
        : flow === "discharging"
          ? "batt-green--discharging"
          : "";
    const segmentCount = 18;
    const cellPct = 100 / segmentCount;
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const pctSpan = (a, b, start, end) => Math.max(0, Math.min(b, end) - Math.max(a, start));
    const cells = Array.from({ length: segmentCount }, (_v, i) => {
      const start = i * cellPct;
      const end = (i + 1) * cellPct;

      const hatchL = (pctSpan(start, end, start, socMin) / cellPct) * 100;
      const hatchR = (pctSpan(start, end, socMax, end) / cellPct) * 100;

      const fillStart = Math.max(start, socMin);
      const fillEnd = Math.min(end, greenEnd, socMax);
      const fillW = (pctSpan(start, end, fillStart, fillEnd) / cellPct) * 100;
      const fillX = clamp01((fillStart - start) / cellPct) * 100;

      const style = `--hatch-l:${hatchL.toFixed(3)};--hatch-r:${hatchR.toFixed(3)};--fill-x:${fillX.toFixed(
        3
      )};--fill-w:${fillW.toFixed(3)};`;

      return html`<div class="batt-cell" style="${style}">
        <div class="batt-cell-hatch batt-cell-hatch--left"></div>
        <div class="batt-cell-hatch batt-cell-hatch--right"></div>
        <div class="batt-cell-fill"></div>
      </div>`;
    });
    const eta = this._resolveEta();
    const flowIcon =
      flow === "charging"
        ? "mdi:battery-charging"
        : flow === "discharging"
          ? "mdi:battery-arrow-down"
          : null;

    return html`
      <div class="batt-bar-container">
        <div class="batt-section-head">
          <h3>${this.i18n.battSocTitle}</h3>
        </div>
        <div class="batt-track-wrap" title="${Math.round(socRaw)} % SOC">
          <div class="batt-track">
            <div class="batt-segments ${segmentFlowClass}">${cells}</div>
          </div>
          <div class="batt-bar-total">
            <div class="batt-bar-stack">
              <div class="batt-bar-row-main">
                <span class="batt-bar-total-text">${overlayText}</span>
              </div>
              ${eta
                ? html`<div class="batt-bar-eta-inline">
                    <ha-icon class="batt-eta-icon" icon=${eta.icon}></ha-icon>
                    <span>${eta.time}</span>
                  </div>`
                : nothing}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/** Distinct name so an older `hub-battery-bar` (or cached bundle) cannot win registration and keep a stale class. */
if (!customElements.get("hub-energie-battery-bar")) {
  customElements.define("hub-energie-battery-bar", HubBatteryBar);
}
