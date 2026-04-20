<script setup>
import LovelaceCardDemoBlock from "./LovelaceCardDemoBlock.vue";
import { pathTo } from "../../../sitePaths";
</script>

<template>
  <section id="lovelace" class="doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="lovelace.title">Lovelace card</span>
      <a
        class="doc-anchor text-secondary"
        href="#lovelace"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <p class="text-secondary" data-i18n="lovelace.intro"></p>

    <h3 class="h5 mt-4 mb-2 doc-subsection" id="lovelace-showcase">
      <span data-i18n="lovelace.showcase_title">Dashboard card</span>
    </h3>
    <LovelaceCardDemoBlock />
    <p class="small text-secondary mt-2 mb-0">
      <span data-i18n="lovelace.after_showcase_lead"></span>
      <a :href="pathTo('/internals') + '#lovelace-resources'" class="link-secondary"
        ><span data-i18n="lovelace.after_showcase_anchor"></span></a
      >.
    </p>
  </section>
</template>
