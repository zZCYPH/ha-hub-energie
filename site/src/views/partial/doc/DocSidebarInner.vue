<template>
  <div class="doc-sidebar">
    <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="toc.on_this_page">
      On this page
    </div>
    <nav
      id="toc-nav-doc"
      class="nav nav-pills flex-column gap-1"
      role="navigation"
      data-i18n-aria="nav.toc_aria"
      aria-label="Page"
    >
      <a class="nav-link" href="#overview"><span data-i18n="toc.overview">Quick tour</span></a>
      <a class="nav-link" href="#install"><span data-i18n="toc.install">Install</span></a>
      <a class="nav-link" href="#configure"><span data-i18n="toc.configure">Configuration</span></a>
      <a class="nav-link small py-1 ps-3" href="#configure-flow-simulator"
        ><span data-i18n="toc.configure_flow_simulator">Flow preview (generated)</span></a
      >
      <a class="nav-link small py-1 ps-3" href="#configure-advanced"
        ><span data-i18n="toc.configure_advanced">Advanced configuration</span></a
      >
      <a class="nav-link small py-1 ps-3" href="#configure-options-simulator"
        ><span data-i18n="toc.configure_options_simulator">Configure (existing entry) preview</span></a
      >
      <a class="nav-link" href="#lovelace"><span data-i18n="toc.lovelace">Lovelace card</span></a>
      <a class="nav-link small py-1 ps-3" href="#lovelace-showcase"
        ><span data-i18n="toc.lovelace_showcase">Card preview</span></a
      >
      <a class="nav-link small py-1 ps-3" href="#lovelace-editor"
        ><span data-i18n="toc.lovelace_editor">Visual editor</span></a
      >
      <a class="nav-link" href="#devices"><span data-i18n="toc.devices">Devices</span></a>
      <a class="nav-link small py-1 ps-3" href="#devices-gallery"
        ><span data-i18n="toc.devices_gallery">In Home Assistant</span></a
      >
      <a class="nav-link" href="#services"><span data-i18n="toc.services">Services</span></a>
      <a class="nav-link" href="#limitations"><span data-i18n="toc.limitations">Limitations</span></a>
      <a class="nav-link" href="#glossary"><span data-i18n="toc.glossary">Glossary</span></a>
    </nav>
  </div>
</template>
