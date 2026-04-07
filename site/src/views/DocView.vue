<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import docHtml from "../assets/doc-fragment.html?raw";
import {
  wireCarouselPair,
  wireDocCarouselImages,
  wireImageLightbox,
  wireTocMobile,
} from "../bootstrapDoc";
import { attachInPageNav } from "../inPageNav";
import { setupScrollSpy, teardownScrollSpy } from "../siteShell";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};

onMounted(() => {
  setupScrollSpy("doc");
  nextTick(() => {
    wireDocCarouselImages();
    wireCarouselPair("configFlowCarousel", "configFlowTree");
    wireCarouselPair("devicesGalleryCarousel", "devicesGalleryTree");
    wireImageLightbox();
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/doc");
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
});
</script>

<template>
  <div id="view-doc" class="app-view">
    <div ref="root" v-html="docHtml"></div>
  </div>
</template>
