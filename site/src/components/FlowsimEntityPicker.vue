<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { FLOWSIM_ENTITY_PICKER_FILTER_KINDS } from "../data/flowsimEntityPickerFilterKinds.js";
import { SHOWCASE_DUMMY_ENTITIES } from "../data/flowsimShowcaseEntities.js";
import { getLang } from "../siteShell";

/** Mirrors HA EntitySelector narrowing (energy / power / numeric domains / SOC). See `config_flow_selectors.py`. */

/**
 * @param {{ icon: string, domain: string, value: string }} e
 * @param {string} kind
 */
function matchesEntityFilter(e, kind) {
  if (!kind || kind === "all") return true;
  if (kind === "energy") return e.icon === "energy";
  if (kind === "power") return e.icon === "power";
  if (kind === "numeric") return e.icon === "numeric" || e.domain === "number";
  if (kind === "soc") {
    if (e.icon === "percent") return true;
    if (e.icon === "numeric" && /soc/i.test(e.value)) return true;
    return false;
  }
  return true;
}

const props = defineProps({
  modelValue: { type: String, default: "" },
  ariaLabel: { type: String, default: "" },
  /** When not `all`, only dummy entities matching this role are listed (aligned with real HA selectors). */
  filterKind: {
    type: String,
    default: "all",
    validator: (v) => FLOWSIM_ENTITY_PICKER_FILTER_KINDS.includes(v),
  },
});

const emit = defineEmits(["update:modelValue"]);

const langTick = ref(0);
const open = ref(false);
const query = ref("");
const triggerRef = ref(null);
const panelRef = ref(null);
const searchRef = ref(null);
const panelStyle = ref({});

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

const locale = computed(() => {
  langTick.value;
  return getLang() === "fr" ? "fr" : "en";
});

const selectedMeta = computed(() => SHOWCASE_DUMMY_ENTITIES.find((e) => e.value === props.modelValue));

const filteredEntities = computed(() => {
  const q = query.value.trim().toLowerCase();
  const loc = locale.value;
  const fk = props.filterKind || "all";
  return SHOWCASE_DUMMY_ENTITIES.filter((e) => {
    if (!matchesEntityFilter(e, fk)) return false;
    if (!q) return true;
    const name = loc === "fr" ? e.nameFr : e.nameEn;
    const path = loc === "fr" ? e.pathFr : e.pathEn;
    return (
      e.value.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      path.toLowerCase().includes(q)
    );
  });
});

function labelName(e) {
  return locale.value === "fr" ? e.nameFr : e.nameEn;
}

function labelPath(e) {
  return locale.value === "fr" ? e.pathFr : e.pathEn;
}

function domainLabel(domain) {
  if (domain === "number") return tr("flowsim.entity_domain_number");
  if (domain === "input_number") return tr("flowsim.entity_domain_input_number");
  return tr("flowsim.entity_domain_sensor");
}

function updatePanelPosition() {
  const el = triggerRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const w = Math.max(r.width, 288);
  panelStyle.value = {
    position: "fixed",
    top: `${Math.round(r.bottom + 4)}px`,
    left: `${Math.round(r.left)}px`,
    width: `${Math.round(w)}px`,
    zIndex: "3000",
  };
}

function onWinMove() {
  if (open.value) updatePanelPosition();
}

function selectEntity(value) {
  emit("update:modelValue", value);
  open.value = false;
  query.value = "";
}

function focusSearchInput() {
  const el = searchRef.value;
  if (!el || typeof el.focus !== "function") return;
  /** Teleported input is under `body`; default focus scrolls the main document to “find” it — jumps the page. */
  el.focus({ preventScroll: true });
}

function toggleOpen(ev) {
  ev?.stopPropagation?.();
  const next = !open.value;
  open.value = next;
  if (next) {
    query.value = "";
    nextTick(() => {
      updatePanelPosition();
      requestAnimationFrame(() => {
        focusSearchInput();
      });
    });
  }
}

function onDocPointerDown(ev) {
  if (!open.value) return;
  const t = ev.target;
  if (triggerRef.value?.contains(t)) return;
  if (panelRef.value?.contains(t)) return;
  open.value = false;
}

