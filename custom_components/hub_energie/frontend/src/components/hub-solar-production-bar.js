import { LitElement, css, html, nothing } from "lit";

class HubSolarProductionBar extends LitElement {
  static get properties() {
    return {
      i18n: { attribute: false },
      /** kWh split: { segments: [{ label, value, color, icon? }], total, formatter, tooltip } */
      kwhData: { attribute: false },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        min-width: 0;
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
        min-width: 2px;
        transition: width 0.2s ease;
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
      .icon-brk-pct {
        opacity: 0.6;
        margin-left: 1px;
      }
    `;
  }

  constructor() {
    super();
    this.i18n = {};
    this.kwhData = null;
  }

  render() {
    const k = this.kwhData;
    if (k?.segments?.length && k.total > 0.0005) {
      const fmt = k.formatter ?? ((v) => String(v));
      const segs = k.segments.filter((s) => Number(s.value) > 0.0005);
      if (!segs.length) return nothing;
      return html`
        <div class="cons-strip">
          <div class="cons-strip-cap">${this.i18n.solarProdTitle}</div>
          <div class="bar-wrap" title=${k.tooltip ?? nothing}>
            <div class="track">
              <div class="fill-stack" style="width:100%">
                ${segs.map(
                  (s) => html`
                    <span
                      class="fill-seg"
                      style="width:${((Number(s.value) / k.total) * 100).toFixed(1)}%;background-color:${s.color}"
                      title=${`${s.label}: ${fmt(s.value)}`}
                    ></span>
                  `,
                )}
              </div>
            </div>
            <div class="bar-total">
              <span class="bar-total-text">${fmt(k.total)}</span>
            </div>
          </div>
          <div class="icon-brk">
            ${segs.map(
              (s) => html`
                <span class="icon-brk-item">
                  <span class="icon-brk-swatch" style="background-color:${s.color}">
                    ${s.icon ? html`<ha-icon icon=${s.icon}></ha-icon>` : nothing}
                  </span>
                  <span>${s.label}</span>&nbsp;<b>${fmt(s.value)}</b>
                  ${k.total > 0
                    ? html`<span class="icon-brk-pct"
                        >(${Math.round((Number(s.value) / k.total) * 100)}%)</span
                      >`
                    : nothing}
                </span>
              `,
            )}
          </div>
        </div>
      `;
    }

    return nothing;
  }
}

if (!customElements.get("hub-solar-production-bar")) {
  customElements.define("hub-solar-production-bar", HubSolarProductionBar);
}
