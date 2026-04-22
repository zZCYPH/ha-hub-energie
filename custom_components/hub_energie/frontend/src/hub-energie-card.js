import { LitElement, css, html, nothing } from "lit";
import { I18N } from "./constants/i18n.js";
import {
  COLOR_BATTERY,
  COLOR_SOLAR,
  COLOR_SOLAR_EXPORT,
  COLOR_SUBSCRIPTION,
} from "./constants/colors.js";
import {
  DEFAULT_POWER_GRAPH_ROLLING_HOURS,
  snapPowerGraphRollingHours,
} from "./constants/power-graph-window.js";
import { SLOTS } from "./constants/slots.js";
import {
  addCalendarDays,
  parisYmdStartUtc,
  rangeFromPreset,
  rangeLabel,
  todayParisISO,
} from "./utils/date-utils.js";
import { fmtEnergy, makeSectionEnergyFormatter } from "./utils/format-utils.js";
import {
  battChargeSlotRowsFromAttrs,
  dayColorClass,
  dayColorLabel,
  isCardReady,
  CARD_PAYLOAD_MARKER_ATTR,
  discoverCostEntityId,
  discoverLovelaceCardEntityId,
  entityMapFromCostAttributes,
  hubSitesFromStates,
  makeEntityMap,
  mergeHubCardAttributes,
  offerLabel,
  readSlotValue,
  slotLabel,
  slotMapFingerprint,
} from "./utils/energy-utils.js";
import { extractHubCardViewModel } from "./utils/card-extract.js";
import { fetchHistoryStates } from "./utils/fetch-history-states.js";
import { tpl } from "./utils/i18n-template.js";
import { buildBatteryData, buildPowerNowData } from "./utils/live-widget-data.js";
import {
  collectPowerGraphStatisticIds,
  fetchStatisticsDuringPeriod,
  mergePowerStatisticsToChartPoints,
  mergeStatsPointsWithLiveTail,
  readLivePowerGraphComponents,
  yExtentFromPowerChartPoints,
} from "./utils/power-graph-history.js";

import "./components/hub-energy-strip.js";
import "./components/hub-power-now.js";
import "./components/hub-solar-production-bar.js";
import "./components/hub-power-graph.js";
import "./components/hub-battery-bar.js";
import "./components/hub-insight-bar.js";

/* Do not import hub-energie-card-editor here: boot loads it first; a static import would
 * make the dynamically-imported hub-energie-card.js depend on ./hub-energie-card-editor.js
 * and break on some clients if that sibling chunk fails to resolve. */

class HubEnergieCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
      _date: { state: true },
      _rangePreset: { state: true },
      _showRaw: { state: true },
      _hist: { state: true },
      _histLoading: { state: true },
      _histErr: { state: true },
      _powerGraphOpen: { state: true },
      _powerGraphLoading: { state: true },
      _powerGraphErr: { state: true },
      _powerGraphSeries: { state: true },
      _powerGraphRollingHours: { state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }
      ha-card {
        width: 100%;
        padding: 8px 12px 10px;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }
      .header-title-side {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 8px 12px;
        min-width: 0;
      }
      .header h2 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .header-subtitle {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: min(280px, 100%);
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .controls label {
        font-size: 0.82rem;
        opacity: 0.7;
      }
      .range-btns {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .range-btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 999px;
        padding: 2px 8px;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .range-btn.active {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      input[type="date"] {
        background: var(--input-fill-color, var(--secondary-background-color));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.82rem;
        font-family: inherit;
        cursor: pointer;
      }
      .btn {
        background: none;
        border: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        border-radius: 6px;
        padding: 4px 10px;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .btn:hover {
        background: var(--secondary-background-color);
      }
      .alert {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #fff);
        font-size: 0.83rem;
        line-height: 1.5;
      }
      .alert code {
        background: rgba(0, 0, 0, 0.18);
        padding: 1px 4px;
        border-radius: 3px;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
      }
      .meta-tempo-wrap {
        margin: 0 0 6px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 8px;
      }
      /* Tempo: 6-row grid — left tiles span 3 rows each; right counters 2 rows each. auto rows = compact height. */
      .meta-tempo-wrap:has(.tempo-days) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: repeat(6, auto);
        gap: 4px;
        align-items: stretch;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / 4;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .meta-days-stack > .day-tile:nth-child(2) {
        grid-column: 1;
        grid-row: 4 / 7;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-days {
        display: contents;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(1) {
        grid-column: 2;
        grid-row: 1 / 3;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(2) {
        grid-column: 2;
        grid-row: 3 / 5;
        min-height: 0;
      }
      .meta-tempo-wrap:has(.tempo-days) .tempo-day:nth-child(3) {
        grid-column: 2;
        grid-row: 5 / 7;
        min-height: 0;
      }
      .meta-days-stack {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .day-tile {
        border-radius: 8px;
        padding: 4px 8px;
        min-height: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-sizing: border-box;
      }
      .meta-tempo-wrap:has(.tempo-days) .day-tile {
        min-height: 0;
        padding: 3px 8px;
      }
      .day-tile-label {
        font-size: 0.58rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.92;
        margin-bottom: 1px;
      }
      .day-tile-value {
        font-size: 0.74rem;
        font-weight: 700;
        line-height: 1.15;
      }
      .day-tile.color-blue {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-blue .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-white {
        background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
        color: #eceff1;
        border-color: rgba(255, 255, 255, 0.22);
      }
      .day-tile.color-white .day-tile-label {
        color: rgba(236, 239, 241, 0.88);
      }
      .day-tile.color-red {
        background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.28);
      }
      .day-tile.color-red .day-tile-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .day-tile.color-na {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-color: var(--divider-color);
      }
      .day-tile.color-na .day-tile-label {
        color: var(--secondary-text-color);
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        background: var(--secondary-background-color);
      }
      .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .color-blue {
        background: #1e88e5;
      }
      .color-white {
        background: #b0bec5;
      }
      .color-red {
        background: #e53935;
      }
      .color-na {
        background: #757575;
      }
      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        vertical-align: middle;
      }
      .status-green {
        background: #43a047;
      }
      .status-amber {
        background: #f9a825;
      }
      .status-red {
        background: #e53935;
      }
      .red-hp-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
        padding: 7px 12px;
        border-radius: 8px;
        background: color-mix(in srgb, #e53935 14%, var(--card-background-color, #1c1c1c));
        border: 1px solid color-mix(in srgb, #e53935 48%, transparent);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--primary-text-color);
      }
      .tempo-days {
        flex: 1;
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .tempo-day {
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 0.68rem;
        font-weight: 700;
        line-height: 1.2;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tempo-blue {
        border-left: 3px solid #42a5f5;
      }
      .tempo-white {
        border-left: 3px solid #9e9e9e;
      }
      .tempo-red {
        border-left: 3px solid #ef5350;
      }
      section {
        margin-bottom: 10px;
        padding: 6px 8px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 70%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      section:last-of-type {
        margin-bottom: 0;
      }
      .section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 4px;
        margin: 0 0 4px;
        border-bottom: 1px dashed color-mix(in srgb, var(--divider-color) 70%, transparent);
      }
      .section-head h3 {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-metric {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        color: var(--secondary-text-color);
        font-size: 0.68rem;
        white-space: nowrap;
      }
      .section-metric b {
        color: var(--primary-text-color);
        font-weight: 900;
        font-variant-numeric: tabular-nums;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .raw {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 10px;
        font-size: 0.78rem;
        font-family: var(--ha-font-family-code, monospace);
        line-height: 1.7;
      }
      .raw-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .raw-grid b {
        display: block;
        margin-bottom: 2px;
      }
    `;
  }

  constructor() {
    super();
    this._config = {};
    this._date = todayParisISO();
    this._rangePreset = "day";
    this._showRaw = false;
    this._hist = null;
    this._histLoading = false;
    this._histErr = null;
    this.__lastKey = null;
    this._powerGraphOpen = false;
    this._powerGraphLoading = false;
    this._powerGraphErr = null;
    this._powerGraphSeries = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._hassRetryTimer = null;
    /** @type {number | null} */
    this._costMissingSinceMs = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._powerGraphPollTimer = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._liveStatePollTimer = null;
    /** Last ``_stateKey()`` seen by the live poll (detect in-place ``hass.states`` mutations). */
    this.__livePollSnap = null;
    /** Bumps on each new window load; refresh uses current id without bumping (see _loadPowerGraph). */
    this._powerGraphLoadId = 0;
    this._powerGraphRollingHours = DEFAULT_POWER_GRAPH_ROLLING_HOURS;
  }

  connectedCallback() {
    super.connectedCallback();
    /* After F5, hass may attach before the websocket state map is populated — tick twice. */
    requestAnimationFrame(() => requestAnimationFrame(() => this.requestUpdate()));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearHassRetryTimer();
    this._clearPowerGraphPollTimer();
    this._clearLiveStatePollTimer();
    this._costMissingSinceMs = null;
  }

  _clearPowerGraphPollTimer() {
    if (this._powerGraphPollTimer != null) {
      clearInterval(this._powerGraphPollTimer);
      this._powerGraphPollTimer = null;
    }
  }

  _clearLiveStatePollTimer() {
    if (this._liveStatePollTimer != null) {
      clearInterval(this._liveStatePollTimer);
      this._liveStatePollTimer = null;
    }
  }

  /**
   * Home Assistant may update entity attributes in-place on ``hass.states`` without replacing
   * the ``hass`` object, so Lit never runs ``shouldUpdate``. Poll the cost fingerprint in live
   * mode and force a repaint when it changes.
   */
  _syncLiveStatePollTimer() {
    this._clearLiveStatePollTimer();
    if (!this.hass) return;
    if (!this._isLiveMode()) return;
    let costId;
    let payloadId;
    try {
      const E = this._map();
      costId = E.cost;
      payloadId = this._payloadEntityId() ?? costId;
    } catch {
      return;
    }
    if (!isCardReady(this.hass.states, costId)) return;
    if (payloadId !== costId && !isCardReady(this.hass.states, payloadId)) return;
    this._liveStatePollTimer = window.setInterval(() => {
      if (!this.hass || !this._isLiveMode()) return;
      let snap;
      try {
        snap = this._stateKey();
      } catch {
        this.__livePollSnap = null;
        this.requestUpdate();
        return;
      }
      if (snap !== this.__livePollSnap) {
        this.__livePollSnap = snap;
        this.__lastKey = null;
        this.requestUpdate();
      }
    }, 4000);
  }

  /** Refresh interval only while the graph shows the current Paris day (live tail). */
  _syncPowerGraphPollTimer() {
    this._clearPowerGraphPollTimer();
    if (!this._powerGraphOpen || !this.hass) return;
    const ymd = this._date ?? todayParisISO();
    if (ymd !== todayParisISO()) return;
    const secRaw = parseFloat(this._config?.power_history_refresh_seconds);
    const periodMs = Number.isFinite(secRaw) && secRaw > 0
      ? Math.max(15_000, Math.min(300_000, Math.round(secRaw * 1000)))
      : 120_000;
    this._powerGraphPollTimer = window.setInterval(() => {
      if (this._powerGraphOpen && this.hass) {
        this._loadPowerGraph({ refresh: true });
      }
    }, periodMs);
  }

  _setPowerGraphRollingHours(hours) {
    const h = snapPowerGraphRollingHours(hours, DEFAULT_POWER_GRAPH_ROLLING_HOURS);
    if (this._powerGraphRollingHours === h) return;
    this._powerGraphRollingHours = h;
    this.__lastKey = null;
  }

  _clearHassRetryTimer() {
    if (this._hassRetryTimer != null) {
      clearTimeout(this._hassRetryTimer);
      this._hassRetryTimer = null;
    }
  }

  _scheduleHassRetry(delayMs = 96) {
    if (this._hassRetryTimer != null) return;
    this._hassRetryTimer = setTimeout(() => {
      this._hassRetryTimer = null;
      this.requestUpdate();
    }, delayMs);
  }

  /**
   * Live mode + cost_detail not in hass.states yet: wait for HA/WebSocket instead of error UI.
   * Returns true when we should show the bootstrap placeholder (and schedule retries).
   */
  _liveBootstrapWaiting(costEntityId) {
    const h = this.hass;
    if (!h || !this._isLiveMode()) return false;
    const states = h.states;
    if (isCardReady(states, costEntityId)) {
      this._costMissingSinceMs = null;
      return false;
    }
    if (h.connected === false) {
      this._scheduleHassRetry();
      return true;
    }
    const n = states && typeof states === "object" ? Object.keys(states).length : 0;
    if (n === 0) {
      this._scheduleHassRetry();
      return true;
    }
    const now = performance.now();
    if (this._costMissingSinceMs == null) this._costMissingSinceMs = now;
    /* Brief grace: entity may register a tick after the first state broadcast. */
    if (now - this._costMissingSinceMs < 1800) {
      this._scheduleHassRetry();
      return true;
    }
    return false;
  }

  setConfig(config) {
    this._config = config ?? {};
    this.__lastKey = null;
    if (this._config.show_raw_control === false) this._showRaw = false;
    if (this._config.show_live_power === false && this._powerGraphOpen) {
      this._powerGraphOpen = false;
      this._clearPowerGraphPollTimer();
    }
    const raw = parseFloat(this._config?.power_history_hours);
    const snapped = snapPowerGraphRollingHours(
      Number.isFinite(raw) ? raw : NaN,
      DEFAULT_POWER_GRAPH_ROLLING_HOURS,
    );
    if (this._powerGraphRollingHours !== snapped) {
      this._powerGraphRollingHours = snapped;
      this.__lastKey = null;
    }
    this.requestUpdate();
  }

  /** 0-based Hub Énergie site index from card YAML (``site_index``); null = auto when only one site. */
  _siteIndexFromConfig() {
    const raw = this._config?.site_index;
    if (raw === "" || raw === undefined || raw === null) return null;
    const n = Math.trunc(Number(raw));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  getCardSize() {
    return 8;
  }

  /** Default size from grid_span; loose min bounds so sections "Layout" can resize / full width. */
  getGridOptions() {
    const raw = Number(this._config?.grid_span ?? 1);
    const span = Number.isFinite(raw) ? Math.max(1, Math.min(3, Math.trunc(raw))) : 1;
    const defaultCols = span * 12;
    return {
      columns: defaultCols,
      min_columns: 3,
      rows: 8,
      min_rows: 4,
    };
  }

  static getConfigElement() {
    return document.createElement("hub-energie-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:hub-energie-card",
      grid_span: 2,
    };
  }

  shouldUpdate(changedProps) {
    if (changedProps.has("hass") && changedProps.size === 1 && this.hass) {
      try {
        /* While cost_detail is absent in live mode, state fingerprints can stay identical
         * (empty states) and Lit would skip updates — never recover. Always refresh until ready. */
        if (this._isLiveMode()) {
          const E = this._map();
          if (!isCardReady(this.hass.states, E.cost)) {
            this.__lastKey = null;
            return true;
          }
        }
      } catch {
        this.__lastKey = null;
        return true;
      }
    }
    if (changedProps.has("hass") && changedProps.size === 1) {
      let key;
      try {
        key = this._stateKey();
      } catch {
        /* Avoid throwing into HA's hui-card hass setter (shows generic "Configuration error"). */
        key = null;
      }
      if (key !== null && key === this.__lastKey) return false;
      this.__lastKey = key;
      return true;
    }
    return true;
  }

  firstUpdated(_changedProps) {
    super.firstUpdated(_changedProps);
    this.__livePollSnap = null;
    this._syncLiveStatePollTimer();
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("hass") || changedProps.has("_date") || changedProps.has("_rangePreset")) {
      this._loadHistory();
      this.__livePollSnap = null;
      this._syncLiveStatePollTimer();
    }
    if (
      this._powerGraphOpen &&
      (changedProps.has("_date") || changedProps.has("_powerGraphRollingHours")) &&
      this.hass
    ) {
      this._powerGraphSeries = null;
      this._powerGraphErr = null;
      this._loadPowerGraph({ force: true });
      this._syncPowerGraphPollTimer();
    }
  }

  _i18n() {
    const lang = String(this.hass?.locale?.language ?? "fr").toLowerCase();
    return lang.startsWith("en") ? I18N.en : I18N.fr;
  }

  /** Section visibility: default on; explicit false hides. */
  _showSection(key) {
    const v = this._config?.[key];
    return v !== false && v !== "false";
  }

  _map() {
    const states = this.hass?.states;
    const costId = discoverCostEntityId(states, this._siteIndexFromConfig());
    const costAttrs = states?.[costId]?.attributes;
    return entityMapFromCostAttributes(costAttrs, makeEntityMap(), costId);
  }

  /** ``sensor.*_lovelace_card`` (Frontend) for live W / kWh card attrs; falls back to ``cost_detail``. */
  _payloadEntityId() {
    const states = this.hass?.states;
    if (!states) return null;
    let E;
    try {
      E = this._map();
    } catch {
      return null;
    }
    if (E.lovelaceCard && states[E.lovelaceCard]) return E.lovelaceCard;
    const discovered = discoverLovelaceCardEntityId(states, this._siteIndexFromConfig());
    if (discovered && states[discovered]?.attributes?.[CARD_PAYLOAD_MARKER_ATTR] === true) return discovered;
    return E.cost;
  }

  _mergedCostAttributes() {
    const states = this.hass?.states;
    if (!states) return {};
    let E;
    try {
      E = this._map();
    } catch {
      return {};
    }
    const costId = E.cost;
    const lcId = this._payloadEntityId();
    if (!costId) return {};
    return mergeHubCardAttributes(
      lcId ? states[lcId]?.attributes : undefined,
      states[costId]?.attributes,
    );
  }

  _getRange() {
    return rangeFromPreset(this._date ?? todayParisISO(), this._rangePreset ?? "day");
  }

  _isLiveMode() {
    const r = this._getRange();
    return (this._rangePreset ?? "day") === "day" && r.endIso === todayParisISO();
  }

  /** Safe fingerprint for change detection; must never throw (used from shouldUpdate). */
  _fingerprintTempoDays(raw) {
    if (raw == null) return "";
    if (typeof raw !== "object") return String(raw);
    try {
      return JSON.stringify(raw);
    } catch {
      return "";
    }
  }

  _stateKey() {
    const r = this._getRange();
    if (!this._isLiveMode()) {
      return `hist:${r.startIso}:${r.endIso}:${this._rangePreset ?? "day"}:${this._histLoading ? "loading" : this._hist ? "ok" : "none"}:${this._histErr ?? ""}`;
    }
    const states = this.hass?.states;
    if (!states) return null;
    const E = this._map();
    const payloadId = this._payloadEntityId() ?? E.cost;
    const ids = [
      E.cost,
      E.lovelaceCard,
      E.ecoSolar,
      E.ecoBatt,
      E.originGrid,
      E.originSolar,
      E.usageGridDirect,
      E.usageGridBatt,
      E.usageSolarDirect,
      E.usageSolarBatt,
      E.usageBattHome,
    ];
    const costAttrs = this._mergedCostAttributes();
    const cardSeg = costAttrs.card_site_segment;
    const cardIds = costAttrs.card_entity_ids;
    const cardIdsKey =
      cardIds && typeof cardIds === "object"
        ? Object.keys(cardIds)
            .sort()
            .map((k) => `${k}:${cardIds[k]}`)
            .join("|")
        : "";
    const attrsKey = [
      String(this._siteIndexFromConfig() ?? ""),
      E.cost,
      cardSeg ?? "",
      cardIdsKey,
      costAttrs.offer ?? "",
      costAttrs.contract_power ?? "",
      costAttrs.tariff_fetched_at ?? "",
      costAttrs.current_slot ?? "",
      costAttrs.reinjection_cause ?? "",
      String(costAttrs.reinjection_confidence ?? ""),
      this._fingerprintTempoDays(costAttrs.tempo_days),
      costAttrs.grid_power_signed_w ?? "",
      costAttrs.solar_power_w ?? "",
      costAttrs.solar_estimate_power_w ?? "",
      costAttrs.batt_discharge_power_w ?? "",
      costAttrs.batt_charge_power_w ?? "",
      costAttrs.load_power_w ?? "",
      costAttrs.export_power_w ?? "",
      costAttrs.battery_soc_percent ?? "",
      costAttrs.battery_capacity_kwh ?? "",
      slotMapFingerprint(costAttrs.grid_by_slot_kwh),
      slotMapFingerprint(costAttrs.maison_by_slot_kwh),
      slotMapFingerprint(costAttrs.usage_grid_batt_charge_by_slot_kwh),
      slotMapFingerprint(costAttrs.usage_solar_batt_charge_by_slot_kwh),
      states[E.cost]?.last_updated ?? "",
      states[payloadId]?.last_updated ?? "",
    ].join("|");
    return `${ids.map((id) => states[id]?.state ?? "").join("|")}|${attrsKey}`;
  }

  _states() {
    return (this._isLiveMode() ? this.hass?.states : this._hist) ?? {};
  }

  _extract(i18n) {
    const merged = this._isLiveMode() ? this._mergedCostAttributes() : undefined;
    return extractHubCardViewModel(this._states(), this._map(), i18n, merged);
  }

  _onDateChange(e) {
    this._date = e.target.value;
    this._hist = null;
    this._histLoading = false;
    this._histErr = null;
    this.__lastKey = null;
  }

  _setRangePreset(preset) {
    this._rangePreset = preset;
    this._hist = null;
    this._histLoading = false;
    this._histErr = null;
    this.__lastKey = null;
  }

  _onRawToggle() {
    this._showRaw = !this._showRaw;
    this.__lastKey = null;
  }

  _onSiteChange(ev) {
    ev.stopPropagation();
    const sel = ev.target;
    if (sel?.value === undefined) return;
    const v = sel.value;
    const next = { ...this._config, type: "custom:hub-energie-card" };
    if (v === "" || v === "__auto__") delete next.site_index;
    else next.site_index = Math.max(0, Math.trunc(Number(v)));
    this._config = next;
    this.__lastKey = null;
    this._hist = null;
    this._histLoading = false;
    this._histErr = null;
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: next },
      }),
    );
  }

  _loadHistory() {
    if (this._isLiveMode()) return;
    if (!this.hass || this._histLoading || this._hist !== null) return;

    this._histLoading = true;
    const E = this._map();
    const r = this._getRange();
    const lcId = E.lovelaceCard;
    const ids = [
      E.cost,
      ...(lcId && lcId !== E.cost ? [lcId] : []),
      E.ecoSolar,
      E.ecoBatt,
      E.originGrid,
      E.originSolar,
      E.usageGridDirect,
      E.usageGridBatt,
      E.usageSolarDirect,
      E.usageSolarBatt,
      E.usageBattHome,
    ];

    fetchHistoryStates(this.hass, r.startIso, r.endIso, ids, E.cost, lcId !== E.cost ? lcId : undefined)
      .then((data) => {
        this._hist = data;
        this._histErr = null;
      })
      .catch((err) => {
        this._histErr = err.message ?? String(err);
        this._hist = null;
      })
      .finally(() => {
        this._histLoading = false;
        this.__lastKey = null;
      });
  }

  /**
   * @param {{ refresh?: boolean; force?: boolean }} [opts]
   *   refresh: reload statistics while the graph stays open (no full-screen loading).
   *   force: new window fetch even if a previous load is still in flight (date / duration change).
   */
  async _loadPowerGraph(opts = {}) {
    const refresh = opts.refresh === true;
    const force = opts.force === true;
    if (!this.hass) return;
    if (!this._powerGraphOpen) return;
    const E = this._map();
    const costId = E.cost;
    const payloadId = this._payloadEntityId() ?? costId;
    if (!costId) return;
    if (!refresh) {
      if (!force && (this._powerGraphLoading || this._powerGraphSeries !== null)) return;
      this._powerGraphLoading = true;
      this._powerGraphErr = null;
    }

    let myLoadId;
    if (refresh) {
      myLoadId = this._powerGraphLoadId;
    } else {
      this._powerGraphLoadId += 1;
      myLoadId = this._powerGraphLoadId;
    }

    const selectedYmd = this._date ?? todayParisISO();
    const rollingH = snapPowerGraphRollingHours(
      this._powerGraphRollingHours,
      DEFAULT_POWER_GRAPH_ROLLING_HOURS,
    );
    const isTodayParis = selectedYmd === todayParisISO();
    let start;
    let end;
    let useLiveTail = false;
    let windowMode = "day";
    /** @type {number | null} */
    let rollingHoursOut = null;
    let hoursBackMeta = 24;

    if (isTodayParis) {
      windowMode = "rolling";
      rollingHoursOut = rollingH;
      hoursBackMeta = rollingH;
      const now = new Date();
      end = now;
      start = new Date(now.getTime() - rollingH * 60 * 60 * 1000);
      useLiveTail = true;
    } else {
      start = parisYmdStartUtc(selectedYmd);
      end = parisYmdStartUtc(addCalendarDays(selectedYmd, 1));
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
        if (!refresh && this._powerGraphLoadId === myLoadId) {
          this._powerGraphLoading = false;
          this._powerGraphErr = this._i18n().noData;
          this._powerGraphSeries = null;
        }
        return;
      }
    }

    const emptySeriesMeta = {
      hoursBack: hoursBackMeta,
      statsPts: [],
      hasLoadEntity: false,
      useLiveTail,
      windowMode,
      rollingHours: rollingHoursOut,
      dayIso: selectedYmd,
    };

    const i18n = this._i18n();
    try {
      const mapRaw = this.hass.states[payloadId]?.attributes?.power_graph_entity_map;
      const map = mapRaw && typeof mapRaw === "object" ? mapRaw : null;
      const statisticIds = collectPowerGraphStatisticIds(map);
      if (!statisticIds.length) {
        if (!refresh && this._powerGraphLoadId === myLoadId) {
          this._powerGraphErr = i18n.powerHistoryNoSensors;
          this._powerGraphSeries = { ...emptySeriesMeta };
        }
        return;
      }

      const statsResult = await fetchStatisticsDuringPeriod(this.hass, {
        startTimeIso: start.toISOString(),
        endTimeIso: end.toISOString(),
        statisticIds,
        period: "5minute",
      });
      if (this._powerGraphLoadId !== myLoadId) return;
      if (!this._powerGraphOpen) return;
      if ((this._date ?? todayParisISO()) !== selectedYmd) return;
      if (
        isTodayParis &&
        snapPowerGraphRollingHours(this._powerGraphRollingHours, DEFAULT_POWER_GRAPH_ROLLING_HOURS) !==
          rollingH
      )
        return;

      const merged = mergePowerStatisticsToChartPoints(map, statsResult);
      if (!merged?.filled?.length) {
        if (!refresh && this._powerGraphLoadId === myLoadId) {
          this._powerGraphErr = i18n.powerHistoryNoStatistics;
          this._powerGraphSeries = {
            ...emptySeriesMeta,
            hasLoadEntity: typeof map?.load_entity === "string" && map.load_entity.trim() !== "",
          };
        }
        return;
      }
      const filled = merged.filled;

      const maxPoints = 160;
      const downsample = (arr) => {
        if (arr.length <= maxPoints) return arr;
        const step = arr.length / maxPoints;
        const out = [];
        for (let i = 0; i < maxPoints; i++) {
          out.push(arr[Math.floor(i * step)]);
        }
        return out;
      };
      const statsPts = downsample(filled);
      if (this._powerGraphLoadId === myLoadId) {
        this._powerGraphSeries = {
          hoursBack: hoursBackMeta,
          statsPts,
          hasLoadEntity: typeof map?.load_entity === "string" && map.load_entity.trim() !== "",
          useLiveTail,
          windowMode,
          rollingHours: rollingHoursOut,
          dayIso: selectedYmd,
        };
      }
    } catch (err) {
      if (!refresh && this._powerGraphLoadId === myLoadId) {
        this._powerGraphErr = err?.message ?? String(err);
        this._powerGraphSeries = null;
      }
    } finally {
      if (!refresh && this._powerGraphLoadId === myLoadId) {
        this._powerGraphLoading = false;
      }
      this.__lastKey = null;
    }
  }

  _togglePowerGraph() {
    const next = !this._powerGraphOpen;
    this._powerGraphOpen = next;
    this.__lastKey = null;
    if (!next) {
      this._clearPowerGraphPollTimer();
    }
    if (next) {
      this._powerGraphSeries = null;
      this._powerGraphErr = null;
      this._loadPowerGraph();
      this._syncPowerGraphPollTimer();
    }
  }

  _powerGraphDisplaySeries() {
    if (!this._powerGraphOpen) return null;
    const ser = this._powerGraphSeries;
    if (!ser?.statsPts?.length) return null;
    const useLive = ser.useLiveTail === true;
    const E = this._map();
    const costId = E.cost;
    const payloadId = this._payloadEntityId() ?? costId;
    const mapRaw = payloadId ? this.hass?.states[payloadId]?.attributes?.power_graph_entity_map : null;
    const map = mapRaw && typeof mapRaw === "object" ? mapRaw : null;
    const live = useLive && map && this.hass ? readLivePowerGraphComponents(this.hass, map) : null;
    const pts = useLive ? mergeStatsPointsWithLiveTail(ser.statsPts, live) : ser.statsPts;
    const { yMin, yMax } = yExtentFromPowerChartPoints(pts);
    return {
      hoursBack: ser.hoursBack,
      pts,
      yMin,
      yMax,
      hasLoadEntity: ser.hasLoadEntity === true,
      windowMode: ser.windowMode ?? "rolling",
      rollingHours: ser.rollingHours ?? null,
      dayIso: ser.dayIso ?? (this._date ?? todayParisISO()),
      useLiveTail: useLive,
    };
  }

  _renderRedHpWarning(grid, offer, totalMaison, usage, i18n) {
    if (offer !== "tempo" || totalMaison <= 0) return nothing;
    const rougeHpItem = (grid ?? []).find((s) => s.id === "rouge_hp");
    const rougeHpKwh = rougeHpItem?.v ?? 0;
    if (rougeHpKwh < 0.1) return nothing;
    const renewableKwh = (usage.solarDirect?.v ?? 0) + (usage.solarBatt?.v ?? 0) + (usage.battHome?.v ?? 0);
    if (rougeHpKwh / totalMaison < 0.35 || rougeHpKwh <= renewableKwh) return nothing;
    return html`<div class="red-hp-banner">⚠️ ${i18n.redHpWarning}</div>`;
  }

  _renderSlotMapRaw(slotMap, offer, i18n) {
    const dash = i18n.emDash;
    if (!slotMap || typeof slotMap !== "object") return dash;
    const rows = SLOTS.map((s) => {
      const raw = slotMap[s.id];
      const v = typeof raw === "number" ? raw : parseFloat(raw);
      return Number.isFinite(v) && v > 0.00001 ? { label: slotLabel(s.id, offer, i18n), v } : null;
    }).filter(Boolean);
    if (!rows.length) return dash;
    return rows.map((r, i) => html`${i > 0 ? html`<br />` : nothing}${r.label}: ${r.v.toFixed(3)} kWh`);
  }

  render() {
    try {
      return this._renderCardImpl();
    } catch (err) {
      console.warn("[hub-energie-card] render error", err);
      let msg = "…";
      try {
        msg = this._i18n()?.waitingHassBootstrap ?? "…";
      } catch {
        /* ignore */
      }
      return html`<ha-card><div class="loader">${msg}</div></ha-card>`;
    }
  }

  _renderCardImpl() {
    const i18n = this._i18n();
    if (!this.hass) return html`<ha-card></ha-card>`;

    const locale = String(this.hass?.locale?.language ?? "fr").toLowerCase().startsWith("en") ? "en-GB" : "fr-FR";
    const isToday = this._isLiveMode();
    const E = this._map();

    const payloadId = this._payloadEntityId() ?? E.cost;
    if (
      isToday &&
      (!isCardReady(this.hass?.states, E.cost) ||
        (payloadId !== E.cost && !isCardReady(this.hass?.states, payloadId)))
    ) {
      if (this._liveBootstrapWaiting(E.cost)) {
        return html`
          <ha-card>
            <div class="header"><h2>Hub Énergie</h2></div>
            <div class="loader">${i18n.waitingHassBootstrap}</div>
          </ha-card>
        `;
      }
      return html`
        <ha-card>
          <div class="header"><h2>Hub Énergie</h2></div>
          <div class="alert">
            ${i18n.costEntityNotFoundBefore} <code>${E.cost}</code> ${i18n.costEntityNotFoundAfter}<br />
            ${i18n.costEntityCardHint}
          </div>
        </ha-card>
      `;
    }

    const r = this._getRange();
    const {
      grid,
      maison,
      totalEur,
      costs,
      abo,
      ecoSolar,
      ecoBatt,
      og,
      os,
      usage,
      costEntityOk,
      offer,
      contractPower,
      currentSlot,
      tempoDays,
      todayColor,
      tomorrowColor,
      reinj,
      gridBattBySlot,
      solarBattBySlot,
    } = this._extract(i18n);

    const totalGrid = grid.reduce((a, s) => a + s.v, 0);
    const totalMaison = maison.reduce((a, s) => a + s.v, 0);
    const activeGrid = grid.filter((s) => s.v > 0.001);
    const activeCosts = costs.filter((s) => s.v > 0.0005);
    const ecoTotal = ecoSolar + ecoBatt;

    const gridEnergyFmt = makeSectionEnergyFormatter([totalGrid, ...grid.map((s) => s.v), usage.gridDirect.v, usage.gridBatt.v]);
    // "House supply" strip should exclude battery charging from grid/solar slices.
    // Grid is already "direct to house" on the backend; solar "direct" can include solar->battery, so we subtract it here.
    const homeGridKwh = usage.gridDirect.v;
    const homeSolarKwh = Math.max(0, usage.solarDirect.v - usage.solarBatt.v);
    const homeBattKwh = usage.battHome.v;
    const homeSupplyTotal = homeGridKwh + homeSolarKwh + homeBattKwh;
    const homeEnergyFmt = makeSectionEnergyFormatter([homeSupplyTotal, homeGridKwh, homeSolarKwh, homeBattKwh]);
    const battChgTotal = usage.gridBatt.v + usage.solarBatt.v;
    const gridBattSlotRows = costEntityOk
      ? battChargeSlotRowsFromAttrs(offer, gridBattBySlot, i18n)
      : [];
    const solarBattSlotRows = costEntityOk
      ? battChargeSlotRowsFromAttrs(offer, solarBattBySlot, i18n)
      : [];
    const hasBattChgSlotDetail =
      costEntityOk &&
      (gridBattSlotRows.length > 0 || solarBattSlotRows.length > 0);
    /** One row set: solar (slots or single) then grid (slots or single), for a single strip. */
    const battChgRows = [];
    if (hasBattChgSlotDetail) {
      if (solarBattSlotRows.length) {
        const solarTotal = solarBattSlotRows.reduce((a, r) => a + (Number.isFinite(r?.v) ? r.v : 0), 0);
        if (solarTotal > 0.00001) {
          battChgRows.push({
            label: i18n.brkTblSolar,
            v: solarTotal,
            color: usage.solarBatt.color,
            isHc: false,
          });
        }
      } else if (usage.solarBatt.v > 0.001) {
        battChgRows.push({
          label: i18n.brkTblSolar,
          v: usage.solarBatt.v,
          color: usage.solarBatt.color,
          isHc: false,
        });
      }
      if (gridBattSlotRows.length) {
        for (const r of gridBattSlotRows) {
          battChgRows.push({
            label: `${i18n.brkTblGridHome} · ${r.label}`,
            v: r.v,
            color: r.color,
            isHc: r.isHc,
          });
        }
      } else if (usage.gridBatt.v > 0.001) {
        battChgRows.push({
          label: i18n.brkTblGridHome,
          v: usage.gridBatt.v,
          color: usage.gridBatt.color,
          isHc: false,
        });
      }
    } else {
      if (usage.gridBatt.v > 0.001) {
        battChgRows.push({
          label: i18n.brkTblGridHome,
          v: usage.gridBatt.v,
          color: usage.gridBatt.color,
          isHc: false,
        });
      }
      if (usage.solarBatt.v > 0.001) {
        battChgRows.push({
          label: i18n.brkTblSolar,
          v: usage.solarBatt.v,
          color: usage.solarBatt.color,
          isHc: false,
        });
      }
    }
    const battChgEnergyFmt = makeSectionEnergyFormatter([
      battChgTotal,
      ...battChgRows.map((r) => r.v),
    ]);

    const gridSegments = activeGrid.map((s) => ({ value: s.v, color: s.color, className: s.isHc ? "fill-hc" : "" }));
    const gridBreakdown = activeGrid.map((s) => ({
      label: slotLabel(s.id, offer, i18n),
      value: gridEnergyFmt(s.v),
      color: s.color,
      rawV: s.v,
    }));

    const homeOrdered = [
      { label: i18n.brkTblGridHome, v: homeGridKwh, color: usage.gridDirect.color },
      { label: i18n.brkTblSolar, v: homeSolarKwh, color: usage.solarDirect.color },
      { label: i18n.brkTblBattHome, v: homeBattKwh, color: usage.battHome.color },
    ].filter((x) => x.v > 0.001);
    const homeSegments = homeOrdered.map((x) => ({ value: x.v, color: x.color }));
    const homeBreakdown = homeOrdered.map((x) => ({
      label: x.label,
      value: homeEnergyFmt(x.v),
      color: x.color,
      rawV: x.v,
    }));

    const battSegments = battChgRows.map((r) => ({
      value: r.v,
      color: r.color,
      className: r.isHc ? "fill-hc" : "",
    }));
    const battBreakdown = battChgRows.map((r) => ({
      label: r.label,
      value: battChgEnergyFmt(r.v),
      color: r.color,
      rawV: r.v,
    }));

    const costSegments = [
      ...activeCosts.map((s) => ({ value: s.v, color: s.color, className: s.isHc ? "fill-hc" : "" })),
      ...(abo > 0.0005 ? [{ value: abo, color: COLOR_SUBSCRIPTION }] : []),
    ];
    const costBreakdown = [
      ...activeCosts.map((s) => ({
        label: slotLabel(s.id, offer, i18n),
        value: `${s.v.toFixed(2)} €`,
        color: s.color,
        rawV: s.v,
      })),
      ...(abo > 0.0005 ? [{ label: i18n.costSubscription, value: `${abo.toFixed(2)} €`, color: COLOR_SUBSCRIPTION, rawV: abo }] : []),
    ];

    const reinjItems = [
      { label: i18n.reinjCauseSolarSurplus, v: reinj.solarSurplus, eur: reinj.oppSolarEur, color: COLOR_SOLAR },
      { label: i18n.reinjCauseBatteryFull, v: reinj.batteryFull, eur: reinj.oppBatteryEur, color: COLOR_BATTERY },
      { label: i18n.reinjCauseSwitchLatency, v: reinj.switchLatency, eur: reinj.oppLatencyEur, color: "#ff7043" },
      { label: i18n.reinjCauseOther, v: reinj.unattributed, eur: reinj.oppOtherEur, color: "#90a4ae" },
    ].filter((x) => x.v > 0.0001);
    const totalReinj = reinjItems.reduce((a, x) => a + x.v, 0);
    const reinjEnergyFmt = makeSectionEnergyFormatter([totalReinj, ...reinjItems.map((x) => x.v)]);
    const reinjSegments = reinjItems.map((x) => ({ value: x.v, color: x.color }));
    const reinjBreakdown = reinjItems.map((x) => ({
      label: x.label,
      value: `${reinjEnergyFmt(x.v)} · ${x.eur.toFixed(2)} €`,
      color: x.color,
      rawV: x.v,
    }));

    const ecoParts = [
      { label: i18n.ecoSourceSolar, vAbs: Math.abs(ecoSolar), color: COLOR_SOLAR, fmt: `${ecoSolar >= 0 ? "+" : ""}${ecoSolar.toFixed(2)} €`, rawV: ecoSolar },
      { label: i18n.ecoSourceBatt, vAbs: Math.abs(ecoBatt), color: COLOR_BATTERY, fmt: `${ecoBatt >= 0 ? "+" : ""}${ecoBatt.toFixed(2)} €`, rawV: ecoBatt },
    ].filter((x) => x.vAbs > 0.0005);
    const totalEcoAbs = ecoParts.reduce((a, x) => a + x.vAbs, 0);
    const ecoSegments = ecoParts.length
      ? ecoParts.map((x) => ({ value: x.vAbs, color: x.color }))
      : Math.abs(ecoTotal) > 0.0005
        ? [{ value: 1, color: ecoTotal >= 0 ? "#1976d2" : "#c62828" }]
        : [];
    const ecoBreakdown = ecoParts.length
      ? ecoParts.map((x) => ({ label: x.label, value: x.fmt, color: x.color, rawV: x.vAbs }))
      : [];

    const liveStates = this._states();
    const payloadForLive = this._payloadEntityId() ?? E.cost;
    const powerNowData = isToday && costEntityOk ? buildPowerNowData(liveStates, payloadForLive, i18n) : null;
    const solarKwhTotal = homeSolarKwh + usage.solarBatt.v + reinj.solarSurplus;
    const solarKwhFmt = makeSectionEnergyFormatter([
      solarKwhTotal,
      homeSolarKwh,
      usage.solarBatt.v,
      reinj.solarSurplus,
    ]);
    const solarKwhData =
      costEntityOk && solarKwhTotal > 0.001
        ? {
            segments: [
              {
                label: i18n.solarProdSegHome,
                value: homeSolarKwh,
                color: COLOR_SOLAR,
                icon: "mdi:home-lightning-bolt-outline",
              },
              {
                label: i18n.solarProdSegBattery,
                value: usage.solarBatt.v,
                color: COLOR_BATTERY,
                icon: "mdi:battery-plus-variant",
              },
              {
                label: i18n.solarProdSegExport,
                value: reinj.solarSurplus,
                color: COLOR_SOLAR_EXPORT,
                icon: "mdi:transmission-tower-export",
              },
            ],
            total: solarKwhTotal,
            formatter: (v) => solarKwhFmt(v),
            tooltip: i18n.solarProdKwhTip,
          }
        : null;
    const batteryData =
      costEntityOk && this.hass?.states ? buildBatteryData(this.hass.states, payloadForLive) : null;

    const totalReinjRaw = reinj.solarSurplus + reinj.batteryFull + reinj.switchLatency + reinj.unattributed;

    const hubSites = hubSitesFromStates(this.hass?.states);
    const siteIdx = this._siteIndexFromConfig();
    const siteSelectValue =
      siteIdx === null || siteIdx === undefined ? "__auto__" : String(Math.max(0, Math.trunc(siteIdx)));

    return html`
      <ha-card>
        <div class="header">
          <div class="header-title-side">
            <h2>Hub Énergie</h2>
            <span class="header-subtitle">${offerLabel(offer)}${contractPower ? ` ${contractPower}kVA` : ""}</span>
          </div>
          <div class="controls">
            ${hubSites.length >= 1
              ? html`
                  <label>${i18n.siteLabel}</label>
                  <ha-select
                    .value=${siteSelectValue}
                    @closed=${this._onSiteChange}
                    .fixedMenuPosition=${true}
                    .naturalMenuWidth=${true}
                    style="min-width:5.5rem"
                  >
                    <ha-list-item value="__auto__">${i18n.siteAuto}</ha-list-item>
                    ${hubSites.map(
                      (s) => html`
                        <ha-list-item value="${String(s.index)}">
                          ${tpl(i18n.editorSiteOption, { index: String(s.index), segment: s.segment })}
                        </ha-list-item>
                      `,
                    )}
                  </ha-select>
                `
              : nothing}
            <label>${i18n.date}</label>
            <input type="date" .value=${this._date} max=${todayParisISO()} @change=${this._onDateChange} />
            <label>${i18n.range}</label>
            <div class="range-btns">
              ${["day", "week", "month", "year"].map((p) => html`
                <button class="range-btn ${this._rangePreset === p ? "active" : ""}" @click=${() => this._setRangePreset(p)}>
                  ${i18n[p]}
                </button>
              `)}
            </div>
            <span class="range-label">${rangeLabel(r.startIso, r.endIso, locale)}</span>
            ${this._showSection("show_raw_control")
              ? html`<button class="btn" @click=${this._onRawToggle}>${this._showRaw ? i18n.hide : i18n.details}</button>`
              : nothing}
          </div>
        </div>

        ${this._histLoading ? html`<div class="loader">${i18n.loading}</div>` : nothing}

        ${this._showSection("show_day_slots")
          ? html` <div class="meta-tempo-wrap">
          <div class="meta-days-stack">
            <div class="day-tile ${offer === "tempo" ? dayColorClass(todayColor) : "color-na"}">
              <span class="day-tile-line">${i18n.today} : ${slotLabel(currentSlot, offer, i18n)}</span>
            </div>
            <div class="day-tile ${offer === "tempo" ? dayColorClass(tomorrowColor) : "color-na"}">
              <span class="day-tile-line">${i18n.tomorrow} : ${offer === "tempo" ? dayColorLabel(tomorrowColor, i18n) : i18n.emDash}</span>
            </div>
          </div>
          ${offer === "tempo" && tempoDays && typeof tempoDays === "object"
            ? html`
                <div class="tempo-days">
                  <div class="tempo-day tempo-blue">
                    ${i18n.tempoDayBlue} : ${tempoDays.blue?.remaining ?? 0}/${(tempoDays.blue?.elapsed ?? 0) + (tempoDays.blue?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-white">
                    ${i18n.tempoDayWhite} : ${tempoDays.white?.remaining ?? 0}/${(tempoDays.white?.elapsed ?? 0) + (tempoDays.white?.remaining ?? 0)}
                  </div>
                  <div class="tempo-day tempo-red">
                    ${i18n.tempoDayRed} : ${tempoDays.red?.remaining ?? 0}/${(tempoDays.red?.elapsed ?? 0) + (tempoDays.red?.remaining ?? 0)}
                  </div>
                </div>
              `
            : nothing}
        </div>`
          : nothing}

        ${this._showSection("show_live_power")
          ? html`
        <hub-power-now
          .i18n=${i18n}
          .data=${powerNowData}
          .graphOpen=${this._powerGraphOpen}
          @hub-power-now-toggle=${() => this._togglePowerGraph()}
        ></hub-power-now>
        <hub-power-graph
          .open=${this._powerGraphOpen}
          .i18n=${i18n}
          .locale=${locale}
          .loading=${this._powerGraphLoading}
          .error=${this._powerGraphErr}
          .displaySeries=${this._powerGraphDisplaySeries()}
          .rollingHours=${this._powerGraphRollingHours}
          .isTodayGraph=${(this._date ?? todayParisISO()) === todayParisISO()}
          @hub-power-graph-window=${(e) => {
            const h = e.detail?.hours;
            if (h != null) this._setPowerGraphRollingHours(h);
          }}
        ></hub-power-graph>`
          : nothing}
        ${this._showSection("show_battery_bar")
          ? html`<hub-energie-battery-bar .i18n=${i18n} .data=${batteryData} .numberLocale=${locale}></hub-energie-battery-bar>`
          : nothing}
        ${this._showSection("show_insights_bar")
          ? html`<hub-insight-bar .i18n=${i18n} .totalMaison=${totalMaison} .originGrid=${og} .totalEur=${totalEur} .ecoTotal=${ecoTotal}></hub-insight-bar>`
          : nothing}
        ${this._showSection("show_red_hp_warning")
          ? this._renderRedHpWarning(grid, offer, totalMaison, usage, i18n)
          : nothing}

        ${this._showSection("show_consumption")
          ? html`<section>
          <div class="section-head">
            <h3>${i18n.sectionConsumption}</h3>
            <div class="section-metric">${i18n.totalEnergy} <b>${fmtEnergy(totalMaison)}</b></div>
          </div>
          <div class="bars">
            <hub-energy-strip
              .title=${offer === "tempo" ? i18n.consStripGridTitleTempo : i18n.consStripGridTitle}
              .segments=${gridSegments}
              .total=${totalGrid}
              .formatter=${gridEnergyFmt}
              .tooltip=${activeGrid.map((s) => `${slotLabel(s.id, offer, i18n)}: ${gridEnergyFmt(s.v)}`).join(" · ")}
              .breakdown=${gridBreakdown}
              .showBreakdown=${true}
              .displayValue=${gridEnergyFmt(totalGrid)}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>

            ${this._showSection("show_solar_production_bar") && solarKwhData
              ? html`<hub-solar-production-bar .i18n=${i18n} .kwhData=${solarKwhData}></hub-solar-production-bar>`
              : nothing}

            <hub-energy-strip
              .title=${i18n.consStripHomeTitle}
              .segments=${homeSegments}
              .total=${homeSupplyTotal}
              .formatter=${homeEnergyFmt}
              .tooltip=${homeOrdered.map((x) => `${x.label}: ${homeEnergyFmt(x.v)}`).join(" · ")}
              .breakdown=${homeBreakdown}
              .showBreakdown=${true}
              .displayValue=${homeEnergyFmt(homeSupplyTotal)}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>

            <hub-energy-strip
              .title=${i18n.consStripBattTitle}
              .segments=${battSegments}
              .total=${battChgTotal}
              .formatter=${battChgEnergyFmt}
              .tooltip=${battChgRows.map((r) => `${r.label}: ${battChgEnergyFmt(r.v)}`).join(" · ")}
              .breakdown=${battBreakdown}
              .showBreakdown=${true}
              .displayValue=${battChgEnergyFmt(battChgTotal)}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>
          </div>
        </section>`
          : nothing}

        ${this._showSection("show_cost")
          ? html`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${i18n.costStripTitle}
              .segments=${costSegments}
              .total=${totalEur}
              .formatter=${(v) => `${Number(v).toFixed(2)} €`}
              .tooltip=${[
                ...activeCosts.map((s) => `${slotLabel(s.id, offer, i18n)}: ${s.v.toFixed(2)} €${s.tooltip ? ` (${s.tooltip})` : ""}`),
                ...(abo > 0.0005 ? [`${i18n.costSubscription}: ${abo.toFixed(2)} €`] : []),
              ].join(" · ")}
              .breakdown=${costBreakdown}
              .showBreakdown=${true}
              .displayValue=${`${totalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>
          </div>
        </section>`
          : nothing}

        ${this._showSection("show_savings")
          ? html`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${i18n.ecoStripTitle}
              .segments=${ecoSegments}
              .total=${totalEcoAbs}
              .formatter=${(v) => `${Number(v).toFixed(2)} €`}
              .tooltip=${ecoParts.map((x) => `${x.label}: ${x.fmt}`).join(" · ")}
              .breakdown=${ecoBreakdown.length ? ecoBreakdown : [{ label: i18n.emDash, value: `${ecoTotal >= 0 ? "+" : ""}${ecoTotal.toFixed(2)} €` }]}
              .showBreakdown=${true}
              .displayValue=${`${ecoTotal >= 0 ? "+" : ""}${ecoTotal.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>
          </div>
        </section>`
          : nothing}

        ${this._showSection("show_reinjection")
          ? html`<section>
          <div class="bars">
            <hub-energy-strip
              .title=${i18n.reinjStripTitle}
              .segments=${reinjSegments}
              .total=${totalReinj}
              .formatter=${reinjEnergyFmt}
              .tooltip=${reinjItems.map((x) => `${x.label}: ${reinjEnergyFmt(x.v)} · ${x.eur.toFixed(2)} €`).join(" · ")}
              .breakdown=${reinjBreakdown}
              .showBreakdown=${true}
              .displayValue=${`${reinjEnergyFmt(totalReinj)} · ${reinj.oppTotalEur.toFixed(2)} €`}
              .fillPercent=${100}
              .emptyLabel=${i18n.noData}
            ></hub-energy-strip>
          </div>
        </section>`
          : nothing}

        ${this._showRaw && this._showSection("show_raw_control")
          ? html`
              <section>
                <h3>${i18n.rawDataTitle}</h3>
                <div class="raw">
                  <div class="raw-grid">
                    <div>
                      <b>${i18n.rawSectionGridHome}</b>
                      ${tpl(i18n.rawLineGridTotal, { value: totalGrid.toFixed(3) })}<br />
                      ${tpl(i18n.rawLineHouseTotal, { value: totalMaison.toFixed(3) })}
                    </div>
                    <div>
                      <b>${i18n.rawSectionCost}</b>
                      ${tpl(i18n.rawLineCostTotal, { value: totalEur.toFixed(3) })}<br />
                      ${tpl(i18n.rawLineSubscription, { value: abo.toFixed(3) })}
                    </div>
                    <div>
                      <b>${i18n.rawSectionOrigin}</b>
                      ${tpl(i18n.rawLineOriginGrid, { value: og.toFixed(3) })}<br />
                      ${tpl(i18n.rawLineOriginSolar, { value: os.toFixed(3) })}
                    </div>
                    <div>
                      <b>${i18n.rawSectionSavings}</b>
                      ${tpl(i18n.rawLineSavingsSolar, { value: ecoSolar.toFixed(3) })}<br />
                      ${tpl(i18n.rawLineSavingsBattery, { value: ecoBatt.toFixed(3) })}
                    </div>
                    <div>
                      <b>${i18n.rawSectionImportBySlot}</b>
                      ${activeGrid.length > 0
                        ? activeGrid.map((s, i) => html`${i > 0 ? html`<br />` : nothing}${slotLabel(s.id, offer, i18n)}: ${s.v.toFixed(3)} kWh`)
                        : i18n.emDash}
                    </div>
                    <div>
                      <b>${i18n.rawSectionCostBySlot}</b>
                      ${activeCosts.length > 0
                        ? activeCosts.map((s, i) => html`${i > 0 ? html`<br />` : nothing}${slotLabel(s.id, offer, i18n)}: ${s.v.toFixed(3)} €`)
                        : i18n.emDash}
                    </div>
                    <div>
                      <b>${i18n.rawSectionUsageDetail}</b>
                      ${usage.gridDirect.label} : ${usage.gridDirect.v.toFixed(3)}<br />
                      ${usage.gridBatt.label} : ${usage.gridBatt.v.toFixed(3)}<br />
                      ${usage.solarDirect.label} : ${usage.solarDirect.v.toFixed(3)}<br />
                      ${usage.solarBatt.label} : ${usage.solarBatt.v.toFixed(3)}<br />
                      ${usage.battHome.label} : ${usage.battHome.v.toFixed(3)}
                    </div>
                    <div>
                      <b>${i18n.rawSectionBattChargeGridSlots}</b>
                      ${this._renderSlotMapRaw(gridBattBySlot, offer, i18n)}
                    </div>
                    <div>
                      <b>${i18n.rawSectionBattChargeSolarSlots}</b>
                      ${this._renderSlotMapRaw(solarBattBySlot, offer, i18n)}
                    </div>
                    <div>
                      <b>${i18n.rawSectionReinjection}</b>
                      ${i18n.reinjLabelSolarSurplus}
                      ${tpl(i18n.reinjLineKwhEur, { kwh: reinj.solarSurplus.toFixed(3), eur: reinj.oppSolarEur.toFixed(3) })}<br />
                      ${i18n.reinjLabelBatteryFull}
                      ${tpl(i18n.reinjLineKwhEur, { kwh: reinj.batteryFull.toFixed(3), eur: reinj.oppBatteryEur.toFixed(3) })}<br />
                      ${i18n.reinjLabelSwitchLatency}
                      ${tpl(i18n.reinjLineKwhEur, { kwh: reinj.switchLatency.toFixed(3), eur: reinj.oppLatencyEur.toFixed(3) })}<br />
                      ${i18n.reinjLabelOther}
                      ${tpl(i18n.reinjLineKwhEur, { kwh: reinj.unattributed.toFixed(3), eur: reinj.oppOtherEur.toFixed(3) })}<br />
                      ${i18n.reinjLabelTotal}
                      ${tpl(i18n.reinjLineKwhEur, { kwh: totalReinjRaw.toFixed(3), eur: reinj.oppTotalEur.toFixed(3) })}
                    </div>
                  </div>
                </div>
              </section>
            `
          : nothing}
      </ha-card>
    `;
  }
}

if (!customElements.get("hub-energie-card-core")) {
  customElements.define("hub-energie-card-core", HubEnergieCard);
}