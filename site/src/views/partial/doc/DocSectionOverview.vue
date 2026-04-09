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
    <p class="text-secondary" data-i18n="overview.intro">
      This page is a guided companion to the README. Use the steps below in order when setting up for the first
      time.
    </p>

    <div class="accordion accordion-flush border rounded-3 overflow-hidden mb-4" id="accScope">
      <div class="accordion-item border-0 border-bottom">
        <h3 class="accordion-header">
          <button class="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#scopeStable">
            <i class="bi bi-shield-check text-success me-2"></i>
            <span data-i18n="scope.stable_heading">Intended stable scope (v0.0.x)</span>
          </button>
        </h3>
        <div id="scopeStable" class="accordion-collapse collapse show" data-bs-parent="#accScope">
          <div class="accordion-body text-secondary small">
            <ul class="mb-0">
              <li data-i18n="scope.stable_li1"></li>
              <li data-i18n="scope.stable_li2"></li>
              <li data-i18n="scope.stable_li3"></li>
              <li data-i18n="scope.stable_li4"></li>
              <li data-i18n="scope.stable_li5"></li>
              <li data-i18n="scope.stable_li6"></li>
              <li data-i18n="scope.stable_li7"></li>
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
