import { LitElement, css, html, nothing } from "lit";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_GRID_TO_BATT,
  COLOR_SOLAR,
  COLOR_SOLAR_EXPORT,
} from "../constants/colors.js";

const NODE_COLORS = Object.freeze({
  grid: COLOR_GRID_SOURCE,
  solar: COLOR_SOLAR,
  home: "var(--primary-color, #03a9f4)",
  battery: COLOR_BATTERY,
  neutral: "var(--secondary-text-color, #9e9e9e)",
});

function nodeRadius(kind) {
  return kind === "home" ? 28 : 22;
}

export class HubPowerFlowDiagram extends LitElement {
  static properties = {
    data: { attribute: false },
    i18n: { attribute: false },
    layout: { type: String },
    debug: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .backdrop {
      fill: color-mix(in srgb, var(--card-background-color) 82%, transparent);
      stroke: color-mix(in srgb, var(--divider-color) 65%, transparent);
      stroke-width: 1;
    }
    .edge-base,
    .edge-glow,
    .edge-flow {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .edge-base {
      stroke: color-mix(in srgb, var(--flow-color) 32%, var(--divider-color));
      stroke-width: calc(var(--flow-width) + 3px);
      opacity: calc(var(--flow-opacity) * 0.25);
    }
    .edge-glow {
      stroke: var(--flow-color);
      stroke-width: calc(var(--flow-width) + 10px);
      opacity: calc(var(--flow-opacity) * 0.12);
      filter: blur(6px);
    }
    .edge-flow {
      stroke: var(--flow-color);
      stroke-width: var(--flow-width);
      opacity: var(--flow-opacity);
      stroke-dasharray: 14 10;
      animation: flow-dash var(--flow-duration) linear infinite;
      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--flow-color) 30%, transparent));
    }
    .edge-label {
      font-size: 11px;
      font-weight: 700;
      text-anchor: middle;
      fill: var(--primary-text-color);
      paint-order: stroke;
      stroke: color-mix(in srgb, var(--card-background-color) 86%, transparent);
      stroke-width: 4px;
      stroke-linejoin: round;
    }
    .node-ring {
      fill: color-mix(in srgb, var(--node-color) 16%, transparent);
      stroke: color-mix(in srgb, var(--node-color) 90%, white 10%);
      stroke-width: 2.4;
    }
    .node-ring.idle,
    .node-ring.unknown {
      fill: color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 16%, transparent);
      stroke: color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 72%, white 12%);
    }
    .node-core {
      fill: color-mix(in srgb, var(--node-color) 20%, var(--card-background-color));
      stroke: color-mix(in srgb, var(--divider-color) 40%, transparent);
      stroke-width: 1;
    }
    .node-icon {
      fill: var(--primary-text-color);
      font-size: 14px;
      font-weight: 800;
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .node-label,
    .node-value,
    .node-detail {
      text-anchor: middle;
      fill: var(--primary-text-color);
    }
    .node-label {
      font-size: 12px;
      font-weight: 700;
    }
    .node-value {
      font-size: 13px;
      font-weight: 800;
    }
    .node-detail {
      font-size: 11px;
      fill: var(--secondary-text-color);
    }
    .node-muted {
      fill: var(--disabled-text-color, #9e9e9e);
    }
    @keyframes flow-dash {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: -48;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .edge-flow {
        animation: none !important;
      }
      .edge-base,
      .edge-glow,
      .edge-flow {
        transition: none !important;
      }
    }
  `;

  constructor() {
    super();
    this.data = null;
    this.i18n = {};
    this.layout = "full";
    this.debug = false;
  }

  render() {
    const model = this.data;
    if (!model) return nothing;
    const nodes = Object.values(model.nodes).filter(Boolean);
    const showEdgeLabels = this.debug || this.layout !== "compact";
    const showNodeDetails = this.debug || this.layout !== "compact";
    return html`
      <svg viewBox="0 0 400 240" aria-label=${this.i18n.flowCardTitle ?? "Live power flows"}>
        <rect class="backdrop" x="6" y="6" width="388" height="228" rx="26"></rect>
        ${model.edges.map((edge) => this._renderEdge(edge, showEdgeLabels))}
        ${nodes.map((node) => this._renderNode(node, showNodeDetails))}
      </svg>
    `;
  }

  _renderEdge(edge, showEdgeLabels) {
    if (!edge.visible) return nothing;
    const style = [
      `--flow-color:${edge.color}`,
      `--flow-width:${edge.width}px`,
      `--flow-opacity:${edge.opacity}`,
      `--flow-duration:${edge.duration}s`,
    ].join(";");
    return html`
      <g style=${style}>
        <path class="edge-base" d=${edge.path}></path>
        <path class="edge-glow" d=${edge.path}></path>
        <path class="edge-flow" d=${edge.path}></path>
        ${showEdgeLabels && edge.label
          ? html`<text class="edge-label" x=${edge.labelX} y=${edge.labelY}>${edge.label}</text>`
          : nothing}
      </g>
    `;
  }

  _renderNode(node, showDetails) {
    const radius = nodeRadius(node.kind);
    const color = NODE_COLORS[node.kind] ?? NODE_COLORS.neutral;
    const labelClass = node.muted ? "node-muted" : "";
    const detail = showDetails && node.detail ? node.detail : null;
    return html`
      <g transform="translate(${node.x} ${node.y})" style=${`--node-color:${color}`}>
        <circle class="node-ring ${node.status}" r=${radius + 6}></circle>
        <circle class="node-core" r=${radius}></circle>
        <text class="node-icon ${labelClass}" x="0" y="1">${node.icon}</text>
        <text class="node-label ${labelClass}" x="0" y=${radius + 20}>${node.label}</text>
        ${node.value
          ? html`<text class="node-value ${labelClass}" x="0" y=${radius + 38}>${node.value}</text>`
          : nothing}
        ${detail ? html`<text class="node-detail ${labelClass}" x="0" y=${radius + 54}>${detail}</text>` : nothing}
      </g>
    `;
  }
}

if (!customElements.get("hub-power-flow-diagram")) {
  customElements.define("hub-power-flow-diagram", HubPowerFlowDiagram);
}
