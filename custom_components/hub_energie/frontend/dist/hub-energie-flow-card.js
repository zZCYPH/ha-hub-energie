import { i as B, a as W, A as g, w as $, b as v, I as L } from "./i18n.js";
import { C as j, a as F, c as P, b as X, e as K } from "./colors.js";
const A = Object.freeze({
  grid: P,
  solar: F,
  home: "var(--primary-color, #03a9f4)",
  battery: j,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function V(o) {
  return o === "home" ? 28 : 22;
}
function N(o, t, r) {
  const e = Number(t), i = Number(r), a = Number.isFinite(e) ? e : 2, s = Number.isFinite(i) ? i : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${o};stroke-width:${a}px;opacity:${s}`;
}
class q extends B {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
  };
  static styles = W`
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
    .edge-flow {
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .edge-flow {
      stroke-dasharray: 7 6;
    }
    .edge-flow.edge-flow--ghost {
      stroke-dasharray: 3 7;
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
    @keyframes flow-dash {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: -26;
      }
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
      .edge-flow {
        animation: none !important;
      }
      .edge-base,
      .edge-glow,
      .edge-flow {
        transition: none !important;
      }
      .node-halo--live {
        animation: none !important;
      }
    }
  `;
  constructor() {
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this._surfaceId = `he-fs-${Math.random().toString(36).slice(2, 10)}`, this._gridPatId = `he-fg-${Math.random().toString(36).slice(2, 10)}`;
  }
  render() {
    const t = this.data;
    if (!t) return g;
    const r = Object.values(t.nodes).filter(Boolean), e = this.debug || this.layout !== "compact", i = this.debug || this.layout !== "compact", a = this.i18n.flowCardTitle ?? "Live power flows";
    return v`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${a}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${$`
          <defs>
            <linearGradient id=${this._surfaceId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"></stop>
              <stop offset="55%" stop-color="#ffffff" stop-opacity="0"></stop>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.18"></stop>
            </linearGradient>
            <pattern
              id=${this._gridPatId}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <circle class="backdrop-grid" cx="1.5" cy="1.5" r="0.9" fill="currentColor"></circle>
            </pattern>
          </defs>
          <g style="color:var(--divider-color,#5c5c5c)">
            <rect
              class="backdrop"
              x="6"
              y="6"
              width="388"
              height="228"
              rx="26"
              fill="var(--card-background-color,#1e1e1e)"
              fill-opacity="0.94"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="228"
              rx="26"
              fill=${`url(#${this._gridPatId})`}
              pointer-events="none"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="228"
              rx="26"
              fill=${`url(#${this._surfaceId})`}
              pointer-events="none"
            ></rect>
            <rect
              class="backdrop"
              x="6"
              y="6"
              width="388"
              height="228"
              rx="26"
              fill="none"
            ></rect>
          </g>
        `}
        ${t.edges.map((s) => this._renderEdge(s, e))}
        ${r.map((s) => this._renderNode(s, i))}
      </svg>
    `;
  }
  _renderEdge(t, r) {
    if (!t.visible) return g;
    const e = t.color, i = Number(t.width), a = Number(t.opacity), s = Number(t.duration), n = Number.isFinite(i) ? i : 2.4, l = Number.isFinite(a) ? a : 0.96, d = Number.isFinite(s) && s > 0 ? s : 2.5, p = !!t.ghost, u = p ? 0.14 : 0.26, h = p ? 0.06 : 0.11, b = p ? 0.55 : 1, f = N(e, n + 2, l * u), k = N(e, n + 5, l * h), w = p ? "none" : `flow-dash ${d}s linear infinite`, y = p ? "edge-flow edge-flow--ghost" : "edge-flow", x = `${N(e, n, l * b)};animation:${w}`;
    return $`
      <g>
        <path class="edge-base" d=${t.path} style=${f}></path>
        <path class="edge-glow" d=${t.path} style=${k}></path>
        <path class=${y} d=${t.path} style=${x}></path>
        ${r && t.label ? $`<text
              class="edge-label"
              x=${t.labelX}
              y=${t.labelY}
              style="fill:var(--primary-text-color,#e0e0e0)"
            >
              ${t.label}
            </text>` : g}
      </g>
    `;
  }
  _renderNode(t, r) {
    const e = V(t.kind), i = A[t.kind] ?? A.neutral, a = t.muted ? "node-muted" : "", s = r && t.detail ? t.detail : null, n = t.status === "idle" || t.status === "unknown", d = !n && t.pulse ? "node-halo node-halo--live" : "node-halo", p = n ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${i};stroke-opacity:0.35;stroke-width:1.5`, u = n ? "fill:var(--disabled-text-color,#9e9e9e);fill-opacity:0.08;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.5;stroke-width:1.5" : `fill:${i};fill-opacity:0.08;stroke:${i};stroke-opacity:0.55;stroke-width:1.5`, h = n ? "fill:var(--card-background-color,#121212);fill-opacity:0.55;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.35;stroke-width:1" : `fill:var(--card-background-color,#121212);fill-opacity:0.35;stroke:${i};stroke-opacity:0.65;stroke-width:1.2`, b = n ? "fill:#ffffff;fill-opacity:0.04" : `fill:${i};fill-opacity:0.14`, f = a === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", k = "fill:var(--secondary-text-color,#b0b0b0)", w = t.kind === "home", y = e + (w ? 22 : 18), x = e + (w ? 40 : 32), z = e + (w ? 56 : 46);
    return $`
      <g transform="translate(${t.x} ${t.y})">
        <circle class=${d} r=${e + 14} style=${p}></circle>
        <circle class="node-ring ${t.status}" r=${e + 5} style=${u}></circle>
        <circle class="node-core" r=${e} style=${h}></circle>
        <circle cx="0" cy=${-e * 0.35} r=${e * 0.42} style=${b}></circle>
        <text class="node-icon ${a}" x="0" y="1" style=${f}>${t.icon}</text>
        <text class="node-label ${a}" x="0" y=${y} style=${f}>${t.label}</text>
        ${t.value ? $`<text class="node-value ${a}" x="0" y=${x} style=${f}>${t.value}</text>` : g}
        ${s ? $`<text class="node-detail ${a}" x="0" y=${z} style=${k}>${s}</text>` : g}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", q);
const J = "sensor.hub_energie_";
function Q(o = J) {
  const t = o;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function I(o, t) {
  if (!o || typeof o != "object") return null;
  const r = (l) => typeof l == "string" ? l.trim() : "", e = r(t?.frontend_data_entity), i = r(t?.frontend_meta_entity), a = (l, d) => {
    if (!l || !d) return null;
    const p = o[l], u = o[d];
    return p && u ? { data: l, meta: d } : null;
  };
  if (e && i) {
    const l = a(e, i);
    if (l) return l;
  }
  const s = Q();
  let n = a(s.frontendData, s.frontendMeta);
  return n || (n = a("sensor.frontend_data", "sensor.frontend_meta"), n) ? n : null;
}
function Y(o, t) {
  const r = String(o ?? "").toLowerCase();
  return r.includes("blue") || r.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : r.includes("white") || r.includes("blanc") ? t?.tempoDayWhite ?? "White" : r.includes("red") || r.includes("rouge") ? t?.tempoDayRed ?? "Red" : r === "n/a" ? t?.dayColorNA ?? "N/A" : r || (t?.emDash ?? "—");
}
function Z(o, t, r) {
  const e = o?.[t]?.attributes?.[r];
  if (e == null || e === "") return null;
  const i = Number(e);
  return Number.isFinite(i) ? i : null;
}
function _(o) {
  const t = Number(o);
  if (!Number.isFinite(t)) return "—";
  const r = Math.abs(t);
  return r >= 1e3 ? `${(t / 1e3).toFixed(r >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
const M = "custom:hub-energie-flow-card", tt = 520, S = 5, et = 20, ot = 32, O = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: F,
    path: "M200 58 C200 78 200 100 200 114",
    labelX: 212,
    labelY: 100
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: j,
    path: "M316 132 C290 132 258 132 232 132",
    labelX: 274,
    labelY: 118
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: P,
    path: "M84 132 C110 132 142 132 170 132",
    labelX: 126,
    labelY: 118
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: F,
    path: "M214 54 C250 64 286 84 316 108",
    labelX: 278,
    labelY: 82
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: X,
    path: "M84 148 C146 194 252 194 316 148",
    labelX: 208,
    labelY: 200
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: K,
    path: "M186 54 C150 64 114 84 84 108",
    labelX: 122,
    labelY: 82
  }
]), rt = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], at = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], it = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function st(o) {
  return o === !0 || o === "true";
}
function lt(o) {
  return o === "compact" || o === "full" ? o : "auto";
}
function E(o) {
  return Array.isArray(o) ? o.join(",") : o == null ? "" : String(o);
}
function T(o) {
  return o.every((t) => t != null) ? o.reduce((t, r) => t + r, 0) : null;
}
function nt(o, t) {
  if (o == null) return 0;
  const r = Math.abs(o);
  return t ? r > 0 ? 0.96 : 0.18 : r < S ? 0 : r < et ? 0.2 : 0.96;
}
function ct(o) {
  const t = Math.max(0, Math.abs(Number(o) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function dt(o) {
  const t = Math.max(0, Math.abs(Number(o) || 0)), r = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, r));
}
function ut(o) {
  const t = String(o ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function pt(o, t, r, e) {
  return t === "unknown" ? { value: "?", detail: o.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: o.flowBatteryIdle, muted: !0 } : e > 0 ? { value: _(e), detail: o.flowBatteryCharging, muted: !1 } : r > 0 ? { value: _(r), detail: o.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function ft(o, t, r, e, i) {
  const a = Object.fromEntries(
    O.map((c) => [c.key, t[c.key] ?? null])
  );
  a.battery_discharge_power_w = t.battery_discharge_power_w ?? null, a.home_power_w = t.home_power_w ?? null;
  const s = O.map((c) => {
    const m = a[c.key], D = nt(m, i), R = m == null ? 0 : Math.abs(Number(m) || 0), U = m != null && R >= S ? _(m) : null, H = !!(i && m != null && R < S);
    return {
      ...c,
      value: m,
      visible: i ? m != null : D > 0,
      opacity: D,
      width: ct(m),
      duration: dt(m),
      label: U,
      ghost: H
    };
  }), n = Object.fromEntries(s.map((c) => [c.key, c])), l = T(rt.map((c) => a[c])), d = T([
    a.solar_to_home_power_w,
    a.solar_to_battery_power_w,
    a.solar_export_power_w
  ]), u = T([
    a.grid_to_home_power_w,
    a.grid_to_battery_power_w,
    a.solar_export_power_w
  ]) == null ? null : a.grid_to_home_power_w + a.grid_to_battery_power_w - a.solar_export_power_w, h = r.battery_configured === !0, b = at.map((c) => a[c]).filter((c) => c != null);
  let f = "absent";
  h && (b.length === 0 ? f = "unknown" : b.some((c) => Math.abs(c) >= 0.5) ? f = "active" : f = "idle");
  const k = (a.solar_to_battery_power_w ?? 0) + (a.grid_to_battery_power_w ?? 0), w = a.battery_to_home_power_w ?? a.battery_discharge_power_w ?? 0, y = pt(o, f, w, k), x = (c) => c != null && Math.abs(c) >= S, z = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: o.flowNodeGrid,
      value: u != null ? _(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: 132,
      pulse: x(u)
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: o.flowNodeSolar,
      value: d != null ? _(d) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: ot,
      pulse: x(d)
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: o.flowNodeHome,
      value: l != null ? _(l) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: 132,
      pulse: x(l)
    },
    battery: h ? {
      kind: "battery",
      icon: f === "unknown" ? "?" : "B",
      label: o.flowNodeBattery,
      value: y.value,
      detail: y.detail,
      muted: y.muted,
      status: f,
      x: 344,
      y: 132,
      pulse: f === "active"
    } : null
  }, C = a.home_power_w, G = i && l != null && C != null ? {
    expected: l,
    reported: C,
    delta: C - l,
    tolerance: Math.max(25, Math.abs(C) * 0.04)
  } : null;
  return {
    layout: e,
    debug: i,
    nodes: z,
    edges: s,
    edgeMap: n,
    meta: {
      currentSlot: r.current_slot ?? null,
      todayColor: r.today_color ?? null,
      tomorrowColor: r.tomorrow_color ?? null,
      inputStatus: r.input_status ?? null
    },
    mismatch: G
  };
}
class ht extends B {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
  };
  static styles = W`
    :host {
      display: block;
    }
    ha-card {
      overflow: hidden;
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
    super(), this.hass = void 0, this._config = { type: M }, this._autoCompact = !1, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null;
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
    this._config = t && typeof t == "object" ? { ...t, type: M } : { type: M }, this._lastFp = null, this.requestUpdate();
  }
  getCardSize() {
    return 5;
  }
  getGridOptions() {
    const t = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(t) ? Math.max(1, Math.min(3, Math.trunc(t))) : 1) * 12,
      min_columns: 3,
      rows: 5,
      min_rows: 3
    };
  }
  static getConfigElement() {
    return document.createElement("hub-energie-flow-card-editor");
  }
  static getStubConfig() {
    return {
      type: M,
      layout: "auto",
      grid_span: 1
    };
  }
  shouldUpdate(t) {
    if (t.has("hass") && t.size === 1) {
      const r = this._stateFingerprint();
      return r !== null && r === this._lastFp ? !1 : (this._lastFp = r, !0);
    }
    return !0;
  }
  render() {
    const t = this._i18n(), r = this._resolvedLayout(), e = this._viewModel(t, r), i = this._debugEnabled();
    if (!e.ready)
      return v`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const a = e.model.mismatch && Math.abs(e.model.mismatch.delta) > e.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", _(e.model.mismatch.expected)).replace("{reported}", _(e.model.mismatch.reported)).replace("{delta}", _(e.model.mismatch.delta)) : null, s = [];
    return e.model.meta.currentSlot && s.push(`${t.flowMetaSlot}: ${e.model.meta.currentSlot}`), e.model.meta.todayColor && s.push(`${t.flowMetaToday}: ${Y(e.model.meta.todayColor, t)}`), e.model.meta.tomorrowColor && s.push(`${t.flowMetaTomorrow}: ${Y(e.model.meta.tomorrowColor, t)}`), e.model.meta.inputStatus && e.model.meta.inputStatus !== "ok" && s.push(`${t.flowMetaInputStatus}: ${ut(e.model.meta.inputStatus)}`), v`
      <ha-card class=${i ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            ${i ? v`<span class="badge">${t.flowDebugBadge}</span>` : g}
          </div>
          ${a ? v`<div class="warning">${a}</div>` : g}
          <hub-power-flow-diagram
            .data=${e.model}
            .i18n=${t}
            .layout=${r}
            .debug=${i}
          ></hub-power-flow-diagram>
          ${s.length ? v`
                <div class="meta">
                  ${s.map((n) => v`
                    <span class="chip ${n.includes(t.flowMetaInputStatus) ? "alert" : ""}">${n}</span>
                  `)}
                </div>
              ` : g}
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
      const t = this.offsetWidth > 0 && this.offsetWidth < tt;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? L.en : L.fr;
  }
  _debugEnabled() {
    return st(this._config?.debug);
  }
  _resolvedLayout() {
    const t = lt(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, r) {
    const e = this.hass?.states, i = I(e, this._config);
    if (!i)
      return { ready: !1, model: null };
    const { data: a, meta: s } = i, n = e[a], l = e[s];
    if (!n || !l)
      return { ready: !1, model: null };
    n.attributes;
    const d = l.attributes ?? {}, p = Object.fromEntries(
      [
        ...O.map((u) => u.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((u) => [u, Z(e, a, u)])
    );
    return {
      ready: !0,
      model: ft(t, p, d, r, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const r = I(t, this._config), e = this._resolvedLayout(), i = this._debugEnabled();
    if (!r) {
      const h = String(this._config?.frontend_data_entity ?? "").trim(), b = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${e}|${i}|${h}|${b}`;
    }
    const { data: a, meta: s } = r, n = t[a], l = t[s];
    if (!n || !l)
      return `missing|${e}|${i}|${a}|${s}`;
    const d = n.attributes ?? {}, p = l.attributes ?? {};
    return [
      a,
      s,
      e,
      i,
      ...O.map((h) => E(d[h.key])),
      E(d.battery_discharge_power_w),
      i ? E(d.home_power_w) : "",
      ...it.map((h) => E(p[h]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", ht);
export {
  ht as HubEnergieFlowCard
};
