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
    <p class="text-secondary mb-3" data-i18n="configure.flow_lead"></p>
    <p class="text-secondary mb-3" data-i18n="configure.after_install"></p>
    <p class="small text-secondary mb-3 mb-lg-4" data-i18n="configure.flow_step_help"></p>
    <div class="card border mb-4 shadow-sm">
      <div class="card-body">
        <h3 class="h6 card-title" data-i18n="configure.flow_map_title">How the config flow branches</h3>
        <ul class="small text-secondary mb-0 ps-3">
          <li data-i18n="configure.flow_map_li1"></li>
          <li data-i18n="configure.flow_map_li2"></li>
          <li data-i18n="configure.flow_map_li3"></li>
          <li data-i18n="configure.flow_map_li4"></li>
          <li data-i18n="configure.flow_map_li5"></li>
        </ul>
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
    <p class="text-secondary small mb-3" data-i18n="configure.flow_simulator_intro"></p>
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
    <p class="text-secondary small mb-3" data-i18n="configure.advanced_intro"></p>
    <div class="d-flex flex-wrap gap-2 mb-2">
      <button type="button" class="btn btn-outline-primary btn-sm" data-flowsim-jump="battery_pick">
        <span data-i18n="configure.advanced_btn_flowsim_batteries">Preview: Configure → Batteries (existing)</span>
      </button>
      <a class="btn btn-outline-secondary btn-sm" href="#/internals#internals-delta-caps" role="button">
        <span data-i18n="configure.advanced_btn_internals_delta">Energy delta caps (implementation notes)</span>
      </a>
    </div>
  </section>
</template>
