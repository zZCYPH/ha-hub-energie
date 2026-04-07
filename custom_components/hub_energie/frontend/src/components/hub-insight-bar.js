import { LitElement, html, css, nothing } from "lit";

class HubInsightBar extends LitElement {
  static get properties() {
    return {
      i18n: { attribute: false },
      totalMaison: { type: Number },
      originGrid: { type: Number },
      totalEur: { type: Number },
      ecoTotal: { type: Number },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .insight-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 6px;
        justify-content: center;
        margin-bottom: 5px;
      }
      .insight-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        white-space: nowrap;
        letter-spacing: 0.01em;
      }
      .insight-chip.eco {
        color: #43a047;
      }
      .insight-chip.warn {
        color: #f9a825;
      }
      .insight-chip.neg {
        color: #e53935;
      }
    `;
  }

  constructor() {
    super();
    this.i18n = {};
    this.totalMaison = 0;
    this.originGrid = 0;
    this.totalEur = 0;
    this.ecoTotal = 0;
  }

  render() {
    if (!(this.totalMaison > 0)) return nothing;
    const autoSuff = Math.max(
      0,
      Math.min(100, Math.round((1 - Math.min(this.originGrid, this.totalMaison) / this.totalMaison) * 100)),
    );
    const autoClass = autoSuff >= 60 ? "eco" : autoSuff >= 30 ? "" : "warn";
    const vsGridSign = this.ecoTotal >= 0 ? "−" : "+";
    const vsGridClass = this.ecoTotal >= 0 ? "eco" : "neg";

    return html`
      <div class="insight-bar">
        <span class="insight-chip ${autoClass}">☀️ ${autoSuff}% ${this.i18n.insightAutosuff}</span>
        <span class="insight-chip">💸 ${this.totalEur.toFixed(2)} €</span>
        <span class="insight-chip ${vsGridClass}">
          ⚡ ${vsGridSign}${Math.abs(this.ecoTotal).toFixed(2)}€ ${this.i18n.insightVsGrid}
        </span>
      </div>
    `;
  }
}

if (!customElements.get("hub-insight-bar")) {
  customElements.define("hub-insight-bar", HubInsightBar);
}
