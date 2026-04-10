<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
const releases = ref([]);
const selectedVersion = ref("");

function tr(key) {
  langTick.value;
  const lang = getLang();
  const I = globalThis.HubEnergieI18n;
  const bag = I?.[lang] || I?.en;
  const s = bag?.[key];
  return s !== undefined && s !== "" ? s : key;
}

const selected = computed(() =>
  releases.value.find((r) => r.version === selectedVersion.value),
);

const downloadHref = computed(() => selected.value?.url ?? "#");
const downloadFilename = computed(() => selected.value?.filename ?? "");

function bumpLang() {
  langTick.value++;
}

onMounted(() => {
  window.addEventListener("hub-energie-lang", bumpLang);
  fetch(props.jsonUrl)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((data) => {
      const list = Array.isArray(data.releases) ? data.releases : [];
      releases.value = list;
      if (list.length && !selectedVersion.value) {
        selectedVersion.value = list[0].version;
      }
      error.value = "";
    })
    .catch(() => {
      error.value = "fetch";
      releases.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
});

onUnmounted(() => {
  window.removeEventListener("hub-energie-lang", bumpLang);
});

watch(releases, (list) => {
  if (list.length && !list.some((r) => r.version === selectedVersion.value)) {
    selectedVersion.value = list[0].version;
  }
});
</script>

<template>
  <div class="site-install-release-picker install-release-picker">
    <div v-if="loading" class="small text-secondary mb-0">{{ tr("install.release_loading") }}</div>
    <div v-else-if="error" class="small text-danger mb-0">{{ tr("install.release_fetch_error") }}</div>
    <div v-else-if="!releases.length" class="small text-secondary mb-0">{{ tr("install.release_none") }}</div>
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
          style="max-width: 16rem"
        >
          <option v-for="r in releases" :key="r.tag" :value="r.version">{{ r.tag }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
