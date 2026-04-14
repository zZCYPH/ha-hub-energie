<script setup>
/**
 * Vitrine-only port of hub-power-graph.js (stacked load bands + SVG lines + tooltip).
 * Expects the same `displaySeries` shape as the Lit card: { pts, yMin, yMax, hasLoadEntity, dayIso }.
 */
import { computed, ref } from "vue";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_SOLAR,
} from "../../../../../custom_components/hub_energie/frontend/src/constants/colors.js";
import {
  DEFAULT_POWER_GRAPH_ROLLING_HOURS,
  POWER_GRAPH_ROLLING_HOURS,
  snapPowerGraphRollingHours,
} from "../../../../../custom_components/hub_energie/frontend/src/constants/power-graph-window.js";
import { parisYmdStartUtc } from "../../../../../custom_components/hub_energie/frontend/src/utils/date-utils.js";
import { fmtPowerCompact } from "../../../../../custom_components/hub_energie/frontend/src/utils/format-utils.js";

const props = defineProps({
  open: { type: Boolean, default: false },
  i18n: { type: Object, required: true },
  locale: { type: String, default: "fr-FR" },
  /** Same contract as hub-power-graph `displaySeries` */
  displaySeries: { type: Object, default: null },
  rollingHours: { type: Number, default: 6 },
  /** When true, show rolling window buttons like the HA card “today” graph */
  isTodayGraph: { type: Boolean, default: false },
});

const emit = defineEmits(["window-hours"]);

const hoverIdx = ref(null);
const tooltipXPct = ref(null);

const POWER_GRAPH_TOOLTIP_HALFWIDTH_MIN = 100;
const POWER_GRAPH_TOOLTIP_EDGE_PAD = 12;
const POWER_GRAPH_TOOLTIP_HALFWIDTH_CAP = 168;

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
  if (rem > 1) {
    if (sAvail > 1e-3) s += rem;
    else if (gImp > 1e-3) g += rem;
    else if (bDis > 1e-3) b += rem;
    else s += rem;
  }
  return { b, g, s };
}

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

