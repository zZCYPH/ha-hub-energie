<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import catalog from "../data/flowCatalog.generated.json";
import { getLang } from "../siteShell";

/** Sentinel: simulator reached HA ``async_create_entry`` (no catalog row). */
const STEP_DONE = "__done__";

const langTick = ref(0);
const history = ref(["user"]);
const finished = ref(false);

/** Branching state — same keys as ``config_flow.py`` user input (stringly-typed for `<select>` / `<input>`). */
const INITIAL_FORM = {
  supplier: "edf",
  phase_type: "mono",
  tariff_mode: "auto",
  supplier_custom_name: "",
  contract_power: "9",
  contract_name: "",
  tariff_offer: "base",
  tempo_mode: "api_couleur",
  rte_client_id: "",
  rte_client_secret: "",
  pricing_structure: "flat",
  price_basis: "TTC",
  currency: "EUR",
  energy_price: "0.15",
  subscription_price: "0",
  schedule_slots: "[]",
  grid_tri_energy_mode: "",
  grid_tri_sensor_layout: "total",
  has_solar: "false",
  solar_estimation_enabled: "false",
  has_batteries: "false",
  batt_advanced: "false",
  add_another: "false",
};

const formState = reactive({ ...INITIAL_FORM });

/** Fake entity ids — simulates HA entity picker (energy / power domains). */
const DUMMY_ENTITIES = [
  "sensor.compteur_reseau_import",
  "sensor.linky_puissance",
  "sensor.shellyem3_channel_a_energy",
  "sensor.grid_import_energy_total",
  "sensor.energy_returned",
  "sensor.solaredge_import",
];

const CONTRACT_KVA = ["3", "6", "9", "12", "15", "18", "24", "30", "36"];

function tr(key) {
  langTick.value;
  const lang = getLang();
  const I = globalThis.HubEnergieI18n;
  const bag = I?.[lang] || I?.en;
  const s = bag?.[key];
  return s !== undefined && s !== "" ? s : key;
}

function bumpLang() {
  langTick.value++;
}

const activeLocale = computed(() => {
  langTick.value;
  return getLang() === "fr" ? "fr" : "en";
});

function humanizeDescription(raw) {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/\{doc_url\}/g, "…");
  s = s.replace(/\{battery_number\}/g, "1");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return s;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/** Integration step description is a single markdown link to the doc vitrine → safe HTML. */
function flowStepDescriptionHtml(raw) {
  if (!raw) return "";
  const t = String(raw).trim();
  const m = t.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
  if (!m) return escapeHtml(humanizeDescription(raw));
  const label = m[1];
  const href = m[2].trim();
  return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" class="flow-sim-ha__doc-link">${escapeHtml(label)}</a>`;
}

function displayTitle(raw) {
  if (!raw) return "";
  return String(raw).replace(/\{battery_number\}/g, "1");
}

function lookupStep(stepId) {
  return catalog.steps.find((s) => s.step_id === stepId) ?? null;
}

const currentStepId = computed(() => {
  if (finished.value) return STEP_DONE;
  const h = history.value;
  return h.length ? h[h.length - 1] : null;
});

const currentMeta = computed(() => {
  const id = currentStepId.value;
  if (!id || id === STEP_DONE) return null;
  return lookupStep(id) ?? null;
});

/** Resolved copy for current language (catalog ships en + fr from integration JSON). */
const stepCopy = computed(() => {
  const meta = currentMeta.value;
  if (!meta?.strings) return null;
  const b = meta.strings;
  if (b.en && b.fr) return activeLocale.value === "fr" ? b.fr : b.en;
  return b.en || b;
});

const menuLabels = computed(() => {
  const st = stepCopy.value;
  if (!st?.menu_choices?.length) return {};
  const m = {};
  for (const c of st.menu_choices) m[c.key] = c.label;
  return m;
});

function boolFromForm(s, key) {
  const v = s[key];
  if (v === true) return true;
  if (v === false) return false;
  if (v === "true") return true;
  if (v === "false") return false;
  return Boolean(v);
}

/** After “other” supplier, HA forces manual tariffs (``tariff_mode_manual_only``). */
function effectiveTariffMode(s) {
  if (s.supplier === "other") return "manual";
  return s.tariff_mode;
}

function triEnergySet(s) {
  const m = s.grid_tri_energy_mode;
  return m === "single" || m === "per_phase";
}

/** First screen when the real flow would call ``async_step_grid`` (tri needs energy mode first). */
function normalizeEnterGrid(s) {
  if (s.phase_type === "tri" && !triEnergySet(s)) return "grid_tri_energy_mode";
  return "grid";
}

