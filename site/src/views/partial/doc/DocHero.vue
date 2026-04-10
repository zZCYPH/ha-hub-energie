<script setup>
import DocShowcaseStrip from "./DocShowcaseStrip.vue";
import { pathTo } from "../../../sitePaths";
import { useManifestVersion } from "../../../useManifestVersion";

const { full } = useManifestVersion();
</script>

<template>
  <header class="site-doc-hero doc-hero pt-5 mt-5" id="top">
    <div class="site-doc-hero__inner container-xxl px-3 py-5">
      <div class="row g-4 align-items-center">
        <div class="col-lg-8">
          <p class="text-uppercase small fw-semibold text-primary mb-2 tracking-wide" data-i18n="hero.kicker">
            Home Assistant · Custom integration
          </p>
          <DocShowcaseStrip />
          <h1 class="display-6 fw-bold mb-3" data-i18n="hero.title">Energy monitoring, costs &amp; diagnostics</h1>
          <p class="lead text-secondary mb-3 mb-lg-0">
            <span data-i18n="hero.lead"></span>
            <code class="font-mono small">/hub_energie/</code>
          </p>
          <div class="mt-4">
            <a :href="pathTo('/internals')" class="btn btn-outline-primary btn-lg rounded-pill px-4 doc-internals-cta shadow-sm">
              <i class="bi bi-diagram-3 me-2" aria-hidden="true"></i>
              <span data-i18n="doc.hero_internals_cta">How it works behind the scenes</span>
            </a>
            <p class="small text-secondary mt-2 mb-0" data-i18n="doc.hero_internals_hint">
              Slot attribution, per-day buckets, Store, and long-term statistics — for readers who want the full
              pipeline.
            </p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card border shadow-sm">
            <div class="card-body">
              <h2 class="h6 text-secondary text-uppercase small mb-3" data-i18n="glance.title">At a glance</h2>
              <ul class="list-unstyled mb-0 small vstack gap-2">
                <li class="d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span data-i18n="glance.ha">HA 2024.10.0 or newer</span>
                </li>
                <li class="d-flex align-items-start gap-2">
                  <i class="bi bi-tag-fill text-primary mt-1"></i>
                  <span class="d-inline-flex align-items-center flex-wrap gap-1">
                    <span data-i18n="glance.snapshot_label">Doc snapshot</span>
                    <span v-if="full" class="badge bg-primary badge-doc">v{{ full }}</span>
                  </span>
                </li>
                <li class="d-flex align-items-start gap-2">
                  <i class="bi bi-bug-fill text-warning mt-1"></i>
                  <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/issues" data-i18n="glance.issues"
                    >Issues &amp; feedback</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
