import { w as x, i as ee, a as te, A as v, b as E, f as ne, I as H } from "./energy-utils.js";
import { C as oe, a as I, c as re, b as le, e as ce } from "./colors.js";
function de(r) {
  const e = r;
  return x`
    <symbol id="hub-${e}-ic-sun" viewBox="-14 -14 28 28">
      <circle cx="0" cy="0" r="4.2" fill="currentColor" opacity="0.95"></circle>
      <g stroke="currentColor" stroke-width="1.85" stroke-linecap="round" fill="none" opacity="0.9">
        <line x1="0" y1="-9.5" x2="0" y2="-6.4"></line>
        <line x1="0" y1="6.4" x2="0" y2="9.5"></line>
        <line x1="-9.5" y1="0" x2="-6.4" y2="0"></line>
        <line x1="6.4" y1="0" x2="9.5" y2="0"></line>
        <line x1="-6.8" y1="-6.8" x2="-4.8" y2="-4.8"></line>
        <line x1="4.8" y1="4.8" x2="6.8" y2="6.8"></line>
        <line x1="6.8" y1="-6.8" x2="4.8" y2="-4.8"></line>
        <line x1="-4.8" y1="4.8" x2="-6.8" y2="6.8"></line>
      </g>
    </symbol>
    <symbol id="hub-${e}-ic-grid" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M-1.2-9.2 L4.2-2.4 L2.1-0.8 L6.8 6.2 L4.5 7.8 L-0.2 0.6 L-3.8 3.4 L-6.6-1.2 L-2.8-4.2 L-5.6-8.4 Z"
        opacity="0.95"
      ></path>
    </symbol>
    <symbol id="hub-${e}-ic-home" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M0-8.2 L9.2 1.2 L7.2 1.2 L7.2 8.2 L2.2 8.2 L2.2 4.2 L-2.2 4.2 L-2.2 8.2 L-7.2 8.2 L-7.2 1.2 L-9.2 1.2 Z"
        opacity="0.92"
      ></path>
    </symbol>
    <symbol id="hub-${e}-ic-batt" viewBox="-14 -14 28 28">
      <rect
        x="-7"
        y="-5.5"
        width="14"
        height="11"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        opacity="0.9"
      ></rect>
      <rect x="-2.5" y="-7.2" width="5" height="2.2" rx="0.6" fill="currentColor" opacity="0.85"></rect>
      <text x="0" y="4.5" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" opacity="0.95">
        B
      </text>
    </symbol>
    <symbol id="hub-${e}-ic-q" viewBox="-14 -14 28 28">
      <text x="0" y="5" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor">?</text>
    </symbol>
  `;
}
function ue(r, e) {
  return e === "battery_unknown" ? `hub-${r}-ic-q` : e === "battery" ? `hub-${r}-ic-batt` : e === "grid" ? `hub-${r}-ic-grid` : e === "home" ? `hub-${r}-ic-home` : `hub-${r}-ic-sun`;
}
const X = Object.freeze({
  grid: re,
  solar: I,
  home: "var(--primary-color, #03a9f4)",
  battery: oe,
  neutral: "var(--secondary-text-color, #9e9e9e)"
}), pe = Object.freeze({
  solar: 0,
  grid: 1,
  battery: 2,
  home: 3
});
function he(r) {
  return r === "home" ? 28 : 22;
}
function K(r, e, t) {
  const o = Number(e), a = Number(t), s = Number.isFinite(o) ? o : 2, i = Number.isFinite(a) ? a : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${r};stroke-width:${s}px;opacity:${i}`;
}
class fe extends ee {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean },
    /** Dark card / theme: stronger diagram contrast */
    energyThemeDark: { type: Boolean },
    /** Optional glass blur + drop shadow (experimental; editor toggle). */
    glassPanel: { type: Boolean },
    /** 'node:grid' | 'edge:solar_to_home_power_w' | null */
    _focusKey: { state: !0 },
    _enterGen: { state: !0 },
    /** Bumps when any node value/detail string changes → remount value text → one-shot tick animation. */
    _valuePulse: { state: !0 }
  };
  static styles = te`
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this.energyThemeDark = !1, this.glassPanel = !1, this._focusKey = null, this._enterGen = 0, this._valuePulse = 0, this._lastValueSig = "", this._gid = Math.random().toString(36).slice(2, 10), this._onDocPointerDown = this._onDocPointerDown.bind(this);
  }
  willUpdate(e) {
    if (e.has("data")) {
      const t = e.get("data");
      if (this.data && !t && (this._enterGen += 1), this.data?.nodes) {
        const o = [];
        for (const s of ["grid", "solar", "home", "battery"]) {
          const i = this.data.nodes[s];
          i && o.push(`${s}:${i.value ?? ""}|${i.detail ?? ""}`);
        }
        const a = o.join(";");
        a !== this._lastValueSig && (this._lastValueSig = a, t != null && (this._valuePulse += 1));
      }
    }
    e.has("energyThemeDark") && this.classList.toggle("hub-flow-energy--dark", !!this.energyThemeDark), e.has("glassPanel") && this.classList.toggle("hub-flow-glass", !!this.glassPanel);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  updated(e) {
    if (super.updated(e), !(!e.has("data") || !this.data || !this._focusKey)) {
      if (this._focusKey.startsWith("edge:")) {
        const t = this._focusKey.slice(5), o = this.data.edgeMap?.[t];
        (!o || !o.visible) && (this._focusKey = null, this.requestUpdate());
      } else if (this._focusKey.startsWith("node:")) {
        const t = this._focusKey.slice(5);
        this.data.nodes?.[t] || (this._focusKey = null, this.requestUpdate());
      }
    }
  }
  _onDocPointerDown(e) {
    !this._focusKey || (e.composedPath?.() ?? []).includes(this) || (this._focusKey = null, this.requestUpdate());
  }
  _toggleFocus(e) {
    this._focusKey = this._focusKey === e ? null : e, this.requestUpdate();
  }
  _edgeTouchesNode(e, t) {
    return e.from === t || e.to === t;
  }
  _nodeDim(e, t) {
    const o = this._focusKey;
    if (!o || !e) return 1;
    if (o.startsWith("node:")) return o === `node:${t.kind}` ? 1 : 0.34;
    const a = o.slice(5), s = e.edgeMap?.[a];
    return s ? this._edgeTouchesNode(s, t.kind) ? 1 : 0.34 : 1;
  }
  _edgeDim(e, t) {
    const o = this._focusKey;
    if (!o || !e) return 1;
    if (o.startsWith("edge:")) return o === `edge:${t.key}` ? 1 : 0.22;
    const a = o.slice(5);
    return this._edgeTouchesNode(t, a) ? 1 : 0.22;
  }
  _nodeFocused(e) {
    return this._focusKey === `node:${e.kind}`;
  }
  _renderDefs() {
    const e = this._gid;
    return x`
      <defs>
        ${de(e)}
        <linearGradient id="hub-${e}-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
        </linearGradient>
        <radialGradient id="hub-${e}-vignette" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.22"></stop>
        </radialGradient>
        <pattern
          id="hub-${e}-grid"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle class="backdrop-grid" cx="1.5" cy="1.5" r="0.9" fill="currentColor"></circle>
        </pattern>
        <radialGradient id="hub-${e}-core-grid" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#e1bee7" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#7e57c2" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#4527a0" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${e}-core-solar" cx="30%" cy="26%" r="75%">
          <stop offset="0%" stop-color="#fffde7" stop-opacity="0.75"></stop>
          <stop offset="45%" stop-color="#fdd835" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#f57f17" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${e}-core-home" cx="32%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#b2ebf2" stop-opacity="0.7"></stop>
          <stop offset="50%" stop-color="#00acc1" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#006064" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${e}-core-battery" cx="30%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#c8e6c9" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#66bb6a" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#2e7d32" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${e}-core-idle" cx="35%" cy="35%" r="68%">
          <stop offset="0%" stop-color="#9e9e9e" stop-opacity="0.35"></stop>
          <stop offset="100%" stop-color="#424242" stop-opacity="0.92"></stop>
        </radialGradient>
      </defs>
    `;
  }
  render() {
    const e = this.data;
    if (!e) return v;
    const t = Object.values(e.nodes).filter(Boolean), o = this.debug || this.layout !== "compact", a = this.debug || this.layout !== "compact", s = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return E`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${s}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${x`
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
              fill="url(#hub-${i}-grid)"
              pointer-events="none"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="url(#hub-${i}-surface)"
              pointer-events="none"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="388"
              rx="26"
              fill="url(#hub-${i}-vignette)"
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
        ${e.edges.map((c, d) => this._renderEdge(c, o, e, d))}
        ${t.map((c) => this._renderNode(c, a, e))}
      </svg>
    `;
  }
  _renderEdge(e, t, o, a) {
    if (!e.visible) return v;
    const s = e.color, i = Number(e.width), c = Number(e.opacity), d = Number(e.duration), n = !!e.primaryToHome, u = (Number.isFinite(i) ? i : 2.4) * (n ? 1.35 : 1), D = Number.isFinite(c) ? c : 0.96, b = Math.min(1, D * (n ? 1.06 : 1)), k = Number.isFinite(d) && d > 0 ? d : 2.5, f = !!e.ghost, $ = f ? 0.14 : n ? 0.34 : 0.26, F = f ? 0.06 : n ? 0.14 : 0.11, C = K(s, u + 2, b * $), M = K(s, u + 5, b * F), S = f ? k * 1.65 : k, y = this.energyThemeDark ? 1.08 : 1, z = Math.max(u * 1.25 + 2.8, 4.5) * (n ? 1.05 : 1) * y, l = Math.max(u * 0.42 + 1.1, 1.65) * (n ? 1.08 : 1), m = f ? b * 0.22 : b * (n ? 0.58 : 0.5), O = f ? b * 0.4 : Math.min(1, b * (n ? 1.08 : 1.02)), T = [
      K(s, z, m),
      `--hub-bolt-period:${S}s`
    ].join(";"), A = [
      "fill:none",
      "stroke:#ffffff",
      `stroke-width:${l}px`,
      `stroke-opacity:${O}`,
      "stroke-linecap:round",
      "stroke-linejoin:round",
      `--hub-bolt-period:${S}s`
    ].join(";"), L = f ? "edge-bolt-glow edge-bolt-glow--ghost" : "edge-bolt-glow", N = f ? "edge-bolt edge-bolt--ghost" : "edge-bolt", R = this._edgeDim(o, e), Y = (ie) => {
      ie.stopPropagation(), this._toggleFocus(`edge:${e.key}`);
    }, W = "fill:none;stroke:transparent;stroke-width:18px;stroke-linecap:round;stroke-linejoin:round;pointer-events:stroke;cursor:pointer", se = 40 + a * 45, ae = this._enterGen > 0 ? "edge-stagger" : "";
    return x`
      <g
        class="flow-dim ${ae}"
        style=${`opacity:${R};--hub-edge-stagger:${se}ms`}
      >
        <path class="edge-base" d=${e.path} style=${C} pointer-events="none"></path>
        <path class="edge-glow" d=${e.path} style=${M} pointer-events="none"></path>
        <path
          class=${L}
          d=${e.path}
          pathLength="100"
          style=${T}
          pointer-events="none"
        ></path>
        <path
          class=${N}
          d=${e.path}
          pathLength="100"
          style=${A}
          pointer-events="none"
        ></path>
        ${t && e.label ? x`<text
              class="edge-label ${n ? "edge-label--primary" : ""}"
              x=${e.labelX}
              y=${e.labelY}
              style="fill:var(--primary-text-color,#e0e0e0);cursor:pointer"
              @pointerdown=${Y}
            >
              ${e.label}
            </text>` : v}
        <path d=${e.path} style=${W} @pointerdown=${Y}></path>
      </g>
    `;
  }
  _nodeTextYs(e, t, o) {
    return t ? o ? { labelY: e + 22, valueY: e + 44, detailY: e + 64 } : { labelY: e + 20, valueY: e + 38, detailY: e + 54 } : o ? { labelY: e + 16, valueY: e + 32, detailY: e + 48 } : { labelY: e + 14, valueY: e + 24, detailY: e + 40 };
  }
  _renderNode(e, t, o) {
    const a = he(e.kind), s = X[e.kind] ?? X.neutral, i = e.muted ? "node-muted" : "", c = t && e.detail ? e.detail : null, d = t && !!e.value, { labelY: n, valueY: p, detailY: h } = this._nodeTextYs(a, e.kind === "home", d), u = this._nodeDim(o, e), D = (W) => {
      W.stopPropagation(), this._toggleFocus(`node:${e.kind}`);
    }, g = e.status === "idle" || e.status === "unknown", k = !g && e.pulse ? "node-halo node-halo--live" : "node-halo", f = g ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${s};stroke-opacity:0.35;stroke-width:1.5`, $ = this._gid, F = g ? `url(#hub-${$}-core-idle)` : `url(#hub-${$}-core-${e.kind})`, C = g ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, M = `fill:${F};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, S = g ? "fill:#ffffff;fill-opacity:0.04" : `fill:${s};fill-opacity:0.14`, y = i === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", z = "fill:var(--secondary-text-color,#b0b0b0)", l = "cursor:pointer", m = e.iconKey ?? "solar", O = ue($, m), A = 20 + (pe[e.kind] ?? 0) * 70, L = this._nodeFocused(e), N = L ? a + 9 : a + 8, R = this._enterGen > 0 ? "node-stagger" : "", Y = `${e.kind}|${this._valuePulse}|${e.value ?? ""}`;
    return x`
      <g
        class="flow-dim"
        style=${`opacity:${u};${l}`}
        transform="translate(${e.x} ${e.y})"
        @pointerdown=${D}
      >
        <g class=${R} style=${`--hub-stagger:${A}ms`}>
          <circle
            class=${`node-focus-ring ${L ? "node-focus-ring--on" : ""}`}
            r=${N}
          ></circle>
          <circle class=${k} r=${a + 14} style=${f}></circle>
          <circle class="node-ring ${e.status}" r=${a + 5} style=${C}></circle>
          <circle class="node-core" r=${a} style=${M}></circle>
          <circle cx="0" cy=${-a * 0.35} r=${a * 0.42} style=${S}></circle>
          <g class="node-icon-use ${i}" style=${y}>
            <use
              href="#${O}"
              width="26"
              height="26"
              x="-13"
              y="-13"
              transform="scale(${a >= 26 ? 1.05 : 0.92})"
            ></use>
          </g>
          <text class="node-label ${i}" x="0" y=${n} style=${y}>
            ${e.label}
          </text>
          ${e.value ? x`<text
                class="node-value node-value--tick ${i}"
                x="0"
                y=${p}
                style=${y}
                key=${Y}
              >
                ${e.value}
              </text>` : v}
          ${c ? x`<text class="node-detail ${i}" x="0" y=${h} style=${z}>
                ${c}
              </text>` : v}
        </g>
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", fe);
function me(r) {
  const e = r?.site_index;
  if (e === "" || e === void 0 || e === null) return null;
  const t = Math.trunc(Number(e));
  return Number.isFinite(t) && t >= 0 ? t : null;
}
function ge(r) {
  if (typeof r != "string" || !r.startsWith("sensor.")) return null;
  const e = r.slice(7), t = "_cost_detail";
  if (!e.endsWith(t)) return null;
  const o = e.slice(0, -t.length);
  return o ? {
    data: `sensor.${o}_frontend_data`,
    meta: `sensor.${o}_frontend_meta`
  } : null;
}
function q(r, e) {
  if (!r || typeof r != "object") return null;
  const t = (n) => typeof n == "string" ? n.trim() : "", o = t(e?.frontend_data_entity), a = t(e?.frontend_meta_entity), s = (n, p) => {
    if (!n || !p) return null;
    const h = r[n], u = r[p];
    return h && u ? { data: n, meta: p } : null;
  };
  if (o && a) {
    const n = s(o, a);
    if (n) return n;
  }
  const i = me(e), c = ne(r, i), d = ge(c);
  if (d) {
    const n = s(d.data, d.meta);
    if (n) return n;
  }
  return s("sensor.frontend_data", "sensor.frontend_meta");
}
function V(r, e) {
  const t = String(r ?? "").toLowerCase();
  return t.includes("blue") || t.includes("bleu") ? e?.tempoDayBlue ?? "Blue" : t.includes("white") || t.includes("blanc") ? e?.tempoDayWhite ?? "White" : t.includes("red") || t.includes("rouge") ? e?.tempoDayRed ?? "Red" : t === "n/a" ? e?.dayColorNA ?? "N/A" : t || (e?.emDash ?? "—");
}
function be(r, e, t) {
  const o = r?.[e]?.attributes?.[t];
  if (o == null || o === "") return null;
  const a = Number(o);
  return Number.isFinite(a) ? a : null;
}
function _(r) {
  const e = Number(r);
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e3 ? `${(e / 1e3).toFixed(t >= 1e4 ? 0 : 1)} kW` : `${Math.round(e)} W`;
}
function ye(r, e, t) {
  if (!r) return null;
  const o = Date.parse(r);
  if (!Number.isFinite(o)) return null;
  const a = Math.max(0, Math.floor((e - o) / 1e3));
  if (a < 60) return t.flowAgeSeconds.replace("{n}", String(a));
  const s = Math.floor(a / 60);
  if (s < 60) return t.flowAgeMinutes.replace("{n}", String(s));
  const i = Math.floor(s / 60);
  if (i < 48) return t.flowAgeHours.replace("{n}", String(i));
  const c = Math.floor(i / 24);
  return t.flowAgeDays.replace("{n}", String(c));
}
const B = "custom:hub-energie-flow-card", _e = 520, G = 5, we = 20, U = 54, Z = 156 + U, xe = 194 + U, ve = 40 + U, P = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: I,
    path: "M200 116 C200 156 200 192 200 220",
    labelX: 200,
    labelY: 166
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: oe,
    path: "M322 210 C288 226 252 240 228 246",
    labelX: 278,
    labelY: 220
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: re,
    path: "M78 210 C112 226 148 240 172 246",
    labelX: 124,
    labelY: 220
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: I,
    path: "M214 112 C252 128 292 156 322 188",
    labelX: 268,
    labelY: 144
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: le,
    path: "M78 222 C200 312 322 222",
    labelX: 200,
    labelY: 286
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: ce,
    path: "M186 112 C142 130 102 162 78 188",
    labelX: 128,
    labelY: 144
  }
]), J = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], ke = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], $e = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function Q(r) {
  return r === !0 || r === "true";
}
function Ce(r) {
  return r === "compact" || r === "full" ? r : "auto";
}
function w(r) {
  return Array.isArray(r) ? r.join(",") : r == null ? "" : String(r);
}
function j(r) {
  return r.every((e) => e != null) ? r.reduce((e, t) => e + t, 0) : null;
}
function Me(r, e) {
  if (r == null) return 0;
  const t = Math.abs(r);
  return e ? t > 0 ? 0.96 : 0.18 : t < G ? 0 : t < we ? 0.2 : 0.96;
}
function Ee(r) {
  const e = Math.max(0, Math.abs(Number(r) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(e + 1) * 2.15));
}
function De(r) {
  const e = Math.max(0, Math.abs(Number(r) || 0)), t = 4.8 - Math.log10(e + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, t));
}
function Se(r) {
  const e = String(r ?? "").trim();
  return e ? e.replace(/_/g, " ") : "ok";
}
function Oe(r) {
  const e = r?.themes;
  if (e && typeof e.darkMode == "boolean") return e.darkMode;
  if (typeof document > "u") return !1;
  const t = document.documentElement;
  if (t.classList.contains("dark")) return !0;
  const o = t.getAttribute("data-theme");
  if (o && String(o).toLowerCase().includes("dark")) return !0;
  try {
    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) return !0;
  } catch {
  }
  return !1;
}
function Te(r, e, t, o) {
  return e === "unknown" ? { value: "?", detail: r.flowBatteryUnknown, muted: !0 } : e === "idle" ? { value: null, detail: r.flowBatteryIdle, muted: !0 } : o > 0 ? { value: _(o), detail: r.flowBatteryCharging, muted: !1 } : t > 0 ? { value: _(t), detail: r.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function Le(r, e, t, o, a) {
  const s = Object.fromEntries(
    P.map((l) => [l.key, e[l.key] ?? null])
  );
  s.battery_discharge_power_w = e.battery_discharge_power_w ?? null, s.home_power_w = e.home_power_w ?? null;
  const i = P.map((l) => {
    const m = s[l.key], O = Me(m, a), T = m == null ? 0 : Math.abs(Number(m) || 0), A = m != null && T >= G ? _(m) : null, L = !!(a && m != null && T < G), N = a ? m != null : O > 0;
    return {
      ...l,
      value: m,
      visible: N,
      opacity: O,
      width: Ee(m),
      duration: De(m),
      label: A,
      ghost: L,
      _homeW: J.includes(l.key) && N ? T : -1
    };
  });
  let c = null, d = -1;
  for (const l of i)
    l._homeW > d && (d = l._homeW, c = l.key);
  const n = i.map(({ _homeW: l, ...m }) => ({
    ...m,
    primaryToHome: m.key === c && c != null
  })), p = Object.fromEntries(n.map((l) => [l.key, l])), h = j(J.map((l) => s[l])), u = j([
    s.solar_to_home_power_w,
    s.solar_to_battery_power_w,
    s.solar_export_power_w
  ]), g = j([
    s.grid_to_home_power_w,
    s.grid_to_battery_power_w,
    s.solar_export_power_w
  ]) == null ? null : s.grid_to_home_power_w + s.grid_to_battery_power_w - s.solar_export_power_w, b = t.battery_configured === !0, k = ke.map((l) => s[l]).filter((l) => l != null);
  let f = "absent";
  b && (k.length === 0 ? f = "unknown" : k.some((l) => Math.abs(l) >= 0.5) ? f = "active" : f = "idle");
  const $ = (s.solar_to_battery_power_w ?? 0) + (s.grid_to_battery_power_w ?? 0), F = s.battery_to_home_power_w ?? s.battery_discharge_power_w ?? 0, C = Te(r, f, F, $), M = (l) => l != null && Math.abs(l) >= G, S = {
    grid: {
      kind: "grid",
      iconKey: "grid",
      label: r.flowNodeGrid,
      value: g != null ? _(g) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: Z,
      pulse: M(g)
    },
    solar: {
      kind: "solar",
      iconKey: "solar",
      label: r.flowNodeSolar,
      value: u != null ? _(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: ve,
      pulse: M(u)
    },
    home: {
      kind: "home",
      iconKey: "home",
      label: r.flowNodeHome,
      value: h != null ? _(h) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: xe,
      pulse: M(h)
    },
    battery: b ? {
      kind: "battery",
      iconKey: f === "unknown" ? "battery_unknown" : "battery",
      label: r.flowNodeBattery,
      value: C.value,
      detail: C.detail,
      muted: C.muted,
      status: f,
      x: 344,
      y: Z,
      pulse: f === "active"
    } : null
  }, y = s.home_power_w, z = a && h != null && y != null ? {
    expected: h,
    reported: y,
    delta: y - h,
    tolerance: Math.max(25, Math.abs(y) * 0.04)
  } : null;
  return {
    layout: o,
    debug: a,
    nodes: S,
    edges: n,
    edgeMap: p,
    meta: {
      currentSlot: t.current_slot ?? null,
      todayColor: t.today_color ?? null,
      tomorrowColor: t.tomorrow_color ?? null,
      inputStatus: t.input_status ?? null
    },
    mismatch: z
  };
}
class Ne extends ee {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 },
    /** Bumps periodically so the live-data age line refreshes when values are unchanged. */
    _dataAgePulse: { state: !0 }
  };
  static styles = te`
    :host {
      display: block;
    }
    ha-card {
      /* Let SVG strokes / rings breathe at rounded corners (diagram uses overflow: visible). */
      overflow: visible;
    }
    .wrap {
      padding: 14px 14px 10px;
    }
    .header,
    .meta,
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .header {
      margin-bottom: 8px;
    }
    .head-main {
      flex: 1;
      min-width: 0;
    }
    .title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--primary-text-color);
    }
    .subtitle {
      margin-top: 2px;
      font-size: 0.72rem;
      line-height: 1.3;
      color: var(--secondary-text-color);
    }
    .badge,
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 22px;
      padding: 0 8px;
      border-radius: 20px;
      font-size: 0.74rem;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }
    .badge {
      color: var(--error-color);
      background: color-mix(in srgb, var(--error-color) 12%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--error-color) 35%, transparent) inset;
    }
    .warning {
      margin: 0 0 10px;
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 0.83rem;
      line-height: 1.35;
      color: var(--warning-color, #f57c00);
      background: color-mix(in srgb, var(--warning-color, #f57c00) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--warning-color, #f57c00) 28%, transparent) inset;
    }
    .meta {
      flex-wrap: wrap;
      justify-content: flex-start;
      margin-top: 10px;
    }
    .chip {
      color: var(--secondary-text-color);
      background: color-mix(in srgb, var(--secondary-background-color) 78%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
    }
    .chip.alert {
      color: var(--error-color);
      background: color-mix(in srgb, var(--error-color) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--error-color) 24%, transparent) inset;
    }
    .placeholder {
      flex-direction: column;
      align-items: flex-start;
      padding: 16px;
    }
    .placeholder .hint {
      font-size: 0.84rem;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .debug-card {
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--error-color) 32%, transparent) inset;
    }
    .flow-skel {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 100%;
      border-radius: 26px;
      overflow: hidden;
      background: color-mix(in srgb, var(--divider-color) 22%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 40%, transparent) inset;
    }
    .flow-skel::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-60%);
      background: linear-gradient(
        105deg,
        transparent 0%,
        color-mix(in srgb, var(--primary-text-color) 8%, transparent) 45%,
        transparent 90%
      );
      animation: hub-flow-skel-shimmer 1.35s ease-in-out infinite;
    }
    @keyframes hub-flow-skel-shimmer {
      to {
        transform: translateX(60%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flow-skel::after {
        animation: none;
      }
    }
  `;
  constructor() {
    super(), this.hass = void 0, this._config = { type: B }, this._autoCompact = !1, this._dataAgePulse = 0, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null, this._dataAgeTimer = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._attachResizeObserver(), this._dataAgeTimer = window.setInterval(() => {
      this._dataAgePulse += 1;
    }, 15e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._resizeObserver && this._resizeObserver.disconnect(), this._resizeObserver = null, this._resizeTimer != null && clearTimeout(this._resizeTimer), this._resizeTimer = null, this._dataAgeTimer != null && (window.clearInterval(this._dataAgeTimer), this._dataAgeTimer = null);
  }
  firstUpdated() {
    this._scheduleLayoutMeasure();
  }
  setConfig(e) {
    this._config = e && typeof e == "object" ? { ...e, type: B } : { type: B }, this._lastFp = null, this.requestUpdate();
  }
  getCardSize() {
    return 7;
  }
  getGridOptions() {
    const e = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(e) ? Math.max(1, Math.min(3, Math.trunc(e))) : 1) * 12,
      min_columns: 3,
      rows: 7,
      min_rows: 3
    };
  }
  static getConfigElement() {
    return document.createElement("hub-energie-flow-card-editor");
  }
  static getStubConfig() {
    return {
      type: B,
      layout: "auto",
      grid_span: 1
    };
  }
  shouldUpdate(e) {
    if (e.has("_dataAgePulse")) return !0;
    if (e.has("hass") && e.size === 1) {
      const t = this._stateFingerprint();
      return t !== null && t === this._lastFp ? !1 : (this._lastFp = t, !0);
    }
    return !0;
  }
  render() {
    const e = this._i18n(), t = this._resolvedLayout(), o = this._viewModel(e, t), a = this._debugEnabled();
    if (!o.ready)
      return E`
        <ha-card>
          <div class="wrap">
            <div class="header">
              <div class="head-main">
                <div class="title">${this._config?.title || e.flowCardTitle}</div>
              </div>
            </div>
            <div class="flow-skel" aria-hidden="true"></div>
            <div class="placeholder" style="padding:12px 0 0;margin:0">
              <div class="hint">${e.flowCardWaiting}</div>
              <div class="hint">${e.flowCardEntityHint}</div>
            </div>
          </div>
        </ha-card>
      `;
    const s = o.model.mismatch && Math.abs(o.model.mismatch.delta) > o.model.mismatch.tolerance ? e.flowDebugConservationWarn.replace("{derived}", _(o.model.mismatch.expected)).replace("{reported}", _(o.model.mismatch.reported)).replace("{delta}", _(o.model.mismatch.delta)) : null, i = o.dataEntityId ? this.hass.states[o.dataEntityId] : null, c = i?.last_updated ?? i?.last_changed ?? "", d = ye(String(c), Date.now(), e), n = d ? e.flowDataAgeLabel.replace("{age}", d) : e.flowDataAgeUnknown, p = [];
    o.model.meta.currentSlot && p.push(`${e.flowMetaSlot}: ${o.model.meta.currentSlot}`), o.model.meta.todayColor && p.push(`${e.flowMetaToday}: ${V(o.model.meta.todayColor, e)}`), o.model.meta.tomorrowColor && p.push(`${e.flowMetaTomorrow}: ${V(o.model.meta.tomorrowColor, e)}`), o.model.meta.inputStatus && o.model.meta.inputStatus !== "ok" && p.push(`${e.flowMetaInputStatus}: ${Se(o.model.meta.inputStatus)}`);
    const h = Oe(this.hass);
    return E`
      <ha-card class=${a ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="head-main">
              <div class="title">${this._config?.title || e.flowCardTitle}</div>
              <div class="subtitle">${n}</div>
            </div>
            ${a ? E`<span class="badge">${e.flowDebugBadge}</span>` : v}
          </div>
          ${s ? E`<div class="warning">${s}</div>` : v}
          <hub-power-flow-diagram
            .data=${o.model}
            .i18n=${e}
            .layout=${t}
            .debug=${a}
            .energyThemeDark=${h}
            .glassPanel=${this._glassPanelEnabled()}
          ></hub-power-flow-diagram>
          ${p.length ? E`
                <div class="meta">
                  ${p.map((u) => E`
                    <span class="chip ${u.includes(e.flowMetaInputStatus) ? "alert" : ""}">${u}</span>
                  `)}
                </div>
              ` : v}
        </div>
      </ha-card>
    `;
  }
  _attachResizeObserver() {
    this._resizeObserver || typeof ResizeObserver > "u" || (this._resizeObserver = new ResizeObserver(() => this._scheduleLayoutMeasure()), this._resizeObserver.observe(this));
  }
  _scheduleLayoutMeasure() {
    this._resizeTimer != null && clearTimeout(this._resizeTimer), this._resizeTimer = setTimeout(() => {
      this._resizeTimer = null;
      const e = this.offsetWidth > 0 && this.offsetWidth < _e;
      e !== this._autoCompact && (this._autoCompact = e);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? H.en : H.fr;
  }
  _debugEnabled() {
    return Q(this._config?.debug);
  }
  _glassPanelEnabled() {
    return Q(this._config?.glass_panel);
  }
  _resolvedLayout() {
    const e = Ce(this._config?.layout);
    return e === "auto" ? this._autoCompact ? "compact" : "full" : e;
  }
  _viewModel(e, t) {
    const o = this.hass?.states, a = q(o, this._config);
    if (!a)
      return { ready: !1, model: null };
    const { data: s, meta: i } = a, c = o[s], d = o[i];
    if (!c || !d)
      return { ready: !1, model: null };
    c.attributes;
    const n = d.attributes ?? {}, p = Object.fromEntries(
      [
        ...P.map((h) => h.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((h) => [h, be(o, s, h)])
    );
    return {
      ready: !0,
      dataEntityId: s,
      model: Le(e, p, n, t, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const e = this.hass?.states;
    if (!e) return null;
    const t = q(e, this._config), o = this._resolvedLayout(), a = this._debugEnabled();
    if (!t) {
      const u = String(this._config?.frontend_data_entity ?? "").trim(), D = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${o}|${a}|${w(this._config?.site_index)}|${u}|${D}`;
    }
    const { data: s, meta: i } = t, c = e[s], d = e[i];
    if (!c || !d)
      return `missing|${o}|${a}|${s}|${i}`;
    const n = c.attributes ?? {}, p = d.attributes ?? {};
    return [
      s,
      i,
      o,
      a,
      w(this._config?.site_index),
      w(this._config?.glass_panel),
      w(c.last_updated ?? c.last_changed),
      ...P.map((u) => w(n[u.key])),
      w(n.battery_discharge_power_w),
      a ? w(n.home_power_w) : "",
      ...$e.map((u) => w(p[u]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", Ne);
export {
  Ne as HubEnergieFlowCard
};