function computeNext(stepId, s) {
  switch (stepId) {
    case "user":
      return s.supplier === "other" ? "supplier_custom" : "tariff_mode";
    case "supplier_custom":
      return "tariff_mode_manual_only";
    case "tariff_mode_manual_only":
      return "contract";
    case "tariff_mode":
      return "contract";
    case "contract": {
      const edfAuto = s.supplier === "edf" && effectiveTariffMode(s) === "auto";
      return edfAuto ? "edf_offer" : "manual_pricing";
    }
    case "edf_offer":
      return s.tariff_offer === "tempo" ? "edf_tempo" : normalizeEnterGrid(s);
    case "edf_tempo":
      return s.tempo_mode === "rte" ? "edf_tempo_rte" : normalizeEnterGrid(s);
    case "edf_tempo_rte":
      return normalizeEnterGrid(s);
    case "manual_pricing": {
      const ps = s.pricing_structure;
      if (ps === "flat") return "manual_flat";
      if (ps === "time_of_use") return "manual_tou";
      return "manual_schedule";
    }
    case "manual_flat":
    case "manual_tou":
    case "manual_schedule_form":
    case "manual_schedule_json":
      return normalizeEnterGrid(s);
    case "grid_tri_energy_mode":
      return s.grid_tri_energy_mode === "per_phase" ? "grid_tri_per_phase" : "grid";
    case "grid_tri_per_phase":
      return "solar";
    case "grid":
      if (s.phase_type === "tri" && s.grid_tri_energy_mode === "single") return "grid_tri_layout";
      return "solar";
    case "grid_tri_layout":
      return s.grid_tri_sensor_layout === "per_phase" ? "tri_grid_phase_1" : "grid_phases";
    case "grid_phases":
    case "tri_grid_phase_3":
      return "solar";
    case "tri_grid_phase_1":
      return "tri_grid_phase_2";
    case "tri_grid_phase_2":
      return "tri_grid_phase_3";
    case "solar":
      return boolFromForm(s, "has_solar") ? "solar_config" : "battery";
    case "solar_config":
      return boolFromForm(s, "solar_estimation_enabled") ? "solar_estimation" : "battery";
    case "solar_estimation":
      return "battery";
    case "battery":
      return boolFromForm(s, "has_batteries") ? "battery_add" : STEP_DONE;
    case "battery_add":
      return boolFromForm(s, "batt_advanced") ? "battery_advanced" : "battery_more";
    case "battery_advanced":
      return "battery_more";
    case "battery_more":
      return boolFromForm(s, "add_another") ? "battery_add" : STEP_DONE;
    default:
      return null;
  }
}

const canGoNext = computed(() => {
  if (finished.value) return false;
  const cur = currentStepId.value;
  if (!cur || cur === STEP_DONE) return false;
  if (currentMeta.value?.kind === "menu") return false;
  const n = computeNext(cur, formState);
  return n !== null && n !== undefined;
});

function defaultForFieldKey(key) {
  if (fieldKind(key) === "boolean") return "false";
  if (fieldKind(key) === "entity") return "";
  if (key === "tou_r0_start") return "22:00";
  if (key === "tou_r0_end") return "06:00";
  if (key === "tou_r1_start") return "06:00";
  if (key === "tou_r1_end") return "22:00";
  if (fieldKind(key) === "contract_power") return "9";
  if (fieldKind(key) === "number") return "0";
  if (key === "supplier") return "edf";
  if (key === "phase_type") return "mono";
  if (key === "tariff_mode") return "auto";
  if (key === "tariff_offer") return "base";
  if (key === "tempo_mode") return "api_couleur";
  if (key === "pricing_structure") return "flat";
  if (key === "price_basis") return "TTC";
  if (key === "currency") return "EUR";
  if (key === "grid_tri_sensor_layout") return "total";
  if (/^sched_r\d+_(start|end)$/.test(key)) return "";
  if (/^sched_r\d+_day_type$/.test(key)) return "all";
  return "";
}

/** Map catalog section field → Home Assistant user-input key (e.g. advanced schedule slots). */
function fieldFormKeyForStep(stepId, sec, f) {
  if (stepId === "manual_schedule_form" && /^sched_slot_\d+$/.test(sec.id)) {
    const i = sec.id.slice("sched_slot_".length);
    return `sched_r${i}_${f.key}`;
  }
  return f.key;
}

function fieldFormKey(sec, f) {
  return fieldFormKeyForStep(currentStepId.value, sec, f);
}

watch(
  () => [currentStepId.value, stepCopy.value, finished.value],
  () => {
    if (finished.value) return;
    const st = stepCopy.value;
    if (!st) return;
    const sid = currentStepId.value;
    for (const f of st.fields || []) {
      if (formState[f.key] === undefined) formState[f.key] = defaultForFieldKey(f.key);
    }
    for (const sec of st.sections || []) {
      for (const f of sec.fields || []) {
        const k = fieldFormKeyForStep(sid, sec, f);
        if (formState[k] === undefined) formState[k] = defaultForFieldKey(k);
      }
    }
  },
  { immediate: true },
);

