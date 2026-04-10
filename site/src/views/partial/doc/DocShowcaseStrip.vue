<script setup>
import { pathTo } from "../../../sitePaths";

const gitlabRepo = "https://gitlab.com/zzcyph1/home-assistant/hub-energie";
const gitlabReleases = `${gitlabRepo}/-/releases`;
</script>

<template>
  <section
    class="showcase-value-strip card border border-primary border-opacity-25 shadow-sm mb-4"
    aria-labelledby="showcase-strip-title"
  >
    <div class="card-body py-3 px-3 px-lg-4">
      <h2 id="showcase-strip-title" class="h6 fw-semibold text-body mb-3" data-i18n="showcase.strip_title">
        What you’ll find here
      </h2>
      <ul class="small text-secondary mb-3 ps-3 d-grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr))">
        <li class="mb-0" data-i18n="showcase.strip_b1">Install paths and release downloads</li>
        <li class="mb-0" data-i18n="showcase.strip_b2">Interactive config-flow preview (setup &amp; configure)</li>
        <li class="mb-0" data-i18n="showcase.strip_b3">Lovelace card, devices, services, and honest limitations</li>
      </ul>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <a class="btn btn-primary btn-sm rounded-pill px-3" :href="pathTo('/showcase') + '#install'" data-i18n="showcase.cta_install"
          >Install</a
        >
        <a
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
          :href="pathTo('/showcase') + '#configure-flow-simulator'"
          data-i18n="showcase.cta_preview"
          >Live setup preview</a
        >
        <a
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
          :href="pathTo('/doc/setup-help')"
          data-i18n="showcase.cta_step_help"
          >Step-by-step dialog help</a
        >
        <a
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
          :href="gitlabReleases"
          target="_blank"
          rel="noopener noreferrer"
          data-i18n="showcase.cta_releases"
          >GitLab releases</a
        >
      </div>
    </div>
  </section>
</template>
