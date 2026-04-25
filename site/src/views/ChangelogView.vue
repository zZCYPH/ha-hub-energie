<script setup>
import { onMounted, ref } from "vue";

const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const loading = ref(true);
const error = ref("");
const html = ref("");

onMounted(async () => {
  try {
    const res = await fetch(`${base}changelog.generated.json`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const h = typeof data.html === "string" ? data.html : "";
    if (!h.trim()) {
      error.value = "empty";
      return;
    }
    html.value = h;
  } catch {
    error.value = "fetch";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div id="view-changelog" class="app-view site-page site-page--changelog">
    <header class="site-changelog-hero border-bottom bg-body-tertiary bg-opacity-25">
      <div class="container-xxl px-3 py-4 py-lg-5">
        <h1 class="h2 mb-2 text-body" data-i18n="changelog.title">Changelog</h1>
        <p class="text-secondary mb-2 small" data-i18n="changelog.lead">
          Version history for Hub Énergie — same source as the repository CHANGELOG.md.
        </p>
        <p class="text-secondary mb-0 small fst-italic" data-i18n="changelog.lang_note">
          This page is generated from the English changelog file in the project repository.
        </p>
      </div>
    </header>
    <div class="container-xxl px-3 py-4 py-lg-5">
      <div v-if="loading" class="small text-secondary" data-i18n="changelog.loading">Loading…</div>
      <div
        v-else-if="error === 'fetch'"
        class="alert alert-warning small mb-0"
        role="status"
        data-i18n="changelog.load_error"
      >
        The changelog could not be loaded.
      </div>
      <div v-else-if="error === 'empty'" class="alert alert-secondary small mb-0" role="status" data-i18n="changelog.empty">
        No changelog content was generated.
      </div>
      <article v-else class="site-changelog-article" v-html="html" />
    </div>
  </div>
</template>
