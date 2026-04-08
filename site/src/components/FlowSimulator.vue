<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import catalog from "../data/flowCatalog.generated.json";
import { getLang } from "../siteShell";

const langTick = ref(0);
const scenarioId = ref(catalog.scenarios[0]?.id ?? "");
const stepIndex = ref(0);

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

function humanizeDescription(raw) {
  if (!raw) return "";
  let s = String(raw);
  s = s.replace(/\{doc_url\}/g, "…");
  s = s.replace(/\{battery_number\}/g, "1");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return s;
}

function displayTitle(raw) {
  if (!raw) return "";
  return String(raw).replace(/\{battery_number\}/g, "1");
}

function lookupStep(stepId) {
  return catalog.steps.find((s) => s.step_id === stepId) ?? null;
}

const scenario = computed(() => catalog.scenarios.find((s) => s.id === scenarioId.value) ?? null);

const stepIds = computed(() => scenario.value?.step_ids ?? []);

const currentStepId = computed(() => stepIds.value[stepIndex.value] ?? null);

const currentMeta = computed(() => (currentStepId.value ? lookupStep(currentStepId.value) : null));

const menuLabels = computed(() => {
  const st = currentMeta.value?.strings;
  if (!st?.menu_choices?.length) return {};
  const m = {};
  for (const c of st.menu_choices) m[c.key] = c.label;
  return m;
});

watch(scenarioId, () => {
  stepIndex.value = 0;
});

watch(stepIds, () => {
  if (stepIndex.value >= stepIds.value.length) stepIndex.value = Math.max(0, stepIds.value.length - 1);
});

function goPrev() {
  stepIndex.value = Math.max(0, stepIndex.value - 1);
}

function goNext() {
  stepIndex.value = Math.min(stepIds.value.length - 1, stepIndex.value + 1);
}

const progressLabel = computed(() => {
  const n = stepIds.value.length;
  if (!n) return "";
  return `${stepIndex.value + 1} / ${n}`;
});

onMounted(() => {
  window.addEventListener("hub-energie-lang", bumpLang);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", bumpLang);
});
</script>

<template>
  <div class="flow-simulator card border shadow-sm">
    <div class="card-body">
      <div class="d-flex flex-column flex-md-row gap-3 align-items-md-end justify-content-between mb-3">
        <div class="flex-grow-1">
          <label class="form-label small text-secondary mb-1" for="flow-sim-scenario">{{
            tr("flowsim.scenario_label")
          }}</label>
          <select
            id="flow-sim-scenario"
            v-model="scenarioId"
            class="form-select form-select-sm"
            :aria-label="tr('flowsim.scenario_label')"
          >
            <option v-for="s in catalog.scenarios" :key="s.id" :value="s.id">{{ s.title }}</option>
          </select>
          <div v-if="scenario?.note" class="small text-secondary mt-2">
            {{ scenario.note }}
          </div>
        </div>
        <div class="text-secondary small font-mono">{{ progressLabel }}</div>
      </div>

      <div
        class="flow-simulator-ha border rounded-3 overflow-hidden"
        role="region"
        :aria-label="tr('flowsim.region_aria')"
      >
        <header
          class="flow-simulator-ha__head d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom"
        >
          <span class="placeholder col-1 rounded opacity-25" style="width: 1.25rem; height: 1.25rem">&nbsp;</span>
          <h3 class="h6 mb-0 text-center text-truncate flex-grow-1 px-2">
            {{ displayTitle(currentMeta?.strings?.title) || tr("flowsim.empty") }}
          </h3>
          <span class="placeholder col-1 rounded opacity-25" style="width: 1.25rem; height: 1.25rem">&nbsp;</span>
        </header>
        <div class="flow-simulator-ha__body p-3">
          <p v-if="currentMeta?.strings?.description" class="small text-secondary mb-3">
            {{ humanizeDescription(currentMeta.strings.description) }}
          </p>
          <p class="small font-mono text-secondary mb-3">
            <span class="fw-semibold text-body">step_id</span> · {{ currentStepId || "—" }}
          </p>

          <template v-if="currentMeta?.kind === 'menu' && currentMeta.menu_options?.length">
            <div class="d-grid gap-2">
              <button
                v-for="opt in currentMeta.menu_options"
                :key="opt"
                type="button"
                class="btn btn-outline-secondary btn-sm text-start"
                disabled
              >
                {{ menuLabels[opt] || opt }}
              </button>
            </div>
          </template>

          <template v-else-if="currentMeta?.strings?.sections?.length">
            <div v-for="sec in currentMeta.strings.sections" :key="sec.id" class="mb-3">
              <div class="fw-semibold small mb-2">{{ sec.name }}</div>
              <div v-for="f in sec.fields" :key="sec.id + f.key" class="mb-2">
                <label class="form-label small mb-0">{{ f.label }}</label>
                <input type="text" class="form-control form-control-sm" disabled :placeholder="f.label" />
              </div>
            </div>
          </template>

          <template v-else>
            <div v-for="f in currentMeta?.strings?.fields || []" :key="f.key" class="mb-2">
              <label class="form-label small mb-0">{{ f.label }}</label>
              <input type="text" class="form-control form-control-sm" disabled :placeholder="f.label" />
              <div v-if="f.description" class="form-text">{{ f.description }}</div>
            </div>
          </template>

          <p v-if="currentMeta?.kind === 'redirect'" class="small text-secondary mb-0 fst-italic">
            {{ tr("flowsim.redirect_note") }}
          </p>
        </div>
        <footer class="flow-simulator-ha__foot d-flex justify-content-between gap-2 px-3 py-2 border-top">
          <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="stepIndex <= 0" @click="goPrev">
            {{ tr("flowsim.back") }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="stepIndex >= stepIds.length - 1"
            @click="goNext"
          >
            {{ tr("flowsim.next") }}
          </button>
        </footer>
      </div>

      <p class="small text-secondary mt-3 mb-0" data-flow-simulator-disclaimer>
        {{ tr("flowsim.disclaimer") }}
      </p>
      <p class="small text-secondary mb-0">
        <span class="font-monospace">generated_at</span> · {{ catalog.generated_at }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.flow-simulator-ha {
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
}
.flow-simulator-ha__head {
  background: color-mix(in srgb, var(--bs-body-bg) 88%, var(--bs-secondary-bg));
}
.flow-simulator-ha__foot {
  background: color-mix(in srgb, var(--bs-body-bg) 92%, var(--bs-secondary-bg));
}
</style>
