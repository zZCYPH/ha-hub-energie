import { i as I, a as U, w as x, A as w, b as $, I as P } from "./i18n.js";
import { C as H, a as L, c as X, b as V, e as J } from "./colors.js";
const W = Object.freeze({
  grid: X,
  solar: L,
  home: "var(--primary-color, #03a9f4)",
  battery: H,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function Q(r) {
  return r === "home" ? 28 : 22;
}
function z(r, t, e) {
  const o = Number(t), a = Number(e), s = Number.isFinite(o) ? o : 2, i = Number.isFinite(a) ? a : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${r};stroke-width:${s}px;opacity:${i}`;
}
class Z extends I {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean },
    /** 'node:grid' | 'edge:solar_to_home_power_w' | null */
    _focusKey: { state: !0 }
  };
  static styles = U`
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this._focusKey = null, this._gid = Math.random().toString(36).slice(2, 10), this._onDocPointerDown = this._onDocPointerDown.bind(this);
  }
  connectedCallback() {
    super.connectedCallback(), document.addEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("pointerdown", this._onDocPointerDown, !1);
  }
  _onDocPointerDown(t) {
    !this._focusKey || (t.composedPath?.() ?? []).includes(this) || (this._focusKey = null, this.requestUpdate());
  }
  _toggleFocus(t) {
    this._focusKey = this._focusKey === t ? null : t, this.requestUpdate();
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
  _renderDefs() {
    const t = this._gid;
    return x`
      <defs>
        <linearGradient id="hub-${t}-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
        </linearGradient>
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
    if (!t) return w;
    const e = Object.values(t.nodes).filter(Boolean), o = this.debug || this.layout !== "compact", a = this.debug || this.layout !== "compact", s = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return $`
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
        ${t.edges.map((l) => this._renderEdge(l, o, t))}
        ${e.map((l) => this._renderNode(l, a, t))}
      </svg>
    `;
  }
  _renderEdge(t, e, o) {
    if (!t.visible) return w;
    const a = t.color, s = Number(t.width), i = Number(t.opacity), l = Number(t.duration), n = Number.isFinite(s) ? s : 2.4, c = Number.isFinite(i) ? i : 0.96, p = Number.isFinite(l) && l > 0 ? l : 2.5, d = !!t.ghost, m = d ? 0.14 : 0.26, _ = d ? 0.06 : 0.11, f = z(a, n + 2, c * m), T = z(a, n + 5, c * _), k = d ? p * 1.65 : p, v = Math.max(n * 1.25 + 2.8, 4.5), g = Math.max(n * 0.42 + 1.1, 1.65), M = d ? c * 0.22 : c * 0.5, y = d ? c * 0.4 : Math.min(1, c * 1.02), E = [
      z(a, v, M),
      `--hub-bolt-period:${k}s`
    ].join(";"), u = [
      "fill:none",
      "stroke:#ffffff",
      `stroke-width:${g}px`,
      `stroke-opacity:${y}`,
      "stroke-linecap:round",
      "stroke-linejoin:round",
      `--hub-bolt-period:${k}s`
    ].join(";"), h = d ? "edge-bolt-glow edge-bolt-glow--ghost" : "edge-bolt-glow", S = d ? "edge-bolt edge-bolt--ghost" : "edge-bolt", D = this._edgeDim(o, t), C = (q) => {
      q.stopPropagation(), this._toggleFocus(`edge:${t.key}`);
    };
    return x`
      <g class="flow-dim" style=${`opacity:${D}`}>
        <path class="edge-base" d=${t.path} style=${f} pointer-events="none"></path>
        <path class="edge-glow" d=${t.path} style=${T} pointer-events="none"></path>
        <path
          class=${h}
          d=${t.path}
          pathLength="100"
          style=${E}
          pointer-events="none"
        ></path>
        <path
          class=${S}
          d=${t.path}
          pathLength="100"
          style=${u}
          pointer-events="none"
        ></path>
        ${e && t.label ? x`<text
              class="edge-label"
              x=${t.labelX}
              y=${t.labelY}
              style="fill:var(--primary-text-color,#e0e0e0);cursor:pointer"
              @pointerdown=${C}
            >
              ${t.label}
            </text>` : w}
        <path d=${t.path} style=${"fill:none;stroke:transparent;stroke-width:18px;stroke-linecap:round;stroke-linejoin:round;pointer-events:stroke;cursor:pointer"} @pointerdown=${C}></path>
      </g>
    `;
  }
  /** Extra line spacing when labels + values + details are all shown (full layout / debug). */
  _nodeTextYs(t, e, o) {
    return e ? o ? { labelY: t + 22, valueY: t + 44, detailY: t + 64 } : { labelY: t + 20, valueY: t + 38, detailY: t + 54 } : o ? { labelY: t + 16, valueY: t + 32, detailY: t + 48 } : { labelY: t + 14, valueY: t + 24, detailY: t + 40 };
  }
  _renderNode(t, e, o) {
    const a = Q(t.kind), s = W[t.kind] ?? W.neutral, i = t.muted ? "node-muted" : "", l = e && t.detail ? t.detail : null, n = e && !!t.value, { labelY: c, valueY: p, detailY: d } = this._nodeTextYs(a, t.kind === "home", n), m = this._nodeDim(o, t), _ = (C) => {
      C.stopPropagation(), this._toggleFocus(`node:${t.kind}`);
    }, f = t.status === "idle" || t.status === "unknown", k = !f && t.pulse ? "node-halo node-halo--live" : "node-halo", v = f ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${s};stroke-opacity:0.35;stroke-width:1.5`, g = this._gid, M = f ? `url(#hub-${g}-core-idle)` : `url(#hub-${g}-core-${t.kind})`, y = f ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, E = `fill:${M};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, u = f ? "fill:#ffffff;fill-opacity:0.04" : `fill:${s};fill-opacity:0.14`, h = i === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)";
    return x`
      <g
        class="flow-dim"
        style=${`opacity:${m};cursor:pointer`}
        transform="translate(${t.x} ${t.y})"
        @pointerdown=${_}
      >
        <circle class=${k} r=${a + 14} style=${v}></circle>
        <circle class="node-ring ${t.status}" r=${a + 5} style=${y}></circle>
        <circle class="node-core" r=${a} style=${E}></circle>
        <circle cx="0" cy=${-a * 0.35} r=${a * 0.42} style=${u}></circle>
        <text class="node-icon ${i}" x="0" y="1" style=${h}>${t.icon}</text>
        <text class="node-label ${i}" x="0" y=${c} style=${h}>${t.label}</text>
        ${t.value ? x`<text class="node-value ${i}" x="0" y=${p} style=${h}>${t.value}</text>` : w}
        ${l ? x`<text class="node-detail ${i}" x="0" y=${d} style=${"fill:var(--secondary-text-color,#b0b0b0)"}>${l}</text>` : w}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", Z);
const tt = "sensor.hub_energie_";
function et(r = tt) {
  const t = r;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function B(r, t) {
  if (!r || typeof r != "object") return null;
  const e = (n) => typeof n == "string" ? n.trim() : "", o = e(t?.frontend_data_entity), a = e(t?.frontend_meta_entity), s = (n, c) => {
    if (!n || !c) return null;
    const p = r[n], d = r[c];
    return p && d ? { data: n, meta: c } : null;
  };
  if (o && a) {
    const n = s(o, a);
    if (n) return n;
  }
  const i = et();
  let l = s(i.frontendData, i.frontendMeta);
  return l || (l = s("sensor.frontend_data", "sensor.frontend_meta"), l) ? l : null;
}
function K(r, t) {
  const e = String(r ?? "").toLowerCase();
  return e.includes("blue") || e.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : e.includes("white") || e.includes("blanc") ? t?.tempoDayWhite ?? "White" : e.includes("red") || e.includes("rouge") ? t?.tempoDayRed ?? "Red" : e === "n/a" ? t?.dayColorNA ?? "N/A" : e || (t?.emDash ?? "—");
}
function ot(r, t, e) {
  const o = r?.[t]?.attributes?.[e];
  if (o == null || o === "") return null;
  const a = Number(o);
  return Number.isFinite(a) ? a : null;
}
function b(r) {
  const t = Number(r);
  if (!Number.isFinite(t)) return "—";
  const e = Math.abs(t);
  return e >= 1e3 ? `${(t / 1e3).toFixed(e >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
function rt(r, t, e) {
  if (!r) return null;
  const o = Date.parse(r);
  if (!Number.isFinite(o)) return null;
  const a = Math.max(0, Math.floor((t - o) / 1e3));
  if (a < 60) return e.flowAgeSeconds.replace("{n}", String(a));
  const s = Math.floor(a / 60);
  if (s < 60) return e.flowAgeMinutes.replace("{n}", String(s));
  const i = Math.floor(s / 60);
  if (i < 48) return e.flowAgeHours.replace("{n}", String(i));
  const l = Math.floor(i / 24);
  return e.flowAgeDays.replace("{n}", String(l));
}
const N = "custom:hub-energie-flow-card", st = 520, F = 5, at = 20, G = 54, j = 156 + G, it = 194 + G, nt = 40 + G, A = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: L,
    path: "M200 116 C200 156 200 192 200 220",
    labelX: 200,
    labelY: 166
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: H,
    path: "M322 210 C288 226 252 240 228 246",
    labelX: 278,
    labelY: 220
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: X,
    path: "M78 210 C112 226 148 240 172 246",
    labelX: 124,
    labelY: 220
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: L,
    path: "M214 112 C252 128 292 156 322 188",
    labelX: 268,
    labelY: 144
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: V,
    path: "M78 222 C200 312 322 222",
    labelX: 200,
    labelY: 286
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: J,
    path: "M186 112 C142 130 102 162 78 188",
    labelX: 128,
    labelY: 144
  }
]), lt = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], ct = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], dt = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function ut(r) {
  return r === !0 || r === "true";
}
function pt(r) {
  return r === "compact" || r === "full" ? r : "auto";
}
function O(r) {
  return Array.isArray(r) ? r.join(",") : r == null ? "" : String(r);
}
function Y(r) {
  return r.every((t) => t != null) ? r.reduce((t, e) => t + e, 0) : null;
}
function ht(r, t) {
  if (r == null) return 0;
  const e = Math.abs(r);
  return t ? e > 0 ? 0.96 : 0.18 : e < F ? 0 : e < at ? 0.2 : 0.96;
}
function ft(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function mt(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0)), e = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, e));
}
function bt(r) {
  const t = String(r ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function _t(r, t, e, o) {
  return t === "unknown" ? { value: "?", detail: r.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: r.flowBatteryIdle, muted: !0 } : o > 0 ? { value: b(o), detail: r.flowBatteryCharging, muted: !1 } : e > 0 ? { value: b(e), detail: r.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function gt(r, t, e, o, a) {
  const s = Object.fromEntries(
    A.map((u) => [u.key, t[u.key] ?? null])
  );
  s.battery_discharge_power_w = t.battery_discharge_power_w ?? null, s.home_power_w = t.home_power_w ?? null;
  const i = A.map((u) => {
    const h = s[u.key], S = ht(h, a), D = h == null ? 0 : Math.abs(Number(h) || 0), C = h != null && D >= F ? b(h) : null, R = !!(a && h != null && D < F);
    return {
      ...u,
      value: h,
      visible: a ? h != null : S > 0,
      opacity: S,
      width: ft(h),
      duration: mt(h),
      label: C,
      ghost: R
    };
  }), l = Object.fromEntries(i.map((u) => [u.key, u])), n = Y(lt.map((u) => s[u])), c = Y([
    s.solar_to_home_power_w,
    s.solar_to_battery_power_w,
    s.solar_export_power_w
  ]), d = Y([
    s.grid_to_home_power_w,
    s.grid_to_battery_power_w,
    s.solar_export_power_w
  ]) == null ? null : s.grid_to_home_power_w + s.grid_to_battery_power_w - s.solar_export_power_w, m = e.battery_configured === !0, _ = ct.map((u) => s[u]).filter((u) => u != null);
  let f = "absent";
  m && (_.length === 0 ? f = "unknown" : _.some((u) => Math.abs(u) >= 0.5) ? f = "active" : f = "idle");
  const T = (s.solar_to_battery_power_w ?? 0) + (s.grid_to_battery_power_w ?? 0), k = s.battery_to_home_power_w ?? s.battery_discharge_power_w ?? 0, v = _t(r, f, k, T), g = (u) => u != null && Math.abs(u) >= F, M = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: r.flowNodeGrid,
      value: d != null ? b(d) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: j,
      pulse: g(d)
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: r.flowNodeSolar,
      value: c != null ? b(c) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: nt,
      pulse: g(c)
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: r.flowNodeHome,
      value: n != null ? b(n) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: it,
      pulse: g(n)
    },
    battery: m ? {
      kind: "battery",
      icon: f === "unknown" ? "?" : "B",
      label: r.flowNodeBattery,
      value: v.value,
      detail: v.detail,
      muted: v.muted,
      status: f,
      x: 344,
      y: j,
      pulse: f === "active"
    } : null
  }, y = s.home_power_w, E = a && n != null && y != null ? {
    expected: n,
    reported: y,
    delta: y - n,
    tolerance: Math.max(25, Math.abs(y) * 0.04)
  } : null;
  return {
    layout: o,
    debug: a,
    nodes: M,
    edges: i,
    edgeMap: l,
    meta: {
      currentSlot: e.current_slot ?? null,
      todayColor: e.today_color ?? null,
      tomorrowColor: e.tomorrow_color ?? null,
      inputStatus: e.input_status ?? null
    },
    mismatch: E
  };
}
class yt extends I {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 },
    /** Bumps periodically so the live-data age line refreshes when values are unchanged. */
    _dataAgePulse: { state: !0 }
  };
  static styles = U`
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
      border-radius: 999px;
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
  `;
  constructor() {
    super(), this.hass = void 0, this._config = { type: N }, this._autoCompact = !1, this._dataAgePulse = 0, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null, this._dataAgeTimer = null;
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
    this._config = t && typeof t == "object" ? { ...t, type: N } : { type: N }, this._lastFp = null, this.requestUpdate();
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
      type: N,
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
      return $`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const s = o.model.mismatch && Math.abs(o.model.mismatch.delta) > o.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", b(o.model.mismatch.expected)).replace("{reported}", b(o.model.mismatch.reported)).replace("{delta}", b(o.model.mismatch.delta)) : null, i = o.dataEntityId ? this.hass.states[o.dataEntityId] : null, l = i?.last_updated ?? i?.last_changed ?? "", n = rt(String(l), Date.now(), t), c = n ? t.flowDataAgeLabel.replace("{age}", n) : t.flowDataAgeUnknown, p = [];
    return o.model.meta.currentSlot && p.push(`${t.flowMetaSlot}: ${o.model.meta.currentSlot}`), o.model.meta.todayColor && p.push(`${t.flowMetaToday}: ${K(o.model.meta.todayColor, t)}`), o.model.meta.tomorrowColor && p.push(`${t.flowMetaTomorrow}: ${K(o.model.meta.tomorrowColor, t)}`), o.model.meta.inputStatus && o.model.meta.inputStatus !== "ok" && p.push(`${t.flowMetaInputStatus}: ${bt(o.model.meta.inputStatus)}`), $`
      <ha-card class=${a ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="head-main">
              <div class="title">${this._config?.title || t.flowCardTitle}</div>
              <div class="subtitle">${c}</div>
            </div>
            ${a ? $`<span class="badge">${t.flowDebugBadge}</span>` : w}
          </div>
          ${s ? $`<div class="warning">${s}</div>` : w}
          <hub-power-flow-diagram
            .data=${o.model}
            .i18n=${t}
            .layout=${e}
            .debug=${a}
          ></hub-power-flow-diagram>
          ${p.length ? $`
                <div class="meta">
                  ${p.map((d) => $`
                    <span class="chip ${d.includes(t.flowMetaInputStatus) ? "alert" : ""}">${d}</span>
                  `)}
                </div>
              ` : w}
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
      const t = this.offsetWidth > 0 && this.offsetWidth < st;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? P.en : P.fr;
  }
  _debugEnabled() {
    return ut(this._config?.debug);
  }
  _resolvedLayout() {
    const t = pt(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, e) {
    const o = this.hass?.states, a = B(o, this._config);
    if (!a)
      return { ready: !1, model: null };
    const { data: s, meta: i } = a, l = o[s], n = o[i];
    if (!l || !n)
      return { ready: !1, model: null };
    l.attributes;
    const c = n.attributes ?? {}, p = Object.fromEntries(
      [
        ...A.map((d) => d.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((d) => [d, ot(o, s, d)])
    );
    return {
      ready: !0,
      dataEntityId: s,
      model: gt(t, p, c, e, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const e = B(t, this._config), o = this._resolvedLayout(), a = this._debugEnabled();
    if (!e) {
      const m = String(this._config?.frontend_data_entity ?? "").trim(), _ = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${o}|${a}|${m}|${_}`;
    }
    const { data: s, meta: i } = e, l = t[s], n = t[i];
    if (!l || !n)
      return `missing|${o}|${a}|${s}|${i}`;
    const c = l.attributes ?? {}, p = n.attributes ?? {};
    return [
      s,
      i,
      o,
      a,
      O(l.last_updated ?? l.last_changed),
      ...A.map((m) => O(c[m.key])),
      O(c.battery_discharge_power_w),
      a ? O(c.home_power_w) : "",
      ...dt.map((m) => O(p[m]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", yt);
export {
  yt as HubEnergieFlowCard
};
