<script setup>
import { pathTo } from "../../../sitePaths";
import { INTERNALS_TOC_ITEMS } from "./internalsToc.js";
</script>

<template>
  <aside class="col-lg-3 d-none d-lg-block">
    <div class="doc-sidebar">
      <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="toc.internals_title">
        On this page
      </div>
      <nav
        id="toc-nav-internals"
        class="nav nav-pills flex-column gap-1"
        role="navigation"
        data-i18n-aria="nav.toc_aria"
        aria-label="Page"
      >
        <a v-for="item in INTERNALS_TOC_ITEMS" :key="item.href" class="nav-link" :href="item.href">
          <span :data-i18n="item.labelKey"></span>
        </a>
      </nav>
      <div class="mt-4 pt-3 border-top small">
        <a :href="pathTo('/showcase')" class="link-secondary" data-i18n="internals.back_to_doc">Back to showcase</a>
      </div>
    </div>
  </aside>
</template>
