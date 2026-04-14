<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { I18N } from "../../../../../custom_components/hub_energie/frontend/src/constants/i18n.js";
import {
  DEFAULT_POWER_GRAPH_ROLLING_HOURS,
  snapPowerGraphRollingHours,
} from "../../../../../custom_components/hub_energie/frontend/src/constants/power-graph-window.js";
import { tpl } from "../../../../../custom_components/hub_energie/frontend/src/utils/i18n-template.js";
import { parisYmdStartUtc } from "../../../../../custom_components/hub_energie/frontend/src/utils/date-utils.js";
import { yExtentFromPowerChartPoints } from "../../../../../custom_components/hub_energie/frontend/src/utils/power-graph-history.js";
import LovelaceCardEditorSimulator from "./LovelaceCardEditorSimulator.vue";
import LovelaceCardPowerGraphDemo from "./LovelaceCardPowerGraphDemo.vue";
import {
  COLOR_BATTERY,
  COLOR_GRID_SOURCE,
  COLOR_SOLAR,
  COLOR_SOLAR_EXPORT,
  COLOR_SUBSCRIPTION,
} from "../../../../../custom_components/hub_energie/frontend/src/constants/colors.js";
import { SLOTS } from "../../../../../custom_components/hub_energie/frontend/src/constants/slots.js";
import { offerLabel, slotLabel, dayColorLabel, dayColorClass } from "../../../../../custom_components/hub_energie/frontend/src/utils/energy-utils.js";
import {
  makeSectionEnergyFormatter,
  fmtPowerCompact,
  iconForLabel,
  labelLooksHc,
  isLightHexColor,
  formatEtaTimeOnly,
} from "../../../../../custom_components/hub_energie/frontend/src/utils/format-utils.js";
import { buildPowerNowData } from "../../../../../custom_components/hub_energie/frontend/src/utils/live-widget-data.js";
import { getLang } from "../../../siteShell";
import { VITRINE_PARIS_DEMO_20260413 as PARIS_DEMO } from "../../../data/vitrineParisDemo20260413.js";

