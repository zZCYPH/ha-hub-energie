import { i as R, a as L, A as _, w as y, b as w, I as N } from "./i18n.js";
import { C as A, a as S, c as Y, b as I, e as G } from "./colors.js";
const T = Object.freeze({
  grid: Y,
  solar: S,
  home: "var(--primary-color, #03a9f4)",
  battery: A,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function H(e) {
  return e === "home" ? 28 : 22;
}
function M(e, t, r) {
  const o = Number(t), i = Number(r), a = Number.isFinite(o) ? o : 2, n = Number.isFinite(i) ? i : 1;
  return `fill:none;stroke-linecap:round;stroke-linejoin:round;stroke:${e};stroke-width:${a}px;opacity:${n}`;
}
class P extends R {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
  };
  static styles = L`
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
      fill: var(--card-background-color, #1e1e1e);
      fill-opacity: 0.92;
      stroke: var(--divider-color, #3d3d3d);
      stroke-opacity: 0.65;
      stroke-width: 1;
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
    super(), this.data = null, this.i18n = {}, this.layout = "full", this.debug = !1;
  }
  render() {
    const t = this.data;
    if (!t) return _;
    const r = Object.values(t.nodes).filter(Boolean), o = this.debug || this.layout !== "compact", i = this.debug || this.layout !== "compact", a = "fill:var(--card-background-color,#1e1e1e);fill-opacity:0.92;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.65;stroke-width:1", n = this.i18n.flowCardTitle ?? "Live power flows";
    return w`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label=${n}
        style="display:block;width:100%;max-width:100%;height:auto;min-height:200px"
      >
        ${y`
          <rect
            class="backdrop"
            style=${a}
            x="6"
            y="6"
            width="388"
            height="228"
            rx="26"
          ></rect>
        `}
        ${t.edges.map((s) => this._renderEdge(s, o))}
        ${r.map((s) => this._renderNode(s, i))}
      </svg>
    `;
  }
  _renderEdge(t, r) {
    if (!t.visible) return _;
    const o = t.color, i = Number(t.width), a = Number(t.opacity), n = Number(t.duration), s = Number.isFinite(i) ? i : 2.4, l = Number.isFinite(a) ? a : 0.96, d = Number.isFinite(n) && n > 0 ? n : 2.5, h = M(o, s + 2, l * 0.26), u = M(o, s + 5, l * 0.11), m = `${M(o, s, l)};stroke-dasharray:7 6;animation:flow-dash ${d}s linear infinite`;
    return y`
      <g>
        <path class="edge-base" d=${t.path} style=${h}></path>
        <path class="edge-glow" d=${t.path} style=${u}></path>
        <path class="edge-flow" d=${t.path} style=${m}></path>
        ${r && t.label ? y`<text
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
  _renderNode(t, r) {
    const o = H(t.kind), i = T[t.kind] ?? T.neutral, a = t.muted ? "node-muted" : "", n = r && t.detail ? t.detail : null, s = t.status === "idle" || t.status === "unknown", l = s ? "fill:var(--disabled-text-color,#9e9e9e);fill-opacity:0.12;stroke:var(--disabled-text-color,#9e9e9e);stroke-opacity:0.65;stroke-width:2" : `fill:${i};fill-opacity:0.12;stroke:${i};stroke-opacity:0.82;stroke-width:2`, d = s ? "fill:var(--disabled-text-color,#9e9e9e);fill-opacity:0.14;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.45;stroke-width:1" : `fill:${i};fill-opacity:0.2;stroke:var(--divider-color,#3d3d3d);stroke-opacity:0.42;stroke-width:1`, h = a === "node-muted" ? "fill:var(--disabled-text-color,#9e9e9e)" : "fill:var(--primary-text-color,#e0e0e0)", u = "fill:var(--secondary-text-color,#b0b0b0)", m = t.kind === "home", g = o + (m ? 20 : 16), f = o + (m ? 38 : 30), C = o + (m ? 54 : 44);
    return y`
      <g transform="translate(${t.x} ${t.y})">
        <circle class="node-ring ${t.status}" r=${o + 6} style=${l}></circle>
        <circle class="node-core" r=${o} style=${d}></circle>
        <text class="node-icon ${a}" x="0" y="1" style=${h}>${t.icon}</text>
        <text class="node-label ${a}" x="0" y=${g} style=${h}>${t.label}</text>
        ${t.value ? y`<text class="node-value ${a}" x="0" y=${f} style=${h}>${t.value}</text>` : _}
        ${n ? y`<text class="node-detail ${a}" x="0" y=${C} style=${u}>${n}</text>` : _}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", P);
const U = "sensor.hub_energie_";
function X(e = U) {
  const t = e;
  return {
    frontendData: `${t}frontend_data`,
    frontendMeta: `${t}frontend_meta`
  };
}
function F(e, t) {
  if (!e || typeof e != "object") return null;
  const r = (l) => typeof l == "string" ? l.trim() : "", o = r(t?.frontend_data_entity), i = r(t?.frontend_meta_entity), a = (l, d) => {
    if (!l || !d) return null;
    const h = e[l], u = e[d];
    return h && u ? { data: l, meta: d } : null;
  };
  if (o && i) {
    const l = a(o, i);
    if (l) return l;
  }
  const n = X();
  let s = a(n.frontendData, n.frontendMeta);
  return s || (s = a("sensor.frontend_data", "sensor.frontend_meta"), s) ? s : null;
}
function D(e, t) {
  const r = String(e ?? "").toLowerCase();
  return r.includes("blue") || r.includes("bleu") ? t?.tempoDayBlue ?? "Blue" : r.includes("white") || r.includes("blanc") ? t?.tempoDayWhite ?? "White" : r.includes("red") || r.includes("rouge") ? t?.tempoDayRed ?? "Red" : r === "n/a" ? t?.dayColorNA ?? "N/A" : r || (t?.emDash ?? "—");
}
function K(e, t, r) {
  const o = e?.[t]?.attributes?.[r];
  if (o == null || o === "") return null;
  const i = Number(o);
  return Number.isFinite(i) ? i : null;
}
function p(e) {
  const t = Number(e);
  if (!Number.isFinite(t)) return "—";
  const r = Math.abs(t);
  return r >= 1e3 ? `${(t / 1e3).toFixed(r >= 1e4 ? 0 : 1)} kW` : `${Math.round(t)} W`;
}
const v = "custom:hub-energie-flow-card", V = 520, q = 5, J = 20, Q = 32, k = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: S,
    path: "M200 58 C200 78 200 100 200 114",
    labelX: 200,
    labelY: 86
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: A,
    path: "M316 132 C290 132 258 132 232 132",
    labelX: 274,
    labelY: 120
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: Y,
    path: "M84 132 C110 132 142 132 170 132",
    labelX: 126,
    labelY: 120
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: S,
    path: "M214 54 C250 64 286 84 316 108",
    labelX: 268,
    labelY: 76
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: I,
    path: "M84 148 C146 194 252 194 316 148",
    labelX: 200,
    labelY: 194
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: G,
    path: "M186 54 C150 64 114 84 84 108",
    labelX: 132,
    labelY: 76
  }
]), Z = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], tt = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], et = [
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
function ot(e) {
  return e === "compact" || e === "full" ? e : "auto";
}
function $(e) {
  return Array.isArray(e) ? e.join(",") : e == null ? "" : String(e);
}
function O(e) {
  return e.every((t) => t != null) ? e.reduce((t, r) => t + r, 0) : null;
}
function at(e, t) {
  if (e == null) return 0;
  const r = Math.abs(e);
  return t ? r > 0 ? 0.96 : 0.18 : r < q ? 0 : r < J ? 0.2 : 0.96;
}
function it(e) {
  const t = Math.max(0, Math.abs(Number(e) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(t + 1) * 2.15));
}
function nt(e) {
  const t = Math.max(0, Math.abs(Number(e) || 0)), r = 4.8 - Math.log10(t + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, r));
}
function st(e) {
  const t = String(e ?? "").trim();
  return t ? t.replace(/_/g, " ") : "ok";
}
function lt(e, t, r, o) {
  return t === "unknown" ? { value: "?", detail: e.flowBatteryUnknown, muted: !0 } : t === "idle" ? { value: null, detail: e.flowBatteryIdle, muted: !0 } : o > 0 ? { value: p(o), detail: e.flowBatteryCharging, muted: !1 } : r > 0 ? { value: p(r), detail: e.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function dt(e, t, r, o, i) {
  const a = Object.fromEntries(
    k.map((c) => [c.key, t[c.key] ?? null])
  );
  a.battery_discharge_power_w = t.battery_discharge_power_w ?? null, a.home_power_w = t.home_power_w ?? null;
  const n = k.map((c) => {
    const b = a[c.key], z = at(b, i);
    return {
      ...c,
      value: b,
      visible: i ? b != null : z > 0,
      opacity: z,
      width: it(b),
      duration: nt(b),
      label: b != null ? p(b) : null
    };
  }), s = Object.fromEntries(n.map((c) => [c.key, c])), l = O(Z.map((c) => a[c])), d = O([
    a.solar_to_home_power_w,
    a.solar_to_battery_power_w,
    a.solar_export_power_w
  ]), u = O([
    a.grid_to_home_power_w,
    a.grid_to_battery_power_w,
    a.solar_export_power_w
  ]) == null ? null : a.grid_to_home_power_w + a.grid_to_battery_power_w - a.solar_export_power_w, m = r.battery_configured === !0, g = tt.map((c) => a[c]).filter((c) => c != null);
  let f = "absent";
  m && (g.length === 0 ? f = "unknown" : g.some((c) => Math.abs(c) >= 0.5) ? f = "active" : f = "idle");
  const C = (a.solar_to_battery_power_w ?? 0) + (a.grid_to_battery_power_w ?? 0), B = a.battery_to_home_power_w ?? a.battery_discharge_power_w ?? 0, E = lt(e, f, B, C), W = {
    grid: {
      kind: "grid",
      icon: "⚡",
      label: e.flowNodeGrid,
      value: u != null ? p(u) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: 132
    },
    solar: {
      kind: "solar",
      icon: "☀",
      label: e.flowNodeSolar,
      value: d != null ? p(d) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: Q
    },
    home: {
      kind: "home",
      icon: "⌂",
      label: e.flowNodeHome,
      value: l != null ? p(l) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: 132
    },
    battery: m ? {
      kind: "battery",
      icon: f === "unknown" ? "?" : "B",
      label: e.flowNodeBattery,
      value: E.value,
      detail: E.detail,
      muted: E.muted,
      status: f,
      x: 344,
      y: 132
    } : null
  }, x = a.home_power_w, j = i && l != null && x != null ? {
    expected: l,
    reported: x,
    delta: x - l,
    tolerance: Math.max(25, Math.abs(x) * 0.04)
  } : null;
  return {
    layout: o,
    debug: i,
    nodes: W,
    edges: n,
    edgeMap: s,
    meta: {
      currentSlot: r.current_slot ?? null,
      todayColor: r.today_color ?? null,
      tomorrowColor: r.tomorrow_color ?? null,
      inputStatus: r.input_status ?? null
    },
    mismatch: j
  };
}
class ct extends R {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
  };
  static styles = L`
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
    super(), this.hass = void 0, this._config = { type: v }, this._autoCompact = !1, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null;
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
    this._config = t && typeof t == "object" ? { ...t, type: v } : { type: v }, this._lastFp = null, this.requestUpdate();
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
      type: v,
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
    const t = this._i18n(), r = this._resolvedLayout(), o = this._viewModel(t, r), i = this._debugEnabled();
    if (!o.ready)
      return w`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            <div class="hint">${t.flowCardWaiting}</div>
            <div class="hint">${t.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const a = o.model.mismatch && Math.abs(o.model.mismatch.delta) > o.model.mismatch.tolerance ? t.flowDebugConservationWarn.replace("{derived}", p(o.model.mismatch.expected)).replace("{reported}", p(o.model.mismatch.reported)).replace("{delta}", p(o.model.mismatch.delta)) : null, n = [];
    return o.model.meta.currentSlot && n.push(`${t.flowMetaSlot}: ${o.model.meta.currentSlot}`), o.model.meta.todayColor && n.push(`${t.flowMetaToday}: ${D(o.model.meta.todayColor, t)}`), o.model.meta.tomorrowColor && n.push(`${t.flowMetaTomorrow}: ${D(o.model.meta.tomorrowColor, t)}`), o.model.meta.inputStatus && o.model.meta.inputStatus !== "ok" && n.push(`${t.flowMetaInputStatus}: ${st(o.model.meta.inputStatus)}`), w`
      <ha-card class=${i ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || t.flowCardTitle}</div>
            ${i ? w`<span class="badge">${t.flowDebugBadge}</span>` : _}
          </div>
          ${a ? w`<div class="warning">${a}</div>` : _}
          <hub-power-flow-diagram
            .data=${o.model}
            .i18n=${t}
            .layout=${r}
            .debug=${i}
          ></hub-power-flow-diagram>
          ${n.length ? w`
                <div class="meta">
                  ${n.map((s) => w`
                    <span class="chip ${s.includes(t.flowMetaInputStatus) ? "alert" : ""}">${s}</span>
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
      const t = this.offsetWidth > 0 && this.offsetWidth < V;
      t !== this._autoCompact && (this._autoCompact = t);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? N.en : N.fr;
  }
  _debugEnabled() {
    return rt(this._config?.debug);
  }
  _resolvedLayout() {
    const t = ot(this._config?.layout);
    return t === "auto" ? this._autoCompact ? "compact" : "full" : t;
  }
  _viewModel(t, r) {
    const o = this.hass?.states, i = F(o, this._config);
    if (!i)
      return { ready: !1, model: null };
    const { data: a, meta: n } = i, s = o[a], l = o[n];
    if (!s || !l)
      return { ready: !1, model: null };
    s.attributes;
    const d = l.attributes ?? {}, h = Object.fromEntries(
      [
        ...k.map((u) => u.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((u) => [u, K(o, a, u)])
    );
    return {
      ready: !0,
      model: dt(t, h, d, r, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const t = this.hass?.states;
    if (!t) return null;
    const r = F(t, this._config), o = this._resolvedLayout(), i = this._debugEnabled();
    if (!r) {
      const m = String(this._config?.frontend_data_entity ?? "").trim(), g = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${o}|${i}|${m}|${g}`;
    }
    const { data: a, meta: n } = r, s = t[a], l = t[n];
    if (!s || !l)
      return `missing|${o}|${i}|${a}|${n}`;
    const d = s.attributes ?? {}, h = l.attributes ?? {};
    return [
      a,
      n,
      o,
      i,
      ...k.map((m) => $(d[m.key])),
      $(d.battery_discharge_power_w),
      i ? $(d.home_power_w) : "",
      ...et.map((m) => $(h[m]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", ct);
export {
  ct as HubEnergieFlowCard
};
