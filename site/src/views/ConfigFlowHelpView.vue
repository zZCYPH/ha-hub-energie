<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { FLOW_HELP_EN, FLOW_HELP_FR } from "../data/flowHelpContent";
import { FLOW_HELP_OPTIONS_IDS, FLOW_HELP_WIZARD_IDS } from "../data/flowStepHelpDefs";
import { attachInPageNav } from "../inPageNav";
import { applyLang, teardownScrollSpy } from "../siteShell";

const root = ref(null);
const router = useRouter();
let detachNav = () => {};
const langCode = ref("en");

function readLang() {
  try {
    const s = localStorage.getItem("hub-energie-doc-lang");
    if (s === "en" || s === "fr") return s;
  } catch {
    /* ignore */
  }
  return "en";
}

const bag = computed(() => (langCode.value === "fr" ? FLOW_HELP_FR : FLOW_HELP_EN));

function sectionHtml(id) {
  const b = bag.value[id];
  return b ? b.body_html : "";
}

function sectionTitle(id) {
  const b = bag.value[id];
  return b ? b.title : id;
}

function onLangEvt(e) {
  const d = e && e.detail && e.detail.lang;
  if (d === "en" || d === "fr") {
    langCode.value = d;
    nextTick(() => applyLang(d, "flowhelp"));
  }
}

onMounted(() => {
  langCode.value = readLang();
  nextTick(() => {
    applyLang(langCode.value, "flowhelp");
    if (root.value) detachNav = attachInPageNav(root.value, router, "/doc/setup-help");
  });
  window.addEventListener("hub-energie-lang", onLangEvt);
});

onUnmounted(() => {
  detachNav();
  teardownScrollSpy();
  window.removeEventListener("hub-energie-lang", onLangEvt);
});
</script>

<template>
  <div id="view-flowhelp" class="app-view">
    <div ref="root" class="container-xxl px-3 py-4 py-lg-5">
      <header class="mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <p class="text-uppercase small fw-semibold text-primary mb-2 tracking-wide" data-i18n="flowhelp.kicker">
          Home Assistant — config dialogs
        </p>
        <h1 class="h2 mb-3" data-i18n="flowhelp.title">Setup &amp; options — step help</h1>
        <p class="text-secondary mb-3" data-i18n-html="flowhelp.intro_html"></p>
        <p class="small text-secondary mb-0" data-i18n-html="flowhelp.link_convention_html"></p>
      </header>

      <div class="row g-4 g-xl-5">
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="doc-sidebar">
            <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="flowhelp.toc_setup">
              Initial setup
            </div>
            <nav id="toc-nav-flowhelp-setup" class="nav nav-pills flex-column gap-1 small" aria-label="Setup steps">
              <a
                v-for="rid in FLOW_HELP_WIZARD_IDS"
                :key="rid"
                class="nav-link py-1"
                :href="'#flow-step-' + rid"
              >
                {{ sectionTitle(rid) }}
              </a>
            </nav>
            <div class="small text-uppercase text-secondary fw-semibold mt-4 mb-2" data-i18n="flowhelp.toc_options">
              Configure menu
            </div>
            <nav id="toc-nav-flowhelp-options" class="nav nav-pills flex-column gap-1 small" aria-label="Options steps">
              <a
                v-for="rid in FLOW_HELP_OPTIONS_IDS"
                :key="rid"
                class="nav-link py-1"
                :href="'#flow-step-options-' + rid"
              >
                {{ sectionTitle("options_" + rid) }}
              </a>
            </nav>
            <router-link class="btn btn-sm btn-outline-secondary mt-4 w-100" to="/doc" data-i18n="flowhelp.back_doc">
              Back to documentation
            </router-link>
          </div>
        </aside>

        <main class="col-lg-9">
          <section class="mb-5">
            <h2 class="h5 mb-3" data-i18n="flowhelp.setup_heading">Initial setup wizard</h2>
            <article
              v-for="rid in FLOW_HELP_WIZARD_IDS"
              :id="'flow-step-' + rid"
              :key="'w-' + rid"
              class="doc-section pb-4 mb-4 border-bottom border-secondary border-opacity-10"
            >
              <h3 class="h5 mb-2">{{ sectionTitle(rid) }}</h3>
              <div class="small text-secondary flowhelp-body" v-html="sectionHtml(rid)"></div>
            </article>
          </section>

          <section class="mb-5">
            <h2 class="h5 mb-3" data-i18n="flowhelp.options_heading">Settings → Hub Énergie → Configure</h2>
            <article
              v-for="rid in FLOW_HELP_OPTIONS_IDS"
              :id="'flow-step-options-' + rid"
              :key="'o-' + rid"
              class="doc-section pb-4 mb-4 border-bottom border-secondary border-opacity-10"
            >
              <h3 class="h5 mb-2">{{ sectionTitle("options_" + rid) }}</h3>
              <div class="small text-secondary flowhelp-body" v-html="sectionHtml('options_' + rid)"></div>
            </article>
          </section>

          <p class="small text-secondary" data-i18n-html="flowhelp.footer_html"></p>
        </main>
      </div>
    </div>
  </div>
</template>
