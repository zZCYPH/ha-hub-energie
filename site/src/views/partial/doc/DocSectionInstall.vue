<script setup>
import InstallReleasePicker from "../../../components/InstallReleasePicker.vue";

/** GitHub mirror used for HACS custom repository + release ZIPs (keep in sync with README). */
const HACS_REPO_URL = "https://github.com/zZCYPH/ha-hub-energie";
</script>

<template>
  <section id="install" class="site-doc-section-install doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="install.title">Installation</span>
      <a
        class="doc-anchor text-secondary"
        href="#install"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <p class="text-secondary">
      <span data-i18n="install.intro_before"></span>
      <strong class="text-body" data-i18n="install.intro_emphasis">exactly</strong>
      <span data-i18n="install.intro_after"></span>
    </p>
    <p class="small text-secondary border-start border-primary border-3 ps-3 py-1 mb-3" data-i18n="install.reassurance_friction"></p>
    <pre class="doc-code"><code>&lt;config&gt;/custom_components/hub_energie/</code></pre>
    <p class="text-secondary small">
      <span data-i18n="install.note_before"></span>
      <code class="font-mono">custom_components/hub_energie/manifest.json</code>
      <span data-i18n="install.note_between"></span>
      <code class="font-mono">hub_energie/hub_energie/</code>
      <span data-i18n="install.note_after"></span>
    </p>

    <h3 class="h5 mt-4 mb-3">
      <i class="bi bi-download text-primary me-2"></i><span data-i18n="install.choose_path">Choose your path</span>
    </h3>
    <ul class="nav nav-tabs mb-3 flex-nowrap overflow-x-auto overflow-y-hidden" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active text-nowrap"
          id="tab-hacs"
          data-bs-toggle="tab"
          data-bs-target="#pane-hacs"
          type="button"
          role="tab"
        >
          <span data-i18n="tab.hacs_store">HACS</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link text-nowrap"
          id="tab-zip"
          data-bs-toggle="tab"
          data-bs-target="#pane-zip"
          type="button"
          role="tab"
        >
          <span data-i18n="tab.zip">ZIP download</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link text-nowrap"
          id="tab-git"
          data-bs-toggle="tab"
          data-bs-target="#pane-git"
          type="button"
          role="tab"
        >
          <span data-i18n="tab.git">Git clone</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link text-nowrap"
          id="tab-copy"
          data-bs-toggle="tab"
          data-bs-target="#pane-copy"
          type="button"
          role="tab"
        >
          <span data-i18n="tab.copy">Copy files</span>
        </button>
      </li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="pane-hacs" role="tabpanel">
        <ol class="doc-steps">
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">1</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.hacs.s1_title">Add the GitHub repository</div>
                <p class="small text-secondary mb-2" data-i18n-html="install.hacs.s1_p_html"></p>
                <pre class="doc-code mt-2 mb-0"><code>{{ HACS_REPO_URL }}</code></pre>
                <p class="small text-secondary mb-0 mt-2" data-i18n-html="install.hacs.s1_after_html"></p>
              </div>
            </div>
          </li>
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">2</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.hacs.s2_title">Install from HACS</div>
                <p class="small text-secondary mb-0" data-i18n-html="install.hacs.s2_p_html"></p>
              </div>
            </div>
          </li>
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">3</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.hacs.s3_title">Restart &amp; add the integration</div>
                <p class="small text-secondary mb-0">
                  <span data-i18n="install.hacs.s3_p_before"></span>
                  <a href="#configure" data-i18n="install.hacs.s3_p_link"></a>
                  <span data-i18n="install.hacs.s3_p_after"></span>
                </p>
              </div>
            </div>
          </li>
        </ol>
        <p class="small text-secondary border-start border-primary border-3 ps-3 py-1 mb-0 mt-3" data-i18n-html="install.hacs.note_html"></p>
      </div>
      <div
        class="tab-pane fade"
        id="pane-zip"
        role="tabpanel"
        data-i18n-aria="install.release_aria"
      >
        <div class="doc-step-card doc-step-card--zip shadow-sm mb-3">
          <div class="step-body d-flex flex-column gap-4">
            <p class="small text-secondary mb-0 lh-lg">
              <span data-i18n="install.zip_intro_1"></span>
              <code class="font-mono">configuration.yaml</code>
              <span data-i18n="install.zip_intro_2"></span>
            </p>
            <div class="flex-shrink-0">
              <InstallReleasePicker />
            </div>
            <p class="small text-secondary mb-0 lh-lg" data-i18n-html="install.zip_footer_html"></p>
          </div>
        </div>
      </div>
      <div class="tab-pane fade" id="pane-git" role="tabpanel">
        <ol class="doc-steps">
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">1</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.git.s1_title">Clone into the right folder</div>
                <pre class="doc-code mt-2 mb-0"><code>git clone {{ HACS_REPO_URL }} hub-energie-src
cp -a hub-energie-src/custom_components/hub_energie /path/to/homeassistant/config/custom_components/hub_energie</code></pre>
              </div>
            </div>
          </li>
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">2</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.git.s2_title">Restart &amp; add the integration</div>
                <p class="small text-secondary mb-0">
                  <span data-i18n="install.git.s2_p_before"></span>
                  <a href="#configure" data-i18n="install.git.s2_p_link"></a>
                  <span data-i18n="install.git.s2_p_after"></span>
                </p>
              </div>
            </div>
          </li>
        </ol>
      </div>
      <div class="tab-pane fade" id="pane-copy" role="tabpanel">
        <ol class="doc-steps">
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">1</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.copy.s1_title">Copy the full tree</div>
                <p class="small text-secondary mb-0">
                  <span data-i18n="install.copy.s1_a"></span>
                  <code class="font-mono">custom_components/hub_energie/</code>
                  <span data-i18n="install.copy.s1_b"></span>
                  <code class="font-mono">config/custom_components/hub_energie/</code>
                  <span data-i18n="install.copy.s1_c"></span>
                </p>
              </div>
            </div>
          </li>
          <li>
            <div class="doc-step-card shadow-sm">
              <span class="step-badge">2</span>
              <div class="step-body">
                <div class="step-title" data-i18n="install.copy.s2_title">Restart &amp; add the integration</div>
                <p class="small text-secondary mb-0">
                  <span data-i18n="install.copy.s2_p_before"></span>
                  <a href="#configure" data-i18n="install.copy.s2_p_link"></a>
                  <span data-i18n="install.copy.s2_p_after"></span>
                </p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <div class="card border-warning border-opacity-50 mt-4">
      <div class="card-body d-flex flex-column gap-3">
        <h3 class="h6 card-title d-flex align-items-center gap-2 mb-0">
          <i class="bi bi-puzzle text-warning"></i>
          <span data-i18n="install.lovelace_title">If you use the Lovelace card</span>
        </h3>
        <p class="card-text small text-secondary mb-0 lh-lg">
          <span data-i18n="install.lovelace_p1"></span>
        </p>
        <p class="card-text small text-secondary mb-0 lh-lg">
          <span data-i18n="install.lovelace_p2_before"></span>
          <code class="font-mono">manifest.json</code>
          <span data-i18n="install.lovelace_body_arrow"></span>
          <code class="font-mono">version</code>
          <span data-i18n="install.lovelace_p2_after"></span>
        </p>
        <p class="card-text small text-muted mb-0 lh-lg">
          <strong class="text-body" data-i18n="install.lovelace_dev_label"></strong>
          <span data-i18n="install.lovelace_dev_rest"></span>
        </p>
      </div>
    </div>
  </section>
</template>
