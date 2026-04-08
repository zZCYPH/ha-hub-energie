<script setup>
import { createApp, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import docHtml from "../assets/doc-fragment.html?raw";
import InstallReleasePicker from "../components/InstallReleasePicker.vue";
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
let pickerApp = null;

onMounted(() => {
  setupScrollSpy("doc");
  nextTick(() => {
    wireDocCarouselImages();
    wireCarouselPair("configFlowCarousel", "configFlowTree");
    wireCarouselPair("configFlowCarouselApi", "configFlowTreeApi");
    wireCarouselPair("configFlowCarouselManual", "configFlowTreeManual");
    wireCarouselPair("configFlowCarouselOffers", "configFlowTreeOffers");
    wireCarouselPair("devicesGalleryCarousel", "devicesGalleryTree");
    wireImageLightbox();
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/doc");
    const mountEl = document.getElementById("hub-energie-install-release-mount");
    if (mountEl && !pickerApp) {
      pickerApp = createApp(InstallReleasePicker);
      pickerApp.mount(mountEl);
    }
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
  if (pickerApp) {
    pickerApp.unmount();
    pickerApp = null;
  }
});
</script>

<template>
  <div id="view-doc" class="app-view">
    <div ref="root" v-html="docHtml"></div>
  </div>
</template>
