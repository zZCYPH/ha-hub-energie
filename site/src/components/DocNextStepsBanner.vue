<script setup>
import { computed } from "vue";
import { pathTo } from "../sitePaths";

const steps = computed(() => [
  { n: 1, titleKey: "next_steps.s1_title", bodyKey: "next_steps.s1_body", href: pathTo("/showcase") + "#install" },
  { n: 2, titleKey: "next_steps.s2_title", bodyKey: "next_steps.s2_body", href: pathTo("/showcase") + "#configure" },
  { n: 3, titleKey: "next_steps.s3_title", bodyKey: "next_steps.s3_body", href: pathTo("/lovelace-cards") },
  { n: 4, titleKey: "next_steps.s4_title", bodyKey: "next_steps.s4_body", href: pathTo("/showcase") + "#devices" },
  { n: 5, titleKey: "next_steps.s5_title", bodyKey: "next_steps.s5_body", href: pathTo("/showcase") + "#services" },
]);
</script>

<template>
  <aside class="doc-next-steps card border-primary border-opacity-25 shadow-sm mb-4" aria-labelledby="doc-next-steps-heading">
    <div class="card-body py-3 px-3 px-lg-4">
      <h2 id="doc-next-steps-heading" class="h6 text-primary mb-1 d-flex align-items-center gap-2">
        <i class="bi bi-signpost-2" aria-hidden="true"></i>
        <span data-i18n="next_steps.title">Your first 5 minutes</span>
      </h2>
      <p class="small text-secondary mb-3" data-i18n="next_steps.intro"></p>
      <ol class="list-unstyled mb-0 doc-next-steps__list">
        <li v-for="s in steps" :key="s.n" class="doc-next-steps__item d-flex gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
          <span class="doc-next-steps__num flex-shrink-0 fw-bold text-primary">{{ s.n }}</span>
          <div class="min-w-0 flex-grow-1">
            <div class="fw-semibold text-body small mb-1" :data-i18n="s.titleKey"></div>
            <p class="small text-secondary mb-2" :data-i18n="s.bodyKey"></p>
            <a class="btn btn-sm btn-primary" :href="s.href">
              <span data-i18n="next_steps.cta">Go</span>
            </a>
          </div>
        </li>
      </ol>
    </div>
  </aside>
</template>

<style scoped>
.doc-next-steps__num {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--bs-primary) 18%, transparent);
  font-size: 0.85rem;
}

.doc-next-steps__item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>