function clampPowerGraphTooltipXPct(wrapRect, clientX) {
  if (!wrapRect || wrapRect.width <= 0) return 50;
  const rawPct = ((clientX - wrapRect.left) / wrapRect.width) * 100;
  const edge = POWER_GRAPH_TOOLTIP_EDGE_PAD;
  const win = typeof window !== "undefined" ? window : null;
  const vv = win?.visualViewport ?? null;
  const vLeft = Number.isFinite(vv?.offsetLeft) ? vv.offsetLeft : 0;
  const vWidth =
    vv && Number.isFinite(vv.width) && vv.width > 0 ? vv.width : win?.innerWidth ?? 1e9;
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

const w = 320;
const h = 120;

const chart = computed(() => {
  const s = props.displaySeries;
  if (!s?.pts?.length) return null;
  const yMin = s.yMin ?? 0;
  const yMax = s.yMax ?? 1;
  const valsSolar = s.pts.map((p) => p.solar ?? 0);
  const valsBattDis = s.pts.map((p) => Math.max(0, p.batt ?? 0));
  const valsBattChg = s.pts.map((p) => Math.max(0, -(p.batt ?? 0)));
  const valsGrid = s.pts.map((p) => p.grid ?? 0);
  const hasLoad = s.hasLoadEntity === true;
  const valsLoad = hasLoad ? s.pts.map((p) => (p.load == null ? 0 : p.load)) : [];

  const lineSolar = svgLinePath(valsSolar, yMin, yMax, w, h);
  const lineBattDis = svgLinePath(valsBattDis, yMin, yMax, w, h);
  const lineBattChg = svgLinePath(valsBattChg, yMin, yMax, w, h);
  const lineGrid = svgLinePath(valsGrid, yMin, yMax, w, h);
  const lineLoad = hasLoad && valsLoad.length ? svgLinePath(valsLoad, yMin, yMax, w, h) : "";

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

  const ySpan = Math.max(yMax - yMin, 1e-9);
  const yPx = (v) => h - ((v - yMin) / ySpan) * h;
  const yMidVal = (yMin + yMax) / 2;
  const yMidLine = yPx(yMidVal);
  const zeroInRange = yMin < 0 && yMax > 0;
  const yZeroLine = yPx(0);

  const locale = props.locale ?? "fr-FR";
  const fmtTime = (ts) =>
    new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
  const fmtTooltipTime = (ts) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(ts));
  const firstTs = s.pts[0].ts;
  const lastTs = s.pts[s.pts.length - 1].ts;
  const mid1Ts = firstTs + (lastTs - firstTs) / 3;
  const mid2Ts = firstTs + ((lastTs - firstTs) * 2) / 3;

  const nPt = s.pts.length;
  const hi = hoverIdx.value;
  const hoverPt = hi != null && hi >= 0 && hi < nPt ? s.pts[hi] : null;
  const crossX = nPt <= 1 ? w / 2 : ((hi ?? 0) / Math.max(nPt - 1, 1)) * w;
  const tooltipLeftPct =
    tooltipXPct.value != null
      ? tooltipXPct.value
      : nPt <= 1
        ? 50
        : ((hi ?? 0) / Math.max(nPt - 1, 1)) * 100;

  const dayStart = parisYmdStartUtc(s.dayIso);
  const dayLabel = Number.isFinite(dayStart.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(dayStart)
    : s.dayIso;
  const archiveDayLine = String(props.i18n.powerHistoryFullDay).replace("{date}", dayLabel);
  const rollingSnap = snapPowerGraphRollingHours(
    props.rollingHours,
    DEFAULT_POWER_GRAPH_ROLLING_HOURS,
  );

  const gridStrokeCss = "color-mix(in srgb, var(--divider-color) 70%, transparent)";
  const loadStroke = "var(--primary-text-color, #e0e0e0)";
  const solarStroke = COLOR_SOLAR;
  /** Positive `p.batt` = discharge (darker); negative = charge (lighter). Matches hub-power-graph. */
  const battDisStroke = "#2e7d32";
  const battChgStroke = COLOR_BATTERY;
  const gridStroke = COLOR_GRID_SOURCE;

  const fillHouseBatt = `color-mix(in srgb, ${battDisStroke} 32%, transparent)`;
  const fillHouseGrid = `color-mix(in srgb, ${COLOR_GRID_SOURCE} 30%, transparent)`;
  const fillHouseSolar = `color-mix(in srgb, ${COLOR_SOLAR} 30%, transparent)`;

  return {
    yMin,
    yMax,
    yTop: fmtPowerCompact(yMax),
    yMid: fmtPowerCompact(yMidVal),
    yBottom: fmtPowerCompact(yMin),
    yMidLine,
    zeroInRange,
    yZeroLine,
    lineSolar,
    lineBattDis,
    lineBattChg,
    lineGrid,
    lineLoad,
    areaHouseBatt,
    areaHouseGrid,
    areaHouseSolar,
    fillHouseBatt,
    fillHouseGrid,
    fillHouseSolar,
    gridStrokeCss,
    loadStroke,
    solarStroke,
    battDisStroke,
    battChgStroke,
    gridStroke,
    fmtTime,
    fmtTooltipTime,
    firstTs,
    lastTs,
    mid1Ts,
    mid2Ts,
    hoverPt,
    crossX,
    tooltipLeftPct,
    hasLoad,
    archiveDayLine,
    rollingSnap,
  };
});

function onSvgMove(e) {
  const s = props.displaySeries;
  if (!s?.pts?.length) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  if (r.width <= 0) return;
  const t = (e.clientX - r.left) / r.width;
  const n = s.pts.length;
  const idx = Math.max(0, Math.min(n - 1, Math.round(t * Math.max(n - 1, 1))));
  const wrap = el.closest(".he-power-graph-svg-wrap");
  const wr = wrap?.getBoundingClientRect();
  const xpct =
    wr && wr.width > 0 ? clampPowerGraphTooltipXPct(wr, e.clientX) : n <= 1 ? 50 : (idx / Math.max(n - 1, 1)) * 100;
  hoverIdx.value = idx;
  tooltipXPct.value = xpct;
}

function onSvgLeave() {
  hoverIdx.value = null;
  tooltipXPct.value = null;
}

function onSvgTouch(e) {
  const t0 = e.touches?.[0];
  if (!t0) return;
  onSvgMove({ currentTarget: e.currentTarget, clientX: t0.clientX });
}

function onSvgTouchEnd() {
  onSvgLeave();
}

function emitWindow(hours) {
  emit("window-hours", hours);
}
</script>

<template>
  <div v-if="open && chart" class="he-power-graph">
    <div class="he-power-graph-head">
      <div class="he-power-graph-title">{{ i18n.powerHistoryTitle ?? "Power history" }}</div>
      <div class="he-power-graph-head-actions">
        <div v-if="isTodayGraph" class="he-power-graph-window-btns">
          <span class="he-range-label">{{ i18n.powerHistoryWindow }}</span>
          <button
            v-for="hours in POWER_GRAPH_ROLLING_HOURS"
            :key="hours"
            type="button"
            class="he-range-btn"
            :class="{ 'he-range-btn--active': chart.rollingSnap === hours }"
            @click="emitWindow(hours)"
          >
            {{ hours }}h
          </button>
        </div>
        <div v-else class="he-power-graph-archive-day">{{ chart.archiveDayLine }}</div>
      </div>
    </div>
    <div class="he-power-graph-chart-wrap">
      <div class="he-power-yaxis" aria-hidden="true">
        <span>{{ chart.yTop }}</span>
        <span>{{ chart.yMid }}</span>
        <span>{{ chart.yBottom }}</span>
      </div>
      <div class="he-power-graph-svg-wrap">
        <div
          v-if="chart.hoverPt"
          class="he-power-graph-tooltip"
          :style="{ '--power-tooltip-x': chart.tooltipLeftPct + '%' }"
        >
          <div class="he-power-graph-tooltip-h">
            {{ i18n.powerGraphTooltipTime }}: {{ chart.fmtTooltipTime(chart.hoverPt.ts) }}
          </div>
          <div v-if="chart.hasLoad" class="he-power-graph-tooltip-row">
            <span class="he-power-graph-tooltip-k" :style="{ color: chart.loadStroke }">{{ i18n.houseLoad }}</span>
            <span class="he-power-graph-tooltip-v">{{
              chart.hoverPt.load != null ? fmtPowerCompact(chart.hoverPt.load) : i18n.emDash
            }}</span>
          </div>
          <div class="he-power-graph-tooltip-row">
            <span class="he-power-graph-tooltip-k" :style="{ color: chart.solarStroke }">{{
              i18n.powerGraphTooltipSolar
            }}</span>
            <span class="he-power-graph-tooltip-v">{{ fmtPowerCompact(chart.hoverPt.solar ?? 0) }}</span>
          </div>
          <div class="he-power-graph-tooltip-row">
            <span class="he-power-graph-tooltip-k" :style="{ color: chart.battDisStroke }">{{ i18n.segBattDis }}</span>
            <span class="he-power-graph-tooltip-v">{{ fmtPowerCompact(Math.max(0, chart.hoverPt.batt ?? 0)) }}</span>
          </div>
          <div class="he-power-graph-tooltip-row">
            <span class="he-power-graph-tooltip-k" :style="{ color: chart.battChgStroke }">{{ i18n.segBattChg }}</span>
            <span class="he-power-graph-tooltip-v">{{ fmtPowerCompact(Math.max(0, -(chart.hoverPt.batt ?? 0))) }}</span>
          </div>
          <div class="he-power-graph-tooltip-row">
            <span class="he-power-graph-tooltip-k" :style="{ color: chart.gridStroke }">{{
              i18n.powerGraphTooltipGrid
            }}</span>
            <span class="he-power-graph-tooltip-v">{{ fmtPowerCompact(chart.hoverPt.grid ?? 0) }}</span>
          </div>
        </div>
        <svg
          viewBox="0 0 320 120"
          width="100%"
          height="120"
          preserveAspectRatio="none"
          aria-label="power history chart"
          @mousemove="onSvgMove"
          @mouseleave="onSvgLeave"
          @touchstart.prevent="onSvgTouch"
          @touchmove.prevent="onSvgTouch"
          @touchend="onSvgTouchEnd"
          @touchcancel="onSvgTouchEnd"
        >
          <g class="he-power-grid-lines" :stroke="chart.gridStrokeCss" stroke-width="0.75" opacity="0.55" fill="none">
            <line x1="0" y1="0" x2="320" y2="0" />
            <line x1="0" :y1="chart.yMidLine" x2="320" :y2="chart.yMidLine" stroke-dasharray="3 3" />
            <line x1="0" y1="120" x2="320" y2="120" />
            <line
              v-if="chart.zeroInRange"
              x1="0"
              :y1="chart.yZeroLine"
              x2="320"
              :y2="chart.yZeroLine"
              stroke-dasharray="4 3"
              opacity="0.75"
            />
            <line x1="0" y1="0" x2="0" y2="120" stroke-width="1" />
          </g>
          <path v-if="chart.areaHouseBatt" :d="chart.areaHouseBatt" :fill="chart.fillHouseBatt" stroke="none" pointer-events="none" />
          <path v-if="chart.areaHouseGrid" :d="chart.areaHouseGrid" :fill="chart.fillHouseGrid" stroke="none" pointer-events="none" />
          <path v-if="chart.areaHouseSolar" :d="chart.areaHouseSolar" :fill="chart.fillHouseSolar" stroke="none" pointer-events="none" />
          <path
            :d="chart.lineGrid"
            fill="none"
            :stroke="chart.gridStroke"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.95"
          />
          <path
            :d="chart.lineBattChg"
            fill="none"
            stroke="#2e7d32"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.95"
          />
          <path
            :d="chart.lineBattDis"
            fill="none"
            :stroke="chart.battDisStroke"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.95"
          />
          <path
            :d="chart.lineSolar"
            fill="none"
            :stroke="chart.solarStroke"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.95"
          />
          <path
            v-if="chart.lineLoad"
            :d="chart.lineLoad"
            fill="none"
            :stroke="chart.loadStroke"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="1"
          />
          <line
            v-if="hoverIdx != null"
            pointer-events="none"
            :x1="chart.crossX"
            y1="0"
            :x2="chart.crossX"
            y2="120"
            :stroke="chart.gridStrokeCss"
            stroke-width="1"
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
    <div class="he-power-xaxis">
      <span>{{ chart.fmtTime(chart.firstTs) }}</span>
      <span>{{ chart.fmtTime(chart.mid1Ts) }}</span>
      <span>{{ chart.fmtTime(chart.mid2Ts) }}</span>
      <span>{{ chart.fmtTime(chart.lastTs) }}</span>
    </div>
    <div class="he-power-graph-legend" aria-hidden="true">
      <span v-if="chart.hasLoad" class="he-power-graph-chip">
        <span class="he-power-graph-swatch he-power-graph-swatch-line" :style="{ '--swatch-line': chart.loadStroke }" />
        {{ i18n.houseLoad }}
      </span>
      <span class="he-power-graph-chip">
        <span class="he-power-graph-swatch he-power-graph-swatch-line" :style="{ '--swatch-line': chart.solarStroke }" />
        {{ i18n.colSolar }}
      </span>
      <span class="he-power-graph-chip">
        <span class="he-power-graph-swatch he-power-graph-swatch-line" :style="{ '--swatch-line': chart.battDisStroke }" />
        {{ i18n.segBattDis }}
      </span>
          <span class="he-power-graph-chip">
        <span class="he-power-graph-swatch he-power-graph-swatch-line" :style="{ '--swatch-line': chart.battChgStroke }" />
        {{ i18n.segBattChg }}
      </span>
      <span class="he-power-graph-chip">
        <span class="he-power-graph-swatch he-power-graph-swatch-line" :style="{ '--swatch-line': chart.gridStroke }" />
        {{ i18n.colGrid }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.he-power-graph {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--secondary-background-color) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
}

.he-power-graph-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  flex-wrap: wrap;
}

