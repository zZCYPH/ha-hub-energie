<script setup>
import LandingHeroCables from "./LandingHeroCables.vue";
import { pathTo } from "../../sitePaths";

const base = import.meta.env.BASE_URL;

/** Service Desk / feedback alias — opens the visitor's mail client (mailto). */
const feedbackMailto =
  "mailto:feedback@hub-energie.ts-devops.com?subject=" +
  encodeURIComponent("Hub Énergie — feedback");
</script>

<template>
  <header class="site-landing-hero landing-hero position-relative overflow-hidden">
    <LandingHeroCables />
    <div class="landing-hero-glow" aria-hidden="true"></div>
    <div class="container-xxl landing-hero-content px-3 pt-5 mt-5 pb-5 position-relative">
      <div class="row justify-content-center">
        <div class="col-xl-10 col-lg-11 text-center">
          <p
            class="text-uppercase site-landing-kicker small fw-semibold text-primary mb-3 tracking-wide"
            data-i18n="landing.kicker"
          >
            Hub Énergie · Home Assistant custom integration
          </p>
          <div class="mb-4 d-flex justify-content-center">
            <a
              :href="pathTo('/showcase')"
              class="landing-integration-badge text-decoration-none d-inline-flex align-items-center gap-3"
              data-i18n-aria="landing.hero_badge_aria"
            >
              <img
                :src="`${base}img/icon.png`"
                alt=""
                width="48"
                height="48"
                class="landing-hero-brand-icon rounded-2 flex-shrink-0"
                decoding="async"
                data-i18n-alt="landing.hero_badge_alt"
              />
              <span class="text-start lh-sm">
                <span class="d-block fw-bold text-body landing-hero-badge-title fs-5" data-i18n="landing.hero_badge_title"
                  >Hub Énergie</span
                >
                <span class="d-block small text-secondary landing-hero-badge-sub" data-i18n="landing.hero_badge_sub"
                  >Custom integration for Home Assistant</span
                >
              </span>
            </a>
          </div>
          <h1 class="display-4 fw-bold mb-4 landing-title" data-i18n="landing.headline">
            Centralize your home’s energy data
          </h1>
          <div class="landing-hero-lead-panel mb-5">
            <p class="lead mb-0 landing-lead" data-i18n="landing.lead">
              One integration ties your tariff, meters, solar, batteries, costs, and diagnostics together — configure
              once and get a consistent view in Home Assistant.
            </p>
          </div>
          <div
            class="d-flex flex-column flex-sm-row flex-wrap align-items-stretch align-items-sm-center justify-content-center gap-3 mb-5"
          >
            <a
              class="btn btn-primary btn-lg rounded-pill px-5 py-3 landing-discover shadow"
              :href="pathTo('/showcase')"
              data-i18n="landing.cta_discover"
              >Discover</a
            >
            <a class="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3" :href="pathTo('/internals')" data-i18n="landing.cta_internals"
              >How it works internally</a
            >
            <div class="dropdown">
              <button
                type="button"
                class="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3 dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-i18n="landing.cta_feedback"
                data-i18n-aria="landing.cta_feedback_aria"
              >
                Give us your feedback
              </button>
              <ul class="dropdown-menu dropdown-menu-end text-start">
                <li>
                  <a
                    class="dropdown-item"
                    href="https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/work_items"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-i18n="landing.cta_feedback_gitlab"
                    >GitLab — sign in and create a work item</a
                  >
                </li>
                <li>
                  <a class="dropdown-item" :href="feedbackMailto" data-i18n="landing.cta_feedback_email"
                    >Email feedback (Service Desk)</a
                  >
                </li>
              </ul>
            </div>
          </div>
          <p class="small text-secondary mb-0 landing-hero-version" data-i18n="landing.version_note"></p>
        </div>
      </div>
    </div>
  </header>
</template>
