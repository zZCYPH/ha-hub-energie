<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { I18N } from "../../../../../custom_components/hub_energie/frontend/src/constants/i18n.js";
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

/** Wall-clock span mapped to one Paris calendar day (mock). */
const DAY_CYCLE_MS = 72_000;

/** Specs démo (alignées demande utilisateur). */
const P_SOLAR_PEAK_W = 2000;
const BATTERY_CAP_KWH = 5.76;
const SOC_MIN = 10;
const SOC_MAX = 95;
const P_BATT_CHG_MAX_W = 1200;
const P_BATT_DIS_MAX_W = 1000;

const lang = ref("en");

function syncLang() {
  const l = getLang();
  lang.value = l === "fr" ? "fr" : "en";
}

const i18n = computed(() => (lang.value === "fr" ? I18N.fr : I18N.en));

/** 0..<24 — virtual hour of the mocked day (0 = midnight). */
const hourDecimal = ref(0);
let raf = 0;
let startMs = 0;

const prevHrForWrap = ref(-1);

function tick(now) {
  const elapsed = now - startMs;
  const u = (elapsed % DAY_CYCLE_MS) / DAY_CYCLE_MS;
  const hr = u * 24;
  if (prevHrForWrap.value > 22 && hr < 0.5) {
    socSim.value = 55;
  }
  prevHrForWrap.value = hr;

  const dHrSim = lastTickMs ? ((now - lastTickMs) / DAY_CYCLE_MS) * 24 : 0;
  lastTickMs = now;
  const clampedDt = Math.min(dHrSim, 0.08);
  const snap = powerSnapshot(hr, socSim.value);
  const netKw = ((snap.batt_discharge_power_w ?? 0) - (snap.batt_charge_power_w ?? 0)) / 1000;
  socSim.value = Math.max(
    SOC_MIN,
    Math.min(SOC_MAX, socSim.value + (netKw * clampedDt * 100) / BATTERY_CAP_KWH),
  );

  hourDecimal.value = hr;
  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  syncLang();
  window.addEventListener("hub-energie-lang", syncLang);
  startMs = performance.now();
  lastTickMs = startMs;
  prevHrForWrap.value = -1;
  socSim.value = 55;
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", syncLang);
  cancelAnimationFrame(raf);
});

const h = computed(() => hourDecimal.value);

/** Sun curve: 0 at night, ~1 around solar noon (mock). */
const sunFactor = computed(() => {
  const x = h.value;
  if (x < 6 || x > 20) return 0;
  return Math.max(0, Math.sin(((x - 6) / 14) * Math.PI));
});

/** Smooth wobble for “live” feel (still tied to time of day). */
function wobble(seed, amp = 1) {
  const t = h.value * 0.9 + seed;
  return Math.sin(t * 1.7) * amp;
}

/** Calendar colours (Tempo day type) — fixed for the demo; do not drift with the clock. */
const todayColorRaw = "blue";
const tomorrowColorRaw = "white";

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

/** Gaussian bump (h in hours, center in hours). */
function peakW(h, center, width, amp) {
  const z = (h - center) / width;
  return amp * Math.exp(-z * z);
}

/** Base house load ~200–400 W + realistic peaks (cuisine, lessive, chauffage salle de bain). */
function loadHouseW(hr) {
  const base = 280 + 55 * Math.sin(hr * 0.35 + 0.7);
  const cook = peakW(hr, 12.35, 0.42, 920);
  const laundry = peakW(hr, 15.4, 0.38, 620);
  const bathroom = peakW(hr, 7.25, 0.28, 340);
  const noise = 35 * wobble(4, 1);
  return Math.max(200, Math.min(5200, base + cook + laundry + bathroom + noise));
}

function solarW(hr) {
  const sf = hr < 6 || hr > 20 ? 0 : Math.max(0, Math.sin(((hr - 6) / 14) * Math.PI));
  const raw = sf * P_SOLAR_PEAK_W * (1 + 0.04 * wobble(1, 1));
  return Math.max(0, Math.min(P_SOLAR_PEAK_W, raw));
}

