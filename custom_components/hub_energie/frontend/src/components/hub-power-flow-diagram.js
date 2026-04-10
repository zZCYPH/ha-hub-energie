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
    /** Unique SVG defs ids when several flow cards share a view. */
    this._gid = Math.random().toString(36).slice(2, 10);
  }

  _renderDefs() {
    const u = this._gid;
    return svg`
      <defs>
        <linearGradient id="hub-${u}-panel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#353535" stop-opacity="0.88"></stop>
          <stop offset="55%" stop-color="#1c1c1c" stop-opacity="0.94"></stop>
          <stop offset="100%" stop-color="#0f0f0f" stop-opacity="1"></stop>
        </linearGradient>
        <pattern id="hub-${u}-grain" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="7" r="0.55" fill="#ffffff" opacity="0.04"></circle>
          <circle cx="15" cy="4" r="0.45" fill="#ffffff" opacity="0.03"></circle>
          <circle cx="11" cy="16" r="0.4" fill="#ffffff" opacity="0.025"></circle>
        </pattern>
        <radialGradient id="hub-${u}-core-grid" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#e1bee7" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#7e57c2" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#4527a0" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${u}-core-solar" cx="30%" cy="26%" r="75%">
          <stop offset="0%" stop-color="#fffde7" stop-opacity="0.75"></stop>
          <stop offset="45%" stop-color="#fdd835" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#f57f17" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${u}-core-home" cx="32%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#b2ebf2" stop-opacity="0.7"></stop>
          <stop offset="50%" stop-color="#00acc1" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#006064" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${u}-core-battery" cx="30%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#c8e6c9" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#66bb6a" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#2e7d32" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${u}-core-idle" cx="35%" cy="35%" r="68%">
          <stop offset="0%" stop-color="#9e9e9e" stop-opacity="0.35"></stop>
          <stop offset="100%" stop-color="#424242" stop-opacity="0.92"></stop>
        </radialGradient>
      </defs>
    `;
  }

  render() {
    const model = this.data;
    if (!model) return nothing;
    const nodes = Object.values(model.nodes).filter(Boolean);
    const showEdgeLabels = this.debug || this.layout !== "compact";
    const showNodeDetails = this.debug || this.layout !== "compact";
    const title = this.i18n.flowCardTitle ?? "Live power flows";
    const u = this._gid;
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
        ${this._renderDefs()}
        ${svg`
          <rect
            x="10"
            y="12"
            width="380"
            height="216"
            rx="22"
            fill="url(#hub-${u}-panel)"
            stroke="#666666"
            stroke-opacity="0.45"
            stroke-width="1"
          ></rect>
          <rect x="10" y="12" width="380" height="216" rx="22" fill="url(#hub-${u}-grain)"></rect>
          <rect
            x="11.5"
            y="13.5"
            width="377"
            height="213"
            rx="20.5"
            fill="none"
            stroke="#ffffff"
            stroke-opacity="0.06"
            stroke-width="1"
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
    const gid = this._gid;
    const coreFill = idle
      ? `url(#hub-${gid}-core-idle)`
      : `url(#hub-${gid}-core-${node.kind})`;
    const ringStyle = idle
      ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75"
      : `fill:${color};fill-opacity:0.09;stroke:${color};stroke-opacity:0.75;stroke-width:1.75`;
    const coreStyle = `fill:${coreFill};stroke:#000000;stroke-opacity:0.22;stroke-width:1`;
    const textFill =
      labelClass === "node-muted"
        ? "fill:var(--disabled-text-color,#9e9e9e)"
        : "fill:var(--primary-text-color,#e0e0e0)";
    const detailFill = "fill:var(--secondary-text-color,#b0b0b0)";
    const home = node.kind === "home";
    const labelY = radius + (home ? 20 : 14);
    const valueY = radius + (home ? 38 : 24);
    const detailY = radius + (home ? 54 : 40);
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
