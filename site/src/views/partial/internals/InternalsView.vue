<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { wireTocMobile } from "../../../bootstrapDoc";
import { attachInPageNav } from "../../../inPageNav";
import { setupScrollSpy, teardownScrollSpy } from "../../../siteShell";
import InternalsDesktopSidebar from "./InternalsDesktopSidebar.vue";
import InternalsHero from "./InternalsHero.vue";
import InternalsMobileOffcanvas from "./InternalsMobileOffcanvas.vue";
import InternalsPageFooter from "./InternalsPageFooter.vue";
import InternalsSectionAttribution from "./InternalsSectionAttribution.vue";
import InternalsSectionDay from "./InternalsSectionDay.vue";
import InternalsSectionDeltaCaps from "./InternalsSectionDeltaCaps.vue";
import InternalsSectionDeltas from "./InternalsSectionDeltas.vue";
import InternalsSectionLts from "./InternalsSectionLts.vue";
import InternalsSectionOverview from "./InternalsSectionOverview.vue";
import InternalsSectionRebuild from "./InternalsSectionRebuild.vue";
import InternalsSectionSlots from "./InternalsSectionSlots.vue";
import InternalsSectionSources from "./InternalsSectionSources.vue";
import InternalsSectionSsot from "./InternalsSectionSsot.vue";
import InternalsSectionStore from "./InternalsSectionStore.vue";
import InternalsSectionTelemetry from "./InternalsSectionTelemetry.vue";

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
    <div ref="root">
      <InternalsMobileOffcanvas />
      <InternalsHero />
      <div class="container-xxl px-3 py-4 py-lg-5">
        <div class="row g-4 g-xl-5">
          <InternalsDesktopSidebar />
          <main class="col-lg-9">
            <InternalsSectionOverview />
            <InternalsSectionSsot />
            <InternalsSectionSources />
            <InternalsSectionSlots />
            <InternalsSectionAttribution />
            <InternalsSectionDeltas />
            <InternalsSectionDeltaCaps />
            <InternalsSectionDay />
            <InternalsSectionStore />
            <InternalsSectionLts />
            <InternalsSectionRebuild />
            <InternalsSectionTelemetry />
            <InternalsPageFooter />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
