<script setup>
import { nextTick, onMounted } from "vue";
import { applyLang, getLang } from "../siteShell";

onMounted(() => {
  nextTick(() => applyLang(getLang(), "developers"));
});
</script>

<template>
  <div id="view-developers" class="app-view">
    <div class="container-xxl px-3 py-4 py-lg-5">
      <header class="mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <h1 class="h2 mb-3" data-i18n="developers.title">Developers</h1>
        <p class="text-secondary mb-0" data-i18n="developers.intro"></p>
      </header>

      <section class="mb-4 pb-2">
        <h2 class="h5 mb-3" data-i18n="developers.flow_preview_h"></h2>
        <div class="small text-secondary flowhelp-step-prose" data-i18n-html="developers.flow_preview_body"></div>
      </section>

      <section class="mb-4">
        <h2 class="h5 mb-3" data-i18n="developers.flow_catalog_h"></h2>
        <div class="small text-secondary flowhelp-step-prose" data-i18n-html="developers.flow_catalog_body"></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.flowhelp-step-prose :deep(p) {
  margin-bottom: 0;
  line-height: 1.58;
}
</style>
