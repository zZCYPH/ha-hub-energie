<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import LovelaceCardsHero from "./partial/lovelace-cards/LovelaceCardsHero.vue";
import LovelaceCardsDesktopSidebar from "./partial/lovelace-cards/LovelaceCardsDesktopSidebar.vue";
import LovelaceCardsMobileOffcanvas from "./partial/lovelace-cards/LovelaceCardsMobileOffcanvas.vue";
import LovelaceCardDemoBlock from "./partial/doc/LovelaceCardDemoBlock.vue";
import DocFooter from "./partial/doc/DocFooter.vue";
import { wireTocMobile } from "../bootstrapDoc";
import { attachInPageNav } from "../inPageNav";
import { setupScrollSpy, teardownScrollSpy } from "../siteShell";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};

onMounted(() => {
  nextTick(() => {
    wireTocMobile();
    if (root.value) detachNav = attachInPageNav(root.value, router, "/lovelace-cards");
    setupScrollSpy("lovelace-cards");
  });
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
});
</script>

<template>
  <div id="view-lovelace-cards" class="app-view site-page site-page--doc">
    <LovelaceCardsMobileOffcanvas />
    <LovelaceCardsHero />
    <div ref="root" class="site-page__doc-root">
      <div class="site-page__doc-container container-xxl px-3 py-4 py-lg-5">
        <div class="site-page__doc-layout row g-4 g-xl-5">
          <LovelaceCardsDesktopSidebar />
          <main class="site-page__doc-main col-lg-9">
            <section id="lovelace-card-hub-energie" class="doc-section pb-5">
              <h2 class="mb-2">
                <span data-i18n="lovelace_cards.hub_energie_title">Hub Énergie dashboard card</span>
                <a
                  class="doc-anchor text-secondary"
                  href="#lovelace-card-hub-energie"
                  data-i18n-aria="section.link_aria"
                  aria-label="Link to section"
                  >#</a
                >
              </h2>
              <p class="text-secondary small mb-3" data-i18n="lovelace_cards.hub_energie_lead"></p>
              <LovelaceCardDemoBlock />
            </section>

            <section id="lovelace-card-flow-chart" class="doc-section pb-5">
              <h2 class="mb-2">
                <span data-i18n="lovelace_cards.flow_chart_title">Energy flow chart</span>
                <a
                  class="doc-anchor text-secondary"
                  href="#lovelace-card-flow-chart"
                  data-i18n-aria="section.link_aria"
                  aria-label="Link to section"
                  >#</a
                >
              </h2>
              <p class="text-secondary small mb-3" data-i18n="lovelace_cards.flow_chart_lead"></p>
              <div class="card border shadow-sm">
                <div class="card-body py-5 text-center text-secondary">
                  <span class="badge bg-secondary bg-opacity-25 text-body mb-2" data-i18n="lovelace_cards.flow_chart_soon"
                    >Coming soon</span
                  >
                </div>
              </div>
            </section>

            <DocFooter />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
