import { i as G, a as Y, w as y, A as _, b as w, I as F } from "./i18n.js";
import { C as A, a as T, c as B, b as I, e as U } from "./colors.js";
const D = Object.freeze({
  grid: B,
  solar: T,
  home: "var(--primary-color, #03a9f4)",
  battery: A,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function P(e) {
  return e === "home" ? 28 : 22;
}
function O(e, t, o) {
  const r = Number(t), s = Number(o), a = Number.isFinite(r) ? r : 2, i = Number.isFinite(s) ? s : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${e};stroke-width:${a}px;opacity:${i}`;
}
class H extends G {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
  };
  static styles = Y`
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this._gid = Math.random().toString(36).slice(2, 10);
  }
  _renderDefs() {
    const t = this._gid;
    return y`
      <defs>
        <linearGradient id="hub-${t}-panel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#353535" stop-opacity="0.88"></stop>
          <stop offset="55%" stop-color="#1c1c1c" stop-opacity="0.94"></stop>
          <stop offset="100%" stop-color="#0f0f0f" stop-opacity="1"></stop>
        </linearGradient>
        <pattern id="hub-${t}-grain" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="7" r="0.55" fill="#ffffff" opacity="0.04"></circle>
          <circle cx="15" cy="4" r="0.45" fill="#ffffff" opacity="0.03"></circle>
          <circle cx="11" cy="16" r="0.4" fill="#ffffff" opacity="0.025"></circle>
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
    if (!t) return _;
    const o = Object.values(t.nodes).filter(Boolean), r = this.debug || this.layout !== "compact", s = this.debug || this.layout !== "compact", a = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return w`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${a}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${y`
          <rect
            x="10"
            y="12"
            width="380"
            height="216"
            rx="22"
            fill="url(#hub-${i}-panel)"
            stroke="#666666"
            stroke-opacity="0.45"
            stroke-width="1"
          ></rect>
          <rect x="10" y="12" width="380" height="216" rx="22" fill="url(#hub-${i}-grain)"></rect>
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
        ${t.edges.map((l) => this._renderEdge(l, r))}
        ${o.map((l) => this._renderNode(l, s))}
      </svg>
    `;
  }
  _renderEdge(t, o) {
    if (!t.visible) return _;
    const r = t.color, s = Number(t.width), a = Number(t.opacity), i = Number(t.duration), l = Number.isFinite(s) ? s : 2.4, n = Number.isFinite(a) ? a : 0.96, c = Number.isFinite(i) && i > 0 ? i : 2.5, f = O(r, l + 2, n * 0.26), u = O(r, l + 5, n * 0.11), p = `${O(r, l, n)};stroke-dasharray:7 6;animation:flow-dash ${c}s linear infinite`;
    return y`
      <g>
        <path class="edge-base" d=${t.path} style=${f}></path>
        <path class="edge-glow" d=${t.path} style=${u}></path>
        <path class="edge-flow" d=${t.path} style=${p}></path>
        ${o && t.label ? y`<text
              class="edge-label"
              x=${t.labelX}
              y=${t.labelY}
              style="fill:var(--primary-text-color,#e0e0e0)"
            >
              ${t.label}
            </text>` : _}
      </g>
    `;
  }
  _renderNode(t, o) {
    const r = P(t.kind), s = D[t.kind] ?? D.neutral, a = t.muted ? "node-muted" : "", i = o && t.detail ? t.detail : null, l = t.status === "idle" || t.status === "unknown", n = this._gid, c = l ? `url(#hub-${n}-core-idle)` : `url(#hub-${n}-core-${t.kind})`, f = l ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, u = `fill:${c};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, p = a === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", g = "fill:var(--secondary-text-color,#b0b0b0)", h = t.kind === "home", E = r + (h ? 20 : 14), M = r + (h ? 38 : 24), x = r + (h ? 54 : 40);
    return y`
      <g transform="translate(${t.x} ${t.y})">
        <circle class="node-ring ${t.status}" r=${r + 6} style=${f}></circle>
        <circle class="node-core" r=${r} style=${u}></circle>
        <text class="node-icon ${a}" x="0" y="1" style=${p}>${t.icon}</text>
        <text class="node-label ${a}" x="0" y=${E} style=${p}>${t.label}</text>
        ${t.value ? y`<text class="node-value ${a}" x="0" y=${M} style=${p}>${t.value}</text>` : _}
        ${i ? y`<text class="node-detail ${a}" x="0" y=${x} style=${g}>${i}</text>` : _}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", H);
const X = "sensor.hub_energie_";
function K(e = X) {
  const t = e;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function R(e, t) {
  if (!e || typeof e != "object") return null;
  const o = (n) => typeof n == "string" ? n.trim() : "", r = o(t?.frontend_data_entity), s = o(t?.frontend_meta_entity), a = (n, c) => {
    if (!n || !c) return null;
    const f = e[n], u = e[c];
    return f && u ? { data: n, meta: c } : null;
  };
  if (r && s) {
    const n = a(r, s);
    if (n) return n;
  }
  const i = K();
  let l = a(i.frontendData, i.frontendMeta);
  return l || (l = a("sensor.frontend_data", "sensor.frontend_meta"), l) ? l : null;
}
function L(e, t) {
  const o = String(e ?? "").toLowerCase();
  return o.includes("blue") || o.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : o.includes("white") || o.includes("blanc") ? t?.tempoDayWhite ?? "White" : o.includes("red") || o.includes("rouge") ? t?.tempoDayRed ?? "Red" : o === "n/a" ? t?.dayColorNA ?? "N/A" : o || (t?.emDash ?? "—");
}
function V(e, t, o) {
  const r = e?.[t]?.attributes?.[o];
  if (r == null || r === "") return null;
  const s = Number(r);
  return Number.isFinite(s) ? s : null;
}
function m(e) {
  const t = Number(e);
  if (!Number.isFinite(t)) return "—";
  const o = Math.abs(t);
  return o >= 1e3 ? `${(t / 1e3).toFixed(o >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
const $ = "custom:hub-energie-flow-card", q = 520, J = 5, Q = 20, S = 140, Z = 48, C = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: T,
    path: "M200 78 C200 98 200 116 200 128",
    labelX: 200,
    labelY: 96
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: A,
    path: "M316 140 C290 140 258 140 232 140",
    labelX: 274,
    labelY: 128
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: B,
    path: "M84 140 C110 140 142 140 172 140",
    labelX: 126,
    labelY: 128
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: T,
    path: "M214 76 C252 88 290 108 316 128",
    labelX: 270,
    labelY: 88
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: I,
    path: "M84 156 C146 202 252 202 316 156",
    labelX: 200,
    labelY: 200
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: U,
    path: "M186 76 C148 88 110 108 84 128",
    labelX: 132,
    labelY: 88
  }
]), tt = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], et = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], ot = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status"
];
function rt(e) {
  return e === !0 || e === "true";
}
function at(e) {
  return e === "compact" || e === "full" ? e : "auto";
}
function k(e) {
  return Array.isArray(e) ? e.join(",") : e == null ? "" : String(e);
}
function z(e) {
  return e.every((t) => t != null) ? e.reduce((t, o) => t + o, 0) : null;
}
function st(e, t) {
  if (e == null) return 0;
  const o = Math.abs(e);
  return t ? o > 0 ? 0.96 : 0.18 : o < J ? 0 : o < Q ? 0.2 : 0.96;
}
function it(e) {
  const t = Math.max(0, Math.abs(Number(e) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function nt(e) {
  const t = Math.max(0, Math.abs(Number(e) || 0)), o = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, o));
}
function lt(e) {
  const t = String(e ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function ct(e, t, o, r) {
  return t === "unknown" ? { value: "?", detail: e.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: e.flowBatteryIdle, muted: !0 } : r > 0 ? { value: m(r), detail: e.flowBatteryCharging, muted: !1 } : o > 0 ? { value: m(o), detail: e.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function dt(e, t, o, r, s) {
  const a = Object.fromEntries(
    C.map((d) => [d.key, t[d.key] ?? null])
  );
  a.battery_discharge_power_w = t.battery_discharge_power_w ?? null, a.home_power_w = t.home_power_w ?? null;
  const i = C.map((d) => {
    const b = a[d.key], N = st(b, s);
    return {
      ...d,
      value: b,
      visible: s ? b != null : N > 0,
      opacity: N,
      width: it(b),
      duration: nt(b),
      label: b != null ? m(b) : null
    };
  }), l = Object.fromEntries(i.map((d) => [d.key, d])), n = z(tt.map((d) => a[d])), c = z([
    a.solar_to_home_power_w,
    a.solar_to_battery_power_w,
    a.solar_export_power_w
  ]), u = z([
    a.grid_to_home_power_w,
    a.grid_to_battery_power_w,
    a.solar_export_power_w
  ]) == null ? null : a.grid_to_home_power_w + a.grid_to_battery_power_w - a.solar_export_power_w, p = o.battery_configured === !0, g = et.map((d) => a[d]).filter((d) => d != null);
  let h = "absent";
  p && (g.length === 0 ? h = "unknown" : g.some((d) => Math.abs(d) >= 0.5) ? h = "active" : h = "idle");
  const E = (a.solar_to_battery_power_w ?? 0) + (a.grid_to_battery_power_w ?? 0), M = a.battery_to_home_power_w ?? a.battery_discharge_power_w ?? 0, x = ct(e, h, M, E), W = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: e.flowNodeGrid,
      value: u != null ? m(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: S
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: e.flowNodeSolar,
      value: c != null ? m(c) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: Z
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: e.flowNodeHome,
      value: n != null ? m(n) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: S
    },
    battery: p ? {
      kind: "battery",
      icon: h === "unknown" ? "?" : "B",
      label: e.flowNodeBattery,
      value: x.value,
      detail: x.detail,
      muted: x.muted,
      status: h,
      x: 344,
      y: S
    } : null
  }, v = a.home_power_w, j = s && n != null && v != null ? {
    expected: n,
    reported: v,
    delta: v - n,
    tolerance: Math.max(25, Math.abs(v) * 0.04)
  } : null;
  return {
    layout: r,
    debug: s,
    nodes: W,
    edges: i,
    edgeMap: l,
    meta: {
      currentSlot: o.current_slot ?? null,
      todayColor: o.today_color ?? null,
      tomorrowColor: o.tomorrow_color ?? null,
      inputStatus: o.input_status ?? null
    },
    mismatch: j
  };
}
class ut extends G {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
  };
  static styles = Y`
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
    super(), this.hass = void 0, this._config = { type: $ }, this._autoCompact = !1, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null;
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
    this._config = t && typeof t == "object" ? { ...t, type: $ } : { type: $ }, this._lastFp = null, this.requestUpdate();
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
      type: $,
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
    const t = this._i18n(), o = this._resolvedLayout(), r = this._viewModel(t, o), s = this._debugEnabled();
    if (!r.ready)
      return w`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const a = r.model.mismatch && Math.abs(r.model.mismatch.delta) > r.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", m(r.model.mismatch.expected)).replace("{reported}", m(r.model.mismatch.reported)).replace("{delta}", m(r.model.mismatch.delta)) : null, i = [];
    return r.model.meta.currentSlot && i.push(`${t.flowMetaSlot}: ${r.model.meta.currentSlot}`), r.model.meta.todayColor && i.push(`${t.flowMetaToday}: ${L(r.model.meta.todayColor, t)}`), r.model.meta.tomorrowColor && i.push(`${t.flowMetaTomorrow}: ${L(r.model.meta.tomorrowColor, t)}`), r.model.meta.inputStatus && r.model.meta.inputStatus !== "ok" && i.push(`${t.flowMetaInputStatus}: ${lt(r.model.meta.inputStatus)}`), w`
      <ha-card class=${s ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            ${s ? w`<span class="badge">${t.flowDebugBadge}</span>` : _}
          </div>
          ${a ? w`<div class="warning">${a}</div>` : _}
          <hub-power-flow-diagram
            .data=${r.model}
            .i18n=${t}
            .layout=${o}
            .debug=${s}
          ></hub-power-flow-diagram>
          ${i.length ? w`
                <div class="meta">
                  ${i.map((l) => w`
                    <span class="chip ${l.includes(t.flowMetaInputStatus) ? "alert" : ""}">${l}</span>
                  `)}
                </div>
              ` : _}
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
      const t = this.offsetWidth > 0 && this.offsetWidth < q;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? F.en : F.fr;
  }
  _debugEnabled() {
    return rt(this._config?.debug);
  }
  _resolvedLayout() {
    const t = at(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, o) {
    const r = this.hass?.states, s = R(r, this._config);
    if (!s)
      return { ready: !1, model: null };
    const { data: a, meta: i } = s, l = r[a], n = r[i];
    if (!l || !n)
      return { ready: !1, model: null };
    l.attributes;
    const c = n.attributes ?? {}, f = Object.fromEntries(
      [
        ...C.map((u) => u.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((u) => [u, V(r, a, u)])
    );
    return {
      ready: !0,
      model: dt(t, f, c, o, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const o = R(t, this._config), r = this._resolvedLayout(), s = this._debugEnabled();
    if (!o) {
      const p = String(this._config?.frontend_data_entity ?? "").trim(), g = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${r}|${s}|${p}|${g}`;
    }
    const { data: a, meta: i } = o, l = t[a], n = t[i];
    if (!l || !n)
      return `missing|${r}|${s}|${a}|${i}`;
    const c = l.attributes ?? {}, f = n.attributes ?? {};
    return [
      a,
      i,
      r,
      s,
      ...C.map((p) => k(c[p.key])),
      k(c.battery_discharge_power_w),
      s ? k(c.home_power_w) : "",
      ...ot.map((p) => k(f[p]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", ut);
export {
  ut as HubEnergieFlowCard
};
