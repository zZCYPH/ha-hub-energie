<script setup>
import FlowSimulator from "../../../components/FlowSimulator.vue";
import { useDocFlowsimJumps } from "../../../composables/docFlowsimJumps";

const { jumpToOptionsFlowsim } = useDocFlowsimJumps();
</script>

<template>
  <section id="configure" class="site-doc-section-configure doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="configure.title">Configuration</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <div class="card border shadow-sm mb-3 mb-lg-4 doc-config-card">
      <div class="card-body py-3 px-3 px-lg-4">
        <div
          class="doc-config-blurb mb-3 pb-3 border-bottom border-secondary border-opacity-25"
          data-i18n-html="configure.flow_lead_1"
        ></div>
        <div
          class="doc-config-blurb mb-3 pb-3 border-bottom border-secondary border-opacity-25"
          data-i18n-html="configure.flow_lead_2"
        ></div>
        <div
          class="doc-config-blurb mb-3 pb-3 border-bottom border-secondary border-opacity-25"
          data-i18n-html="configure.after_install"
        ></div>
        <div class="doc-config-blurb mb-0" data-i18n-html="configure.flow_step_help"></div>
      </div>
    </div>

    <h3 class="h5 mt-2 mb-2 doc-subsection" id="configure-flow-simulator">
      <span data-i18n="configure.flow_simulator_h">Installation flow preview</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure-flow-simulator"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h3>
    <div class="site-doc-flow-simulator site-doc-flow-simulator--setup mb-4">
      <FlowSimulator mode="setup" />
    </div>

    <h3 class="h5 mt-2 mb-2 doc-subsection" id="configure-advanced">
      <span data-i18n="configure.advanced_h">Reconfigure / Advanced configuration</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure-advanced"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h3>
    <p class="doc-config-muted small mb-3" data-i18n-html="configure.advanced_intro"></p>
    <div class="site-doc-flowsim-jump-actions d-flex flex-wrap gap-2 mb-3">
      <button
        type="button"
        class="site-doc-flowsim-jump-btn btn btn-outline-primary btn-sm"
        @click="jumpToOptionsFlowsim('battery_pick')"
      >
        <span data-i18n="configure.advanced_btn_flowsim_batteries">Preview: Configure → Batteries (existing)</span>
      </button>
      <button
        type="button"
        class="site-doc-flowsim-jump-btn btn btn-outline-primary btn-sm"
        @click="jumpToOptionsFlowsim('reinjection')"
      >
        <span data-i18n="configure.advanced_btn_flowsim_reinjection">Preview: Configure → Reinjection tuning</span>
      </button>
      <button
        type="button"
        class="site-doc-flowsim-jump-btn btn btn-outline-primary btn-sm"
        @click="jumpToOptionsFlowsim('advanced_energy')"
      >
        <span data-i18n="configure.advanced_btn_flowsim_delta">Preview: Configure → Advanced — delta caps</span>
      </button>
    </div>
    <div class="site-doc-flow-simulator site-doc-flow-simulator--options mb-2">
      <FlowSimulator mode="options" />
    </div>
  </section>
</template>