/** SOC % — intégration dans la boucle d’animation à partir du net batterie (W). */
const socSim = ref(55);
let lastTickMs = 0;

/**
 * Dispatch : surplus solaire → charge batterie d’abord (max 1200 W, jusqu’au SOC max).
 * Alimentation maison : solaire > batterie > réseau (décharge max 1000 W si SOC > min).
 */
function dispatchPowerFlow(hr, soc) {
  const load = loadHouseW(hr);
  const solar = solarW(hr);

  const solarToLoad = Math.min(solar, load);
  const surplus = Math.max(0, solar - solarToLoad);

  let battChg = 0;
  if (surplus > 1 && soc < SOC_MAX - 0.05) {
    const head = (SOC_MAX - soc) / 100;
    const taper = Math.min(1, head * 25);
    battChg = Math.min(P_BATT_CHG_MAX_W, surplus * taper);
    battChg = Math.min(battChg, surplus);
  }

  const needAfterSolar = Math.max(0, load - solarToLoad);
  let battDis = 0;
  if (needAfterSolar > 1 && soc > SOC_MIN + 0.05) {
    const headLo = (soc - SOC_MIN) / 100;
    const taperLo = Math.min(1, headLo * 20);
    battDis = Math.min(P_BATT_DIS_MAX_W, needAfterSolar * taperLo);
  }

  const gridImport = Math.max(0, needAfterSolar - battDis);
  const exportW = Math.max(0, surplus - battChg);

  let gridSigned = gridImport;
  if (exportW > 80 && gridImport < 400) {
    gridSigned = -exportW;
  }

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

const mockDate = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
});

const rangeLabelShort = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return lang.value === "fr" ? `${day}/${m}/${y}` : `${y}-${m}-${day}`;
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