function goNext() {
  if (finished.value) return;
  const cur = currentStepId.value;
  if (!cur || cur === STEP_DONE) return;
  if (currentMeta.value?.kind === "menu") return;
  const next = computeNext(cur, formState);
  if (next === null || next === undefined) return;
  if (next === STEP_DONE) {
    finished.value = true;
    return;
  }
  if (next === "battery_add" && cur === "battery_more") {
    formState.batt_advanced = "false";
  }
  history.value = [...history.value, next];
}

function goPrev() {
  if (finished.value) {
    finished.value = false;
    return;
  }
  if (history.value.length <= 1) return;
  history.value = history.value.slice(0, -1);
}

function chooseMenuOption(opt) {
  const cur = history.value[history.value.length - 1];
  if (cur !== "manual_schedule") return;
  if (opt === "manual_schedule_prev") {
    history.value = history.value.slice(0, -1);
    return;
  }
  if (opt === "manual_schedule_form" || opt === "manual_schedule_json") {
    history.value = [...history.value, opt];
  }
}

function restartWizard() {
  finished.value = false;
  history.value = ["user"];
  for (const k of Object.keys(formState)) delete formState[k];
  Object.assign(formState, { ...INITIAL_FORM });
}

const progressLabel = computed(() => {
  if (finished.value) return tr("flowsim.done_progress");
  return tr("flowsim.step_depth").replace("{n}", String(history.value.length));
});

/** HA-style expandable HC/HP sections on the time-of-use tariff step. */
const touSectionExpanded = reactive({});

watch(
  () => currentStepId.value,
  (id, prev) => {
    if (prev === "manual_tou" && id !== "manual_tou") {
      for (const k of Object.keys(touSectionExpanded)) delete touSectionExpanded[k];
    }
  },
);

const isManualTouStep = computed(() => !finished.value && currentStepId.value === "manual_tou");

function touSectionIsOpen(secId) {
  return touSectionExpanded[secId] !== false;
}

function toggleTouSection(secId) {
  const open = touSectionExpanded[secId] !== false;
  touSectionExpanded[secId] = !open;
}

function flowsimCurrency() {
  const c = String(formState.currency ?? "EUR").trim();
  return c || "EUR";
}

/** Suffix inside number fields (TOU + advanced schedule), aligned with HA number + unit. */
function suffixForNumberField(key) {
  if (finished.value) return "";
  const step = currentStepId.value;
  if (key === "subscription_price" && (step === "manual_tou" || step === "manual_schedule_form"))
    return tr("flowsim.suffix_per_month").replace("{currency}", flowsimCurrency());
  if (/^tou_r\d+_price$/.test(key) && step === "manual_tou")
    return tr("flowsim.suffix_per_kwh").replace("{currency}", flowsimCurrency());
  if (/^sched_r\d+_price$/.test(key) && step === "manual_schedule_form")
    return tr("flowsim.suffix_per_kwh").replace("{currency}", flowsimCurrency());
  return "";
}

function textKeysExcludeEntity(key) {
  return (
    key === "supplier_custom_name" ||
    key === "contract_name" ||
    key === "batt_name" ||
    key === "currency" ||
    key === "rte_client_id" ||
    key === "name" ||
    key.endsWith("_name")
  );
}

function isEntityKey(key) {
  if (textKeysExcludeEntity(key)) return false;
  if (key === "currency") return false;
  if (
    key === "solar_peak_power" ||
    key === "solar_orientation" ||
    key === "solar_tilt" ||
    key === "solar_commissioning_year" ||
    key === "solar_degradation_rate" ||
    key === "solar_performance_ratio" ||
    key === "solar_export_tariff"
  )
    return false;
  if (/_entity$/.test(key)) return true;
  if (/^current_slot_sensor$/.test(key)) return true;
  if (/^(batt_energy_|tri_(import|export|grid)_|grid_|solar_|load_)/.test(key)) return true;
  if (
    /(_energy|_sensor|_soc|_power)$/.test(key) &&
    !key.includes("energy_price") &&
    !key.includes("subscription")
  )
    return true;
  return false;
}

