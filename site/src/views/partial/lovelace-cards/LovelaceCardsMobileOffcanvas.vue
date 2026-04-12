<script setup>
import { pathTo } from "../../../sitePaths";
</script>

<template>
  <div
    class="site-doc-toc-offcanvas offcanvas offcanvas-start"
    tabindex="-1"
    id="tocOffcanvasLovelaceCards"
    aria-labelledby="tocOffcanvasLovelaceCardsLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h2 class="offcanvas-title h5 mb-0" id="tocOffcanvasLovelaceCardsLabel" data-i18n="toc.on_this_page">
        On this page
      </h2>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        data-i18n-aria="nav.close_aria"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <nav
        id="toc-nav-lovelace-cards-mobile"
        class="nav nav-pills flex-column gap-1"
        data-i18n-aria="nav.toc_aria"
        aria-label="Page"
      >
        <a class="nav-link" :href="pathTo('/')" data-bs-dismiss="offcanvas"><span data-i18n="nav.home">Home</span></a>
        <a class="nav-link" :href="pathTo('/showcase')" data-bs-dismiss="offcanvas"
          ><span data-i18n="nav.showcase">Showcase</span></a
        >
        <a class="nav-link" :href="pathTo('/internals')" data-bs-dismiss="offcanvas"
          ><span data-i18n="nav.internals_short">Internals</span></a
        >
        <hr class="border-secondary my-2 opacity-25" />
        <a class="nav-link" :href="pathTo('/showcase') + '#lovelace'" data-bs-dismiss="offcanvas"
          ><span data-i18n="lovelace_cards.link_showcase_lovelace">Lovelace setup (showcase)</span></a
        >
        <a class="nav-link" href="#lovelace-card-hub-energie" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.lovelace_cards_hub_energie">Hub Énergie card</span></a
        >
        <a class="nav-link" href="#lovelace-card-flow-chart" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.lovelace_cards_flow_chart">Flow chart</span></a
        >
      </nav>
    </div>
  </div>
</template>
