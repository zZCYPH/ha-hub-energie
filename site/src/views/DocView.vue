<script setup>
import { createApp, nextTick, onMounted, onUnmounted, ref } from "vue";
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
import InstallReleasePicker from "../components/InstallReleasePicker.vue";
import FlowSimulator from "../components/FlowSimulator.vue";
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
let flowSimApp = null;
let flowOptionsSimApp = null;

function bindFlowsimJumpButtons() {
  root.value?.querySelectorAll("[data-flowsim-jump]").forEach((el) => {
    el.addEventListener("click", () => {
      const stepId = el.getAttribute("data-flowsim-jump");
      if (!stepId) return;
      router
        .push({ name: "doc", hash: "#configure-flow-simulator" })
        .then(() =>
          nextTick(() => {
            window.dispatchEvent(new CustomEvent("hub-energie-flowsim-jump", { detail: { stepId } }));
          }),
        );
    });
  });
  root.value?.querySelectorAll("[data-options-flowsim-jump]").forEach((el) => {
    el.addEventListener("click", () => {
      const stepId = el.getAttribute("data-options-flowsim-jump");
      if (!stepId) return;
      router
        .push({ name: "doc", hash: "#configure-advanced" })
        .then(() =>
          nextTick(() => {
            window.dispatchEvent(new CustomEvent("hub-energie-options-flowsim-jump", { detail: { stepId } }));
          }),
        );
    });
  });
}

onMounted(() => {
  setupScrollSpy("doc");
  nextTick(() => {
    wireDocCarouselImages();
    wireCarouselPair("devicesGalleryCarousel", "devicesGalleryTree");
    wireImageLightbox();
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/doc");
    const mountEl = document.getElementById("hub-energie-install-release-mount");
    if (mountEl && !pickerApp) {
      pickerApp = createApp(InstallReleasePicker);
      pickerApp.mount(mountEl);
    }
    const simEl = document.getElementById("flow-simulator-mount");
    if (simEl && !flowSimApp) {
      flowSimApp = createApp(FlowSimulator, { mode: "setup" });
      flowSimApp.mount(simEl);
    }
    const optSimEl = document.getElementById("flow-options-simulator-mount");
    if (optSimEl && !flowOptionsSimApp) {
      flowOptionsSimApp = createApp(FlowSimulator, { mode: "options" });
      flowOptionsSimApp.mount(optSimEl);
    }
    bindFlowsimJumpButtons();
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
  if (pickerApp) {
    pickerApp.unmount();
    pickerApp = null;
  }
  if (flowSimApp) {
    flowSimApp.unmount();
    flowSimApp = null;
  }
  if (flowOptionsSimApp) {
    flowOptionsSimApp.unmount();
    flowOptionsSimApp = null;
  }
});
</script>

<template>
  <div id="view-doc" class="app-view">
    <div ref="root">
      <DocOffcanvas />
      <DocHero />
      <div class="container-xxl px-3 py-4 py-lg-5">
        <div class="row g-4 g-xl-5">
          <aside class="col-lg-3 d-none d-lg-block">
            <DocSidebarInner />
          </aside>
          <main class="col-lg-9">
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