function fieldKind(key) {
  if (key === "rte_client_secret") return "password";
  if (key === "schedule_slots" || key === "solar_arrays") return "textarea";
  /** Manual kWh price in config flow — not an entity despite ``solar_`` prefix. */
  if (key === "solar_export_tariff") return "text";
  if (/^tou_r\d+_(start|end)$/.test(key)) return "time";
  if (/^sched_r\d+_(start|end)$/.test(key)) return "time";
  if (/^sched_r\d+_day_type$/.test(key)) return "day_type";
  if (key === "supplier") return "supplier";
  if (key === "phase_type") return "phase_type";
  if (key === "tariff_mode") return "tariff_mode";
  if (key === "tariff_offer") return "tariff_offer";
  if (key === "tempo_mode") return "tempo_mode";
  if (key === "contract_power") return "contract_power";
  if (key === "pricing_structure") return "pricing_structure";
  if (key === "price_basis") return "price_basis";
  if (key === "grid_power_sign_mode") return "grid_power_sign";
  if (key === "grid_tri_energy_mode") return "grid_tri_energy_mode";
  if (key === "grid_tri_sensor_layout") return "grid_tri_sensor_layout";
  if (key === "day_type") return "day_type";
  if (key === "solar_tilt_mode") return "solar_tilt_mode";
  if (key === "solar_shading") return "solar_shading";
  if (key === "solar_performance") return "solar_performance";
  if (key === "batt_power_net_sign") return "batt_net_sign";
  if (
    key === "has_solar" ||
    key === "has_batteries" ||
    key === "batt_advanced" ||
    key === "add_another" ||
    key === "solar_estimation_enabled" ||
    key === "solar_advanced" ||
    key === "solar_resale_contract"
  )
    return "boolean";
  if (isEntityKey(key)) return "entity";
  if (
    key === "energy_price" ||
    key === "subscription_price" ||
    (key.includes("price") && key !== "price_basis") ||
    (key.includes("capacity") && !key.endsWith("_entity")) ||
    key === "batt_max_charge_w" ||
    key === "batt_max_discharge_w" ||
    key === "solar_peak_power" ||
    key === "solar_orientation" ||
    key === "solar_tilt" ||
    key === "solar_commissioning_year" ||
    key === "solar_degradation_rate" ||
    key === "solar_performance_ratio"
  )
    return "number";
  return "text";
}

function boolFieldModelChecked(key) {
  const v = formState[key];
  return v === true || v === "true";
}

function setBoolFieldFromEvent(key, ev) {
  const el = ev?.target;
  formState[key] = el && el.checked ? "true" : "false";
}

/** Maps simulator fieldKind → top-level key under integration `strings.json` → `selector`. */
const SELECTOR_KEY_BY_KIND = {
  supplier: "supplier",
  phase_type: "phase_type",
  tariff_mode: "tariff_mode",
  tariff_offer: "tariff_offer",
  tempo_mode: "tempo_mode",
  pricing_structure: "pricing_structure",
  price_basis: "price_basis",
  grid_power_sign: "grid_power_sign_mode",
  grid_tri_energy_mode: "grid_tri_energy_mode",
  grid_tri_sensor_layout: "grid_tri_sensor_layout",
  day_type: "schedule_day_type",
  solar_tilt_mode: "solar_tilt_mode",
  solar_shading: "solar_shading",
  solar_performance: "solar_performance",
  batt_net_sign: "batt_power_net_sign",
  boolean: "boolean",
};

const selectorLocaleBundle = computed(() => {
  langTick.value;
  const loc = activeLocale.value;
  const raw = catalog.selector;
  if (!raw || typeof raw !== "object") return {};
  return raw[loc] || raw.en || {};
});

function selectRowsForKind(kind) {
  if (kind === "contract_power") {
    return CONTRACT_KVA.map((v) => ({ value: v, label: `${v} kVA` }));
  }
  const selKey = SELECTOR_KEY_BY_KIND[kind];
  if (!selKey) return [];
  const opts = selectorLocaleBundle.value[selKey]?.options;
  if (!opts || typeof opts !== "object") return [];
  if (kind === "boolean") {
    const order = ["false", "true"];
    return order.filter((k) => Object.prototype.hasOwnProperty.call(opts, k)).map((k) => ({
      value: k,
      label: String(opts[k] ?? k),
    }));
  }
  if (kind === "tariff_offer") {
    const order = ["tempo", "hphc", "base"];
    return order
      .filter((k) => Object.prototype.hasOwnProperty.call(opts, k))
      .map((value) => ({ value, label: String(opts[value] ?? value) }));
  }
  return Object.keys(opts).map((value) => ({
    value,
    label: String(opts[value] ?? value),
  }));
}

function hasSelectRows(kind) {
  return selectRowsForKind(kind).length > 0;
}

function entitySelectOptions() {
  const head = { value: "", label: "—" };
  return [head, ...DUMMY_ENTITIES.map((id) => ({ value: id, label: id }))];
}

onMounted(() => {
  window.addEventListener("hub-energie-lang", bumpLang);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", bumpLang);
});
</script>

