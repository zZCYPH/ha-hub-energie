import { LitElement, css, html, nothing, svg } from "lit";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_SOLAR,
} from "../constants/colors.js";
import { parisYmdStartUtc } from "../utils/date-utils.js";
import { fmtPowerCompact } from "../utils/format-utils.js";

/** Rolling window presets for live-day power graph (hours). */
const POWER_GRAPH_ROLLING_HOURS = [24, 12, 6, 3, 1];

/** Floor for half tooltip width (px); max is derived from visual viewport (see clamp). */
const POWER_GRAPH_TOOLTIP_HALFWIDTH_MIN = 100;
const POWER_GRAPH_TOOLTIP_EDGE_PAD = 12;
/** Cap half-width so laptop layouts are not over-constrained vs 16rem tooltip. */
const POWER_GRAPH_TOOLTIP_HALFWIDTH_CAP = 168;

function snapPowerGraphRollingHours(raw, fallback) {
  if (!Number.isFinite(raw)) return fallback;
  const n = Math.trunc(raw);
  if (POWER_GRAPH_ROLLING_HOURS.includes(n)) return n;
  return POWER_GRAPH_ROLLING_HOURS.reduce(
    (best, h) => (Math.abs(h - n) < Math.abs(best - n) ? h : best),
    fallback,
  );
}

/**
 * Split house load (W) into stacked layers: battery discharge, grid import, solar.
 * Grid export is ignored here (gImp only); the signed grid line still shows reinjection.
 */
function houseLoadSupplySlicesPerPoint(loadW, gridSigned, battSigned, solarW) {
  const gImp = Math.max(0, Number(gridSigned) || 0);
  const bDis = Math.max(0, Number(battSigned) || 0);
  const sAvail = Math.max(0, Number(solarW) || 0);
  const loadV = Math.max(0, Number(loadW) || 0);
  if (loadV < 1e-6) return { b: 0, g: 0, s: 0 };
  const sum = bDis + gImp + sAvail;
  if (sum > loadV + 1e-6) {
    const k = loadV / sum;
    return { b: bDis * k, g: gImp * k, s: sAvail * k };
  }
  let b = Math.min(bDis, loadV);
  let rem = loadV - b;
  let g = Math.min(gImp, rem);
  rem -= g;
  let s = Math.min(sAvail, rem);
  rem -= s;
  if (rem > 1) s += rem;
  return { b, g, s };
}

/** @param {{ ts: number; grid: number; solar: number; batt: number; load?: number | null }[]} pts */
function houseLoadStackSeriesFromPts(pts) {
  const n = pts.length;
  const b = new Array(n);
  const g = new Array(n);
  const sol = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const loadRaw = p.load != null && Number.isFinite(p.load) ? Math.max(0, p.load) : NaN;
    let loadV = loadRaw;
    const gImp = Math.max(0, p.grid ?? 0);
    const bDis = Math.max(0, p.batt ?? 0);
    const sAvail = Math.max(0, p.solar ?? 0);
    if (!Number.isFinite(loadV)) {
      loadV = gImp + bDis + sAvail;
    }
    const sl = houseLoadSupplySlicesPerPoint(loadV, p.grid ?? 0, p.batt ?? 0, p.solar ?? 0);
    b[i] = sl.b;
    g[i] = sl.g;
    sol[i] = sl.s;
  }
  return { sliceBatt: b, sliceGrid: g, sliceSolar: sol };
}

function svgLinePath(values, yMin, yMax, w, h) {
  if (!values?.length || !Number.isFinite(yMin) || !Number.isFinite(yMax) || yMax <= yMin) return "";
  const span = yMax - yMin;
  const n = values.length;
  const pts = [];
  const xAt = (i) => (n === 1 ? 0 : (i / (n - 1)) * w);
  const yAt = (v) => h - ((Number(v) - yMin) / span) * h;
  for (let i = 0; i < n; i++) {
    const v = Number(values[i]);
    pts.push({ x: xAt(i), y: yAt(Number.isFinite(v) ? v : 0) });
  }
  return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} ${pts
    .slice(1)
    .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ")}`;
}

