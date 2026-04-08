<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { SHOWCASE_DUMMY_ENTITIES } from "../data/flowsimShowcaseEntities.js";
import { getLang } from "../siteShell";

/** Mirrors HA EntitySelector narrowing (energy / power / numeric domains / SOC). See `config_flow_selectors.py`. */
const FILTER_KINDS = /** @type {const} */ (["all", "energy", "power", "numeric", "soc"]);

/**
 * @param {{ icon: string, domain: string, value: string }} e
 * @param {(typeof FILTER_KINDS)[number]} kind
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
    validator: (v) => FILTER_KINDS.includes(v),
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

    <p class="flow-sim-ha__hint flow-sim-ha__hint--muted mb-0">{{ tr("flowsim.dummy_entity_picker") }}</p>
  </div>
</template>

<style scoped>
.flow-sim-ha-ep {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flow-sim-ha-ep__trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  text-align: left;
  cursor: pointer;
  background: var(--fs-ha-field, #2b2b2b);
  border: 1px solid var(--fs-ha-divider, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  color: var(--fs-ha-ink, rgba(255, 255, 255, 0.87));
  padding: 8px 10px;
  font: inherit;
}

.flow-sim-ha-ep__trigger:hover {
  filter: brightness(1.05);
}

.flow-sim-ha-ep__trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--fs-ha-muted, rgba(255, 255, 255, 0.55));
  flex-shrink: 0;
}

.flow-sim-ha-ep__trigger-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-sim-ha-ep__trigger-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--fs-ha-ink, #fff);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-sim-ha-ep__trigger-sub {
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--fs-ha-muted, rgba(255, 255, 255, 0.55));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.flow-sim-ha-ep__trigger-placeholder {
  font-size: 0.9375rem;
  color: var(--fs-ha-muted, rgba(255, 255, 255, 0.55));
}

.flow-sim-ha-ep__trigger-caret {
  flex-shrink: 0;
  font-size: 0.65rem;
  color: var(--fs-ha-muted, rgba(255, 255, 255, 0.55));
}

.flow-sim-ha-ep__svg {
  width: 22px;
  height: 22px;
  display: block;
}

.flow-sim-ha-ep__svg--sm {
  width: 20px;
  height: 20px;
}

/* Teleported panel: CSS vars match parent .flow-sim-ha */
.flow-sim-ha-ep__portal {
  --fs-ha-bg: #1c1c1c;
  --fs-ha-ink: rgba(255, 255, 255, 0.87);
  --fs-ha-muted: rgba(255, 255, 255, 0.55);
  --fs-ha-divider: rgba(255, 255, 255, 0.08);
  --fs-ha-field: #2b2b2b;
  --fs-ha-accent: #03a9f4;
}

.flow-sim-ha-ep__panel {
  background: var(--fs-ha-bg);
  border: 1px solid var(--fs-ha-divider);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  max-height: min(55vh, 360px);
  display: flex;
  flex-direction: column;
}

.flow-sim-ha-ep__search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--fs-ha-divider);
  background: color-mix(in srgb, var(--fs-ha-field) 65%, var(--fs-ha-bg));
}

.flow-sim-ha-ep__search {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--fs-ha-ink);
  font: inherit;
  font-size: 0.9375rem;
  outline: none;
  padding: 6px 4px;
}

.flow-sim-ha-ep__search::placeholder {
  color: var(--fs-ha-accent);
  opacity: 0.85;
}

.flow-sim-ha-ep__search-arrow {
  font-size: 0.6rem;
  color: var(--fs-ha-accent);
  flex-shrink: 0;
}

.flow-sim-ha-ep__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.flow-sim-ha-ep__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--fs-ha-divider);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.flow-sim-ha-ep__row:last-child {
  border-bottom: none;
}

.flow-sim-ha-ep__row:hover {
  background: color-mix(in srgb, var(--fs-ha-field) 55%, transparent);
}

.flow-sim-ha-ep__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--fs-ha-muted) 22%, var(--fs-ha-field));
  color: var(--fs-ha-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.flow-sim-ha-ep__icon--clear {
  font-weight: 500;
  font-size: 1.1rem;
}

.flow-sim-ha-ep__row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-sim-ha-ep__row-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--fs-ha-ink);
  line-height: 1.25;
}

.flow-sim-ha-ep__row-path {
  font-size: 0.75rem;
  color: var(--fs-ha-muted);
  line-height: 1.2;
}

.flow-sim-ha-ep__domain {
  flex-shrink: 0;
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--fs-ha-muted);
  padding: 3px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--fs-ha-muted) 18%, var(--fs-ha-field));
  max-width: 38%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
