<script setup>
import { pathTo } from "../../../sitePaths";
import { INTERNALS_TOC_ITEMS } from "./internalsToc.js";
</script>

<template>
  <div
    class="site-internals-toc-offcanvas offcanvas offcanvas-start"
    tabindex="-1"
    id="tocOffcanvasInternals"
    aria-labelledby="tocOffcanvasInternalsLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h2 class="offcanvas-title h5 mb-0" id="tocOffcanvasInternalsLabel" data-i18n="toc.internals_title">
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
        id="toc-nav-internals-mobile"
        class="nav nav-pills flex-column gap-1"
        data-i18n-aria="nav.toc_aria"
        aria-label="Page"
      >
        <a class="nav-link" :href="pathTo('/')" data-bs-dismiss="offcanvas"
          ><span data-i18n="nav.home">Home</span></a
        >
        <a class="nav-link" :href="pathTo('/showcase')" data-bs-dismiss="offcanvas"
          ><span data-i18n="nav.showcase">Showcase</span></a
        >
        <hr class="border-secondary my-2 opacity-25" />
        <a
          v-for="item in INTERNALS_TOC_ITEMS"
          :key="item.href"
          class="nav-link"
          :href="item.href"
          data-bs-dismiss="offcanvas"
        >
          <span :data-i18n="item.labelKey"></span>
        </a>
      </nav>
    </div>
  </div>
</template>
