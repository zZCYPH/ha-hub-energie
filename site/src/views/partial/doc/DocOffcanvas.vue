<template>
  <div
    class="offcanvas offcanvas-start"
    tabindex="-1"
    id="tocOffcanvasDoc"
    aria-labelledby="tocOffcanvasDocLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h2 class="offcanvas-title h5 mb-0" id="tocOffcanvasDocLabel" data-i18n="toc.on_this_page">
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
        id="toc-nav-doc-mobile"
        class="nav nav-pills flex-column gap-1"
        data-i18n-aria="nav.toc_aria"
        aria-label="Page"
      >
        <a class="nav-link" href="#/" data-bs-dismiss="offcanvas"><span data-i18n="nav.home">Home</span></a>
        <a class="nav-link" href="#/internals" data-bs-dismiss="offcanvas"
          ><span data-i18n="nav.internals">How it works behind the scenes</span></a
        >
        <hr class="border-secondary my-2 opacity-25" />
        <a class="nav-link" href="#overview" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.overview">Quick tour</span></a
        >
        <a class="nav-link" href="#install" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.install">Install</span></a
        >
        <a class="nav-link" href="#configure" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.configure">Configuration</span></a
        >
        <a class="nav-link small py-1 ps-3" href="#configure-flow-simulator" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.configure_flow_simulator">Flow preview (generated)</span></a
        >
        <a class="nav-link small py-1 ps-3" href="#configure-advanced" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.configure_advanced">Advanced configuration</span></a
        >
        <a class="nav-link" href="#lovelace" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.lovelace">Lovelace card</span></a
        >
        <a class="nav-link small py-1 ps-3" href="#lovelace-showcase" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.lovelace_showcase">Card preview</span></a
        >
        <a class="nav-link small py-1 ps-3" href="#lovelace-editor" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.lovelace_editor">Visual editor</span></a
        >
        <a class="nav-link" href="#devices" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.devices">Devices</span></a
        >
        <a class="nav-link small py-1 ps-3" href="#devices-gallery" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.devices_gallery">In Home Assistant</span></a
        >
        <a class="nav-link" href="#services" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.services">Services</span></a
        >
        <a class="nav-link" href="#limitations" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.limitations">Limitations</span></a
        >
        <a class="nav-link" href="#glossary" data-bs-dismiss="offcanvas"
          ><span data-i18n="toc.glossary">Glossary</span></a
        >
      </nav>
    </div>
  </div>
</template>
