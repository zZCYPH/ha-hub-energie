<script setup>
import { computed, nextTick, onUnmounted, watch } from "vue";
import { I18N } from "../../../../../custom_components/hub_energie/frontend/src/constants/i18n.js";
import { tpl } from "../../../../../custom_components/hub_energie/frontend/src/utils/i18n-template.js";
import { applyDataI18nTo } from "../../../siteShell";

/** Mirrors hub-energie-card-editor.js */
const POWER_HISTORY_HOURS_SET = new Set([24, 12, 6, 3, 1]);
const POWER_HISTORY_HOURS_UI = [1, 3, 6, 12, 24];

const SECTION_TOGGLES = [
  ["show_day_slots", "editorShowDaySlots"],
  ["show_live_power", "editorShowLivePower"],
  ["show_solar_production_bar", "editorShowSolarProductionBar"],
  ["show_battery_bar", "editorShowBatteryBar"],
  ["show_insights_bar", "editorShowInsightsBar"],
  ["show_consumption", "editorShowConsumption"],
  ["show_cost", "editorShowCost"],
  ["show_savings", "editorShowSavings"],
  ["show_reinjection", "editorShowReinjection"],
  ["show_raw_control", "editorShowRawControl"],
];

const props = defineProps({
  open: { type: Boolean, default: false },
  lang: { type: String, default: "en" },
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(["update:modelValue", "update:open"]);

const i18n = computed(() => (props.lang === "fr" ? I18N.fr : I18N.en));

function sectionOn(key) {
  const v = props.modelValue?.[key];
  return v !== false && v !== "false";
}

function setSectionFlag(key, on) {
  const next = { ...props.modelValue };
  if (on) delete next[key];
  else next[key] = false;
  emit("update:modelValue", next);
}

const powerHoursValue = computed(() => {
  const raw = parseFloat(props.modelValue?.power_history_hours);
  const t = Math.trunc(raw);
  return POWER_HISTORY_HOURS_SET.has(t) ? t : 6;
});

function onPowerHoursChange(ev) {
  const n = Math.trunc(Number(ev.target.value));
  if (!POWER_HISTORY_HOURS_SET.has(n)) return;
  if (n === powerHoursValue.value) return;
  emit("update:modelValue", { ...props.modelValue, power_history_hours: n });
}

function close() {
  emit("update:open", false);
}

function onDocEscape(ev) {
  if (ev.key === "Escape" && props.open) close();
}

async function syncDocI18n() {
  await nextTick();
  await nextTick();
  const root = document.querySelector(".he-card-editor-sim-dialog");
  if (root) applyDataI18nTo(root);
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      void syncDocI18n();
      document.addEventListener("keydown", onDocEscape);
    } else {
      document.removeEventListener("keydown", onDocEscape);
    }
  },
);

watch(
  () => props.lang,
  () => {
    if (props.open) syncDocI18n();
  },
);

onUnmounted(() => {
  document.removeEventListener("keydown", onDocEscape);
});
</script>

