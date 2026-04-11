<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getLang } from "../../../siteShell";

/** One full animation cycle (mock “day” of varying loads), then repeat. */
const CYCLE_MS = 60_000;

const lang = ref("en");

const COPY = {
  en: {
    date: "Date",
    range: "Range",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
    today: "Today",
    tomorrow: "Tomorrow",
    tempoBlue: "Blue",
    tempoWhite: "White",
    tempoRed: "Red",
    powerNow: "Instant power",
    houseLoad: "House load",
    colGrid: "Grid",
    colSolar: "Solar",
    colBatt: "Battery",
    colExport: "Export",
    sectionConsumption: "Consumption",
    totalEnergy: "Total energy",
    stripGrid: "Grid import by slot & colour",
    stripHome: "House supply mix",
    stripBatt: "Battery charge by source",
    costStrip: "Cost by tariff",
    reinjStrip: "Reinjection by cause",
    insightAutosuff: "Self-suff.",
    insightVsGrid: "saved vs grid",
    demoNote: "Animated mock for the marketing site — not the real Home Assistant card.",
    slotBleuHc: "bleu_hc",
    slotBlancHp: "blanc_hp",
    slotRougeHc: "rouge_hc",
    colorBlue: "Blue",
    colorWhite: "White",
    colorRed: "Red",
    emDash: "—",
  },
  fr: {
    date: "Date",
    range: "Période",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    year: "Année",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    tempoBlue: "Bleu",
    tempoWhite: "Blanc",
    tempoRed: "Rouge",
    powerNow: "Puissance instantanée",
    houseLoad: "Charge maison",
    colGrid: "Réseau",
    colSolar: "Solaire",
    colBatt: "Batterie",
    colExport: "Export",
    sectionConsumption: "Consommation",
    totalEnergy: "Énergie totale",
    stripGrid: "Import Enedis par créneau et couleur",
    stripHome: "Source alimentation maison",
    stripBatt: "Charge batterie par source",
    costStrip: "Coût par tarif",
    reinjStrip: "Réinjection par cause",
    insightAutosuff: "Autosuff.",
    insightVsGrid: "éco. via sol./bat.",
    demoNote: "Maquette animée pour le site vitrine — pas la vraie carte Home Assistant.",
    slotBleuHc: "bleu_hc",
    slotBlancHp: "blanc_hp",
    slotRougeHc: "rouge_hc",
    colorBlue: "Bleu",
    colorWhite: "Blanc",
    colorRed: "Rouge",
    emDash: "—",
  },
};

const t = computed(() => COPY[lang.value] || COPY.en);

function syncLang() {
  const l = getLang();
  lang.value = l === "fr" ? "fr" : "en";
}

/** 0..1 over CYCLE_MS, loops. */
const phase = ref(0);
let raf = 0;
let startMs = 0;

function loop(now) {
  const elapsed = now - startMs;
  phase.value = (elapsed % CYCLE_MS) / CYCLE_MS;
  raf = requestAnimationFrame(loop);
}

onMounted(() => {
  syncLang();
  window.addEventListener("hub-energie-lang", syncLang);
  startMs = performance.now();
  raf = requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", syncLang);
  cancelAnimationFrame(raf);
});

const TAU = Math.PI * 2;

function sinPhase(offset) {
  return Math.sin(TAU * phase.value + offset);
}

const mockDate = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
});

const rangeLabel = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return lang.value === "fr" ? `${day}/${m}/${y}` : `${y}-${m}-${day}`;
});

const currentSlotKey = computed(() => {
  const u = phase.value;
  if (u < 1 / 3) return "bleu_hc";
  if (u < 2 / 3) return "blanc_hp";
  return "rouge_hc";
});

const currentSlotLabel = computed(() => {
  const k = currentSlotKey.value;
  if (k === "bleu_hc") return t.value.slotBleuHc;
  if (k === "blanc_hp") return t.value.slotBlancHp;
  return t.value.slotRougeHc;
});