/** Band between two value series (watts), same Y scale as line chart. Bottom edge reversed to close. */
function svgStackedBandPath(bottomW, topW, yMin, yMax, w, h) {
  if (!bottomW?.length || bottomW.length !== topW?.length) return "";
  const span = Math.max(yMax - yMin, 1e-9);
  const n = bottomW.length;
  const xAt = (i) => (n === 1 ? 0 : (i / (n - 1)) * w);
  const yAt = (v) => h - ((Number(v) - yMin) / span) * h;
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = xAt(i);
    const y = yAt(Number(topW[i]));
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  for (let i = n - 1; i >= 0; i--) {
    const x = xAt(i);
    const y = yAt(Number(bottomW[i]));
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

/**
 * Horizontal center for tooltip: `left: pct%` + translateX(-50%).
 * Keeps the box inside the visual viewport (offsetLeft-aware); pct may go &lt;0 or &gt;100 if needed.
 * @param {DOMRect} wrapRect .power-graph-svg-wrap
 */
function clampPowerGraphTooltipXPct(wrapRect, clientX) {
  if (!wrapRect || wrapRect.width <= 0) return 50;
  const rawPct = ((clientX - wrapRect.left) / wrapRect.width) * 100;
  const edge = POWER_GRAPH_TOOLTIP_EDGE_PAD;
  const win = typeof window !== "undefined" ? window : null;
  const vv = win?.visualViewport ?? null;
  const vLeft = Number.isFinite(vv?.offsetLeft) ? vv.offsetLeft : 0;
  const vWidth =
    vv && Number.isFinite(vv.width) && vv.width > 0
      ? vv.width
      : win?.innerWidth ?? 1e9;

  const half = Math.min(
    POWER_GRAPH_TOOLTIP_HALFWIDTH_CAP,
    Math.max(POWER_GRAPH_TOOLTIP_HALFWIDTH_MIN, vWidth * 0.48),
  );

  let pct = Math.max(-8, Math.min(108, rawPct));
  let cx = wrapRect.left + (pct / 100) * wrapRect.width;
  if (Number.isFinite(vWidth) && vWidth > 2 * (half + edge)) {
    const cxMin = vLeft + half + edge;
    const cxMax = vLeft + vWidth - half - edge;
    cx = Math.max(cxMin, Math.min(cxMax, cx));
    pct = ((cx - wrapRect.left) / wrapRect.width) * 100;
  }
  return Math.round(pct * 10) / 10;
}

class HubPowerGraph extends LitElement {
  static get properties() {
    return {
      open: { type: Boolean },
      i18n: { attribute: false },
      locale: { attribute: false },
      loading: { type: Boolean },
      /** Error message string, or null when none */
      error: { attribute: false },
      /** @type {{ pts: unknown[]; yMin: number; yMax: number; hasLoadEntity: boolean; dayIso: string } | null} */
      displaySeries: { attribute: false },
      rollingHours: { type: Number },
      isTodayGraph: { type: Boolean },
      _hoverIdx: { state: true },
      _tooltipXPct: { state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .power-graph {
        margin: 0 0 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--secondary-background-color) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
      }
      .power-graph-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0 0 6px;
        flex-wrap: wrap;
      }
      .power-graph-title {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        flex: 0 0 auto;
      }
      .power-graph-head-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1 1 auto;
        min-width: 0;
      }
      .power-graph-archive-day {
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        text-align: right;
        line-height: 1.3;
      }
      .power-graph-window-btns {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin: 0;
      }
      .power-graph-window-btns .range-label {
        margin-right: 2px;
      }
      .range-label {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
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
      .power-graph-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 10px;
        margin-top: 6px;
        font-size: 0.72rem;
        color: var(--secondary-text-color);
      }
      .power-graph-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .power-graph-swatch {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        display: inline-block;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
      }
      .power-graph-swatch-line {
        width: 14px;
        height: 0;
        border-radius: 0;
        border-bottom: 3px solid var(--swatch-line, currentColor);
        background: transparent;
        box-shadow: none;
      }
      .power-graph-chart-wrap {
        display: flex;
        align-items: stretch;
        gap: 6px;
        margin-top: 2px;
      }
      .power-yaxis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 0 0 auto;
        width: 2.75rem;
        min-height: 120px;
        padding: 0 2px 0 0;
        box-sizing: border-box;
        text-align: right;
        font-size: 0.68rem;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: color-mix(in srgb, var(--primary-text-color) 38%, var(--secondary-text-color) 62%);
      }
      .power-graph-svg-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
      }
      .power-graph-svg-wrap > svg {
        touch-action: none;
        display: block;
      }
      .power-graph-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: var(--power-tooltip-x, 50%);
        transform: translateX(-50%);
        z-index: 3;
        pointer-events: none;
        box-sizing: border-box;
        width: max-content;
        min-width: min(10.5rem, calc(100vw - 1.5rem));
        max-width: min(16rem, calc(100vw - 1.25rem));
        padding: 9px 11px;
        border-radius: 10px;
        font-size: 0.72rem;
        line-height: 1.5;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 94%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .power-graph-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border: 6px solid transparent;
        border-top-color: color-mix(in srgb, var(--divider-color) 45%, var(--card-background-color) 55%);
      }
      .power-graph-tooltip-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-variant-numeric: tabular-nums;
      }
      .power-graph-tooltip-row + .power-graph-tooltip-row {
        margin-top: 4px;
      }
      .power-graph-tooltip-k {
        flex: 0 0 auto;
        font-weight: 600;
      }
      .power-graph-tooltip-v {
        font-weight: 600;
        text-align: right;
        min-width: 0;
      }
      .power-graph-tooltip-h {
        font-weight: 700;
        font-size: 0.74rem;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
      }
      .power-xaxis {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 6px;
        margin-left: calc(2.75rem + 6px);
        font-size: 0.68rem;
        color: color-mix(in srgb, var(--primary-text-color) 35%, var(--secondary-text-color) 65%);
        font-variant-numeric: tabular-nums;
      }
      .loader {
        font-size: 0.83rem;
        opacity: 0.65;
        margin: 8px 0;
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
    `;
  }

  constructor() {
    super();
    this.open = false;
    this.i18n = {};
    this.locale = "fr-FR";
    this.loading = false;
    this.error = null;
    this.displaySeries = null;
    this.rollingHours = 6;
    this.isTodayGraph = true;
    this._hoverIdx = null;
    this._tooltipXPct = null;
  }

  willUpdate(changedProps) {
    if (changedProps.has("open") && !this.open) {
      this._hoverIdx = null;
      this._tooltipXPct = null;
    }
    if (changedProps.has("loading") && this.loading) {
      this._hoverIdx = null;
      this._tooltipXPct = null;
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    const ptsLen = this.displaySeries?.pts?.length ?? 0;
    if (this._hoverIdx != null && ptsLen) {
      const mx = ptsLen - 1;
      if (this._hoverIdx > mx) {
        this._hoverIdx = mx;
      }
    }
    if (
      this.open &&
      this._hoverIdx != null &&
      (changedProps.has("_hoverIdx") ||
        changedProps.has("displaySeries") ||
        (changedProps.has("open") && this.open))
    ) {
      queueMicrotask(() => this._syncTooltipXFromHover());
    }
  }

  /** Re-apply viewport clamp from hover index after layout / series refresh (tooltip % vs SVG grid). */
  _syncTooltipXFromHover() {
    if (!this.open || this._hoverIdx == null) return;
    const root = this.renderRoot;
    if (!root) return;
    const wrap = root.querySelector(".power-graph-svg-wrap");
    const svgEl = wrap?.querySelector("svg");
    const s = this.displaySeries;
    const wr = wrap?.getBoundingClientRect();
    const sr = svgEl?.getBoundingClientRect();
    if (!s?.pts?.length || !wr?.width || !sr?.width) return;
    const n = s.pts.length;
    const hi = Math.max(0, Math.min(n - 1, this._hoverIdx));
    const t = n <= 1 ? 0.5 : hi / Math.max(n - 1, 1);
    const clientX = sr.left + t * sr.width;
    const xpct = clampPowerGraphTooltipXPct(wr, clientX);
    if (this._tooltipXPct !== xpct) {
      this._tooltipXPct = xpct;
    }
  }

  _emitWindowHours(hours) {
    this.dispatchEvent(
      new CustomEvent("hub-power-graph-window", {
        bubbles: true,
        composed: true,
        detail: { hours },
      }),
    );
  }

  /** @param {SVGSVGElement} el */
  _updateHoverFromClientX(el, clientX) {
    const s = this.displaySeries;
    if (!s?.pts?.length) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    const t = (clientX - r.left) / r.width;
    const n = s.pts.length;
    const idx = Math.max(0, Math.min(n - 1, Math.round(t * Math.max(n - 1, 1))));
    const wrap = el.closest(".power-graph-svg-wrap");
    const wr = wrap?.getBoundingClientRect();
    const xpct =
      wr && wr.width > 0 ? clampPowerGraphTooltipXPct(wr, clientX) : n <= 1
        ? 50
        : (idx / Math.max(n - 1, 1)) * 100;

    if (this._hoverIdx !== idx) {
      this._hoverIdx = idx;
    }
    if (this._tooltipXPct !== xpct) {
      this._tooltipXPct = xpct;
    }
  }

  /** @param {MouseEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgMove(e) {
    this._updateHoverFromClientX(e.currentTarget, e.clientX);
  }

  _onSvgLeave() {
    if (this._hoverIdx != null) {
      this._hoverIdx = null;
    }
    if (this._tooltipXPct != null) {
      this._tooltipXPct = null;
    }
  }

  /** @param {TouchEvent & { currentTarget: SVGSVGElement }} e */
  _onSvgTouch(e) {
    const t = e.touches?.[0];
    if (!t) return;
    this._updateHoverFromClientX(e.currentTarget, t.clientX);
  }

  _onSvgTouchEnd() {
    if (this._hoverIdx != null) {
      this._hoverIdx = null;
    }
    if (this._tooltipXPct != null) {
      this._tooltipXPct = null;
    }
  }

  render() {
    if (!this.open) return nothing;

    const i18n = this.i18n ?? {};
    const locale = this.locale ?? "fr-FR";

    const gridStroke = COLOR_GRID_SOURCE;
    const solarStroke = COLOR_SOLAR;
    const battDisStroke = COLOR_BATTERY;
    const battChgStroke = "#2e7d32";
    const loadStroke = "var(--primary-text-color, #e0e0e0)";

    if (this.loading) {
      return html`<div class="power-graph"><div class="loader">${i18n.loading}</div></div>`;
    }
    if (this.error) {
      return html`<div class="power-graph"><div class="alert">${this.error}</div></div>`;
    }
    const s = this.displaySeries;
    if (!s?.pts?.length) {
      return html`<div class="power-graph"><div class="loader">${i18n.noData}</div></div>`;
    }

    const w = 320;
    const h = 120;
    const yMin = s.yMin ?? 0;
    const yMax = s.yMax ?? 1;

    const valsSolar = s.pts.map((p) => p.solar ?? 0);
    const valsBattDis = s.pts.map((p) => Math.max(0, p.batt ?? 0));
    const valsBattChg = s.pts.map((p) => Math.max(0, -(p.batt ?? 0)));
    const valsGrid = s.pts.map((p) => p.grid ?? 0);
    const hasLoad = s.hasLoadEntity === true;
    const valsLoad = hasLoad ? s.pts.map((p) => (p.load == null ? 0 : p.load)) : [];

    const fmtTime = (ts) =>
      new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
    const fmtTooltipTime = (ts) =>
      new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(ts));
    const firstTs = s.pts[0].ts;
    const lastTs = s.pts[s.pts.length - 1].ts;
    const mid1Ts = firstTs + (lastTs - firstTs) / 3;
    const mid2Ts = firstTs + ((lastTs - firstTs) * 2) / 3;

    const lineSolar = svgLinePath(valsSolar, yMin, yMax, w, h);
    const lineBattDis = svgLinePath(valsBattDis, yMin, yMax, w, h);
    const lineBattChg = svgLinePath(valsBattChg, yMin, yMax, w, h);
    const lineGrid = svgLinePath(valsGrid, yMin, yMax, w, h);
    const lineLoad = hasLoad && valsLoad.length ? svgLinePath(valsLoad, yMin, yMax, w, h) : "";

    /** Stacked areas under house load: batt (bottom) → grid import → solar; grid line stays signed (export). */
    let areaHouseBatt = "";
    let areaHouseGrid = "";
    let areaHouseSolar = "";
    if (hasLoad && valsLoad.length) {
      const { sliceBatt, sliceGrid, sliceSolar } = houseLoadStackSeriesFromPts(s.pts);
      const n = sliceBatt.length;
      const zero = new Array(n).fill(0);
      const cumAfterBatt = sliceBatt.slice();
      const cumAfterGrid = sliceBatt.map((b, i) => b + sliceGrid[i]);
      const cumTop = sliceBatt.map((b, i) => b + sliceGrid[i] + sliceSolar[i]);
      areaHouseBatt = svgStackedBandPath(zero, cumAfterBatt, yMin, yMax, w, h);
      areaHouseGrid = svgStackedBandPath(cumAfterBatt, cumAfterGrid, yMin, yMax, w, h);
      areaHouseSolar = svgStackedBandPath(cumAfterGrid, cumTop, yMin, yMax, w, h);
    }

    const fillHouseBatt = `color-mix(in srgb, ${COLOR_BATTERY} 30%, transparent)`;
    const fillHouseGrid = `color-mix(in srgb, ${COLOR_GRID_SOURCE} 30%, transparent)`;
    const fillHouseSolar = `color-mix(in srgb, ${COLOR_SOLAR} 30%, transparent)`;

    const gridStrokeCss = "color-mix(in srgb, var(--divider-color) 70%, transparent)";
    const ySpan = Math.max(yMax - yMin, 1e-9);
    const yPx = (v) => h - ((v - yMin) / ySpan) * h;
    const yMidVal = (yMin + yMax) / 2;
    const yTop = fmtPowerCompact(yMax);
    const yMid = fmtPowerCompact(yMidVal);
    const yBottom = fmtPowerCompact(yMin);
    const yMidLine = yPx(yMidVal);
    const zeroInRange = yMin < 0 && yMax > 0;
    const yZeroLine = yPx(0);

    const nPt = s.pts.length;
    const hi = this._hoverIdx;
    const hoverPt = hi != null && hi >= 0 && hi < nPt ? s.pts[hi] : null;
    const crossX = nPt <= 1 ? w / 2 : ((hi ?? 0) / Math.max(nPt - 1, 1)) * w;
    const tooltipLeftPct =
      this._tooltipXPct != null
        ? this._tooltipXPct
        : nPt <= 1
          ? 50
          : ((hi ?? 0) / Math.max(nPt - 1, 1)) * 100;

    const dayStart = parisYmdStartUtc(s.dayIso);
    const dayLabel = Number.isFinite(dayStart.getTime())
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(dayStart)
      : s.dayIso;
    const archiveDayLine = String(i18n.powerHistoryFullDay).replace("{date}", dayLabel);
    const rollingSnap = snapPowerGraphRollingHours(this.rollingHours, 6);

    return html`
      <div class="power-graph">
        <div class="power-graph-head">
          <div class="power-graph-title">${i18n.powerHistoryTitle ?? "Power history"}</div>
          <div class="power-graph-head-actions">
            ${this.isTodayGraph
              ? html`<div class="power-graph-window-btns">
                  <span class="range-label">${i18n.powerHistoryWindow}</span>
                  ${POWER_GRAPH_ROLLING_HOURS.map(
                    (hours) => html`
                      <button
                        type="button"
                        class="range-btn ${rollingSnap === hours ? "active" : ""}"
                        @click=${() => this._emitWindowHours(hours)}
                      >
                        ${hours}h
                      </button>
                    `,
                  )}
                </div>`
              : html`<div class="power-graph-archive-day">${archiveDayLine}</div>`}
          </div>
        </div>
        <div class="power-graph-chart-wrap">
          <div class="power-yaxis" aria-hidden="true">
            <span>${yTop}</span>
            <span>${yMid}</span>
            <span>${yBottom}</span>
          </div>
          <div class="power-graph-svg-wrap">
            ${hoverPt
              ? html`
                  <div class="power-graph-tooltip" style="--power-tooltip-x:${tooltipLeftPct}%">
                    <div class="power-graph-tooltip-h">
                      ${i18n.powerGraphTooltipTime}: ${fmtTooltipTime(hoverPt.ts)}
                    </div>
                    ${hasLoad
                      ? html`
                          <div class="power-graph-tooltip-row">
                            <span class="power-graph-tooltip-k" style="color:${loadStroke}"
                              >${i18n.houseLoad}</span
                            >
                            <span class="power-graph-tooltip-v"
                              >${hoverPt.load != null ? fmtPowerCompact(hoverPt.load) : i18n.emDash}</span
                            >
                          </div>
                        `
                      : nothing}
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${solarStroke}"
                        >${i18n.powerGraphTooltipSolar}</span
                      >
                      <span class="power-graph-tooltip-v">${fmtPowerCompact(hoverPt.solar ?? 0)}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${battDisStroke}"
                        >${i18n.segBattDis}</span
                      >
                      <span class="power-graph-tooltip-v">${fmtPowerCompact(Math.max(0, hoverPt.batt ?? 0))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${battChgStroke}"
                        >${i18n.segBattChg}</span
                      >
                      <span class="power-graph-tooltip-v">${fmtPowerCompact(Math.max(0, -(hoverPt.batt ?? 0)))}</span>
                    </div>
                    <div class="power-graph-tooltip-row">
                      <span class="power-graph-tooltip-k" style="color:${gridStroke}"
                        >${i18n.powerGraphTooltipGrid}</span
                      >
                      <span class="power-graph-tooltip-v">${fmtPowerCompact(hoverPt.grid ?? 0)}</span>
                    </div>
                  </div>
                `
              : nothing}
            <svg
              viewBox="0 0 ${w} ${h}"
              width="100%"
              height="120"
              preserveAspectRatio="none"
              aria-label="power history chart"
              @mousemove=${this._onSvgMove}
              @mouseleave=${this._onSvgLeave}
              @touchstart=${this._onSvgTouch}
              @touchmove=${this._onSvgTouch}
              @touchend=${this._onSvgTouchEnd}
              @touchcancel=${this._onSvgTouchEnd}
            >
              <g class="power-grid-lines" stroke="${gridStrokeCss}" stroke-width="0.75" opacity="0.55" fill="none">
                <line x1="0" y1="0" x2="${w}" y2="0"></line>
                <line x1="0" y1="${yMidLine}" x2="${w}" y2="${yMidLine}" stroke-dasharray="3 3"></line>
                <line x1="0" y1="${h}" x2="${w}" y2="${h}"></line>
                ${zeroInRange
                  ? svg`<line
                      x1="0"
                      y1="${yZeroLine}"
                      x2="${w}"
                      y2="${yZeroLine}"
                      stroke-dasharray="4 3"
                      opacity="0.75"
                    ></line>`
                  : nothing}
                <line x1="0" y1="0" x2="0" y2="${h}" stroke-width="1"></line>
              </g>
              ${areaHouseBatt
                ? svg`<path
                    d="${areaHouseBatt}"
                    fill="${fillHouseBatt}"
                    stroke="none"
                    pointer-events="none"
                  ></path>`
                : nothing}
              ${areaHouseGrid
                ? svg`<path
                    d="${areaHouseGrid}"
                    fill="${fillHouseGrid}"
                    stroke="none"
                    pointer-events="none"
                  ></path>`
                : nothing}
              ${areaHouseSolar
                ? svg`<path
                    d="${areaHouseSolar}"
                    fill="${fillHouseSolar}"
                    stroke="none"
                    pointer-events="none"
                  ></path>`
                : nothing}
              <path
                d="${lineGrid}"
                fill="none"
                stroke="${gridStroke}"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${lineBattChg}"
                fill="none"
                stroke="${battChgStroke}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${lineBattDis}"
                fill="none"
                stroke="${battDisStroke}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              <path
                d="${lineSolar}"
                fill="none"
                stroke="${solarStroke}"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
              ></path>
              ${lineLoad
                ? svg`<path
                    d="${lineLoad}"
                    fill="none"
                    stroke="${loadStroke}"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="1"
                  ></path>`
                : nothing}
              ${hi != null
                ? svg`<line
                    pointer-events="none"
                    x1="${crossX}"
                    y1="0"
                    x2="${crossX}"
                    y2="${h}"
                    stroke="${gridStrokeCss}"
                    stroke-width="1"
                    opacity="0.85"
                  ></line>`
                : nothing}
            </svg>
          </div>
        </div>
        <div class="power-xaxis">
          <span>${fmtTime(firstTs)}</span>
          <span>${fmtTime(mid1Ts)}</span>
          <span>${fmtTime(mid2Ts)}</span>
          <span>${fmtTime(lastTs)}</span>
        </div>
        <div class="power-graph-legend" aria-hidden="true">
          ${hasLoad
            ? html`<span class="power-graph-chip"
                ><span
                  class="power-graph-swatch power-graph-swatch-line"
                  style="--swatch-line:${loadStroke}"
                ></span
                >${i18n.houseLoad}</span
              >`
            : nothing}
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${solarStroke}"
            ></span
            >${i18n.colSolar}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${battDisStroke}"
            ></span
            >${i18n.segBattDis}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${battChgStroke}"
            ></span
            >${i18n.segBattChg}</span
          >
          <span class="power-graph-chip"
            ><span
              class="power-graph-swatch power-graph-swatch-line"
              style="--swatch-line:${gridStroke}"
            ></span
            >${i18n.colGrid}</span
          >
        </div>
      </div>
    `;
  }
}

if (!customElements.get("hub-power-graph")) {
  customElements.define("hub-power-graph", HubPowerGraph);
}

export { HubPowerGraph };