.he-power-graph-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  flex: 0 0 auto;
}

.he-power-graph-head-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 auto;
  min-width: 0;
}

.he-power-graph-window-btns {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin: 0;
}

.he-power-graph-archive-day {
  font-size: 0.72rem;
  color: var(--secondary-text-color);
  text-align: right;
  line-height: 1.3;
}

.he-range-label {
  font-size: 0.76rem;
  color: var(--secondary-text-color);
  white-space: nowrap;
  margin-right: 2px;
}

.he-range-btn {
  background: none;
  border: 1px solid var(--divider-color);
  color: var(--primary-text-color);
  border-radius: 999px;
  padding: 2px 8px;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.he-range-btn--active {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 18%, transparent);
}

.he-power-graph-chart-wrap {
  display: flex;
  align-items: stretch;
  gap: 6px;
  margin-top: 2px;
}

.he-power-yaxis {
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

.he-power-graph-svg-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.he-power-graph-svg-wrap > svg {
  touch-action: none;
  display: block;
}

.he-power-graph-tooltip {
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
  background: color-mix(in srgb, var(--card-background-color) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.he-power-graph-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border: 6px solid transparent;
  border-top-color: color-mix(in srgb, var(--divider-color) 45%, var(--card-background-color) 55%);
}

.he-power-graph-tooltip-h {
  font-weight: 700;
  font-size: 0.74rem;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
}

.he-power-graph-tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-variant-numeric: tabular-nums;
}

.he-power-graph-tooltip-row + .he-power-graph-tooltip-row {
  margin-top: 4px;
}

.he-power-graph-tooltip-k {
  flex: 0 0 auto;
  font-weight: 600;
}

.he-power-graph-tooltip-v {
  font-weight: 600;
  text-align: right;
  min-width: 0;
}

.he-power-xaxis {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
  margin-left: calc(2.75rem + 6px);
  font-size: 0.68rem;
  color: color-mix(in srgb, var(--primary-text-color) 35%, var(--secondary-text-color) 65%);
  font-variant-numeric: tabular-nums;
}

.he-power-graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 6px;
  font-size: 0.72rem;
  color: var(--secondary-text-color);
}

.he-power-graph-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.he-power-graph-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 55%, transparent) inset;
}

.he-power-graph-swatch-line {
  width: 14px;
  height: 0;
  border-radius: 0;
  border-bottom: 3px solid var(--swatch-line, currentColor);
  background: transparent;
  box-shadow: none;
}
</style>
