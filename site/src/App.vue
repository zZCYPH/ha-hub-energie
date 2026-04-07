<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const base = import.meta.env.BASE_URL;
const route = useRoute();

const showToc = computed(
  () => route.name === "doc" || route.name === "internals",
);

const tocTarget = computed(() =>
  route.name === "internals" ? "#tocOffcanvasInternals" : "#tocOffcanvasDoc",
);

const tocControls = computed(() =>
  route.name === "internals" ? "tocOffcanvasInternals" : "tocOffcanvasDoc",
);

const navActive = (name) => route.name === name;
</script>

<template>
  <div id="spa-shell" class="landing-body" tabindex="0">
    <nav class="navbar navbar-expand-lg doc-navbar fixed-top">
      <div class="container-xxl px-3">
        <button
          v-show="showToc"
          type="button"
          class="btn btn-outline-secondary btn-sm me-2 flex-shrink-0"
          id="appTocBtn"
          data-bs-toggle="offcanvas"
          :data-bs-target="tocTarget"
          :aria-controls="tocControls"
        >
          <i class="bi bi-list-ul" aria-hidden="true"></i>
          <span class="d-none d-sm-inline ms-1" data-i18n="nav.contents">Contents</span>
        </button>
        <router-link
          class="navbar-brand fw-semibold d-flex align-items-center gap-2 text-decoration-none"
          id="appBrandHome"
          to="/"
        >
          <img
            :src="`${base}img/icon.png`"
            alt=""
            width="32"
            height="32"
            class="doc-brand-icon rounded-1"
            decoding="async"
          />
          Hub Énergie
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#appNavCollapse"
          aria-controls="appNavCollapse"
          aria-expanded="false"
          aria-label="Menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="appNavCollapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: navActive('home') }" to="/" end>
                <span data-i18n="nav.home">Home</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: navActive('doc') }" to="/doc">
                <span data-i18n="nav.documentation">Documentation</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: navActive('internals') }" to="/internals">
                <span data-i18n="nav.internals_short">Behind the scenes</span>
              </router-link>
            </li>
          </ul>
          <div
            class="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0 flex-wrap justify-content-lg-end"
          >
            <div
              class="btn-group btn-group-sm"
              role="group"
              id="langSwitch"
              data-i18n-aria="nav.lang_aria"
              aria-label="Language"
            >
              <button
                type="button"
                class="btn btn-outline-secondary px-2"
                data-lang="en"
                id="langEn"
                aria-pressed="true"
              >
                <span data-i18n="lang.en">EN</span>
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary px-2"
                data-lang="fr"
                id="langFr"
                aria-pressed="false"
              >
                <span data-i18n="lang.fr">FR</span>
              </button>
            </div>
            <div
              class="btn-group btn-group-sm"
              role="group"
              id="themeSwitch"
              data-i18n-aria="theme.group_aria"
              aria-label="Display theme"
            >
              <button
                type="button"
                class="btn btn-outline-secondary px-2"
                id="themeLight"
                aria-pressed="false"
                data-i18n-title="theme.light"
                title="Light"
              >
                <i class="bi bi-sun-fill" aria-hidden="true"></i>
                <span class="d-none d-md-inline ms-1" data-i18n="theme.light">Light</span>
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary px-2"
                id="themeDark"
                aria-pressed="false"
                data-i18n-title="theme.dark"
                title="Dark"
              >
                <i class="bi bi-moon-stars-fill" aria-hidden="true"></i>
                <span class="d-none d-md-inline ms-1" data-i18n="theme.dark">Dark</span>
              </button>
            </div>
            <a
              class="btn btn-outline-secondary btn-sm rounded-pill px-3"
              href="https://gitlab.com/zzcyph1/home-assistant/hub-energie"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="bi bi-gitlab me-1" aria-hidden="true"></i
              ><span data-i18n="nav.repository">Repository</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>
