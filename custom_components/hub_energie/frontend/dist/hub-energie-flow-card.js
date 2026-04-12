import { w, i as Q, a as tt, A as x, b as M, I as H } from "./i18n.js";
import { C as et, a as I, c as ot, b as it, e as nt } from "./colors.js";
function lt(r) {
  const t = r;
  return w`
    <symbol id="hub-${t}-ic-sun" viewBox="-14 -14 28 28">
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
    <symbol id="hub-${t}-ic-grid" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M-1.2-9.2 L4.2-2.4 L2.1-0.8 L6.8 6.2 L4.5 7.8 L-0.2 0.6 L-3.8 3.4 L-6.6-1.2 L-2.8-4.2 L-5.6-8.4 Z"
        opacity="0.95"
      ></path>
    </symbol>
    <symbol id="hub-${t}-ic-home" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M0-8.2 L9.2 1.2 L7.2 1.2 L7.2 8.2 L2.2 8.2 L2.2 4.2 L-2.2 4.2 L-2.2 8.2 L-7.2 8.2 L-7.2 1.2 L-9.2 1.2 Z"
        opacity="0.92"
      ></path>
    </symbol>
    <symbol id="hub-${t}-ic-batt" viewBox="-14 -14 28 28">
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
    <symbol id="hub-${t}-ic-q" viewBox="-14 -14 28 28">
      <text x="0" y="5" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor">?</text>
    </symbol>
  `;
}
function ct(r, t) {
  return t === "battery_unknown" ? `hub-${r}-ic-q` : t === "battery" ? `hub-${r}-ic-batt` : t === "grid" ? `hub-${r}-ic-grid` : t === "home" ? `hub-${r}-ic-home` : `hub-${r}-ic-sun`;
}
const X = Object.freeze({
  grid: ot,
  solar: I,
  home: "var(--primary-color, #03a9f4)",
  battery: et,
  neutral: "var(--secondary-text-color, #9e9e9e)"
}), dt = Object.freeze({
  solar: 0,
  grid: 1,
  battery: 2,
  home: 3
});
function ut(r) {
  return r === "home" ? 28 : 22;
}
function P(r, t, e) {
  const o = Number(t), a = Number(e), s = Number.isFinite(o) ? o : 2, i = Number.isFinite(a) ? a : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${r};stroke-width:${s}px;opacity:${i}`;
}
class pt extends Q {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean },
    /** Dark card / theme: stronger diagram contrast */
    energyThemeDark: { type: Boolean },
    /** 'node:grid' | 'edge:solar_to_home_power_w' | null */
    _focusKey: { state: !0 },
    _enterGen: { state: !0 },
    /** Bumps when any node value/detail string changes → remount value text → one-shot tick animation. */
    _valuePulse: { state: !0 }
  };
  static styles = tt`
    :host {
      display: block;
      min-height: 200px;
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this.energyThemeDark = !1, this._focusKey = null, this._enterGen = 0, this._valuePulse = 0, this._lastValueSig = "", this._gid = Math.random().toString(36).slice(2, 10), this._onDocPointerDown = this._onDocPointerDown.bind(this);
  }
  willUpdate(t) {
    if (t.has("data")) {
      const e = t.get("data");
      if (this.data && !e && (this._enterGen += 1), this.data?.nodes) {
        const o = [];
        for (const s of ["grid", "solar", "home", "battery"]) {
          const i = this.data.nodes[s];
          i && o.push(`${s}:${i.value ?? ""}|${i.detail ?? ""}`);
        }
        const a = o.join(";");
        a !== this._lastValueSig && (this._lastValueSig = a, e != null && (this._valuePulse += 1));
      }
    }
    t.has("energyThemeDark") && this.classList.toggle("hub-flow-energy--dark", !!this.energyThemeDark);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  updated(t) {
    if (super.updated(t), !(!t.has("data") || !this.data || !this._focusKey)) {
      if (this._focusKey.startsWith("edge:")) {
        const e = this._focusKey.slice(5), o = this.data.edgeMap?.[e];
        (!o || !o.visible) && (this._focusKey = null, this.requestUpdate());
      } else if (this._focusKey.startsWith("node:")) {
        const e = this._focusKey.slice(5);
        this.data.nodes?.[e] || (this._focusKey = null, this.requestUpdate());
      }
    }
  }
  _onDocPointerDown(t) {
    !this._focusKey || (t.composedPath?.() ?? []).includes(this) || (this._focusKey = null, this.requestUpdate());
  }
  _toggleFocus(t) {
    this._focusKey = this._focusKey === t ? null : t, this.requestUpdate();
  }
  _edgeTouchesNode(t, e) {
    return t.from === e || t.to === e;
  }
  _nodeDim(t, e) {
    const o = this._focusKey;
    if (!o || !t) return 1;
    if (o.startsWith("node:")) return o === `node:${e.kind}` ? 1 : 0.34;
    const a = o.slice(5), s = t.edgeMap?.[a];
    return s ? this._edgeTouchesNode(s, e.kind) ? 1 : 0.34 : 1;
  }
  _edgeDim(t, e) {
    const o = this._focusKey;
    if (!o || !t) return 1;
    if (o.startsWith("edge:")) return o === `edge:${e.key}` ? 1 : 0.22;
    const a = o.slice(5);
    return this._edgeTouchesNode(e, a) ? 1 : 0.22;
  }
  _nodeFocused(t) {
    return this._focusKey === `node:${t.kind}`;
  }
  _renderDefs() {
    const t = this._gid;
    return w`
      <defs>
        ${lt(t)}
        <linearGradient id="hub-${t}-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
        </linearGradient>
        <radialGradient id="hub-${t}-vignette" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.22"></stop>
        </radialGradient>
        <pattern
          id="hub-${t}-grid"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle class="backdrop-grid" cx="1.5" cy="1.5" r="0.9" fill="currentColor"></circle>
        </pattern>
        <radialGradient id="hub-${t}-core-grid" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#e1bee7" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#7e57c2" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#4527a0" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${t}-core-solar" cx="30%" cy="26%" r="75%">
          <stop offset="0%" stop-color="#fffde7" stop-opacity="0.75"></stop>
          <stop offset="45%" stop-color="#fdd835" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#f57f17" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${t}-core-home" cx="32%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#b2ebf2" stop-opacity="0.7"></stop>
          <stop offset="50%" stop-color="#00acc1" stop-opacity="0.95"></stop>
          <stop offset="100%" stop-color="#006064" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${t}-core-battery" cx="30%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#c8e6c9" stop-opacity="0.65"></stop>
          <stop offset="55%" stop-color="#66bb6a" stop-opacity="1"></stop>
          <stop offset="100%" stop-color="#2e7d32" stop-opacity="1"></stop>
        </radialGradient>
        <radialGradient id="hub-${t}-core-idle" cx="35%" cy="35%" r="68%">
          <stop offset="0%" stop-color="#9e9e9e" stop-opacity="0.35"></stop>
          <stop offset="100%" stop-color="#424242" stop-opacity="0.92"></stop>
        </radialGradient>
      </defs>
    `;
  }
  render() {
    const t = this.data;
    if (!t) return x;
    const e = Object.values(t.nodes).filter(Boolean), o = this.debug || this.layout !== "compact", a = this.debug || this.layout !== "compact", s = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return M`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${s}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${w`
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
        ${t.edges.map((n, l) => this._renderEdge(n, o, t, l))}
        ${e.map((n) => this._renderNode(n, a, t))}
      </svg>
    `;
  }
  _renderEdge(t, e, o, a) {
    if (!t.visible) return x;
    const s = t.color, i = Number(t.width), n = Number(t.opacity), l = Number(t.duration), d = !!t.primaryToHome, p = (Number.isFinite(i) ? i : 2.4) * (d ? 1.35 : 1), D = Number.isFinite(n) ? n : 0.96, g = Math.min(1, D * (d ? 1.06 : 1)), v = Number.isFinite(l) && l > 0 ? l : 2.5, f = !!t.ghost, k = f ? 0.14 : d ? 0.34 : 0.26, N = f ? 0.06 : d ? 0.14 : 0.11, $ = P(s, p + 2, g * k), C = P(s, p + 5, g * N), E = f ? v * 1.65 : v, y = this.energyThemeDark ? 1.08 : 1, z = Math.max(p * 1.25 + 2.8, 4.5) * (d ? 1.05 : 1) * y, c = Math.max(p * 0.42 + 1.1, 1.65) * (d ? 1.08 : 1), m = f ? g * 0.22 : g * (d ? 0.58 : 0.5), S = f ? g * 0.4 : Math.min(1, g * (d ? 1.08 : 1.02)), T = [
      P(s, z, m),
      `--hub-bolt-period:${E}s`
    ].join(";"), F = [
      "fill:none",
      "stroke:#ffffff",
      `stroke-width:${c}px`,
      `stroke-opacity:${S}`,
      "stroke-linecap:round",
      "stroke-linejoin:round",
      `--hub-bolt-period:${E}s`
    ].join(";"), O = f ? "edge-bolt-glow edge-bolt-glow--ghost" : "edge-bolt-glow", L = f ? "edge-bolt edge-bolt--ghost" : "edge-bolt", W = this._edgeDim(o, t), Y = (at) => {
      at.stopPropagation(), this._toggleFocus(`edge:${t.key}`);
    }, K = "fill:none;stroke:transparent;stroke-width:18px;stroke-linecap:round;stroke-linejoin:round;pointer-events:stroke;cursor:pointer", rt = 40 + a * 45, st = this._enterGen > 0 ? "edge-stagger" : "";
    return w`
      <g
        class="flow-dim ${st}"
        style=${`opacity:${W};--hub-edge-stagger:${rt}ms`}
      >
        <path class="edge-base" d=${t.path} style=${$} pointer-events="none"></path>
        <path class="edge-glow" d=${t.path} style=${C} pointer-events="none"></path>
        <path
          class=${O}
          d=${t.path}
          pathLength="100"
          style=${T}
          pointer-events="none"
        ></path>
        <path
          class=${L}
          d=${t.path}
          pathLength="100"
          style=${F}
          pointer-events="none"
        ></path>
        ${e && t.label ? w`<text
              class="edge-label ${d ? "edge-label--primary" : ""}"
              x=${t.labelX}
              y=${t.labelY}
              style="fill:var(--primary-text-color,#e0e0e0);cursor:pointer"
              @pointerdown=${Y}
            >
              ${t.label}
            </text>` : x}
        <path d=${t.path} style=${K} @pointerdown=${Y}></path>
      </g>
    `;
  }
  _nodeTextYs(t, e, o) {
    return e ? o ? { labelY: t + 22, valueY: t + 44, detailY: t + 64 } : { labelY: t + 20, valueY: t + 38, detailY: t + 54 } : o ? { labelY: t + 16, valueY: t + 32, detailY: t + 48 } : { labelY: t + 14, valueY: t + 24, detailY: t + 40 };
  }
  _renderNode(t, e, o) {
    const a = ut(t.kind), s = X[t.kind] ?? X.neutral, i = t.muted ? "node-muted" : "", n = e && t.detail ? t.detail : null, l = e && !!t.value, { labelY: d, valueY: h, detailY: u } = this._nodeTextYs(a, t.kind === "home", l), p = this._nodeDim(o, t), D = (K) => {
      K.stopPropagation(), this._toggleFocus(`node:${t.kind}`);
    }, b = t.status === "idle" || t.status === "unknown", v = !b && t.pulse ? "node-halo node-halo--live" : "node-halo", f = b ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${s};stroke-opacity:0.35;stroke-width:1.5`, k = this._gid, N = b ? `url(#hub-${k}-core-idle)` : `url(#hub-${k}-core-${t.kind})`, $ = b ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, C = `fill:${N};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, E = b ? "fill:#ffffff;fill-opacity:0.04" : `fill:${s};fill-opacity:0.14`, y = i === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", z = "fill:var(--secondary-text-color,#b0b0b0)", c = "cursor:pointer", m = t.iconKey ?? "solar", S = ct(k, m), F = 20 + (dt[t.kind] ?? 0) * 70, O = this._nodeFocused(t), L = O ? a + 9 : a + 8, W = this._enterGen > 0 ? "node-stagger" : "", Y = `${t.kind}|${this._valuePulse}|${t.value ?? ""}`;
    return w`
      <g
        class="flow-dim"
        style=${`opacity:${p};${c}`}
        transform="translate(${t.x} ${t.y})"
        @pointerdown=${D}
      >
        <g class=${W} style=${`--hub-stagger:${F}ms`}>
          <circle
            class=${`node-focus-ring ${O ? "node-focus-ring--on" : ""}`}
            r=${L}
          ></circle>
          <circle class=${v} r=${a + 14} style=${f}></circle>
          <circle class="node-ring ${t.status}" r=${a + 5} style=${$}></circle>
          <circle class="node-core" r=${a} style=${C}></circle>
          <circle cx="0" cy=${-a * 0.35} r=${a * 0.42} style=${E}></circle>
          <g class="node-icon-use ${i}" style=${y}>
            <use
              href="#${S}"
              width="26"
              height="26"
              x="-13"
              y="-13"
              transform="scale(${a >= 26 ? 1.05 : 0.92})"
            ></use>
          </g>
          <text class="node-label ${i}" x="0" y=${d} style=${y}>
            ${t.label}
          </text>
          ${t.value ? w`<text
                class="node-value node-value--tick ${i}"
                x="0"
                y=${h}
                style=${y}
                key=${Y}
              >
                ${t.value}
              </text>` : x}
          ${n ? w`<text class="node-detail ${i}" x="0" y=${u} style=${z}>
                ${n}
              </text>` : x}
        </g>
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", pt);
const ht = "sensor.hub_energie_";
function ft(r = ht) {
  const t = r;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function q(r, t) {
  if (!r || typeof r != "object") return null;
  const e = (l) => typeof l == "string" ? l.trim() : "", o = e(t?.frontend_data_entity), a = e(t?.frontend_meta_entity), s = (l, d) => {
    if (!l || !d) return null;
    const h = r[l], u = r[d];
    return h && u ? { data: l, meta: d } : null;
  };
  if (o && a) {
    const l = s(o, a);
    if (l) return l;
  }
  const i = ft();
  let n = s(i.frontendData, i.frontendMeta);
  return n || (n = s("sensor.frontend_data", "sensor.frontend_meta"), n) ? n : null;
}
function V(r, t) {
  const e = String(r ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function mt(r, t, e) {
  const o = r?.[t]?.attributes?.[e];
  if (o == null || o === "") return null;
  const a = Number(o);
  return Number.isFinite(a) ? a : null;
}
function _(r) {
  const t = Number(r);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
function bt(r, t, e) {
  if (!r) return null;
  const o = Date.parse(r);
  if (!Number.isFinite(o)) return null;
  const a = Math.max(0, Math.floor((t - o) / 1e3));
  if (a < 60) return e.flowAgeSeconds.replace("{n}", String(a));
  const s = Math.floor(a / 60);
  if (s < 60) return e.flowAgeMinutes.replace("{n}", String(s));
  const i = Math.floor(s / 60);
  if (i < 48) return e.flowAgeHours.replace("{n}", String(i));
  const n = Math.floor(i / 24);
  return e.flowAgeDays.replace("{n}", String(n));
}
const G = "custom:hub-energie-flow-card", gt = 520, B = 5, yt = 20, U = 54, Z = 156 + U, _t = 194 + U, wt = 40 + U, R = Object.freeze([
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
    color: et,
    path: "M322 210 C288 226 252 240 228 246",
    labelX: 278,
    labelY: 220
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: ot,
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
    color: it,
    path: "M78 222 C200 312 322 222",
    labelX: 200,
    labelY: 286
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: nt,
    path: "M186 112 C142 130 102 162 78 188",
    labelX: 128,
    labelY: 144
  }
]), J = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], xt = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], vt = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function kt(r) {
  return r === !0 || r === "true";
}
function $t(r) {
  return r === "compact" || r === "full" ? r : "auto";
}
function A(r) {
  return Array.isArray(r) ? r.join(",") : r == null ? "" : String(r);
}
function j(r) {
  return r.every((t) => t != null) ? r.reduce((t, e) => t + e, 0) : null;
}
function Ct(r, t) {
  if (r == null) return 0;
  const e = Math.abs(r);
  return t ? e > 0 ? 0.96 : 0.18 : e < B ? 0 : e < yt ? 0.2 : 0.96;
}
function Mt(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function Dt(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0)), e = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, e));
}
function Et(r) {
  const t = String(r ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function St(r) {
  const t = r?.themes;
  if (t && typeof t.darkMode == "boolean") return t.darkMode;
  if (typeof document > "u") return !1;
  const e = document.documentElement;
  if (e.classList.contains("dark")) return !0;
  const o = e.getAttribute("data-theme");
  if (o && String(o).toLowerCase().includes("dark")) return !0;
  try {
    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) return !0;
  } catch {
  }
  return !1;
}
function Tt(r, t, e, o) {
  return t === "unknown" ? { value: "?", detail: r.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: r.flowBatteryIdle, muted: !0 } : o > 0 ? { value: _(o), detail: r.flowBatteryCharging, muted: !1 } : e > 0 ? { value: _(e), detail: r.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function Ot(r, t, e, o, a) {
  const s = Object.fromEntries(
    R.map((c) => [c.key, t[c.key] ?? null])
  );
  s.battery_discharge_power_w = t.battery_discharge_power_w ?? null, s.home_power_w = t.home_power_w ?? null;
  const i = R.map((c) => {
    const m = s[c.key], S = Ct(m, a), T = m == null ? 0 : Math.abs(Number(m) || 0), F = m != null && T >= B ? _(m) : null, O = !!(a && m != null && T < B), L = a ? m != null : S > 0;
    return {
      ...c,
      value: m,
      visible: L,
      opacity: S,
      width: Mt(m),
      duration: Dt(m),
      label: F,
      ghost: O,
      _homeW: J.includes(c.key) && L ? T : -1
    };
  });
  let n = null, l = -1;
  for (const c of i)
    c._homeW > l && (l = c._homeW, n = c.key);
  const d = i.map(({ _homeW: c, ...m }) => ({
    ...m,
    primaryToHome: m.key === n && n != null
  })), h = Object.fromEntries(d.map((c) => [c.key, c])), u = j(J.map((c) => s[c])), p = j([
    s.solar_to_home_power_w,
    s.solar_to_battery_power_w,
    s.solar_export_power_w
  ]), b = j([
    s.grid_to_home_power_w,
    s.grid_to_battery_power_w,
    s.solar_export_power_w
  ]) == null ? null : s.grid_to_home_power_w + s.grid_to_battery_power_w - s.solar_export_power_w, g = e.battery_configured === !0, v = xt.map((c) => s[c]).filter((c) => c != null);
  let f = "absent";
  g && (v.length === 0 ? f = "unknown" : v.some((c) => Math.abs(c) >= 0.5) ? f = "active" : f = "idle");
  const k = (s.solar_to_battery_power_w ?? 0) + (s.grid_to_battery_power_w ?? 0), N = s.battery_to_home_power_w ?? s.battery_discharge_power_w ?? 0, $ = Tt(r, f, N, k), C = (c) => c != null && Math.abs(c) >= B, E = {
    grid: {
      kind: "grid",
      iconKey: "grid",
      label: r.flowNodeGrid,
      value: b != null ? _(b) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: Z,
      pulse: C(b)
    },
    solar: {
      kind: "solar",
      iconKey: "solar",
      label: r.flowNodeSolar,
      value: p != null ? _(p) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: wt,
      pulse: C(p)
    },
    home: {
      kind: "home",
      iconKey: "home",
      label: r.flowNodeHome,
      value: u != null ? _(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: _t,
      pulse: C(u)
    },
    battery: g ? {
      kind: "battery",
      iconKey: f === "unknown" ? "battery_unknown" : "battery",
      label: r.flowNodeBattery,
      value: $.value,
      detail: $.detail,
      muted: $.muted,
      status: f,
      x: 344,
      y: Z,
      pulse: f === "active"
    } : null
  }, y = s.home_power_w, z = a && u != null && y != null ? {
    expected: u,
    reported: y,
    delta: y - u,
    tolerance: Math.max(25, Math.abs(y) * 0.04)
  } : null;
  return {
    layout: o,
    debug: a,
    nodes: E,
    edges: d,
    edgeMap: h,
    meta: {
      currentSlot: e.current_slot ?? null,
      todayColor: e.today_color ?? null,
      tomorrowColor: e.tomorrow_color ?? null,
      inputStatus: e.input_status ?? null
    },
    mismatch: z
  };
}
class Lt extends Q {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 },
    /** Bumps periodically so the live-data age line refreshes when values are unchanged. */
    _dataAgePulse: { state: !0 }
  };
  static styles = tt`
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
    super(), this.hass = void 0, this._config = { type: G }, this._autoCompact = !1, this._dataAgePulse = 0, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null, this._dataAgeTimer = null;
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
  setConfig(t) {
    this._config = t && typeof t == "object" ? { ...t, type: G } : { type: G }, this._lastFp = null, this.requestUpdate();
  }
  getCardSize() {
    return 7;
  }
  getGridOptions() {
    const t = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(t) ? Math.max(1, Math.min(3, Math.trunc(t))) : 1) * 12,
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
      type: G,
      layout: "auto",
      grid_span: 1
    };
  }
  shouldUpdate(t) {
    if (t.has("_dataAgePulse")) return !0;
    if (t.has("hass") && t.size === 1) {
      const e = this._stateFingerprint();
      return e !== null && e === this._lastFp ? !1 : (this._lastFp = e, !0);
    }
    return !0;
  }
  render() {
    const t = this._i18n(), e = this._resolvedLayout(), o = this._viewModel(t, e), a = this._debugEnabled();
    if (!o.ready)
      return M`
        <ha-card>
          <div class="wrap">
            <div class="header">
              <div class="head-main">
                <div class="title">${this._config?.title || t.flowCardTitle}</div>
              </div>
            </div>
            <div class="flow-skel" aria-hidden="true"></div>
            <div class="placeholder" style="padding:12px 0 0;margin:0">
              <div class="hint">${t.flowCardWaiting}</div>
              <div class="hint">${t.flowCardEntityHint}</div>
            </div>
          </div>
        </ha-card>
      `;
    const s = o.model.mismatch && Math.abs(o.model.mismatch.delta) > o.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", _(o.model.mismatch.expected)).replace("{reported}", _(o.model.mismatch.reported)).replace("{delta}", _(o.model.mismatch.delta)) : null, i = o.dataEntityId ? this.hass.states[o.dataEntityId] : null, n = i?.last_updated ?? i?.last_changed ?? "", l = bt(String(n), Date.now(), t), d = l ? t.flowDataAgeLabel.replace("{age}", l) : t.flowDataAgeUnknown, h = [];
    o.model.meta.currentSlot && h.push(`${t.flowMetaSlot}: ${o.model.meta.currentSlot}`), o.model.meta.todayColor && h.push(`${t.flowMetaToday}: ${V(o.model.meta.todayColor, t)}`), o.model.meta.tomorrowColor && h.push(`${t.flowMetaTomorrow}: ${V(o.model.meta.tomorrowColor, t)}`), o.model.meta.inputStatus && o.model.meta.inputStatus !== "ok" && h.push(`${t.flowMetaInputStatus}: ${Et(o.model.meta.inputStatus)}`);
    const u = St(this.hass);
    return M`
      <ha-card class=${a ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="head-main">
              <div class="title">${this._config?.title || t.flowCardTitle}</div>
              <div class="subtitle">${d}</div>
            </div>
            ${a ? M`<span class="badge">${t.flowDebugBadge}</span>` : x}
          </div>
          ${s ? M`<div class="warning">${s}</div>` : x}
          <hub-power-flow-diagram
            .data=${o.model}
            .i18n=${t}
            .layout=${e}
            .debug=${a}
            .energyThemeDark=${u}
          ></hub-power-flow-diagram>
          ${h.length ? M`
                <div class="meta">
                  ${h.map((p) => M`
                    <span class="chip ${p.includes(t.flowMetaInputStatus) ? "alert" : ""}">${p}</span>
                  `)}
                </div>
              ` : x}
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
      const t = this.offsetWidth > 0 && this.offsetWidth < gt;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? H.en : H.fr;
  }
  _debugEnabled() {
    return kt(this._config?.debug);
  }
  _resolvedLayout() {
    const t = $t(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, e) {
    const o = this.hass?.states, a = q(o, this._config);
    if (!a)
      return { ready: !1, model: null };
    const { data: s, meta: i } = a, n = o[s], l = o[i];
    if (!n || !l)
      return { ready: !1, model: null };
    n.attributes;
    const d = l.attributes ?? {}, h = Object.fromEntries(
      [
        ...R.map((u) => u.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((u) => [u, mt(o, s, u)])
    );
    return {
      ready: !0,
      dataEntityId: s,
      model: Ot(t, h, d, e, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const e = q(t, this._config), o = this._resolvedLayout(), a = this._debugEnabled();
    if (!e) {
      const p = String(this._config?.frontend_data_entity ?? "").trim(), D = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${o}|${a}|${p}|${D}`;
    }
    const { data: s, meta: i } = e, n = t[s], l = t[i];
    if (!n || !l)
      return `missing|${o}|${a}|${s}|${i}`;
    const d = n.attributes ?? {}, h = l.attributes ?? {};
    return [
      s,
      i,
      o,
      a,
      A(n.last_updated ?? n.last_changed),
      ...R.map((p) => A(d[p.key])),
      A(d.battery_discharge_power_w),
      a ? A(d.home_power_w) : "",
      ...vt.map((p) => A(h[p]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", Lt);
export {
  Lt as HubEnergieFlowCard
};