const tomorrowColorLabel = computed(() => {
  const u = phase.value;
  if (u < 0.33) return t.value.colorWhite;
  if (u < 0.66) return t.value.colorBlue;
  return t.value.colorRed;
});

const tempoRemaining = computed(() => {
  const wobble = (n) => Math.max(0, Math.round(n + 4 * sinPhase(n * 0.7)));
  return {
    blue: { rem: wobble(9), el: 12 },
    white: { rem: wobble(10), el: 11 },
    red: { rem: wobble(2), el: 3 },
  };
});

/** Watts (mock). */
const powerW = computed(() => {
  const g = Math.max(120, 520 + 380 * sinPhase(0));
  const s = Math.max(0, 1800 + 900 * sinPhase(1.1));
  const b = Math.max(0, 400 + 550 * sinPhase(2.2));
  const e = Math.max(0, 80 + 420 * sinPhase(0.4));
  return { grid: g, solar: s, batt: b, export: e };
});

const powerTotal = computed(() => {
  const p = powerW.value;
  return p.grid + p.solar + p.batt + p.export || 1;
});

function pct(n) {
  return `${(100 * n) / powerTotal.value}%`;
}

const houseW = computed(() => Math.round(2100 + 450 * sinPhase(0.55)));

const fmtKwh = (v) => `${v.toFixed(2)} kWh`;
const fmtEur = (v) => `${v.toFixed(2)} €`;

/** Energy strips (kWh) — same rhythm as phase. */
const energyKwh = computed(() => {
  const grid = 6.2 + 2.1 * sinPhase(0.3);
  const home = 8.1 + 1.4 * sinPhase(0.8);
  const batt = 2.4 + 1.2 * sinPhase(1.4);
  const cost = 1.35 + 0.45 * sinPhase(0.6);
  const reinj = 0.55 + 0.35 * sinPhase(1.7);
  return { grid, home, batt, cost, reinj };
});

const gridStripParts = computed(() => {
  const base = energyKwh.value.grid;
  return [
    { key: "hp", w: base * (0.38 + 0.08 * sinPhase(0.1)), color: "var(--he-c-grid)" },
    { key: "hc", w: base * (0.35 + 0.06 * sinPhase(0.5)), color: "#5c6bc0" },
    { key: "rest", w: Math.max(0.1, base * 0.27), color: "#9575cd" },
  ];
});

const homeStripParts = computed(() => {
  const h = energyKwh.value.home;
  return [
    { key: "g", w: h * (0.42 + 0.05 * sinPhase(0.2)), color: "var(--he-c-grid)" },
    { key: "s", w: h * (0.33 + 0.07 * sinPhase(0.9)), color: "var(--he-c-solar)" },
    { key: "b", w: Math.max(0.05, h * 0.25), color: "var(--he-c-batt)" },
  ];
});

const battStripParts = computed(() => {
  const b = energyKwh.value.batt;
  return [
    { key: "s", w: b * (0.55 + 0.1 * sinPhase(1.1)), color: "var(--he-c-solar)" },
    { key: "g", w: Math.max(0.05, b * 0.45), color: "var(--he-c-grid)" },
  ];
});

const costStripParts = computed(() => {
  const c = energyKwh.value.cost;
  return [
    { w: c * 0.4, color: "#42a5f5" },
    { w: c * 0.35, color: "#78909c" },
    { w: c * 0.25, color: "#ef5350" },
  ];
});

const reinjStripParts = computed(() => {
  const r = energyKwh.value.reinj;
  return [
    { w: r * 0.45, color: "var(--he-c-solar-exp)" },
    { w: r * 0.3, color: "var(--he-c-batt)" },
    { w: Math.max(0.02, r * 0.25), color: "var(--he-c-sub)" },
  ];
});

function stripTotal(parts) {
  return parts.reduce((a, x) => a + x.w, 0) || 1;
}

const ecoEuro = computed(() => 2.15 + 1.1 * sinPhase(1.25));
const insightPct = computed(() => Math.round(38 + 22 * sinPhase(0.15)));

