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
    /** 'node:grid' | 'edge:solar_to_home_power_w' | null */
    _focusKey: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      /* Avoid a zero-height SVG when the parent flex/grid sizing is odd in HA. */
      min-height: 200px;
    }
    svg {
      display: block;
      width: 100%;
      max-width: 100%;
      /* 1:1 viewBox — height tracks width like a square tile. */
      aspect-ratio: 1 / 1;
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
      stroke: var(--divider-color, #3d3d3d);
      stroke-opacity: 0.55;
      stroke-width: 1;
    }
    .backdrop-grid {
      pointer-events: none;
      opacity: 0.14;
    }
    .edge-base,
    .edge-glow,
    .edge-bolt,
    .edge-bolt-glow {
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    /**
     * Moving blaster-style bolt along the path. pathLength=100 on the path makes
     * dash units consistent; offset -100 = one full lap regardless of geometry length.
     */
    @keyframes hub-edge-bolt {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: -100;
      }
    }
    .edge-bolt {
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      stroke-dasharray: 9 91;
      animation: hub-edge-bolt var(--hub-bolt-period, 2.4s) linear infinite;
    }
    .edge-bolt-glow {
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      stroke-dasharray: 22 78;
      animation: hub-edge-bolt var(--hub-bolt-period, 2.4s) linear infinite;
    }
    .edge-bolt.edge-bolt--ghost,
    .edge-bolt-glow.edge-bolt-glow--ghost {
      stroke-dasharray: 5 95;
      opacity: 0.35;
    }
    .edge-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-anchor: middle;
      fill: var(--primary-text-color);
      paint-order: stroke;
      stroke: var(--card-background-color, #121212);
      stroke-opacity: 0.92;
      stroke-width: 4px;
      stroke-linejoin: round;
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .node-icon {
      fill: var(--primary-text-color);
      font-size: 17px;
      font-weight: 600;
      text-anchor: middle;
      dominant-baseline: middle;
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .node-label,
    .node-value,
    .node-detail {
      text-anchor: middle;
      fill: var(--primary-text-color);
    }
    .node-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.92;
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .node-value {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.02em;
      font-variant-numeric: tabular-nums;
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .node-detail {
      font-size: 11px;
      fill: var(--secondary-text-color);
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .node-muted {
      fill: var(--disabled-text-color, #9e9e9e);
    }
    @keyframes node-pulse {
      0%,
      100% {
        opacity: 0.55;
      }
      50% {
        opacity: 0.95;
      }
    }
    .node-halo--live {
      animation: node-pulse 2.8s ease-in-out infinite;
    }
    .flow-dim {
      transition: opacity 0.38s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .flow-dim {
        transition: none;
      }
      .node-icon,
      .node-label,
      .node-value,
      .node-detail,
      .edge-label {
        transition: none;
      }
      .edge-bolt,
      .edge-bolt-glow {
        animation: none !important;
      }
      .edge-base,
      .edge-glow,
      .edge-bolt,
      .edge-bolt-glow {
        transition: none !important;
      }
      .node-halo--live {
        animation: none !important;
      }
    }
  `;

  constructor() {
    super();
    this.data = null;
    this.i18n = {};
    this.layout = "full";
    this.debug = false;
    this._focusKey = null;
    /** Unique SVG defs ids when several flow cards share a view. */
    this._gid = Math.random().toString(36).slice(2, 10);
    this._onDocPointerDown = this._onDocPointerDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    /* Bubble so taps on the diagram run before we clear focus. */
    document.addEventListener("pointerdown", this._onDocPointerDown, false);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this._onDocPointerDown, false);
  }

  _onDocPointerDown(event) {
    if (!this._focusKey) return;
    const path = event.composedPath?.() ?? [];
    if (path.includes(this)) return;
    this._focusKey = null;
    this.requestUpdate();
  }

  _toggleFocus(key) {
    this._focusKey = this._focusKey === key ? null : key;
    this.requestUpdate();
  }

  updated(changed) {
    super.updated(changed);
    if (!changed.has("data") || !this.data || !this._focusKey) return;
    if (this._focusKey.startsWith("edge:")) {
      const k = this._focusKey.slice(5);
      const e = this.data.edgeMap?.[k];
      if (!e || !e.visible) {
        this._focusKey = null;
        this.requestUpdate();
      }
    } else if (this._focusKey.startsWith("node:")) {
      const kind = this._focusKey.slice(5);
      if (!this.data.nodes?.[kind]) {
        this._focusKey = null;
        this.requestUpdate();
      }
    }
  }

  _edgeTouchesNode(edge, kind) {
    return edge.from === kind || edge.to === kind;
  }

  _nodeDim(model, node) {
    const fk = this._focusKey;
    if (!fk || !model) return 1;
    if (fk.startsWith("node:")) return fk === `node:${node.kind}` ? 1 : 0.34;
    const key = fk.slice(5);
    const edge = model.edgeMap?.[key];
    if (!edge) return 1;
    return this._edgeTouchesNode(edge, node.kind) ? 1 : 0.34;
  }

  _edgeDim(model, edge) {
    const fk = this._focusKey;
    if (!fk || !model) return 1;
    if (fk.startsWith("edge:")) return fk === `edge:${edge.key}` ? 1 : 0.22;
    const kind = fk.slice(5);
    return this._edgeTouchesNode(edge, kind) ? 1 : 0.22;
  }

  _renderDefs() {
    const u = this._gid;
    return svg`
      <defs>
        <linearGradient id="hub-${u}-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
        </linearGradient>
        <pattern
          id="hub-${u}-grid"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle class="backdrop-grid" cx="1.5" cy="1.5" r="0.9" fill="currentColor"></circle>
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
        viewBox="0 0 400 400"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${title}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${svg`
          <g style="color:var(--divider-color,#5c5c5c)">
            <rect
              class="backdrop"
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="var(--card-background-color,#1e1e1e)"
              fill-opacity="0.94"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="url(#hub-${u}-grid)"
              pointer-events="none"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="url(#hub-${u}-surface)"
              pointer-events="none"
            ></rect>
            <rect
              class="backdrop"
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="none"
            ></rect>
          </g>
        `}
        ${model.edges.map((edge) => this._renderEdge(edge, showEdgeLabels, model))}
        ${nodes.map((node) => this._renderNode(node, showNodeDetails, model))}
      </svg>
    `;
  }

  _renderEdge(edge, showEdgeLabels, model) {
    if (!edge.visible) return nothing;
    const color = edge.color;
    const w = Number(edge.width);
    const op = Number(edge.opacity);
    const dur = Number(edge.duration);
    const width = Number.isFinite(w) ? w : 2.4;
    const opacity = Number.isFinite(op) ? op : 0.96;
    const duration = Number.isFinite(dur) && dur > 0 ? dur : 2.5;
    const ghost = Boolean(edge.ghost);
    const baseMul = ghost ? 0.14 : 0.26;
    const glowMul = ghost ? 0.06 : 0.11;
    const baseStyle = edgePathCommon(color, width + 2, opacity * baseMul);
    const cableGlowStyle = edgePathCommon(color, width + 5, opacity * glowMul);
    const period = ghost ? duration * 1.65 : duration;
    const boltGlowW = Math.max(width * 1.25 + 2.8, 4.5);
    const boltCoreW = Math.max(width * 0.42 + 1.1, 1.65);
    const boltGlowOp = ghost ? opacity * 0.22 : opacity * 0.5;
    const boltCoreOp = ghost ? opacity * 0.4 : Math.min(1, opacity * 1.02);
    const boltGlowStyle = [
      edgePathCommon(color, boltGlowW, boltGlowOp),
      `--hub-bolt-period:${period}s`,
    ].join(";");
    const boltCoreStyle = [
      "fill:none",
      "stroke:#ffffff",
      `stroke-width:${boltCoreW}px`,
      `stroke-opacity:${boltCoreOp}`,
      `stroke-linecap:round`,
      `stroke-linejoin:round`,
      `--hub-bolt-period:${period}s`,
    ].join(";");
    const boltGlowClass = ghost ? "edge-bolt-glow edge-bolt-glow--ghost" : "edge-bolt-glow";
    const boltCoreClass = ghost ? "edge-bolt edge-bolt--ghost" : "edge-bolt";
    const dim = this._edgeDim(model, edge);
    const onEdgeTap = (event) => {
      event.stopPropagation();
      this._toggleFocus(`edge:${edge.key}`);
    };
    const hitStyle =
      "fill:none;stroke:transparent;stroke-width:18px;stroke-linecap:round;stroke-linejoin:round;pointer-events:stroke;cursor:pointer";
    return svg`
      <g class="flow-dim" style=${`opacity:${dim}`}>
        <path class="edge-base" d=${edge.path} style=${baseStyle} pointer-events="none"></path>
        <path class="edge-glow" d=${edge.path} style=${cableGlowStyle} pointer-events="none"></path>
        <path
          class=${boltGlowClass}
          d=${edge.path}
          pathLength="100"
          style=${boltGlowStyle}
          pointer-events="none"
        ></path>
        <path
          class=${boltCoreClass}
          d=${edge.path}
          pathLength="100"
          style=${boltCoreStyle}
          pointer-events="none"
        ></path>
        ${showEdgeLabels && edge.label
          ? svg`<text
              class="edge-label"
              x=${edge.labelX}
              y=${edge.labelY}
              style="fill:var(--primary-text-color,#e0e0e0);cursor:pointer"
              @pointerdown=${onEdgeTap}
            >
              ${edge.label}
            </text>`
          : nothing}
        <path d=${edge.path} style=${hitStyle} @pointerdown=${onEdgeTap}></path>
      </g>
    `;
  }

  /** Extra line spacing when labels + values + details are all shown (full layout / debug). */
  _nodeTextYs(radius, home, loose) {
    if (home) {
      return loose
        ? { labelY: radius + 22, valueY: radius + 44, detailY: radius + 64 }
        : { labelY: radius + 20, valueY: radius + 38, detailY: radius + 54 };
    }
    return loose
      ? { labelY: radius + 16, valueY: radius + 32, detailY: radius + 48 }
      : { labelY: radius + 14, valueY: radius + 24, detailY: radius + 40 };
  }

  _renderNode(node, showDetails, model) {
    const radius = nodeRadius(node.kind);
    const color = NODE_COLORS[node.kind] ?? NODE_COLORS.neutral;
    const labelClass = node.muted ? "node-muted" : "";
    const detail = showDetails && node.detail ? node.detail : null;
    const loose = showDetails && Boolean(node.value);
    const { labelY, valueY, detailY } = this._nodeTextYs(radius, node.kind === "home", loose);
    const dim = this._nodeDim(model, node);
    const onNodeTap = (event) => {
      event.stopPropagation();
      this._toggleFocus(`node:${node.kind}`);
    };
    const idle = node.status === "idle" || node.status === "unknown";
    const live = !idle && node.pulse;
    const haloClass = live ? "node-halo node-halo--live" : "node-halo";
    const haloStyle = idle
      ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1"
      : `fill:none;stroke:${color};stroke-opacity:0.35;stroke-width:1.5`;
    const gid = this._gid;
    const coreFill = idle
      ? `url(#hub-${gid}-core-idle)`
      : `url(#hub-${gid}-core-${node.kind})`;
    const ringStyle = idle
      ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75"
      : `fill:${color};fill-opacity:0.09;stroke:${color};stroke-opacity:0.75;stroke-width:1.75`;
    const coreStyle = `fill:${coreFill};stroke:#000000;stroke-opacity:0.22;stroke-width:1`;
    const glossStyle = idle
      ? "fill:#ffffff;fill-opacity:0.04"
      : `fill:${color};fill-opacity:0.14`;
    const textFill =
      labelClass === "node-muted"
        ? "fill:var(--disabled-text-color,#9e9e9e)"
        : "fill:var(--primary-text-color,#e0e0e0)";
    const detailFill = "fill:var(--secondary-text-color,#b0b0b0)";
    const cursor = "cursor:pointer";
    return svg`
      <g
        class="flow-dim"
        style=${`opacity:${dim};${cursor}`}
        transform="translate(${node.x} ${node.y})"
        @pointerdown=${onNodeTap}
      >
        <circle class=${haloClass} r=${radius + 14} style=${haloStyle}></circle>
        <circle class="node-ring ${node.status}" r=${radius + 5} style=${ringStyle}></circle>
        <circle class="node-core" r=${radius} style=${coreStyle}></circle>
        <circle cx="0" cy=${-radius * 0.35} r=${radius * 0.42} style=${glossStyle}></circle>
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