<template>
  <div class="flow-sim fs-card card border shadow-sm">
    <div class="card-body">
      <div class="d-flex flex-column flex-md-row gap-3 align-items-md-end justify-content-between mb-3">
        <div class="flex-grow-1">
          <p class="small text-secondary mb-1">{{ tr("flowsim.branching_hint") }}</p>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="restartWizard">
            {{ tr("flowsim.start_over") }}
          </button>
        </div>
        <div class="text-secondary small font-monospace">{{ progressLabel }}</div>
      </div>

      <div
        class="flow-sim-ha"
        role="region"
        :aria-label="tr('flowsim.region_aria')"
        data-bs-theme="dark"
      >
        <header class="flow-sim-ha__toolbar">
          <span class="flow-sim-ha__icon flow-sim-ha__icon--muted" aria-hidden="true">×</span>
          <h3 class="flow-sim-ha__title">
            {{
              finished
                ? tr("flowsim.done_title")
                : displayTitle(stepCopy?.title) || tr("flowsim.empty")
            }}
          </h3>
          <span class="flow-sim-ha__icon flow-sim-ha__icon--muted" aria-hidden="true">?</span>
        </header>

        <div class="flow-sim-ha__content">
          <template v-if="finished">
            <p class="flow-sim-ha__description mb-2">{{ tr("flowsim.done_body") }}</p>
          </template>

          <template v-else-if="currentMeta?.kind === 'menu' && currentMeta.menu_options?.length">
            <p class="flow-sim-ha__hint flow-sim-ha__hint--muted mb-2">{{ tr("flowsim.choose_menu") }}</p>
            <div class="flow-sim-ha__menu">
              <button
                v-for="opt in currentMeta.menu_options"
                :key="opt"
                type="button"
                class="flow-sim-ha__menu-btn flow-sim-ha__menu-btn--active"
                @click="chooseMenuOption(opt)"
              >
                {{ menuLabels[opt] || opt }}
              </button>
            </div>
          </template>

          <template v-else>
            <p
              v-if="stepCopy?.description"
              class="flow-sim-ha__description"
              v-html="flowStepDescriptionHtml(stepCopy.description)"
            ></p>

            <template v-if="stepCopy?.sections?.length">
              <div
                v-for="sec in stepCopy.sections"
                :key="sec.id"
                :class="['flow-sim-ha__group', isManualTouStep && 'flow-sim-ha__group--tou-card']"
              >
                <button
                  v-if="isManualTouStep"
                  type="button"
                  class="flow-sim-ha__section-head"
                  :aria-expanded="touSectionIsOpen(sec.id)"
                  @click="toggleTouSection(sec.id)"
                >
                  <span
                    class="flow-sim-ha__chevron"
                    :class="{ 'flow-sim-ha__chevron--collapsed': !touSectionIsOpen(sec.id) }"
                    aria-hidden="true"
                  />
                  <span class="flow-sim-ha__section-head-text">{{ sec.name }}</span>
                </button>
                <div v-else class="flow-sim-ha__group-title">{{ sec.name }}</div>
                <div v-show="!isManualTouStep || touSectionIsOpen(sec.id)" class="flow-sim-ha__section-body">
                  <div v-for="f in sec.fields" :key="sec.id + f.key" class="flow-sim-ha__field">
                    <template v-if="fieldKind(fieldFormKey(sec, f)) === 'boolean'">
                      <div class="flow-sim-ha__row--toggle">
                        <span class="flow-sim-ha__toggle-text">{{ f.label }}</span>
                        <label class="flow-sim-ha__switch">
                          <input
                            type="checkbox"
                            role="switch"
                            :checked="boolFieldModelChecked(fieldFormKey(sec, f))"
                            :aria-label="f.label"
                            @change="setBoolFieldFromEvent(fieldFormKey(sec, f), $event)"
                          />
                          <span class="flow-sim-ha__slider" />
                        </label>
                      </div>
                    </template>
                    <template v-else>
                      <label class="flow-sim-ha__label">{{ f.label }}</label>
                      <template v-if="fieldKind(fieldFormKey(sec, f)) === 'password'">
                        <input
                          v-model="formState[fieldFormKey(sec, f)]"
                          class="flow-sim-ha__control"
                          type="password"
                          autocomplete="off"
                          :aria-label="f.label"
                        />
                      </template>
                      <template v-else-if="fieldKind(fieldFormKey(sec, f)) === 'textarea'">
                        <textarea
                          v-model="formState[fieldFormKey(sec, f)]"
                          class="flow-sim-ha__control flow-sim-ha__textarea"
                          rows="4"
                          :aria-label="f.label"
                        />
                      </template>
                      <template v-else-if="fieldKind(fieldFormKey(sec, f)) === 'entity'">
                        <select v-model="formState[fieldFormKey(sec, f)]" class="flow-sim-ha__control" :aria-label="f.label">
                          <option v-for="opt in entitySelectOptions()" :key="opt.value + opt.label" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                        <span class="flow-sim-ha__hint flow-sim-ha__hint--muted">{{ tr("flowsim.dummy_entity_picker") }}</span>
                      </template>
                      <template v-else-if="hasSelectRows(fieldKind(fieldFormKey(sec, f)))">
                        <select v-model="formState[fieldFormKey(sec, f)]" class="flow-sim-ha__control" :aria-label="f.label">
                          <option
                            v-for="opt in selectRowsForKind(fieldKind(fieldFormKey(sec, f)))"
                            :key="fieldFormKey(sec, f) + opt.value"
                            :value="opt.value"
                          >
                            {{ opt.label }}
                          </option>
                        </select>
                      </template>
                      <template v-else-if="fieldKind(fieldFormKey(sec, f)) === 'time'">
                        <input
                          v-model="formState[fieldFormKey(sec, f)]"
                          class="flow-sim-ha__control flow-sim-ha__control--time"
                          type="time"
                          step="60"
                          :placeholder="tr('flowsim.time_placeholder')"
                          :title="tr('flowsim.time_field_title')"
                          :aria-label="f.label"
                        />
                      </template>
                      <template
                        v-else-if="fieldKind(fieldFormKey(sec, f)) === 'number' && suffixForNumberField(fieldFormKey(sec, f))"
                      >
                        <div class="flow-sim-ha__suffix-wrap">
                          <input
                            v-model="formState[fieldFormKey(sec, f)]"
                            class="flow-sim-ha__control flow-sim-ha__control--suffix-in"
                            type="number"
                            step="0.0001"
                            :aria-label="f.label"
                          />
                          <span class="flow-sim-ha__suffix">{{ suffixForNumberField(fieldFormKey(sec, f)) }}</span>
                        </div>
                      </template>
                      <template v-else-if="fieldKind(fieldFormKey(sec, f)) === 'number'">
                        <input
                          v-model="formState[fieldFormKey(sec, f)]"
                          class="flow-sim-ha__control"
                          type="number"
                          step="any"
                          :aria-label="f.label"
                        />
                      </template>
                      <template v-else>
                        <input
                          v-model="formState[fieldFormKey(sec, f)]"
                          class="flow-sim-ha__control"
                          type="text"
                          :aria-label="f.label"
                        />
                      </template>
                    </template>
                    <p v-if="f.description" class="flow-sim-ha__hint">{{ f.description }}</p>
                  </div>
                </div>
              </div>
            </template>

            <div v-for="f in stepCopy?.fields || []" :key="'flow-top-' + f.key" class="flow-sim-ha__field">
              <template v-if="fieldKind(f.key) === 'boolean'">
                <div class="flow-sim-ha__row--toggle">
                  <span class="flow-sim-ha__toggle-text">{{ f.label }}</span>
                  <label class="flow-sim-ha__switch">
                    <input
                      type="checkbox"
                      role="switch"
                      :checked="boolFieldModelChecked(f.key)"
                      :aria-label="f.label"
                      @change="setBoolFieldFromEvent(f.key, $event)"
                    />
                    <span class="flow-sim-ha__slider" />
                  </label>
                </div>
              </template>
              <template v-else>
                <label class="flow-sim-ha__label">{{ f.label }}</label>
                <template v-if="fieldKind(f.key) === 'password'">
                  <input
                    v-model="formState[f.key]"
                    class="flow-sim-ha__control"
                    type="password"
                    autocomplete="off"
                    :aria-label="f.label"
                  />
                </template>
                <template v-else-if="fieldKind(f.key) === 'textarea'">
                  <textarea
                    v-model="formState[f.key]"
                    class="flow-sim-ha__control flow-sim-ha__textarea"
                    rows="4"
                    :aria-label="f.label"
                  />
                </template>
                <template v-else-if="fieldKind(f.key) === 'entity'">
                  <select v-model="formState[f.key]" class="flow-sim-ha__control" :aria-label="f.label">
                    <option v-for="opt in entitySelectOptions()" :key="f.key + opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <span class="flow-sim-ha__hint flow-sim-ha__hint--muted">{{ tr("flowsim.dummy_entity_picker") }}</span>
                </template>
                <template v-else-if="hasSelectRows(fieldKind(f.key))">
                  <select v-model="formState[f.key]" class="flow-sim-ha__control" :aria-label="f.label">
                    <option
                      v-for="opt in selectRowsForKind(fieldKind(f.key))"
                      :key="f.key + opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </template>
                <template v-else-if="fieldKind(f.key) === 'time'">
                  <input
                    v-model="formState[f.key]"
                    class="flow-sim-ha__control flow-sim-ha__control--time"
                    type="time"
                    step="60"
                    :placeholder="tr('flowsim.time_placeholder')"
                    :title="tr('flowsim.time_field_title')"
                    :aria-label="f.label"
                  />
                </template>
                <template v-else-if="fieldKind(f.key) === 'number' && suffixForNumberField(f.key)">
                  <div class="flow-sim-ha__suffix-wrap">
                    <input
                      v-model="formState[f.key]"
                      class="flow-sim-ha__control flow-sim-ha__control--suffix-in"
                      type="number"
                      step="0.0001"
                      :aria-label="f.label"
                    />
                    <span class="flow-sim-ha__suffix">{{ suffixForNumberField(f.key) }}</span>
                  </div>
                </template>
                <template v-else-if="fieldKind(f.key) === 'number'">
                  <input
                    v-model="formState[f.key]"
                    class="flow-sim-ha__control"
                    type="number"
                    step="any"
                    :aria-label="f.label"
                  />
                </template>
                <template v-else>
                  <input v-model="formState[f.key]" class="flow-sim-ha__control" type="text" :aria-label="f.label" />
                </template>
              </template>
              <p v-if="f.description" class="flow-sim-ha__hint">{{ f.description }}</p>
            </div>

            <p v-if="currentMeta?.kind === 'redirect'" class="flow-sim-ha__hint flow-sim-ha__hint--muted mb-0 fst-italic">
              {{ tr("flowsim.redirect_note") }}
            </p>
          </template>
        </div>

        <footer class="flow-sim-ha__footer">
          <button
            type="button"
            class="flow-sim-ha__btn flow-sim-ha__btn--text"
            :disabled="history.length <= 1 && !finished"
            @click="goPrev"
          >
            {{ tr("flowsim.back") }}
          </button>
          <button
            type="button"
            class="flow-sim-ha__btn flow-sim-ha__btn--primary"
            :disabled="!canGoNext"
            @click="goNext"
          >
            {{ tr("flowsim.next") }}
          </button>
        </footer>
      </div>

      <p class="small text-secondary mt-3 mb-0" data-flow-simulator-disclaimer>
        {{ tr("flowsim.disclaimer") }}
      </p>
      <p class="small text-secondary mb-0 font-monospace">generated_at · {{ catalog.generated_at }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Outer shell follows the doc site; inner dialog mimics HA config-flow (dark). */
.flow-sim-ha {
  --fs-ha-bg: #1c1c1c;
  --fs-ha-ink: rgba(255, 255, 255, 0.87);
  --fs-ha-muted: rgba(255, 255, 255, 0.55);
  --fs-ha-divider: rgba(255, 255, 255, 0.08);
  --fs-ha-field: #2b2b2b;
  --fs-ha-accent: #03a9f4;
  --fs-ha-radius: 12px;
  max-width: 560px;
  margin-inline: auto;
  background: var(--fs-ha-bg);
  color: var(--fs-ha-ink);
  border-radius: var(--fs-ha-radius);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
}

.flow-sim-ha__toolbar {
  display: grid;
  grid-template-columns: 2rem 1fr 2rem;
  align-items: center;
  gap: 0.25rem;
  min-height: 56px;
  padding: 0 8px;
  border-bottom: 1px solid var(--fs-ha-divider);
}

.flow-sim-ha__title {
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.25;
  margin: 0;
  text-align: center;
  color: var(--fs-ha-ink);
}

.flow-sim-ha__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: var(--fs-ha-muted);
  font-size: 1.15rem;
  line-height: 1;
}