const props = defineProps({
  /** Card YAML options (same keys as hub-energie-card); omitted keys default to visible like HA. */
  cardConfig: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:cardConfig"]);

/** Wall-clock span mapped to one Paris calendar day (mock). Doubled for a slower read of the day. */
const DAY_CYCLE_MS = 144_000;

/** Specs démo (alignées demande utilisateur). */
const BATTERY_CAP_KWH = 5.76;
const SOC_MIN = 10;
const SOC_MAX = 95;

const DEMO_BUCKET = PARIS_DEMO.bucketCount;
const MOCK_DAY_ISO = PARIS_DEMO.dayIso;
const DEMO_MAX_SOLAR_W = Math.max(1, ...PARIS_DEMO.solarW);

function demoBucketIndex(hr) {
  const u = ((hr % 24) + 24) % 24;
  return Math.min(DEMO_BUCKET - 1, Math.max(0, Math.floor((u / 24) * DEMO_BUCKET)));
}

function demoPower(field, hr) {
  const arr = PARIS_DEMO[field];
  if (!Array.isArray(arr)) return 0;
  const v = arr[demoBucketIndex(hr)];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** Integrate mean power (W) over 5‑minute buckets from midnight Paris to hrEnd (0..24). */
function demoKwhIntegral(field, hrEnd) {
  const arr = PARIS_DEMO[field];
  if (!Array.isArray(arr)) return 0;
  const H = ((hrEnd % 24) + 24) % 24;
  let kwh = 0;
  for (let i = 0; i < DEMO_BUCKET; i++) {
    const bucketStartHr = (i / DEMO_BUCKET) * 24;
    const bucketEndHr = ((i + 1) / DEMO_BUCKET) * 24;
    if (bucketStartHr >= H) break;
    const overlapHr = Math.min(H, bucketEndHr) - bucketStartHr;
    if (overlapHr <= 0) continue;
    kwh += (arr[i] * overlapHr) / 1000;
  }
  return kwh;
}

/** Battery SOC % from HA long-term statistics (same 5 min buckets as power). */
function demoSocPercent(hr) {
  const arr = PARIS_DEMO.socPct;
  if (!Array.isArray(arr) || !arr.length) return 55;
  const v = arr[demoBucketIndex(hr)];
  if (typeof v !== "number" || !Number.isFinite(v)) return 55;
  return Math.max(SOC_MIN, Math.min(SOC_MAX, v));
}

const lang = ref("en");

const editorOpen = ref(false);
const showRaw = ref(false);
/** Open by default so visitors immediately see power history like the real card. */
const graphOpen = ref(true);

function syncLang() {
  const l = getLang();
  lang.value = l === "fr" ? "fr" : "en";
}

const i18n = computed(() => (lang.value === "fr" ? I18N.fr : I18N.en));

/** Section visibility: same rule as hub-energie-card.js `_showSection`. */
function showSection(key) {
  const v = props.cardConfig?.[key];
  return v !== false && v !== "false";
}

watch(
  () => props.cardConfig?.show_raw_control,
  (v) => {
    if (v === false) showRaw.value = false;
  },
);

watch(
  () => props.cardConfig?.show_live_power,
  (v) => {
    if (v === false) graphOpen.value = false;
  },
);

const graphHoursSnap = computed(() => {
  const raw = parseFloat(props.cardConfig?.power_history_hours);
  return snapPowerGraphRollingHours(Number.isFinite(raw) ? raw : NaN, DEFAULT_POWER_GRAPH_ROLLING_HOURS);
});

/** 0..<24 — virtual hour of the mocked day (0 = midnight). */
const hourDecimal = ref(0);
let raf = 0;
let startMs = 0;

const prevHrForWrap = ref(-1);

/** When true, the virtual day clock stops (timeline + widgets freeze). */
const timelinePaused = ref(false);

function syncTimelineStartToFrozenHour() {
  const now = performance.now();
  const hr = hourDecimal.value;
  startMs = now - (hr / 24) * DAY_CYCLE_MS;
}

function tick(now) {
  if (timelinePaused.value) {
    return;
  }
  const elapsed = now - startMs;
  const u = (elapsed % DAY_CYCLE_MS) / DAY_CYCLE_MS;
  const hr = u * 24;
  if (prevHrForWrap.value > 22 && hr < 0.5) {
    socSim.value = demoSocPercent(0);
  }
  prevHrForWrap.value = hr;

  lastTickMs = now;
  socSim.value = demoSocPercent(hr);

  hourDecimal.value = hr;
  raf = requestAnimationFrame(tick);
}

function toggleTimelinePause() {
  if (timelinePaused.value) {
    timelinePaused.value = false;
    syncTimelineStartToFrozenHour();
    lastTickMs = performance.now();
    raf = requestAnimationFrame(tick);
  } else {
    timelinePaused.value = true;
    cancelAnimationFrame(raf);
    raf = 0;
    syncTimelineStartToFrozenHour();
  }
}

onMounted(() => {
  syncLang();
  window.addEventListener("hub-energie-lang", syncLang);
  startMs = performance.now();
  lastTickMs = startMs;
  prevHrForWrap.value = -1;
  socSim.value = demoSocPercent(0);
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", syncLang);
  cancelAnimationFrame(raf);
});

const h = computed(() => hourDecimal.value);

/** 0 at night, ~1 at peak PV for the baked-in HA statistics day. */
const sunFactor = computed(() =>
  Math.min(1, Math.max(0, demoPower("solarW", h.value) / DEMO_MAX_SOLAR_W)),
);

/** Smooth wobble for “live” feel (still tied to time of day). */
function wobble(seed, amp = 1) {
  const t = h.value * 0.9 + seed;
  return Math.sin(t * 1.7) * amp;
}

/** Tempo calendar colours for the demo day — baked from `sensor.hub_energie_cost_detail` (HA: `today_color` / `tomorrow_color`, FR tokens bleu/blanc/rouge). */
const DEMO_TEMPO_DAY_COLORS = PARIS_DEMO.tempoDayColors;
const todayColorRaw =
  DEMO_TEMPO_DAY_COLORS?.today && typeof DEMO_TEMPO_DAY_COLORS.today === "string"
    ? DEMO_TEMPO_DAY_COLORS.today.trim()
    : "blue";
const tomorrowColorRaw =
  DEMO_TEMPO_DAY_COLORS?.tomorrow && typeof DEMO_TEMPO_DAY_COLORS.tomorrow === "string"
    ? DEMO_TEMPO_DAY_COLORS.tomorrow.trim()
    : "white";

/**
 * Tempo import slot (heures entières).
 * **HP** = 6h–22h ; **HC** = 0h–6h et 22h–24h.
 * Jour « bleu » : HC nuit = bleu ; dès **6h** on passe **blanc** en HP jusqu’à 22h, puis blanc HC.
 */
function tempoSlotIdAtHour(hrFloat) {
  const H = Math.floor(hrFloat) % 24;
  if (H < 6) return "bleu_hc";
  if (H < 22) return "blanc_hp";
  return "blanc_hc";
}

/** SOC % — sampled from baked HA statistics (`socPct`) each frame. */
const socSim = ref(55);
let lastTickMs = 0;

/** Power snapshot from HA long-term statistics (5 min means) for {@link MOCK_DAY_ISO}. */
function dispatchPowerFlow(hr, _socUnused) {
  const soc = demoSocPercent(hr);
  const load = demoPower("loadW", hr);
  const solar = demoPower("solarW", hr);
  const battDis = Math.max(0, demoPower("battDisW", hr));
  const battChg = Math.max(0, demoPower("battChgW", hr));
  const exportW = Math.max(0, demoPower("gridExportW", hr));
  const gridSigned = demoPower("gridSignedW", hr);
  const avail = (BATTERY_CAP_KWH * Math.max(0, soc - SOC_MIN)) / 100;

  return {
    grid_power_signed_w: gridSigned,
    solar_power_w: solar,
    batt_discharge_power_w: battDis,
    batt_charge_power_w: battChg,
    load_power_w: load,
    export_power_w: exportW,
    battery_capacity_kwh: BATTERY_CAP_KWH,
    battery_soc_percent: soc,
    battery_soc_min_percent: SOC_MIN,
    battery_soc_max_percent: SOC_MAX,
    battery_available_kwh: avail,
  };
}

/** Alias pour le catalogue / états HA. */
function powerSnapshot(hr, soc) {
  return dispatchPowerFlow(hr, soc);
}

function seekVirtualDayToHour(hrTarget) {
  const now = performance.now();
  const clamped = Math.min(24 - Number.EPSILON, Math.max(0, hrTarget));
  startMs = now - (clamped / 24) * DAY_CYCLE_MS;
  lastTickMs = now;
  prevHrForWrap.value = clamped;
  socSim.value = demoSocPercent(clamped);
  hourDecimal.value = clamped;
}

function onTimelineTrackPointer(ev) {
  const el = ev.currentTarget;
  if (!(el instanceof HTMLElement)) return;
  const rect = el.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const frac = rect.width > 0 ? Math.min(1, Math.max(0, x / rect.width)) : 0;
  seekVirtualDayToHour(frac * 24);
}

const mockDate = computed(() => MOCK_DAY_ISO);

const rangeLabelShort = computed(() => {
  const [y, m, d] = MOCK_DAY_ISO.split("-");
  return lang.value === "fr" ? `${d}/${m}/${y}` : MOCK_DAY_ISO;
});

const clockLabel = computed(() => {
  const totalMin = Math.floor(h.value * 60);
  const hh = Math.floor(totalMin / 60) % 24;
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
});

const timelineTicks = computed(() => {
  const ticks = [];
  for (let hr = 0; hr <= 24; hr += 3) {
    ticks.push({
      key: hr,
      label: hr === 0 ? "0h" : hr === 24 ? "24h" : `${hr}h`,
    });
  }
  return ticks;
});

const playheadPct = computed(() => (h.value / 24) * 100);

const graphLocale = computed(() => (lang.value === "fr" ? "fr-FR" : "en-US"));

/** Rolling window [now−H, now] in simulated hours (same idea as HA “today” power graph). */
const powerGraphHistoryPts = computed(() => {
  const slotH = graphHoursSnap.value;
  const curH = h.value;
  const winStart = Math.max(0, curH - slotH);
  const winEnd = curH;
  const dayStartMs = parisYmdStartUtc(mockDate.value).getTime();
  if (!Number.isFinite(dayStartMs)) return [];
  const pts = [];
  /** One point per 5‑minute statistics bucket (same as HA), aligned to window edges. */
  const i0 = demoBucketIndex(winStart);
  const i1 = demoBucketIndex(Math.max(winStart, winEnd - Number.EPSILON));
  for (let bi = i0; bi <= i1; bi++) {
    let hr = ((bi + 0.5) / DEMO_BUCKET) * 24;
    if (bi === i0) hr = Math.max(hr, winStart);
    if (bi === i1) hr = Math.min(hr, winEnd);
    const snap = powerSnapshot(hr, null);
    const ts = dayStartMs + (hr / 24) * 86_400_000;
    pts.push({
      ts,
      solar: snap.solar_power_w ?? 0,
      grid: snap.grid_power_signed_w ?? 0,
      batt: (snap.batt_discharge_power_w ?? 0) - (snap.batt_charge_power_w ?? 0),
      load: snap.load_power_w ?? 0,
    });
  }
  return pts;
});

const powerGraphDisplaySeries = computed(() => {
  const pts = powerGraphHistoryPts.value;
  if (!pts.length) return null;
  const { yMin, yMax } = yExtentFromPowerChartPoints(pts);
  return {
    pts,
    yMin,
    yMax,
    hasLoadEntity: true,
    dayIso: mockDate.value,
  };
});

function onPowerGraphWindowHours(hours) {
  emit("update:cardConfig", { ...props.cardConfig, power_history_hours: hours });
}

const offer = "tempo";
const contractPower = "9";

const subtitle = computed(() => `${offerLabel(offer)} ${contractPower}kVA`);

/** Mock cost_detail attributes (partial) for power + battery widgets — coherent with SOC loop. */
const mockCostAttrs = computed(() => powerSnapshot(h.value, socSim.value));

const mockStates = computed(() => ({
  sensor_hub_energie_cost_detail: {
    state: "ok",
    attributes: mockCostAttrs.value,
  },
}));

const powerNowData = computed(() =>
  buildPowerNowData(mockStates.value, "sensor_hub_energie_cost_detail", i18n.value),
);

const powerSegs = computed(() => {
  const d = powerNowData.value;
  if (!d) return [];
  const gridImp = d.gridSigned != null ? Math.max(0, d.gridSigned) : 0;
  const segs = [];
  if (d.gridSigned != null && gridImp > 0) {
    segs.push({ w: gridImp, c: COLOR_GRID_SOURCE, t: `${i18n.value.segImport} +${fmtPowerCompact(gridImp)}` });
  }
  if (d.battDis != null && d.battDis > 0) {
    segs.push({ w: d.battDis, c: COLOR_BATTERY, t: `${i18n.value.segBattDis} +${fmtPowerCompact(d.battDis)}` });
  }
  if (d.solar != null && d.solar > 0) {
    segs.push({ w: d.solar, c: COLOR_SOLAR, t: `${i18n.value.segSolar} ${fmtPowerCompact(d.solar)}` });
  }
  return segs;
});

const powerSegTotal = computed(() => powerSegs.value.reduce((a, s) => a + s.w, 0));

const gridCell = computed(() => {
  const d = powerNowData.value;
  if (!d) return "—";
  if (d.gridSigned != null) return fmtPowerCompact(d.gridSigned);
  if (d.exportW != null && d.exportW > 0) return fmtPowerCompact(-d.exportW);
  return "—";
});

const solarCell = computed(() => {
  const d = powerNowData.value;
  return d?.solar != null ? fmtPowerCompact(d.solar) : "—";
});

const battCell = computed(() => {
  const d = powerNowData.value;
  if (!d) return "—";
  const net = (d.battDis ?? 0) - (d.battChg ?? 0);
  return fmtPowerCompact(net);
});

/** Signed battery power (W): same net as hub-power-now — **> 0 = discharging to home**, **< 0 = charging**. */
const battNetW = computed(() => {
  const d = powerNowData.value;
  if (!d) return 0;
  return (d.battDis ?? 0) - (d.battChg ?? 0);
});

const loadStr = computed(() => {
  const d = powerNowData.value;
  return d?.load != null ? fmtPowerCompact(d.load) : "—";
});

const powerTooltip = computed(() => powerNowData.value?.tooltip ?? "");

/** Tempo **import** slot: changes only on full hours (6h, 22h); max two day colours (bleu + blanc) in this demo. */
const currentSlotId = computed(() => tempoSlotIdAtHour(h.value));
const currentSlotText = computed(() => slotLabel(currentSlotId.value, offer, i18n.value));

const todayTileClass = computed(() => `he-day-tile ${dayColorClass(todayColorRaw)}`);
const tomorrowTileClass = computed(() => `he-day-tile ${dayColorClass(tomorrowColorRaw)}`);

/** Fallback if demo bundle has no `tempoDays` (HA snapshot). */
const FALLBACK_TEMPO_DAYS = {
  blue: { remaining: 8, elapsed: 11 },
  white: { remaining: 9, elapsed: 10 },
  red: { remaining: 2, elapsed: 3 },
};

function demoTempoDaysFromBundle() {
  const raw = PARIS_DEMO.tempoDays;
  if (!raw || typeof raw !== "object") return null;
  const { blue, white, red } = raw;
  const ok = (c) =>
    c &&
    typeof c === "object" &&
    Number.isFinite(Number(c.remaining)) &&
    Number.isFinite(Number(c.elapsed));
  if (!ok(blue) || !ok(white) || !ok(red)) return null;
  return {
    blue: { remaining: Number(blue.remaining), elapsed: Number(blue.elapsed) },
    white: { remaining: Number(white.remaining), elapsed: Number(white.elapsed) },
    red: { remaining: Number(red.remaining), elapsed: Number(red.elapsed) },
  };
}

/** Tempo day counters (remaining / total) — baked from `sensor.hub_energie_cost_detail` for the demo export. */
const tempoDays = computed(() => demoTempoDaysFromBundle() ?? FALLBACK_TEMPO_DAYS);

const tempoSlotsNoUnknown = computed(() => SLOTS.filter((s) => s.id !== "unknown"));

const gridSlotBreakdownRows = computed(() =>
  tempoSlotsNoUnknown.value
    .map((s) => {
      const v = gridBySlot.value[s.id] ?? 0;
      if (v <= 0.0001) return null;
      const lbl = slotLabel(s.id, offer, i18n.value);
      return {
        slot: s,
        label: lbl,
        value: gridEnergyFmt.value(v),
        rawV: v,
        swatchClass: [labelLooksHc(lbl) ? "fill-hc" : "", swatchIconClass(s.color)].filter(Boolean).join(" "),
      };
    })
    .filter(Boolean),
);

/** kWh imported per Tempo slot: only bleu + blanc segments, cumulative hours × fixed kW rate (smooth wobble). */
const TEMPO_SLOT_IMPORT_KW = {
  bleu_hc: 1.85,
  blanc_hp: 2.05,
  blanc_hc: 1.55,
};

function hoursIntoTempoSlot(slotId, hr) {
  if (slotId === "bleu_hc") return Math.min(6, Math.max(0, hr));
  if (slotId === "blanc_hp") return Math.min(16, Math.max(0, hr - 6));
  if (slotId === "blanc_hc") return Math.min(2, Math.max(0, hr - 22));
  return 0;
}

const dayFrac = computed(() => h.value / 24);
const baseScale = computed(() => 0.35 + 0.65 * dayFrac.value);

const gridBySlot = computed(() => {
  const hr = h.value;
  const targetKwh = demoKwhIntegral("gridImportW", hr);
  const shape = {};
  let sumShape = 0;
  const wob = 0.94 + 0.06 * Math.sin(hr * 0.25 + 1.1);
  for (const id of Object.keys(TEMPO_SLOT_IMPORT_KW)) {
    const hrs = hoursIntoTempoSlot(id, hr);
    const v = hrs * TEMPO_SLOT_IMPORT_KW[id] * wob;
    if (v > 0.0001) {
      shape[id] = v;
      sumShape += v;
    }
  }
  const out = {};
  if (sumShape <= 1e-9 || targetKwh <= 0) return out;
  const scale = targetKwh / sumShape;
  for (const id of Object.keys(shape)) {
    out[id] = shape[id] * scale;
  }
  return out;
});

const totalGridKwh = computed(() => Object.values(gridBySlot.value).reduce((a, v) => a + v, 0));

const gridStripSegs = computed(() =>
  SLOTS.filter((s) => s.id !== "unknown")
    .map((s) => {
      const v = gridBySlot.value[s.id] ?? 0;
      if (v <= 0.0001) return null;
      return {
        value: v,
        color: s.color,
        className: s.id.endsWith("_hc") ? "fill-hc" : "",
      };
    })
    .filter(Boolean),
);

const gridStripTotal = computed(() => gridStripSegs.value.reduce((a, s) => a + s.value, 0));

const gridEnergyFmt = computed(() => makeSectionEnergyFormatter(Object.values(gridBySlot.value)));

const homeBySource = computed(() => {
  const hr = h.value;
  const loadInt = demoKwhIntegral("loadW", hr);
  const gridInt = demoKwhIntegral("gridImportW", hr);
  const solarInt = demoKwhIntegral("solarW", hr);
  const battDisInt = demoKwhIntegral("battDisW", hr);
  const denom = gridInt + solarInt + battDisInt;
  if (denom < 1e-6) return { g: 0, s: 0, b: 0 };
  const g = loadInt * (gridInt / denom);
  const s = loadInt * (solarInt / denom);
  const b = loadInt * (battDisInt / denom);
  return { g, s, b };
});

const totalHomeKwh = computed(() => {
  const u = homeBySource.value;
  return u.g + u.s + u.b;
});

const homeStripSegs = computed(() => {
  const u = homeBySource.value;
  return [
    { value: u.g, color: COLOR_GRID_SOURCE, className: "" },
    { value: u.s, color: COLOR_SOLAR, className: "" },
    { value: u.b, color: COLOR_BATTERY, className: "" },
  ].filter((x) => x.value > 0.001);
});

const homeStripTotal = computed(() => homeStripSegs.value.reduce((a, s) => a + s.value, 0));

const homeEnergyFmt = computed(() => makeSectionEnergyFormatter([totalHomeKwh.value]));

const homeBreakdown = computed(() => {
  const u = homeBySource.value;
  const fmt = homeEnergyFmt.value;
  const tot = totalHomeKwh.value || 1;
  return [
    { label: i18n.value.usageGridDirect, value: fmt(u.g), color: COLOR_GRID_SOURCE, rawV: u.g, icon: "mdi:transmission-tower" },
    { label: i18n.value.usageSolarDirect, value: fmt(u.s), color: COLOR_SOLAR, rawV: u.s, icon: "mdi:weather-sunny" },
    { label: i18n.value.usageBattHome, value: fmt(u.b), color: COLOR_BATTERY, rawV: u.b, icon: "mdi:battery" },
  ];
});

/** Cumulative battery charge (kWh) from HA statistics up to the virtual hour. */
const totalBattChgKwh = computed(() => demoKwhIntegral("battChgW", h.value));

const battChargeBySource = computed(() => {
  const hr = h.value;
  const t = totalBattChgKwh.value;
  const solarChgArr = PARIS_DEMO.battChgSolarW;
  const gridChgArr = PARIS_DEMO.battChgGridW;
  if (Array.isArray(solarChgArr) && Array.isArray(gridChgArr) && solarChgArr.length === DEMO_BUCKET && gridChgArr.length === DEMO_BUCKET) {
    const fromSolar = demoKwhIntegral("battChgSolarW", hr);
    const fromGrid = demoKwhIntegral("battChgGridW", hr);
    return { fromSolar, fromGrid };
  }
  const sInt = demoKwhIntegral("solarW", hr);
  const gInt = demoKwhIntegral("gridImportW", hr);
  const denom = sInt + gInt;
  const wSolar = denom > 1e-6 ? sInt / denom : 0.65;
  const fromSolar = t * wSolar;
  const fromGrid = Math.max(0, t - fromSolar);
  return { fromSolar, fromGrid };
});

const battStripSegs = computed(() => {
  const u = battChargeBySource.value;
  return [
    { value: u.fromSolar, color: COLOR_SOLAR, className: "" },
    { value: u.fromGrid, color: COLOR_GRID_SOURCE, className: "" },
  ].filter((x) => x.value > 0.001);
});

const battStripTotal = computed(() => battStripSegs.value.reduce((a, s) => a + s.value, 0));

const battChgRows = computed(() => [
  { label: i18n.value.usageSolarBatt, v: battChargeBySource.value.fromSolar, color: COLOR_SOLAR },
  { label: i18n.value.usageGridBatt, v: battChargeBySource.value.fromGrid, color: COLOR_GRID_SOURCE },
]);

const battChgEnergyFmt = computed(() => makeSectionEnergyFormatter([totalBattChgKwh.value]));

const battBreakdown = computed(() =>
  battChgRows.value.map((r) => ({
    label: r.label,
    value: battChgEnergyFmt.value(r.v),
    color: r.color,
    rawV: r.v,
    icon: iconForLabel(r.label),
  })),
);

const costBySlot = computed(() => {
  const scale = 0.12 * baseScale.value;
  const out = {};
  for (const s of SLOTS) {
    if (s.id === "unknown") continue;
    out[s.id] = Math.max(0, (gridBySlot.value[s.id] ?? 0) * 0.045 * (1 + 0.2 * wobble(s.id.length)));
  }
  return out;
});

const aboEur = computed(() => 0.35 * (0.5 + 0.5 * dayFrac.value));
const totalCostEur = computed(() => aboEur.value + Object.values(costBySlot.value).reduce((a, v) => a + v, 0));

const costStripSegs = computed(() => {
  const segs = SLOTS.filter((s) => s.id !== "unknown")
    .map((s) => {
      const v = costBySlot.value[s.id] ?? 0;
      if (v <= 0.0001) return null;
      return { value: v, color: s.color, className: s.id.endsWith("_hc") ? "fill-hc" : "" };
    })
    .filter(Boolean);
  if (aboEur.value > 0.0005) {
    segs.push({ value: aboEur.value, color: COLOR_SUBSCRIPTION, className: "" });
  }
  return segs;
});

const costStripTotal = computed(() => costStripSegs.value.reduce((a, s) => a + s.value, 0));

const costBreakdown = computed(() => {
  const rows = SLOTS.filter((s) => s.id !== "unknown")
    .map((s) => {
      const v = costBySlot.value[s.id] ?? 0;
      if (v <= 0.0001) return null;
      return {
        label: slotLabel(s.id, offer, i18n.value),
        value: `${v.toFixed(2)} €`,
        color: s.color,
        rawV: v,
        icon: "mdi:transmission-tower",
      };
    })
    .filter(Boolean);
  if (aboEur.value > 0.0005) {
    rows.push({
      label: i18n.value.costSubscription,
      value: `${aboEur.value.toFixed(2)} €`,
      color: COLOR_SUBSCRIPTION,
      rawV: aboEur.value,
      icon: "mdi:calendar-month",
    });
  }
  return rows;
});

/** Scale 0..1 from cumulative grid export (demo) vs full virtual day — used with baked HA reinjection totals. */
const reinjExportScale = computed(() => {
  const exportFull = demoKwhIntegral("gridExportW", 24 - 1e-6);
  const exportSoFar = demoKwhIntegral("gridExportW", h.value);
  if (exportFull <= 1e-9) return 0;
  return Math.min(1, exportSoFar / exportFull);
});

const reinj = computed(() => {
  const exportSoFar = demoKwhIntegral("gridExportW", h.value);
  const exportFull = demoKwhIntegral("gridExportW", 24 - 1e-6);
  const t = PARIS_DEMO.reinjKwhDayTotals;
  if (
    t &&
    typeof t === "object" &&
    typeof t.solarSurplus === "number" &&
    typeof t.batteryFull === "number" &&
    typeof t.switchLatency === "number" &&
    typeof t.unattributed === "number" &&
    exportFull > 1e-9
  ) {
    const S =
      Math.max(0, t.solarSurplus) +
      Math.max(0, t.batteryFull) +
      Math.max(0, t.switchLatency) +
      Math.max(0, t.unattributed);
    if (S <= 1e-9) {
      return { solarSurplus: 0, batteryFull: 0, switchLatency: 0, unattributed: 0 };
    }
    const e = exportSoFar;
    const ps = Math.max(0, t.solarSurplus) / S;
    const pb = Math.max(0, t.batteryFull) / S;
    const pw = Math.max(0, t.switchLatency) / S;
    const pu = Math.max(0, t.unattributed) / S;
    return {
      solarSurplus: e * ps,
      batteryFull: e * pb,
      switchLatency: e * pw,
      unattributed: e * pu,
    };
  }
  const exportK = exportSoFar;
  const solarSurplus = exportK * 0.78;
  const batteryFull = exportK * 0.14;
  const switchLatency = exportK * 0.05;
  const unattributed = Math.max(0, exportK - solarSurplus - batteryFull - switchLatency);
  return { solarSurplus, batteryFull, switchLatency, unattributed };
});

const reinjEurByRow = computed(() => {
  const r = reinj.value;
  const tE = PARIS_DEMO.reinjEurDayTotals;
  const sc = reinjExportScale.value;
  if (
    tE &&
    typeof tE === "object" &&
    typeof tE.solarSurplus === "number" &&
    typeof tE.batteryFull === "number" &&
    typeof tE.switchLatency === "number" &&
    typeof tE.unattributed === "number" &&
    PARIS_DEMO.reinjKwhDayTotals
  ) {
    return {
      solarSurplus: tE.solarSurplus * sc,
      batteryFull: tE.batteryFull * sc,
      switchLatency: tE.switchLatency * sc,
      unattributed: tE.unattributed * sc,
    };
  }
  return {
    solarSurplus: r.solarSurplus * 0.12,
    batteryFull: r.batteryFull * 0.1,
    switchLatency: r.switchLatency * 0.08,
    unattributed: r.unattributed * 0.06,
  };
});

const reinjItems = computed(() => {
  const r = reinj.value;
  const eur = reinjEurByRow.value;
  return [
    { label: `${i18n.value.reinjLabelSolarSurplus} ${i18n.value.reinjCauseSolarSurplus}`, v: r.solarSurplus, eur: eur.solarSurplus, color: COLOR_SOLAR_EXPORT },
    { label: `${i18n.value.reinjLabelBatteryFull} ${i18n.value.reinjCauseBatteryFull}`, v: r.batteryFull, eur: eur.batteryFull, color: COLOR_BATTERY },
    { label: `${i18n.value.reinjLabelSwitchLatency} ${i18n.value.reinjCauseSwitchLatency}`, v: r.switchLatency, eur: eur.switchLatency, color: "#78909c" },
    { label: `${i18n.value.reinjLabelOther} ${i18n.value.reinjCauseOther}`, v: r.unattributed, eur: eur.unattributed, color: "#9e9e9e" },
  ];
});

const totalReinjKwh = computed(() => reinjItems.value.reduce((a, x) => a + x.v, 0));
const reinjOppTotal = computed(() => reinjItems.value.reduce((a, x) => a + x.eur, 0));

const reinjEnergyFmt = computed(() => makeSectionEnergyFormatter([totalReinjKwh.value]));

const reinjStripSegs = computed(() =>
  reinjItems.value.filter((x) => x.v > 0.0001).map((x) => ({ value: x.v, color: x.color, className: "" })),
);

const reinjStripTotal = computed(() => reinjStripSegs.value.reduce((a, s) => a + s.value, 0));

const reinjBreakdown = computed(() =>
  reinjItems.value
    .filter((x) => x.v > 0.0001)
    .map((x) => ({
      label: x.label,
      value: `${reinjEnergyFmt.value(x.v)} · ${x.eur.toFixed(2)} €`,
      color: x.color,
      rawV: x.v,
      icon: iconForLabel(x.label),
    })),
);

const ecoSolar = computed(() => (0.25 + 0.55 * sunFactor.value) * baseScale.value);
const ecoBatt = computed(() => (0.08 + 0.22 * sunFactor.value) * baseScale.value);
const ecoTotal = computed(() => ecoSolar.value + ecoBatt.value);

const ecoParts = computed(() => [
  { label: i18n.value.ecoSourceSolar, vAbs: Math.abs(ecoSolar.value), color: COLOR_SOLAR, fmt: `${ecoSolar.value >= 0 ? "+" : ""}${ecoSolar.value.toFixed(2)} €`, rawV: ecoSolar.value },
  { label: i18n.value.ecoSourceBatt, vAbs: Math.abs(ecoBatt.value), color: COLOR_BATTERY, fmt: `${ecoBatt.value >= 0 ? "+" : ""}${ecoBatt.value.toFixed(2)} €`, rawV: ecoBatt.value },
].filter((x) => x.vAbs > 0.0005));

const totalEcoAbs = computed(() => ecoParts.value.reduce((a, x) => a + x.vAbs, 0));

const ecoSegments = computed(() => {
  if (ecoParts.value.length) {
    return ecoParts.value.map((x) => ({ value: x.vAbs, color: x.color }));
  }
  return Math.abs(ecoTotal.value) > 0.0005 ? [{ value: 1, color: ecoTotal.value >= 0 ? "#1976d2" : "#c62828" }] : [];
});

const ecoStripTotal = computed(() => ecoSegments.value.reduce((a, s) => a + s.value, 0));

const ecoBreakdown = computed(() =>
  ecoParts.value.length
    ? ecoParts.value.map((x) => ({ label: x.label, value: x.fmt, color: x.color, rawV: x.vAbs }))
    : [],
);

const homeSolarKwh = computed(() => homeBySource.value.s);
const solarKwhTotal = computed(() => homeSolarKwh.value + battChargeBySource.value.fromSolar + reinj.value.solarSurplus);

const solarKwhData = computed(() => {
  const total = solarKwhTotal.value;
  if (total <= 0.001) return null;
  const home = homeSolarKwh.value;
  const toBatt = battChargeBySource.value.fromSolar;
  const toGrid = reinj.value.solarSurplus;
  const fmt = makeSectionEnergyFormatter([total, home, toBatt, toGrid]);
  return {
    segments: [
      { label: i18n.value.solarProdSegHome, value: home, color: COLOR_SOLAR, icon: "mdi:home-lightning-bolt-outline" },
      { label: i18n.value.solarProdSegBattery, value: toBatt, color: COLOR_BATTERY, icon: "mdi:battery-plus-variant" },
      { label: i18n.value.solarProdSegExport, value: toGrid, color: COLOR_SOLAR_EXPORT, icon: "mdi:transmission-tower-export" },
    ],
    total,
    formatter: (v) => fmt(v),
    tooltip: i18n.value.solarProdKwhTip,
  };
});

const showSolarInConsumption = computed(
  () => showSection("show_consumption") && showSection("show_solar_production_bar") && solarKwhData.value,
);

const originGrid = computed(() => homeBySource.value.g);
const insightPct = computed(() => {
  const th = totalHomeKwh.value;
  if (!(th > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - Math.min(originGrid.value, th) / th) * 100)));
});

const insightAutoClass = computed(() => {
  const p = insightPct.value;
  if (p >= 60) return "eco";
  if (p >= 30) return "";
  return "warn";
});

const vsGridSign = computed(() => (ecoTotal.value >= 0 ? "−" : "+"));
const vsGridClass = computed(() => (ecoTotal.value >= 0 ? "eco" : "neg"));

const activeGridSlots = computed(() =>
  SLOTS.filter((s) => s.id !== "unknown")
    .map((s) => {
      const v = gridBySlot.value[s.id] ?? 0;
      return v > 0.0001 ? { id: s.id, v, label: slotLabel(s.id, offer, i18n.value) } : null;
    })
    .filter(Boolean),
);

const activeCostSlots = computed(() =>
  SLOTS.filter((s) => s.id !== "unknown")
    .map((s) => {
      const v = costBySlot.value[s.id] ?? 0;
      return v > 0.0001 ? { id: s.id, v, label: slotLabel(s.id, offer, i18n.value) } : null;
    })
    .filter(Boolean),
);

const rawUsageLines = computed(() => {
  const u = homeBySource.value;
  return [
    { label: i18n.value.usageGridDirect, v: u.g },
    { label: i18n.value.usageGridBatt, v: battChargeBySource.value.fromGrid },
    { label: i18n.value.usageSolarDirect, v: u.s },
    { label: i18n.value.usageSolarBatt, v: battChargeBySource.value.fromSolar },
    { label: i18n.value.usageBattHome, v: u.b },
  ];
});

/** Battery bar cells (port of hub-battery-bar.js). */
const segmentCount = 18;

const battOverlay = computed(() => {
  const d = mockCostAttrs.value;
  const cap = d.battery_capacity_kwh;
  const soc = d.battery_soc_percent;
  const socMin = d.battery_soc_min_percent;
  const socMax = d.battery_soc_max_percent;
  const avail = d.battery_available_kwh;
  const loc = lang.value === "fr" ? "fr-FR" : "en-US";
  const fmtK = (v) =>
    Number(v).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const availShow = avail != null && Number.isFinite(avail) ? avail : (cap * Math.max(0, soc - socMin)) / 100;
  const pctLabel = Math.round(soc).toLocaleString(loc);
  return `${fmtK(availShow)} / ${fmtK(cap)} kWh (${pctLabel}\u00a0%)`;
});

const battEta = computed(() => {
  const d = mockCostAttrs.value;
  const cap = d.battery_capacity_kwh;
  const soc = d.battery_soc_percent ?? 0;
  if (cap == null || cap <= 0) return null;
  const threshold = 40;
  const netW = battNetW.value;
  if (netW > threshold) {
    const storedKwh = (cap * soc) / 100;
    const dischargePowerKw = netW / 1000;
    if (dischargePowerKw > 0) {
      return { icon: "mdi:battery-low", time: formatEtaTimeOnly((storedKwh / dischargePowerKw) * 60) };
    }
  } else if (netW < -threshold) {
    const remainingKwh = cap * (1 - soc / 100);
    const chargePowerKw = -netW / 1000;
    if (chargePowerKw > 0) {
      return { icon: "mdi:battery-charging-high", time: formatEtaTimeOnly((remainingKwh / chargePowerKw) * 60) };
    }
  }
  return null;
});

const battFlowMode = computed(() => {
  const netW = battNetW.value;
  const threshold = 40;
  if (netW > threshold) return "discharging";
  if (netW < -threshold) return "charging";
  return "idle";
});

const battSegmentClass = computed(() => {
  const f = battFlowMode.value;
  if (f === "charging") return "he-batt-segments batt-green--charging";
  if (f === "discharging") return "he-batt-segments batt-green--discharging";
  return "he-batt-segments";
});

const battCells = computed(() => {
  const d = mockCostAttrs.value;
  const socMin = Math.max(0, Math.min(100, Number(d.battery_soc_min_percent ?? 0)));
  let socMax = Math.max(socMin, Math.min(100, Number(d.battery_soc_max_percent ?? 100)));
  const socRaw = Math.max(0, Math.min(100, Number(d.battery_soc_percent ?? 0)));
  const soc = Math.min(socMax, Math.max(socMin, socRaw));
  const cap = d.battery_capacity_kwh ?? 10;
  const avail = d.battery_available_kwh;
  let greenEnd = soc;
  if (avail != null && Number.isFinite(avail) && cap > 0) {
    const fromAvail = socMin + (avail / cap) * 100;
    greenEnd = Math.min(Math.max(fromAvail, socMin), soc, socMax);
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const pctSpan = (a, b, start, end) => Math.max(0, Math.min(b, end) - Math.max(a, start));
  const cellPct = 100 / segmentCount;
  const cells = [];
  for (let i = 0; i < segmentCount; i++) {
    const start = i * cellPct;
    const end = (i + 1) * cellPct;
    const hatchL = (pctSpan(start, end, start, socMin) / cellPct) * 100;
    const hatchR = (pctSpan(start, end, socMax, end) / cellPct) * 100;
    const fillStart = Math.max(start, socMin);
    const fillEnd = Math.min(end, greenEnd, socMax);
    const fillW = (pctSpan(start, end, fillStart, fillEnd) / cellPct) * 100;
    const fillX = clamp01((fillStart - start) / cellPct) * 100;
    cells.push({
      style: `--hatch-l:${hatchL.toFixed(3)};--hatch-r:${hatchR.toFixed(3)};--fill-x:${fillX.toFixed(3)};--fill-w:${fillW.toFixed(3)};`,
    });
  }
  return cells;
});

/** mdi → Bootstrap Icons (subset for vitrine). */
function mdiToBi(icon) {
  const m = {
    "mdi:transmission-tower": "bi-broadcast",
    "mdi:weather-sunny": "bi-sun-fill",
    "mdi:battery": "bi-battery-half",
    "mdi:home-lightning-bolt-outline": "bi-house-fill",
    "mdi:battery-plus-variant": "bi-battery-charging",
    "mdi:transmission-tower-export": "bi-box-arrow-up-right",
    "mdi:calendar-month": "bi-calendar3",
    "mdi:help-circle-outline": "bi-question-circle",
    "mdi:timer-sand": "bi-hourglass-split",
    "mdi:battery-charging-high": "bi-battery-charging",
    "mdi:battery-low": "bi-battery",
  };
  return m[icon] || "bi-circle-fill";
}

function swatchIconClass(color) {
  return isLightHexColor(color) ? "he-swatch-icon-dark" : "";
}

/** Stacked strip segment width vs section total (matches hub-energy-strip fill). */
function stripSegBarStyle(seg, sectionTotal) {
  const tot = sectionTotal > 0 ? sectionTotal : 1;
  const w = (100 * seg.value) / tot;
  const style = {
    width: `${w.toFixed(1)}%`,
    backgroundColor: seg.color,
  };
  if (seg.className === "fill-hc") {
    style.backgroundImage =
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 4px, transparent 4px, transparent 8px)";
  }
  return style;
}

function onEditorConfigUpdate(next) {
  emit("update:cardConfig", next);
}

function toggleGraphStub() {
  graphOpen.value = !graphOpen.value;
}

function toggleRaw() {
  showRaw.value = !showRaw.value;
}
</script>

<template>
  <div class="he-vitrine-card-wrap">
    <div class="he-vitrine-toolbar">
      <button type="button" class="btn btn-sm btn-outline-primary" data-i18n="lovelace.showcase_edit_card" @click="editorOpen = true"></button>
    </div>
    <LovelaceCardEditorSimulator
      :model-value="cardConfig"
      :open="editorOpen"
      :lang="lang"
      @update:model-value="onEditorConfigUpdate"
      @update:open="(v) => (editorOpen = v)"
    />

    <Teleport to="#he-modal-preview" :disabled="!editorOpen">
      <div class="he-vitrine-card-wrap he-vitrine-preview-teleport-root" style="width: 100%; min-width: 0">
    <div class="he-vitrine-day-rail" role="group" :aria-label="i18n.powerHistoryTitle">
      <div class="he-vitrine-day-rail__head">
        <div class="he-vitrine-day-rail__head-text">
          <p class="he-vitrine-day-rail__label">{{ i18n.powerHistoryTitle }}</p>
          <p class="he-vitrine-day-rail__clock" aria-live="polite">{{ clockLabel }}</p>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary he-vitrine-day-rail__pause"
          :aria-pressed="timelinePaused ? 'true' : 'false'"
          :aria-label="timelinePaused ? i18n.showcaseVitrineTimelinePlayAria : i18n.showcaseVitrineTimelinePauseAria"
          :title="timelinePaused ? i18n.showcaseVitrineTimelinePlay : i18n.showcaseVitrineTimelinePause"
          @click="toggleTimelinePause"
        >
          <i class="bi" :class="timelinePaused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true" />
        </button>
      </div>
        <div
          class="he-vitrine-day-rail__track"
          :title="i18n.showcaseVitrineTimelineHint"
          @click="onTimelineTrackPointer"
        >
        <div class="he-vitrine-day-rail__ticks">
          <div v-for="tk in timelineTicks" :key="'tk' + tk.key" class="he-vitrine-day-rail__tick">
            <span>{{ tk.label }}</span>
          </div>
        </div>
        <div class="he-vitrine-day-rail__playhead" :style="{ left: playheadPct + '%' }" />
      </div>
    </div>

    <div class="he-ha-card">
      <div class="he-header">
        <div class="he-header-title-side">
          <h2>Hub Énergie</h2>
          <span class="he-header-subtitle">{{ subtitle }}</span>
        </div>
        <div class="he-controls">
          <label for="he-vitrine-date">{{ i18n.date }}</label>
          <input id="he-vitrine-date" class="he-date-input" type="date" :value="mockDate" readonly tabindex="-1" />
          <label>{{ i18n.range }}</label>
          <div class="he-range-btns" role="group" :aria-label="i18n.range">
            <span class="he-range-btn he-range-btn--active">{{ i18n.day }}</span>
            <span class="he-range-btn">{{ i18n.week }}</span>
            <span class="he-range-btn">{{ i18n.month }}</span>
            <span class="he-range-btn">{{ i18n.year }}</span>
          </div>
          <span class="he-range-label">{{ rangeLabelShort }}</span>
          <button
            v-if="showSection('show_raw_control')"
            type="button"
            class="he-btn btn btn-sm btn-outline-secondary"
            @click="toggleRaw"
          >
            {{ showRaw ? i18n.hide : i18n.details }}
          </button>
        </div>
      </div>

      <div v-if="showSection('show_day_slots')" class="he-meta-tempo-wrap">
        <div class="he-meta-days-stack">
          <div :class="todayTileClass">
            <span class="he-day-tile-line">{{ i18n.today }} : {{ currentSlotText }}</span>
          </div>
          <div :class="tomorrowTileClass">
            <span class="he-day-tile-line">{{ i18n.tomorrow }} : {{ dayColorLabel(tomorrowColorRaw, i18n) }}</span>
          </div>
        </div>
        <div class="he-tempo-days">
          <div class="he-tempo-day tempo-blue">
            {{ i18n.tempoDayBlue }} : {{ tempoDays.blue.remaining }}/{{ tempoDays.blue.remaining + tempoDays.blue.elapsed }}
          </div>
          <div class="he-tempo-day tempo-white">
            {{ i18n.tempoDayWhite }} : {{ tempoDays.white.remaining }}/{{ tempoDays.white.remaining + tempoDays.white.elapsed }}
          </div>
          <div class="he-tempo-day tempo-red">
            {{ i18n.tempoDayRed }} : {{ tempoDays.red.remaining }}/{{ tempoDays.red.remaining + tempoDays.red.elapsed }}
          </div>
        </div>
      </div>

      <div
        v-if="showSection('show_live_power') && powerNowData"
        class="he-power-now-wrap"
        role="button"
        tabindex="0"
        :aria-expanded="graphOpen ? 'true' : 'false'"
        :aria-label="i18n.powerNowAria || i18n.powerNow"
        :title="powerTooltip"
        @click="toggleGraphStub"
        @keydown.enter.prevent="toggleGraphStub"
        @keydown.space.prevent="toggleGraphStub"
      >
        <div class="he-cons-strip-cap">{{ i18n.powerNow }}</div>
        <div class="he-pnl-wrap">
          <div class="he-pnl-bar">
            <template v-if="powerSegTotal > 1">
              <span
                v-for="(s, idx) in powerSegs"
                :key="'pnl' + idx"
                class="he-pnl-seg"
                :style="{ width: ((s.w / powerSegTotal) * 100).toFixed(1) + '%', background: s.c }"
                :title="s.t"
              />
            </template>
            <span v-else class="he-pnl-seg" style="width: 100%; background: color-mix(in srgb, var(--divider-color) 85%, transparent)" title="—" />
          </div>
          <div class="he-pnl-load-overlay">{{ loadStr }} {{ i18n.loadConsumed }}</div>
        </div>
        <div class="he-icon-brk">
          <span class="he-icon-brk-item">
            <span class="he-icon-brk-swatch" :style="{ backgroundColor: COLOR_GRID_SOURCE }">
              <i class="bi bi-broadcast" aria-hidden="true" />
            </span>
            <span>{{ i18n.colGrid }}</span>&nbsp;<b>{{ gridCell }}</b>
          </span>
          <span class="he-icon-brk-item">
            <span class="he-icon-brk-swatch" :style="{ backgroundColor: COLOR_SOLAR }">
              <i class="bi bi-sun-fill" aria-hidden="true" />
            </span>
            <span>{{ i18n.colSolar }}</span>&nbsp;<b>{{ solarCell }}</b>
          </span>
          <span class="he-icon-brk-item" :title="i18n.colBattTip || undefined">
            <span class="he-icon-brk-swatch" :style="{ backgroundColor: COLOR_BATTERY }">
              <i class="bi bi-battery-half" aria-hidden="true" />
            </span>
            <span>{{ i18n.colBatt }}</span>&nbsp;<b>{{ battCell }}</b>
          </span>
        </div>
      </div>

      <LovelaceCardPowerGraphDemo
        v-if="showSection('show_live_power') && graphOpen && powerGraphDisplaySeries"
        :open="true"
        :i18n="i18n"
        :locale="graphLocale"
        :display-series="powerGraphDisplaySeries"
        :rolling-hours="graphHoursSnap"
        :is-today-graph="true"
        @window-hours="onPowerGraphWindowHours"
      />

      <div v-if="showSection('show_battery_bar')" class="he-batt-bar-container">
        <div class="he-batt-section-head">
          <h3>{{ i18n.battSocTitle }}</h3>
        </div>
        <div class="he-batt-track-wrap" :title="`${Math.round(mockCostAttrs.battery_soc_percent ?? 0)} % SOC`">
          <div class="he-batt-track">
            <div :class="battSegmentClass">
              <div v-for="(c, i) in battCells" :key="'cell' + i" class="he-batt-cell" :style="c.style">
                <div class="he-batt-cell-hatch he-batt-cell-hatch--left" />
                <div class="he-batt-cell-hatch he-batt-cell-hatch--right" />
                <div class="he-batt-cell-fill" />
              </div>
            </div>
          </div>
          <div class="he-batt-bar-total">
              <div class="he-batt-bar-stack">
              <div class="he-batt-bar-row-main">
                <span class="he-batt-bar-total-text">{{ battOverlay }}</span>
              </div>
              <div v-if="battEta" class="he-batt-bar-eta-inline">
                <i class="bi batt-eta-icon" :class="mdiToBi(battEta.icon)" aria-hidden="true" />
                <span>{{ battEta.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showSection('show_insights_bar') && totalHomeKwh > 0.0005" class="he-insight-bar">
        <span class="he-insight-chip" :class="insightAutoClass">☀️ {{ insightPct }}% {{ i18n.insightAutosuff }}</span>
        <span class="he-insight-chip">💸 {{ totalCostEur.toFixed(2) }} €</span>
        <span class="he-insight-chip" :class="vsGridClass"> ⚡ {{ vsGridSign }}{{ Math.abs(ecoTotal).toFixed(2) }}€ {{ i18n.insightVsGrid }} </span>
      </div>

      <div v-if="showSection('show_consumption')" class="he-section">
        <div class="he-section-head">
          <h3>{{ i18n.sectionConsumption }}</h3>
          <div class="he-section-metric">{{ i18n.totalEnergy }} <b>{{ homeEnergyFmt(totalHomeKwh) }}</b></div>
        </div>
        <div class="he-bars">
          <div v-if="gridStripSegs.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.consStripGridTitleTempo }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in gridStripSegs" :key="'gs' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, gridStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ gridEnergyFmt(totalGridKwh) }}</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(row, i) in gridSlotBreakdownRows" :key="'gb' + i" class="he-icon-brk-item">
                <span class="he-icon-brk-swatch" :class="row.swatchClass" :style="{ backgroundColor: row.slot.color }">
                  <i class="bi bi-broadcast" aria-hidden="true" />
                </span>
                <span>{{ row.label }}</span>&nbsp;<b>{{ row.value }}</b>
                <span v-if="totalGridKwh > 0" class="he-icon-brk-pct">({{ Math.round((row.rawV / totalGridKwh) * 100) }}%)</span>
              </span>
            </div>
          </div>

          <div v-if="showSolarInConsumption" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.solarProdTitle }}</div>
            <div class="he-bar-wrap" :title="solarKwhData.tooltip">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span
                    v-for="(seg, i) in solarKwhData.segments.filter((x) => x.value > 0.0005)"
                    :key="'sol' + i"
                    class="he-fill-seg"
                    :style="{ width: ((seg.value / solarKwhData.total) * 100).toFixed(1) + '%', backgroundColor: seg.color }"
                  />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ solarKwhData.formatter(solarKwhData.total) }}</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(seg, i) in solarKwhData.segments.filter((x) => x.value > 0.0005)" :key="'sbr' + i" class="he-icon-brk-item">
                <span class="he-icon-brk-swatch" :class="swatchIconClass(seg.color)" :style="{ backgroundColor: seg.color }">
                  <i class="bi" :class="mdiToBi(seg.icon)" aria-hidden="true" />
                </span>
                <span>{{ seg.label }}</span>&nbsp;<b>{{ solarKwhData.formatter(seg.value) }}</b>
                <span class="he-icon-brk-pct">({{ Math.round((seg.value / solarKwhData.total) * 100) }}%)</span>
              </span>
            </div>
          </div>

          <div v-if="homeStripSegs.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.consStripHomeTitle }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in homeStripSegs" :key="'hs' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, homeStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ homeEnergyFmt(totalHomeKwh) }}</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(r, i) in homeBreakdown" :key="'hb' + i" class="he-icon-brk-item">
                <span
                  class="he-icon-brk-swatch"
                  :class="[labelLooksHc(r.label) ? 'fill-hc' : '', swatchIconClass(r.color)]"
                  :style="{ backgroundColor: r.color }"
                >
                  <i class="bi" :class="mdiToBi(r.icon)" aria-hidden="true" />
                </span>
                <span>{{ r.label }}</span>&nbsp;<b>{{ r.value }}</b>
                <span v-if="totalHomeKwh > 0" class="he-icon-brk-pct">({{ Math.round((r.rawV / totalHomeKwh) * 100) }}%)</span>
              </span>
            </div>
          </div>

          <div v-if="battStripSegs.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.consStripBattTitle }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in battStripSegs" :key="'bs' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, battStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ battChgEnergyFmt(totalBattChgKwh) }}</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(r, i) in battBreakdown" :key="'bb' + i" class="he-icon-brk-item">
                <span class="he-icon-brk-swatch" :class="swatchIconClass(r.color)" :style="{ backgroundColor: r.color }">
                  <i class="bi" :class="mdiToBi(r.icon || 'mdi:help-circle-outline')" aria-hidden="true" />
                </span>
                <span>{{ r.label }}</span>&nbsp;<b>{{ r.value }}</b>
                <span v-if="totalBattChgKwh > 0" class="he-icon-brk-pct">({{ Math.round((r.rawV / totalBattChgKwh) * 100) }}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showSection('show_cost') || showSection('show_reinjection') || showSection('show_savings')" class="he-section">
        <div class="he-bars">
          <div v-if="showSection('show_cost') && costStripSegs.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.costStripTitle }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in costStripSegs" :key="'cs' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, costStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ totalCostEur.toFixed(2) }} €</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(r, i) in costBreakdown" :key="'cb' + i" class="he-icon-brk-item">
                <span
                  class="he-icon-brk-swatch"
                  :class="[labelLooksHc(r.label) ? 'fill-hc' : '', swatchIconClass(r.color)]"
                  :style="{ backgroundColor: r.color }"
                >
                  <i class="bi" :class="mdiToBi(r.icon)" aria-hidden="true" />
                </span>
                <span>{{ r.label }}</span>&nbsp;<b>{{ r.value }}</b>
                <span v-if="totalCostEur > 0 && r.rawV != null" class="he-icon-brk-pct">({{ Math.round((r.rawV / totalCostEur) * 100) }}%)</span>
              </span>
            </div>
          </div>

          <div v-if="showSection('show_reinjection') && reinjStripSegs.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.reinjStripTitle }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in reinjStripSegs" :key="'rs' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, reinjStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ reinjEnergyFmt(totalReinjKwh) }} · {{ reinjOppTotal.toFixed(2) }} €</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(r, i) in reinjBreakdown" :key="'rb' + i" class="he-icon-brk-item">
                <span class="he-icon-brk-swatch" :class="swatchIconClass(r.color)" :style="{ backgroundColor: r.color }">
                  <i class="bi" :class="mdiToBi(r.icon || 'mdi:help-circle-outline')" aria-hidden="true" />
                </span>
                <span>{{ r.label }}</span>&nbsp;<b>{{ r.value }}</b>
                <span v-if="totalReinjKwh > 0 && r.rawV != null" class="he-icon-brk-pct">({{ Math.round((r.rawV / totalReinjKwh) * 100) }}%)</span>
              </span>
            </div>
          </div>

          <div v-if="showSection('show_savings') && ecoSegments.length" class="he-cons-strip">
            <div class="he-cons-strip-cap">{{ i18n.ecoStripTitle }}</div>
            <div class="he-bar-wrap">
              <div class="he-track">
                <div class="he-fill-stack" style="width: 100%">
                  <span v-for="(seg, i) in ecoSegments" :key="'es' + i" class="he-fill-seg" :style="stripSegBarStyle(seg, ecoStripTotal)" />
                </div>
              </div>
              <div class="he-bar-total">
                <span class="he-bar-total-text">{{ ecoTotal >= 0 ? "+" : "" }}{{ ecoTotal.toFixed(2) }} €</span>
              </div>
            </div>
            <div class="he-icon-brk">
              <span v-for="(r, i) in ecoBreakdown" :key="'eb' + i" class="he-icon-brk-item">
                <span class="he-icon-brk-swatch" :class="swatchIconClass(r.color)" :style="{ backgroundColor: r.color }">
                  <i class="bi" :class="mdiToBi(iconForLabel(r.label) || 'mdi:help-circle-outline')" aria-hidden="true" />
                </span>
                <span>{{ r.label }}</span>&nbsp;<b>{{ r.value }}</b>
                <span v-if="totalEcoAbs > 0" class="he-icon-brk-pct">({{ Math.round((r.rawV / totalEcoAbs) * 100) }}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <section v-if="showRaw && showSection('show_raw_control')" class="he-raw-section">
        <h3 class="he-raw-title">{{ i18n.rawDataTitle }}</h3>
        <div class="he-raw">
          <div class="he-raw-grid">
            <div>
              <b>{{ i18n.rawSectionGridHome }}</b><br />
              {{ tpl(i18n.rawLineGridTotal, { value: totalGridKwh.toFixed(3) }) }}<br />
              {{ tpl(i18n.rawLineHouseTotal, { value: totalHomeKwh.toFixed(3) }) }}
            </div>
            <div>
              <b>{{ i18n.rawSectionCost }}</b><br />
              {{ tpl(i18n.rawLineCostTotal, { value: totalCostEur.toFixed(3) }) }}<br />
              {{ tpl(i18n.rawLineSubscription, { value: aboEur.toFixed(3) }) }}
            </div>
            <div>
              <b>{{ i18n.rawSectionOrigin }}</b><br />
              {{ tpl(i18n.rawLineOriginGrid, { value: originGrid.toFixed(3) }) }}<br />
              {{ tpl(i18n.rawLineOriginSolar, { value: (homeBySource.s + battChargeBySource.fromSolar).toFixed(3) }) }}
            </div>
            <div>
              <b>{{ i18n.rawSectionSavings }}</b><br />
              {{ tpl(i18n.rawLineSavingsSolar, { value: ecoSolar.toFixed(3) }) }}<br />
              {{ tpl(i18n.rawLineSavingsBattery, { value: ecoBatt.toFixed(3) }) }}
            </div>
            <div>
              <b>{{ i18n.rawSectionImportBySlot }}</b><br />
              <template v-if="activeGridSlots.length">
                <template v-for="(s, i) in activeGridSlots" :key="'ags' + s.id">
                  <br v-if="i > 0" />
                  {{ s.label }}: {{ s.v.toFixed(3) }} kWh
                </template>
              </template>
              <template v-else>{{ i18n.emDash }}</template>
            </div>
            <div>
              <b>{{ i18n.rawSectionCostBySlot }}</b><br />
              <template v-if="activeCostSlots.length">
                <template v-for="(s, i) in activeCostSlots" :key="'acs' + s.id">
                  <br v-if="i > 0" />
                  {{ s.label }}: {{ s.v.toFixed(3) }} €
                </template>
              </template>
              <template v-else>{{ i18n.emDash }}</template>
            </div>
            <div>
              <b>{{ i18n.rawSectionUsageDetail }}</b><br />
              <template v-for="(ln, i) in rawUsageLines" :key="'usg' + i">
                <br v-if="i > 0" />
                {{ ln.label }} : {{ ln.v.toFixed(3) }}
              </template>
            </div>
            <div>
              <b>{{ i18n.rawSectionReinjection }}</b><br />
              {{ i18n.reinjLabelSolarSurplus }}
              {{ tpl(i18n.reinjLineKwhEur, { kwh: reinj.solarSurplus.toFixed(3), eur: (reinj.solarSurplus * 0.12).toFixed(3) }) }}<br />
              {{ i18n.reinjLabelBatteryFull }}
              {{ tpl(i18n.reinjLineKwhEur, { kwh: reinj.batteryFull.toFixed(3), eur: (reinj.batteryFull * 0.1).toFixed(3) }) }}<br />
              {{ i18n.reinjLabelSwitchLatency }}
              {{ tpl(i18n.reinjLineKwhEur, { kwh: reinj.switchLatency.toFixed(3), eur: (reinj.switchLatency * 0.08).toFixed(3) }) }}<br />
              {{ i18n.reinjLabelOther }}
              {{ tpl(i18n.reinjLineKwhEur, { kwh: reinj.unattributed.toFixed(3), eur: (reinj.unattributed * 0.06).toFixed(3) }) }}<br />
              {{ i18n.reinjLabelTotal }}
              {{ tpl(i18n.reinjLineKwhEur, { kwh: totalReinjKwh.toFixed(3), eur: reinjOppTotal.toFixed(3) }) }}
            </div>
          </div>
        </div>
      </section>
    </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped src="../../../styles/doc/lovelace-card-showcase.css"></style>