function stripSegStyle(parts, seg) {
  const tot = stripTotal(parts);
  return { width: `${(100 * seg.w) / tot}%`, background: seg.color };
}
</script>

<template>
  <div class="he-card-showcase" role="img" :aria-label="t.demoNote">
    <div class="he-card-showcase__header">
      <div class="he-card-showcase__title-block">
        <h2>Hub Énergie</h2>
        <span class="he-card-showcase__subtitle">EDF · TEMPO · 9kVA</span>
      </div>
      <div class="he-card-showcase__controls">
        <label for="he-card-showcase-date">{{ t.date }}</label>
        <input id="he-card-showcase-date" class="he-card-showcase__date" type="date" :value="mockDate" readonly tabindex="-1" />
        <span>{{ t.range }}</span>
        <div class="he-card-showcase__range-btns" role="group" :aria-label="t.range">
          <span class="he-card-showcase__range-btn he-card-showcase__range-btn--active">{{ t.day }}</span>
          <span class="he-card-showcase__range-btn">{{ t.week }}</span>
          <span class="he-card-showcase__range-btn">{{ t.month }}</span>
          <span class="he-card-showcase__range-btn">{{ t.year }}</span>
        </div>
        <span class="he-card-showcase__range-label">{{ rangeLabel }}</span>
      </div>
    </div>

    <div class="he-card-showcase__meta" aria-hidden="true">
      <div class="he-card-showcase__day-stack">
        <div class="he-card-showcase__tile he-card-showcase__tile--blue">
          <span class="he-card-showcase__tile-line">{{ t.today }} : {{ currentSlotLabel }}</span>
        </div>
        <div class="he-card-showcase__tile he-card-showcase__tile--white">
          <span class="he-card-showcase__tile-line">{{ t.tomorrow }} : {{ tomorrowColorLabel }}</span>
        </div>
      </div>
      <div class="he-card-showcase__tempo-days">
        <div class="he-card-showcase__tempo-day">
          {{ t.tempoBlue }} : {{ tempoRemaining.blue.rem }}/{{ tempoRemaining.blue.rem + tempoRemaining.blue.el }}
        </div>
        <div class="he-card-showcase__tempo-day">
          {{ t.tempoWhite }} : {{ tempoRemaining.white.rem }}/{{ tempoRemaining.white.rem + tempoRemaining.white.el }}
        </div>
        <div class="he-card-showcase__tempo-day">
          {{ t.tempoRed }} : {{ tempoRemaining.red.rem }}/{{ tempoRemaining.red.rem + tempoRemaining.red.el }}
        </div>
      </div>
    </div>

    <div class="he-card-showcase__power">
      <div class="he-card-showcase__power-head">
        <span>{{ t.powerNow }}</span>
        <b>{{ Math.round(powerTotal) }} W</b>
      </div>
      <div class="he-card-showcase__power-bar" aria-hidden="true">
        <span class="he-card-showcase__power-seg" :style="{ width: pct(powerW.grid), background: 'var(--he-c-grid)' }" />
        <span class="he-card-showcase__power-seg" :style="{ width: pct(powerW.solar), background: 'var(--he-c-solar)' }" />
        <span class="he-card-showcase__power-seg" :style="{ width: pct(powerW.batt), background: 'var(--he-c-batt)' }" />
        <span class="he-card-showcase__power-seg" :style="{ width: pct(powerW.export), background: 'var(--he-c-solar-exp)' }" />
      </div>
      <div class="he-card-showcase__power-legend">
        <span
          ><i class="he-card-showcase__dot" style="background: var(--he-c-grid)" />{{ t.colGrid }}
          {{ Math.round(powerW.grid) }} W</span
        >
        <span
          ><i class="he-card-showcase__dot" style="background: var(--he-c-solar)" />{{ t.colSolar }}
          {{ Math.round(powerW.solar) }} W</span
        >
        <span
          ><i class="he-card-showcase__dot" style="background: var(--he-c-batt)" />{{ t.colBatt }}
          {{ Math.round(powerW.batt) }} W</span
        >
        <span
          ><i class="he-card-showcase__dot" style="background: var(--he-c-solar-exp)" />{{ t.colExport }}
          {{ Math.round(powerW.export) }} W</span
        >
      </div>
      <div class="he-card-showcase__power-head" style="margin-top: 0.45rem; margin-bottom: 0">
        <span>{{ t.houseLoad }}</span>
        <b>{{ houseW }} W</b>
      </div>
    </div>

    <div class="he-card-showcase__insight">
      <span
        ><strong>{{ insightPct }}%</strong> {{ t.insightAutosuff }}</span
      >
      <span
        ><strong>{{ ecoEuro >= 0 ? "+" : "" }}{{ ecoEuro.toFixed(2) }} €</strong> {{ t.insightVsGrid }}</span
      >
    </div>

    <div class="he-card-showcase__section">
      <div class="he-card-showcase__section-head">
        <h3>{{ t.sectionConsumption }}</h3>
        <div class="he-card-showcase__section-metric">{{ t.totalEnergy }} <b>{{ fmtKwh(energyKwh.home) }}</b></div>
      </div>
      <div class="he-card-showcase__strip">
        <div class="he-card-showcase__strip-title">{{ t.stripGrid }}</div>
        <div class="he-card-showcase__strip-bar">
          <span
            v-for="(seg, i) in gridStripParts"
            :key="'g' + i"
            class="he-card-showcase__strip-seg"
            :style="stripSegStyle(gridStripParts, seg)"
          />
        </div>
        <div class="he-card-showcase__strip-foot">{{ fmtKwh(energyKwh.grid) }}</div>
      </div>
      <div class="he-card-showcase__strip">
        <div class="he-card-showcase__strip-title">{{ t.stripHome }}</div>
        <div class="he-card-showcase__strip-bar">
          <span
            v-for="(seg, i) in homeStripParts"
            :key="'h' + i"
            class="he-card-showcase__strip-seg"
            :style="stripSegStyle(homeStripParts, seg)"
          />
        </div>
        <div class="he-card-showcase__strip-foot">{{ fmtKwh(energyKwh.home) }}</div>
      </div>
      <div class="he-card-showcase__strip">
        <div class="he-card-showcase__strip-title">{{ t.stripBatt }}</div>
        <div class="he-card-showcase__strip-bar">
          <span
            v-for="(seg, i) in battStripParts"
            :key="'b' + i"
            class="he-card-showcase__strip-seg"
            :style="stripSegStyle(battStripParts, seg)"
          />
        </div>
        <div class="he-card-showcase__strip-foot">{{ fmtKwh(energyKwh.batt) }}</div>
      </div>
    </div>

    <div class="he-card-showcase__section">
      <div class="he-card-showcase__strip">
        <div class="he-card-showcase__strip-title">{{ t.costStrip }}</div>
        <div class="he-card-showcase__strip-bar">
          <span
            v-for="(seg, i) in costStripParts"
            :key="'c' + i"
            class="he-card-showcase__strip-seg"
            :style="stripSegStyle(costStripParts, seg)"
          />
        </div>
        <div class="he-card-showcase__strip-foot">{{ fmtEur(energyKwh.cost) }}</div>
      </div>
      <div class="he-card-showcase__strip">
        <div class="he-card-showcase__strip-title">{{ t.reinjStrip }}</div>
        <div class="he-card-showcase__strip-bar">
          <span
            v-for="(seg, i) in reinjStripParts"
            :key="'r' + i"
            class="he-card-showcase__strip-seg"
            :style="stripSegStyle(reinjStripParts, seg)"
          />
        </div>
        <div class="he-card-showcase__strip-foot">{{ fmtKwh(energyKwh.reinj) }}</div>
      </div>
    </div>

    <p class="he-card-showcase__note">{{ t.demoNote }}</p>
  </div>
</template>

<style scoped src="../../../styles/doc/lovelace-card-showcase.css"></style>