.flow-sim-ha__icon--muted {
  opacity: 0.55;
}

.flow-sim-ha__content {
  padding: 16px 20px 8px;
  max-height: min(70vh, 520px);
  overflow-y: auto;
}

.flow-sim-ha__description {
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--fs-ha-muted);
  margin-bottom: 1rem;
}

.flow-sim-ha__description :deep(.flow-sim-ha__doc-link) {
  color: var(--fs-ha-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
}

.flow-sim-ha__description :deep(.flow-sim-ha__doc-link):hover {
  filter: brightness(1.12);
}

.flow-sim-ha__group {
  margin-bottom: 1.1rem;
}

/* Time-of-use (HC/HP): HA-like bordered expandable sections */
.flow-sim-ha__group--tou-card {
  border: 1px solid var(--fs-ha-divider);
  border-radius: 10px;
  background: color-mix(in srgb, var(--fs-ha-bg) 88%, #fff);
  overflow: hidden;
  margin-bottom: 12px;
}

.flow-sim-ha__section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 12px 14px;
  border: none;
  border-bottom: 1px solid var(--fs-ha-divider);
  background: color-mix(in srgb, var(--fs-ha-field) 70%, var(--fs-ha-bg));
  color: var(--fs-ha-ink);
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.flow-sim-ha__section-head:hover {
  filter: brightness(1.06);
}

.flow-sim-ha__section-head-text {
  flex: 1;
}

.flow-sim-ha__chevron {
  display: inline-block;
  font-size: 0.55rem;
  line-height: 1;
  color: var(--fs-ha-muted);
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}

.flow-sim-ha__chevron::before {
  content: "▼";
}

.flow-sim-ha__chevron--collapsed {
  transform: rotate(-90deg);
}

.flow-sim-ha__section-body {
  padding: 14px 14px 6px;
}

.flow-sim-ha__group--tou-card .flow-sim-ha__field:last-child {
  margin-bottom: 0.75rem;
}

.flow-sim-ha__control--time {
  min-height: 44px;
  padding-inline: 10px;
  font-variant-numeric: tabular-nums;
}

.flow-sim-ha__suffix-wrap {
  position: relative;
  display: block;
}

.flow-sim-ha__suffix-wrap .flow-sim-ha__control--suffix-in {
  width: 100%;
  padding-inline-end: 5rem;
  box-sizing: border-box;
}

.flow-sim-ha__suffix {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--fs-ha-muted);
  pointer-events: none;
  white-space: nowrap;
}

.flow-sim-ha__group-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: none;
  color: var(--fs-ha-ink);
  margin-bottom: 0.35rem;
}