watch(open, (v) => {
  if (v) nextTick(() => updatePanelPosition());
});

onMounted(() => {
  window.addEventListener("hub-energie-lang", bumpLang);
  window.addEventListener("resize", onWinMove);
  window.addEventListener("scroll", onWinMove, true);
  document.addEventListener("pointerdown", onDocPointerDown, true);
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", bumpLang);
  window.removeEventListener("resize", onWinMove);
  window.removeEventListener("scroll", onWinMove, true);
  document.removeEventListener("pointerdown", onDocPointerDown, true);
});
</script>

<template>
  <div class="flow-sim-ha-ep">
    <button
      ref="triggerRef"
      type="button"
      class="flow-sim-ha-ep__trigger flow-sim-ha__control"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-haspopup="true"
      :aria-label="ariaLabel"
      @click="toggleOpen"
    >
      <span class="flow-sim-ha-ep__trigger-icon" aria-hidden="true">
        <svg class="flow-sim-ha-ep__svg" viewBox="0 0 24 24" focusable="false">
          <path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8H7z" />
        </svg>
      </span>
      <span class="flow-sim-ha-ep__trigger-main">
        <template v-if="selectedMeta">
          <span class="flow-sim-ha-ep__trigger-title">{{ labelName(selectedMeta) }}</span>
          <span class="flow-sim-ha-ep__trigger-sub">{{ selectedMeta.value }}</span>
        </template>
        <template v-else>
          <span class="flow-sim-ha-ep__trigger-placeholder">{{ tr("flowsim.entity_placeholder") }}</span>
        </template>
      </span>
      <span class="flow-sim-ha-ep__trigger-caret" aria-hidden="true">{{ open ? "▲" : "▼" }}</span>
    </button>

    <Teleport to="body">
      <div v-if="open" ref="panelRef" class="flow-sim-ha-ep__portal" :style="panelStyle">
        <div class="flow-sim-ha-ep__panel">
          <div class="flow-sim-ha-ep__search-row">
            <input
              ref="searchRef"
              v-model="query"
              type="search"
              class="flow-sim-ha-ep__search"
              autocomplete="off"
              :placeholder="tr('flowsim.entity_search')"
              @click.stop
            />
            <span class="flow-sim-ha-ep__search-arrow" aria-hidden="true">▲</span>
          </div>
          <ul class="flow-sim-ha-ep__list" role="listbox">
            <li role="option">
              <button type="button" class="flow-sim-ha-ep__row" @click="selectEntity('')">
                <span class="flow-sim-ha-ep__icon flow-sim-ha-ep__icon--clear" aria-hidden="true">∅</span>
                <span class="flow-sim-ha-ep__row-text">
                  <span class="flow-sim-ha-ep__row-name">{{ tr("flowsim.entity_clear") }}</span>
                  <span class="flow-sim-ha-ep__row-path">—</span>
                </span>
              </button>
            </li>
            <li v-for="e in filteredEntities" :key="e.value" role="option">
              <button type="button" class="flow-sim-ha-ep__row" @click="selectEntity(e.value)">
                <span class="flow-sim-ha-ep__icon" :class="'flow-sim-ha-ep__icon--' + e.icon" aria-hidden="true">
                  <template v-if="e.icon === 'numeric'">#</template>
                  <template v-else-if="e.icon === 'percent'">%</template>
                  <svg v-else class="flow-sim-ha-ep__svg flow-sim-ha-ep__svg--sm" viewBox="0 0 24 24" focusable="false">
                    <path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8H7z" />
                  </svg>
                </span>
                <span class="flow-sim-ha-ep__row-text">
                  <span class="flow-sim-ha-ep__row-name">{{ labelName(e) }}</span>
                  <span class="flow-sim-ha-ep__row-path">{{ labelPath(e) }}</span>
                </span>
                <span class="flow-sim-ha-ep__domain">{{ domainLabel(e.domain) }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped src="../styles/flow-simulator/entity-picker.css"></style>
