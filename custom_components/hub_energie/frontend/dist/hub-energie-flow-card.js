import { i as j, a as I, w as v, A as g, b as $, I as A } from "./i18n.js";
import { C as U, a as R, c as H, b as K, e as V } from "./colors.js";
const Y = Object.freeze({
  grid: H,
  solar: R,
  home: "var(--primary-color, #03a9f4)",
  battery: U,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function q(o) {
  return o === "home" ? 28 : 22;
}
function T(o, t, r) {
  const e = Number(t), s = Number(r), a = Number.isFinite(e) ? e : 2, i = Number.isFinite(s) ? s : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${o};stroke-width:${a}px;opacity:${i}`;
}
class J extends j {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
  };
  static styles = I`
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1, this._gid = Math.random().toString(36).slice(2, 10);
  }
  _renderDefs() {
    const t = this._gid;
    return v`
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
    if (!t) return g;
    const r = Object.values(t.nodes).filter(Boolean), e = this.debug || this.layout !== "compact", s = this.debug || this.layout !== "compact", a = this.i18n.flowCardTitle ?? "Live power flows", i = this._gid;
    return $`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${a}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${this._renderDefs()}
        ${v`
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
              fill="url(#hub-${i}-grid)"
              pointer-events="none"
            ></rect>
            <rect
              x="6"
              y="6"
              width="388"
              height="228"
              rx="26"
              fill="url(#hub-${i}-surface)"
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
        ${t.edges.map((l) => this._renderEdge(l, e))}
        ${r.map((l) => this._renderNode(l, s))}
      </svg>
    `;
  }
  _renderEdge(t, r) {
    if (!t.visible) return g;
    const e = t.color, s = Number(t.width), a = Number(t.opacity), i = Number(t.duration), l = Number.isFinite(s) ? s : 2.4, n = Number.isFinite(a) ? a : 0.96, d = Number.isFinite(i) && i > 0 ? i : 2.5, p = !!t.ghost, u = p ? 0.14 : 0.26, f = p ? 0.06 : 0.11, y = p ? 0.55 : 1, h = T(e, l + 2, n * u), C = T(e, l + 5, n * f), w = p ? "none" : `flow-dash ${d}s linear infinite`, x = p ? "edge-flow edge-flow--ghost" : "edge-flow", _ = `${T(e, l, n * y)};animation:${w}`;
    return v`
      <g>
        <path class="edge-base" d=${t.path} style=${h}></path>
        <path class="edge-glow" d=${t.path} style=${C}></path>
        <path class=${x} d=${t.path} style=${_}></path>
        ${r && t.label ? v`<text
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
    const e = q(t.kind), s = Y[t.kind] ?? Y.neutral, a = t.muted ? "node-muted" : "", i = r && t.detail ? t.detail : null, l = t.status === "idle" || t.status === "unknown", d = !l && t.pulse ? "node-halo node-halo--live" : "node-halo", p = l ? "fill:none;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.22;stroke-width:1" : `fill:none;stroke:${s};stroke-opacity:0.35;stroke-width:1.5`, u = this._gid, f = l ? `url(#hub-${u}-core-idle)` : `url(#hub-${u}-core-${t.kind})`, y = l ? "fill:#757575;fill-opacity:0.1;stroke:#9e9e9e;stroke-opacity:0.5;stroke-width:1.75" : `fill:${s};fill-opacity:0.09;stroke:${s};stroke-opacity:0.75;stroke-width:1.75`, h = `fill:${f};stroke:#000000;stroke-opacity:0.22;stroke-width:1`, C = l ? "fill:#ffffff;fill-opacity:0.04" : `fill:${s};fill-opacity:0.14`, w = a === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", x = "fill:var(--secondary-text-color,#b0b0b0)", _ = t.kind === "home", z = e + (_ ? 20 : 14), k = e + (_ ? 38 : 24), N = e + (_ ? 54 : 40);
    return v`
      <g transform="translate(${t.x} ${t.y})">
        <circle class=${d} r=${e + 14} style=${p}></circle>
        <circle class="node-ring ${t.status}" r=${e + 5} style=${y}></circle>
        <circle class="node-core" r=${e} style=${h}></circle>
        <circle cx="0" cy=${-e * 0.35} r=${e * 0.42} style=${C}></circle>
        <text class="node-icon ${a}" x="0" y="1" style=${w}>${t.icon}</text>
        <text class="node-label ${a}" x="0" y=${z} style=${w}>${t.label}</text>
        ${t.value ? v`<text class="node-value ${a}" x="0" y=${k} style=${w}>${t.value}</text>` : g}
        ${i ? v`<text class="node-detail ${a}" x="0" y=${N} style=${x}>${i}</text>` : g}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", J);
const Q = "sensor.hub_energie_";
function Z(o = Q) {
  const t = o;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function B(o, t) {
  if (!o || typeof o != "object") return null;
  const r = (n) => typeof n == "string" ? n.trim() : "", e = r(t?.frontend_data_entity), s = r(t?.frontend_meta_entity), a = (n, d) => {
    if (!n || !d) return null;
    const p = o[n], u = o[d];
    return p && u ? { data: n, meta: d } : null;
  };
  if (e && s) {
    const n = a(e, s);
    if (n) return n;
  }
  const i = Z();
  let l = a(i.frontendData, i.frontendMeta);
  return l || (l = a("sensor.frontend_data", "sensor.frontend_meta"), l) ? l : null;
}
function W(o, t) {
  const r = String(o ?? "").toLowerCase();
  return r.includes("blue") || r.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : r.includes("white") || r.includes("blanc") ? t?.tempoDayWhite ?? "White" : r.includes("red") || r.includes("rouge") ? t?.tempoDayRed ?? "Red" : r === "n/a" ? t?.dayColorNA ?? "N/A" : r || (t?.emDash ?? "—");
}
function tt(o, t, r) {
  const e = o?.[t]?.attributes?.[r];
  if (e == null || e === "") return null;
  const s = Number(e);
  return Number.isFinite(s) ? s : null;
}
function b(o) {
  const t = Number(o);
  if (!Number.isFinite(t)) return "—";
  const r = Math.abs(t);
  return r >= 1e3 ? `${(t / 1e3).toFixed(r >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
const M = "custom:hub-energie-flow-card", et = 520, S = 5, ot = 20, F = 140, rt = 48, O = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: R,
    path: "M200 78 C200 98 200 116 200 128",
    labelX: 200,
    labelY: 96
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: U,
    path: "M316 140 C290 140 258 140 232 140",
    labelX: 274,
    labelY: 128
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: H,
    path: "M84 140 C110 140 142 140 172 140",
    labelX: 126,
    labelY: 128
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: R,
    path: "M214 76 C252 88 290 108 316 128",
    labelX: 270,
    labelY: 88
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: K,
    path: "M84 156 C146 202 252 202 316 156",
    labelX: 200,
    labelY: 200
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: V,
    path: "M186 76 C148 88 110 108 84 128",
    labelX: 132,
    labelY: 88
  }
]), at = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], st = [
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
function lt(o) {
  return o === !0 || o === "true";
}
function nt(o) {
  return o === "compact" || o === "full" ? o : "auto";
}
function E(o) {
  return Array.isArray(o) ? o.join(",") : o == null ? "" : String(o);
}
function D(o) {
  return o.every((t) => t != null) ? o.reduce((t, r) => t + r, 0) : null;
}
function ct(o, t) {
  if (o == null) return 0;
  const r = Math.abs(o);
  return t ? r > 0 ? 0.96 : 0.18 : r < S ? 0 : r < ot ? 0.2 : 0.96;
}
function dt(o) {
  const t = Math.max(0, Math.abs(Number(o) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function ut(o) {
  const t = Math.max(0, Math.abs(Number(o) || 0)), r = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, r));
}
function pt(o) {
  const t = String(o ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function ft(o, t, r, e) {
  return t === "unknown" ? { value: "?", detail: o.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: o.flowBatteryIdle, muted: !0 } : e > 0 ? { value: b(e), detail: o.flowBatteryCharging, muted: !1 } : r > 0 ? { value: b(r), detail: o.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function ht(o, t, r, e, s) {
  const a = Object.fromEntries(
    O.map((c) => [c.key, t[c.key] ?? null])
  );
  a.battery_discharge_power_w = t.battery_discharge_power_w ?? null, a.home_power_w = t.home_power_w ?? null;
  const i = O.map((c) => {
    const m = a[c.key], L = ct(m, s), G = m == null ? 0 : Math.abs(Number(m) || 0), P = m != null && G >= S ? b(m) : null, X = !!(s && m != null && G < S);
    return {
      ...c,
      value: m,
      visible: s ? m != null : L > 0,
      opacity: L,
      width: dt(m),
      duration: ut(m),
      label: P,
      ghost: X
    };
  }), l = Object.fromEntries(i.map((c) => [c.key, c])), n = D(at.map((c) => a[c])), d = D([
    a.solar_to_home_power_w,
    a.solar_to_battery_power_w,
    a.solar_export_power_w
  ]), u = D([
    a.grid_to_home_power_w,
    a.grid_to_battery_power_w,
    a.solar_export_power_w
  ]) == null ? null : a.grid_to_home_power_w + a.grid_to_battery_power_w - a.solar_export_power_w, f = r.battery_configured === !0, y = st.map((c) => a[c]).filter((c) => c != null);
  let h = "absent";
  f && (y.length === 0 ? h = "unknown" : y.some((c) => Math.abs(c) >= 0.5) ? h = "active" : h = "idle");
  const C = (a.solar_to_battery_power_w ?? 0) + (a.grid_to_battery_power_w ?? 0), w = a.battery_to_home_power_w ?? a.battery_discharge_power_w ?? 0, x = ft(o, h, w, C), _ = (c) => c != null && Math.abs(c) >= S, z = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: o.flowNodeGrid,
      value: u != null ? b(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: F,
      pulse: _(u)
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: o.flowNodeSolar,
      value: d != null ? b(d) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: rt,
      pulse: _(d)
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: o.flowNodeHome,
      value: n != null ? b(n) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: F,
      pulse: _(n)
    },
    battery: f ? {
      kind: "battery",
      icon: h === "unknown" ? "?" : "B",
      label: o.flowNodeBattery,
      value: x.value,
      detail: x.detail,
      muted: x.muted,
      status: h,
      x: 344,
      y: F,
      pulse: h === "active"
    } : null
  }, k = a.home_power_w, N = s && n != null && k != null ? {
    expected: n,
    reported: k,
    delta: k - n,
    tolerance: Math.max(25, Math.abs(k) * 0.04)
  } : null;
  return {
    layout: e,
    debug: s,
    nodes: z,
    edges: i,
    edgeMap: l,
    meta: {
      currentSlot: r.current_slot ?? null,
      todayColor: r.today_color ?? null,
      tomorrowColor: r.tomorrow_color ?? null,
      inputStatus: r.input_status ?? null
    },
    mismatch: N
  };
}
class mt extends j {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
  };
  static styles = I`
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
    const t = this._i18n(), r = this._resolvedLayout(), e = this._viewModel(t, r), s = this._debugEnabled();
    if (!e.ready)
      return $`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const a = e.model.mismatch && Math.abs(e.model.mismatch.delta) > e.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", b(e.model.mismatch.expected)).replace("{reported}", b(e.model.mismatch.reported)).replace("{delta}", b(e.model.mismatch.delta)) : null, i = [];
    return e.model.meta.currentSlot && i.push(`${t.flowMetaSlot}: ${e.model.meta.currentSlot}`), e.model.meta.todayColor && i.push(`${t.flowMetaToday}: ${W(e.model.meta.todayColor, t)}`), e.model.meta.tomorrowColor && i.push(`${t.flowMetaTomorrow}: ${W(e.model.meta.tomorrowColor, t)}`), e.model.meta.inputStatus && e.model.meta.inputStatus !== "ok" && i.push(`${t.flowMetaInputStatus}: ${pt(e.model.meta.inputStatus)}`), $`
      <ha-card class=${s ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            ${s ? $`<span class="badge">${t.flowDebugBadge}</span>` : g}
          </div>
          ${a ? $`<div class="warning">${a}</div>` : g}
          <hub-power-flow-diagram
            .data=${e.model}
            .i18n=${t}
            .layout=${r}
            .debug=${s}
          ></hub-power-flow-diagram>
          ${i.length ? $`
                <div class="meta">
                  ${i.map((l) => $`
                    <span class="chip ${l.includes(t.flowMetaInputStatus) ? "alert" : ""}">${l}</span>
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
      const t = this.offsetWidth > 0 && this.offsetWidth < et;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? A.en : A.fr;
  }
  _debugEnabled() {
    return lt(this._config?.debug);
  }
  _resolvedLayout() {
    const t = nt(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, r) {
    const e = this.hass?.states, s = B(e, this._config);
    if (!s)
      return { ready: !1, model: null };
    const { data: a, meta: i } = s, l = e[a], n = e[i];
    if (!l || !n)
      return { ready: !1, model: null };
    l.attributes;
    const d = n.attributes ?? {}, p = Object.fromEntries(
      [
        ...O.map((u) => u.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((u) => [u, tt(e, a, u)])
    );
    return {
      ready: !0,
      model: ht(t, p, d, r, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const r = B(t, this._config), e = this._resolvedLayout(), s = this._debugEnabled();
    if (!r) {
      const f = String(this._config?.frontend_data_entity ?? "").trim(), y = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${e}|${s}|${f}|${y}`;
    }
    const { data: a, meta: i } = r, l = t[a], n = t[i];
    if (!l || !n)
      return `missing|${e}|${s}|${a}|${i}`;
    const d = l.attributes ?? {}, p = n.attributes ?? {};
    return [
      a,
      i,
      e,
      s,
      ...O.map((f) => E(d[f.key])),
      E(d.battery_discharge_power_w),
      s ? E(d.home_power_w) : "",
      ...it.map((f) => E(p[f]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", mt);
export {
  mt as HubEnergieFlowCard
};
