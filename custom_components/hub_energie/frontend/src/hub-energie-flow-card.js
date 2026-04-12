import { LitElement, css, html, nothing } from "lit";
import "./components/hub-power-flow-diagram.js";
import { I18N } from "./constants/i18n.js";
import {
  dayColorLabel,
  fmtPowerCompact,
  formatFlowDataAge,
  readAttrOptionalFloat,
  resolveHubFrontendPayloadEntities,
} from "./utils/hub-flow-resolve.js";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_GRID_TO_BATT,
  COLOR_SOLAR,
  COLOR_SOLAR_EXPORT,
} from "./constants/colors.js";

const CARD_TYPE = "custom:hub-energie-flow-card";
const AUTO_LAYOUT_BREAKPOINT = 520;
const EDGE_HIDE_W = 5;
const EDGE_FADE_W = 20;

/** Vertical padding so the flow geometry fits a square viewBox (see diagram viewBox height). */
const FLOW_Y_PAD = 54;

/** Grid / battery row — raised slightly vs home so lateral cables arc above the home label block. */
const ROW_CY = 156 + FLOW_Y_PAD;
/** Home sits lower so the solar→home segment is tall enough for labels and flow lines. */
const HOME_CY = 194 + FLOW_Y_PAD;
/** Solar cy; keep halo (r+14) inside the rounded backdrop (y ≥ ~8). */
const SOLAR_CY = 40 + FLOW_Y_PAD;

const EDGE_CONFIG = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: COLOR_SOLAR,
    path: "M200 116 C200 156 200 192 200 220",
    labelX: 200,
    labelY: 166,
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: COLOR_BATTERY,
    path: "M322 210 C288 226 252 240 228 246",
    labelX: 278,
    labelY: 220,
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: COLOR_GRID_SOURCE,
    path: "M78 210 C112 226 148 240 172 246",
    labelX: 124,
    labelY: 220,
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: COLOR_SOLAR,
    path: "M214 112 C252 128 292 156 322 188",
    labelX: 268,
    labelY: 144,
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: COLOR_GRID_TO_BATT,
    path: "M78 222 C200 312 322 222",
    labelX: 200,
    labelY: 286,
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: COLOR_SOLAR_EXPORT,
    path: "M186 112 C142 130 102 162 78 188",
    labelX: 128,
    labelY: 144,
  },
]);

const HOME_EDGE_KEYS = ["solar_to_home_power_w", "battery_to_home_power_w", "grid_to_home_power_w"];
const BATTERY_STATE_KEYS = [
  "battery_to_home_power_w",
  "solar_to_battery_power_w",
  "grid_to_battery_power_w",
  "battery_discharge_power_w",
];

const META_FP_KEYS = [
  "battery_configured",
  "solar_configured",
  "battery_system_count",
  "current_slot",
  "today_color",
  "tomorrow_color",
  "input_status",
];

function boolConfig(value) {
  return value === true || value === "true";
}

function normalizeLayout(value) {
  if (value === "compact" || value === "full") return value;
  return "auto";
}

function fpPart(value) {
  if (Array.isArray(value)) return value.join(",");
  if (value === null || value === undefined) return "";
  return String(value);
}

