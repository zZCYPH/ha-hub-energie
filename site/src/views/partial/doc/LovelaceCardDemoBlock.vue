<script setup>
import { ref } from "vue";
import LovelaceCardShowcase from "./LovelaceCardShowcase.vue";

/** Same semantics as HA: omitted keys mean “visible”. */
const cardConfig = ref({ type: "custom:hub-energie-card" });
</script>

<template>
  <figure class="doc-figure doc-figure--photo card mt-2">
    <div class="doc-screenshot-frame doc-screenshot-frame--full position-relative bg-body-secondary">
      <div class="doc-lovelace-showcase-wrap p-2 p-md-3">
        <LovelaceCardShowcase v-model:card-config="cardConfig" />
      </div>
    </div>
    <figcaption class="card-body py-2 px-3 small text-secondary mb-0" data-i18n="lovelace.fig_cap"></figcaption>
  </figure>
</template>
