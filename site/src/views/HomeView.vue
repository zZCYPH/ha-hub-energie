<script setup>
import { onMounted } from "vue";
import { setupScrollSpy } from "../siteShell";
import LandingFeaturesGrid from "./landing/LandingFeaturesGrid.vue";
import LandingHero from "./landing/LandingHero.vue";

onMounted(() => {
  setupScrollSpy(null);
});
</script>

<template>
  <div id="view-home" class="app-view site-page site-page--home">
    <LandingHero />
    <LandingFeaturesGrid />
  </div>
</template>