function sumKnown(values) {
  if (!values.every((value) => value != null)) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function activeOpacity(value, debug) {
  if (value == null) return 0;
  const abs = Math.abs(value);
  if (debug) return abs > 0 ? 0.96 : 0.18;
  if (abs < EDGE_HIDE_W) return 0;
  if (abs < EDGE_FADE_W) return 0.2;
  return 0.96;
}

function edgeWidth(value) {
  const abs = Math.max(0, Math.abs(Number(value) || 0));
  return Math.max(1.85, Math.min(7.8, 1.85 + Math.log10(abs + 1) * 2.15));
}

function edgeDuration(value) {
  const abs = Math.max(0, Math.abs(Number(value) || 0));
  const raw = 4.8 - Math.log10(abs + 1) * 0.92;
  return Math.max(1.1, Math.min(4.8, raw));
}

function humanizeToken(value) {
  const text = String(value ?? "").trim();
  return text ? text.replace(/_/g, " ") : "ok";
}

/** Heuristic dark theme for flow diagram contrast (no backend). */
function isEnergyDarkTheme(hass) {
  const t = hass?.themes;
  if (t && typeof t.darkMode === "boolean") return t.darkMode;
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  const attr = root.getAttribute("data-theme");
  if (attr && String(attr).toLowerCase().includes("dark")) return true;
  try {
    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function batteryPresentation(i18n, state, dischargeW, chargeW) {
  if (state === "unknown") {
    return { value: "?", detail: i18n.flowBatteryUnknown, muted: true };
  }
  if (state === "idle") {
    return { value: null, detail: i18n.flowBatteryIdle, muted: true };
  }
  if (chargeW > 0) {
    return { value: fmtPowerCompact(chargeW), detail: i18n.flowBatteryCharging, muted: false };
  }
  if (dischargeW > 0) {
    return { value: fmtPowerCompact(dischargeW), detail: i18n.flowBatteryDischarging, muted: false };
  }
  return { value: null, detail: null, muted: false };
}

function buildDiagramModel(i18n, liveAttrs, metaAttrs, layout, debug) {
  const values = Object.fromEntries(
    EDGE_CONFIG.map((edge) => [edge.key, liveAttrs[edge.key] ?? null]),
  );
  values.battery_discharge_power_w = liveAttrs.battery_discharge_power_w ?? null;
  values.home_power_w = liveAttrs.home_power_w ?? null;

  const edgesDraft = EDGE_CONFIG.map((edge) => {
    const value = values[edge.key];
    const opacity = activeOpacity(value, debug);
    const w = value == null ? 0 : Math.abs(Number(value) || 0);
    const label =
      value != null && w >= EDGE_HIDE_W ? fmtPowerCompact(value) : null;
    const ghost = Boolean(debug && value != null && w < EDGE_HIDE_W);
    const visible = debug ? value != null : opacity > 0;
    return {
      ...edge,
      value,
      visible,
      opacity,
      width: edgeWidth(value),
      duration: edgeDuration(value),
      label,
      ghost,
      _homeW: HOME_EDGE_KEYS.includes(edge.key) && visible ? w : -1,
    };
  });

  let primaryHomeKey = null;
  let primaryHomeW = -1;
  for (const e of edgesDraft) {
    if (e._homeW > primaryHomeW) {
      primaryHomeW = e._homeW;
      primaryHomeKey = e.key;
    }
  }

  const edges = edgesDraft.map(({ _homeW, ...edge }) => ({
    ...edge,
    primaryToHome: edge.key === primaryHomeKey && primaryHomeKey != null,
  }));

  const edgeMap = Object.fromEntries(edges.map((edge) => [edge.key, edge]));
  const homeFromEdges = sumKnown(HOME_EDGE_KEYS.map((key) => values[key]));
  const solarFromEdges = sumKnown([
    values.solar_to_home_power_w,
    values.solar_to_battery_power_w,
    values.solar_export_power_w,
  ]);
  const gridNetFromEdges = sumKnown([
    values.grid_to_home_power_w,
    values.grid_to_battery_power_w,
    values.solar_export_power_w,
  ]);
  const gridDisplay = gridNetFromEdges == null
    ? null
    : (values.grid_to_home_power_w + values.grid_to_battery_power_w) - values.solar_export_power_w;

  const batteryConfigured = metaAttrs.battery_configured === true;
  const batteryKnown = BATTERY_STATE_KEYS.map((key) => values[key]).filter((value) => value != null);
  let batteryState = "absent";
  if (batteryConfigured) {
    if (batteryKnown.length === 0) batteryState = "unknown";
    else if (batteryKnown.some((value) => Math.abs(value) >= 0.5)) batteryState = "active";
    else batteryState = "idle";
  }
  const batteryChargeW = (values.solar_to_battery_power_w ?? 0) + (values.grid_to_battery_power_w ?? 0);
  const batteryDischargeW = values.battery_to_home_power_w ?? values.battery_discharge_power_w ?? 0;
  const batteryUi = batteryPresentation(i18n, batteryState, batteryDischargeW, batteryChargeW);

  const pulse = (v) => v != null && Math.abs(v) >= EDGE_HIDE_W;
  const nodes = {
    grid: {
      kind: "grid",
      iconKey: "grid",
      label: i18n.flowNodeGrid,
      value: gridDisplay != null ? fmtPowerCompact(gridDisplay) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 56,
      y: ROW_CY,
      pulse: pulse(gridDisplay),
    },
    solar: {
      kind: "solar",
      iconKey: "solar",
      label: i18n.flowNodeSolar,
      value: solarFromEdges != null ? fmtPowerCompact(solarFromEdges) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 200,
      y: SOLAR_CY,
      pulse: pulse(solarFromEdges),
    },
    home: {
      kind: "home",
      iconKey: "home",
      label: i18n.flowNodeHome,
      value: homeFromEdges != null ? fmtPowerCompact(homeFromEdges) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 200,
      y: HOME_CY,
      pulse: pulse(homeFromEdges),
    },
    battery: batteryConfigured
      ? {
          kind: "battery",
          iconKey: batteryState === "unknown" ? "battery_unknown" : "battery",
          label: i18n.flowNodeBattery,
          value: batteryUi.value,
          detail: batteryUi.detail,
          muted: batteryUi.muted,
          status: batteryState,
          x: 344,
          y: ROW_CY,
          pulse: batteryState === "active",
        }
      : null,
  };

  const reportedHomeW = values.home_power_w;
  const mismatch = debug && homeFromEdges != null && reportedHomeW != null
    ? {
        expected: homeFromEdges,
        reported: reportedHomeW,
        delta: reportedHomeW - homeFromEdges,
        tolerance: Math.max(25, Math.abs(reportedHomeW) * 0.04),
      }
    : null;

  return {
    layout,
    debug,
    nodes,
    edges,
    edgeMap,
    meta: {
      currentSlot: metaAttrs.current_slot ?? null,
      todayColor: metaAttrs.today_color ?? null,
      tomorrowColor: metaAttrs.tomorrow_color ?? null,
      inputStatus: metaAttrs.input_status ?? null,
    },
    mismatch,
  };
}

export class HubEnergieFlowCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _autoCompact: { state: true },
    /** Bumps periodically so the live-data age line refreshes when values are unchanged. */
    _dataAgePulse: { state: true },
  };

  static styles = css`
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
    super();
    this.hass = undefined;
    this._config = { type: CARD_TYPE };
    this._autoCompact = false;
    this._dataAgePulse = 0;
    this._lastFp = null;
    this._resizeObserver = null;
    this._resizeTimer = null;
    this._dataAgeTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._attachResizeObserver();
    this._dataAgeTimer = window.setInterval(() => {
      this._dataAgePulse += 1;
    }, 15000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._resizeObserver = null;
    if (this._resizeTimer != null) clearTimeout(this._resizeTimer);
    this._resizeTimer = null;
    if (this._dataAgeTimer != null) {
      window.clearInterval(this._dataAgeTimer);
      this._dataAgeTimer = null;
    }
  }

  firstUpdated() {
    this._scheduleLayoutMeasure();
  }

  setConfig(config) {
    this._config = config && typeof config === "object" ? { ...config, type: CARD_TYPE } : { type: CARD_TYPE };
    this._lastFp = null;
    this.requestUpdate();
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    const raw = Number(this._config?.grid_span ?? 1);
    const span = Number.isFinite(raw) ? Math.max(1, Math.min(3, Math.trunc(raw))) : 1;
    return {
      columns: span * 12,
      min_columns: 3,
      rows: 7,
      min_rows: 3,
    };
  }

  static getConfigElement() {
    return document.createElement("hub-energie-flow-card-editor");
  }

  static getStubConfig() {
    return {
      type: CARD_TYPE,
      layout: "auto",
      grid_span: 1,
    };
  }

  shouldUpdate(changedProps) {
    if (changedProps.has("_dataAgePulse")) return true;
    if (changedProps.has("hass") && changedProps.size === 1) {
      const fp = this._stateFingerprint();
      if (fp !== null && fp === this._lastFp) return false;
      this._lastFp = fp;
      return true;
    }
    return true;
  }

  render() {
    const i18n = this._i18n();
    const resolvedLayout = this._resolvedLayout();
    const vm = this._viewModel(i18n, resolvedLayout);
    const debug = this._debugEnabled();
    if (!vm.ready) {
      return html`
        <ha-card>
          <div class="wrap">
            <div class="header">
              <div class="head-main">
                <div class="title">${this._config?.title || i18n.flowCardTitle}</div>
              </div>
            </div>
            <div class="flow-skel" aria-hidden="true"></div>
            <div class="placeholder" style="padding:12px 0 0;margin:0">
              <div class="hint">${i18n.flowCardWaiting}</div>
              <div class="hint">${i18n.flowCardEntityHint}</div>
            </div>
          </div>
        </ha-card>
      `;
    }

    const mismatchWarning = vm.model.mismatch && Math.abs(vm.model.mismatch.delta) > vm.model.mismatch.tolerance
      ? i18n.flowDebugConservationWarn
          .replace("{derived}", fmtPowerCompact(vm.model.mismatch.expected))
          .replace("{reported}", fmtPowerCompact(vm.model.mismatch.reported))
          .replace("{delta}", fmtPowerCompact(vm.model.mismatch.delta))
      : null;

    const liveEnt = vm.dataEntityId ? this.hass.states[vm.dataEntityId] : null;
    const liveTs = liveEnt?.last_updated ?? liveEnt?.last_changed ?? "";
    const ageStr = formatFlowDataAge(String(liveTs), Date.now(), i18n);
    const subtitle = ageStr
      ? i18n.flowDataAgeLabel.replace("{age}", ageStr)
      : i18n.flowDataAgeUnknown;

    const chips = [];
    if (vm.model.meta.currentSlot) {
      chips.push(`${i18n.flowMetaSlot}: ${vm.model.meta.currentSlot}`);
    }
    if (vm.model.meta.todayColor) {
      chips.push(`${i18n.flowMetaToday}: ${dayColorLabel(vm.model.meta.todayColor, i18n)}`);
    }
    if (vm.model.meta.tomorrowColor) {
      chips.push(`${i18n.flowMetaTomorrow}: ${dayColorLabel(vm.model.meta.tomorrowColor, i18n)}`);
    }
    if (vm.model.meta.inputStatus && vm.model.meta.inputStatus !== "ok") {
      chips.push(`${i18n.flowMetaInputStatus}: ${humanizeToken(vm.model.meta.inputStatus)}`);
    }

    const energyDark = isEnergyDarkTheme(this.hass);

    return html`
      <ha-card class=${debug ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="head-main">
              <div class="title">${this._config?.title || i18n.flowCardTitle}</div>
              <div class="subtitle">${subtitle}</div>
            </div>
            ${debug ? html`<span class="badge">${i18n.flowDebugBadge}</span>` : nothing}
          </div>
          ${mismatchWarning ? html`<div class="warning">${mismatchWarning}</div>` : nothing}
          <hub-power-flow-diagram
            .data=${vm.model}
            .i18n=${i18n}
            .layout=${resolvedLayout}
            .debug=${debug}
            .energyThemeDark=${energyDark}
          ></hub-power-flow-diagram>
          ${chips.length
            ? html`
                <div class="meta">
                  ${chips.map((chip) => html`
                    <span class="chip ${chip.includes(i18n.flowMetaInputStatus) ? "alert" : ""}">${chip}</span>
                  `)}
                </div>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  _attachResizeObserver() {
    if (this._resizeObserver || typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver(() => this._scheduleLayoutMeasure());
    this._resizeObserver.observe(this);
  }

  _scheduleLayoutMeasure() {
    if (this._resizeTimer != null) clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this._resizeTimer = null;
      const next = this.offsetWidth > 0 && this.offsetWidth < AUTO_LAYOUT_BREAKPOINT;
      if (next !== this._autoCompact) this._autoCompact = next;
    }, 100);
  }

  _i18n() {
    const lang = String(this.hass?.locale?.language ?? "fr").toLowerCase();
    return lang.startsWith("en") ? I18N.en : I18N.fr;
  }

  _debugEnabled() {
    return boolConfig(this._config?.debug);
  }

  _resolvedLayout() {
    const layout = normalizeLayout(this._config?.layout);
    if (layout === "auto") return this._autoCompact ? "compact" : "full";
    return layout;
  }

  _viewModel(i18n, layout) {
    const states = this.hass?.states;
    const resolved = resolveHubFrontendPayloadEntities(states, this._config);
    if (!resolved) {
      return { ready: false, model: null };
    }
    const { data: dataId, meta: metaId } = resolved;
    const liveState = states[dataId];
    const metaState = states[metaId];
    if (!liveState || !metaState) {
      return { ready: false, model: null };
    }

    const liveAttrs = liveState.attributes ?? {};
    const metaAttrs = metaState.attributes ?? {};
    const live = Object.fromEntries(
      [
        ...EDGE_CONFIG.map((edge) => edge.key),
        "battery_discharge_power_w",
        "home_power_w",
      ].map((key) => [key, readAttrOptionalFloat(states, dataId, key)]),
    );

    return {
      ready: true,
      dataEntityId: dataId,
      model: buildDiagramModel(i18n, live, metaAttrs, layout, this._debugEnabled()),
    };
  }

  _stateFingerprint() {
    const states = this.hass?.states;
    if (!states) return null;
    const resolved = resolveHubFrontendPayloadEntities(states, this._config);
    const layout = this._resolvedLayout();
    const debug = this._debugEnabled();
    if (!resolved) {
      const exD = String(this._config?.frontend_data_entity ?? "").trim();
      const exM = String(this._config?.frontend_meta_entity ?? "").trim();
      return `missing|${layout}|${debug}|${exD}|${exM}`;
    }
    const { data: dataId, meta: metaId } = resolved;
    const liveState = states[dataId];
    const metaState = states[metaId];
    if (!liveState || !metaState) {
      return `missing|${layout}|${debug}|${dataId}|${metaId}`;
    }
    const liveAttrs = liveState.attributes ?? {};
    const metaAttrs = metaState.attributes ?? {};
    const parts = [
      dataId,
      metaId,
      layout,
      debug,
      fpPart(liveState.last_updated ?? liveState.last_changed),
      ...EDGE_CONFIG.map((edge) => fpPart(liveAttrs[edge.key])),
      fpPart(liveAttrs.battery_discharge_power_w),
      debug ? fpPart(liveAttrs.home_power_w) : "",
      ...META_FP_KEYS.map((key) => fpPart(metaAttrs[key])),
    ];
    return parts.join("|");
  }
}

if (!customElements.get("hub-energie-flow-card")) {
  customElements.define("hub-energie-flow-card", HubEnergieFlowCard);
}

/* Card picker metadata lives in hub-energie-card-boot.js so both cards appear with one Lovelace resource. */
