<script setup>
import { pathTo } from "../../sitePaths";
import { LANDING_FEATURE_ITEMS } from "./landingFeatures.js";
</script>

<template>
  <div class="site-landing-features container-xxl px-3 pb-5 landing-features">
    <div class="row g-4 g-lg-4">
      <div v-for="item in LANDING_FEATURE_ITEMS" :key="item.titleKey" class="col-md-6 col-lg-4">
        <div class="card h-100 border shadow-sm landing-feature-card">
          <div class="card-body">
            <div class="landing-icon-wrap text-primary mb-3">
              <i :class="['bi', item.icon, 'fs-3']" aria-hidden="true"></i>
            </div>
            <h2 class="h5 fw-semibold" :data-i18n="item.titleKey"></h2>
            <p class="text-secondary small mb-0" :data-i18n="item.bodyKey"></p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-5 pt-4 border-top">
      <a
        class="btn btn-primary btn-lg rounded-pill px-5 py-3 landing-discover shadow-sm"
        :href="pathTo('/showcase')"
        data-i18n="landing.cta_discover_footer"
        >Discover the documentation</a
      >
    </div>
  </div>
</template>
