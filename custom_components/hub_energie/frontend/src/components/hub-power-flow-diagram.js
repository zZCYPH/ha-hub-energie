import { LitElement, css, html, nothing, svg } from "lit";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_GRID_TO_BATT,
  COLOR_SOLAR,
  COLOR_SOLAR_EXPORT,
} from "../constants/colors.js";
import { flowIconDefs, flowIconUseHref } from "./hub-flow-node-icons.js";

const NODE_COLORS = Object.freeze({
  grid: COLOR_GRID_SOURCE,
  solar: COLOR_SOLAR,
  home: "var(--primary-color, #03a9f4)",
  battery: COLOR_BATTERY,
  neutral: "var(--secondary-text-color, #9e9e9e)",
});

const NODE_MOUNT_ORDER = Object.freeze({
  solar: 0,
  grid: 1,
  battery: 2,
  home: 3,
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
    /** Dark card / theme: stronger diagram contrast */
    energyThemeDark: { type: Boolean },
    /** Optional glass blur + drop shadow (experimental; editor toggle). */
    glassPanel: { type: Boolean },
    /** 'node:grid' | 'edge:solar_to_home_power_w' | null */
    _focusKey: { state: true },
    _enterGen: { state: true },
    /** Bumps when any node value/detail string changes → remount value text → one-shot tick animation. */
    _valuePulse: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      min-height: 200px;
    }
    :host(.hub-flow-glass) {
      border-radius: 26px;
      overflow: hidden;
      background: color-mix(in srgb, var(--card-background-color, #1e1e1e) 58%, transparent);
      -webkit-backdrop-filter: blur(14px);
      backdrop-filter: blur(14px);
    }
    :host(.hub-flow-glass) svg {
      filter: drop-shadow(0 10px 26px rgba(0, 0, 0, 0.24));
    }
    :host(.hub-flow-energy--dark) {
      --hub-flow-label-stroke: 5px;
    }
    :host(:not(.hub-flow-energy--dark)) {
      --hub-flow-label-stroke: 4px;
    }
    svg {
      display: block;
      width: 100%;
      max-width: 100%;
      aspect-ratio: 1 / 1;
      height: auto;
      overflow: visible;
      font-family: var(
        --paper-font-body1_-_font-family,
        var(--mdc-typography-body1-font-family, "Roboto", "Segoe UI", system-ui, sans-serif)
      );
      -webkit-font-smoothing: antialiased;
    }
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
      stroke-width: var(--hub-flow-label-stroke, 4px);
      stroke-linejoin: round;
      transition: opacity 0.45s ease, fill 0.45s ease;
    }
    .edge-label.edge-label--primary {
      font-size: 10px;
    }
    .node-icon-use {
      color: var(--primary-text-color);
      opacity: 0.95;
      transition: opacity 0.45s ease, color 0.45s ease;
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
      transform-origin: center center;
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
    .node-focus-ring {
      fill: none;
      stroke: var(--primary-color, #03a9f4);
      stroke-opacity: 0.55;
      stroke-width: 2;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease, r 0.25s ease;
    }
    .node-focus-ring--on {
      opacity: 1;
    }
    .node-stagger {
      animation: hub-node-stagger 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
      animation-delay: var(--hub-stagger, 0ms);
    }
    @media (prefers-reduced-motion: no-preference) {
      .node-value--tick {
        animation: hub-value-tick 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }
    }
    @keyframes hub-value-tick {
      0% {
        transform: scale(1);
      }
      35% {
        transform: scale(1.07);
      }
      100% {
        transform: scale(1);
      }
    }
    @keyframes hub-node-stagger {
      from {
        opacity: 0;
        transform: translate(0, 10px);
      }
      to {
        opacity: 1;
        transform: translate(0, 0);
      }
    }
    .edge-stagger {
      animation: hub-edge-stagger 0.42s ease both;
      animation-delay: var(--hub-edge-stagger, 0ms);
    }
    @keyframes hub-edge-stagger {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flow-dim {
        transition: none;
      }
      .node-icon-use,
      .node-label,
      .node-value,
      .node-detail,
      .edge-label {
        transition: none;
      }
      .node-stagger,
      .edge-stagger {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
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
    this.energyThemeDark = false;
    this.glassPanel = false;
    this._focusKey = null;
    this._enterGen = 0;
    this._valuePulse = 0;
    this._lastValueSig = "";
    /** Unique SVG defs ids when several flow cards share a view. */
    this._gid = Math.random().toString(36).slice(2, 10);
    this._onDocPointerDown = this._onDocPointerDown.bind(this);
  }

  willUpdate(changed) {
    if (changed.has("data")) {
      const prev = changed.get("data");
      if (this.data && !prev) this._enterGen += 1;
      if (this.data?.nodes) {
        const parts = [];
        for (const k of ["grid", "solar", "home", "battery"]) {
          const n = this.data.nodes[k];
          if (!n) continue;
          parts.push(`${k}:${n.value ?? ""}|${n.detail ?? ""}`);
        }
        const sig = parts.join(";");
        if (sig !== this._lastValueSig) {
          this._lastValueSig = sig;
          if (prev != null) this._valuePulse += 1;
        }
      }
    }
    if (changed.has("energyThemeDark")) {
      this.classList.toggle("hub-flow-energy--dark", Boolean(this.energyThemeDark));
    }
    if (changed.has("glassPanel")) {
      this.classList.toggle("hub-flow-glass", Boolean(this.glassPanel));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this._onDocPointerDown, false);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this._onDocPointerDown, false);
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

  _nodeFocused(node) {
    return this._focusKey === `node:${node.kind}`;
  }

  _renderDefs() {
    const u = this._gid;
    return svg`
      <defs>
        ${flowIconDefs(u)}
        <linearGradient id="hub-${u}-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
        </linearGradient>
        <radialGradient id="hub-${u}-vignette" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.22"></stop>
        </radialGradient>
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
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="url(#hub-${u}-vignette)"
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
        ${model.edges.map((edge, ei) => this._renderEdge(edge, showEdgeLabels, model, ei))}
        ${nodes.map((node) => this._renderNode(node, showNodeDetails, model))}
      </svg>
    `;
  }

  _renderEdge(edge, showEdgeLabels, model, edgeIndex) {
    if (!edge.visible) return nothing;
    const color = edge.color;
    const w = Number(edge.width);
    const op = Number(edge.opacity);
    const dur = Number(edge.duration);
    const primary = Boolean(edge.primaryToHome);
    const width = Number.isFinite(w) ? w : 2.4;
    const widthBoost = primary ? 1.35 : 1;
    const effW = width * widthBoost;
    const opacity = Number.isFinite(op) ? op : 0.96;
    const opacityBoost = primary ? 1.06 : 1;
    const effOp = Math.min(1, opacity * opacityBoost);
    const duration = Number.isFinite(dur) && dur > 0 ? dur : 2.5;
    const ghost = Boolean(edge.ghost);
    const baseMul = ghost ? 0.14 : primary ? 0.34 : 0.26;
    const glowMul = ghost ? 0.06 : primary ? 0.14 : 0.11;
    const baseStyle = edgePathCommon(color, effW + 2, effOp * baseMul);
    const cableGlowStyle = edgePathCommon(color, effW + 5, effOp * glowMul);
    const period = ghost ? duration * 1.65 : duration;
    const boltBoost = this.energyThemeDark ? 1.08 : 1;
    const boltGlowW = Math.max(effW * 1.25 + 2.8, 4.5) * (primary ? 1.05 : 1) * boltBoost;
    const boltCoreW = Math.max(effW * 0.42 + 1.1, 1.65) * (primary ? 1.08 : 1);
    const boltGlowOp = ghost ? effOp * 0.22 : effOp * (primary ? 0.58 : 0.5);
    const boltCoreOp = ghost ? effOp * 0.4 : Math.min(1, effOp * (primary ? 1.08 : 1.02));
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
    const staggerMs = 40 + edgeIndex * 45;
    const edgeAnim = this._enterGen > 0 ? "edge-stagger" : "";
    return svg`
      <g
        class="flow-dim ${edgeAnim}"
        style=${`opacity:${dim};--hub-edge-stagger:${staggerMs}ms`}
      >
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
              class="edge-label ${primary ? "edge-label--primary" : ""}"
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
    const iconKey = node.iconKey ?? "solar";
    const hrefId = flowIconUseHref(gid, iconKey);
    const mountOrder = NODE_MOUNT_ORDER[node.kind] ?? 0;
    const staggerMs = 20 + mountOrder * 70;
    const focused = this._nodeFocused(node);
    const ringR = focused ? radius + 9 : radius + 8;
    const nodeAnim = this._enterGen > 0 ? "node-stagger" : "";
    const valueKey = `${node.kind}|${this._valuePulse}|${node.value ?? ""}`;
    return svg`
      <g
        class="flow-dim"
        style=${`opacity:${dim};${cursor}`}
        transform="translate(${node.x} ${node.y})"
        @pointerdown=${onNodeTap}
      >
        <g class=${nodeAnim} style=${`--hub-stagger:${staggerMs}ms`}>
          <circle
            class=${`node-focus-ring ${focused ? "node-focus-ring--on" : ""}`}
            r=${ringR}
          ></circle>
          <circle class=${haloClass} r=${radius + 14} style=${haloStyle}></circle>
          <circle class="node-ring ${node.status}" r=${radius + 5} style=${ringStyle}></circle>
          <circle class="node-core" r=${radius} style=${coreStyle}></circle>
          <circle cx="0" cy=${-radius * 0.35} r=${radius * 0.42} style=${glossStyle}></circle>
          <g class="node-icon-use ${labelClass}" style=${textFill}>
            <use
              href="#${hrefId}"
              width="26"
              height="26"
              x="-13"
              y="-13"
              transform="scale(${radius >= 26 ? 1.05 : 0.92})"
            ></use>
          </g>
          <text class="node-label ${labelClass}" x="0" y=${labelY} style=${textFill}>
            ${node.label}
          </text>
          ${node.value
            ? svg`<text
                class="node-value node-value--tick ${labelClass}"
                x="0"
                y=${valueY}
                style=${textFill}
                key=${valueKey}
              >
                ${node.value}
              </text>`
            : nothing}
          ${detail
            ? svg`<text class="node-detail ${labelClass}" x="0" y=${detailY} style=${detailFill}>
                ${detail}
              </text>`
            : nothing}
        </g>
      </g>
    `;
  }
}

if (!customElements.get("hub-power-flow-diagram")) {
  customElements.define("hub-power-flow-diagram", HubPowerFlowDiagram);
}
