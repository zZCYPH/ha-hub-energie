<template>
  <section id="configure" class="doc-section pb-5">
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
    <div class="card border shadow-sm mb-3 mb-lg-4">
      <div class="card-body py-3 px-3 px-lg-4">
        <div class="doc-config-blurb text-secondary small mb-3 pb-3 border-bottom border-secondary border-opacity-25">
          <span data-i18n="configure.flow_lead_1"></span>
        </div>
        <div class="doc-config-blurb text-secondary small mb-3 pb-3 border-bottom border-secondary border-opacity-25">
          <span data-i18n="configure.flow_lead_2"></span>
        </div>
        <div class="doc-config-blurb text-secondary small mb-3 pb-3 border-bottom border-secondary border-opacity-25">
          <span data-i18n="configure.after_install"></span>
        </div>
        <div class="doc-config-blurb text-secondary small mb-0">
          <span data-i18n="configure.flow_step_help"></span>
        </div>
      </div>
    </div>

    <h3 class="h5 mt-2 mb-2 doc-subsection" id="configure-flow-simulator">
      <span data-i18n="configure.flow_simulator_h">Interactive flow preview</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure-flow-simulator"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h3>
    <p class="text-secondary small mb-2" data-i18n="configure.flow_simulator_intro_user"></p>
    <details class="doc-maintainer-details small text-secondary mb-3">
      <summary class="mb-2 user-select-none" data-i18n="configure.flow_simulator_maintainers_summary"></summary>
      <p class="mb-0 ps-1 border-start border-secondary border-opacity-25" data-i18n="configure.flow_simulator_maintainers"></p>
    </details>
    <div id="flow-simulator-mount" class="mb-4"></div>

    <h3 class="h5 mt-2 mb-2 doc-subsection" id="configure-advanced">
      <span data-i18n="configure.advanced_h">Advanced configuration</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure-advanced"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h3>
    <p class="text-secondary small mb-2" data-i18n="configure.advanced_intro"></p>
    <p class="text-secondary small mb-3" data-i18n="configure.options_simulator_intro"></p>
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button type="button" class="btn btn-outline-primary btn-sm" data-options-flowsim-jump="battery_pick">
        <span data-i18n="configure.advanced_btn_flowsim_batteries">Preview: Configure → Batteries (existing)</span>
      </button>
      <button type="button" class="btn btn-outline-primary btn-sm" data-options-flowsim-jump="reinjection">
        <span data-i18n="configure.advanced_btn_flowsim_reinjection">Preview: Configure → Reinjection tuning</span>
      </button>
      <button type="button" class="btn btn-outline-primary btn-sm" data-options-flowsim-jump="advanced_energy">
        <span data-i18n="configure.advanced_btn_flowsim_delta">Preview: Configure → Advanced — delta caps</span>
      </button>
      <a class="btn btn-outline-secondary btn-sm" href="#/internals#internals-delta-caps" role="button">
        <span data-i18n="configure.advanced_btn_internals_delta">Energy delta caps (implementation notes)</span>
      </a>
    </div>
    <h4 class="h6 mt-1 mb-2 doc-subsection" id="configure-options-simulator">
      <span data-i18n="toc.configure_options_simulator">Configure (existing entry) preview</span>
      <a
        class="doc-anchor text-secondary"
        href="#configure-options-simulator"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h4>
    <div id="flow-options-simulator-mount" class="mb-2"></div>
  </section>
</template>
