import { i as I, a as U, w as $, A as y, b as k, I as R } from "./i18n.js";
import { C as H, a as F, c as P, b as V, e as q } from "./colors.js";
const A = Object.freeze({
  grid: P,
  solar: F,
  home: "var(--primary-color, #03a9f4)",
  battery: H,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function J(r) {
  return r === "home" ? 28 : 22;
}
function z(r, t, o) {
  const e = Number(t), s = Number(o), a = Number.isFinite(e) ? e : 2, i = Number.isFinite(s) ? s : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${r};stroke-width:${a}px;opacity:${i}`;
}
class Q extends I {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
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
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.92;
    }
    .node-value {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.02em;
      font-variant-numeric: tabular-nums;
    }
    .node-detail {
      font-size: 11px;
      fill: var(--secondary-text-color);
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
    @media (prefers-reduced-motion: reduce) {
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this._gid = Math.random().toString(36).slice(2, 10);
  }
  _renderDefs() {
    const t = this._gid;
    return $`
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
    if (!t) return y;
    const o = Object.values(t.nodes).filter(Boolean), e = this.debug || this.layout !== "compact", s = this.debug || this.layout !== "compact", a = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return k`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${a}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${$`
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
        ${t.edges.map((n) => this._renderEdge(n, e))}
        ${o.map((n) => this._renderNode(n, s))}
      </svg>
    `;
  }
  _renderEdge(t, o) {
    if (!t.visible) return y;
    const e = t.color, s = Number(t.width), a = Number(t.opacity), i = Number(t.duration), n = Number.isFinite(s) ? s : 2.4, l = Number.isFinite(a) ? a : 0.96, u = Number.isFinite(i) && i > 0 ? i : 2.5, p = !!t.ghost, d = p ? 0.14 : 0.26, f = p ? 0.06 : 0.11, g = z(e, n + 2, l * d), m = z(e, n + 5, l * f), w = p ? u * 1.65 : u, C = Math.max(n * 1.25 + 2.8, 4.5), x = Math.max(n * 0.42 + 1.1, 1.65), v = p ? l * 0.22 : l * 0.5, M = p ? l * 0.4 : Math.min(1, l * 1.02), b = [
      z(e, C, v),
      `--hub-bolt-period:${w}s`
    ].join(";"), E = [
      "fill:none",
      "stroke:#ffffff",
      `stroke-width:${x}px`,
      `stroke-opacity:${M}`,
      "stroke-linecap:round",
      "stroke-linejoin:round",
      `--hub-bolt-period:${w}s`
    ].join(";"), c = p ? "edge-bolt-glow edge-bolt-glow--ghost" : "edge-bolt-glow", h = p ? "edge-bolt edge-bolt--ghost" : "edge-bolt";
    return $`
      <g>
        <path class="edge-base" d=${t.path} style=${g}></path>
        <path class="edge-glow" d=${t.path} style=${m}></path>
        <path
          class=${c}
          d=${t.path}
          pathLength="100"
          style=${b}
        ></path>
        <path
          class=${h}
          d=${t.path}
          pathLength="100"
          style=${E}
        ></path>
        ${o && t.label ? $`<text
              class="edge-label"
              x=${t.labelX}
              y=${t.labelY}
              style="fill:var(--primary-text-color,#e0e0e0)"
            >
              ${t.label}
            </text>` : y}
      </g>
    `;
  }
  /** Extra line spacing when labels + values + details are all shown (full layout / debug). */
  _nodeTextYs(t, o, e) {
    return o ? e ? { labelY: t + 22, valueY: t + 44, detailY: t + 64 } : { labelY: t + 20, valueY: t + 38, detailY: t + 54 } : e ? { labelY: t + 16, valueY: t + 32, detailY: t + 48 } : { labelY: t + 14, valueY: t + 24, detailY: t + 40 };
  }
  _renderNode(t, o) {
    const e = J(t.kind), s = A[t.kind] ?? A.neutral, a = t.muted ? "node-muted" : "", i = o && t.detail ? t.detail : null, n = o && !!t.value, { labelY: l, valueY: u, detailY: p } = this._nodeTextYs(e, t.kind === "home", n), d = t.status === "idle" || t.status === "unknown", g = !d && t.pulse ? "node-halo node-halo--live" : "node-halo", m = d ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${s};stroke-opacity:0.35;stroke-width:1.5`, w = this._gid, C = d ? `url(#hub-${w}-core-idle)` : `url(#hub-${w}-core-${t.kind})`, x = d ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, v = `fill:${C};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, M = d ? "fill:#ffffff;fill-opacity:0.04" : `fill:${s};fill-opacity:0.14`, b = a === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)";
    return $`
      <g transform="translate(${t.x} ${t.y})">
        <circle class=${g} r=${e + 14} style=${m}></circle>
        <circle class="node-ring ${t.status}" r=${e + 5} style=${x}></circle>
        <circle class="node-core" r=${e} style=${v}></circle>
        <circle cx="0" cy=${-e * 0.35} r=${e * 0.42} style=${M}></circle>
        <text class="node-icon ${a}" x="0" y="1" style=${b}>${t.icon}</text>
        <text class="node-label ${a}" x="0" y=${l} style=${b}>${t.label}</text>
        ${t.value ? $`<text class="node-value ${a}" x="0" y=${u} style=${b}>${t.value}</text>` : y}
        ${i ? $`<text class="node-detail ${a}" x="0" y=${p} style=${"fill:var(--secondary-text-color,#b0b0b0)"}>${i}</text>` : y}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", Q);
const Z = "sensor.hub_energie_";
function tt(r = Z) {
  const t = r;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function B(r, t) {
  if (!r || typeof r != "object") return null;
  const o = (l) => typeof l == "string" ? l.trim() : "", e = o(t?.frontend_data_entity), s = o(t?.frontend_meta_entity), a = (l, u) => {
    if (!l || !u) return null;
    const p = r[l], d = r[u];
    return p && d ? { data: l, meta: u } : null;
  };
  if (e && s) {
    const l = a(e, s);
    if (l) return l;
  }
  const i = tt();
  let n = a(i.frontendData, i.frontendMeta);
  return n || (n = a("sensor.frontend_data", "sensor.frontend_meta"), n) ? n : null;
}
function j(r, t) {
  const o = String(r ?? "").toLowerCase();
  return o.includes("blue") || o.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : o.includes("white") || o.includes("blanc") ? t?.tempoDayWhite ?? "White" : o.includes("red") || o.includes("rouge") ? t?.tempoDayRed ?? "Red" : o === "n/a" ? t?.dayColorNA ?? "N/A" : o || (t?.emDash ?? "—");
}
function et(r, t, o) {
  const e = r?.[t]?.attributes?.[o];
  if (e == null || e === "") return null;
  const s = Number(e);
  return Number.isFinite(s) ? s : null;
}
function _(r) {
  const t = Number(r);
  if (!Number.isFinite(t)) return "—";
  const o = Math.abs(t);
  return o >= 1e3 ? `${(t / 1e3).toFixed(o >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
const O = "custom:hub-energie-flow-card", ot = 520, T = 5, rt = 20, D = 54, W = 156 + D, at = 194 + D, st = 40 + D, Y = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: F,
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
    color: P,
    path: "M78 210 C112 226 148 240 172 246",
    labelX: 124,
    labelY: 220
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: F,
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
    color: q,
    path: "M186 112 C142 130 102 162 78 188",
    labelX: 128,
    labelY: 144
  }
]), lt = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], it = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], nt = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function ct(r) {
  return r === !0 || r === "true";
}
function dt(r) {
  return r === "compact" || r === "full" ? r : "auto";
}
function S(r) {
  return Array.isArray(r) ? r.join(",") : r == null ? "" : String(r);
}
function N(r) {
  return r.every((t) => t != null) ? r.reduce((t, o) => t + o, 0) : null;
}
function ut(r, t) {
  if (r == null) return 0;
  const o = Math.abs(r);
  return t ? o > 0 ? 0.96 : 0.18 : o < T ? 0 : o < rt ? 0.2 : 0.96;
}
function pt(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function ht(r) {
  const t = Math.max(0, Math.abs(Number(r) || 0)), o = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, o));
}
function ft(r) {
  const t = String(r ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function mt(r, t, o, e) {
  return t === "unknown" ? { value: "?", detail: r.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: r.flowBatteryIdle, muted: !0 } : e > 0 ? { value: _(e), detail: r.flowBatteryCharging, muted: !1 } : o > 0 ? { value: _(o), detail: r.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function bt(r, t, o, e, s) {
  const a = Object.fromEntries(
    Y.map((c) => [c.key, t[c.key] ?? null])
  );
  a.battery_discharge_power_w = t.battery_discharge_power_w ?? null, a.home_power_w = t.home_power_w ?? null;
  const i = Y.map((c) => {
    const h = a[c.key], G = ut(h, s), L = h == null ? 0 : Math.abs(Number(h) || 0), X = h != null && L >= T ? _(h) : null, K = !!(s && h != null && L < T);
    return {
      ...c,
      value: h,
      visible: s ? h != null : G > 0,
      opacity: G,
      width: pt(h),
      duration: ht(h),
      label: X,
      ghost: K
    };
  }), n = Object.fromEntries(i.map((c) => [c.key, c])), l = N(lt.map((c) => a[c])), u = N([
    a.solar_to_home_power_w,
    a.solar_to_battery_power_w,
    a.solar_export_power_w
  ]), d = N([
    a.grid_to_home_power_w,
    a.grid_to_battery_power_w,
    a.solar_export_power_w
  ]) == null ? null : a.grid_to_home_power_w + a.grid_to_battery_power_w - a.solar_export_power_w, f = o.battery_configured === !0, g = it.map((c) => a[c]).filter((c) => c != null);
  let m = "absent";
  f && (g.length === 0 ? m = "unknown" : g.some((c) => Math.abs(c) >= 0.5) ? m = "active" : m = "idle");
  const w = (a.solar_to_battery_power_w ?? 0) + (a.grid_to_battery_power_w ?? 0), C = a.battery_to_home_power_w ?? a.battery_discharge_power_w ?? 0, x = mt(r, m, C, w), v = (c) => c != null && Math.abs(c) >= T, M = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: r.flowNodeGrid,
      value: d != null ? _(d) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: W,
      pulse: v(d)
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: r.flowNodeSolar,
      value: u != null ? _(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: st,
      pulse: v(u)
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: r.flowNodeHome,
      value: l != null ? _(l) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: at,
      pulse: v(l)
    },
    battery: f ? {
      kind: "battery",
      icon: m === "unknown" ? "?" : "B",
      label: r.flowNodeBattery,
      value: x.value,
      detail: x.detail,
      muted: x.muted,
      status: m,
      x: 344,
      y: W,
      pulse: m === "active"
    } : null
  }, b = a.home_power_w, E = s && l != null && b != null ? {
    expected: l,
    reported: b,
    delta: b - l,
    tolerance: Math.max(25, Math.abs(b) * 0.04)
  } : null;
  return {
    layout: e,
    debug: s,
    nodes: M,
    edges: i,
    edgeMap: n,
    meta: {
      currentSlot: o.current_slot ?? null,
      todayColor: o.today_color ?? null,
      tomorrowColor: o.tomorrow_color ?? null,
      inputStatus: o.input_status ?? null
    },
    mismatch: E
  };
}
class _t extends I {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
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
    .title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--primary-text-color);
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
    super(), this.hass = void 0, this._config = { type: O }, this._autoCompact = !1, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._attachResizeObserver();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._resizeObserver && this._resizeObserver.disconnect(), this._resizeObserver = null, this._resizeTimer != null && clearTimeout(this._resizeTimer), this._resizeTimer = null;
  }
  firstUpdated() {
    this._scheduleLayoutMeasure();
  }
  setConfig(t) {
    this._config = t && typeof t == "object" ? { ...t, type: O } : { type: O }, this._lastFp = null, this.requestUpdate();
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
      type: O,
      layout: "auto",
      grid_span: 1
    };
  }
  shouldUpdate(t) {
    if (t.has("hass") && t.size === 1) {
      const o = this._stateFingerprint();
      return o !== null && o === this._lastFp ? !1 : (this._lastFp = o, !0);
    }
    return !0;
  }
  render() {
    const t = this._i18n(), o = this._resolvedLayout(), e = this._viewModel(t, o), s = this._debugEnabled();
    if (!e.ready)
      return k`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const a = e.model.mismatch && Math.abs(e.model.mismatch.delta) > e.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", _(e.model.mismatch.expected)).replace("{reported}", _(e.model.mismatch.reported)).replace("{delta}", _(e.model.mismatch.delta)) : null, i = [];
    return e.model.meta.currentSlot && i.push(`${t.flowMetaSlot}: ${e.model.meta.currentSlot}`), e.model.meta.todayColor && i.push(`${t.flowMetaToday}: ${j(e.model.meta.todayColor, t)}`), e.model.meta.tomorrowColor && i.push(`${t.flowMetaTomorrow}: ${j(e.model.meta.tomorrowColor, t)}`), e.model.meta.inputStatus && e.model.meta.inputStatus !== "ok" && i.push(`${t.flowMetaInputStatus}: ${ft(e.model.meta.inputStatus)}`), k`
      <ha-card class=${s ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            ${s ? k`<span class="badge">${t.flowDebugBadge}</span>` : y}
          </div>
          ${a ? k`<div class="warning">${a}</div>` : y}
          <hub-power-flow-diagram
            .data=${e.model}
            .i18n=${t}
            .layout=${o}
            .debug=${s}
          ></hub-power-flow-diagram>
          ${i.length ? k`
                <div class="meta">
                  ${i.map((n) => k`
                    <span class="chip ${n.includes(t.flowMetaInputStatus) ? "alert" : ""}">${n}</span>
                  `)}
                </div>
              ` : y}
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
      const t = this.offsetWidth > 0 && this.offsetWidth < ot;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? R.en : R.fr;
  }
  _debugEnabled() {
    return ct(this._config?.debug);
  }
  _resolvedLayout() {
    const t = dt(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, o) {
    const e = this.hass?.states, s = B(e, this._config);
    if (!s)
      return { ready: !1, model: null };
    const { data: a, meta: i } = s, n = e[a], l = e[i];
    if (!n || !l)
      return { ready: !1, model: null };
    n.attributes;
    const u = l.attributes ?? {}, p = Object.fromEntries(
      [
        ...Y.map((d) => d.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((d) => [d, et(e, a, d)])
    );
    return {
      ready: !0,
      model: bt(t, p, u, o, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const o = B(t, this._config), e = this._resolvedLayout(), s = this._debugEnabled();
    if (!o) {
      const f = String(this._config?.frontend_data_entity ?? "").trim(), g = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${e}|${s}|${f}|${g}`;
    }
    const { data: a, meta: i } = o, n = t[a], l = t[i];
    if (!n || !l)
      return `missing|${e}|${s}|${a}|${i}`;
    const u = n.attributes ?? {}, p = l.attributes ?? {};
    return [
      a,
      i,
      e,
      s,
      ...Y.map((f) => S(u[f.key])),
      S(u.battery_discharge_power_w),
      s ? S(u.home_power_w) : "",
      ...nt.map((f) => S(p[f]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", _t);
export {
  _t as HubEnergieFlowCard
};
