<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { getLang } from "../siteShell";

const props = defineProps({
  jsonUrl: {
    type: String,
    default: "./releases.json",
  },
});

const langTick = ref(0);
const loading = ref(true);
const error = ref("");
/** Full list from releases.json (stable + pre-release). */
const allReleases = ref([]);
const showPrereleases = ref(false);
const selectedVersion = ref("");

function tr(key) {
  langTick.value;
  const lang = getLang();
  const I = globalThis.HubEnergieI18n;
  const bag = I?.[lang] || I?.en;
  const s = bag?.[key];
  return s !== undefined && s !== "" ? s : key;
}

function pickDefaultVersion(list) {
  if (!list.length) return "";
  const firstStable = list.find((r) => !r.prerelease);
  return (firstStable ?? list[0]).version;
}

const hasPrereleases = computed(() => allReleases.value.some((r) => r.prerelease));

const hasStableReleases = computed(() => allReleases.value.some((r) => !r.prerelease));

const disclaimerModalEl = ref(null);
let disclaimerModal = null;

const visibleReleases = computed(() => {
  if (showPrereleases.value) return allReleases.value;
  return allReleases.value.filter((r) => !r.prerelease);
});

const selected = computed(() => allReleases.value.find((r) => r.version === selectedVersion.value));

const downloadHref = computed(() => selected.value?.url ?? "#");
const downloadFilename = computed(() => selected.value?.filename ?? "");

function bumpLang() {
  langTick.value++;
}

function onPrereleaseCheckbox(ev) {
  const checked = ev.target.checked;
  if (!checked) {
    showPrereleases.value = false;
    return;
  }
  ev.target.checked = false;
  if (disclaimerModal) {
    disclaimerModal.show();
    return;
  }
  if (typeof window !== "undefined" && window.confirm(tr("install.release_prerelease_disclaimer_plain"))) {
    showPrereleases.value = true;
    ev.target.checked = true;
  }
}

function confirmPrereleaseDisclaimer() {
  showPrereleases.value = true;
  disclaimerModal?.hide();
}

onMounted(() => {
  window.addEventListener("hub-energie-lang", bumpLang);
  nextTick(() => {
    if (typeof bootstrap !== "undefined" && disclaimerModalEl.value) {
      disclaimerModal?.dispose();
      disclaimerModal = new bootstrap.Modal(disclaimerModalEl.value);
    }
  });
  fetch(props.jsonUrl)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((data) => {
      const raw = Array.isArray(data.releases) ? data.releases : [];
      const list = raw.map((row) => {
        if (!row || typeof row !== "object") return row;
        return { ...row, prerelease: Boolean(row.prerelease) };
      });
      allReleases.value = list;
      const anyStable = list.some((r) => !r.prerelease);
      const anyPre = list.some((r) => r.prerelease);
      if (anyPre && !anyStable) {
        showPrereleases.value = true;
      }
      if (list.length && !selectedVersion.value) {
        selectedVersion.value = pickDefaultVersion(list);
      }
      error.value = "";
    })
    .catch(() => {
      error.value = "fetch";
      allReleases.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", bumpLang);
  disclaimerModal?.dispose();
  disclaimerModal = null;
});

watch(allReleases, (list) => {
  if (!list.length) {
    selectedVersion.value = "";
    return;
  }
  if (!list.some((r) => r.version === selectedVersion.value)) {
    selectedVersion.value = pickDefaultVersion(list);
  }
});

watch(visibleReleases, (list) => {
  if (!list.length) return;
  if (!list.some((r) => r.version === selectedVersion.value)) {
    selectedVersion.value = list[0].version;
  }
});

watch(showPrereleases, (on) => {
  if (on) return;
  const sel = allReleases.value.find((r) => r.version === selectedVersion.value);
  if (sel?.prerelease) {
    selectedVersion.value = pickDefaultVersion(allReleases.value);
  }
});

function optionLabel(r) {
  if (!r?.prerelease) return r.tag;
  return `${r.tag} ${tr("install.release_prerelease_badge")}`;
}
</script>

<template>
  <div class="site-install-release-picker install-release-picker">
    <div v-if="loading" class="small text-secondary mb-0">{{ tr("install.release_loading") }}</div>
    <div v-else-if="error" class="small text-danger mb-0">{{ tr("install.release_fetch_error") }}</div>
    <div v-else-if="!allReleases.length" class="small text-secondary mb-0">{{ tr("install.release_none") }}</div>
    <div v-else class="d-flex flex-column gap-3">
      <a
        class="btn btn-primary align-self-start"
        :href="downloadHref"
        :download="downloadFilename || undefined"
        rel="noopener noreferrer"
      >
        <i class="bi bi-download me-2" aria-hidden="true"></i>
        {{ tr("install.release_download") }}
        <span class="fw-semibold ms-1">{{ selected?.tag ?? selectedVersion }}</span>
      </a>
      <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
        <label class="small text-secondary mb-0 text-nowrap" for="hub-energie-release-select">{{
          tr("install.release_other_label")
        }}</label>
        <select
          id="hub-energie-release-select"
          v-model="selectedVersion"
          class="form-select form-select-sm"
          style="max-width: 20rem"
        >
          <option v-for="r in visibleReleases" :key="r.tag" :value="r.version">{{ optionLabel(r) }}</option>
        </select>
      </div>
      <div v-if="hasPrereleases && hasStableReleases" class="form-check mb-0">
        <input
          id="hub-energie-release-include-prerelease"
          class="form-check-input"
          type="checkbox"
          :checked="showPrereleases"
          @change="onPrereleaseCheckbox"
        />
        <label class="form-check-label small text-secondary" for="hub-energie-release-include-prerelease">
          {{ tr("install.release_include_prereleases") }}
        </label>
      </div>
    </div>

    <!-- Pre-release disclaimer (Bootstrap modal); confirm before enabling the list. -->
    <div
      id="hub-energie-prerelease-disclaimer-modal"
      ref="disclaimerModalEl"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="hub-energie-prerelease-disclaimer-modal-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border border-warning border-opacity-50 shadow">
          <div class="modal-header">
            <h2 id="hub-energie-prerelease-disclaimer-modal-title" class="modal-title h5 text-body">
              {{ tr("install.release_prerelease_disclaimer_title") }}
            </h2>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              :aria-label="tr('nav.close_aria')"
            />
          </div>
          <div class="modal-body">
            <div class="small text-secondary lh-lg" v-html="tr('install.release_prerelease_disclaimer_html')" />
          </div>
          <div class="modal-footer gap-2">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              {{ tr("install.release_prerelease_disclaimer_cancel") }}
            </button>
            <button type="button" class="btn btn-warning" @click="confirmPrereleaseDisclaimer">
              {{ tr("install.release_prerelease_disclaimer_confirm") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
