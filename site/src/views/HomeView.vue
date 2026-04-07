<script setup>
import { onMounted } from "vue";
import { setupScrollSpy } from "../siteShell";
import landingHtml from "../assets/landing-body.html?raw";

onMounted(() => {
  setupScrollSpy(null);
});
</script>

<template>
  <div id="view-home" class="app-view">
    <div v-html="landingHtml"></div>
  </div>
</template>
