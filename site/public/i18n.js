/**
 * Hub Énergie documentation — static i18n (en / fr).
 * Loaded by public pages (index, doc/index, internals/index); keys via data-i18n / data-i18n-html.
 *
 * Version placeholders (expanded from `custom_components/hub_energie/manifest.json` when generating
 * `site/src/vendor/hub-energie-i18n.js` — run `npm run prebuild` / `predev` in `site/`):
 *   {{HUB_ENERGIE_VERSION}}         — full semver, e.g. 0.3.2
 *   {{HUB_ENERGIE_VERSION_SERIES}}  — major.minor, e.g. 0.3 (for “v0.3.x” scope lines)
 */
(function (global) {
  "use strict";

  global.HubEnergieI18n = {
    en: {
      "meta.title": "Hub Énergie — Documentation",
      "meta.description":
        "Hub Énergie — a Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.",
      "meta.title.landing": "Hub Énergie — Home energy, centralized",
      "meta.description.landing":
        "Hub Énergie — a single Home Assistant integration for tariffs, energy, costs, solar, batteries, and diagnostics.",
      "meta.title.internals": "Hub Énergie — Behind the scenes",
      "meta.description.internals":
        "How Hub Énergie assigns kWh to tariff slots, persists state, and writes Home Assistant long-term statistics.",
      "meta.title.flowhelp": "Hub Énergie — Config step help",
      "meta.description.flowhelp":
        "Short on-page help for each Home Assistant setup and Configure dialog step (Hub Énergie), with stable links from the integration UI.",

      "nav.home": "Home",
      "nav.documentation": "Documentation",
      "nav.internals": "Implementation details",
      "nav.internals_short": "Internals",
      "nav.home_assistant_site_aria": "Home Assistant — official website (opens in a new tab)",

      "doc.hero_internals_cta": "Implementation details",
      "doc.hero_internals_hint":
        "Slot attribution, per-day buckets, the Store file, and long-term statistics — for readers who want the full pipeline.",

      "landing.kicker": "Hub Énergie · Home Assistant custom integration",
      "landing.ha_logo_alt": "Home Assistant",
      "landing.hero_badge_title": "Hub Énergie",
      "landing.hero_badge_sub":
        "Custom integration for Home Assistant — tariff, meters, solar, batteries & costs",
      "landing.hero_badge_alt": "Hub Énergie",
      "landing.hero_badge_aria": "Open Hub Énergie documentation",
      "landing.headline": "Centralize your home’s energy data",
      "landing.lead_html":
        "One integration ties your tariff, meters, solar, batteries, costs, and diagnostics together — configure once and get a consistent view in Home Assistant.",
      "landing.cta_discover": "Discover",
      "landing.cta_internals": "How it works internally",
      "landing.cta_discover_footer": "Discover the documentation",
      "landing.version_note": "Documentation snapshot v{{HUB_ENERGIE_VERSION}}",
      "landing.f1_title": "True centralization",
      "landing.f1_body":
        "Tariff, grid, solar, per-battery devices, energy balance, costs, and diagnostics live under one integration instead of scattered helpers and templates.",
      "landing.f2_title": "Tariff-aware accounting",
      "landing.f2_body":
        "Positive deltas from your kWh meters are split across tariff slots (including EDF Tempo) using explicit resolution rules, with fallbacks and visibility when signals are missing.",
      "landing.f3_title": "Costs tied to usage",
      "landing.f3_body":
        "Daily estimates, subscription allocation, and per-slot detail stay aligned with the same snapshot the Lovelace card reads.",
      "landing.f4_title": "Durable history",
      "landing.f4_body":
        "Internal SSOT sensors reflect running totals; each completed calendar day (Europe/Paris) is written to long-term statistics for analytics and graphs.",
      "landing.f5_title": "Card included",
      "landing.f5_body":
        "A maintained Lovelace bundle is served from your Home Assistant instance at /hub_energie/ — no separate frontend to host.",
      "landing.f6_title": "Honest diagnostics",
      "landing.f6_body":
        "Health, data quality, delta telemetry, and trust indicators show when inputs are incomplete or the integration is rebuilding state.",

      "toc.internals_title": "On this page",
      "toc.internals_overview": "Pipeline",
      "toc.internals_sources": "Energy sources",
      "toc.internals_slots": "Tariff slots",
      "toc.internals_attribution": "Slot attribution",
      "toc.internals_deltas": "Deltas & policy",
      "toc.internals_day": "Calendar-day buckets (Paris TZ)",
      "toc.internals_store": "Store file",
      "toc.internals_lts": "Long-term statistics",
      "toc.internals_rebuild": "Recorder rebuild",
      "toc.internals_telemetry": "Telemetry & quality",

      "internals.kicker": "Implementation notes",
      "internals.title": "Implementation details",
      "internals.subtitle":
        "How energy is classified into tariff slots, running totals are persisted, and daily kWh are registered in Home Assistant statistics — while your physical meters remain the source of truth.",
      "internals.back_to_doc": "Back to documentation",
      "internals.s_overview_h": "End-to-end pipeline",
      "internals.s_overview_p1":
        "At a high level: the coordinator watches configured energy entities (total_increasing kWh). Each positive delta is tagged with the tariff slot active when the delta occurred (Europe/Paris), then summed into per-source totals and per-day / per-slot buckets. When a calendar day in that timezone is complete, those buckets feed Home Assistant external statistics for durable per-slot and per-source graphs. A JSON Store holds running sums and recent day maps so restarts stay consistent.",
      "internals.s_overview_p2_html":
        "Recorder history for the entities you selected remains the external SSOT for raw meter values; integration SSOT sensors expose the <strong class=\"text-body\">internally accumulated</strong> totals used for slot splits and cost snapshots.",
      "internals.s_sources_h": "Energy sources (accumulator keys)",
      "internals.s_sources_p1":
        "Each configured meter maps to a source key (for example grid import, grid export, solar, per-battery charge and discharge). The expected key set comes from your configuration: only sources bound to an entity participate in statistics writes. Three-phase setups can use summed “virtual” entities for bookkeeping while still reading phase meters upstream.",
      "internals.s_sources_p2":
        "Long-term statistics writes require a complete source matrix for a finished day; if any expected source is missing from the internal day map, that day is skipped — avoiding silent partial writes.",
      "internals.s_slots_h": "Tariff slot grid",
      "internals.s_slots_p1_html":
        "EDF Tempo defines six price bands encoded as slot ids: <code class=\"font-mono\">bleu_hc</code>, <code class=\"font-mono\">bleu_hp</code>, <code class=\"font-mono\">blanc_hc</code>, <code class=\"font-mono\">blanc_hp</code>, <code class=\"font-mono\">rouge_hc</code>, <code class=\"font-mono\">rouge_hp</code>. BASE maps to HP only; HP/HC uses two bands under the same naming scheme; non-EDF manual tariffs keep HC/HP ids for compatibility while prices come from your tables.",
      "internals.s_slots_p2_html":
        "An additional attribution bucket <code class=\"font-mono\">unknown</code> exists only in live bookkeeping when no definite slot can be resolved. Completed days written to Recorder statistics use the six canonical slots; the unknown bucket appears in diagnostics for transparency.",
      "internals.s_attr_h": "How a delta picks a slot",
      "internals.s_attr_p1":
        "When a delta is applied, the coordinator resolves the current slot in this order: primary resolver (Tempo calendar or colour, optional user slot sensor, wall-clock off-peak rules), then a stable “last known good” slot if the primary result is ambiguous, then a schedule-only fallback from frozen EDF runtime fields and Paris time. If nothing maps to a canonical slot, attribution is unknown — energy is still accumulated so nothing is dropped silently.",
      "internals.s_attr_p2_html":
        "The resolution method is recorded alongside the delta (<code class=\"font-mono\">direct</code>, <code class=\"font-mono\">fallback_last_known</code>, <code class=\"font-mono\">fallback_schedule</code>, <code class=\"font-mono\">unknown</code>) so diagnostics can explain why a given bucket grew.",
      "internals.s_delta_h": "Delta policy (noise & rollbacks)",
      "internals.s_delta_p1":
        "Only positive deltas count toward consumption totals. Small negative steps can be treated as meter jitter (re-baselining without consuming energy); larger negative changes may trigger re-anchoring or discards per integration thresholds. Caps limit runaway spikes from bad data.",
      "internals.s_delta_p2":
        "Drift between the external meter reading and the internal running sum is tracked per source so the health model can surface inconsistent or degraded trust without silently skewing costs.",
      "internals.s_day_h": "End-of-day rollover (Paris TZ)",
      "internals.s_day_p1":
        "Day boundaries follow Europe/Paris local dates — aligned with Tempo calendars and HP/HC windows. During scheduled midnight maintenance the integration finalizes yesterday’s buckets, persists them, writes Recorder statistics for that ISO day, prunes obsolete accumulator rows, and refreshes the public snapshot.",
      "internals.s_day_p2":
        "If Home Assistant was offline across a boundary, catch-up writes can run after restart: the Store records which days were exported successfully to avoid duplicate statistics inserts when possible.",
      "internals.s_store_h": "Store file",
      "internals.s_store_p1_html":
        "The integration persists totals per source, a map of <code class=\"font-mono\">slot_day_kwh[day][source][slot]</code>, last raw meter readings, drift anchors, which statistic days were written, optional grid-export / battery-split diagnostics, and the last known cumulative floors used for long-term statistics metadata. Debounced saves reduce disk churn on busy systems.",
      "internals.s_store_p2":
        "If the Store payload is corrupt or no longer trustworthy, a guarded path can rebuild internal totals from Recorder history for completed days before normal operation resumes — exposing a rebuilding trust state in the meantime.",
      "internals.s_lts_h": "Long-term statistics registration",
      "internals.s_lts_p1_html":
        "For each finished day and each <em>(source, slot)</em> pair among the six canonical Tempo slots, the integration calls Home Assistant’s external statistics API with a <code class=\"font-mono\">TOTAL_INCREASING</code> sum. Statistic ids look like <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> with the source segment normalized for id safety. The daily increment is added to the previous cumulative sum kept with the Store so the Recorder sees one continuous monotonic series per statistic.",
      "internals.s_lts_p2":
        "These series are the preferred basis for historical analytics that need stable per-slot kWh — lighter than parsing raw template attributes, and aligned with how the Energy dashboard consumes statistics.",
      "internals.s_rebuild_h": "Recorder-driven rebuild",
      "internals.s_rebuild_p1":
        "When feasible, the integration replays prior external statistic samples to recover daily slot totals and rebuild the cumulative floor map — then reconciles against current entity readings. Long-term statistic series live in the Recorder database while detailed per-slot day matrices live in the Store; both must stay aligned after restores or migrations.",
      "internals.s_rebuild_p2_html":
        "If the Recorder is temporarily unavailable the rebuild step is skipped with a warning; operation continues, but consult <code class=\"font-mono\">docs/troubleshooting.md</code> if trust / health sensors report issues after major database operations.",
      "internals.s_tel_h": "Telemetry, unknown bucket, health",
      "internals.s_tel_p1":
        "Per-source delta telemetry includes timestamps, applied kWh, attributed slot, resolution method, gaps between applies, and drift versus the external meter. Aggregated discard counters and last-rejection payloads help trace policy decisions during support. Separate input status flags missing or unavailable entities before energy math runs.",
      "internals.s_tel_p2_html":
        "The health / trust sensor rolls these signals into coarse states such as <code class=\"font-mono\">ok</code>, <code class=\"font-mono\">degraded</code>, <code class=\"font-mono\">rebuilding</code>, or <code class=\"font-mono\">inconsistent</code> with human-readable causes — the same signals the Lovelace card can show in diagnostics.",
      "internals.footer_html":
        "For user-facing setup, return to the <a href=\"#/doc\">main documentation</a>, visit <a href=\"https://www.home-assistant.io/\" target=\"_blank\" rel=\"noopener noreferrer\">home-assistant.io</a>, or open the <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">GitLab repository</a>.",

      "nav.contents": "Contents",
      "theme.group_aria": "Display theme",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "nav.repository": "Repository",
      "nav.lang_aria": "Language",
      "nav.close_aria": "Close",
      "nav.toc_aria": "Page table of contents",

      "lang.en": "EN",
      "lang.fr": "FR",

      "toc.on_this_page": "On this page",
      "toc.overview": "Overview",
      "toc.ssot": "Data & SSOT",
      "toc.install": "Install",
      "toc.lovelace": "Lovelace card",
      "toc.configure": "Configure in HA",
      "toc.configure_flow_simulator": "Flow preview (generated)",
      "toc.configure_paths": "Screenshot paths",
      "toc.configure_delta_caps": "Energy delta caps",
      "toc.devices": "Devices",
      "toc.devices_integration": "Integration device list",
      "toc.services": "Services",
      "toc.limitations": "Limitations",
      "toc.glossary": "Glossary",
      "toc.lovelace_showcase": "Card preview",
      "toc.lovelace_editor": "Visual editor",
      "toc.devices_gallery": "In Home Assistant",

      "common.img_placeholder": "Screenshot missing — add file under",
      "common.image_open_full": "Click or press Enter to open full size",

      "flowsim.region_aria": "Config flow preview (generated)",
      "flowsim.empty": "(no step)",
      "flowsim.redirect_note": "This step only navigates in the real wizard — there is usually no form.",
      "flowsim.disclaimer":
        "Educational preview: titles/labels and selector options mirror the integration. Branching follows the real wizard in code, but entity validation, network calls (e.g. EDF/RTE), and full form rules are not executed.",
      "flowsim.branching_hint": "Your choices drive the next step (same branch points as the integration).",
      "flowsim.simulate_existing_batteries": "Preview the Configure → Batteries picker (existing systems)",
      "flowsim.simulate_existing_batteries_hint":
        "When enabled and you turn on battery support, the next screen matches Settings → Hub Énergie → Configure → Batteries with at least one system already saved — not the first-time “empty add” screen.",
      "flowsim.start_over": "Start over",
      "flowsim.step_depth": "Step {n}",
      "flowsim.done_progress": "Done",
      "flowsim.done_title": "Setup complete (preview)",
      "flowsim.done_body":
        "In Home Assistant this would create the config entry. Here the preview ends — use “Start over” to try another path.",
      "flowsim.choose_menu": "Choose an option below (same as the real menu step).",
      "flowsim.back": "Back",
      "flowsim.flow_nav_continue": "Continue",
      "flowsim.flow_nav_back": "Back to previous step",
      "flowsim.flow_nav_aria": "Navigation: continue or go back to the previous step",
      "flowsim.next": "Next",
      "flowsim.close_aria": "Close",
      "flowsim.help_aria": "Help",
      "flowsim.suffix_per_kwh": "{currency}/kWh",
      "flowsim.suffix_per_month": "{currency}/month",
      "flowsim.time_placeholder": "--:--",
      "flowsim.time_field_title": "Time (24 h, hh:mm)",
      "flowsim.entity_search": "Search",
      "flowsim.entity_placeholder": "Select an entity",
      "flowsim.entity_clear": "None (clear)",
      "flowsim.entity_domain_sensor": "Sensor",
      "flowsim.entity_domain_number": "Number",
      "flowsim.entity_domain_input_number": "Input number",

      "doc.modal_aria": "Full-size screenshot",
      "doc.modal_close_aria": "Close",
      "doc.modal_hint": "The image is shown at full width. Scroll inside this window if needed.",

      "carousel.prev": "Previous",
      "carousel.next": "Next",
      "carousel.aria_config": "Config flow screenshots",
      "carousel.aria_config_api": "Config flow — API Couleur Tempo path",
      "carousel.aria_config_manual": "Config flow — manual tariffs sample",
      "carousel.aria_config_offers": "EDF offer type screenshots",
      "carousel.aria_editor": "Lovelace card editor screenshots",
      "carousel.aria_devices": "Device list screenshots",

      "hero.kicker": "Home Assistant · Custom integration",
      "hero.title": "Energy monitoring, costs & diagnostics",
      "hero.lead_html":
        "Configure suppliers and tariffs, track kWh and daily cost, with optional solar estimation and multi-battery support — plus a Lovelace card served from <code class=\"font-mono small\">/hub_energie/</code>.",

      "glance.title": "At a glance",
      "glance.ha": "<strong class=\"text-body\">HA</strong> 2024.10.0 or newer",
      "glance.snapshot": "Doc snapshot <span class=\"badge bg-primary badge-doc\">v{{HUB_ENERGIE_VERSION}}</span>",
      "glance.issues": "Issues & feedback",

      "overview.title": "Overview",
      "overview.intro":
        "This page complements the README. Follow the steps below in order for a first-time setup.",

      "scope.stable_heading": "Intended stable scope (v{{HUB_ENERGIE_VERSION_SERIES}}.x)",
      "scope.stable_li1_html":
        "<strong class=\"text-body\">Config flow:</strong> supplier (EDF vs custom), tariff (flat, HP–HC, multi-slot, EDF Tempo + RTE/API/sensor), grid and optional solar/battery wiring.",
      "scope.stable_li2_html":
        "<strong class=\"text-body\">Energy:</strong> positive deltas from <code class=\"font-mono\">total_increasing</code> meters → slot-day accounting (calendar day, Europe/Paris) and SSOT total sensors owned by the integration.",
      "scope.stable_li3_html":
        "<strong class=\"text-body\">Costs:</strong> daily estimate (€), subscription split, per-slot detail in attributes.",
      "scope.stable_li4_html":
        "<strong class=\"text-body\">EDF Tempo:</strong> colours, quotas, next-change times.",
      "scope.stable_li5_html":
        "<strong class=\"text-body\">Diagnostics:</strong> grid-export split, data quality, delta telemetry, unknown bucket, staleness; <strong class=\"text-body\">health</strong> sensor (<code class=\"font-mono\">ok</code> / <code class=\"font-mono\">degraded</code> / <code class=\"font-mono\">rebuilding</code> / <code class=\"font-mono\">inconsistent</code> / <code class=\"font-mono\">no_input</code>) with a readable cause.",
      "scope.stable_li6_html": "Optional clear-sky PV and solar resale when configured.",
      "scope.stable_li7_html":
        "Lovelace: pre-built bundles in <code class=\"font-mono\">frontend/dist/</code> are versioned in the repo; Home Assistant serves them at <code class=\"font-mono\">/hub_energie/</code>.",

      "scope.exp_heading": "Experimental / heuristic (power sensors)",
      "scope.exp_li1": "Splitting battery charge origin by power flow when sensors are partial or noisy.",
      "scope.exp_li2": "Solar production estimation (model-based, not a physical meter).",
      "scope.exp_li3": "Opportunity-cost style diagnostics for exported kWh.",

      "scope.disclaimer_html":
        "Behaviour depends on your hardware and entity selection (including the Energy dashboard). The lists above describe intended scope, not a guarantee for every edge case.",

      "section.link_aria": "Link to section",

      "ssot.title": "Data sources (SSOT)",
      "ssot.intro":
        "Knowing which data is authoritative helps you configure the Energy dashboard correctly and read the right attributes.",
      "ssot.s1_title": "Physical meters (external SSOT)",
      "ssot.s1_html":
        "The energy entities you select (<code class=\"font-mono\">grid_import_energy</code>, solar, export, per-battery in/out). <strong class=\"text-body\">Recorder history</strong> is the source of truth for total kWh from hardware or upstream integrations.",
      "ssot.s2_title": "Internal accounting",
      "ssot.s2_html":
        "The coordinator accumulates <strong class=\"text-body\">positive deltas</strong> into totals and per-day slot kWh. Integration <code class=\"font-mono\">total_increasing</code> SSOT sensors reflect this <strong class=\"text-body\">internal sum</strong>, not a full re-read of the meter every cycle.",
      "ssot.s3_title": "Long-term per-slot kWh (daily)",
      "ssot.s3_html":
        "After each calendar day (Europe/Paris), external statistics <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> are written. Use these (or physical meters) for historical analytics — not raw <code class=\"font-mono\">cost_detail</code> attribute history alone.",

      "install.title": "Installation",
      "install.intro_html":
        "Install the integration <strong class=\"text-body\">exactly</strong> as a single package under your HA config:",
      "install.note_html":
        "Home Assistant must load <code class=\"font-mono\">custom_components/hub_energie/manifest.json</code>. Avoid a nested folder such as <code class=\"font-mono\">hub_energie/hub_energie/</code>.",
      "install.release_aria": "ZIP download",
      "install.zip_intro_html":
        "Download the archive for the version you want. Unzip it at the <strong class=\"text-body\">root</strong> of your Home Assistant configuration folder (the one that contains <code class=\"font-mono\">configuration.yaml</code>) so you end up with <code class=\"font-mono\">config/custom_components/hub_energie/</code>. The integration and dashboard card are included — no extra build step on your server.",
      "install.zip_after_html":
        "Then do a <strong class=\"text-body\">full restart</strong> of Home Assistant and add the integration under <strong class=\"text-body\">Settings → Devices &amp; services → Add integration</strong>. <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases\" target=\"_blank\" rel=\"noopener noreferrer\">Browse all versions on GitLab</a> if you need another build.",
      "install.release_loading": "Loading versions…",
      "install.release_fetch_error": "The version list could not be loaded. Open the link below to download a ZIP from GitLab.",
      "install.release_none": "No downloadable archive is listed yet. Use the link below to check GitLab.",
      "install.release_download": "Download",
      "install.release_other_label": "Other versions:",
      "install.choose_path": "Choose your path",
      "tab.zip": "ZIP download",
      "tab.hacs_store": "HACS store",
      "tab.git": "Git clone",
      "tab.copy": "Copy files",

      "install.hacs_tba_heading": "HACS store",
      "install.hacs_tba_html":
        "<p class=\"mb-2\">Hub Énergie is not in the default HACS catalogue yet. The HACS ecosystem is built mainly around <strong class=\"text-body\">GitHub</strong> repositories; this project lives on <strong class=\"text-body\">GitLab</strong>, so you cannot install it like a mainstream HACS integration today.</p><p class=\"mb-0\">Use the <strong class=\"text-body\">ZIP download</strong> tab for the simplest install, or <strong class=\"text-body\">Git clone</strong> / <strong class=\"text-body\">Copy files</strong>. If your HACS version allows adding a <strong class=\"text-body\">custom repository</strong> with a GitLab URL, you can try that — results depend on your HACS version. After any install, perform a <strong class=\"text-body\">full restart</strong> of Home Assistant.</p>",

      "install.git.s1_title": "Clone into the right folder",
      "install.git.s2_title": "Restart & add the integration",
      "install.git.s2_p_html":
        "Perform a full restart of Home Assistant, then <a href=\"#configure\">Configure in HA</a> (Settings → Devices &amp; services → Add integration).",

      "install.copy.s1_title": "Copy the full tree",
      "install.copy.s1_html":
        "From this repository, copy only the <code class=\"font-mono\">custom_components/hub_energie/</code> tree into your Home Assistant <code class=\"font-mono\">config/custom_components/hub_energie/</code> — all subfolders (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Do not copy the repo root (<code class=\"font-mono\">site/</code>, <code class=\"font-mono\">tests/</code>, …) into HA.",
      "install.copy.s2_title": "Restart & add the integration",
      "install.copy.s2_p_html": "Full restart, then <a href=\"#configure\">Configure in HA</a>.",

      "install.lovelace_title": "If you use the Lovelace card",
      "install.lovelace_body_html":
        "The dashboard card is included with the integration. After an update, <strong class=\"text-body\">restart Home Assistant</strong> so the interface loads the latest files. To match a specific release, use the same version for your download or Git tag (see <code class=\"font-mono\">manifest.json</code> → <code class=\"font-mono\">version</code>).",
      "install.lovelace_dev_html":
        "<strong class=\"text-body\">Developers:</strong> to rebuild locally, from <code class=\"font-mono\">custom_components/hub_energie/frontend/</code> run <code class=\"font-mono\">npm ci</code> then <code class=\"font-mono\">npm run build</code>.",

      "lovelace.title": "Lovelace card",
      "lovelace.intro_html":
        "Built assets (<code class=\"font-mono\">hub-energie-card-boot.js</code>, <code class=\"font-mono\">hub-energie-card.js</code>, <code class=\"font-mono\">hub-energie-card-editor.js</code>, and shared chunks under <code class=\"font-mono\">frontend/dist/</code>) ship in the repo and are rebuilt by CI on every commit. Home Assistant serves the <code class=\"font-mono\">dist</code> tree at <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>. The optional <strong class=\"text-body\">Solar production (energy)</strong> bar breaks out kWh (self-consumption, battery charge, attributed export) for the card’s selected day or range.",

      "lovelace.l1_title": "Storage-mode dashboards (default)",
      "lovelace.l1_html":
        "On startup and when you <strong class=\"text-body\">reload</strong> the integration, it adds or updates that URL with a <strong class=\"text-body\">cache-busting</strong> <code class=\"font-mono\">?v=…</code> query (same as <em>Settings → Dashboards → Resources</em>) so the browser loads new <code class=\"font-mono\">dist/</code> files. Usually no manual step is required.",

      "lovelace.l2_title": "YAML-managed resources",
      "lovelace.l2_p": "Add the boot URL yourself:",
      "lovelace.l2_note_html":
        "Replace legacy URLs such as <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> with the boot URL. Append <code class=\"font-mono\">?v=&lt;timestamp&gt;</code> if the browser keeps an old bundle. Do not register duplicate modules for the same card.",

      "lovelace.l3_title": "Add the card",

      "lovelace.showcase_title": "Dashboard card",
      "lovelace.fig_alt": "Hub Énergie Lovelace card on a dashboard",
      "lovelace.fig_cap_html":
        "Example of the card in daily mode (Tempo, instant power, consumption, costs, grid export). File: <code class=\"font-mono\">site/public/img/hub-energie-card.png</code>.",

      "lovelace.editor_title": "Visual editor",
      "lovelace.editor_intro_html":
        "The card includes a full editor (<code class=\"font-mono\">hub-energie-card-editor.js</code> in the repo) to adjust section visibility, Tempo controls, date range, and optional entity overrides — without YAML.",
      "lovelace.ed1_alt": "Lovelace card editor — configuration tab with live preview",
      "lovelace.editor_fig_cap_html":
        "<strong class=\"text-body\">Configuration</strong> tab with section toggles and live card preview. Extra captures (e.g. <strong class=\"text-body\">Visibilité</strong> / <strong class=\"text-body\">Mise en page</strong>) can be added later as <code class=\"font-mono\">lovelace-editor-02.png</code> if you want a second slide.",

      "configure.title": "Configure in Home Assistant",
      "configure.flow_lead_html":
        "After a <strong class=\"text-body\">full restart</strong>, add the integration under <strong class=\"text-body\">Settings → Devices &amp; services → Add integration</strong>. The flow is <strong class=\"text-body\">not linear</strong>: screens depend on supplier, automatic vs manual tariffs, EDF offer (BASE / HPHC / TEMPO), Tempo data source, single- vs three-phase grid wiring, solar, and batteries.",

      "configure.flow_step_help_html":
        "<strong class=\"text-body\">Deep links from Home Assistant:</strong> each dialog can link to a short explainer on a <strong class=\"text-body\">separate page</strong> so the main documentation stays light for casual readers. Open <a href=\"#/doc/setup-help\">Setup &amp; options — step help</a> (anchors such as <code class=\"font-mono\">#/doc/setup-help#flow-step-grid</code> or <code class=\"font-mono\">#flow-step-options-advanced_energy</code>).",

      "flowhelp.kicker": "Home Assistant — config dialogs",
      "flowhelp.title": "Setup &amp; options — step help",
      "flowhelp.intro_html":
        "This page is meant to be opened from Hub Énergie itself: each section matches a <code class=\"font-mono\">step_id</code> in the integration config or options flow. Text stays out of the main documentation scroll path unless you choose to come here.",
      "flowhelp.link_convention_html":
        "<strong class=\"text-body\">Anchor convention:</strong> initial wizard → <code class=\"font-mono\">#flow-step-&lt;step_id&gt;</code>; post-setup <em>Configure</em> menu → <code class=\"font-mono\">#flow-step-options-&lt;step_id&gt;</code> (for example <code class=\"font-mono\">options advanced_energy</code> → <code class=\"font-mono\">#flow-step-options-advanced_energy</code>).",
      "flowhelp.toc_setup": "Initial setup",
      "flowhelp.toc_options": "Configure menu",
      "flowhelp.back_doc": "Back to documentation",
      "flowhelp.setup_heading": "Initial setup wizard",
      "flowhelp.options_heading": "Settings → Hub Énergie → Configure",
      "flowhelp.footer_html":
        "Full branch graph and <code class=\"font-mono\">step_id</code> table: <code class=\"font-mono\">custom_components/hub_energie/docs/config-flow.md</code> in GitLab. Main guided doc (screenshots): <a href=\"#/doc#configure\">Configure in HA</a> on this site.",

      "configure.flow_map_title": "How the config flow branches",
      "configure.flow_map_html":
        "<ul class=\"mb-0 ps-3\"><li><strong class=\"text-body\">Start</strong> · <em>user</em> — supplier (EDF or other) and phase type on the same form.</li><li><strong class=\"text-body\">Other supplier</strong> · <em>supplier_custom</em> (name) → tariff mode is forced to <strong class=\"text-body\">manual</strong> → <em>contract</em> → manual pricing wizard (flat / time-of-use / schedule) → <strong class=\"text-body\">grid → solar → batteries → finish</strong>.</li><li><strong class=\"text-body\">EDF + automatic tariffs</strong> · <em>tariff_mode</em> (provider API vs manual) → <em>contract</em> (kVA, optional name) → <em>edf_offer</em> (BASE, HPHC, or TEMPO). If <strong class=\"text-body\">TEMPO</strong>: <em>edf_tempo</em> choose <strong class=\"text-body\">RTE</strong> (OAuth API) or <strong class=\"text-body\">API Couleur Tempo</strong> (no credentials). RTE adds <em>edf_tempo_rte</em> (client id + secret, validated against the API). Then EDF prices are fetched and you continue to <strong class=\"text-body\">grid → solar → batteries → finish</strong>.</li><li><strong class=\"text-body\">EDF + manual tariffs</strong> · skips EDF offer/Tempo; after <em>contract</em> you enter the same manual pricing branch as “other supplier”.</li><li><strong class=\"text-body\">After pricing is resolved</strong> · <em>grid</em> picks import (and optional export / power); <strong class=\"text-body\">three-phase</strong> adds sub-steps (per-phase vs combined sensors). Then <em>solar</em> (optional production / resale / estimation), then <em>battery</em> wizard (0..N systems), then create entry.</li></ul>",

      "configure.delta_caps_h": "Energy delta caps (advanced)",
      "configure.delta_caps_intro_html":
        "Hub Énergie moves your <code class=\"font-mono\">total_increasing</code> kWh meters in <strong class=\"text-body\">steps</strong>. On each coordinator cycle it compares the current reading to the last one it stored: the <strong class=\"text-body\">positive difference</strong> is a candidate delta. If that delta is <strong class=\"text-body\">within the cap</strong> for its source class (grid, solar, battery, or other), those kWh are booked into internal totals and the current tariff slot. If it is <strong class=\"text-body\">above the cap</strong>, the integration flags the jump as <strong class=\"text-body\">unrealistic</strong>: those kWh are <strong class=\"text-body\">not</strong> added to internal SSOT, but the stored “last raw” value still advances to the new meter reading so future deltas are computed from a sane baseline. Physical meters and Recorder history remain the reference for raw totals; these caps protect internal slot/cost accounting from spikes and from accidental huge catch-up after downtime.",
      "configure.delta_caps_defaults_h": "Default ceilings (kWh per update)",
      "configure.delta_caps_defaults_html":
        "<ul class=\"mb-0 ps-3\"><li><strong class=\"text-body\">Grid import &amp; export</strong> — 300 kWh (shared cap for both)</li><li><strong class=\"text-body\">Solar production</strong> — 120 kWh</li><li><strong class=\"text-body\">Battery</strong> charge &amp; discharge — 80 kWh per counter</li><li><strong class=\"text-body\">Any other</strong> configured source — 200 kWh</li></ul><p class=\"mb-0 mt-2\">Override all four values under <strong class=\"text-body\">Settings → Hub Énergie → Configure → Advanced: energy delta caps</strong>.</p>",
      "configure.delta_caps_cases_h": "Concrete cases",
      "configure.delta_caps_cases_html":
        "<ul class=\"mb-0 ps-3\"><li class=\"mb-2\"><strong class=\"text-body\">Short outage.</strong> Home Assistant was off for one night; the grid import meter increased by 12 kWh before the next poll. With the default 300 kWh grid cap, the full 12 kWh is applied once, attributed to the <em>current</em> Paris day and tariff slot (the integration does not reconstruct hour-by-hour consumption across the gap).</li><li class=\"mb-2\"><strong class=\"text-body\">Very long outage or heavy catch-up.</strong> The same meter is 400 kWh higher when HA returns. A single delta of 400 exceeds the default 300 kWh grid cap: internal SSOT <strong class=\"text-body\">skips</strong> that chunk; logs / discard telemetry explain why. If your site often sees big jumps, raise the grid cap (for example 800–1500 kWh) or ensure HA stays up so deltas stay smaller.</li><li class=\"mb-2\"><strong class=\"text-body\">PV inverter over-reporting for one tick.</strong> The solar kWh entity jumps by 30 kWh while actual production was tiny. A tighter solar cap (e.g. 40 kWh) caps how much of that spike can enter internal totals in one go; choose a value above the realistic maximum you expect <em>between two hub polls</em> under sunny conditions.</li><li class=\"mb-0\"><strong class=\"text-body\">Large batteries or off-grid.</strong> Domestic lithium systems often move only a few kWh between updates; 80 kWh is already generous. A large stack cycling tens of kWh every few minutes might need a higher battery cap so legitimate fast ramps are not discarded.</li></ul>",
      "configure.delta_caps_ha_html":
        "These fields are optional post-install tuning: they are <strong class=\"text-body\">not</strong> shown in the first-time wizard, only in <strong class=\"text-body\">Configure</strong>. The dialog description links back to this site for the longer explanation.",

      "configure.flow_simulator_h": "Interactive flow preview",
      "configure.flow_simulator_intro_html":
        "This panel is generated from <code class=\"font-mono\">config_flow.py</code> and <code class=\"font-mono\">strings.json</code> so titles, descriptions, and option labels track the integration. Navigation branches from your inputs (supplier, tariff mode, offer, three-phase path, solar/battery toggles, …) like the real wizard. It is still <strong class=\"text-body\">not</strong> Home Assistant: no real entity validation, no network fetches — approximations are intentional. After changing the wizard, run <code class=\"font-mono\">python scripts/extract_config_flow_catalog.py</code> and commit <code class=\"font-mono\">site/src/data/flowCatalog.generated.json</code>. CI fails if that file is stale.",
      "configure.paths_h": "Guided screenshot paths",
      "configure.flow_paths_intro_html":
        "Pick the tab that matches your setup. Each tab is a <strong class=\"text-body\">real Home Assistant dialog sequence</strong> (screenshots only — not a simulator). For <code class=\"font-mono\">step_id</code> names and the full branch map, see <code class=\"font-mono\">custom_components/hub_energie/docs/config-flow.md</code> in the repository.",

      "configure.path_tab_rte": "Tempo · RTE",
      "configure.path_tab_api": "Tempo · API",
      "configure.path_tab_manual": "Manual tariffs",
      "configure.path_tab_offers": "EDF offers",

      "configure.flow_carousel_tree": "This path (6 steps)",
      "configure.flow_carousel_tree_api": "API Couleur path (5 steps)",
      "configure.flow_carousel_tree_manual": "Manual pricing (sample)",
      "configure.flow_carousel_tree_offers": "Offer screenshots",

      "configure.flow_api_5_t": "Tempo source",
      "configure.flow_api_5_d": "API Couleur Tempo — no RTE step",
      "configure.flow_api_5_alt": "Hub Énergie config — API Couleur Tempo selected",
      "configure.flow_after_api_html":
        "After you submit, EDF tariffs are fetched in the background (no extra dialog on success). The flow continues with <strong class=\"text-body\">grid</strong> sensors, then <strong class=\"text-body\">solar</strong> and <strong class=\"text-body\">batteries</strong> — not illustrated in this doc yet.",

      "configure.flow_m_2_t": "Tariff mode",
      "configure.flow_m_2_d": "Manual pricing",
      "configure.flow_m_2_alt": "Hub Énergie config — manual tariff mode",
      "configure.flow_m_4_t": "Manual pricing",
      "configure.flow_m_4_d": "Structure, basis, currency",
      "configure.flow_m_4_alt": "Hub Énergie config — manual pricing (flat example)",
      "configure.flow_m_5_t": "Grid",
      "configure.flow_m_5_d": "Single-phase example",
      "configure.flow_m_5_alt": "Hub Énergie config — grid sensors (mono)",
      "configure.flow_m_flat_t": "Flat rate",
      "configure.flow_m_flat_d": "kWh price & subscription",
      "configure.flow_m_flat_alt": "Hub Énergie config — manual flat tariff (per kWh + subscription)",
      "configure.flow_after_manual_html":
        "Six steps: after <strong class=\"text-body\">flat</strong> pricing structure you enter <strong class=\"text-body\">per-kWh and subscription</strong>, then <strong class=\"text-body\">grid</strong>. Peak/off-peak or an advanced schedule would replace the flat-rate pair with longer branches. Three-phase grid adds sub-steps. <strong class=\"text-body\">Solar</strong> / <strong class=\"text-body\">batteries</strong> are still not shown here.",

      "configure.flow_o_1_t": "BASE",
      "configure.flow_o_1_d": "Single-rate offer",
      "configure.flow_o_1_alt": "Hub Énergie config — EDF BASE offer",
      "configure.flow_o_2_t": "HPHC",
      "configure.flow_o_2_d": "Peak / off-peak",
      "configure.flow_o_2_alt": "Hub Énergie config — EDF HPHC offer",
      "configure.flow_o_3_t": "TEMPO (picker)",
      "configure.flow_o_3_d": "Same step as other paths",
      "configure.flow_o_3_alt": "Hub Énergie config — EDF offer with TEMPO selected",
      "configure.flow_after_offers_html":
        "These slides are <strong class=\"text-body\">side-by-side references</strong> for how each offer type looks. In a real run you pick one option, then automatic paths fetch prices (when applicable) and continue to <strong class=\"text-body\">grid</strong>.",

      "configure.flow_ex_1_t": "User",
      "configure.flow_ex_1_d": "Supplier & phase",
      "configure.flow_ex_2_t": "Tariff mode",
      "configure.flow_ex_2_d": "Automatic (API) vs manual",
      "configure.flow_ex_3_t": "Contract",
      "configure.flow_ex_3_d": "Subscribed power & optional name",
      "configure.flow_ex_4_t": "EDF offer",
      "configure.flow_ex_4_d": "BASE, HPHC, or TEMPO",
      "configure.flow_ex_5_t": "Tempo source",
      "configure.flow_ex_5_d": "RTE or API Couleur Tempo",
      "configure.flow_ex_6_t": "RTE credentials",
      "configure.flow_ex_6_d": "Only if RTE is selected",
      "configure.flow_ex_1_alt": "Hub Énergie config — user: supplier and phase",
      "configure.flow_ex_2_alt": "Hub Énergie config — tariff recovery mode",
      "configure.flow_ex_3_alt": "Hub Énergie config — contract details",
      "configure.flow_ex_4_alt": "Hub Énergie config — EDF offer type",
      "configure.flow_ex_5_alt": "Hub Énergie config — Tempo signal source",
      "configure.flow_ex_6_alt": "Hub Énergie config — RTE API credentials",
      "configure.flow_after_rte_html":
        "After valid credentials (or if you choose <strong class=\"text-body\">API Couleur Tempo</strong>), the flow fetches EDF tariffs and continues with <strong class=\"text-body\">grid sensors</strong> (import required; three-phase adds extra steps), then <strong class=\"text-body\">solar</strong>, then <strong class=\"text-body\">batteries</strong>. Those steps are not illustrated here yet — share screenshots if you want them added to the doc.",

      "devices.title": "Device model",
      "devices.intro":
        "One Home Assistant device per logical scope. Entities are grouped by measured or configured domain; see <code class=\"font-mono\">CHANGELOG.md</code> for detail.",

      "devices.integration_title": "Integration page",
      "devices.integration_alt": "Hub Énergie integration entry with listed devices",
      "devices.integration_cap_html":
        "<strong class=\"text-body\">Settings → Devices &amp; services → Hub Énergie</strong> shows one configuration entry (bridge). Under it, Home Assistant lists logical devices — for example Offre, Réseau, Solaire, one row per battery, the aggregated battery summary, Bilan énergétique, Coûts, and Diagnostics. Labels (e.g. “Toutes batteries”) and entity counts depend on your installation.",

      "devices.th_device": "Device",
      "devices.th_purpose": "Purpose",
      "devices.p_offre": "Tariff, supplier, contract",
      "devices.p_reseau": "Grid energy / power sensors",
      "devices.p_solaire": "Solar measurement / estimation",
      "devices.p_batt": "Per-battery system (0..N)",
      "devices.p_battsum": "Aggregated battery summary",
      "devices.p_bilan": "Computed energy flows (kWh)",
      "devices.p_couts": "Monetary values (€)",
      "devices.p_diag": "Health, grid-export diagnostics",

      "devices.gallery_title": "Devices in the UI",
      "devices.gallery_intro_html":
        "Each integration device groups related entities. Below, one slide per device so readers can see how the structure looks in <strong class=\"text-body\">Settings → Devices &amp; services</strong>.",
      "devices.gallery_multishot_html":
        "For device pages with many entities, you can add extra PNGs later (e.g. <code class=\"font-mono\">device-ui-02-reseau-2.png</code>) — the doc can grow into a nested carousel when those assets exist.",
      "devices.tree_label": "Device",
      "devices.g1_t": "Offre",
      "devices.g1_d": "Tariff, supplier, contract",
      "devices.g2_t": "Réseau",
      "devices.g2_d": "Grid energy / power",
      "devices.g3_t": "Solaire",
      "devices.g3_d": "Solar measurement / estimation",
      "devices.g4_t": "Batterie",
      "devices.g4_d": "Single battery instance",
      "devices.g5_t": "Batteries (total)",
      "devices.g5_d": "Aggregated battery summary",
      "devices.g6_t": "Bilan énergétique",
      "devices.g6_d": "Computed kWh flows",
      "devices.g7_t": "Coûts",
      "devices.g7_d": "Monetary sensors",
      "devices.g8_t": "Diagnostics",
      "devices.g8_d": "Health and grid-export diagnostics",
      "devices.g1_alt": "Hub Énergie device — Offre",
      "devices.g2_alt": "Hub Énergie device — Réseau",
      "devices.g3_alt": "Hub Énergie device — Solaire",
      "devices.g4_alt": "Hub Énergie device — Batterie",
      "devices.g5_alt": "Hub Énergie device — Batteries (total)",
      "devices.g6_alt": "Hub Énergie device — Bilan énergétique",
      "devices.g7_alt": "Hub Énergie device — Coûts",
      "devices.g8_alt": "Hub Énergie device — Diagnostics",

      "services.title": "Services",
      "services.th_service": "Service",
      "services.th_desc": "Description",
      "services.r1": "Force a coordinator refresh",
      "services.r2": "Re-fetch EDF tariffs (auto mode)",

      "limitations.title": "Limitations",
      "limitations.li1": "Recorder retention bounds history depth, charts, and rebuild-from-Recorder workflows.",
      "limitations.li2":
        "Optional solar estimation uses a clear-sky model — indicative only, not a production meter.",
      "limitations.li3_html":
        "The card’s power graph needs statistics; missing <code class=\"font-mono\">state_class</code> or history can leave it empty.",
      "limitations.li4_html":
        "Health states aggregate many checks; a short <code class=\"font-mono\">rebuilding</code> period after a Recorder rebuild is expected.",
      "limitations.li5_html":
        "Deep dives: <code class=\"font-mono\">docs/troubleshooting.md</code> in the repository (trust, unknown bucket, recovery).",

      "glossary.title": "Measured, reconstructed, estimated",
      "glossary.th_kind": "Kind",
      "glossary.th_meaning": "Meaning",
      "glossary.measured": "Measured",
      "glossary.measured_html":
        "From configured HA entities (<code class=\"font-mono\">total_increasing</code> kWh, power where wired).",
      "glossary.recon": "Reconstructed",
      "glossary.recon_d": "Internal totals and per-slot kWh from deltas and optional Recorder replay.",
      "glossary.est": "Estimated",
      "glossary.est_d": "Heuristic or model-based values when no direct energy meter exists — e.g. clear-sky PV, splits inferred from power sensors.",

      "footer.p1_html":
        "Hub Énergie — documentation snapshot <strong class=\"text-body\">v{{HUB_ENERGIE_VERSION}}</strong>. Authoritative detail: README and <code class=\"font-mono\">docs/</code> in the <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">GitLab project</a>. Official platform: <a href=\"https://www.home-assistant.io/\" target=\"_blank\" rel=\"noopener noreferrer\">Home Assistant</a>.",
      "footer.license": "License: see the repository.",
      "footer.brand_name": "Hub Énergie",
      "footer.brand_aria": "Hub Énergie",
      "footer.primary_links_aria": "Project links",
      "footer.link_gitlab": "GitLab",
      "footer.social_note": "Community links — coming soon.",
      "footer.social_group_aria": "Social links and newsletter signup",
      "social.facebook": "Facebook",
      "social.discord": "Discord",
      "social.newsletter": "Newsletter",
      "social.coming_soon": "Coming soon",
    },

    fr: {
      "meta.title": "Hub Énergie — Documentation",
      "meta.description":
        "Hub Énergie — intégration personnalisée Home Assistant pour le suivi de l’énergie, des coûts et le diagnostic.",
      "meta.title.landing": "Hub Énergie — L’énergie du foyer, centralisée",
      "meta.description.landing":
        "Hub Énergie — une seule intégration Home Assistant pour tarifs, énergie, coûts, solaire, batteries et diagnostics.",
      "meta.title.internals": "Hub Énergie — Coulisses techniques",
      "meta.description.internals":
        "Comment Hub Énergie ventile les kWh par créneau tarifaire, persiste l’état et enregistre les statistiques long terme dans Home Assistant.",
      "meta.title.flowhelp": "Hub Énergie — Aide par étape (configuration)",
      "meta.description.flowhelp":
        "Textes courts pour chaque écran de l’assistant Hub Énergie et du menu Configurer, avec ancres stables depuis l’intégration.",

      "nav.home": "Accueil",
      "nav.documentation": "Documentation",
      "nav.internals": "Détails d’implémentation",
      "nav.internals_short": "Technique",
      "nav.home_assistant_site_aria": "Home Assistant — site officiel (s’ouvre dans un nouvel onglet)",

      "doc.hero_internals_cta": "Détails d’implémentation",
      "doc.hero_internals_hint":
        "Attribution des créneaux, compartiments par jour civil, fichier Store et statistiques long terme — pour suivre toute la chaîne de traitement.",

      "landing.kicker": "Hub Énergie · intégration personnalisée Home Assistant",
      "landing.ha_logo_alt": "Home Assistant",
      "landing.hero_badge_title": "Hub Énergie",
      "landing.hero_badge_sub":
        "Intégration personnalisée pour Home Assistant — tarif, compteurs, solaire, batteries et coûts",
      "landing.hero_badge_alt": "Hub Énergie",
      "landing.hero_badge_aria": "Ouvrir la documentation Hub Énergie",
      "landing.headline": "Centralisez l’énergie de votre logement",
      "landing.lead_html":
        "Une seule intégration relie tarif, compteurs, solaire, batteries, coûts et diagnostics : configurez une fois, puis consultez une vue cohérente dans Home Assistant.",
      "landing.cta_discover": "Découvrir",
      "landing.cta_internals": "Fonctionnement interne",
      "landing.cta_discover_footer": "Voir la documentation",
      "landing.version_note": "Documentation figée v{{HUB_ENERGIE_VERSION}}",
      "landing.f1_title": "Centralisation réelle",
      "landing.f1_body":
        "Offre, réseau, solaire, appareils par batterie, bilan énergétique, coûts et diagnostics sont regroupés dans une même intégration, au lieu d’être éclatés entre helpers et modèles.",
      "landing.f2_title": "Comptabilité alignée sur le tarif",
      "landing.f2_body":
        "Les deltas positifs de vos compteurs kWh sont ventilés par créneau tarifaire (dont Tempo EDF) selon des règles explicites, avec repli et visibilité lorsque les signaux manquent.",
      "landing.f3_title": "Coûts calés sur la consommation",
      "landing.f3_body":
        "Estimations journalières, part d’abonnement et détail par créneau restent alignés sur le même instantané que celui lu par la carte Lovelace.",
      "landing.f4_title": "Historique durable",
      "landing.f4_body":
        "Les capteurs SSOT internes reflètent les cumuls en cours ; chaque jour civil terminé (Europe/Paris) est écrit en statistiques long terme pour l’analyse et les graphiques.",
      "landing.f5_title": "Carte intégrée",
      "landing.f5_body":
        "Un paquet Lovelace maintenu est servi par votre instance Home Assistant sous /hub_energie/, sans frontend distinct à héberger.",
      "landing.f6_title": "Diagnostics transparents",
      "landing.f6_body":
        "Santé, qualité des données, télémétrie des deltas et indicateurs de confiance signalent les entrées incomplètes ou une reconstruction d’état en cours.",

      "toc.internals_title": "Sur cette page",
      "toc.internals_overview": "Chaîne de traitement",
      "toc.internals_sources": "Sources d’énergie",
      "toc.internals_slots": "Créneaux tarifaires",
      "toc.internals_attribution": "Attribution de créneau",
      "toc.internals_deltas": "Deltas & politique",
      "toc.internals_day": "Compartiments par jour civil (TZ Paris)",
      "toc.internals_store": "Fichier Store",
      "toc.internals_lts": "Statistiques long terme",
      "toc.internals_rebuild": "Reconstruction Recorder",
      "toc.internals_telemetry": "Télémétrie et qualité",

      "internals.kicker": "Notes d’implémentation",
      "internals.title": "Détails d’implémentation",
      "internals.subtitle":
        "Comment l’énergie est classée par créneau tarifaire, comment les cumuls sont persistés et comment les kWh journaliers sont enregistrés dans les statistiques Home Assistant — tout en conservant vos compteurs physiques comme référence.",
      "internals.back_to_doc": "Retour à la documentation",
      "internals.s_overview_h": "Chaîne de bout en bout",
      "internals.s_overview_p1":
        "Vue d’ensemble : le coordinateur surveille les entités énergie configurées (kWh total_increasing). Chaque delta positif est étiqueté avec le créneau tarifaire actif au moment du delta (Europe/Paris), puis cumulé en totaux par source et en compartiments jour / créneau. Une fois le jour civil terminé dans ce fuseau, ces compartiments alimentent les statistiques externes de Home Assistant pour des graphiques durables par créneau et par source. Un Store JSON conserve les sommes courantes et les cartes des jours récents afin de garder des redémarrages cohérents.",
      "internals.s_overview_p2_html":
        "L’historique Recorder des entités sélectionnées reste la SSOT externe pour les lectures brutes des compteurs ; les capteurs SSOT de l’intégration exposent les totaux <strong class=\"text-body\">accumulés en interne</strong> servant au découpage par créneau et aux instantanés de coût.",
      "internals.s_sources_h": "Sources d’énergie (clés accumulateur)",
      "internals.s_sources_p1":
        "Chaque compteur configuré est associé à une clé source (ex. import réseau, export, solaire, charge et décharge par batterie). L’ensemble attendu découle de votre configuration : seules les sources liées à une entité participent aux écritures de statistiques. En triphasé, des entités « virtuelles » sommées peuvent servir à la comptabilité tout en s’appuyant en amont sur vos compteurs par phase.",
      "internals.s_sources_p2":
        "L’écriture en statistiques long terme exige une matrice complète des sources pour un jour terminé ; si une source attendue manque dans la carte jour interne, ce jour est ignoré — ce qui évite d’écrire silencieusement des données partielles.",
      "internals.s_slots_h": "Grille de créneaux tarifaires",
      "internals.s_slots_p1_html":
        "EDF Tempo définit six bandes tarifaires encodées en identifiants de créneau : <code class=\"font-mono\">bleu_hc</code>, <code class=\"font-mono\">bleu_hp</code>, <code class=\"font-mono\">blanc_hc</code>, <code class=\"font-mono\">blanc_hp</code>, <code class=\"font-mono\">rouge_hc</code>, <code class=\"font-mono\">rouge_hp</code>. BASE se ramène au HP seul ; HPHC n’en utilise que deux, selon la même convention de nommage ; hors EDF, les tarifs manuels conservent les identifiants HC/HP pour la compatibilité, les prix provenant de vos grilles.",
      "internals.s_slots_p2_html":
        "Un compartiment d’attribution <code class=\"font-mono\">unknown</code> n’existe qu’en temps réel lorsqu’aucun créneau canonique n’est résolu. Les jours finalisés écrits dans les statistiques du Recorder n’emploient que les six créneaux canoniques ; le compartiment inconnu est surtout visible dans les diagnostics, pour la transparence.",
      "internals.s_attr_h": "Comment un delta choisit un créneau",
      "internals.s_attr_p1":
        "Lors de l’application d’un delta, le coordinateur résout le créneau courant dans cet ordre : résolveur principal (calendrier ou couleur Tempo, capteur de créneau optionnel, règles HC/HP sur l’horloge), puis dernier créneau stable connu si le résultat principal est ambigu, puis repli « horaire seul » à partir des champs EDF figés et de l’heure Paris. Si rien ne correspond à un créneau canonique, l’attribution est inconnue — l’énergie est néanmoins accumulée pour éviter toute perte silencieuse.",
      "internals.s_attr_p2_html":
        "La méthode de résolution est enregistrée avec le delta (<code class=\"font-mono\">direct</code>, <code class=\"font-mono\">fallback_last_known</code>, <code class=\"font-mono\">fallback_schedule</code>, <code class=\"font-mono\">unknown</code>) afin que les diagnostics expliquent l’évolution d’un compartiment.",
      "internals.s_delta_h": "Politique des deltas (bruit et reprises)",
      "internals.s_delta_p1":
        "Seuls les deltas positifs comptent dans les totaux de consommation. De petits pas négatifs peuvent être assimilés au bruit du compteur (re-baselining sans énergie consommée) ; des écarts négatifs plus marqués peuvent déclencher réancrage ou rejet selon les seuils. Des plafonds limitent les pics aberrants.",
      "internals.s_delta_p2":
        "La dérive entre la lecture du compteur externe et la somme interne est suivie par source afin que le modèle de santé signale des états incohérents ou dégradés sans fausser silencieusement les coûts.",
      "internals.s_day_h": "Bascule de fin de jour (TZ Paris)",
      "internals.s_day_p1":
        "Les journées suivent la date locale Europe/Paris — alignée sur les calendriers Tempo et les fenêtres HC/HP. Lors de la maintenance de minuit, l’intégration finalise les compartiments de la veille, les persiste, écrit les statistiques Recorder pour ce jour ISO, purge les lignes d’accumulateur devenues inutiles et rafraîchit l’instantané public.",
      "internals.s_day_p2":
        "Si Home Assistant était hors ligne à la frontière de jour, des écritures de rattrapage peuvent s’exécuter au redémarrage : le Store mémorise les jours déjà exportés afin de limiter les doublons statistiques lorsque c’est possible.",
      "internals.s_store_h": "Fichier Store",
      "internals.s_store_p1_html":
        "L’intégration persiste les totaux par source, une carte <code class=\"font-mono\">slot_day_kwh[jour][source][créneau]</code>, les dernières lectures brutes, les ancres de dérive, les jours statistiques déjà écrits, des diagnostics optionnels (export réseau / ventilation charge batterie), et les derniers planchers cumulatifs pour les métadonnées des statistiques long terme. Des sauvegardes différées réduisent la sollicitation du disque.",
      "internals.s_store_p2":
        "Si le Store est corrompu ou jugé peu fiable, un chemin protégé peut reconstruire les totaux internes depuis l’historique Recorder pour les jours terminés avant de reprendre le fonctionnement normal — avec un état de confiance « rebuilding » entre-temps.",
      "internals.s_lts_h": "Enregistrement en statistiques long terme",
      "internals.s_lts_p1_html":
        "Pour chaque jour terminé et chaque paire <em>(source, créneau)</em> parmi les six créneaux Tempo canoniques, l’intégration appelle l’API des statistiques externes avec une somme <code class=\"font-mono\">TOTAL_INCREASING</code>. Les identifiants suivent la forme <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> avec une partie source normalisée pour l’id. L’incrément journalier s’ajoute au cumul précédent stocké avec le Store pour que le Recorder voie une série monotone continue par statistique.",
      "internals.s_lts_p2":
        "Ces séries sont la base privilégiée pour l’analyse historique par créneau — plus légère que l’extraction d’attributs bruts, et alignée sur la façon dont le tableau Énergie consomme les statistiques.",
      "internals.s_rebuild_h": "Reconstruction pilotée par le Recorder",
      "internals.s_rebuild_p1":
        "Lorsque c’est possible, l’intégration rejoue d’anciens échantillons de statistiques externes pour retrouver les totaux journaliers par créneau et reconstruire la carte des planchers cumulatifs — puis se réconcilie avec les lectures courantes. Les séries long terme résident dans la base Recorder tandis que les matrices jour / créneau détaillées résident dans le Store ; les deux doivent rester alignées après restauration ou migration.",
      "internals.s_rebuild_p2_html":
        "Si le Recorder est momentanément indisponible, l’étape est ignorée avec un avertissement ; l’intégration poursuit son fonctionnement, mais consultez <code class=\"font-mono\">docs/troubleshooting.md</code> si les capteurs santé / confiance signalent un problème après une opération lourde sur la base.",
      "internals.s_tel_h": "Télémétrie, compartiment inconnu, santé",
      "internals.s_tel_p1":
        "La télémétrie par source inclut les horodatages, les kWh appliqués, le créneau attribué, la méthode de résolution, les intervalles entre applications et la dérive par rapport au compteur. Des compteurs de rejets et le dernier motif d’échec facilitent le diagnostic. Un statut d’entrée distinct signale les entités manquantes ou indisponibles avant tout calcul énergétique.",
      "internals.s_tel_p2_html":
        "Le capteur santé / confiance agrège ces signaux en états simples (<code class=\"font-mono\">ok</code>, <code class=\"font-mono\">degraded</code>, <code class=\"font-mono\">rebuilding</code>, <code class=\"font-mono\">inconsistent</code>) avec des causes lisibles — les mêmes informations que la carte Lovelace peut afficher dans les vues de diagnostic.",
      "internals.footer_html":
        "Pour la mise en service côté utilisateur, revenez à la <a href=\"#/doc\">documentation principale</a>, consultez <a href=\"https://www.home-assistant.io/\" target=\"_blank\" rel=\"noopener noreferrer\">home-assistant.io</a>, ou ouvrez le <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">dépôt GitLab</a>.",

      "nav.contents": "Sommaire",
      "theme.group_aria": "Thème d’affichage",
      "theme.light": "Clair",
      "theme.dark": "Sombre",
      "nav.repository": "Dépôt",
      "nav.lang_aria": "Langue",
      "nav.close_aria": "Fermer",
      "nav.toc_aria": "Table des matières de la page",

      "lang.en": "EN",
      "lang.fr": "FR",

      "toc.on_this_page": "Sur cette page",
      "toc.overview": "Vue d’ensemble",
      "toc.ssot": "Données & SSOT",
      "toc.install": "Installation",
      "toc.lovelace": "Carte Lovelace",
      "toc.configure": "Configurer dans HA",
      "toc.configure_flow_simulator": "Aperçu du flux (généré)",
      "toc.configure_paths": "Parcours captures",
      "toc.configure_delta_caps": "Plafonds de delta",
      "toc.devices": "Appareils",
      "toc.devices_integration": "Liste sous l’intégration",
      "toc.services": "Services",
      "toc.limitations": "Limites",
      "toc.glossary": "Glossaire",
      "toc.lovelace_showcase": "Aperçu carte",
      "toc.lovelace_editor": "Éditeur visuel",
      "toc.devices_gallery": "Dans Home Assistant",

      "common.img_placeholder": "Capture absente — ajoutez le fichier sous",
      "common.image_open_full": "Cliquez ou appuyez sur Entrée pour agrandir",

      "flowsim.region_aria": "Aperçu du flux de configuration (généré)",
      "flowsim.empty": "(pas d’étape)",
      "flowsim.redirect_note": "Cette étape ne fait qu’enchaîner dans le vrai assistant — en principe sans formulaire.",
      "flowsim.disclaimer":
        "Aperçu pédagogique : titres, descriptions et libellés de sélecteurs calqués sur l’intégration. Les enchaînements suivent le vrai assistant dans le code, sans validation d’entités ni appels réseau (EDF/RTE, etc.).",
      "flowsim.branching_hint": "Vos choix déterminent l’étape suivante (même logique de branchement que l’intégration).",
      "flowsim.simulate_existing_batteries": "Aperçu de l’écran Configurer → Batteries (systèmes déjà enregistrés)",
      "flowsim.simulate_existing_batteries_hint":
        "Si cette case est cochée et que vous activez les batteries, l’écran suivant correspond à Paramètres → Hub Énergie → Configurer → Batteries lorsqu’au moins une batterie existe déjà — pas au premier ajout vide.",
      "flowsim.start_over": "Recommencer",
      "flowsim.step_depth": "Étape {n}",
      "flowsim.done_progress": "Terminé",
      "flowsim.done_title": "Configuration terminée (aperçu)",
      "flowsim.done_body":
        "Dans Home Assistant, l’entrée de configuration serait créée. Ici l’aperçu s’arrête — utilisez « Recommencer » pour tester un autre parcours.",
      "flowsim.choose_menu": "Choisissez une option ci-dessous (comme l’étape menu réelle).",
      "flowsim.back": "Précédent",
      "flowsim.flow_nav_continue": "Continuer",
      "flowsim.flow_nav_back": "Revenir à l’étape précédente",
      "flowsim.flow_nav_aria": "Navigation : continuer ou revenir à l’étape précédente",
      "flowsim.next": "Suivant",
      "flowsim.close_aria": "Fermer",
      "flowsim.help_aria": "Aide",
      "flowsim.suffix_per_kwh": "{currency}/kWh",
      "flowsim.suffix_per_month": "{currency}/mois",
      "flowsim.time_placeholder": "--:--",
      "flowsim.time_field_title": "Heure (24 h, hh:mm)",
      "flowsim.entity_search": "Rechercher",
      "flowsim.entity_placeholder": "Sélectionnez une entité",
      "flowsim.entity_clear": "Aucune (vider)",
      "flowsim.entity_domain_sensor": "Capteur",
      "flowsim.entity_domain_number": "Nombre",
      "flowsim.entity_domain_input_number": "Nombre (entrée)",

      "doc.modal_aria": "Capture en grand",
      "doc.modal_close_aria": "Fermer",
      "doc.modal_hint": "Image affichée en pleine largeur : faites défiler cette fenêtre si nécessaire.",

      "carousel.prev": "Précédent",
      "carousel.next": "Suivant",
      "carousel.aria_config": "Captures de l’assistant de configuration",
      "carousel.aria_config_api": "Assistant de config — parcours API Couleur Tempo",
      "carousel.aria_config_manual": "Assistant de config — exemple tarifs manuels",
      "carousel.aria_config_offers": "Captures des types d’offre EDF",
      "carousel.aria_editor": "Captures de l’éditeur de carte Lovelace",
      "carousel.aria_devices": "Captures des appareils",

      "hero.kicker": "Home Assistant · Intégration personnalisée",
      "hero.title": "Suivi énergétique, coûts & diagnostic",
      "hero.lead_html":
        "Configurez fournisseurs et tarifs, suivez les kWh et le coût journalier, avec estimation solaire optionnelle et prise en charge multi-batteries — ainsi qu’une carte Lovelace servie depuis <code class=\"font-mono small\">/hub_energie/</code>.",

      "glance.title": "En bref",
      "glance.ha": "<strong class=\"text-body\">HA</strong> 2024.10.0 ou plus récent",
      "glance.snapshot": "Doc figée <span class=\"badge bg-primary badge-doc\">v{{HUB_ENERGIE_VERSION}}</span>",
      "glance.issues": "Tickets & retours",

      "overview.title": "Vue d’ensemble",
      "overview.intro":
        "Cette page prolonge le README. Pour une première installation, suivez les étapes ci-dessous dans l’ordre.",

      "scope.stable_heading": "Périmètre stable visé (v{{HUB_ENERGIE_VERSION_SERIES}}.x)",
      "scope.stable_li1_html":
        "<strong class=\"text-body\">Assistant de configuration :</strong> fournisseur (EDF ou personnalisé), tarif (prix unique, HP/HC, multi-creuses, Tempo EDF + RTE/API/capteur), réseau et câblage solaire ou batteries optionnel.",
      "scope.stable_li2_html":
        "<strong class=\"text-body\">Énergie :</strong> deltas positifs sur compteurs <code class=\"font-mono\">total_increasing</code> → ventilation par créneau et par jour civil (Europe/Paris), capteurs SSOT de totaux gérés par l’intégration.",
      "scope.stable_li3_html":
        "<strong class=\"text-body\">Coûts :</strong> estimation journalière (€), répartition de l’abonnement, détail par créneau dans les attributs.",
      "scope.stable_li4_html":
        "<strong class=\"text-body\">EDF Tempo :</strong> couleurs, quotas, prochains changements.",
      "scope.stable_li5_html":
        "<strong class=\"text-body\">Diagnostics :</strong> ventilation de l’export réseau, qualité des données, télémétrie des deltas, créneau inconnu, obsolescence ; capteur <strong class=\"text-body\">santé</strong> (<code class=\"font-mono\">ok</code> / <code class=\"font-mono\">degraded</code> / <code class=\"font-mono\">rebuilding</code> / <code class=\"font-mono\">inconsistent</code> / <code class=\"font-mono\">no_input</code>) avec cause lisible.",
      "scope.stable_li6_html": "Production PV « ciel clair » optionnelle et revente solaire si configurée.",
      "scope.stable_li7_html":
        "Lovelace : les paquets précompilés dans <code class=\"font-mono\">frontend/dist/</code> sont versionnés dans le dépôt ; Home Assistant les sert sous <code class=\"font-mono\">/hub_energie/</code>.",

      "scope.exp_heading": "Expérimental / heuristique (capteurs de puissance)",
      "scope.exp_li1":
        "Ventilation de l’origine de la charge batterie à partir des bilans de puissance lorsque les capteurs sont partiels ou bruités.",
      "scope.exp_li2": "Estimation de production solaire (modèle, pas un compteur physique).",
      "scope.exp_li3": "Indicateurs de type coût d’opportunité pour les kWh exportés.",

      "scope.disclaimer_html":
        "Le comportement dépend de votre matériel et du choix des entités (notamment le tableau Énergie). Les listes ci-dessus décrivent l’objectif, pas une garantie pour tous les cas limites.",

      "section.link_aria": "Lien vers cette section",

      "ssot.title": "Sources de données (SSOT)",
      "ssot.intro":
        "Identifier les données qui font foi limite les erreurs de paramétrage du tableau Énergie et la lecture d’attributs inadaptés.",
      "ssot.s1_title": "Compteurs physiques (SSOT externe)",
      "ssot.s1_html":
        "Les entités énergie que vous sélectionnez (<code class=\"font-mono\">grid_import_energy</code>, solaire, export, entrées/sorties par batterie). L’<strong class=\"text-body\">historique Recorder</strong> fait autorité pour les kWh totaux issus du matériel ou d’intégrations en amont.",

      "ssot.s2_title": "Comptabilité interne",
      "ssot.s2_html":
        "Le coordinateur cumule les <strong class=\"text-body\">deltas positifs</strong> en totaux et kWh par créneau et jour. Les capteurs SSOT <code class=\"font-mono\">total_increasing</code> reflètent cette <strong class=\"text-body\">somme interne</strong>, pas une relecture intégrale du compteur à chaque cycle.",

      "ssot.s3_title": "kWh long terme par créneau (quotidien)",
      "ssot.s3_html":
        "Après chaque jour civil (Europe/Paris), écriture des statistiques externes <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code>. À privilégier (avec les compteurs physiques) pour l’analyse historique — pas seul l’historique brut d’attribut <code class=\"font-mono\">cost_detail</code>.",

      "install.title": "Installation",
      "install.intro_html":
        "Installez l’intégration <strong class=\"text-body\">exactement</strong> comme un seul paquet sous la configuration HA :",
      "install.note_html":
        "Home Assistant doit charger <code class=\"font-mono\">custom_components/hub_energie/manifest.json</code>. Évitez un dossier imbriqué du type <code class=\"font-mono\">hub_energie/hub_energie/</code>.",
      "install.release_aria": "Téléchargement ZIP",
      "install.zip_intro_html":
        "Téléchargez l’archive de la version souhaitée. Décompressez-la à la <strong class=\"text-body\">racine</strong> du dossier de configuration de Home Assistant (celui qui contient <code class=\"font-mono\">configuration.yaml</code>) pour obtenir <code class=\"font-mono\">config/custom_components/hub_energie/</code>. L’intégration et la carte tableau de bord sont incluses — rien à compiler sur votre serveur.",
      "install.zip_after_html":
        "Ensuite, faites un <strong class=\"text-body\">redémarrage complet</strong> de Home Assistant et ajoutez l’intégration via <strong class=\"text-body\">Réglages → Appareils et services → Ajouter une intégration</strong>. <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases\" target=\"_blank\" rel=\"noopener noreferrer\">Voir toutes les versions sur GitLab</a> si besoin.",
      "install.release_loading": "Chargement des versions…",
      "install.release_fetch_error": "La liste des versions n’a pas pu être chargée. Utilisez le lien ci-dessous pour télécharger un ZIP sur GitLab.",
      "install.release_none": "Aucune archive n’est encore proposée ici. Consultez le lien ci-dessous sur GitLab.",
      "install.release_download": "Télécharger",
      "install.release_other_label": "Autres versions :",
      "install.choose_path": "Choisissez votre méthode",
      "tab.zip": "Téléchargement ZIP",
      "tab.hacs_store": "Boutique HACS",
      "tab.git": "Clone Git",
      "tab.copy": "Copie des fichiers",

      "install.hacs_tba_heading": "Boutique HACS",
      "install.hacs_tba_html":
        "<p class=\"mb-2\">Hub Énergie n’est pas encore dans le catalogue HACS par défaut. L’écosystème HACS repose surtout sur des dépôts <strong class=\"text-body\">GitHub</strong> ; ce projet est sur <strong class=\"text-body\">GitLab</strong>, vous ne pouvez donc pas l’installer comme une intégration « classique » HACS pour l’instant.</p><p class=\"mb-0\">Privilégiez l’onglet <strong class=\"text-body\">Téléchargement ZIP</strong>, ou <strong class=\"text-body\">Clone Git</strong> / <strong class=\"text-body\">Copie des fichiers</strong>. Si votre version de HACS autorise un <strong class=\"text-body\">dépôt personnalisé</strong> avec une URL GitLab, vous pouvez essayer — le résultat dépend de votre version. Après toute installation, effectuez un <strong class=\"text-body\">redémarrage complet</strong> de Home Assistant.</p>",

      "install.git.s1_title": "Cloner au bon endroit",
      "install.git.s2_title": "Redémarrer & ajouter l’intégration",
      "install.git.s2_p_html":
        "Effectuez un redémarrage <strong>complet</strong> de Home Assistant, puis <a href=\"#configure\">Configurer dans HA</a> (Réglages → Appareils et services → Ajouter une intégration).",

      "install.copy.s1_title": "Copier l’arborescence complète",
      "install.copy.s1_html":
        "Depuis ce dépôt, copiez uniquement l’arborescence <code class=\"font-mono\">custom_components/hub_energie/</code> vers le <code class=\"font-mono\">config/custom_components/hub_energie/</code> de Home Assistant — tous les sous-dossiers (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Ne copiez pas la racine du dépôt (<code class=\"font-mono\">site/</code>, <code class=\"font-mono\">tests/</code>, …) dans HA.",
      "install.copy.s2_title": "Redémarrer & ajouter l’intégration",
      "install.copy.s2_p_html": "Redémarrage complet, puis <a href=\"#configure\">Configurer dans HA</a>.",

      "install.lovelace_title": "Si vous utilisez la carte Lovelace",
      "install.lovelace_body_html":
        "La carte tableau de bord est fournie avec l’intégration. Après une mise à jour, <strong class=\"text-body\">redémarrez Home Assistant</strong> pour que l’interface charge les derniers fichiers. Pour viser une version précise, utilisez la même version pour votre téléchargement ou votre tag Git (voir <code class=\"font-mono\">manifest.json</code> → <code class=\"font-mono\">version</code>).",
      "install.lovelace_dev_html":
        "<strong class=\"text-body\">Développement :</strong> pour reconstruire en local, depuis <code class=\"font-mono\">custom_components/hub_energie/frontend/</code>, exécutez <code class=\"font-mono\">npm ci</code> puis <code class=\"font-mono\">npm run build</code>.",

      "lovelace.title": "Carte Lovelace",
      "lovelace.intro_html":
        "Les artefacts de build (<code class=\"font-mono\">hub-energie-card-boot.js</code>, <code class=\"font-mono\">hub-energie-card.js</code>, <code class=\"font-mono\">hub-energie-card-editor.js</code> et les fragments partagés sous <code class=\"font-mono\">frontend/dist/</code>) sont livrés dans le dépôt et régénérés en CI à chaque commit. Home Assistant expose l’arborescence <code class=\"font-mono\">dist</code> sous <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>. La bande optionnelle <strong class=\"text-body\">Production solaire (énergie)</strong> ventile les kWh (autoconsommation, charge batterie, export attribué) pour le jour ou la plage affichée sur la carte.",

      "lovelace.l1_title": "Tableaux de bord en mode stockage (défaut)",
      "lovelace.l1_html":
        "Au <strong class=\"text-body\">démarrage</strong> et lorsque vous <strong class=\"text-body\">rechargez</strong> l’intégration, elle ajoute ou met à jour cette URL avec un paramètre d’<strong class=\"text-body\">invalidation de cache</strong> <code class=\"font-mono\">?v=…</code> (comme <em>Réglages → Tableaux de bord → Ressources</em>) afin que le navigateur charge les nouveaux fichiers <code class=\"font-mono\">dist/</code>. En général, aucune action manuelle n’est nécessaire.",

      "lovelace.l2_title": "Ressources gérées en YAML",
      "lovelace.l2_p": "Ajoutez vous-même l’URL d’amorçage :",
      "lovelace.l2_note_html":
        "Remplacez les anciennes URL du type <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> par l’URL d’amorçage. Ajoutez <code class=\"font-mono\">?v=&lt;horodatage&gt;</code> si le navigateur conserve un ancien paquet. N’enregistrez pas deux modules pour la même carte.",

      "lovelace.l3_title": "Ajouter la carte",

      "lovelace.showcase_title": "Carte tableau de bord",
      "lovelace.fig_alt": "Carte Lovelace Hub Énergie sur un tableau de bord",
      "lovelace.fig_cap_html":
        "Exemple en mode jour (Tempo, puissance instantanée, consommation, coûts, export réseau). Fichier : <code class=\"font-mono\">site/public/img/hub-energie-card.png</code>.",

      "lovelace.editor_title": "Éditeur visuel",
      "lovelace.editor_intro_html":
        "La carte inclut un éditeur complet (<code class=\"font-mono\">hub-energie-card-editor.js</code> dans le dépôt) pour ajuster la visibilité des sections, les contrôles Tempo, la plage de dates et les remplacements d’entités optionnels — sans YAML.",
      "lovelace.ed1_alt": "Éditeur carte Lovelace — onglet configuration et prévisualisation",
      "lovelace.editor_fig_cap_html":
        "Onglet <strong class=\"text-body\">Configuration</strong> avec bascules de sections et aperçu live. D’autres captures (ex. <strong class=\"text-body\">Visibilité</strong> / <strong class=\"text-body\">Mise en page</strong>) pourront compléter sous <code class=\"font-mono\">lovelace-editor-02.png</code>.",

      "configure.title": "Configurer dans Home Assistant",
      "configure.flow_lead_html":
        "Après un <strong class=\"text-body\">redémarrage complet</strong>, ajoutez l’intégration via <strong class=\"text-body\">Réglages → Appareils et services → Ajouter une intégration</strong>. Le parcours n’est <strong class=\"text-body\">pas linéaire</strong> : les écrans dépendent du fournisseur, du mode auto ou manuel des tarifs, du type d’offre EDF (BASE / HPHC / TEMPO), de la source Tempo, du câblage réseau mono ou triphasé, du solaire et des batteries.",
      "configure.flow_step_help_html":
        "<strong class=\"text-body\">Liens profonds depuis Home Assistant :</strong> chaque boîte de dialogue peut renvoyer vers un <strong class=\"text-body\">complément court</strong> sur une page dédiée, pour ne pas alourdir la documentation principale si vous la parcourez seul. Ouvrir <a href=\"#/doc/setup-help\">Assistant &amp; options — aide par étape</a> (ex. <code class=\"font-mono\">#/doc/setup-help#flow-step-grid</code> ou <code class=\"font-mono\">#flow-step-options-advanced_energy</code>).",

      "flowhelp.kicker": "Home Assistant — boîtes de configuration",
      "flowhelp.title": "Assistant &amp; options — aide par étape",
      "flowhelp.intro_html":
        "Cette page est pensée pour être ouverte depuis Hub Énergie : chaque section correspond à un <code class=\"font-mono\">step_id</code> du flux initial ou du menu <em>Configurer</em>. Le contenu n’apparaît pas dans le fil principal de la documentation tant que vous ne suivez pas un lien.",
      "flowhelp.link_convention_html":
        "<strong class=\"text-body\">Convention d’ancre :</strong> assistant initial → <code class=\"font-mono\">#flow-step-&lt;step_id&gt;</code> ; menu <em>Configurer</em> après installation → <code class=\"font-mono\">#flow-step-options-&lt;step_id&gt;</code> (ex. <code class=\"font-mono\">advanced_energy</code> → <code class=\"font-mono\">#flow-step-options-advanced_energy</code>).",
      "flowhelp.toc_setup": "Assistant initial",
      "flowhelp.toc_options": "Menu Configurer",
      "flowhelp.back_doc": "Retour à la documentation",
      "flowhelp.setup_heading": "Assistant de première installation",
      "flowhelp.options_heading": "Réglages → Hub Énergie → Configurer",
      "flowhelp.footer_html":
        "Graphe de branches et tableau des <code class=\"font-mono\">step_id</code> : <code class=\"font-mono\">custom_components/hub_energie/docs/config-flow.md</code> sur GitLab. Documentation guidée (captures) : <a href=\"#/doc#configure\">Configurer dans HA</a> sur ce site.",

      "configure.flow_map_title": "Arborescence du flux de configuration",
      "configure.flow_map_html":
        "<ul class=\"mb-0 ps-3\"><li><strong class=\"text-body\">Départ</strong> · <em>user</em> — fournisseur (EDF ou autre) et type de phase sur le même formulaire.</li><li><strong class=\"text-body\">Autre fournisseur</strong> · <em>supplier_custom</em> (nom) → tarif forcé en <strong class=\"text-body\">manuel</strong> → <em>contract</em> → assistant prix manuel (prix unique / heures creuses / calendrier) → <strong class=\"text-body\">réseau → solaire → batteries → fin</strong>.</li><li><strong class=\"text-body\">EDF + tarifs automatiques</strong> · <em>tariff_mode</em> (API fournisseur ou manuel) → <em>contract</em> (kVA, nom optionnel) → <em>edf_offer</em> (BASE, HPHC ou TEMPO). Si <strong class=\"text-body\">TEMPO</strong> : <em>edf_tempo</em> — <strong class=\"text-body\">RTE</strong> (API OAuth) ou <strong class=\"text-body\">API Couleur Tempo</strong> (sans identifiants). RTE ajoute <em>edf_tempo_rte</em> (id + secret, validés). Puis récupération des tarifs EDF et enchaînement <strong class=\"text-body\">réseau → solaire → batteries → fin</strong>.</li><li><strong class=\"text-body\">EDF + tarifs manuels</strong> · pas d’écran offre/Tempo ; après <em>contract</em>, même branche prix manuel que « autre fournisseur ».</li><li><strong class=\"text-body\">Après résolution des prix</strong> · <em>grid</em> (import obligatoire ; export / puissance optionnels) ; le <strong class=\"text-body\">triphasé</strong> ajoute des sous-étapes. Puis <em>solar</em> (production, revente, estimation), puis assistant <em>batterie</em> (0..N), puis création de l’entrée.</li></ul>",

      "configure.delta_caps_h": "Plafonds de delta (avancé)",
      "configure.delta_caps_intro_html":
        "Hub Énergie fait avancer vos compteurs kWh <code class=\"font-mono\">total_increasing</code> par <strong class=\"text-body\">bonds</strong>. À chaque cycle, il compare la lecture courante à la dernière mémorisée : la <strong class=\"text-body\">différence positive</strong> est un delta candidat. S’il est <strong class=\"text-body\">sous le plafond</strong> de sa classe (réseau, solaire, batterie, autre), ces kWh sont comptabilisés dans les totaux internes et le créneau tarifaire actif. S’il est <strong class=\"text-body\">au-dessus du plafond</strong>, l’intégration traite le bond comme <strong class=\"text-body\">irréaliste</strong> : ces kWh ne sont <strong class=\"text-body\">pas</strong> ajoutés à la SSOT interne, mais la dernière lecture brute stockée est quand même mise à jour pour que les deltas suivants repartent d’une base cohérente. Les compteurs physiques et l’historique Recorder restent la référence pour les totaux bruts ; ces plafonds protègent la ventilation par créneau et les coûts contre les pics et les rattrapages aberrants après une coupure.",
      "configure.delta_caps_defaults_h": "Plafonds par défaut (kWh par mise à jour)",
      "configure.delta_caps_defaults_html":
        "<ul class=\"mb-0 ps-3\"><li><strong class=\"text-body\">Réseau import &amp; export</strong> — 300 kWh (même plafond pour les deux)</li><li><strong class=\"text-body\">Production solaire</strong> — 120 kWh</li><li><strong class=\"text-body\">Batterie</strong> charge &amp; décharge — 80 kWh par compteur</li><li><strong class=\"text-body\">Toute autre</strong> source configurée — 200 kWh</li></ul><p class=\"mb-0 mt-2\">Vous pouvez remplacer ces quatre valeurs sous <strong class=\"text-body\">Réglages → Hub Énergie → Configurer → Avancé : plafonds de delta (kWh)</strong>.</p>",
      "configure.delta_caps_cases_h": "Cas concrets",
      "configure.delta_caps_cases_html":
        "<ul class=\"mb-0 ps-3\"><li class=\"mb-2\"><strong class=\"text-body\">Coupure courte.</strong> Home Assistant est resté éteint une nuit ; le compteur d’import a pris 12 kWh avant le prochain relevé. Avec le plafond réseau par défaut (300 kWh), les 12 kWh sont appliqués d’un coup, affectés au <em>jour</em> Paris et au <em>créneau</em> courants (pas de reconstitution heure par heure de la coupure).</li><li class=\"mb-2\"><strong class=\"text-body\">Coupure longue ou gros rattrapage.</strong> Le même compteur a bondi de 400 kWh pendant l’arrêt. Un seul delta de 400 dépasse le plafond 300 kWh : la SSOT interne <strong class=\"text-body\">ignore</strong> ce bloc ; journaux / télémétrie de rejet expliquent pourquoi. Si c’est fréquent sur votre site, augmentez le plafond réseau (par ex. 800–1500 kWh) ou faites en sorte que HA reste disponible pour garder des deltas plus petits.</li><li class=\"mb-2\"><strong class=\"text-body\">Pic erroné d’onduleur PV.</strong> L’entité kWh solaire saute de 30 kWh en une lecture alors que la production réelle était faible. Un plafond solaire plus serré (ex. 40 kWh) limite ce qui peut entrer en une fois ; restez au-dessus du maximum <em>réaliste</em> que vous attendez entre deux cycles du hub par beau temps.</li><li class=\"mb-0\"><strong class=\"text-body\">Grosses batteries ou site isolé.</strong> Un pack résidentiel bouge souvent de quelques kWh entre deux mises à jour ; 80 kWh est déjà large. Un gros stockage qui enchaîne des cycles rapides peut exiger un plafond batterie plus haut pour ne pas rejeter de vraies rampes.</li></ul>",
      "configure.delta_caps_ha_html":
        "Ces champs sont un réglage optionnel après installation : ils n’apparaissent <strong class=\"text-body\">pas</strong> dans l’assistant initial, seulement dans <strong class=\"text-body\">Configurer</strong>. La description de la boîte de dialogue renvoie vers ce site pour l’explication détaillée.",

      "configure.flow_simulator_h": "Aperçu interactif du flux",
      "configure.flow_simulator_intro_html":
        "Ce bloc est généré à partir de <code class=\"font-mono\">config_flow.py</code> et <code class=\"font-mono\">strings.json</code> pour que titres, descriptions et libellés suivent l’intégration. L’enchaînement dépend de vos saisies (fournisseur, mode tarifaire, offre, triphasé, solaire/batteries, …) comme dans l’assistant réel. Ce n’est toujours <strong class=\"text-body\">pas</strong> Home Assistant : pas de validation d’entités ni d’appels réseau — les écarts sont volontaires. Après modification de l’assistant, exécutez <code class=\"font-mono\">python scripts/extract_config_flow_catalog.py</code> et validez <code class=\"font-mono\">site/src/data/flowCatalog.generated.json</code>. La CI échoue si ce fichier est obsolète.",
      "configure.paths_h": "Parcours guidés (captures)",
      "configure.flow_paths_intro_html":
        "Choisissez l’onglet qui correspond à votre cas. Chaque onglet montre une <strong class=\"text-body\">suite réelle de boîtes de dialogue Home Assistant</strong> (captures seulement — pas de simulateur). Pour les noms d’étapes <code class=\"font-mono\">step_id</code> et le graphe complet des branches, voir <code class=\"font-mono\">custom_components/hub_energie/docs/config-flow.md</code> dans le dépôt.",

      "configure.path_tab_rte": "Tempo · RTE",
      "configure.path_tab_api": "Tempo · API",
      "configure.path_tab_manual": "Tarifs manuels",
      "configure.path_tab_offers": "Offres EDF",

      "configure.flow_carousel_tree": "Ce parcours (6 étapes)",
      "configure.flow_carousel_tree_api": "Parcours API Couleur (5 étapes)",
      "configure.flow_carousel_tree_manual": "Tarification manuelle (exemple)",
      "configure.flow_carousel_tree_offers": "Captures d’offres",

      "configure.flow_api_5_t": "Source Tempo",
      "configure.flow_api_5_d": "API Couleur Tempo — pas d’étape RTE",
      "configure.flow_api_5_alt": "Hub Énergie — API Couleur Tempo sélectionnée",
      "configure.flow_after_api_html":
        "Après validation, les tarifs EDF sont récupérés en arrière-plan (pas d’écran supplémentaire en cas de succès). Le flux continue avec les <strong class=\"text-body\">capteurs réseau</strong>, puis le <strong class=\"text-body\">solaire</strong> et les <strong class=\"text-body\">batteries</strong> — non illustrés ici pour l’instant.",

      "configure.flow_m_2_t": "Mode tarifaire",
      "configure.flow_m_2_d": "Tarification manuelle",
      "configure.flow_m_2_alt": "Hub Énergie — mode tarifaire manuel",
      "configure.flow_m_4_t": "Tarification manuelle",
      "configure.flow_m_4_d": "Structure, base, devise",
      "configure.flow_m_4_alt": "Hub Énergie — tarification manuelle (exemple prix unique)",
      "configure.flow_m_5_t": "Réseau",
      "configure.flow_m_5_d": "Exemple monophasé",
      "configure.flow_m_5_alt": "Hub Énergie — capteurs réseau (mono)",
      "configure.flow_m_flat_t": "Tarif fixe",
      "configure.flow_m_flat_d": "Prix kWh & abonnement",
      "configure.flow_m_flat_alt": "Hub Énergie — tarif manuel prix unique (kWh + abonnement)",
      "configure.flow_after_manual_html":
        "Six étapes : après la <strong class=\"text-body\">structure</strong> tarifaire prix unique viennent le <strong class=\"text-body\">prix au kWh et l’abonnement</strong>, puis le <strong class=\"text-body\">réseau</strong>. Les modes HP/HC ou calendrier avancé remplaceraient la paire « prix unique » par des branches plus longues. Le triphasé ajoute des sous-étapes. Le <strong class=\"text-body\">solaire</strong> / les <strong class=\"text-body\">batteries</strong> ne sont toujours pas montrés ici.",

      "configure.flow_o_1_t": "BASE",
      "configure.flow_o_1_d": "Offre prix unique",
      "configure.flow_o_1_alt": "Hub Énergie — offre EDF BASE",
      "configure.flow_o_2_t": "HPHC",
      "configure.flow_o_2_d": "Heures pleines / creuses",
      "configure.flow_o_2_alt": "Hub Énergie — offre EDF HPHC",
      "configure.flow_o_3_t": "TEMPO (choix)",
      "configure.flow_o_3_d": "Même écran que sur les autres parcours",
      "configure.flow_o_3_alt": "Hub Énergie — offre EDF avec TEMPO sélectionné",
      "configure.flow_after_offers_html":
        "Ces vues servent de <strong class=\"text-body\">références côte à côte</strong> pour l’apparence de chaque type d’offre. Dans un vrai assistant, vous n’en choisissez qu’une ; les parcours automatiques récupèrent ensuite les tarifs (si applicable) et passent au <strong class=\"text-body\">réseau</strong>.",

      "configure.flow_ex_1_t": "Utilisateur",
      "configure.flow_ex_1_d": "Fournisseur & phase",
      "configure.flow_ex_2_t": "Mode tarifaire",
      "configure.flow_ex_2_d": "Automatique (API) ou manuel",
      "configure.flow_ex_3_t": "Contrat",
      "configure.flow_ex_3_d": "Puissance souscrite & nom optionnel",
      "configure.flow_ex_4_t": "Offre EDF",
      "configure.flow_ex_4_d": "BASE, HPHC ou TEMPO",
      "configure.flow_ex_5_t": "Source Tempo",
      "configure.flow_ex_5_d": "RTE ou API Couleur Tempo",
      "configure.flow_ex_6_t": "Identifiants RTE",
      "configure.flow_ex_6_d": "Si vous choisissez RTE",
      "configure.flow_ex_1_alt": "Hub Énergie — utilisateur : fournisseur et phase",
      "configure.flow_ex_2_alt": "Hub Énergie — mode de récupération tarifaire",
      "configure.flow_ex_3_alt": "Hub Énergie — détails du contrat",
      "configure.flow_ex_4_alt": "Hub Énergie — sélection de l’offre EDF",
      "configure.flow_ex_5_alt": "Hub Énergie — source du signal Tempo",
      "configure.flow_ex_6_alt": "Hub Énergie — identifiants API RTE",
      "configure.flow_after_rte_html":
        "Après des identifiants valides (ou si vous choisissez <strong class=\"text-body\">API Couleur Tempo</strong>), les tarifs EDF sont récupérés, puis suivent les <strong class=\"text-body\">capteurs réseau</strong> (import obligatoire ; le triphasé ajoute des écrans), le <strong class=\"text-body\">solaire</strong> et les <strong class=\"text-body\">batteries</strong>. Ces étapes ne sont pas encore illustrées — partagez des captures d’écran si vous souhaitez les ajouter à la doc.",

      "devices.title": "Modèle d’appareils",
      "devices.intro":
        "Un appareil Home Assistant par périmètre logique. Les entités sont regroupées selon les domaines mesurés ou configurés ; voir <code class=\"font-mono\">CHANGELOG.md</code> pour le détail.",

      "devices.integration_title": "Page de l’intégration",
      "devices.integration_alt": "Entrée Hub Énergie avec la liste des appareils",
      "devices.integration_cap_html":
        "<strong class=\"text-body\">Réglages → Appareils et services → Hub Énergie</strong> : une entrée de configuration (pont) regroupe les appareils logiques — par exemple Offre, Réseau, Solaire, une ligne par batterie, la synthèse batteries, Bilan énergétique, Coûts, Diagnostics. Les libellés (ex. « Toutes batteries ») et le nombre d’entités varient selon votre installation.",

      "devices.th_device": "Appareil",
      "devices.th_purpose": "Rôle",
      "devices.p_offre": "Tarif, fournisseur, contrat",
      "devices.p_reseau": "Capteurs énergie / puissance réseau",
      "devices.p_solaire": "Mesure ou estimation solaire",
      "devices.p_batt": "Système par batterie (0..N)",
      "devices.p_battsum": "Synthèse batteries agrégée",
      "devices.p_bilan": "Flux énergétiques calculés (kWh)",
      "devices.p_couts": "Montants (€)",
      "devices.p_diag": "Santé, diagnostics d’export réseau",

      "devices.gallery_title": "Appareils dans l’interface",
      "devices.gallery_intro_html":
        "Chaque appareil regroupe les entités associées. Ci-dessous, un volet par appareil pour illustrer la structure dans <strong class=\"text-body\">Réglages → Appareils et services</strong>.",
      "devices.gallery_multishot_html":
        "Pour les appareils avec de nombreuses entités, vous pourrez ajouter d’autres PNG (ex. <code class=\"font-mono\">device-ui-02-reseau-2.png</code>) — la documentation pourra intégrer un carrousel imbriqué lorsque ces fichiers seront disponibles.",
      "devices.tree_label": "Appareil",
      "devices.g1_t": "Offre",
      "devices.g1_d": "Tarif, fournisseur, contrat",
      "devices.g2_t": "Réseau",
      "devices.g2_d": "Énergie / puissance réseau",
      "devices.g3_t": "Solaire",
      "devices.g3_d": "Mesure ou estimation solaire",
      "devices.g4_t": "Batterie",
      "devices.g4_d": "Une instance batterie",
      "devices.g5_t": "Batteries (total)",
      "devices.g5_d": "Synthèse agrégée",
      "devices.g6_t": "Bilan énergétique",
      "devices.g6_d": "Flux kWh calculés",
      "devices.g7_t": "Coûts",
      "devices.g7_d": "Capteurs monétaires",
      "devices.g8_t": "Diagnostics",
      "devices.g8_d": "Santé et export réseau",
      "devices.g1_alt": "Appareil Hub Énergie — Offre",
      "devices.g2_alt": "Appareil Hub Énergie — Réseau",
      "devices.g3_alt": "Appareil Hub Énergie — Solaire",
      "devices.g4_alt": "Appareil Hub Énergie — Batterie",
      "devices.g5_alt": "Appareil Hub Énergie — Batteries (total)",
      "devices.g6_alt": "Appareil Hub Énergie — Bilan énergétique",
      "devices.g7_alt": "Appareil Hub Énergie — Coûts",
      "devices.g8_alt": "Appareil Hub Énergie — Diagnostics",

      "services.title": "Services",
      "services.th_service": "Service",
      "services.th_desc": "Description",
      "services.r1": "Forcer un rafraîchissement du coordinateur",
      "services.r2": "Retélécharger les tarifs EDF (mode auto)",

      "limitations.title": "Limites",
      "limitations.li1":
        "La rétention du Recorder limite la profondeur d’historique, les graphiques et les scénarios de reconstruction depuis le Recorder.",
      "limitations.li2":
        "L’estimation solaire optionnelle repose sur un modèle « ciel clair » — valeur indicative, pas un compteur de production.",
      "limitations.li3_html":
        "Le graphe de puissance de la carte repose sur les statistiques ; un <code class=\"font-mono\">state_class</code> manquant ou peu d’historique peut le laisser vide.",
      "limitations.li4_html":
        "Les états de santé agrègent plusieurs contrôles ; une courte période <code class=\"font-mono\">rebuilding</code> après reconstruction via le Recorder est attendue.",
      "limitations.li5_html":
        "Détails : <code class=\"font-mono\">docs/troubleshooting.md</code> dans le dépôt (confiance, créneau inconnu, récupération).",

      "glossary.title": "Mesuré, reconstruit, estimé",
      "glossary.th_kind": "Type",
      "glossary.th_meaning": "Signification",
      "glossary.measured": "Mesuré",
      "glossary.measured_html":
        "Valeurs issues de vos entités HA configurées (kWh <code class=\"font-mono\">total_increasing</code>, puissance si câblée).",
      "glossary.recon": "Reconstruit",
      "glossary.recon_d":
        "Totaux internes et kWh par créneau dérivés des deltas et, le cas échéant, du rejouage Recorder.",
      "glossary.est": "Estimé",
      "glossary.est_d":
        "Valeurs heuristiques ou modélisées sans compteur d’énergie direct — ex. PV « ciel clair », ventilations déduites des capteurs de puissance.",

      "footer.p1_html":
        "Hub Énergie — documentation figée <strong class=\"text-body\">v{{HUB_ENERGIE_VERSION}}</strong>. Référence détaillée : README et <code class=\"font-mono\">docs/</code> dans le <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">projet GitLab</a>. Plateforme officielle : <a href=\"https://www.home-assistant.io/\" target=\"_blank\" rel=\"noopener noreferrer\">Home Assistant</a>.",
      "footer.license": "Licence : voir le dépôt.",
      "footer.brand_name": "Hub Énergie",
      "footer.brand_aria": "Hub Énergie",
      "footer.primary_links_aria": "Liens du projet",
      "footer.link_gitlab": "GitLab",
      "footer.social_note": "Liens communautaires — bientôt disponibles.",
      "footer.social_group_aria": "Réseaux sociaux et inscription à la newsletter",
      "social.facebook": "Facebook",
      "social.discord": "Discord",
      "social.newsletter": "Newsletter",
      "social.coming_soon": "Bientôt disponible",
    },
  };
})(typeof window !== "undefined" ? window : this);
