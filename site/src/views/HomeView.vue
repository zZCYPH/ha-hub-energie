<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { attachInPageNav } from "../inPageNav";
import { setupScrollSpy } from "../siteShell";
import LandingFeaturesGrid from "./landing/LandingFeaturesGrid.vue";
import LandingHero from "./landing/LandingHero.vue";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};

onMounted(() => {
  setupScrollSpy(null);
  nextTick(() => {
    if (root.value) detachNav = attachInPageNav(root.value, router, "/");
  });
});

onUnmounted(() => {
  detachNav();
});
</script>

<template>
  <div id="view-home" ref="root" class="app-view site-page site-page--home">
    <LandingHero />
    <LandingFeaturesGrid />
  </div>
</template>