<template>
  <Teleport to="body">
    <!-- v-show keeps #he-modal-preview in the DOM so the vitrine Teleport target exists before open. -->
    <div v-show="open" class="he-card-editor-sim-backdrop" role="presentation" @click.self="close">
      <div
        class="he-card-editor-sim-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'he-card-editor-sim-title'"
        tabindex="-1"
        @click.stop
      >
        <div class="he-card-editor-sim-head">
          <h2 id="he-card-editor-sim-title" class="he-card-editor-sim-title" data-i18n="lovelace.showcase_editor_title"></h2>
          <button type="button" class="he-card-editor-sim-close btn btn-sm btn-outline-secondary" @click="close">
            <span data-i18n="lovelace.showcase_editor_close">Close</span>
          </button>
        </div>
        <p class="he-card-editor-sim-lead small text-secondary mb-0" data-i18n="lovelace.showcase_editor_lead"></p>

        <div class="he-card-editor-sim-split">
          <div class="he-card-editor-sim-settings">
            <div class="he-card-editor-sim-field">
              <label class="form-label small fw-semibold mb-1" for="he-pw-hours">{{ i18n.editorPowerGraphWindow }}</label>
              <select id="he-pw-hours" class="form-select form-select-sm" :value="String(powerHoursValue)" @change="onPowerHoursChange">
                <option v-for="h in POWER_HISTORY_HOURS_UI" :key="h" :value="String(h)">
                  {{ tpl(i18n.editorPowerHoursUnit, { n: h }) }}
                </option>
              </select>
              <p class="he-card-editor-sim-hint small text-secondary mt-1 mb-0">{{ i18n.editorPowerHoursHint }}</p>
            </div>

            <div class="he-card-editor-sim-sections-title">{{ i18n.editorSectionsTitle }}</div>
            <div v-for="([key, labelProp]) in SECTION_TOGGLES" :key="key" class="he-card-editor-sim-field form-check form-switch">
              <input
                :id="'he-sw-' + key"
                class="form-check-input"
                type="checkbox"
                role="switch"
                :checked="sectionOn(key)"
                @change="setSectionFlag(key, $event.target.checked)"
              />
              <label class="form-check-label" :for="'he-sw-' + key">{{ i18n[labelProp] }}</label>
            </div>

            <p class="he-card-editor-sim-hint small text-secondary mt-3 mb-0">
              <span>{{ i18n.editorAdvancedYamlBefore }}</span><code>power_history_refresh_seconds</code><span>{{ i18n.editorAdvancedYamlAfter }}</span>
            </p>
          </div>

          <div
            id="he-modal-preview"
            class="he-card-editor-sim-preview"
            data-bs-theme="dark"
            role="region"
            data-i18n-aria="lovelace.showcase_editor_preview_aria"
          >
            <!-- Live card mock is teleported here from LovelaceCardShowcase.vue -->
          </div>
        </div>

        <div class="he-card-editor-sim-foot">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="close">
            <span data-i18n="lovelace.showcase_editor_cancel">Cancel</span>
          </button>
          <button type="button" class="btn btn-sm btn-primary" @click="close">
            <span data-i18n="lovelace.showcase_editor_save">Save</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.he-card-editor-sim-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1080;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px 12px;
  overflow-y: auto;
}

.he-card-editor-sim-dialog {
  width: min(1240px, calc(100vw - 24px));
  max-height: min(92vh, 920px);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--bs-body-bg, #fff);
  color: var(--bs-body-color, #212529);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  padding: 0.85rem 1rem 0;
  margin-top: max(0px, env(safe-area-inset-top, 0px));
}

.he-card-editor-sim-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.35rem;
  flex-shrink: 0;
}

.he-card-editor-sim-title {
  font-size: 1.05rem;
  margin: 0;
  font-weight: 600;
}

.he-card-editor-sim-lead {
  flex-shrink: 0;
  padding-right: 0.25rem;
  margin-bottom: 0.65rem !important;
}

.he-card-editor-sim-split {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  flex: 1;
  min-height: 0;
  border-top: 1px solid var(--bs-border-color, rgba(0, 0, 0, 0.12));
  border-bottom: 1px solid var(--bs-border-color, rgba(0, 0, 0, 0.12));
  margin-left: -1rem;
  margin-right: -1rem;
}

.he-card-editor-sim-settings {
  flex: 0 0 min(380px, 38%);
  max-width: 420px;
  padding: 0.75rem 1rem 0.85rem;
  overflow-y: auto;
  border-right: 1px solid var(--bs-border-color, rgba(0, 0, 0, 0.12));
}

.he-card-editor-sim-preview {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.65rem 0.75rem 0.75rem;
  overflow: auto;
  background: color-mix(in srgb, var(--bs-secondary-bg, #2b3035) 92%, #000);
}

.he-card-editor-sim-foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding: 0.65rem 0 0.85rem;
}

.he-card-editor-sim-sections-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.he-card-editor-sim-hint {
  line-height: 1.45;
}

.he-card-editor-sim-field + .he-card-editor-sim-field {
  margin-top: 0.35rem;
}

@media (max-width: 799.98px) {
  .he-card-editor-sim-dialog {
    width: min(100%, calc(100vw - 16px));
    max-height: min(96vh, 920px);
  }

  .he-card-editor-sim-split {
    flex-direction: column;
  }

  .he-card-editor-sim-settings {
    flex: 0 0 auto;
    max-width: none;
    border-right: none;
    border-bottom: 1px solid var(--bs-border-color, rgba(0, 0, 0, 0.12));
    max-height: min(42vh, 360px);
  }

  .he-card-editor-sim-preview {
    flex: 1 1 auto;
    min-height: 220px;
  }
}
</style>
