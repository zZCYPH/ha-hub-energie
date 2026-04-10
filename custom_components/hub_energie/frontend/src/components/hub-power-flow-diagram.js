import { LitElement, css, html, nothing, svg } from "lit";
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

/** Inline paint on each SVG shape: some HA WebViews do not apply inherited custom props from `<g>` to child `<path>`/`<circle>`. */
function edgePathCommon(color, strokeWidthPx, opacity) {
  const w = Number(strokeWidthPx);
  const o = Number(opacity);
  const sw = Number.isFinite(w) ? w : 2;
  const op = Number.isFinite(o) ? o : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${color};stroke-width:${sw}px;opacity:${op}`;
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
      /* Avoid a zero-height SVG when the parent flex/grid sizing is odd in HA. */
      min-height: 140px;
    }
    svg {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      overflow: visible;
      font-family: var(
        --paper-font-body1_-_font-family,
        var(--mdc-typography-body1-font-family, "Roboto", "Segoe UI", system-ui, sans-serif)
      );
      -webkit-font-smoothing: antialiased;
    }
    /* No color-mix / SVG filters here: some HA WebViews drop the whole diagram if a paint is invalid. */
    .backdrop {
      fill: var(--card-background-color, #1e1e1e);
      fill-opacity: 0.92;
      stroke: var(--divider-color, #3d3d3d);
      stroke-opacity: 0.65;
      stroke-width: 1;
    }
    .edge-base,
    .edge-glow,
    .edge-flow {
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .edge-flow {
      stroke-dasharray: 7 6;
    }
    .edge-label {
      font-size: 10px;
      font-weight: 600;
      text-anchor: middle;
      fill: var(--primary-text-color);
      paint-order: stroke;
      stroke: var(--card-background-color, #121212);
      stroke-opacity: 0.88;
      stroke-width: 3px;
      stroke-linejoin: round;
    }
    .node-icon {
      fill: var(--primary-text-color);
      font-size: 17px;
      font-weight: 600;
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
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .node-value {
      font-size: 12px;
      font-weight: 700;
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
        stroke-dashoffset: -26;
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
    const backdropStyle =
      "fill:var(--card-background-color,#1e1e1e);fill-opacity:0.92;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.65;stroke-width:1";
    const title = this.i18n.flowCardTitle ?? "Live power flows";
    /* Inside <svg>, nested `html` fragments use the HTML namespace; use `svg` for real SVG nodes (Lit docs). */
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${title}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${svg`
          <rect
            class="backdrop"
            style=${backdropStyle}
            x="6"
            y="6"
            width="388"
            height="228"
            rx="26"
          ></rect>
        `}
        ${model.edges.map((edge) => this._renderEdge(edge, showEdgeLabels))}
        ${nodes.map((node) => this._renderNode(node, showNodeDetails))}
      </svg>
    `;
  }

  _renderEdge(edge, showEdgeLabels) {
    if (!edge.visible) return nothing;
    const color = edge.color;
    const w = Number(edge.width);
    const op = Number(edge.opacity);
    const dur = Number(edge.duration);
    const width = Number.isFinite(w) ? w : 2.4;
    const opacity = Number.isFinite(op) ? op : 0.96;
    const duration = Number.isFinite(dur) && dur > 0 ? dur : 2.5;
    const baseStyle = edgePathCommon(color, width + 2, opacity * 0.26);
    const glowStyle = edgePathCommon(color, width + 5, opacity * 0.11);
    const flowStyle = `${edgePathCommon(color, width, opacity)};stroke-dasharray:7 6;animation:flow-dash ${duration}s linear infinite`;
    return svg`
      <g>
        <path class="edge-base" d=${edge.path} style=${baseStyle}></path>
        <path class="edge-glow" d=${edge.path} style=${glowStyle}></path>
        <path class="edge-flow" d=${edge.path} style=${flowStyle}></path>
        ${showEdgeLabels && edge.label
          ? svg`<text
              class="edge-label"
              x=${edge.labelX}
              y=${edge.labelY}
              style="fill:var(--primary-text-color,#e0e0e0)"
            >
              ${edge.label}
            </text>`
          : nothing}
      </g>
    `;
  }

  _renderNode(node, showDetails) {
    const radius = nodeRadius(node.kind);
    const color = NODE_COLORS[node.kind] ?? NODE_COLORS.neutral;
    const labelClass = node.muted ? "node-muted" : "";
    const detail = showDetails && node.detail ? node.detail : null;
    const idle = node.status === "idle" || node.status === "unknown";
    const ringStyle = idle
      ? "fill:var(--disabled-text-color,#9e9e9e);fill-opacity:0.12;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.65;stroke-width:2"
      : `fill:${color};fill-opacity:0.12;stroke:${color};stroke-opacity:0.82;stroke-width:2`;
    const coreStyle = idle
      ? "fill:var(--disabled-text-color,#9e9e9e);fill-opacity:0.14;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.45;stroke-width:1"
      : `fill:${color};fill-opacity:0.2;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.42;stroke-width:1`;
    const textFill =
      labelClass === "node-muted"
        ? "fill:var(--disabled-text-color,#9e9e9e)"
        : "fill:var(--primary-text-color,#e0e0e0)";
    const detailFill = "fill:var(--secondary-text-color,#b0b0b0)";
    const home = node.kind === "home";
    const labelY = radius + (home ? 20 : 16);
    const valueY = radius + (home ? 38 : 30);
    const detailY = radius + (home ? 54 : 44);
    return svg`
      <g transform="translate(${node.x} ${node.y})">
        <circle class="node-ring ${node.status}" r=${radius + 6} style=${ringStyle}></circle>
        <circle class="node-core" r=${radius} style=${coreStyle}></circle>
        <text class="node-icon ${labelClass}" x="0" y="1" style=${textFill}>${node.icon}</text>
        <text class="node-label ${labelClass}" x="0" y=${labelY} style=${textFill}>${node.label}</text>
        ${node.value
          ? svg`<text class="node-value ${labelClass}" x="0" y=${valueY} style=${textFill}>${node.value}</text>`
          : nothing}
        ${detail
          ? svg`<text class="node-detail ${labelClass}" x="0" y=${detailY} style=${detailFill}>${detail}</text>`
          : nothing}
      </g>
    `;
  }
}

if (!customElements.get("hub-power-flow-diagram")) {
  customElements.define("hub-power-flow-diagram", HubPowerFlowDiagram);
}