.flow-sim-ha__field {
  margin-bottom: 1rem;
}

.flow-sim-ha__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--fs-ha-muted);
  margin-bottom: 0.25rem;
}

.flow-sim-ha__control {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 4px 10px;
  font-size: 1rem;
  color: var(--fs-ha-ink);
  background: var(--fs-ha-field);
  border: none;
  border-bottom: 2px solid var(--fs-ha-accent);
  border-radius: 4px 4px 0 0;
  outline: none;
}

.flow-sim-ha__control:focus {
  border-bottom-color: #4fc3f7;
  background: color-mix(in srgb, var(--fs-ha-field) 92%, #000);
}

.flow-sim-ha__textarea {
  min-height: 96px;
  resize: vertical;
  border: 1px solid var(--fs-ha-divider);
  border-bottom: 2px solid var(--fs-ha-accent);
  border-radius: 6px;
  padding: 10px 12px;
}

.flow-sim-ha__hint {
  display: block;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--fs-ha-muted);
  margin-top: 0.35rem;
}

.flow-sim-ha__hint--muted {
  opacity: 0.85;
}

.flow-sim-ha__menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-sim-ha__menu-btn {
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--fs-ha-divider);
  background: color-mix(in srgb, var(--fs-ha-field) 88%, transparent);
  color: var(--fs-ha-ink);
  cursor: pointer;
}

