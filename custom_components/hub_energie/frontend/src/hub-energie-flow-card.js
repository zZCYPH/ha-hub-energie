import { LitElement, css, html, nothing } from "lit";
import "./components/hub-power-flow-diagram.js";
import { I18N } from "./constants/i18n.js";
import {
  dayColorLabel,
  makeEntityMap,
} from "./utils/energy-utils.js";
import { fmtPowerCompact, readAttrOptionalFloat } from "./utils/format-utils.js";
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

const EDGE_CONFIG = Object.freeze([
  {
    key: "solar_to_home_power_w",
    from: "solar",
    to: "home",
    color: COLOR_SOLAR,
    path: "M200 72 C200 86 200 100 200 112",
    labelX: 200,
    labelY: 98,
  },
  {
    key: "battery_to_home_power_w",
    from: "battery",
    to: "home",
    color: COLOR_BATTERY,
    path: "M316 132 C290 132 258 132 232 132",
    labelX: 274,
    labelY: 120,
  },
  {
    key: "grid_to_home_power_w",
    from: "grid",
    to: "home",
    color: COLOR_GRID_SOURCE,
    path: "M84 132 C110 132 142 132 168 132",
    labelX: 126,
    labelY: 120,
  },
  {
    key: "solar_to_battery_power_w",
    from: "solar",
    to: "battery",
    color: COLOR_SOLAR,
    path: "M214 70 C250 78 286 96 316 118",
    labelX: 264,
    labelY: 88,
  },
  {
    key: "grid_to_battery_power_w",
    from: "grid",
    to: "battery",
    color: COLOR_GRID_TO_BATT,
    path: "M84 148 C146 194 252 194 316 148",
    labelX: 200,
    labelY: 194,
  },
  {
    key: "solar_export_power_w",
    from: "solar",
    to: "grid",
    color: COLOR_SOLAR_EXPORT,
    path: "M186 70 C150 78 114 96 84 118",
    labelX: 136,
    labelY: 88,
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
  return Math.max(2.4, Math.min(11.5, 2.4 + Math.log10(abs + 1) * 2.7));
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

  const edges = EDGE_CONFIG.map((edge) => {
    const value = values[edge.key];
    const opacity = activeOpacity(value, debug);
    return {
      ...edge,
      value,
      visible: debug ? value != null : opacity > 0,
      opacity,
      width: edgeWidth(value),
      duration: edgeDuration(value),
      label: value != null ? fmtPowerCompact(value) : null,
    };
  });

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

  const nodes = {
    grid: {
      kind: "grid",
      icon: "G",
      label: i18n.flowNodeGrid,
      value: gridDisplay != null ? fmtPowerCompact(gridDisplay) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 56,
      y: 132,
    },
    solar: {
      kind: "solar",
      icon: "S",
      label: i18n.flowNodeSolar,
      value: solarFromEdges != null ? fmtPowerCompact(solarFromEdges) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 200,
      y: 48,
    },
    home: {
      kind: "home",
      icon: "H",
      label: i18n.flowNodeHome,
      value: homeFromEdges != null ? fmtPowerCompact(homeFromEdges) : null,
      detail: null,
      muted: false,
      status: "active",
      x: 200,
      y: 132,
    },
    battery: batteryConfigured
      ? {
          kind: "battery",
          icon: batteryState === "unknown" ? "?" : "B",
          label: i18n.flowNodeBattery,
          value: batteryUi.value,
          detail: batteryUi.detail,
          muted: batteryUi.muted,
          status: batteryState,
          x: 344,
          y: 132,
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
  };

  static styles = css`
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
    super();
    this.hass = undefined;
    this._config = { type: CARD_TYPE };
    this._autoCompact = false;
    this._lastFp = null;
    this._resizeObserver = null;
    this._resizeTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._attachResizeObserver();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._resizeObserver = null;
    if (this._resizeTimer != null) clearTimeout(this._resizeTimer);
    this._resizeTimer = null;
  }

  firstUpdated() {
    this._scheduleLayoutMeasure();
  }

  setConfig(config) {
    this._config = config && typeof config === "object" ? { ...config, type: CARD_TYPE } : { type: CARD_TYPE };
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    const raw = Number(this._config?.grid_span ?? 1);
    const span = Number.isFinite(raw) ? Math.max(1, Math.min(3, Math.trunc(raw))) : 1;
    return {
      columns: span * 12,
      min_columns: 3,
      rows: 5,
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
          <div class="placeholder">
            <div class="title">${this._config?.title || i18n.flowCardTitle}</div>
            <div class="hint">${i18n.flowCardWaiting}</div>
            <div class="hint">${i18n.flowCardEntityHint}</div>
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

    return html`
      <ha-card class=${debug ? "debug-card" : ""}>
        <div class="wrap">
          <div class="header">
            <div class="title">${this._config?.title || i18n.flowCardTitle}</div>
            ${debug ? html`<span class="badge">${i18n.flowDebugBadge}</span>` : nothing}
          </div>
          ${mismatchWarning ? html`<div class="warning">${mismatchWarning}</div>` : nothing}
          <hub-power-flow-diagram
            .data=${vm.model}
            .i18n=${i18n}
            .layout=${resolvedLayout}
            .debug=${debug}
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
    const ids = makeEntityMap();
    const liveState = states?.[ids.frontendData];
    const metaState = states?.[ids.frontendMeta];
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
      ].map((key) => [key, readAttrOptionalFloat(states, ids.frontendData, key)]),
    );

    return {
      ready: true,
      model: buildDiagramModel(i18n, live, metaAttrs, layout, this._debugEnabled()),
    };
  }

  _stateFingerprint() {
    const states = this.hass?.states;
    if (!states) return null;
    const ids = makeEntityMap();
    const liveState = states[ids.frontendData];
    const metaState = states[ids.frontendMeta];
    const layout = this._resolvedLayout();
    const debug = this._debugEnabled();
    if (!liveState || !metaState) {
      return `missing|${layout}|${debug}|${Boolean(liveState)}|${Boolean(metaState)}`;
    }
    const liveAttrs = liveState.attributes ?? {};
    const metaAttrs = metaState.attributes ?? {};
    const parts = [
      layout,
      debug,
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

window.customCards ??= [];
window.customCards.push({
  type: "hub-energie-flow-card",
  name: "Hub Énergie Flow",
  description: "Live power-flow diagram using frontend_data/frontend_meta with debug and adaptive layout.",
  preview: false,
  documentationURL: "https://gitlab.com/zzcyph1/home-assistant/hub-energie",
});
