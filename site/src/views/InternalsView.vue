<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import internalsHtml from "../assets/internals-fragment.html?raw";
import { wireTocMobile } from "../bootstrapDoc";
import { attachInPageNav } from "../inPageNav";
import { setupScrollSpy, teardownScrollSpy } from "../siteShell";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};

onMounted(() => {
  setupScrollSpy("internals");
  nextTick(() => {
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/internals");
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
});
</script>

<template>
  <div id="view-internals" class="app-view">
    <div ref="root" v-html="internalsHtml"></div>
  </div>
</template>
