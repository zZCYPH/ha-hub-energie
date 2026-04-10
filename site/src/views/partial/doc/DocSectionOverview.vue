<template>
  <section id="overview" class="doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="overview.title">Overview</span>
      <a
        class="doc-anchor text-secondary"
        href="#overview"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <p class="text-secondary small mb-2" data-i18n="overview.intro_lead"></p>
    <ul class="list-unstyled doc-quick-tour mb-4">
      <li class="d-flex gap-2 align-items-center mb-2">
        <i class="bi bi-download text-primary flex-shrink-0" aria-hidden="true"></i>
        <span class="text-secondary small" data-i18n="overview.intro_li_install"></span>
      </li>
      <li class="d-flex gap-2 align-items-center mb-2">
        <i class="bi bi-sliders text-primary flex-shrink-0" aria-hidden="true"></i>
        <span class="text-secondary small" data-i18n="overview.intro_li_configure"></span>
      </li>
      <li class="d-flex gap-2 align-items-center mb-2">
        <i class="bi bi-grid-3x3-gap text-primary flex-shrink-0" aria-hidden="true"></i>
        <span class="text-secondary small" data-i18n="overview.intro_li_devices"></span>
      </li>
      <li class="d-flex gap-2 align-items-center mb-2">
        <i class="bi bi-window-sidebar text-primary flex-shrink-0" aria-hidden="true"></i>
        <span class="text-secondary small" data-i18n="overview.intro_li_lovelace"></span>
      </li>
      <li class="d-flex gap-2 align-items-center">
        <i class="bi bi-diagram-3 text-primary flex-shrink-0" aria-hidden="true"></i>
        <span class="text-secondary small">
          <span data-i18n="overview.intro_li_internals_before"></span>
          <router-link class="text-body" to="/internals/" data-i18n="doc.hero_internals_cta"></router-link>
          <span data-i18n="overview.intro_li_internals_after"></span>
        </span>
      </li>
    </ul>

    <div class="accordion accordion-flush border rounded-3 overflow-hidden mb-4" id="accScope">
      <div class="accordion-item border-0 border-bottom">
        <h3 class="accordion-header">
          <button
            class="accordion-button collapsed fw-semibold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#scopeStable"
          >
            <i class="bi bi-shield-check text-success me-2"></i>
            <span data-i18n="scope.stable_heading">Intended stable scope (v0.0.x)</span>
          </button>
        </h3>
        <div id="scopeStable" class="accordion-collapse collapse" data-bs-parent="#accScope">
          <div class="accordion-body text-secondary small">
            <ul class="list-unstyled doc-scope-stable mb-0">
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li1_t"></span>
                <span data-i18n="scope.stable_li1_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li2_t"></span>
                <span data-i18n="scope.stable_li2_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li3_t"></span>
                <span data-i18n="scope.stable_li3_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li4_t"></span>
                <span data-i18n="scope.stable_li4_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li5_t"></span>
                <span data-i18n="scope.stable_li5_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li6_t"></span>
                <span data-i18n="scope.stable_li6_d"></span>
              </li>
              <li>
                <span class="fw-semibold text-body" data-i18n="scope.stable_li7_t"></span>
                <span data-i18n="scope.stable_li7_d"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="accordion-item border-0">
        <h3 class="accordion-header">
          <button
            class="accordion-button collapsed fw-semibold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#scopeExp"
          >
            <i class="bi bi-flask text-warning me-2"></i>
            <span data-i18n="scope.exp_heading">Experimental / best-effort</span>
          </button>
        </h3>
        <div id="scopeExp" class="accordion-collapse collapse" data-bs-parent="#accScope">
          <div class="accordion-body text-secondary small">
            <ul class="mb-0">
              <li data-i18n="scope.exp_li1">
                Power-flow battery charge origin split when sensors are partial or noisy.
              </li>
              <li data-i18n="scope.exp_li2">Solar production estimation (model-based, not a physical meter).</li>
              <li data-i18n="scope.exp_li3">Opportunity-cost style diagnostics for exported kWh.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info d-flex gap-2 small mb-0" role="status">
      <i class="bi bi-info-circle flex-shrink-0"></i>
      <div data-i18n="scope.disclaimer"></div>
    </div>
  </section>
</template>
