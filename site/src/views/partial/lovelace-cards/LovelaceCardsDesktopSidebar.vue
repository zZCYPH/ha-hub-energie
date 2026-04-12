<script setup>
import { pathTo } from "../../../sitePaths";
</script>

<template>
  <aside class="site-page__doc-sidebar col-lg-3 d-none d-lg-block">
    <div class="doc-sidebar">
      <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="toc.on_this_page">On this page</div>
      <a class="nav-link mb-2" :href="pathTo('/showcase') + '#lovelace'"
        ><span data-i18n="lovelace_cards.link_showcase_lovelace">Lovelace setup (showcase)</span></a
      >
      <nav
        id="toc-nav-lovelace-cards"
        class="nav nav-pills flex-column gap-1"
        role="navigation"
        data-i18n-aria="nav.toc_aria"
        aria-label="Page"
      >
        <a class="nav-link" href="#lovelace-card-hub-energie"
          ><span data-i18n="toc.lovelace_cards_hub_energie">Hub Énergie card</span></a
        >
      </nav>
    </div>
  </aside>
</template>