.flow-sim-ha__menu-btn--active {
  opacity: 1;
}

.flow-sim-ha__menu-btn--active:hover {
  filter: brightness(1.06);
}

.flow-sim-ha__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 16px;
  border-top: 1px solid var(--fs-ha-divider);
}

.flow-sim-ha__btn {
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.flow-sim-ha__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.flow-sim-ha__btn--text {
  background: transparent;
  color: var(--fs-ha-accent);
  margin-inline-end: auto;
}

.flow-sim-ha__btn--primary {
  background: var(--fs-ha-accent);
  color: #0a0a0a;
}

.flow-sim-ha__btn--primary:not(:disabled):hover {
  filter: brightness(1.08);
}

/* HA-like boolean row: label left, switch right */
.flow-sim-ha__row--toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding-block: 4px;
}

.flow-sim-ha__toggle-text {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.35;
  color: var(--fs-ha-ink);
}

.flow-sim-ha__switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.flow-sim-ha__switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.flow-sim-ha__slider {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--fs-ha-muted) 55%, var(--fs-ha-field));
  transition: background 0.22s ease;
}

.flow-sim-ha__slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: #e0e0e0;
  box-shadow: 0 1px 3px rgb(0 0 0 / 35%);
  transition: transform 0.22s ease, background 0.22s ease;
}

.flow-sim-ha__switch input:focus-visible + .flow-sim-ha__slider {
  outline: 2px solid var(--fs-ha-accent);
  outline-offset: 2px;
}

.flow-sim-ha__switch input:checked + .flow-sim-ha__slider {
  background: color-mix(in srgb, var(--fs-ha-accent) 72%, #1a1a1a);
}

.flow-sim-ha__switch input:checked + .flow-sim-ha__slider::before {
  transform: translate(16px, -50%);
  background: #fff;
}
</style>