const tempoDays = computed(() => ({
  blue: { remaining: Math.max(0, Math.round(8 + 3 * wobble(10))), elapsed: Math.round(11 + 2 * wobble(11)) },
  white: { remaining: Math.max(0, Math.round(9 + 2 * wobble(12))), elapsed: Math.round(10 + 2 * wobble(13)) },
  red: { remaining: Math.max(0, Math.round(2 + wobble(14))), elapsed: Math.round(3 + wobble(15)) },
}));

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
  const out = {};
  const wob = 0.94 + 0.06 * Math.sin(hr * 0.25 + 1.1);
  for (const id of Object.keys(TEMPO_SLOT_IMPORT_KW)) {
    const hrs = hoursIntoTempoSlot(id, hr);
    const v = hrs * TEMPO_SLOT_IMPORT_KW[id] * wob;
    if (v > 0.0001) out[id] = v;
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
  const tg = totalGridKwh.value || 1;
  const sf = sunFactor.value;
  const sc = baseScale.value;
  const g = sc * tg * (0.56 + 0.06 * (1 - sf) + 0.04 * wobble(20));
  const s = sc * tg * (0.1 + 0.34 * sf + 0.04 * wobble(21));
  const b = sc * tg * (0.12 + 0.22 * sf + 0.03 * wobble(22));
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

/** Cumulative battery charge (kWh) — scales with day + sun, independent split below. */
const totalBattChgKwh = computed(() => {
  const sf = sunFactor.value;
  const sc = baseScale.value;
  return sc * 2.6 * (0.22 + 0.78 * sf + 0.04 * wobble(30));
});

const battChargeBySource = computed(() => {
  const t = totalBattChgKwh.value;
  const sf = sunFactor.value;
  const fromSolar = t * (0.58 + 0.38 * sf + 0.04 * wobble(31));
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

const reinj = computed(() => {
  const scale = baseScale.value * 0.08;
  const solarSurplus = scale * (0.4 + 2.2 * sunFactor.value);
  const batteryFull = scale * (0.15 + 0.4 * (1 - sunFactor.value));
  const switchLatency = scale * (0.05 + 0.12 * wobble(40));
  const unattributed = scale * (0.04 + 0.08 * wobble(41));
  return { solarSurplus, batteryFull, switchLatency, unattributed };
});

const reinjItems = computed(() => [
  { label: `${i18n.value.reinjLabelSolarSurplus} ${i18n.value.reinjCauseSolarSurplus}`, v: reinj.value.solarSurplus, eur: reinj.value.solarSurplus * 0.12, color: COLOR_SOLAR_EXPORT },
  { label: `${i18n.value.reinjLabelBatteryFull} ${i18n.value.reinjCauseBatteryFull}`, v: reinj.value.batteryFull, eur: reinj.value.batteryFull * 0.1, color: COLOR_BATTERY },
  { label: `${i18n.value.reinjLabelSwitchLatency} ${i18n.value.reinjCauseSwitchLatency}`, v: reinj.value.switchLatency, eur: reinj.value.switchLatency * 0.08, color: "#78909c" },
  { label: `${i18n.value.reinjLabelOther} ${i18n.value.reinjCauseOther}`, v: reinj.value.unattributed, eur: reinj.value.unattributed * 0.06, color: "#9e9e9e" },
]);

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
  const chargeW = d.batt_charge_power_w ?? 0;
  const dischargeW = d.batt_discharge_power_w ?? 0;
  if (chargeW > 40) {
    const remainingKwh = cap * (1 - soc / 100);
    const chargePowerKw = chargeW / 1000;
    if (chargePowerKw > 0) {
      return { icon: "mdi:battery-charging-high", time: formatEtaTimeOnly((remainingKwh / chargePowerKw) * 60) };
    }
  } else if (dischargeW > 40) {
    const storedKwh = (cap * soc) / 100;
    const dischargePowerKw = dischargeW / 1000;
    if (dischargePowerKw > 0) {
      return { icon: "mdi:battery-low", time: formatEtaTimeOnly((storedKwh / dischargePowerKw) * 60) };
    }
  }
  return null;
});

const battFlowMode = computed(() => {
  const d = mockCostAttrs.value;
  const charge = d.batt_charge_power_w ?? 0;
  const discharge = d.batt_discharge_power_w ?? 0;
  const threshold = 40;
  if (charge > threshold) return "charging";
  if (discharge > threshold) return "discharging";
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

const footnote = computed(() =>
  lang.value === "fr"
    ? "Démo vitrine : styles alignés sur la carte Lovelace ; ligne du temps 24 h = 72 s."
    : "Showcase demo: styles match the Lovelace card; the 24 h timeline runs in 72 s.",
);
</script>

<template>
  <div class="he-vitrine-card-wrap">
    <div class="he-vitrine-day-rail" aria-hidden="true">
      <p class="he-vitrine-day-rail__label">{{ i18n.powerHistoryTitle }}</p>
      <p class="he-vitrine-day-rail__clock">{{ clockLabel }}</p>
        <div class="he-vitrine-day-rail__track">
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
        </div>
      </div>

      <div class="he-meta-tempo-wrap">
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

      <div v-if="powerNowData" class="he-power-now-wrap" role="img" :title="powerTooltip">
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

      <div v-if="totalHomeKwh > 0.0005" class="he-insight-bar">
        <span class="he-insight-chip" :class="insightAutoClass">☀️ {{ insightPct }}% {{ i18n.insightAutosuff }}</span>
        <span class="he-insight-chip">💸 {{ totalCostEur.toFixed(2) }} €</span>
        <span class="he-insight-chip" :class="vsGridClass"> ⚡ {{ vsGridSign }}{{ Math.abs(ecoTotal).toFixed(2) }}€ {{ i18n.insightVsGrid }} </span>
      </div>

      <div class="he-batt-bar-container">
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

      <div class="he-section">
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

          <div v-if="solarKwhData" class="he-cons-strip">
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

      <div class="he-section">
        <div class="he-bars">
          <div v-if="costStripSegs.length" class="he-cons-strip">
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

          <div v-if="reinjStripSegs.length" class="he-cons-strip">
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

          <div v-if="ecoSegments.length" class="he-cons-strip">
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

      <p class="he-vitrine-footnote">{{ footnote }}</p>
    </div>
  </div>
</template>

<style scoped src="../../../styles/doc/lovelace-card-showcase.css"></style>
