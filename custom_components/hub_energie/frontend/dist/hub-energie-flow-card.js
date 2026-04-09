import { i as L, a as D, A as m, b as n, I as M } from "./i18n.js";
import { C as R, c as k, e as F, m as u, z, h as A, p as T, d as G, w as I } from "./energy-utils.js";
const S = Object.freeze({
  grid: F,
  solar: k,
  home: "var(--primary-color, #03a9f4)",
  battery: R,
  neutral: "var(--secondary-text-color, #9e9e9e)"
});
function W(r) {
  return r === "home" ? 28 : 22;
}
class H extends L {
  static properties = {
    data: { attribute: !1 },
    i18n: { attribute: !1 },
    layout: { type: String },
    debug: { type: Boolean }
  };
  static styles = D`
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .backdrop {
      fill: color-mix(in srgb, var(--card-background-color) 82%, transparent);
      stroke: color-mix(in srgb, var(--divider-color) 65%, transparent);
      stroke-width: 1;
    }
    .edge-base,
    .edge-glow,
    .edge-flow {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: stroke-width 0.2s ease, opacity 0.2s ease;
    }
    .edge-base {
      stroke: color-mix(in srgb, var(--flow-color) 32%, var(--divider-color));
      stroke-width: calc(var(--flow-width) + 3px);
      opacity: calc(var(--flow-opacity) * 0.25);
    }
    .edge-glow {
      stroke: var(--flow-color);
      stroke-width: calc(var(--flow-width) + 10px);
      opacity: calc(var(--flow-opacity) * 0.12);
      filter: blur(6px);
    }
    .edge-flow {
      stroke: var(--flow-color);
      stroke-width: var(--flow-width);
      opacity: var(--flow-opacity);
      stroke-dasharray: 14 10;
      animation: flow-dash var(--flow-duration) linear infinite;
      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--flow-color) 30%, transparent));
    }
    .edge-label {
      font-size: 11px;
      font-weight: 700;
      text-anchor: middle;
      fill: var(--primary-text-color);
      paint-order: stroke;
      stroke: color-mix(in srgb, var(--card-background-color) 86%, transparent);
      stroke-width: 4px;
      stroke-linejoin: round;
    }
    .node-ring {
      fill: color-mix(in srgb, var(--node-color) 16%, transparent);
      stroke: color-mix(in srgb, var(--node-color) 90%, white 10%);
      stroke-width: 2.4;
    }
    .node-ring.idle,
    .node-ring.unknown {
      fill: color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 16%, transparent);
      stroke: color-mix(in srgb, var(--disabled-text-color, #9e9e9e) 72%, white 12%);
    }
    .node-core {
      fill: color-mix(in srgb, var(--node-color) 20%, var(--card-background-color));
      stroke: color-mix(in srgb, var(--divider-color) 40%, transparent);
      stroke-width: 1;
    }
    .node-icon {
      fill: var(--primary-text-color);
      font-size: 14px;
      font-weight: 800;
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
      font-size: 12px;
      font-weight: 700;
    }
    .node-value {
      font-size: 13px;
      font-weight: 800;
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
        stroke-dashoffset: -48;
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
    const e = this.data;
    if (!e) return m;
    const a = Object.values(e.nodes).filter(Boolean), t = this.debug || this.layout !== "compact", l = this.debug || this.layout !== "compact";
    return n`
      <svg viewBox="0 0 400 240" aria-label=${this.i18n.flowCardTitle ?? "Live power flows"}>
        <rect class="backdrop" x="6" y="6" width="388" height="228" rx="26"></rect>
        ${e.edges.map((o) => this._renderEdge(o, t))}
        ${a.map((o) => this._renderNode(o, l))}
      </svg>
    `;
  }
  _renderEdge(e, a) {
    if (!e.visible) return m;
    const t = [
      `--flow-color:${e.color}`,
      `--flow-width:${e.width}px`,
      `--flow-opacity:${e.opacity}`,
      `--flow-duration:${e.duration}s`
    ].join(";");
    return n`
      <g style=${t}>
        <path class="edge-base" d=${e.path}></path>
        <path class="edge-glow" d=${e.path}></path>
        <path class="edge-flow" d=${e.path}></path>
        ${a && e.label ? n`<text class="edge-label" x=${e.labelX} y=${e.labelY}>${e.label}</text>` : m}
      </g>
    `;
  }
  _renderNode(e, a) {
    const t = W(e.kind), l = S[e.kind] ?? S.neutral, o = e.muted ? "node-muted" : "", i = a && e.detail ? e.detail : null;
    return n`
      <g transform="translate(${e.x} ${e.y})" style=${`--node-color:${l}`}>
        <circle class="node-ring ${e.status}" r=${t + 6}></circle>
        <circle class="node-core" r=${t}></circle>
        <text class="node-icon ${o}" x="0" y="1">${e.icon}</text>
        <text class="node-label ${o}" x="0" y=${t + 20}>${e.label}</text>
        ${e.value ? n`<text class="node-value ${o}" x="0" y=${t + 38}>${e.value}</text>` : m}
        ${i ? n`<text class="node-detail ${o}" x="0" y=${t + 54}>${i}</text>` : m}
      </g>
    `;
  }
}
customElements.get("hub-power-flow-diagram") || customElements.define("hub-power-flow-diagram", H);
const b = "custom:hub-energie-flow-card", U = 520, X = 5, P = 20, y = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: k,
    path: "M200 72 C200 86 200 100 200 112",
    labelX: 200,
    labelY: 98
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: R,
    path: "M316 132 C290 132 258 132 232 132",
    labelX: 274,
    labelY: 120
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: F,
    path: "M84 132 C110 132 142 132 168 132",
    labelX: 126,
    labelY: 120
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: k,
    path: "M214 70 C250 78 286 96 316 118",
    labelX: 264,
    labelY: 88
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: G,
    path: "M84 148 C146 194 252 194 316 148",
    labelX: 200,
    labelY: 194
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: I,
    path: "M186 70 C150 78 114 96 84 118",
    labelX: 136,
    labelY: 88
  }
]), K = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"], q = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w"
], J = [
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
function V(r) {
  return r === "compact" || r === "full" ? r : "auto";
}
function g(r) {
  return Array.isArray(r) ? r.join(",") : r == null ? "" : String(r);
}
function x(r) {
  return r.every((e) => e != null) ? r.reduce((e, a) => e + a, 0) : null;
}
function Z(r, e) {
  if (r == null) return 0;
  const a = Math.abs(r);
  return e ? a > 0 ? 0.96 : 0.18 : a < X ? 0 : a < P ? 0.2 : 0.96;
}
function ee(r) {
  const e = Math.max(0, Math.abs(Number(r) || 0));
  return Math.max(2.4, Math.min(11.5, 2.4 + Math.log10(e + 1) * 2.7));
}
function te(r) {
  const e = Math.max(0, Math.abs(Number(r) || 0)), a = 4.8 - Math.log10(e + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, a));
}
function re(r) {
  const e = String(r ?? "").trim();
  return e ? e.replace(/_/g, " ") : "ok";
}
function oe(r, e, a, t) {
  return e === "unknown" ? { value: "?", detail: r.flowBatteryUnknown, muted: !0 } : e === "idle" ? { value: null, detail: r.flowBatteryIdle, muted: !0 } : t > 0 ? { value: u(t), detail: r.flowBatteryCharging, muted: !1 } : a > 0 ? { value: u(a), detail: r.flowBatteryDischarging, muted: !1 } : { value: null, detail: null, muted: !1 };
}
function ae(r, e, a, t, l) {
  const o = Object.fromEntries(
    y.map((s) => [s.key, e[s.key] ?? null])
  );
  o.battery_discharge_power_w = e.battery_discharge_power_w ?? null, o.home_power_w = e.home_power_w ?? null;
  const i = y.map((s) => {
    const h = o[s.key], O = Z(h, l);
    return {
      ...s,
      value: h,
      visible: l ? h != null : O > 0,
      opacity: O,
      width: ee(h),
      duration: te(h),
      label: h != null ? u(h) : null
    };
  }), d = Object.fromEntries(i.map((s) => [s.key, s])), c = x(K.map((s) => o[s])), p = x([
    o.solar_to_home_power_w,
    o.solar_to_battery_power_w,
    o.solar_export_power_w
  ]), $ = x([
    o.grid_to_home_power_w,
    o.grid_to_battery_power_w,
    o.solar_export_power_w
  ]) == null ? null : o.grid_to_home_power_w + o.grid_to_battery_power_w - o.solar_export_power_w, C = a.battery_configured === !0, E = q.map((s) => o[s]).filter((s) => s != null);
  let f = "absent";
  C && (E.length === 0 ? f = "unknown" : E.some((s) => Math.abs(s) >= 0.5) ? f = "active" : f = "idle");
  const N = (o.solar_to_battery_power_w ?? 0) + (o.grid_to_battery_power_w ?? 0), B = o.battery_to_home_power_w ?? o.battery_discharge_power_w ?? 0, v = oe(r, f, B, N), j = {
    grid: {
      kind: "grid",
      icon: "G",
      label: r.flowNodeGrid,
      value: $ != null ? u($) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 56,
      y: 132
    },
    solar: {
      kind: "solar",
      icon: "S",
      label: r.flowNodeSolar,
      value: p != null ? u(p) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: 48
    },
    home: {
      kind: "home",
      icon: "H",
      label: r.flowNodeHome,
      value: c != null ? u(c) : null,
      detail: null,
      muted: !1,
      status: "active",
      x: 200,
      y: 132
    },
    battery: C ? {
      kind: "battery",
      icon: f === "unknown" ? "?" : "B",
      label: r.flowNodeBattery,
      value: v.value,
      detail: v.detail,
      muted: v.muted,
      status: f,
      x: 344,
      y: 132
    } : null
  }, w = o.home_power_w, Y = l && c != null && w != null ? {
    expected: c,
    reported: w,
    delta: w - c,
    tolerance: Math.max(25, Math.abs(w) * 0.04)
  } : null;
  return {
    layout: t,
    debug: l,
    nodes: j,
    edges: i,
    edgeMap: d,
    meta: {
      currentSlot: a.current_slot ?? null,
      todayColor: a.today_color ?? null,
      tomorrowColor: a.tomorrow_color ?? null,
      inputStatus: a.input_status ?? null
    },
    mismatch: Y
  };
}
class le extends L {
  static properties = {
    hass: { attribute: !1 },
    _config: { state: !0 },
    _autoCompact: { state: !0 }
  };
  static styles = D`
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
    super(), this.hass = void 0, this._config = { type: b }, this._autoCompact = !1, this._lastFp = null, this._resizeObserver = null, this._resizeTimer = null;
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
  setConfig(e) {
    this._config = e && typeof e == "object" ? { ...e, type: b } : { type: b };
  }
  getCardSize() {
    return 5;
  }
  getGridOptions() {
    const e = Number(this._config?.grid_span ?? 1);
    return {
      columns: (Number.isFinite(e) ? Math.max(1, Math.min(3, Math.trunc(e))) : 1) * 12,
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
      type: b,
      layout: "auto",
      grid_span: 1
    };
  }
  shouldUpdate(e) {
    if (e.has("hass") && e.size === 1) {
      const a = this._stateFingerprint();
      return a !== null && a === this._lastFp ? !1 : (this._lastFp = a, !0);
    }
    return !0;
  }
  render() {
    const e = this._i18n(), a = this._resolvedLayout(), t = this._viewModel(e, a), l = this._debugEnabled();
    if (!t.ready)
      return n`
        <ha-card>
          <div class="placeholder">
            <div class="title">${this._config?.title || e.flowCardTitle}</div>
            <div class="hint">${e.flowCardWaiting}</div>
            <div class="hint">${e.flowCardEntityHint}</div>
          </div>
        </ha-card>
      `;
    const o = t.model.mismatch && Math.abs(t.model.mismatch.delta) > t.model.mismatch.tolerance ? e.flowDebugConservationWarn.replace("{derived}", u(t.model.mismatch.expected)).replace("{reported}", u(t.model.mismatch.reported)).replace("{delta}", u(t.model.mismatch.delta)) : null, i = [];
    return t.model.meta.currentSlot && i.push(`${e.flowMetaSlot}: ${t.model.meta.currentSlot}`), t.model.meta.todayColor && i.push(`${e.flowMetaToday}: ${z(t.model.meta.todayColor, e)}`), t.model.meta.tomorrowColor && i.push(`${e.flowMetaTomorrow}: ${z(t.model.meta.tomorrowColor, e)}`), t.model.meta.inputStatus && t.model.meta.inputStatus !== "ok" && i.push(`${e.flowMetaInputStatus}: ${re(t.model.meta.inputStatus)}`), n`
      <ha-card class=${l ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || e.flowCardTitle}</div>
            ${l ? n`<span class="badge">${e.flowDebugBadge}</span>` : m}
          </div>
          ${o ? n`<div class="warning">${o}</div>` : m}
          <hub-power-flow-diagram
            .data=${t.model}
            .i18n=${e}
            .layout=${a}
            .debug=${l}
          ></hub-power-flow-diagram>
          ${i.length ? n`
                <div class="meta">
                  ${i.map((d) => n`
                    <span class="chip ${d.includes(e.flowMetaInputStatus) ? "alert" : ""}">${d}</span>
                  `)}
                </div>
              ` : m}
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
      const e = this.offsetWidth > 0 && this.offsetWidth < U;
      e !== this._autoCompact && (this._autoCompact = e);
    }, 100);
  }
  _i18n() {
    return String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? M.en : M.fr;
  }
  _debugEnabled() {
    return Q(this._config?.debug);
  }
  _resolvedLayout() {
    const e = V(this._config?.layout);
    return e === "auto" ? this._autoCompact ? "compact" : "full" : e;
  }
  _viewModel(e, a) {
    const t = this.hass?.states, l = T(), o = t?.[l.frontendData], i = t?.[l.frontendMeta];
    if (!o || !i)
      return { ready: !1, model: null };
    o.attributes;
    const d = i.attributes ?? {}, c = Object.fromEntries(
      [
        ...y.map((p) => p.key),
        "battery_discharge_power_w",
        "home_power_w"
      ].map((p) => [p, A(t, l.frontendData, p)])
    );
    return {
      ready: !0,
      model: ae(e, c, d, a, this._debugEnabled())
    };
  }
  _stateFingerprint() {
    const e = this.hass?.states;
    if (!e) return null;
    const a = T(), t = e[a.frontendData], l = e[a.frontendMeta], o = this._resolvedLayout(), i = this._debugEnabled();
    if (!t || !l)
      return `missing|${o}|${i}|${!!t}|${!!l}`;
    const d = t.attributes ?? {}, c = l.attributes ?? {};
    return [
      o,
      i,
      ...y.map((_) => g(d[_.key])),
      g(d.battery_discharge_power_w),
      i ? g(d.home_power_w) : "",
      ...J.map((_) => g(c[_]))
    ].join("|");
  }
}
customElements.get("hub-energie-flow-card") || customElements.define("hub-energie-flow-card", le);
window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-flow-card",
  name: "Hub Énergie Flow",
  description: "Live power-flow diagram using frontend_data/frontend_meta with debug and adaptive layout.",
  preview: !1,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie"
});
export {
  le as HubEnergieFlowCard
};
