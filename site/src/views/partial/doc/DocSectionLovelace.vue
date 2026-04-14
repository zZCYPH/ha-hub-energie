<script setup>
import { nextTick, ref, watch } from "vue";
import { applyLang, getLang } from "../../../siteShell";
import LovelaceCardDemoBlock from "./LovelaceCardDemoBlock.vue";

const showLovelaceTroubleshoot = ref(false);

/** Steps 2–3 mount with v-if; re-run i18n so new [data-i18n] nodes get text. */
watch(showLovelaceTroubleshoot, (open) => {
  if (open) nextTick(() => applyLang(getLang(), "doc"));
});
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

    <ol class="doc-steps">
      <li>
        <div class="doc-step-card shadow-sm">
          <span class="step-badge">1</span>
          <div class="step-body">
            <div class="step-title" data-i18n="lovelace.l1_title">Storage-mode dashboards (default)</div>
            <p class="small doc-config-muted mb-2" data-i18n-html="lovelace.l1"></p>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :aria-expanded="showLovelaceTroubleshoot"
              @click="showLovelaceTroubleshoot = !showLovelaceTroubleshoot"
            >
              <span v-show="!showLovelaceTroubleshoot" data-i18n="lovelace.troubleshoot_btn"></span>
              <span v-show="showLovelaceTroubleshoot" data-i18n="lovelace.troubleshoot_hide"></span>
            </button>
          </div>
        </div>
      </li>
      <li v-if="showLovelaceTroubleshoot">
        <div class="doc-step-card shadow-sm">
          <span class="step-badge">2</span>
          <div class="step-body">
            <div class="step-title" data-i18n="lovelace.l2_title">YAML-managed resources</div>
            <p class="small text-secondary mb-2" data-i18n="lovelace.l2_p">Add the boot URL yourself:</p>
            <pre class="doc-code"><code>resources:
  - url: /hub_energie/hub-energie-card-boot.js
    type: module</code></pre>
            <p class="small doc-config-muted mb-0" data-i18n-html="lovelace.l2_note"></p>
          </div>
        </div>
      </li>
      <li v-if="showLovelaceTroubleshoot">
        <div class="doc-step-card shadow-sm">
          <span class="step-badge">3</span>
          <div class="step-body">
            <div class="step-title" data-i18n="lovelace.l3_title">Add the card</div>
            <pre class="doc-code mb-0"><code>type: custom:hub-energie-card
# Optional: hide sections via card config</code></pre>
          </div>
        </div>
      </li>
    </ol>

    <h3 class="h5 mt-4 mb-2 doc-subsection" id="lovelace-showcase">
      <span data-i18n="lovelace.showcase_title">Dashboard card</span>
    </h3>
    <LovelaceCardDemoBlock />
  </section>
</template>
