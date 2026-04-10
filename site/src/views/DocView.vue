<script setup>
import { nextTick, onMounted, onUnmounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import DocOffcanvas from "./partial/doc/DocOffcanvas.vue";
import DocHero from "./partial/doc/DocHero.vue";
import DocSidebarInner from "./partial/doc/DocSidebarInner.vue";
import DocSectionOverview from "./partial/doc/DocSectionOverview.vue";
import DocSectionInstall from "./partial/doc/DocSectionInstall.vue";
import DocSectionConfigure from "./partial/doc/DocSectionConfigure.vue";
import DocSectionLovelace from "./partial/doc/DocSectionLovelace.vue";
import DocSectionDevices from "./partial/doc/DocSectionDevices.vue";
import DocSectionServices from "./partial/doc/DocSectionServices.vue";
import DocSectionLimitations from "./partial/doc/DocSectionLimitations.vue";
import DocFooter from "./partial/doc/DocFooter.vue";
import DocImageModal from "./partial/doc/DocImageModal.vue";
import {
  wireCarouselPair,
  wireDocCarouselImages,
  wireImageLightbox,
  wireTocMobile,
} from "../bootstrapDoc";
import { DOC_FLOWSIM_JUMPS_KEY, createDocFlowsimJumpHandlers } from "../composables/docFlowsimJumps";
import { attachInPageNav } from "../inPageNav";
import { setupScrollSpy, teardownScrollSpy } from "../siteShell";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};

provide(DOC_FLOWSIM_JUMPS_KEY, createDocFlowsimJumpHandlers(router));

onMounted(() => {
  nextTick(() => {
    wireDocCarouselImages();
    wireCarouselPair("devicesGalleryCarousel", "devicesGalleryTree");
    wireImageLightbox();
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/doc");
    setupScrollSpy("doc");
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
});
</script>

<template>
  <div id="view-doc" class="app-view site-page site-page--doc">
    <div ref="root" class="site-page__doc-root">
      <DocOffcanvas />
      <DocHero />
      <div class="site-page__doc-container container-xxl px-3 py-4 py-lg-5">
        <div class="site-page__doc-layout row g-4 g-xl-5">
          <aside class="site-page__doc-sidebar col-lg-3 d-none d-lg-block">
            <DocSidebarInner />
          </aside>
          <main class="site-page__doc-main col-lg-9">
            <DocSectionOverview />
            <DocSectionInstall />
            <DocSectionConfigure />
            <DocSectionLovelace />
            <DocSectionDevices />
            <DocSectionServices />
            <DocSectionLimitations />
            <DocFooter />
          </main>
        </div>
      </div>
      <DocImageModal />
    </div>
  </div>
</template>
