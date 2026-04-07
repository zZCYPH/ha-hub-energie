(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();(function(e){e.HubEnergieI18n={en:{"meta.title":"Hub Énergie — Documentation","meta.description":"Hub Énergie — Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.","meta.title.landing":"Hub Énergie — Home energy, centralized","meta.description.landing":"Hub Énergie — one Home Assistant integration for tariffs, energy, costs, solar, batteries, and diagnostics.","meta.title.internals":"Hub Énergie — Behind the scenes","meta.description.internals":"How Hub Énergie attributes kWh to tariff slots, persists state, and writes Home Assistant long-term statistics.","nav.home":"Home","nav.documentation":"Documentation","nav.internals":"How it works behind the scenes","nav.internals_short":"Behind the scenes","doc.hero_internals_cta":"How it works behind the scenes","doc.hero_internals_hint":"Slot attribution, per-day buckets, Store, and long-term statistics — for readers who want the full pipeline.","landing.kicker":"Home Assistant · Energy intelligence","landing.headline":"Centralize your site’s energy story","landing.lead_html":"One integration ties your tariff, meters, solar, batteries, costs, and diagnostics together — so you configure once and read a coherent picture in Home Assistant.","landing.cta_discover":"Discover","landing.cta_internals":"How it works","landing.cta_discover_footer":"Discover the documentation","landing.version_note":"Documentation snapshot v0.2.3","landing.f1_title":"True centralization","landing.f1_body":"Offer, grid, solar, per-battery devices, energy balance, costs, and diagnostics are grouped under one integration instead of scattered helpers and templates.","landing.f2_title":"Tariff-aware accounting","landing.f2_body":"Deltas from your kWh meters are split into tariff slots (including EDF Tempo) using explicit resolution rules, with fallbacks and observability when signals are missing.","landing.f3_title":"Costs tied to usage","landing.f3_body":"Daily estimates, subscription split, and per-slot detail stay aligned with the same snapshot the Lovelace card consumes.","landing.f4_title":"Durable history","landing.f4_body":"Internal SSOT sensors reflect running totals; completed Paris days are written to long-term statistics for analytics and graphs.","landing.f5_title":"Card included","landing.f5_body":"A maintained Lovelace bundle is served from your Home Assistant host at /hub_energie/ — no separate frontend project to host.","landing.f6_title":"Honest diagnostics","landing.f6_body":"Health, data quality, delta telemetry, and trust hints help you see when inputs are partial or when the integration is rebuilding state.","landing.footer_html":'Hub Énergie · <a href="#/doc">Documentation</a> · <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab</a>',"toc.internals_title":"On this page","toc.internals_overview":"Pipeline","toc.internals_sources":"Energy sources","toc.internals_slots":"Tariff slots","toc.internals_attribution":"Slot attribution","toc.internals_deltas":"Deltas & policy","toc.internals_day":"Paris day buckets","toc.internals_store":"Store file","toc.internals_lts":"Long-term statistics","toc.internals_rebuild":"Recorder rebuild","toc.internals_telemetry":"Telemetry & quality","internals.kicker":"Implementation notes","internals.title":"How it works behind the scenes","internals.subtitle":"Business logic for categorizing energy into tariff slots, persisting running totals, and registering daily kWh in Home Assistant statistics — without replacing your physical meters as ground truth.","internals.back_to_doc":"Back to documentation","internals.s_overview_h":"End-to-end pipeline","internals.s_overview_p1":"At a high level: configured energy entities (total_increasing kWh) are watched by the coordinator. Each positive delta is tagged with the tariff slot active at the time of the delta (in Europe/Paris), then summed into per-source totals and into per-day / per-slot buckets. After a Paris calendar day is complete, those buckets feed Home Assistant external statistics so you get durable graphs per slot and source. A JSON Store keeps the running sums and recent day maps so restarts stay consistent.","internals.s_overview_p2_html":'Physical recorder history for the entities you picked remains the external SSOT for raw meter values; integration SSOT sensors expose the <strong class="text-body">internally accumulated</strong> totals used for slot splits and cost snapshots.',"internals.s_sources_h":"Energy sources (accumulator keys)","internals.s_sources_p1":"Each configured meter maps to a source key (for example grid import, grid export, solar, per-battery charge and discharge). The set of expected keys is derived from your configuration: only sources with a bound entity participate in statistics writes. Three-phase installs can synthesize summed “virtual” entities for bookkeeping while still using your phase meters upstream.","internals.s_sources_p2":"Because writes to long-term statistics require a complete matrix of sources for a finished day, a day is skipped if any expected source is missing from the internal day map — protecting you from silently writing partial data.","internals.s_slots_h":"Tariff slot grid","internals.s_slots_p1_html":'EDF Tempo exposes six physical price bands encoded as slot ids: <code class="font-mono">bleu_hc</code>, <code class="font-mono">bleu_hp</code>, <code class="font-mono">blanc_hc</code>, <code class="font-mono">blanc_hp</code>, <code class="font-mono">rouge_hc</code>, <code class="font-mono">rouge_hp</code>. BASE collapses to HP-only; HP/HC uses two bands mapped onto the same naming pattern; non-EDF manual tariffs still use the HC/HP naming for compatibility while prices come from your manual tables.',"internals.s_slots_p2_html":'An additional attribution bucket <code class="font-mono">unknown</code> exists only in live bookkeeping when no definite slot can be resolved. Completed days written to recorder statistics use the six canonical slots; the unknown bucket is surfaced through diagnostics for transparency.',"internals.s_attr_h":"How a delta picks a slot","internals.s_attr_p1":"When a delta is applied, the coordinator resolves the current slot in order: primary resolver (including Tempo calendar or colour, optional user slot sensor, wall-clock off-peak rules), then “last known good” stable slot if the primary result is ambiguous, then a schedule-only fallback from frozen EDF runtime fields and Paris time. If nothing matches a canonical slot, the attribution is classified as unknown — energy is still accumulated so it is not dropped silently.","internals.s_attr_p2_html":'The resolution method is recorded alongside the delta (<code class="font-mono">direct</code>, <code class="font-mono">fallback_last_known</code>, <code class="font-mono">fallback_schedule</code>, <code class="font-mono">unknown</code>) so diagnostics can explain why a given bucket grew.',"internals.s_delta_h":"Delta policy (noise & rollbacks)","internals.s_delta_p1":"Only forward / positive deltas are counted toward consumption totals. Small negative steps can be treated as meter jitter (re-baselining without consuming energy); larger negative changes may trigger re-anchoring or discards according to integration thresholds. Caps guard against runaway spikes when data glitches.","internals.s_delta_p2":"Drift between the external meter reading and the internal running sum is tracked per source so the health model can report inconsistent or degraded trust states without surprising silently shifted costs.","internals.s_day_h":"Paris day rollover","internals.s_day_p1":"Day boundaries follow Europe/Paris local dates — consistent with Tempo calendars and HP/HC split times. At scheduled midnight maintenance the integration finalizes yesterday’s buckets, persists them, writes recorder statistics for that ISO day, trims old accumulator rows it no longer needs, and refreshes the public snapshot.","internals.s_day_p2":"If Home Assistant was offline across a boundary, catch-up writes can still occur after restart: the Store records which days were successfully exported so duplicate statistics inserts are avoided when possible.","internals.s_store_h":"Store file","internals.s_store_p1_html":'The integration persists totals per source, a map of <code class="font-mono">slot_day_kwh[day][source][slot]</code>, last raw meter readings, drift anchors, which statistic days were written, optional reinjection / battery-split diagnostics, and the last known cumulative floors used for long-term statistics metadata. Debounced saves avoid hammering disk on busy systems.',"internals.s_store_p2":"If the Store payload is corrupt or too old to trust, a guarded path can rebuild internal totals from recorder history for completed days before normal operation resumes — surfacing a rebuilding trust state in the meantime.","internals.s_lts_h":"Long-term statistics registration","internals.s_lts_p1_html":'For each finished day and for each pair <em>(source, slot)</em> among the six canonical Tempo slots, the integration calls Home Assistant’s external statistics API with a <code class="font-mono">TOTAL_INCREASING</code> sum. Statistic ids look like <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> where the source segment is normalized for id safety. The daily increment for that id is added on top of the previous cumulative sum stored alongside the Store so the recorder sees one continuous monotonic series per series.',"internals.s_lts_p2":"Those series are the preferred basis for historical analytics that need stable per-slot kWh — lighter than mining raw template attributes, and aligned with how the Energy dashboard expects statistics.","internals.s_rebuild_h":"Recorder-driven rebuild","internals.s_rebuild_p1":"When feasible, the integration replays prior external statistic samples to recover daily slot totals and rebuild the cumulative floor map — then reconciles against current entity readings. This path exists because long-term statistic series live in the recorder database while detailed per-slot day matrices live in the Store; both need to stay aligned after restores or migrations.","internals.s_rebuild_p2_html":'If the recorder is temporarily unavailable the rebuild step is skipped with a warning; operation continues, but you should consult <code class="font-mono">docs/troubleshooting.md</code> when trust / health sensors complain after major database operations.',"internals.s_tel_h":"Telemetry, unknown bucket, health","internals.s_tel_p1":"Per-source delta telemetry exposes timestamps, applied kWh, attributed slot, resolution method, gaps between applies, and drift versus the external meter. Aggregated discard counters and last-rejection payloads help trace policy decisions during support. Separate input status tracks missing or unavailable entities before energy math even runs.","internals.s_tel_p2_html":'The health / trust sensor combines these signals into coarse states such as <code class="font-mono">ok</code>, <code class="font-mono">degraded</code>, <code class="font-mono">rebuilding</code>, or <code class="font-mono">inconsistent</code> with human readable causes — the same signals the Lovelace card can surface in diagnostics views.',"internals.footer_html":'For user-facing setup, return to the <a href="#/doc">main documentation</a> or the <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab repository</a>.',"nav.contents":"Contents","theme.group_aria":"Display theme","theme.light":"Light","theme.dark":"Dark","nav.repository":"Repository","nav.lang_aria":"Language","nav.close_aria":"Close","nav.toc_aria":"Page table of contents","lang.en":"EN","lang.fr":"FR","toc.on_this_page":"On this page","toc.overview":"Overview","toc.ssot":"Data & SSOT","toc.install":"Install","toc.lovelace":"Lovelace card","toc.configure":"Configure in HA","toc.devices":"Devices","toc.devices_integration":"Integration device list","toc.services":"Services","toc.limitations":"Limitations","toc.glossary":"Glossary","toc.lovelace_showcase":"Card preview","toc.lovelace_editor":"Visual editor","toc.devices_gallery":"In Home Assistant","common.img_placeholder":"Screenshot missing — add file under","common.image_open_full":"Click or press Enter to open full size","doc.modal_aria":"Full-size screenshot","doc.modal_close_aria":"Close","doc.modal_hint":"The image is shown at full width. Scroll inside this window if needed.","carousel.prev":"Previous","carousel.next":"Next","carousel.aria_config":"Config flow screenshots","carousel.aria_editor":"Lovelace card editor screenshots","carousel.aria_devices":"Device list screenshots","hero.kicker":"Home Assistant · Custom integration","hero.title":"Energy monitoring, costs & diagnostics","hero.lead_html":'Configure suppliers and tariffs, track kWh and daily cost, optional solar estimation and multi-battery support — with a Lovelace card served from <code class="font-mono small">/hub_energie/</code>.',"glance.title":"At a glance","glance.ha":'<strong class="text-body">HA</strong> 2024.10.0 or newer',"glance.snapshot":'Doc snapshot <span class="badge bg-primary badge-doc">v0.2.3</span>',"glance.issues":"Issues & feedback","overview.title":"Overview","overview.intro":"This page is a guided companion to the README. Use the steps below in order when setting up for the first time.","scope.stable_heading":"Intended stable scope (v0.2.x)","scope.stable_li1_html":'<strong class="text-body">Config flow:</strong> supplier (EDF vs custom), tariff (flat, HP–HC, multi-slot, EDF Tempo + RTE/API/sensor), grid and optional solar/battery wiring.',"scope.stable_li2_html":'<strong class="text-body">Energy:</strong> positive deltas from <code class="font-mono">total_increasing</code> meters → slot-day accounting (Paris day) and SSOT total sensors owned by the integration.',"scope.stable_li3_html":'<strong class="text-body">Costs:</strong> daily estimate (€), subscription split, per-slot detail in attributes.',"scope.stable_li4_html":'<strong class="text-body">EDF Tempo:</strong> colours, quotas, next-change times.',"scope.stable_li5_html":'<strong class="text-body">Diagnostics:</strong> réinjection split, data quality, delta telemetry, unknown bucket, staleness; <strong class="text-body">health</strong> sensor (<code class="font-mono">ok</code> / <code class="font-mono">degraded</code> / <code class="font-mono">rebuilding</code> / <code class="font-mono">inconsistent</code> / <code class="font-mono">no_input</code>) with a readable cause.',"scope.stable_li6_html":"Optional clear-sky PV and solar resale when configured.","scope.stable_li7_html":'Lovelace: pre-built bundles in <code class="font-mono">frontend/dist/</code> are versioned in the repo; Home Assistant serves them at <code class="font-mono">/hub_energie/</code>.',"scope.exp_heading":"Experimental / best-effort","scope.exp_li1":"Power-flow battery charge origin split when sensors are partial or noisy.","scope.exp_li2":"Solar production estimation (model-based, not a physical meter).","scope.exp_li3":"Opportunity-cost style diagnostics for exported kWh.","scope.disclaimer_html":"Behaviour depends on your hardware and entity choices (especially the Energy dashboard). The lists above describe intent, not a warranty for every edge case.","section.link_aria":"Link to section","ssot.title":"Data sources (SSOT)","ssot.intro":"Knowing what is authoritative avoids misconfiguring the Energy panel or the wrong attributes.","ssot.s1_title":"Physical meters (external SSOT)","ssot.s1_html":'The energy entities you select (<code class="font-mono">grid_import_energy</code>, solar, export, per-battery in/out). <strong class="text-body">Recorder history</strong> is ground truth for total kWh from hardware or upstream integrations.',"ssot.s2_title":"Internal accounting","ssot.s2_html":'The coordinator accumulates <strong class="text-body">positive deltas</strong> into totals and per-day slot kWh. Integration <code class="font-mono">total_increasing</code> SSOT sensors reflect this <strong class="text-body">internal sum</strong>, not a full re-read of the meter every cycle.',"ssot.s3_title":"Long-term per-slot kWh (daily)","ssot.s3_html":'After each Paris day, external statistics <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> are written. Use these (or physical meters) for historical analytics — not raw <code class="font-mono">cost_detail</code> attribute history alone.',"install.title":"Installation","install.intro_html":'Install the repository <strong class="text-body">exactly</strong> as one package under your HA config:',"install.note_html":'Home Assistant must load <code class="font-mono">custom_components/hub_energie/manifest.json</code>. Avoid a nested folder such as <code class="font-mono">hub_energie/hub_energie/</code>.',"install.choose_path":"Choose your path","tab.hacs_tba":"HACS (TBA)","tab.git":"Git clone","tab.copy":"Copy files","install.hacs_tba_heading":"HACS default store — to be confirmed","install.hacs_tba_html":'<p class="mb-2">The public <strong class="text-body">HACS</strong> catalogue is built around <strong class="text-body">GitHub</strong>-hosted repositories (<a href="https://hacs.xyz/docs/publish/start/" target="_blank" rel="noopener noreferrer">publishing rules</a>). This project lives on <strong class="text-body">GitLab</strong>, so a frictionless “search and install” entry in the default store is <strong class="text-body">not available yet</strong>.</p><p class="mb-0">For now use <strong class="text-body">Git clone</strong> or <strong class="text-body">Copy files</strong> (tabs above). If your HACS build allows <strong class="text-body">custom repositories</strong> with a GitLab URL, you can try adding the integration that way — support varies by version. After install, always perform a <strong class="text-body">full restart</strong> of Home Assistant.</p>',"install.git.s1_title":"Clone into the right folder","install.git.s2_title":"Restart & add the integration","install.git.s2_p_html":'Full restart of Home Assistant, then <a href="#configure">Configure in HA</a> (Settings → Devices &amp; services → Add integration).',"install.copy.s1_title":"Copy the full tree","install.copy.s1_html":'From this repository, copy only the <code class="font-mono">custom_components/hub_energie/</code> tree into your Home Assistant <code class="font-mono">config/custom_components/hub_energie/</code> — all subfolders (<code class="font-mono">battery/</code>, <code class="font-mono">energy/</code>, <code class="font-mono">frontend/</code>, etc.). Do not copy the repo root (<code class="font-mono">public/</code>, <code class="font-mono">tests/</code>, …) into HA.',"install.copy.s2_title":"Restart & add the integration","install.copy.s2_p_html":'Full restart, then <a href="#configure">Configure in HA</a>.',"install.lovelace_title":"If you use the Lovelace card","install.lovelace_body_html":'The card bundles under <code class="font-mono">frontend/dist/</code> are committed to this repository (rebuilt in CI on each commit). You do <strong class="text-body">not</strong> need <code class="font-mono">npm</code> on your Home Assistant host for a normal install—restart HA after updating the integration. For reproducible installs, match a Git tag to <code class="font-mono">manifest.json</code> → <code class="font-mono">version</code> (e.g. <strong class="text-body">v0.2.3</strong>).',"install.lovelace_dev_html":'<strong class="text-body">Developers:</strong> to rebuild locally, from <code class="font-mono">custom_components/hub_energie/frontend/</code> run <code class="font-mono">npm ci</code> then <code class="font-mono">npm run build</code>.',"lovelace.title":"Lovelace card","lovelace.intro_html":'Built assets (<code class="font-mono">hub-energie-card-boot.js</code>, <code class="font-mono">hub-energie-card.js</code>, <code class="font-mono">hub-energie-card-editor.js</code>, and shared chunks under <code class="font-mono">frontend/dist/</code>) are shipped in the repo and refreshed by CI each commit. Home Assistant serves the <code class="font-mono">dist</code> tree at <strong class="text-body"><code class="font-mono">/hub_energie/</code></strong>. Since <strong class="text-body">v0.2.3</strong>, the optional <strong class="text-body">Solar production (energy)</strong> bar splits kWh (self-use, battery charge, attributed export) for the card’s selected day/range.',"lovelace.l1_title":"Storage-mode dashboards (default)","lovelace.l1_html":'On startup and when you <strong class="text-body">reload</strong> the integration, it adds or updates that URL with a <strong class="text-body">cache-busting</strong> <code class="font-mono">?v=…</code> query (same as <em>Settings → Dashboards → Resources</em>) so new <code class="font-mono">dist/</code> files load in the browser. Usually nothing to do manually.',"lovelace.l2_title":"YAML-managed resources","lovelace.l2_p":"Add the boot URL yourself:","lovelace.l2_note_html":'Replace legacy URLs such as <code class="font-mono">/hub_energie/dist/hub-energie-card.js</code> with the boot URL. Append <code class="font-mono">?v=&lt;timestamp&gt;</code> if the browser keeps an old bundle. Do not register duplicate modules for the same card.',"lovelace.l3_title":"Add the card","lovelace.showcase_title":"Dashboard card","lovelace.fig_alt":"Hub Énergie Lovelace card on a dashboard","lovelace.fig_cap_html":'Example of the card in daily mode (Tempo, instant power, consumption, costs, reinjection). File: <code class="font-mono">public/img/hub-energie-card.png</code>.',"lovelace.editor_title":"Visual editor","lovelace.editor_intro_html":'The card exposes a rich editor (<code class="font-mono">hub-energie-card-editor.js</code> in the repo) to tune section visibility, Tempo controls, date period, and optional entity overrides — without YAML.',"lovelace.ed1_alt":"Lovelace card editor — configuration tab with live preview","lovelace.editor_fig_cap_html":'<strong class="text-body">Configuration</strong> tab with section toggles and live card preview. Extra captures (e.g. <strong class="text-body">Visibilité</strong> / <strong class="text-body">Mise en page</strong>) can be added later as <code class="font-mono">lovelace-editor-02.png</code> if you want a second slide.',"configure.title":"Configure in Home Assistant","configure.flow_lead_html":'After a <strong class="text-body">full restart</strong>, add the integration under <strong class="text-body">Settings → Devices &amp; services → Add integration</strong>. The assistant is <strong class="text-body">not linear</strong>: screens depend on supplier, automatic vs manual tariffs, EDF offer (BASE / HPHC / TEMPO), Tempo data source, single- vs three-phase grid wiring, solar, and batteries.',"configure.flow_map_title":"How the config flow branches","configure.flow_map_html":'<ul class="mb-0 ps-3"><li><strong class="text-body">Start</strong> · <em>user</em> — supplier (EDF or other) and phase type on the same form.</li><li><strong class="text-body">Other supplier</strong> · <em>supplier_custom</em> (name) → tariff mode is forced to <strong class="text-body">manual</strong> → <em>contract</em> → manual pricing wizard (flat / time-of-use / schedule) → <strong class="text-body">grid → solar → batteries → finish</strong>.</li><li><strong class="text-body">EDF + automatic tariffs</strong> · <em>tariff_mode</em> (provider API vs manual) → <em>contract</em> (kVA, optional name) → <em>edf_offer</em> (BASE, HPHC, or TEMPO). If <strong class="text-body">TEMPO</strong>: <em>edf_tempo</em> choose <strong class="text-body">RTE</strong> (OAuth API) or <strong class="text-body">API Couleur Tempo</strong> (no credentials). RTE adds <em>edf_tempo_rte</em> (client id + secret, validated against the API). Then EDF prices are fetched and you continue to <strong class="text-body">grid → solar → batteries → finish</strong>.</li><li><strong class="text-body">EDF + manual tariffs</strong> · skips EDF offer/Tempo; after <em>contract</em> you enter the same manual pricing branch as “other supplier”.</li><li><strong class="text-body">After pricing is resolved</strong> · <em>grid</em> picks import (and optional export / power); <strong class="text-body">three-phase</strong> adds sub-steps (per-phase vs combined sensors). Then <em>solar</em> (optional production / resale / estimation), then <em>battery</em> wizard (0..N systems), then create entry.</li></ul>',"configure.flow_example_path_html":'The carousel below follows one <strong class="text-body">documented path</strong>: <strong class="text-body">EDF · mono · automatic tariffs · TEMPO · RTE</strong> (screens <code class="font-mono">config-flow-edf-01-user.png</code> … <code class="font-mono">06-rte-credentials.png</code>).',"configure.flow_carousel_tree":"This path (6 steps)","configure.flow_ex_1_t":"User","configure.flow_ex_1_d":"Supplier & phase","configure.flow_ex_2_t":"Tariff mode","configure.flow_ex_2_d":"Automatic (API) vs manual","configure.flow_ex_3_t":"Contract","configure.flow_ex_3_d":"Subscribed power & optional name","configure.flow_ex_4_t":"EDF offer","configure.flow_ex_4_d":"BASE, HPHC, or TEMPO","configure.flow_ex_5_t":"Tempo source","configure.flow_ex_5_d":"RTE or API Couleur Tempo","configure.flow_ex_6_t":"RTE credentials","configure.flow_ex_6_d":"Only if RTE is selected","configure.flow_ex_1_alt":"Hub Énergie config — user: supplier and phase","configure.flow_ex_2_alt":"Hub Énergie config — tariff recovery mode","configure.flow_ex_3_alt":"Hub Énergie config — contract details","configure.flow_ex_4_alt":"Hub Énergie config — EDF offer type","configure.flow_ex_5_alt":"Hub Énergie config — Tempo signal source","configure.flow_ex_6_alt":"Hub Énergie config — RTE API credentials","configure.flow_after_rte_html":'After valid credentials (or if you pick <strong class="text-body">API Couleur Tempo</strong>), the flow fetches EDF tariffs and continues with <strong class="text-body">grid sensors</strong> (import required; three-phase has extra steps), then <strong class="text-body">solar</strong>, then <strong class="text-body">batteries</strong>. Those steps are not shown here yet — send captures if you want them in the doc.',"devices.title":"Device model","devices.intro":'One Home Assistant device per logical scope. Entity placement follows measured or configured domains; see <code class="font-mono">CHANGELOG.md</code> for finer detail.',"devices.integration_title":"Integration page","devices.integration_alt":"Hub Énergie integration entry with listed devices","devices.integration_cap_html":'<strong class="text-body">Settings → Devices &amp; services → Hub Énergie</strong> shows one configuration entry (bridge). Under it, HA lists logical devices—for example Offre, Réseau, Solaire, one row per battery, the aggregated battery summary, Bilan énergétique, Coûts, and Diagnostics. Labels (e.g. “Toutes batteries”) and entity counts depend on your install.',"devices.th_device":"Device","devices.th_purpose":"Purpose","devices.p_offre":"Tariff, supplier, contract","devices.p_reseau":"Grid energy / power sensors","devices.p_solaire":"Solar measurement / estimation","devices.p_batt":"Per-battery system (0..N)","devices.p_battsum":"Aggregated battery summary","devices.p_bilan":"Computed energy flows (kWh)","devices.p_couts":"Monetary values (€)","devices.p_diag":"Health, reinjection diagnostics","devices.gallery_title":"Devices in the UI","devices.gallery_intro_html":'Each integration device groups related entities. Below, one slide per device so readers can see how the structure looks in <strong class="text-body">Settings → Devices &amp; services</strong>.',"devices.gallery_multishot_html":'For dense devices (many entities), you can add extra PNGs later (e.g. <code class="font-mono">device-ui-02-reseau-2.png</code>) — the doc can be extended with a nested carousel when those assets exist.',"devices.tree_label":"Device","devices.g1_t":"Offre","devices.g1_d":"Tariff, supplier, contract","devices.g2_t":"Réseau","devices.g2_d":"Grid energy / power","devices.g3_t":"Solaire","devices.g3_d":"Solar measurement / estimation","devices.g4_t":"Batterie","devices.g4_d":"Single battery instance","devices.g5_t":"Batteries (total)","devices.g5_d":"Aggregated battery summary","devices.g6_t":"Bilan énergétique","devices.g6_d":"Computed kWh flows","devices.g7_t":"Coûts","devices.g7_d":"Monetary sensors","devices.g8_t":"Diagnostics","devices.g8_d":"Health and reinjection diagnostics","devices.g1_alt":"Hub Énergie device — Offre","devices.g2_alt":"Hub Énergie device — Réseau","devices.g3_alt":"Hub Énergie device — Solaire","devices.g4_alt":"Hub Énergie device — Batterie","devices.g5_alt":"Hub Énergie device — Batteries (total)","devices.g6_alt":"Hub Énergie device — Bilan énergétique","devices.g7_alt":"Hub Énergie device — Coûts","devices.g8_alt":"Hub Énergie device — Diagnostics","services.title":"Services","services.th_service":"Service","services.th_desc":"Description","services.r1":"Force coordinator refresh","services.r2":"Re-fetch EDF tariffs (auto mode)","limitations.title":"Limitations","limitations.li1":"Recorder retention limits history, charts, and rebuild-from-recorder paths.","limitations.li2":"Optional solar estimation is clear-sky output — indicative, not a production meter.","limitations.li3_html":'The card’s power graph needs statistics; missing <code class="font-mono">state_class</code> or history can leave it empty.',"limitations.li4_html":'Health states aggregate many checks; brief <code class="font-mono">rebuilding</code> after a recorder rebuild is expected.',"limitations.li5_html":'Deep dives: <code class="font-mono">docs/troubleshooting.md</code> in the repository (trust, unknown bucket, recovery).',"glossary.title":"Measured, reconstructed, estimated","glossary.th_kind":"Kind","glossary.th_meaning":"Meaning","glossary.measured":"Measured","glossary.measured_html":'From configured HA entities (<code class="font-mono">total_increasing</code> kWh, power where wired).',"glossary.recon":"Reconstructed","glossary.recon_d":"Internal totals and per-slot kWh from deltas and optional recorder replay.","glossary.est":"Estimated","glossary.est_d":"Model-based solar and other best-effort paths without a direct meter.","footer.p1_html":'Hub Énergie — documentation snapshot <strong class="text-body">v0.2.3</strong>. Canonical detail: README and <code class="font-mono">docs/</code> in the <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab project</a>.',"footer.license":"License: see the repository."},fr:{"meta.title":"Hub Énergie — Documentation","meta.description":"Hub Énergie — Intégration personnalisée Home Assistant pour le suivi énergétique, les coûts et le diagnostic.","meta.title.landing":"Hub Énergie — L’énergie du foyer, centralisée","meta.description.landing":"Hub Énergie — une intégration Home Assistant pour tarifs, énergie, coûts, solaire, batteries et diagnostics.","meta.title.internals":"Hub Énergie — Coulisses techniques","meta.description.internals":"Comment Hub Énergie attribue les kWh aux créneaux tarifaires, persiste l’état et enregistre les statistiques long terme dans Home Assistant.","nav.home":"Accueil","nav.documentation":"Documentation","nav.internals":"Fonctionnement détaillé","nav.internals_short":"Coulisses","doc.hero_internals_cta":"Fonctionnement détaillé","doc.hero_internals_hint":"Attribution des créneaux, compartiments journaliers, fichier Store et statistiques long terme — pour comprendre toute la chaîne.","landing.kicker":"Home Assistant · Intelligence énergétique","landing.headline":"Centralisez la lecture énergétique de votre site","landing.lead_html":"Une seule intégration relie tarif, compteurs, solaire, batteries, coûts et diagnostics — vous configurez une fois et Home Assistant affiche une vision cohérente.","landing.cta_discover":"Découvrir","landing.cta_internals":"Comment ça marche","landing.cta_discover_footer":"Voir la documentation","landing.version_note":"Instantané de documentation v0.2.3","landing.f1_title":"Centralisation réelle","landing.f1_body":"Offre, réseau, solaire, appareils par batterie, bilan énergétique, coûts et diagnostics sont regroupés sous une même intégration, plutôt que dispersés en helpers et gabarits.","landing.f2_title":"Comptabilité au pas du tarif","landing.f2_body":"Les deltas de vos compteurs kWh sont répartis dans les créneaux tarifaires (y compris Tempo EDF) selon des règles explicites, avec repli et observabilité si les signaux manquent.","landing.f3_title":"Coûts calés sur l’usage","landing.f3_body":"Estimations journalières, abonnement et détail par créneau restent alignés sur le même instantané que la carte Lovelace.","landing.f4_title":"Historique durable","landing.f4_body":"Les capteurs SSOT internes reflètent les cumuls ; chaque jour terminé (Paris) alimente les statistiques long terme pour analyses et graphiques.","landing.f5_title":"Carte intégrée","landing.f5_body":"Un paquet Lovelace maintenu est servi par votre instance sous /hub_energie/ — sans projet front séparé à héberger.","landing.f6_title":"Diagnostics sans langue de bois","landing.f6_body":"Santé, qualité des données, télémétrie des deltas et indices de confiance indiquent quand les entrées sont partielles ou lorsque l’intégration reconstruit l’état.","landing.footer_html":'Hub Énergie · <a href="#/doc">Documentation</a> · <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab</a>',"toc.internals_title":"Sur cette page","toc.internals_overview":"Chaîne de traitement","toc.internals_sources":"Sources d’énergie","toc.internals_slots":"Créneaux tarifaires","toc.internals_attribution":"Attribution de créneau","toc.internals_deltas":"Deltas & politique","toc.internals_day":"Compartiments jour Paris","toc.internals_store":"Fichier Store","toc.internals_lts":"Statistiques long terme","toc.internals_rebuild":"Reconstruction Recorder","toc.internals_telemetry":"Télémétrie & qualité","internals.kicker":"Notes d’implémentation","internals.title":"Fonctionnement détaillé","internals.subtitle":"Logique métier pour classer l’énergie par créneaux tarifaires, persister les cumuls et enregistrer chaque jour de kWh dans les statistiques Home Assistant — sans remplacer vos compteurs physiques comme référence.","internals.back_to_doc":"Retour à la documentation","internals.s_overview_h":"Chaîne de bout en bout","internals.s_overview_p1":"D’ensemble : le coordinateur surveille les entités énergie configurées (kWh total_increasing). Chaque delta positif reçoit le créneau tarifaire actif à l’instant du delta (Europe/Paris), puis est cumulé en totaux par source et en compartiments jour / créneau. Une fois le jour calendaire (Paris) terminé, ces compartiments alimentent les statistiques externes de Home Assistant pour des graphiques durables par créneau et par source. Un Store JSON conserve les sommes courantes et les cartes de jours récents pour des redémarrages cohérents.","internals.s_overview_p2_html":'L’historique Recorder des entités choisies reste la SSOT externe pour les valeurs brutes de compteur ; les capteurs SSOT de l’intégration exposent les totaux <strong class="text-body">accumulés en interne</strong> utilisés pour le découpage par créneau et les instantanés de coût.',"internals.s_sources_h":"Sources d’énergie (clés accumulateur)","internals.s_sources_p1":"Chaque compteur configuré est associé à une clé source (ex. import réseau, export, solaire, charge et décharge par batterie). L’ensemble attendu dépend de votre configuration : seules les sources liées à une entité participent aux écritures de statistiques. En triphasé, des entités « virtuelles » sommées peuvent servir à la compta tout en s’appuyant sur vos compteurs par phase en amont.","internals.s_sources_p2":"Comme l’écriture en statistiques long terme exige une matrice complète des sources pour un jour terminé, un jour est ignoré si une source attendue manque dans la carte jour interne — ce qui évite d’écrire silencieusement des données partielles.","internals.s_slots_h":"Grille de créneaux tarifaires","internals.s_slots_p1_html":'EDF Tempo définit six bandes de prix encodées en identifiants de créneau : <code class="font-mono">bleu_hc</code>, <code class="font-mono">bleu_hp</code>, <code class="font-mono">blanc_hc</code>, <code class="font-mono">blanc_hp</code>, <code class="font-mono">rouge_hc</code>, <code class="font-mono">rouge_hp</code>. BASE se résume au HP ; HPHC n’en utilise que deux, mappés sur la même convention de noms ; hors EDF, les tarifs manuels réutilisent les noms HC/HP pour rester compatibles alors que les prix viennent de vos tableaux.',"internals.s_slots_p2_html":'Un compartiment d’attribution <code class="font-mono">unknown</code> n’existe qu’en temps réel lorsqu’aucun créneau canonique n’est résolu. Les jours finalisés écrits dans les statistiques du Recorder utilisent les six créneaux canoniques ; le compartiment inconnu apparaît surtout dans les diagnostics pour transparence.',"internals.s_attr_h":"Comment un delta choisit un créneau","internals.s_attr_p1":"Lors de l’application d’un delta, le coordinateur résout le créneau courant dans l’ordre : résolveur principal (calendrier ou couleur Tempo, capteur de créneau optionnel, règles horaires HC/HP), puis dernier créneau stable connu si le résultat principal est ambigu, puis repli « horaire seul » à partir des champs EDF figés et de l’heure Paris. Si rien ne correspond à un créneau canonique, l’attribution est « inconnue » — l’énergie est toutefois accumulée pour ne pas être perdue silencieusement.","internals.s_attr_p2_html":'La méthode de résolution est enregistrée avec le delta (<code class="font-mono">direct</code>, <code class="font-mono">fallback_last_known</code>, <code class="font-mono">fallback_schedule</code>, <code class="font-mono">unknown</code>) afin que les diagnostics expliquent pourquoi un compartiment a grossi.',"internals.s_delta_h":"Politique des deltas (bruit & reprises)","internals.s_delta_p1":"Seuls les deltas positifs comptent dans les totaux de consommation. De petits pas négatifs peuvent être du bruit de compteur (re-base sans énergie) ; de plus grands écarts négatifs peuvent déclencher réancrage ou rejet selon les seuils. Des plafonds limitent les spikes aberrants.","internals.s_delta_p2":"La dérive entre la lecture compteur externe et la somme interne est suivie par source pour que le modèle de santé signale des états incohérents ou dégradés sans fausser silencieusement les coûts.","internals.s_day_h":"Passage de jour (Paris)","internals.s_day_p1":"Les journées suivent la date locale Europe/Paris — alignée avec les calendriers Tempo et les plages HC/HP. Lors de la maintenance de minuit, l’intégration finalise les compartiments de la veille, les persiste, écrit les statistiques Recorder pour ce jour ISO, purge d’anciennes lignes d’accumulateur devenues inutiles, et rafraîchit l’instantané public.","internals.s_day_p2":"Si Home Assistant était arrêté à la frontière, des écritures de rattrapage peuvent avoir lieu au redémarrage : le Store mémorise les jours déjà exportés pour limiter les doublons statistiques lorsque c’est possible.","internals.s_store_h":"Fichier Store","internals.s_store_p1_html":'L’intégration persiste les totaux par source, une carte <code class="font-mono">slot_day_kwh[jour][source][créneau]</code>, les dernières lectures brutes, les ancres de dérive, les jours statistiques déjà écrits, des diagnostics optionnels (réinjection / part charge batterie), et les derniers planchers cumulatifs pour les métadonnées des statistiques long terme. Des sauvegardes différées limitent l’usure disque.',"internals.s_store_p2":"Si le Store est corrompu ou trop peu fiable, un chemin protégé peut reconstruire les totaux internes depuis l’historique Recorder pour les jours terminés avant de reprendre — avec un état de confiance « rebuilding » entre-temps.","internals.s_lts_h":"Enregistrement en statistiques long terme","internals.s_lts_p1_html":'Pour chaque jour terminé et chaque paire <em>(source, créneau)</em> parmi les six créneaux Tempo canoniques, l’intégration appelle l’API des statistiques externes avec une somme <code class="font-mono">TOTAL_INCREASING</code>. Les identifiants ressemblent à <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;créneau&gt;_kwh</code> avec une partie source normalisée pour l’id. L’incrément journalier s’ajoute au cumul précédent stocké avec le Store pour que le Recorder voie une série monotone continue par série.',"internals.s_lts_p2":"Ces séries sont la base préférée pour l’analyse historique par créneau — plus légère que l’exploitation brute d’attributs, et alignée sur ce qu’attend le tableau Énergie.","internals.s_rebuild_h":"Reconstruction pilotée par le Recorder","internals.s_rebuild_p1":"Quand c’est faisable, l’intégration rejoue d’anciens échantillons de statistiques externes pour retrouver les totaux journaliers par créneau et reconstruire la carte des planchers cumulatifs — puis se réconcilie avec les lectures courantes. Ces séries long terme vivent dans le Recorder tandis que les matrices jour / créneau détaillées vivent dans le Store ; les deux doivent rester alignés après restauration ou migration.","internals.s_rebuild_p2_html":'Si le Recorder est momentanément indisponible, l’étape est ignorée avec un avertissement ; l’intégration continue, mais consultez <code class="font-mono">docs/troubleshooting.md</code> si les capteurs santé / confiance se plaignent après une opération lourde sur la base.',"internals.s_tel_h":"Télémétrie, compartiment inconnu, santé","internals.s_tel_p1":"La télémétrie par source expose horodatages, kWh appliqués, créneau attribué, méthode de résolution, intervalles entre applications et dérive par rapport au compteur. Des compteurs de rejets et le dernier motif d’échec aident le support. Un statut d’entrée séparé signale entités manquantes ou indisponibles avant tout calcul.","internals.s_tel_p2_html":'Le capteur santé / confiance agrège ces signaux en états simples (<code class="font-mono">ok</code>, <code class="font-mono">degraded</code>, <code class="font-mono">rebuilding</code>, <code class="font-mono">inconsistent</code>) avec des causes lisibles — les mêmes que la carte peut montrer en diagnostics.',"internals.footer_html":'Pour l’installation côté utilisateur, revenez à la <a href="#/doc">documentation principale</a> ou au <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">dépôt GitLab</a>.',"nav.contents":"Sommaire","theme.group_aria":"Thème d’affichage","theme.light":"Clair","theme.dark":"Sombre","nav.repository":"Dépôt","nav.lang_aria":"Langue","nav.close_aria":"Fermer","nav.toc_aria":"Table des matières de la page","lang.en":"EN","lang.fr":"FR","toc.on_this_page":"Sur cette page","toc.overview":"Vue d’ensemble","toc.ssot":"Données & SSOT","toc.install":"Installation","toc.lovelace":"Carte Lovelace","toc.configure":"Configurer dans HA","toc.devices":"Appareils","toc.devices_integration":"Liste sous l’intégration","toc.services":"Services","toc.limitations":"Limites","toc.glossary":"Glossaire","toc.lovelace_showcase":"Aperçu carte","toc.lovelace_editor":"Éditeur visuel","toc.devices_gallery":"Dans Home Assistant","common.img_placeholder":"Capture absente — ajoutez le fichier sous","common.image_open_full":"Cliquer ou Entrée pour agrandir","doc.modal_aria":"Capture en grand","doc.modal_close_aria":"Fermer","doc.modal_hint":"Image en pleine largeur : faites défiler cette fenêtre si besoin.","carousel.prev":"Précédent","carousel.next":"Suivant","carousel.aria_config":"Captures de l’assistant de configuration","carousel.aria_editor":"Captures de l’éditeur de carte Lovelace","carousel.aria_devices":"Captures des appareils","hero.kicker":"Home Assistant · Intégration personnalisée","hero.title":"Suivi énergétique, coûts & diagnostic","hero.lead_html":'Configurez fournisseurs et tarifs, suivez les kWh et le coût journalier, avec estimation solaire optionnelle et multi-batteries — et une carte Lovelace servie depuis <code class="font-mono small">/hub_energie/</code>.',"glance.title":"En bref","glance.ha":'<strong class="text-body">HA</strong> 2024.10.0 ou plus récent',"glance.snapshot":'Instantané doc <span class="badge bg-primary badge-doc">v0.2.3</span>',"glance.issues":"Tickets & retours","overview.title":"Vue d’ensemble","overview.intro":"Cette page complète le README. Pour une première installation, suivez les étapes ci-dessous dans l’ordre.","scope.stable_heading":"Périmètre stable visé (v0.2.x)","scope.stable_li1_html":'<strong class="text-body">Assistant de config :</strong> fournisseur (EDF ou personnalisé), tarif (prix unique, HP/HC, multi-creuses, Tempo EDF + RTE/API/capteur), réseau et câblage solaire/batteries optionnel.',"scope.stable_li2_html":'<strong class="text-body">Énergie :</strong> deltas positifs sur compteurs <code class="font-mono">total_increasing</code> → comptabilisation par créneau et jour (jour Paris) et capteurs SSOT totaux gérés par l’intégration.',"scope.stable_li3_html":'<strong class="text-body">Coûts :</strong> estimation journalière (€), abonnement lissé, détail par créneau dans les attributs.',"scope.stable_li4_html":'<strong class="text-body">EDF Tempo :</strong> couleurs, quotas, prochains changements.',"scope.stable_li5_html":'<strong class="text-body">Diagnostics :</strong> export/réinjection, qualité des données, télémétrie des deltas, créneau inconnu, obsolescence ; capteur <strong class="text-body">santé</strong> (<code class="font-mono">ok</code> / <code class="font-mono">degraded</code> / <code class="font-mono">rebuilding</code> / <code class="font-mono">inconsistent</code> / <code class="font-mono">no_input</code>) avec cause lisible.',"scope.stable_li6_html":"PV « ciel clair » optionnel et revente solaire si configurée.","scope.stable_li7_html":'Lovelace : les paquets précompilés dans <code class="font-mono">frontend/dist/</code> sont versionnés dans le dépôt ; Home Assistant les sert sous <code class="font-mono">/hub_energie/</code>.',"scope.exp_heading":"Expérimental / au mieux","scope.exp_li1":"Répartition de l’origine de la charge batterie par bilans de puissance lorsque les capteurs sont partiels ou bruités.","scope.exp_li2":"Estimation de production solaire (modèle, pas un compteur physique).","scope.exp_li3":"Diagnostics de type coût d’opportunité pour les kWh exportés.","scope.disclaimer_html":"Le comportement dépend de votre matériel et du choix des entités (notamment le tableau Énergie). Les listes ci-dessus décrivent l’objectif, pas une garantie pour tous les cas limites.","section.link_aria":"Lien vers cette section","ssot.title":"Sources de données (SSOT)","ssot.intro":"Savoir ce qui fait foi évite de mal paramétrer le tableau Énergie ou de lire les mauvais attributs.","ssot.s1_title":"Compteurs physiques (SSOT externe)","ssot.s1_html":'Les entités énergie que vous sélectionnez (<code class="font-mono">grid_import_energy</code>, solaire, export, entrées/sorties par batterie). L’<strong class="text-body">historique Recorder</strong> fait foi pour les kWh totaux (matériel ou intégrations amont).',"ssot.s2_title":"Comptabilité interne","ssot.s2_html":'Le coordinateur cumule les <strong class="text-body">deltas positifs</strong> en totaux et kWh par créneau et jour. Les capteurs SSOT <code class="font-mono">total_increasing</code> reflètent cette <strong class="text-body">somme interne</strong>, pas une relecture intégrale du compteur à chaque cycle.',"ssot.s3_title":"kWh long-terme par créneau (quotidien)","ssot.s3_html":'Après chaque jour (Paris), écriture des statistiques externes <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code>. À utiliser (ou les compteurs physiques) pour l’analyse historique — pas seul l’historique brut d’attribut <code class="font-mono">cost_detail</code>.',"install.title":"Installation","install.intro_html":'Installez le dépôt <strong class="text-body">exactement</strong> comme un seul paquet sous la config HA :',"install.note_html":'Home Assistant doit charger <code class="font-mono">custom_components/hub_energie/manifest.json</code>. Évitez un dossier imbriqué du type <code class="font-mono">hub_energie/hub_energie/</code>.',"install.choose_path":"Choisissez votre méthode","tab.hacs_tba":"HACS (TBA)","tab.git":"Clone Git","tab.copy":"Copie des fichiers","install.hacs_tba_heading":"Catalogue HACS public — à confirmer","install.hacs_tba_html":'<p class="mb-2">Le catalogue public <strong class="text-body">HACS</strong> repose surtout sur des dépôts <strong class="text-body">GitHub</strong> (<a href="https://hacs.xyz/docs/publish/start/" target="_blank" rel="noopener noreferrer">règles de publication</a>). Ce projet est sur <strong class="text-body">GitLab</strong> : une entrée « rechercher et installer » dans le catalogue par défaut n’est <strong class="text-body">pas encore assurée</strong>.</p><p class="mb-0">Pour l’instant privilégiez <strong class="text-body">Clone Git</strong> ou <strong class="text-body">Copie des fichiers</strong> (onglets ci-dessus). Si votre version de HACS accepte les <strong class="text-body">dépôts personnalisés</strong> avec une URL GitLab, vous pouvez tenter cette voie — le comportement varie selon les versions. Après installation, effectuez toujours un <strong class="text-body">redémarrage complet</strong> de Home Assistant.</p>',"install.git.s1_title":"Cloner au bon endroit","install.git.s2_title":"Redémarrer & ajouter l’intégration","install.git.s2_p_html":'Redémarrage <strong>complet</strong> de Home Assistant, puis <a href="#configure">Configurer dans HA</a> (Réglages → Appareils et services → Ajouter une intégration).',"install.copy.s1_title":"Copier l’arborescence complète","install.copy.s1_html":'Depuis ce dépôt, copiez uniquement l’arborescence <code class="font-mono">custom_components/hub_energie/</code> vers le <code class="font-mono">config/custom_components/hub_energie/</code> de Home Assistant — tous les sous-dossiers (<code class="font-mono">battery/</code>, <code class="font-mono">energy/</code>, <code class="font-mono">frontend/</code>, etc.). Ne copiez pas la racine du dépôt (<code class="font-mono">public/</code>, <code class="font-mono">tests/</code>, …) dans HA.',"install.copy.s2_title":"Redémarrer & ajouter l’intégration","install.copy.s2_p_html":'Redémarrage complet, puis <a href="#configure">Configurer dans HA</a>.',"install.lovelace_title":"Si vous utilisez la carte Lovelace","install.lovelace_body_html":'Les paquets sous <code class="font-mono">frontend/dist/</code> sont inclus dans ce dépôt (recompilés en CI à chaque commit). Vous n’avez <strong class="text-body">pas</strong> besoin de lancer <code class="font-mono">npm</code> sur la machine Home Assistant pour une installation courante — redémarrez HA après mise à jour de l’intégration. Pour des installations reproductibles, alignez un tag Git sur <code class="font-mono">manifest.json</code> → <code class="font-mono">version</code> (ex. <strong class="text-body">v0.2.3</strong>).',"install.lovelace_dev_html":'<strong class="text-body">Développement :</strong> pour recompiler en local, depuis <code class="font-mono">custom_components/hub_energie/frontend/</code> exécutez <code class="font-mono">npm ci</code> puis <code class="font-mono">npm run build</code>.',"lovelace.title":"Carte Lovelace","lovelace.intro_html":'Les artefacts de build (<code class="font-mono">hub-energie-card-boot.js</code>, <code class="font-mono">hub-energie-card.js</code>, <code class="font-mono">hub-energie-card-editor.js</code> et les morceaux partagés sous <code class="font-mono">frontend/dist/</code>) sont livrés dans le dépôt et régénérés en CI à chaque commit. Home Assistant sert l’arborescence <code class="font-mono">dist</code> sous <strong class="text-body"><code class="font-mono">/hub_energie/</code></strong>. Depuis la <strong class="text-body">v0.2.3</strong>, la bande optionnelle <strong class="text-body">Production solaire (énergie)</strong> répartit les kWh (autoconso, charge batterie, export attribué) pour le jour ou la période affichée sur la carte.',"lovelace.l1_title":"Tableaux de bord en mode stockage (défaut)","lovelace.l1_html":'Au <strong class="text-body">démarrage</strong> et lorsque vous <strong class="text-body">rechargez</strong> l’intégration, elle ajoute ou met à jour cette URL avec un paramètre d’<strong class="text-body">invalidation de cache</strong> <code class="font-mono">?v=…</code> (comme <em>Réglages → Tableaux de bord → Ressources</em>) pour que le navigateur charge les nouveaux fichiers <code class="font-mono">dist/</code>. En général, rien à faire à la main.',"lovelace.l2_title":"Ressources gérées en YAML","lovelace.l2_p":"Ajoutez vous-même l’URL d’amorçage :","lovelace.l2_note_html":'Remplacez les anciennes URL du type <code class="font-mono">/hub_energie/dist/hub-energie-card.js</code> par l’URL d’amorçage. Ajoutez <code class="font-mono">?v=&lt;horodatage&gt;</code> si le navigateur conserve un ancien paquet. N’enregistrez pas deux modules pour la même carte.',"lovelace.l3_title":"Ajouter la carte","lovelace.showcase_title":"Carte tableau de bord","lovelace.fig_alt":"Carte Lovelace Hub Énergie sur un tableau de bord","lovelace.fig_cap_html":'Exemple en mode jour (Tempo, puissance instantanée, consommation, coûts, réinjection). Fichier : <code class="font-mono">public/img/hub-energie-card.png</code>.',"lovelace.editor_title":"Éditeur visuel","lovelace.editor_intro_html":'La carte dispose d’un éditeur complet (<code class="font-mono">hub-energie-card-editor.js</code> dans le dépôt) pour régler la visibilité des sections, Tempo, la période et des entités optionnelles — sans YAML.',"lovelace.ed1_alt":"Éditeur carte Lovelace — onglet configuration et prévisualisation","lovelace.editor_fig_cap_html":'Onglet <strong class="text-body">Configuration</strong> avec bascules de sections et aperçu live. D’autres captures (ex. <strong class="text-body">Visibilité</strong> / <strong class="text-body">Mise en page</strong>) pourront compléter sous <code class="font-mono">lovelace-editor-02.png</code>.',"configure.title":"Configurer dans Home Assistant","configure.flow_lead_html":'Après un <strong class="text-body">redémarrage complet</strong>, ajoutez l’intégration via <strong class="text-body">Réglages → Appareils et services → Ajouter une intégration</strong>. L’assistant n’est <strong class="text-body">pas linéaire</strong> : les écrans dépendent du fournisseur, du mode auto/manuel des tarifs, du type d’offre EDF (BASE / HPHC / TEMPO), de la source Tempo, du câblage réseau mono/tri, du solaire et des batteries.',"configure.flow_map_title":"Structure des embranchements","configure.flow_map_html":'<ul class="mb-0 ps-3"><li><strong class="text-body">Départ</strong> · <em>user</em> — fournisseur (EDF ou autre) et type de phase sur le même formulaire.</li><li><strong class="text-body">Autre fournisseur</strong> · <em>supplier_custom</em> (nom) → tarif forcé en <strong class="text-body">manuel</strong> → <em>contract</em> → assistant prix manuel (prix unique / heures creuses / calendrier) → <strong class="text-body">réseau → solaire → batteries → fin</strong>.</li><li><strong class="text-body">EDF + tarifs automatiques</strong> · <em>tariff_mode</em> (API fournisseur ou manuel) → <em>contract</em> (kVA, nom optionnel) → <em>edf_offer</em> (BASE, HPHC ou TEMPO). Si <strong class="text-body">TEMPO</strong> : <em>edf_tempo</em> — <strong class="text-body">RTE</strong> (API OAuth) ou <strong class="text-body">API Couleur Tempo</strong> (sans identifiants). RTE ajoute <em>edf_tempo_rte</em> (id + secret, validés). Puis récupération des tarifs EDF et enchaînement <strong class="text-body">réseau → solaire → batteries → fin</strong>.</li><li><strong class="text-body">EDF + tarifs manuels</strong> · pas d’écran offre/Tempo ; après <em>contract</em>, même branche prix manuel que « autre fournisseur ».</li><li><strong class="text-body">Après résolution des prix</strong> · <em>grid</em> (import obligatoire ; export / puissance optionnels) ; le <strong class="text-body">triphasé</strong> ajoute des sous-étapes. Puis <em>solar</em> (production, revente, estimation), puis assistant <em>batterie</em> (0..N), puis création de l’entrée.</li></ul>',"configure.flow_example_path_html":'Le carrousel ci-dessous suit un <strong class="text-body">chemin documenté</strong> : <strong class="text-body">EDF · mono · tarifs auto · TEMPO · RTE</strong> (fichiers <code class="font-mono">config-flow-edf-01-user.png</code> … <code class="font-mono">06-rte-credentials.png</code>).',"configure.flow_carousel_tree":"Ce parcours (6 étapes)","configure.flow_ex_1_t":"Utilisateur","configure.flow_ex_1_d":"Fournisseur & phase","configure.flow_ex_2_t":"Mode tarifaire","configure.flow_ex_2_d":"Automatique (API) ou manuel","configure.flow_ex_3_t":"Contrat","configure.flow_ex_3_d":"Puissance souscrite & nom optionnel","configure.flow_ex_4_t":"Offre EDF","configure.flow_ex_4_d":"BASE, HPHC ou TEMPO","configure.flow_ex_5_t":"Source Tempo","configure.flow_ex_5_d":"RTE ou API Couleur Tempo","configure.flow_ex_6_t":"Identifiants RTE","configure.flow_ex_6_d":"Si vous choisissez RTE","configure.flow_ex_1_alt":"Hub Énergie — utilisateur : fournisseur et phase","configure.flow_ex_2_alt":"Hub Énergie — mode de récupération tarifaire","configure.flow_ex_3_alt":"Hub Énergie — détails du contrat","configure.flow_ex_4_alt":"Hub Énergie — sélection de l’offre EDF","configure.flow_ex_5_alt":"Hub Énergie — source du signal Tempo","configure.flow_ex_6_alt":"Hub Énergie — identifiants API RTE","configure.flow_after_rte_html":'Après identifiants valides (ou si vous choisissez <strong class="text-body">API Couleur Tempo</strong>), les tarifs EDF sont récupérés puis viennent les <strong class="text-body">capteurs réseau</strong> (import obligatoire ; le triphasé ajoute des écrans), puis le <strong class="text-body">solaire</strong>, puis les <strong class="text-body">batteries</strong>. Ces étapes ne sont pas encore illustrées — envoyez des captures si vous voulez les intégrer.',"devices.title":"Modèle d’appareils","devices.intro":'Un appareil Home Assistant par périmètre logique. Le placement des entités suit les domaines mesurés ou configurés ; voir <code class="font-mono">CHANGELOG.md</code> pour le détail.',"devices.integration_title":"Page de l’intégration","devices.integration_alt":"Entrée Hub Énergie avec la liste des appareils","devices.integration_cap_html":'<strong class="text-body">Réglages → Appareils et services → Hub Énergie</strong> : une entrée de configuration (pont) regroupe les appareils logiques — par ex. Offre, Réseau, Solaire, une ligne par batterie, la synthèse batteries, Bilan énergétique, Coûts, Diagnostics. Les libellés (ex. « Toutes batteries ») et le nombre d’entités varient selon votre installation.',"devices.th_device":"Appareil","devices.th_purpose":"Rôle","devices.p_offre":"Tarif, fournisseur, contrat","devices.p_reseau":"Capteurs énergie / puissance réseau","devices.p_solaire":"Mesure ou estimation solaire","devices.p_batt":"Système par batterie (0..N)","devices.p_battsum":"Synthèse batteries agrégée","devices.p_bilan":"Flux énergétiques calculés (kWh)","devices.p_couts":"Montants (€)","devices.p_diag":"Santé, diagnostics réinjection","devices.gallery_title":"Appareils dans l’interface","devices.gallery_intro_html":'Chaque appareil regroupe les entités associées. Ci-dessous, un volet par appareil pour illustrer la structure dans <strong class="text-body">Réglages → Appareils et services</strong>.',"devices.gallery_multishot_html":'Pour les appareils très fournis en entités, vous pourrez ajouter d’autres PNG (ex. <code class="font-mono">device-ui-02-reseau-2.png</code>) — la doc pourra intégrer un carrousel imbriqué quand ces fichiers existeront.',"devices.tree_label":"Appareil","devices.g1_t":"Offre","devices.g1_d":"Tarif, fournisseur, contrat","devices.g2_t":"Réseau","devices.g2_d":"Énergie / puissance réseau","devices.g3_t":"Solaire","devices.g3_d":"Mesure ou estimation solaire","devices.g4_t":"Batterie","devices.g4_d":"Une instance batterie","devices.g5_t":"Batteries (total)","devices.g5_d":"Synthèse agrégée","devices.g6_t":"Bilan énergétique","devices.g6_d":"Flux kWh calculés","devices.g7_t":"Coûts","devices.g7_d":"Capteurs monétaires","devices.g8_t":"Diagnostics","devices.g8_d":"Santé et réinjection","devices.g1_alt":"Appareil Hub Énergie — Offre","devices.g2_alt":"Appareil Hub Énergie — Réseau","devices.g3_alt":"Appareil Hub Énergie — Solaire","devices.g4_alt":"Appareil Hub Énergie — Batterie","devices.g5_alt":"Appareil Hub Énergie — Batteries (total)","devices.g6_alt":"Appareil Hub Énergie — Bilan énergétique","devices.g7_alt":"Appareil Hub Énergie — Coûts","devices.g8_alt":"Appareil Hub Énergie — Diagnostics","services.title":"Services","services.th_service":"Service","services.th_desc":"Description","services.r1":"Forcer un rafraîchissement du coordinateur","services.r2":"Retélécharger les tarifs EDF (mode auto)","limitations.title":"Limites","limitations.li1":"La rétention du Recorder borne l’historique, les graphiques et la reconstruction depuis le Recorder.","limitations.li2":"L’estimation solaire optionnelle est un modèle « ciel clair » — indicative, pas un compteur de production.","limitations.li3_html":'Le graphe de puissance de la carte repose sur les statistiques ; un <code class="font-mono">state_class</code> manquant ou peu d’historique peut le laisser vide.',"limitations.li4_html":'Les états de santé agrègent plusieurs contrôles ; un court <code class="font-mono">rebuilding</code> après reconstruction via le Recorder est normal.',"limitations.li5_html":'Détails : <code class="font-mono">docs/troubleshooting.md</code> dans le dépôt (confiance, créneau inconnu, récupération).',"glossary.title":"Mesuré, reconstruit, estimé","glossary.th_kind":"Type","glossary.th_meaning":"Signification","glossary.measured":"Mesuré","glossary.measured_html":'Valeurs issues de vos entités HA configurées (kWh <code class="font-mono">total_increasing</code>, puissance si câblée).',"glossary.recon":"Reconstruit","glossary.recon_d":"Totaux internes et kWh par créneau à partir des deltas et rejouage Recorder optionnel.","glossary.est":"Estimé","glossary.est_d":"Solaire modélisé et autres approximations lorsqu’il n’y a pas de compteur direct.","footer.p1_html":'Hub Énergie — instantané de documentation <strong class="text-body">v0.2.3</strong>. Référence détaillée : README et <code class="font-mono">docs/</code> dans le <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">projet GitLab</a>.',"footer.license":"Licence : voir le dépôt."}}})(typeof window<"u"?window:void 0);/**
* @vue/shared v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ws(e){const t=Object.create(null);for(const n of e.split(","))t[n]=1;return n=>n in t}const Q={},Ct=[],Ge=()=>{},Br=()=>!1,Tn=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),Rn=e=>e.startsWith("onUpdate:"),ce=Object.assign,As=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},ca=Object.prototype.hasOwnProperty,K=(e,t)=>ca.call(e,t),q=Array.isArray,Ut=e=>on(e)==="[object Map]",da=e=>on(e)==="[object Set]",$s=e=>on(e)==="[object Date]",M=e=>typeof e=="function",ae=e=>typeof e=="string",dt=e=>typeof e=="symbol",ee=e=>e!==null&&typeof e=="object",Gr=e=>(ee(e)||M(e))&&M(e.then)&&M(e.catch),ua=Object.prototype.toString,on=e=>ua.call(e),fa=e=>on(e).slice(8,-1),pa=e=>on(e)==="[object Object]",Es=e=>ae(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,Vt=ws(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Pn=e=>{const t=Object.create(null);return(n=>t[n]||(t[n]=e(n)))},ma=/-\w/g,be=Pn(e=>e.replace(ma,t=>t.slice(1).toUpperCase())),ha=/\B([A-Z])/g,_t=Pn(e=>e.replace(ha,"-$1").toLowerCase()),Hn=Pn(e=>e.charAt(0).toUpperCase()+e.slice(1)),Wn=Pn(e=>e?`on${Hn(e)}`:""),Be=(e,t)=>!Object.is(e,t),Kn=(e,...t)=>{for(let n=0;n<e.length;n++)e[n](...t)},Ur=(e,t,n,s=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:s,value:n})},ga=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let Ys;const On=()=>Ys||(Ys=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Ss(e){if(q(e)){const t={};for(let n=0;n<e.length;n++){const s=e[n],r=ae(s)?ya(s):Ss(s);if(r)for(const o in r)t[o]=r[o]}return t}else if(ae(e)||ee(e))return e}const ba=/;(?![^(]*\))/g,va=/:([^]+)/,_a=/\/\*[^]*?\*\//g;function ya(e){const t={};return e.replace(_a,"").split(ba).forEach(n=>{if(n){const s=n.split(va);s.length>1&&(t[s[0].trim()]=s[1].trim())}}),t}function kt(e){let t="";if(ae(e))t=e;else if(q(e))for(let n=0;n<e.length;n++){const s=kt(e[n]);s&&(t+=s+" ")}else if(ee(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const xa="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",wa=ws(xa);function Vr(e){return!!e||e===""}function Aa(e,t){if(e.length!==t.length)return!1;let n=!0;for(let s=0;n&&s<e.length;s++)n=Cs(e[s],t[s]);return n}function Cs(e,t){if(e===t)return!0;let n=$s(e),s=$s(t);if(n||s)return n&&s?e.getTime()===t.getTime():!1;if(n=dt(e),s=dt(t),n||s)return e===t;if(n=q(e),s=q(t),n||s)return n&&s?Aa(e,t):!1;if(n=ee(e),s=ee(t),n||s){if(!n||!s)return!1;const r=Object.keys(e).length,o=Object.keys(t).length;if(r!==o)return!1;for(const a in e){const l=e.hasOwnProperty(a),i=t.hasOwnProperty(a);if(l&&!i||!l&&i||!Cs(e[a],t[a]))return!1}}return String(e)===String(t)}/**
* @vue/reactivity v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ye;class Ea{constructor(t=!1){this.detached=t,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.__v_skip=!0,this.parent=ye,!t&&ye&&(this.index=(ye.scopes||(ye.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].pause();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].resume();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].resume()}}run(t){if(this._active){const n=ye;try{return ye=this,t()}finally{ye=n}}}on(){++this._on===1&&(this.prevScope=ye,ye=this)}off(){this._on>0&&--this._on===0&&(ye=this.prevScope,this.prevScope=void 0)}stop(t){if(this._active){this._active=!1;let n,s;for(n=0,s=this.effects.length;n<s;n++)this.effects[n].stop();for(this.effects.length=0,n=0,s=this.cleanups.length;n<s;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,s=this.scopes.length;n<s;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!t){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0}}}function Sa(){return ye}let Z;const $n=new WeakSet;class zr{constructor(t){this.fn=t,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,ye&&ye.active&&ye.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,$n.has(this)&&($n.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Kr(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Js(this),$r(this);const t=Z,n=Ce;Z=this,Ce=!0;try{return this.fn()}finally{Yr(this),Z=t,Ce=n,this.flags&=-3}}stop(){if(this.flags&1){for(let t=this.deps;t;t=t.nextDep)Rs(t);this.deps=this.depsTail=void 0,Js(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?$n.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){as(this)&&this.run()}get dirty(){return as(this)}}let Wr=0,zt,Wt;function Kr(e,t=!1){if(e.flags|=8,t){e.next=Wt,Wt=e;return}e.next=zt,zt=e}function ks(){Wr++}function Ts(){if(--Wr>0)return;if(Wt){let t=Wt;for(Wt=void 0;t;){const n=t.next;t.next=void 0,t.flags&=-9,t=n}}let e;for(;zt;){let t=zt;for(zt=void 0;t;){const n=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(s){e||(e=s)}t=n}}if(e)throw e}function $r(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function Yr(e){let t,n=e.depsTail,s=n;for(;s;){const r=s.prevDep;s.version===-1?(s===n&&(n=r),Rs(s),Ca(s)):t=s,s.dep.activeLink=s.prevActiveLink,s.prevActiveLink=void 0,s=r}e.deps=t,e.depsTail=n}function as(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(Jr(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function Jr(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===Xt)||(e.globalVersion=Xt,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!as(e))))return;e.flags|=2;const t=e.dep,n=Z,s=Ce;Z=e,Ce=!0;try{$r(e);const r=e.fn(e._value);(t.version===0||Be(r,e._value))&&(e.flags|=128,e._value=r,t.version++)}catch(r){throw t.version++,r}finally{Z=n,Ce=s,Yr(e),e.flags&=-3}}function Rs(e,t=!1){const{dep:n,prevSub:s,nextSub:r}=e;if(s&&(s.nextSub=r,e.prevSub=void 0),r&&(r.prevSub=s,e.nextSub=void 0),n.subs===e&&(n.subs=s,!s&&n.computed)){n.computed.flags&=-5;for(let o=n.computed.deps;o;o=o.nextDep)Rs(o,!0)}!t&&!--n.sc&&n.map&&n.map.delete(n.key)}function Ca(e){const{prevDep:t,nextDep:n}=e;t&&(t.nextDep=n,e.prevDep=void 0),n&&(n.prevDep=t,e.nextDep=void 0)}let Ce=!0;const Qr=[];function Ze(){Qr.push(Ce),Ce=!1}function et(){const e=Qr.pop();Ce=e===void 0?!0:e}function Js(e){const{cleanup:t}=e;if(e.cleanup=void 0,t){const n=Z;Z=void 0;try{t()}finally{Z=n}}}let Xt=0;class ka{constructor(t,n){this.sub=t,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Ps{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(t){if(!Z||!Ce||Z===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Z)n=this.activeLink=new ka(Z,this),Z.deps?(n.prevDep=Z.depsTail,Z.depsTail.nextDep=n,Z.depsTail=n):Z.deps=Z.depsTail=n,Xr(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const s=n.nextDep;s.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=s),n.prevDep=Z.depsTail,n.nextDep=void 0,Z.depsTail.nextDep=n,Z.depsTail=n,Z.deps===n&&(Z.deps=s)}return n}trigger(t){this.version++,Xt++,this.notify(t)}notify(t){ks();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Ts()}}}function Xr(e){if(e.dep.sc++,e.sub.flags&4){const t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let s=t.deps;s;s=s.nextDep)Xr(s)}const n=e.dep.subs;n!==e&&(e.prevSub=n,n&&(n.nextSub=e)),e.dep.subs=e}}const is=new WeakMap,vt=Symbol(""),ls=Symbol(""),Zt=Symbol("");function de(e,t,n){if(Ce&&Z){let s=is.get(e);s||is.set(e,s=new Map);let r=s.get(n);r||(s.set(n,r=new Ps),r.map=s,r.key=n),r.track()}}function Qe(e,t,n,s,r,o){const a=is.get(e);if(!a){Xt++;return}const l=i=>{i&&i.trigger()};if(ks(),t==="clear")a.forEach(l);else{const i=q(e),f=i&&Es(n);if(i&&n==="length"){const d=Number(s);a.forEach((p,h)=>{(h==="length"||h===Zt||!dt(h)&&h>=d)&&l(p)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),f&&l(a.get(Zt)),t){case"add":i?f&&l(a.get("length")):(l(a.get(vt)),Ut(e)&&l(a.get(ls)));break;case"delete":i||(l(a.get(vt)),Ut(e)&&l(a.get(ls)));break;case"set":Ut(e)&&l(a.get(vt));break}}Ts()}function At(e){const t=W(e);return t===e?t:(de(t,"iterate",Zt),ke(e)?t:t.map(tt))}function Hs(e){return de(e=W(e),"iterate",Zt),e}function Me(e,t){return ut(e)?en(Tt(e)?tt(t):t):tt(t)}const Ta={__proto__:null,[Symbol.iterator](){return Yn(this,Symbol.iterator,e=>Me(this,e))},concat(...e){return At(this).concat(...e.map(t=>q(t)?At(t):t))},entries(){return Yn(this,"entries",e=>(e[1]=Me(this,e[1]),e))},every(e,t){return We(this,"every",e,t,void 0,arguments)},filter(e,t){return We(this,"filter",e,t,n=>n.map(s=>Me(this,s)),arguments)},find(e,t){return We(this,"find",e,t,n=>Me(this,n),arguments)},findIndex(e,t){return We(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return We(this,"findLast",e,t,n=>Me(this,n),arguments)},findLastIndex(e,t){return We(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return We(this,"forEach",e,t,void 0,arguments)},includes(...e){return Jn(this,"includes",e)},indexOf(...e){return Jn(this,"indexOf",e)},join(e){return At(this).join(e)},lastIndexOf(...e){return Jn(this,"lastIndexOf",e)},map(e,t){return We(this,"map",e,t,void 0,arguments)},pop(){return Nt(this,"pop")},push(...e){return Nt(this,"push",e)},reduce(e,...t){return Qs(this,"reduce",e,t)},reduceRight(e,...t){return Qs(this,"reduceRight",e,t)},shift(){return Nt(this,"shift")},some(e,t){return We(this,"some",e,t,void 0,arguments)},splice(...e){return Nt(this,"splice",e)},toReversed(){return At(this).toReversed()},toSorted(e){return At(this).toSorted(e)},toSpliced(...e){return At(this).toSpliced(...e)},unshift(...e){return Nt(this,"unshift",e)},values(){return Yn(this,"values",e=>Me(this,e))}};function Yn(e,t,n){const s=Hs(e),r=s[t]();return s!==e&&!ke(e)&&(r._next=r.next,r.next=()=>{const o=r._next();return o.done||(o.value=n(o.value)),o}),r}const Ra=Array.prototype;function We(e,t,n,s,r,o){const a=Hs(e),l=a!==e&&!ke(e),i=a[t];if(i!==Ra[t]){const p=i.apply(e,o);return l?tt(p):p}let f=n;a!==e&&(l?f=function(p,h){return n.call(this,Me(e,p),h,e)}:n.length>2&&(f=function(p,h){return n.call(this,p,h,e)}));const d=i.call(a,f,s);return l&&r?r(d):d}function Qs(e,t,n,s){const r=Hs(e),o=r!==e&&!ke(e);let a=n,l=!1;r!==e&&(o?(l=s.length===0,a=function(f,d,p){return l&&(l=!1,f=Me(e,f)),n.call(this,f,Me(e,d),p,e)}):n.length>3&&(a=function(f,d,p){return n.call(this,f,d,p,e)}));const i=r[t](a,...s);return l?Me(e,i):i}function Jn(e,t,n){const s=W(e);de(s,"iterate",Zt);const r=s[t](...n);return(r===-1||r===!1)&&Ds(n[0])?(n[0]=W(n[0]),s[t](...n)):r}function Nt(e,t,n=[]){Ze(),ks();const s=W(e)[t].apply(e,n);return Ts(),et(),s}const Pa=ws("__proto__,__v_isRef,__isVue"),Zr=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(dt));function Ha(e){dt(e)||(e=String(e));const t=W(this);return de(t,"has",e),t.hasOwnProperty(e)}class eo{constructor(t=!1,n=!1){this._isReadonly=t,this._isShallow=n}get(t,n,s){if(n==="__v_skip")return t.__v_skip;const r=this._isReadonly,o=this._isShallow;if(n==="__v_isReactive")return!r;if(n==="__v_isReadonly")return r;if(n==="__v_isShallow")return o;if(n==="__v_raw")return s===(r?o?Ba:ro:o?so:no).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(s)?t:void 0;const a=q(t);if(!r){let i;if(a&&(i=Ta[n]))return i;if(n==="hasOwnProperty")return Ha}const l=Reflect.get(t,n,pe(t)?t:s);if((dt(n)?Zr.has(n):Pa(n))||(r||de(t,"get",n),o))return l;if(pe(l)){const i=a&&Es(n)?l:l.value;return r&&ee(i)?ds(i):i}return ee(l)?r?ds(l):In(l):l}}class to extends eo{constructor(t=!1){super(!1,t)}set(t,n,s,r){let o=t[n];const a=q(t)&&Es(n);if(!this._isShallow){const f=ut(o);if(!ke(s)&&!ut(s)&&(o=W(o),s=W(s)),!a&&pe(o)&&!pe(s))return f||(o.value=s),!0}const l=a?Number(n)<t.length:K(t,n),i=Reflect.set(t,n,s,pe(t)?t:r);return t===W(r)&&(l?Be(s,o)&&Qe(t,"set",n,s):Qe(t,"add",n,s)),i}deleteProperty(t,n){const s=K(t,n);t[n];const r=Reflect.deleteProperty(t,n);return r&&s&&Qe(t,"delete",n,void 0),r}has(t,n){const s=Reflect.has(t,n);return(!dt(n)||!Zr.has(n))&&de(t,"has",n),s}ownKeys(t){return de(t,"iterate",q(t)?"length":vt),Reflect.ownKeys(t)}}class Oa extends eo{constructor(t=!1){super(!0,t)}set(t,n){return!0}deleteProperty(t,n){return!0}}const Ia=new to,Da=new Oa,La=new to(!0);const cs=e=>e,cn=e=>Reflect.getPrototypeOf(e);function ja(e,t,n){return function(...s){const r=this.__v_raw,o=W(r),a=Ut(o),l=e==="entries"||e===Symbol.iterator&&a,i=e==="keys"&&a,f=r[e](...s),d=n?cs:t?en:tt;return!t&&de(o,"iterate",i?ls:vt),ce(Object.create(f),{next(){const{value:p,done:h}=f.next();return h?{value:p,done:h}:{value:l?[d(p[0]),d(p[1])]:d(p),done:h}}})}}function dn(e){return function(...t){return e==="delete"?!1:e==="clear"?void 0:this}}function Na(e,t){const n={get(r){const o=this.__v_raw,a=W(o),l=W(r);e||(Be(r,l)&&de(a,"get",r),de(a,"get",l));const{has:i}=cn(a),f=t?cs:e?en:tt;if(i.call(a,r))return f(o.get(r));if(i.call(a,l))return f(o.get(l));o!==a&&o.get(r)},get size(){const r=this.__v_raw;return!e&&de(W(r),"iterate",vt),r.size},has(r){const o=this.__v_raw,a=W(o),l=W(r);return e||(Be(r,l)&&de(a,"has",r),de(a,"has",l)),r===l?o.has(r):o.has(r)||o.has(l)},forEach(r,o){const a=this,l=a.__v_raw,i=W(l),f=t?cs:e?en:tt;return!e&&de(i,"iterate",vt),l.forEach((d,p)=>r.call(o,f(d),f(p),a))}};return ce(n,e?{add:dn("add"),set:dn("set"),delete:dn("delete"),clear:dn("clear")}:{add(r){const o=W(this),a=cn(o),l=W(r),i=!t&&!ke(r)&&!ut(r)?l:r;return a.has.call(o,i)||Be(r,i)&&a.has.call(o,r)||Be(l,i)&&a.has.call(o,l)||(o.add(i),Qe(o,"add",i,i)),this},set(r,o){!t&&!ke(o)&&!ut(o)&&(o=W(o));const a=W(this),{has:l,get:i}=cn(a);let f=l.call(a,r);f||(r=W(r),f=l.call(a,r));const d=i.call(a,r);return a.set(r,o),f?Be(o,d)&&Qe(a,"set",r,o):Qe(a,"add",r,o),this},delete(r){const o=W(this),{has:a,get:l}=cn(o);let i=a.call(o,r);i||(r=W(r),i=a.call(o,r)),l&&l.call(o,r);const f=o.delete(r);return i&&Qe(o,"delete",r,void 0),f},clear(){const r=W(this),o=r.size!==0,a=r.clear();return o&&Qe(r,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(r=>{n[r]=ja(r,e,t)}),n}function Os(e,t){const n=Na(e,t);return(s,r,o)=>r==="__v_isReactive"?!e:r==="__v_isReadonly"?e:r==="__v_raw"?s:Reflect.get(K(n,r)&&r in s?n:s,r,o)}const Fa={get:Os(!1,!1)},Ma={get:Os(!1,!0)},qa={get:Os(!0,!1)};const no=new WeakMap,so=new WeakMap,ro=new WeakMap,Ba=new WeakMap;function Ga(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Ua(e){return e.__v_skip||!Object.isExtensible(e)?0:Ga(fa(e))}function In(e){return ut(e)?e:Is(e,!1,Ia,Fa,no)}function oo(e){return Is(e,!1,La,Ma,so)}function ds(e){return Is(e,!0,Da,qa,ro)}function Is(e,t,n,s,r){if(!ee(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const o=Ua(e);if(o===0)return e;const a=r.get(e);if(a)return a;const l=new Proxy(e,o===2?s:n);return r.set(e,l),l}function Tt(e){return ut(e)?Tt(e.__v_raw):!!(e&&e.__v_isReactive)}function ut(e){return!!(e&&e.__v_isReadonly)}function ke(e){return!!(e&&e.__v_isShallow)}function Ds(e){return e?!!e.__v_raw:!1}function W(e){const t=e&&e.__v_raw;return t?W(t):e}function Va(e){return!K(e,"__v_skip")&&Object.isExtensible(e)&&Ur(e,"__v_skip",!0),e}const tt=e=>ee(e)?In(e):e,en=e=>ee(e)?ds(e):e;function pe(e){return e?e.__v_isRef===!0:!1}function Ls(e){return ao(e,!1)}function za(e){return ao(e,!0)}function ao(e,t){return pe(e)?e:new Wa(e,t)}class Wa{constructor(t,n){this.dep=new Ps,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?t:W(t),this._value=n?t:tt(t),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(t){const n=this._rawValue,s=this.__v_isShallow||ke(t)||ut(t);t=s?t:W(t),Be(t,n)&&(this._rawValue=t,this._value=s?t:tt(t),this.dep.trigger())}}function Ue(e){return pe(e)?e.value:e}const Ka={get:(e,t,n)=>t==="__v_raw"?e:Ue(Reflect.get(e,t,n)),set:(e,t,n,s)=>{const r=e[t];return pe(r)&&!pe(n)?(r.value=n,!0):Reflect.set(e,t,n,s)}};function io(e){return Tt(e)?e:new Proxy(e,Ka)}class $a{constructor(t,n,s){this.fn=t,this.setter=n,this._value=void 0,this.dep=new Ps(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Xt-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=s}notify(){if(this.flags|=16,!(this.flags&8)&&Z!==this)return Kr(this,!0),!0}get value(){const t=this.dep.track();return Jr(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function Ya(e,t,n=!1){let s,r;return M(e)?s=e:(s=e.get,r=e.set),new $a(s,r,n)}const un={},vn=new WeakMap;let gt;function Ja(e,t=!1,n=gt){if(n){let s=vn.get(n);s||vn.set(n,s=[]),s.push(e)}}function Qa(e,t,n=Q){const{immediate:s,deep:r,once:o,scheduler:a,augmentJob:l,call:i}=n,f=H=>r?H:ke(H)||r===!1||r===0?Xe(H,1):Xe(H);let d,p,h,g,P=!1,S=!1;if(pe(e)?(p=()=>e.value,P=ke(e)):Tt(e)?(p=()=>f(e),P=!0):q(e)?(S=!0,P=e.some(H=>Tt(H)||ke(H)),p=()=>e.map(H=>{if(pe(H))return H.value;if(Tt(H))return f(H);if(M(H))return i?i(H,2):H()})):M(e)?t?p=i?()=>i(e,2):e:p=()=>{if(h){Ze();try{h()}finally{et()}}const H=gt;gt=d;try{return i?i(e,3,[g]):e(g)}finally{gt=H}}:p=Ge,t&&r){const H=p,Y=r===!0?1/0:r;p=()=>Xe(H(),Y)}const F=Sa(),j=()=>{d.stop(),F&&F.active&&As(F.effects,d)};if(o&&t){const H=t;t=(...Y)=>{H(...Y),j()}}let T=S?new Array(e.length).fill(un):un;const O=H=>{if(!(!(d.flags&1)||!d.dirty&&!H))if(t){const Y=d.run();if(r||P||(S?Y.some((ie,te)=>Be(ie,T[te])):Be(Y,T))){h&&h();const ie=gt;gt=d;try{const te=[Y,T===un?void 0:S&&T[0]===un?[]:T,g];T=Y,i?i(t,3,te):t(...te)}finally{gt=ie}}}else d.run()};return l&&l(O),d=new zr(p),d.scheduler=a?()=>a(O,!1):O,g=H=>Ja(H,!1,d),h=d.onStop=()=>{const H=vn.get(d);if(H){if(i)i(H,4);else for(const Y of H)Y();vn.delete(d)}},t?s?O(!0):T=d.run():a?a(O.bind(null,!0),!0):d.run(),j.pause=d.pause.bind(d),j.resume=d.resume.bind(d),j.stop=j,j}function Xe(e,t=1/0,n){if(t<=0||!ee(e)||e.__v_skip||(n=n||new Map,(n.get(e)||0)>=t))return e;if(n.set(e,t),t--,pe(e))Xe(e.value,t,n);else if(q(e))for(let s=0;s<e.length;s++)Xe(e[s],t,n);else if(da(e)||Ut(e))e.forEach(s=>{Xe(s,t,n)});else if(pa(e)){for(const s in e)Xe(e[s],t,n);for(const s of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,s)&&Xe(e[s],t,n)}return e}/**
* @vue/runtime-core v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function an(e,t,n,s){try{return s?e(...s):e()}catch(r){Dn(r,t,n)}}function Ve(e,t,n,s){if(M(e)){const r=an(e,t,n,s);return r&&Gr(r)&&r.catch(o=>{Dn(o,t,n)}),r}if(q(e)){const r=[];for(let o=0;o<e.length;o++)r.push(Ve(e[o],t,n,s));return r}}function Dn(e,t,n,s=!0){const r=t?t.vnode:null,{errorHandler:o,throwUnhandledErrorInProduction:a}=t&&t.appContext.config||Q;if(t){let l=t.parent;const i=t.proxy,f=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](e,i,f)===!1)return}l=l.parent}if(o){Ze(),an(o,null,10,[e,i,f]),et();return}}Xa(e,n,r,s,a)}function Xa(e,t,n,s=!0,r=!1){if(r)throw e;console.error(e)}const ge=[];let Fe=-1;const Rt=[];let lt=null,Et=0;const lo=Promise.resolve();let _n=null;function Ln(e){const t=_n||lo;return e?t.then(this?e.bind(this):e):t}function Za(e){let t=Fe+1,n=ge.length;for(;t<n;){const s=t+n>>>1,r=ge[s],o=tn(r);o<e||o===e&&r.flags&2?t=s+1:n=s}return t}function js(e){if(!(e.flags&1)){const t=tn(e),n=ge[ge.length-1];!n||!(e.flags&2)&&t>=tn(n)?ge.push(e):ge.splice(Za(t),0,e),e.flags|=1,co()}}function co(){_n||(_n=lo.then(fo))}function ei(e){q(e)?Rt.push(...e):lt&&e.id===-1?lt.splice(Et+1,0,e):e.flags&1||(Rt.push(e),e.flags|=1),co()}function Xs(e,t,n=Fe+1){for(;n<ge.length;n++){const s=ge[n];if(s&&s.flags&2){if(e&&s.id!==e.uid)continue;ge.splice(n,1),n--,s.flags&4&&(s.flags&=-2),s(),s.flags&4||(s.flags&=-2)}}}function uo(e){if(Rt.length){const t=[...new Set(Rt)].sort((n,s)=>tn(n)-tn(s));if(Rt.length=0,lt){lt.push(...t);return}for(lt=t,Et=0;Et<lt.length;Et++){const n=lt[Et];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}lt=null,Et=0}}const tn=e=>e.id==null?e.flags&2?-1:1/0:e.id;function fo(e){try{for(Fe=0;Fe<ge.length;Fe++){const t=ge[Fe];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),an(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;Fe<ge.length;Fe++){const t=ge[Fe];t&&(t.flags&=-2)}Fe=-1,ge.length=0,uo(),_n=null,(ge.length||Rt.length)&&fo()}}let Ae=null,po=null;function yn(e){const t=Ae;return Ae=e,po=e&&e.type.__scopeId||null,t}function Bt(e,t=Ae,n){if(!t||e._n)return e;const s=(...r)=>{s._d&&An(-1);const o=yn(t);let a;try{a=e(...r)}finally{yn(o),s._d&&An(1)}return a};return s._n=!0,s._c=!0,s._d=!0,s}function ti(e,t){if(Ae===null)return e;const n=Un(Ae),s=e.dirs||(e.dirs=[]);for(let r=0;r<t.length;r++){let[o,a,l,i=Q]=t[r];o&&(M(o)&&(o={mounted:o,updated:o}),o.deep&&Xe(a),s.push({dir:o,instance:n,value:a,oldValue:void 0,arg:l,modifiers:i}))}return e}function mt(e,t,n,s){const r=e.dirs,o=t&&t.dirs;for(let a=0;a<r.length;a++){const l=r[a];o&&(l.oldValue=o[a].value);let i=l.dir[s];i&&(Ze(),Ve(i,n,8,[e.el,l,e,t]),et())}}function mn(e,t){if(fe){let n=fe.provides;const s=fe.parent&&fe.parent.provides;s===n&&(n=fe.provides=Object.create(s)),n[e]=t}}function Te(e,t,n=!1){const s=nl();if(s||Pt){let r=Pt?Pt._context.provides:s?s.parent==null||s.ce?s.vnode.appContext&&s.vnode.appContext.provides:s.parent.provides:void 0;if(r&&e in r)return r[e];if(arguments.length>1)return n&&M(t)?t.call(s&&s.proxy):t}}const ni=Symbol.for("v-scx"),si=()=>Te(ni);function hn(e,t,n){return mo(e,t,n)}function mo(e,t,n=Q){const{immediate:s,deep:r,flush:o,once:a}=n,l=ce({},n),i=t&&s||!t&&o!=="post";let f;if(sn){if(o==="sync"){const g=si();f=g.__watcherHandles||(g.__watcherHandles=[])}else if(!i){const g=()=>{};return g.stop=Ge,g.resume=Ge,g.pause=Ge,g}}const d=fe;l.call=(g,P,S)=>Ve(g,d,P,S);let p=!1;o==="post"?l.scheduler=g=>{_e(g,d&&d.suspense)}:o!=="sync"&&(p=!0,l.scheduler=(g,P)=>{P?g():js(g)}),l.augmentJob=g=>{t&&(g.flags|=4),p&&(g.flags|=2,d&&(g.id=d.uid,g.i=d))};const h=Qa(e,t,l);return sn&&(f?f.push(h):i&&h()),h}function ri(e,t,n){const s=this.proxy,r=ae(e)?e.includes(".")?ho(s,e):()=>s[e]:e.bind(s,s);let o;M(t)?o=t:(o=t.handler,n=t);const a=ln(this),l=mo(r,o.bind(s),n);return a(),l}function ho(e,t){const n=t.split(".");return()=>{let s=e;for(let r=0;r<n.length&&s;r++)s=s[n[r]];return s}}const oi=Symbol("_vte"),ai=e=>e.__isTeleport,ii=Symbol("_leaveCb");function Ns(e,t){e.shapeFlag&6&&e.component?(e.transition=t,Ns(e.component.subTree,t)):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function go(e,t){return M(e)?ce({name:e.name},t,{setup:e}):e}function bo(e){e.ids=[e.ids[0]+e.ids[2]+++"-",0,0]}function Zs(e,t){let n;return!!((n=Object.getOwnPropertyDescriptor(e,t))&&!n.configurable)}const xn=new WeakMap;function Kt(e,t,n,s,r=!1){if(q(e)){e.forEach((S,F)=>Kt(S,t&&(q(t)?t[F]:t),n,s,r));return}if($t(s)&&!r){s.shapeFlag&512&&s.type.__asyncResolved&&s.component.subTree.component&&Kt(e,t,n,s.component.subTree);return}const o=s.shapeFlag&4?Un(s.component):s.el,a=r?null:o,{i:l,r:i}=e,f=t&&t.r,d=l.refs===Q?l.refs={}:l.refs,p=l.setupState,h=W(p),g=p===Q?Br:S=>Zs(d,S)?!1:K(h,S),P=(S,F)=>!(F&&Zs(d,F));if(f!=null&&f!==i){if(er(t),ae(f))d[f]=null,g(f)&&(p[f]=null);else if(pe(f)){const S=t;P(f,S.k)&&(f.value=null),S.k&&(d[S.k]=null)}}if(M(i))an(i,l,12,[a,d]);else{const S=ae(i),F=pe(i);if(S||F){const j=()=>{if(e.f){const T=S?g(i)?p[i]:d[i]:P()||!e.k?i.value:d[e.k];if(r)q(T)&&As(T,o);else if(q(T))T.includes(o)||T.push(o);else if(S)d[i]=[o],g(i)&&(p[i]=d[i]);else{const O=[o];P(i,e.k)&&(i.value=O),e.k&&(d[e.k]=O)}}else S?(d[i]=a,g(i)&&(p[i]=a)):F&&(P(i,e.k)&&(i.value=a),e.k&&(d[e.k]=a))};if(a){const T=()=>{j(),xn.delete(e)};T.id=-1,xn.set(e,T),_e(T,n)}else er(e),j()}}}function er(e){const t=xn.get(e);t&&(t.flags|=8,xn.delete(e))}On().requestIdleCallback;On().cancelIdleCallback;const $t=e=>!!e.type.__asyncLoader,vo=e=>e.type.__isKeepAlive;function li(e,t){_o(e,"a",t)}function ci(e,t){_o(e,"da",t)}function _o(e,t,n=fe){const s=e.__wdc||(e.__wdc=()=>{let r=n;for(;r;){if(r.isDeactivated)return;r=r.parent}return e()});if(jn(t,s,n),n){let r=n.parent;for(;r&&r.parent;)vo(r.parent.vnode)&&di(s,t,n,r),r=r.parent}}function di(e,t,n,s){const r=jn(t,e,s,!0);Fn(()=>{As(s[t],r)},n)}function jn(e,t,n=fe,s=!1){if(n){const r=n[e]||(n[e]=[]),o=t.__weh||(t.__weh=(...a)=>{Ze();const l=ln(n),i=Ve(t,n,e,a);return l(),et(),i});return s?r.unshift(o):r.push(o),o}}const nt=e=>(t,n=fe)=>{(!sn||e==="sp")&&jn(e,(...s)=>t(...s),n)},ui=nt("bm"),Nn=nt("m"),fi=nt("bu"),pi=nt("u"),mi=nt("bum"),Fn=nt("um"),hi=nt("sp"),gi=nt("rtg"),bi=nt("rtc");function vi(e,t=fe){jn("ec",e,t)}const _i="components";function tr(e,t){return xi(_i,e,!0,t)||e}const yi=Symbol.for("v-ndc");function xi(e,t,n=!0,s=!1){const r=Ae||fe;if(r){const o=r.type;{const l=il(o,!1);if(l&&(l===t||l===be(t)||l===Hn(be(t))))return o}const a=nr(r[e]||o[e],t)||nr(r.appContext[e],t);return!a&&s?o:a}}function nr(e,t){return e&&(e[t]||e[be(t)]||e[Hn(be(t))])}const us=e=>e?Mo(e)?Un(e):us(e.parent):null,Yt=ce(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>us(e.parent),$root:e=>us(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>xo(e),$forceUpdate:e=>e.f||(e.f=()=>{js(e.update)}),$nextTick:e=>e.n||(e.n=Ln.bind(e.proxy)),$watch:e=>ri.bind(e)}),Qn=(e,t)=>e!==Q&&!e.__isScriptSetup&&K(e,t),wi={get({_:e},t){if(t==="__v_skip")return!0;const{ctx:n,setupState:s,data:r,props:o,accessCache:a,type:l,appContext:i}=e;if(t[0]!=="$"){const h=a[t];if(h!==void 0)switch(h){case 1:return s[t];case 2:return r[t];case 4:return n[t];case 3:return o[t]}else{if(Qn(s,t))return a[t]=1,s[t];if(r!==Q&&K(r,t))return a[t]=2,r[t];if(K(o,t))return a[t]=3,o[t];if(n!==Q&&K(n,t))return a[t]=4,n[t];fs&&(a[t]=0)}}const f=Yt[t];let d,p;if(f)return t==="$attrs"&&de(e.attrs,"get",""),f(e);if((d=l.__cssModules)&&(d=d[t]))return d;if(n!==Q&&K(n,t))return a[t]=4,n[t];if(p=i.config.globalProperties,K(p,t))return p[t]},set({_:e},t,n){const{data:s,setupState:r,ctx:o}=e;return Qn(r,t)?(r[t]=n,!0):s!==Q&&K(s,t)?(s[t]=n,!0):K(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(o[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:s,appContext:r,props:o,type:a}},l){let i;return!!(n[l]||e!==Q&&l[0]!=="$"&&K(e,l)||Qn(t,l)||K(o,l)||K(s,l)||K(Yt,l)||K(r.config.globalProperties,l)||(i=a.__cssModules)&&i[l])},defineProperty(e,t,n){return n.get!=null?e._.accessCache[t]=0:K(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}};function sr(e){return q(e)?e.reduce((t,n)=>(t[n]=null,t),{}):e}let fs=!0;function Ai(e){const t=xo(e),n=e.proxy,s=e.ctx;fs=!1,t.beforeCreate&&rr(t.beforeCreate,e,"bc");const{data:r,computed:o,methods:a,watch:l,provide:i,inject:f,created:d,beforeMount:p,mounted:h,beforeUpdate:g,updated:P,activated:S,deactivated:F,beforeDestroy:j,beforeUnmount:T,destroyed:O,unmounted:H,render:Y,renderTracked:ie,renderTriggered:te,errorCaptured:Pe,serverPrefetch:st,expose:He,inheritAttrs:rt,components:ft,directives:Oe,filters:Lt}=t;if(f&&Ei(f,s,null),a)for(const $ in a){const V=a[$];M(V)&&(s[$]=V.bind(n))}if(r){const $=r.call(n,n);ee($)&&(e.data=In($))}if(fs=!0,o)for(const $ in o){const V=o[$],ze=M(V)?V.bind(n,n):M(V.get)?V.get.bind(n,n):Ge,ot=!M(V)&&M(V.set)?V.set.bind(n):Ge,Ie=xe({get:ze,set:ot});Object.defineProperty(s,$,{enumerable:!0,configurable:!0,get:()=>Ie.value,set:ve=>Ie.value=ve})}if(l)for(const $ in l)yo(l[$],s,n,$);if(i){const $=M(i)?i.call(n):i;Reflect.ownKeys($).forEach(V=>{mn(V,$[V])})}d&&rr(d,e,"c");function oe($,V){q(V)?V.forEach(ze=>$(ze.bind(n))):V&&$(V.bind(n))}if(oe(ui,p),oe(Nn,h),oe(fi,g),oe(pi,P),oe(li,S),oe(ci,F),oe(vi,Pe),oe(bi,ie),oe(gi,te),oe(mi,T),oe(Fn,H),oe(hi,st),q(He))if(He.length){const $=e.exposed||(e.exposed={});He.forEach(V=>{Object.defineProperty($,V,{get:()=>n[V],set:ze=>n[V]=ze,enumerable:!0})})}else e.exposed||(e.exposed={});Y&&e.render===Ge&&(e.render=Y),rt!=null&&(e.inheritAttrs=rt),ft&&(e.components=ft),Oe&&(e.directives=Oe),st&&bo(e)}function Ei(e,t,n=Ge){q(e)&&(e=ps(e));for(const s in e){const r=e[s];let o;ee(r)?"default"in r?o=Te(r.from||s,r.default,!0):o=Te(r.from||s):o=Te(r),pe(o)?Object.defineProperty(t,s,{enumerable:!0,configurable:!0,get:()=>o.value,set:a=>o.value=a}):t[s]=o}}function rr(e,t,n){Ve(q(e)?e.map(s=>s.bind(t.proxy)):e.bind(t.proxy),t,n)}function yo(e,t,n,s){let r=s.includes(".")?ho(n,s):()=>n[s];if(ae(e)){const o=t[e];M(o)&&hn(r,o)}else if(M(e))hn(r,e.bind(n));else if(ee(e))if(q(e))e.forEach(o=>yo(o,t,n,s));else{const o=M(e.handler)?e.handler.bind(n):t[e.handler];M(o)&&hn(r,o,e)}}function xo(e){const t=e.type,{mixins:n,extends:s}=t,{mixins:r,optionsCache:o,config:{optionMergeStrategies:a}}=e.appContext,l=o.get(t);let i;return l?i=l:!r.length&&!n&&!s?i=t:(i={},r.length&&r.forEach(f=>wn(i,f,a,!0)),wn(i,t,a)),ee(t)&&o.set(t,i),i}function wn(e,t,n,s=!1){const{mixins:r,extends:o}=t;o&&wn(e,o,n,!0),r&&r.forEach(a=>wn(e,a,n,!0));for(const a in t)if(!(s&&a==="expose")){const l=Si[a]||n&&n[a];e[a]=l?l(e[a],t[a]):t[a]}return e}const Si={data:or,props:ar,emits:ar,methods:Gt,computed:Gt,beforeCreate:me,created:me,beforeMount:me,mounted:me,beforeUpdate:me,updated:me,beforeDestroy:me,beforeUnmount:me,destroyed:me,unmounted:me,activated:me,deactivated:me,errorCaptured:me,serverPrefetch:me,components:Gt,directives:Gt,watch:ki,provide:or,inject:Ci};function or(e,t){return t?e?function(){return ce(M(e)?e.call(this,this):e,M(t)?t.call(this,this):t)}:t:e}function Ci(e,t){return Gt(ps(e),ps(t))}function ps(e){if(q(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function me(e,t){return e?[...new Set([].concat(e,t))]:t}function Gt(e,t){return e?ce(Object.create(null),e,t):t}function ar(e,t){return e?q(e)&&q(t)?[...new Set([...e,...t])]:ce(Object.create(null),sr(e),sr(t??{})):t}function ki(e,t){if(!e)return t;if(!t)return e;const n=ce(Object.create(null),e);for(const s in t)n[s]=me(e[s],t[s]);return n}function wo(){return{app:null,config:{isNativeTag:Br,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ti=0;function Ri(e,t){return function(s,r=null){M(s)||(s=ce({},s)),r!=null&&!ee(r)&&(r=null);const o=wo(),a=new WeakSet,l=[];let i=!1;const f=o.app={_uid:Ti++,_component:s,_props:r,_container:null,_context:o,_instance:null,version:cl,get config(){return o.config},set config(d){},use(d,...p){return a.has(d)||(d&&M(d.install)?(a.add(d),d.install(f,...p)):M(d)&&(a.add(d),d(f,...p))),f},mixin(d){return o.mixins.includes(d)||o.mixins.push(d),f},component(d,p){return p?(o.components[d]=p,f):o.components[d]},directive(d,p){return p?(o.directives[d]=p,f):o.directives[d]},mount(d,p,h){if(!i){const g=f._ceVNode||ue(s,r);return g.appContext=o,h===!0?h="svg":h===!1&&(h=void 0),e(g,d,h),i=!0,f._container=d,d.__vue_app__=f,Un(g.component)}},onUnmount(d){l.push(d)},unmount(){i&&(Ve(l,f._instance,16),e(null,f._container),delete f._container.__vue_app__)},provide(d,p){return o.provides[d]=p,f},runWithContext(d){const p=Pt;Pt=f;try{return d()}finally{Pt=p}}};return f}}let Pt=null;const Pi=(e,t)=>t==="modelValue"||t==="model-value"?e.modelModifiers:e[`${t}Modifiers`]||e[`${be(t)}Modifiers`]||e[`${_t(t)}Modifiers`];function Hi(e,t,...n){if(e.isUnmounted)return;const s=e.vnode.props||Q;let r=n;const o=t.startsWith("update:"),a=o&&Pi(s,t.slice(7));a&&(a.trim&&(r=n.map(d=>ae(d)?d.trim():d)),a.number&&(r=n.map(ga)));let l,i=s[l=Wn(t)]||s[l=Wn(be(t))];!i&&o&&(i=s[l=Wn(_t(t))]),i&&Ve(i,e,6,r);const f=s[l+"Once"];if(f){if(!e.emitted)e.emitted={};else if(e.emitted[l])return;e.emitted[l]=!0,Ve(f,e,6,r)}}const Oi=new WeakMap;function Ao(e,t,n=!1){const s=n?Oi:t.emitsCache,r=s.get(e);if(r!==void 0)return r;const o=e.emits;let a={},l=!1;if(!M(e)){const i=f=>{const d=Ao(f,t,!0);d&&(l=!0,ce(a,d))};!n&&t.mixins.length&&t.mixins.forEach(i),e.extends&&i(e.extends),e.mixins&&e.mixins.forEach(i)}return!o&&!l?(ee(e)&&s.set(e,null),null):(q(o)?o.forEach(i=>a[i]=null):ce(a,o),ee(e)&&s.set(e,a),a)}function Mn(e,t){return!e||!Tn(t)?!1:(t=t.slice(2).replace(/Once$/,""),K(e,t[0].toLowerCase()+t.slice(1))||K(e,_t(t))||K(e,t))}function ir(e){const{type:t,vnode:n,proxy:s,withProxy:r,propsOptions:[o],slots:a,attrs:l,emit:i,render:f,renderCache:d,props:p,data:h,setupState:g,ctx:P,inheritAttrs:S}=e,F=yn(e);let j,T;try{if(n.shapeFlag&4){const H=r||s,Y=H;j=qe(f.call(Y,H,d,p,g,h,P)),T=l}else{const H=t;j=qe(H.length>1?H(p,{attrs:l,slots:a,emit:i}):H(p,null)),T=t.props?l:Ii(l)}}catch(H){Jt.length=0,Dn(H,e,1),j=ue(Ht)}let O=j;if(T&&S!==!1){const H=Object.keys(T),{shapeFlag:Y}=O;H.length&&Y&7&&(o&&H.some(Rn)&&(T=Di(T,o)),O=Ot(O,T,!1,!0))}return n.dirs&&(O=Ot(O,null,!1,!0),O.dirs=O.dirs?O.dirs.concat(n.dirs):n.dirs),n.transition&&Ns(O,n.transition),j=O,yn(F),j}const Ii=e=>{let t;for(const n in e)(n==="class"||n==="style"||Tn(n))&&((t||(t={}))[n]=e[n]);return t},Di=(e,t)=>{const n={};for(const s in e)(!Rn(s)||!(s.slice(9)in t))&&(n[s]=e[s]);return n};function Li(e,t,n){const{props:s,children:r,component:o}=e,{props:a,children:l,patchFlag:i}=t,f=o.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&i>=0){if(i&1024)return!0;if(i&16)return s?lr(s,a,f):!!a;if(i&8){const d=t.dynamicProps;for(let p=0;p<d.length;p++){const h=d[p];if(Eo(a,s,h)&&!Mn(f,h))return!0}}}else return(r||l)&&(!l||!l.$stable)?!0:s===a?!1:s?a?lr(s,a,f):!0:!!a;return!1}function lr(e,t,n){const s=Object.keys(t);if(s.length!==Object.keys(e).length)return!0;for(let r=0;r<s.length;r++){const o=s[r];if(Eo(t,e,o)&&!Mn(n,o))return!0}return!1}function Eo(e,t,n){const s=e[n],r=t[n];return n==="style"&&ee(s)&&ee(r)?!Cs(s,r):s!==r}function ji({vnode:e,parent:t,suspense:n},s){for(;t;){const r=t.subTree;if(r.suspense&&r.suspense.activeBranch===e&&(r.suspense.vnode.el=r.el=s,e=r),r===e)(e=t.vnode).el=s,t=t.parent;else break}n&&n.activeBranch===e&&(n.vnode.el=s)}const So={},Co=()=>Object.create(So),ko=e=>Object.getPrototypeOf(e)===So;function Ni(e,t,n,s=!1){const r={},o=Co();e.propsDefaults=Object.create(null),To(e,t,r,o);for(const a in e.propsOptions[0])a in r||(r[a]=void 0);n?e.props=s?r:oo(r):e.type.props?e.props=r:e.props=o,e.attrs=o}function Fi(e,t,n,s){const{props:r,attrs:o,vnode:{patchFlag:a}}=e,l=W(r),[i]=e.propsOptions;let f=!1;if((s||a>0)&&!(a&16)){if(a&8){const d=e.vnode.dynamicProps;for(let p=0;p<d.length;p++){let h=d[p];if(Mn(e.emitsOptions,h))continue;const g=t[h];if(i)if(K(o,h))g!==o[h]&&(o[h]=g,f=!0);else{const P=be(h);r[P]=ms(i,l,P,g,e,!1)}else g!==o[h]&&(o[h]=g,f=!0)}}}else{To(e,t,r,o)&&(f=!0);let d;for(const p in l)(!t||!K(t,p)&&((d=_t(p))===p||!K(t,d)))&&(i?n&&(n[p]!==void 0||n[d]!==void 0)&&(r[p]=ms(i,l,p,void 0,e,!0)):delete r[p]);if(o!==l)for(const p in o)(!t||!K(t,p))&&(delete o[p],f=!0)}f&&Qe(e.attrs,"set","")}function To(e,t,n,s){const[r,o]=e.propsOptions;let a=!1,l;if(t)for(let i in t){if(Vt(i))continue;const f=t[i];let d;r&&K(r,d=be(i))?!o||!o.includes(d)?n[d]=f:(l||(l={}))[d]=f:Mn(e.emitsOptions,i)||(!(i in s)||f!==s[i])&&(s[i]=f,a=!0)}if(o){const i=W(n),f=l||Q;for(let d=0;d<o.length;d++){const p=o[d];n[p]=ms(r,i,p,f[p],e,!K(f,p))}}return a}function ms(e,t,n,s,r,o){const a=e[n];if(a!=null){const l=K(a,"default");if(l&&s===void 0){const i=a.default;if(a.type!==Function&&!a.skipFactory&&M(i)){const{propsDefaults:f}=r;if(n in f)s=f[n];else{const d=ln(r);s=f[n]=i.call(null,t),d()}}else s=i;r.ce&&r.ce._setProp(n,s)}a[0]&&(o&&!l?s=!1:a[1]&&(s===""||s===_t(n))&&(s=!0))}return s}const Mi=new WeakMap;function Ro(e,t,n=!1){const s=n?Mi:t.propsCache,r=s.get(e);if(r)return r;const o=e.props,a={},l=[];let i=!1;if(!M(e)){const d=p=>{i=!0;const[h,g]=Ro(p,t,!0);ce(a,h),g&&l.push(...g)};!n&&t.mixins.length&&t.mixins.forEach(d),e.extends&&d(e.extends),e.mixins&&e.mixins.forEach(d)}if(!o&&!i)return ee(e)&&s.set(e,Ct),Ct;if(q(o))for(let d=0;d<o.length;d++){const p=be(o[d]);cr(p)&&(a[p]=Q)}else if(o)for(const d in o){const p=be(d);if(cr(p)){const h=o[d],g=a[p]=q(h)||M(h)?{type:h}:ce({},h),P=g.type;let S=!1,F=!0;if(q(P))for(let j=0;j<P.length;++j){const T=P[j],O=M(T)&&T.name;if(O==="Boolean"){S=!0;break}else O==="String"&&(F=!1)}else S=M(P)&&P.name==="Boolean";g[0]=S,g[1]=F,(S||K(g,"default"))&&l.push(p)}}const f=[a,l];return ee(e)&&s.set(e,f),f}function cr(e){return e[0]!=="$"&&!Vt(e)}const Fs=e=>e==="_"||e==="_ctx"||e==="$stable",Ms=e=>q(e)?e.map(qe):[qe(e)],qi=(e,t,n)=>{if(t._n)return t;const s=Bt((...r)=>Ms(t(...r)),n);return s._c=!1,s},Po=(e,t,n)=>{const s=e._ctx;for(const r in e){if(Fs(r))continue;const o=e[r];if(M(o))t[r]=qi(r,o,s);else if(o!=null){const a=Ms(o);t[r]=()=>a}}},Ho=(e,t)=>{const n=Ms(t);e.slots.default=()=>n},Oo=(e,t,n)=>{for(const s in t)(n||!Fs(s))&&(e[s]=t[s])},Bi=(e,t,n)=>{const s=e.slots=Co();if(e.vnode.shapeFlag&32){const r=t._;r?(Oo(s,t,n),n&&Ur(s,"_",r,!0)):Po(t,s)}else t&&Ho(e,t)},Gi=(e,t,n)=>{const{vnode:s,slots:r}=e;let o=!0,a=Q;if(s.shapeFlag&32){const l=t._;l?n&&l===1?o=!1:Oo(r,t,n):(o=!t.$stable,Po(t,r)),a=t}else t&&(Ho(e,t),a={default:1});if(o)for(const l in r)!Fs(l)&&a[l]==null&&delete r[l]},_e=Ki;function Ui(e){return Vi(e)}function Vi(e,t){const n=On();n.__VUE__=!0;const{insert:s,remove:r,patchProp:o,createElement:a,createText:l,createComment:i,setText:f,setElementText:d,parentNode:p,nextSibling:h,setScopeId:g=Ge,insertStaticContent:P}=e,S=(c,u,m,b=null,y=null,v=null,E=void 0,A=null,w=!!u.dynamicChildren)=>{if(c===u)return;c&&!Ft(c,u)&&(b=_(c),ve(c,y,v,!0),c=null),u.patchFlag===-2&&(w=!1,u.dynamicChildren=null);const{type:x,ref:L,shapeFlag:k}=u;switch(x){case qn:F(c,u,m,b);break;case Ht:j(c,u,m,b);break;case Zn:c==null&&T(u,m,b,E);break;case Ye:ft(c,u,m,b,y,v,E,A,w);break;default:k&1?Y(c,u,m,b,y,v,E,A,w):k&6?Oe(c,u,m,b,y,v,E,A,w):(k&64||k&128)&&x.process(c,u,m,b,y,v,E,A,w,I)}L!=null&&y?Kt(L,c&&c.ref,v,u||c,!u):L==null&&c&&c.ref!=null&&Kt(c.ref,null,v,c,!0)},F=(c,u,m,b)=>{if(c==null)s(u.el=l(u.children),m,b);else{const y=u.el=c.el;u.children!==c.children&&f(y,u.children)}},j=(c,u,m,b)=>{c==null?s(u.el=i(u.children||""),m,b):u.el=c.el},T=(c,u,m,b)=>{[c.el,c.anchor]=P(c.children,u,m,b,c.el,c.anchor)},O=({el:c,anchor:u},m,b)=>{let y;for(;c&&c!==u;)y=h(c),s(c,m,b),c=y;s(u,m,b)},H=({el:c,anchor:u})=>{let m;for(;c&&c!==u;)m=h(c),r(c),c=m;r(u)},Y=(c,u,m,b,y,v,E,A,w)=>{if(u.type==="svg"?E="svg":u.type==="math"&&(E="mathml"),c==null)ie(u,m,b,y,v,E,A,w);else{const x=c.el&&c.el._isVueCE?c.el:null;try{x&&x._beginPatch(),st(c,u,y,v,E,A,w)}finally{x&&x._endPatch()}}},ie=(c,u,m,b,y,v,E,A)=>{let w,x;const{props:L,shapeFlag:k,transition:D,dirs:N}=c;if(w=c.el=a(c.type,v,L&&L.is,L),k&8?d(w,c.children):k&16&&Pe(c.children,w,null,b,y,Xn(c,v),E,A),N&&mt(c,null,b,"created"),te(w,c,c.scopeId,E,b),L){for(const J in L)J!=="value"&&!Vt(J)&&o(w,J,null,L[J],v,b);"value"in L&&o(w,"value",null,L.value,v),(x=L.onVnodeBeforeMount)&&Ne(x,b,c)}N&&mt(c,null,b,"beforeMount");const U=zi(y,D);U&&D.beforeEnter(w),s(w,u,m),((x=L&&L.onVnodeMounted)||U||N)&&_e(()=>{try{x&&Ne(x,b,c),U&&D.enter(w),N&&mt(c,null,b,"mounted")}finally{}},y)},te=(c,u,m,b,y)=>{if(m&&g(c,m),b)for(let v=0;v<b.length;v++)g(c,b[v]);if(y){let v=y.subTree;if(u===v||jo(v.type)&&(v.ssContent===u||v.ssFallback===u)){const E=y.vnode;te(c,E,E.scopeId,E.slotScopeIds,y.parent)}}},Pe=(c,u,m,b,y,v,E,A,w=0)=>{for(let x=w;x<c.length;x++){const L=c[x]=A?Je(c[x]):qe(c[x]);S(null,L,u,m,b,y,v,E,A)}},st=(c,u,m,b,y,v,E)=>{const A=u.el=c.el;let{patchFlag:w,dynamicChildren:x,dirs:L}=u;w|=c.patchFlag&16;const k=c.props||Q,D=u.props||Q;let N;if(m&&ht(m,!1),(N=D.onVnodeBeforeUpdate)&&Ne(N,m,u,c),L&&mt(u,c,m,"beforeUpdate"),m&&ht(m,!0),(k.innerHTML&&D.innerHTML==null||k.textContent&&D.textContent==null)&&d(A,""),x?He(c.dynamicChildren,x,A,m,b,Xn(u,y),v):E||V(c,u,A,null,m,b,Xn(u,y),v,!1),w>0){if(w&16)rt(A,k,D,m,y);else if(w&2&&k.class!==D.class&&o(A,"class",null,D.class,y),w&4&&o(A,"style",k.style,D.style,y),w&8){const U=u.dynamicProps;for(let J=0;J<U.length;J++){const X=U[J],se=k[X],le=D[X];(le!==se||X==="value")&&o(A,X,se,le,y,m)}}w&1&&c.children!==u.children&&d(A,u.children)}else!E&&x==null&&rt(A,k,D,m,y);((N=D.onVnodeUpdated)||L)&&_e(()=>{N&&Ne(N,m,u,c),L&&mt(u,c,m,"updated")},b)},He=(c,u,m,b,y,v,E)=>{for(let A=0;A<u.length;A++){const w=c[A],x=u[A],L=w.el&&(w.type===Ye||!Ft(w,x)||w.shapeFlag&198)?p(w.el):m;S(w,x,L,null,b,y,v,E,!0)}},rt=(c,u,m,b,y)=>{if(u!==m){if(u!==Q)for(const v in u)!Vt(v)&&!(v in m)&&o(c,v,u[v],null,y,b);for(const v in m){if(Vt(v))continue;const E=m[v],A=u[v];E!==A&&v!=="value"&&o(c,v,A,E,y,b)}"value"in m&&o(c,"value",u.value,m.value,y)}},ft=(c,u,m,b,y,v,E,A,w)=>{const x=u.el=c?c.el:l(""),L=u.anchor=c?c.anchor:l("");let{patchFlag:k,dynamicChildren:D,slotScopeIds:N}=u;N&&(A=A?A.concat(N):N),c==null?(s(x,m,b),s(L,m,b),Pe(u.children||[],m,L,y,v,E,A,w)):k>0&&k&64&&D&&c.dynamicChildren&&c.dynamicChildren.length===D.length?(He(c.dynamicChildren,D,m,y,v,E,A),(u.key!=null||y&&u===y.subTree)&&Io(c,u,!0)):V(c,u,m,L,y,v,E,A,w)},Oe=(c,u,m,b,y,v,E,A,w)=>{u.slotScopeIds=A,c==null?u.shapeFlag&512?y.ctx.activate(u,m,b,E,w):Lt(u,m,b,y,v,E,w):yt(c,u,w)},Lt=(c,u,m,b,y,v,E)=>{const A=c.component=tl(c,b,y);if(vo(c)&&(A.ctx.renderer=I),sl(A,!1,E),A.asyncDep){if(y&&y.registerDep(A,oe,E),!c.el){const w=A.subTree=ue(Ht);j(null,w,u,m),c.placeholder=w.el}}else oe(A,c,u,m,y,v,E)},yt=(c,u,m)=>{const b=u.component=c.component;if(Li(c,u,m))if(b.asyncDep&&!b.asyncResolved){$(b,u,m);return}else b.next=u,b.update();else u.el=c.el,b.vnode=u},oe=(c,u,m,b,y,v,E)=>{const A=()=>{if(c.isMounted){let{next:k,bu:D,u:N,parent:U,vnode:J}=c;{const Le=Do(c);if(Le){k&&(k.el=J.el,$(c,k,E)),Le.asyncDep.then(()=>{_e(()=>{c.isUnmounted||x()},y)});return}}let X=k,se;ht(c,!1),k?(k.el=J.el,$(c,k,E)):k=J,D&&Kn(D),(se=k.props&&k.props.onVnodeBeforeUpdate)&&Ne(se,U,k,J),ht(c,!0);const le=ir(c),De=c.subTree;c.subTree=le,S(De,le,p(De.el),_(De),c,y,v),k.el=le.el,X===null&&ji(c,le.el),N&&_e(N,y),(se=k.props&&k.props.onVnodeUpdated)&&_e(()=>Ne(se,U,k,J),y)}else{let k;const{el:D,props:N}=u,{bm:U,m:J,parent:X,root:se,type:le}=c,De=$t(u);ht(c,!1),U&&Kn(U),!De&&(k=N&&N.onVnodeBeforeMount)&&Ne(k,X,u),ht(c,!0);{se.ce&&se.ce._hasShadowRoot()&&se.ce._injectChildStyle(le,c.parent?c.parent.type:void 0);const Le=c.subTree=ir(c);S(null,Le,m,b,c,y,v),u.el=Le.el}if(J&&_e(J,y),!De&&(k=N&&N.onVnodeMounted)){const Le=u;_e(()=>Ne(k,X,Le),y)}(u.shapeFlag&256||X&&$t(X.vnode)&&X.vnode.shapeFlag&256)&&c.a&&_e(c.a,y),c.isMounted=!0,u=m=b=null}};c.scope.on();const w=c.effect=new zr(A);c.scope.off();const x=c.update=w.run.bind(w),L=c.job=w.runIfDirty.bind(w);L.i=c,L.id=c.uid,w.scheduler=()=>js(L),ht(c,!0),x()},$=(c,u,m)=>{u.component=c;const b=c.vnode.props;c.vnode=u,c.next=null,Fi(c,u.props,b,m),Gi(c,u.children,m),Ze(),Xs(c),et()},V=(c,u,m,b,y,v,E,A,w=!1)=>{const x=c&&c.children,L=c?c.shapeFlag:0,k=u.children,{patchFlag:D,shapeFlag:N}=u;if(D>0){if(D&128){ot(x,k,m,b,y,v,E,A,w);return}else if(D&256){ze(x,k,m,b,y,v,E,A,w);return}}N&8?(L&16&&Se(x,y,v),k!==x&&d(m,k)):L&16?N&16?ot(x,k,m,b,y,v,E,A,w):Se(x,y,v,!0):(L&8&&d(m,""),N&16&&Pe(k,m,b,y,v,E,A,w))},ze=(c,u,m,b,y,v,E,A,w)=>{c=c||Ct,u=u||Ct;const x=c.length,L=u.length,k=Math.min(x,L);let D;for(D=0;D<k;D++){const N=u[D]=w?Je(u[D]):qe(u[D]);S(c[D],N,m,null,y,v,E,A,w)}x>L?Se(c,y,v,!0,!1,k):Pe(u,m,b,y,v,E,A,w,k)},ot=(c,u,m,b,y,v,E,A,w)=>{let x=0;const L=u.length;let k=c.length-1,D=L-1;for(;x<=k&&x<=D;){const N=c[x],U=u[x]=w?Je(u[x]):qe(u[x]);if(Ft(N,U))S(N,U,m,null,y,v,E,A,w);else break;x++}for(;x<=k&&x<=D;){const N=c[k],U=u[D]=w?Je(u[D]):qe(u[D]);if(Ft(N,U))S(N,U,m,null,y,v,E,A,w);else break;k--,D--}if(x>k){if(x<=D){const N=D+1,U=N<L?u[N].el:b;for(;x<=D;)S(null,u[x]=w?Je(u[x]):qe(u[x]),m,U,y,v,E,A,w),x++}}else if(x>D)for(;x<=k;)ve(c[x],y,v,!0),x++;else{const N=x,U=x,J=new Map;for(x=U;x<=D;x++){const we=u[x]=w?Je(u[x]):qe(u[x]);we.key!=null&&J.set(we.key,x)}let X,se=0;const le=D-U+1;let De=!1,Le=0;const jt=new Array(le);for(x=0;x<le;x++)jt[x]=0;for(x=N;x<=k;x++){const we=c[x];if(se>=le){ve(we,y,v,!0);continue}let je;if(we.key!=null)je=J.get(we.key);else for(X=U;X<=D;X++)if(jt[X-U]===0&&Ft(we,u[X])){je=X;break}je===void 0?ve(we,y,v,!0):(jt[je-U]=x+1,je>=Le?Le=je:De=!0,S(we,u[je],m,null,y,v,E,A,w),se++)}const zs=De?Wi(jt):Ct;for(X=zs.length-1,x=le-1;x>=0;x--){const we=U+x,je=u[we],Ws=u[we+1],Ks=we+1<L?Ws.el||Lo(Ws):b;jt[x]===0?S(null,je,m,Ks,y,v,E,A,w):De&&(X<0||x!==zs[X]?Ie(je,m,Ks,2):X--)}}},Ie=(c,u,m,b,y=null)=>{const{el:v,type:E,transition:A,children:w,shapeFlag:x}=c;if(x&6){Ie(c.component.subTree,u,m,b);return}if(x&128){c.suspense.move(u,m,b);return}if(x&64){E.move(c,u,m,I);return}if(E===Ye){s(v,u,m);for(let k=0;k<w.length;k++)Ie(w[k],u,m,b);s(c.anchor,u,m);return}if(E===Zn){O(c,u,m);return}if(b!==2&&x&1&&A)if(b===0)A.beforeEnter(v),s(v,u,m),_e(()=>A.enter(v),y);else{const{leave:k,delayLeave:D,afterLeave:N}=A,U=()=>{c.ctx.isUnmounted?r(v):s(v,u,m)},J=()=>{v._isLeaving&&v[ii](!0),k(v,()=>{U(),N&&N()})};D?D(v,U,J):J()}else s(v,u,m)},ve=(c,u,m,b=!1,y=!1)=>{const{type:v,props:E,ref:A,children:w,dynamicChildren:x,shapeFlag:L,patchFlag:k,dirs:D,cacheIndex:N,memo:U}=c;if(k===-2&&(y=!1),A!=null&&(Ze(),Kt(A,null,m,c,!0),et()),N!=null&&(u.renderCache[N]=void 0),L&256){u.ctx.deactivate(c);return}const J=L&1&&D,X=!$t(c);let se;if(X&&(se=E&&E.onVnodeBeforeUnmount)&&Ne(se,u,c),L&6)pt(c.component,m,b);else{if(L&128){c.suspense.unmount(m,b);return}J&&mt(c,null,u,"beforeUnmount"),L&64?c.type.remove(c,u,m,I,b):x&&!x.hasOnce&&(v!==Ye||k>0&&k&64)?Se(x,u,m,!1,!0):(v===Ye&&k&384||!y&&L&16)&&Se(w,u,m),b&&xt(c)}const le=U!=null&&N==null;(X&&(se=E&&E.onVnodeUnmounted)||J||le)&&_e(()=>{se&&Ne(se,u,c),J&&mt(c,null,u,"unmounted"),le&&(c.el=null)},m)},xt=c=>{const{type:u,el:m,anchor:b,transition:y}=c;if(u===Ye){wt(m,b);return}if(u===Zn){H(c);return}const v=()=>{r(m),y&&!y.persisted&&y.afterLeave&&y.afterLeave()};if(c.shapeFlag&1&&y&&!y.persisted){const{leave:E,delayLeave:A}=y,w=()=>E(m,v);A?A(c.el,v,w):w()}else v()},wt=(c,u)=>{let m;for(;c!==u;)m=h(c),r(c),c=m;r(u)},pt=(c,u,m)=>{const{bum:b,scope:y,job:v,subTree:E,um:A,m:w,a:x}=c;dr(w),dr(x),b&&Kn(b),y.stop(),v&&(v.flags|=8,ve(E,c,u,m)),A&&_e(A,u),_e(()=>{c.isUnmounted=!0},u)},Se=(c,u,m,b=!1,y=!1,v=0)=>{for(let E=v;E<c.length;E++)ve(c[E],u,m,b,y)},_=c=>{if(c.shapeFlag&6)return _(c.component.subTree);if(c.shapeFlag&128)return c.suspense.next();const u=h(c.anchor||c.el),m=u&&u[oi];return m?h(m):u};let R=!1;const C=(c,u,m)=>{let b;c==null?u._vnode&&(ve(u._vnode,null,null,!0),b=u._vnode.component):S(u._vnode||null,c,u,null,null,null,m),u._vnode=c,R||(R=!0,Xs(b),uo(),R=!1)},I={p:S,um:ve,m:Ie,r:xt,mt:Lt,mc:Pe,pc:V,pbc:He,n:_,o:e};return{render:C,hydrate:void 0,createApp:Ri(C)}}function Xn({type:e,props:t},n){return n==="svg"&&e==="foreignObject"||n==="mathml"&&e==="annotation-xml"&&t&&t.encoding&&t.encoding.includes("html")?void 0:n}function ht({effect:e,job:t},n){n?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function zi(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function Io(e,t,n=!1){const s=e.children,r=t.children;if(q(s)&&q(r))for(let o=0;o<s.length;o++){const a=s[o];let l=r[o];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=r[o]=Je(r[o]),l.el=a.el),!n&&l.patchFlag!==-2&&Io(a,l)),l.type===qn&&(l.patchFlag===-1&&(l=r[o]=Je(l)),l.el=a.el),l.type===Ht&&!l.el&&(l.el=a.el)}}function Wi(e){const t=e.slice(),n=[0];let s,r,o,a,l;const i=e.length;for(s=0;s<i;s++){const f=e[s];if(f!==0){if(r=n[n.length-1],e[r]<f){t[s]=r,n.push(s);continue}for(o=0,a=n.length-1;o<a;)l=o+a>>1,e[n[l]]<f?o=l+1:a=l;f<e[n[o]]&&(o>0&&(t[s]=n[o-1]),n[o]=s)}}for(o=n.length,a=n[o-1];o-- >0;)n[o]=a,a=t[a];return n}function Do(e){const t=e.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:Do(t)}function dr(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}function Lo(e){if(e.placeholder)return e.placeholder;const t=e.component;return t?Lo(t.subTree):null}const jo=e=>e.__isSuspense;function Ki(e,t){t&&t.pendingBranch?q(e)?t.effects.push(...e):t.effects.push(e):ei(e)}const Ye=Symbol.for("v-fgt"),qn=Symbol.for("v-txt"),Ht=Symbol.for("v-cmt"),Zn=Symbol.for("v-stc"),Jt=[];let Ee=null;function Bn(e=!1){Jt.push(Ee=e?null:[])}function $i(){Jt.pop(),Ee=Jt[Jt.length-1]||null}let nn=1;function An(e,t=!1){nn+=e,e<0&&Ee&&t&&(Ee.hasOnce=!0)}function Yi(e){return e.dynamicChildren=nn>0?Ee||Ct:null,$i(),nn>0&&Ee&&Ee.push(e),e}function Gn(e,t,n,s,r,o){return Yi(B(e,t,n,s,r,o,!0))}function En(e){return e?e.__v_isVNode===!0:!1}function Ft(e,t){return e.type===t.type&&e.key===t.key}const No=({key:e})=>e??null,gn=({ref:e,ref_key:t,ref_for:n})=>(typeof e=="number"&&(e=""+e),e!=null?ae(e)||pe(e)||M(e)?{i:Ae,r:e,k:t,f:!!n}:e:null);function B(e,t=null,n=null,s=0,r=null,o=e===Ye?0:1,a=!1,l=!1){const i={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&No(t),ref:t&&gn(t),scopeId:po,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:o,patchFlag:s,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:Ae};return l?(qs(i,n),o&128&&e.normalize(i)):n&&(i.shapeFlag|=ae(n)?8:16),nn>0&&!a&&Ee&&(i.patchFlag>0||o&6)&&i.patchFlag!==32&&Ee.push(i),i}const ue=Ji;function Ji(e,t=null,n=null,s=0,r=null,o=!1){if((!e||e===yi)&&(e=Ht),En(e)){const l=Ot(e,t,!0);return n&&qs(l,n),nn>0&&!o&&Ee&&(l.shapeFlag&6?Ee[Ee.indexOf(e)]=l:Ee.push(l)),l.patchFlag=-2,l}if(ll(e)&&(e=e.__vccOpts),t){t=Qi(t);let{class:l,style:i}=t;l&&!ae(l)&&(t.class=kt(l)),ee(i)&&(Ds(i)&&!q(i)&&(i=ce({},i)),t.style=Ss(i))}const a=ae(e)?1:jo(e)?128:ai(e)?64:ee(e)?4:M(e)?2:0;return B(e,t,n,s,r,a,o,!0)}function Qi(e){return e?Ds(e)||ko(e)?ce({},e):e:null}function Ot(e,t,n=!1,s=!1){const{props:r,ref:o,patchFlag:a,children:l,transition:i}=e,f=t?Xi(r||{},t):r,d={__v_isVNode:!0,__v_skip:!0,type:e.type,props:f,key:f&&No(f),ref:t&&t.ref?n&&o?q(o)?o.concat(gn(t)):[o,gn(t)]:gn(t):o,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:l,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==Ye?a===-1?16:a|16:a,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:i,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Ot(e.ssContent),ssFallback:e.ssFallback&&Ot(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return i&&s&&Ns(d,i.clone(d)),d}function Fo(e=" ",t=0){return ue(qn,null,e,t)}function qe(e){return e==null||typeof e=="boolean"?ue(Ht):q(e)?ue(Ye,null,e.slice()):En(e)?Je(e):ue(qn,null,String(e))}function Je(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Ot(e)}function qs(e,t){let n=0;const{shapeFlag:s}=e;if(t==null)t=null;else if(q(t))n=16;else if(typeof t=="object")if(s&65){const r=t.default;r&&(r._c&&(r._d=!1),qs(e,r()),r._c&&(r._d=!0));return}else{n=32;const r=t._;!r&&!ko(t)?t._ctx=Ae:r===3&&Ae&&(Ae.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else M(t)?(t={default:t,_ctx:Ae},n=32):(t=String(t),s&64?(n=16,t=[Fo(t)]):n=8);e.children=t,e.shapeFlag|=n}function Xi(...e){const t={};for(let n=0;n<e.length;n++){const s=e[n];for(const r in s)if(r==="class")t.class!==s.class&&(t.class=kt([t.class,s.class]));else if(r==="style")t.style=Ss([t.style,s.style]);else if(Tn(r)){const o=t[r],a=s[r];a&&o!==a&&!(q(o)&&o.includes(a))?t[r]=o?[].concat(o,a):a:a==null&&o==null&&!Rn(r)&&(t[r]=a)}else r!==""&&(t[r]=s[r])}return t}function Ne(e,t,n,s=null){Ve(e,t,7,[n,s])}const Zi=wo();let el=0;function tl(e,t,n){const s=e.type,r=(t?t.appContext:e.appContext)||Zi,o={uid:el++,vnode:e,type:s,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Ea(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),ids:t?t.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Ro(s,r),emitsOptions:Ao(s,r),emit:null,emitted:null,propsDefaults:Q,inheritAttrs:s.inheritAttrs,ctx:Q,data:Q,props:Q,attrs:Q,slots:Q,refs:Q,setupState:Q,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return o.ctx={_:o},o.root=t?t.root:o,o.emit=Hi.bind(null,o),e.ce&&e.ce(o),o}let fe=null;const nl=()=>fe||Ae;let Sn,hs;{const e=On(),t=(n,s)=>{let r;return(r=e[n])||(r=e[n]=[]),r.push(s),o=>{r.length>1?r.forEach(a=>a(o)):r[0](o)}};Sn=t("__VUE_INSTANCE_SETTERS__",n=>fe=n),hs=t("__VUE_SSR_SETTERS__",n=>sn=n)}const ln=e=>{const t=fe;return Sn(e),e.scope.on(),()=>{e.scope.off(),Sn(t)}},ur=()=>{fe&&fe.scope.off(),Sn(null)};function Mo(e){return e.vnode.shapeFlag&4}let sn=!1;function sl(e,t=!1,n=!1){t&&hs(t);const{props:s,children:r}=e.vnode,o=Mo(e);Ni(e,s,o,t),Bi(e,r,n||t);const a=o?rl(e,t):void 0;return t&&hs(!1),a}function rl(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,wi);const{setup:s}=n;if(s){Ze();const r=e.setupContext=s.length>1?al(e):null,o=ln(e),a=an(s,e,0,[e.props,r]),l=Gr(a);if(et(),o(),(l||e.sp)&&!$t(e)&&bo(e),l){if(a.then(ur,ur),t)return a.then(i=>{fr(e,i)}).catch(i=>{Dn(i,e,0)});e.asyncDep=a}else fr(e,a)}else qo(e)}function fr(e,t,n){M(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:ee(t)&&(e.setupState=io(t)),qo(e)}function qo(e,t,n){const s=e.type;e.render||(e.render=s.render||Ge);{const r=ln(e);Ze();try{Ai(e)}finally{et(),r()}}}const ol={get(e,t){return de(e,"get",""),e[t]}};function al(e){const t=n=>{e.exposed=n||{}};return{attrs:new Proxy(e.attrs,ol),slots:e.slots,emit:e.emit,expose:t}}function Un(e){return e.exposed?e.exposeProxy||(e.exposeProxy=new Proxy(io(Va(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in Yt)return Yt[n](e)},has(t,n){return n in t||n in Yt}})):e.proxy}function il(e,t=!0){return M(e)?e.displayName||e.name:e.name||t&&e.__name}function ll(e){return M(e)&&"__vccOpts"in e}const xe=(e,t)=>Ya(e,t,sn);function Bo(e,t,n){try{An(-1);const s=arguments.length;return s===2?ee(t)&&!q(t)?En(t)?ue(e,null,[t]):ue(e,t):ue(e,null,t):(s>3?n=Array.prototype.slice.call(arguments,2):s===3&&En(n)&&(n=[n]),ue(e,t,n))}finally{An(1)}}const cl="3.5.32";/**
* @vue/runtime-dom v3.5.32
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let gs;const pr=typeof window<"u"&&window.trustedTypes;if(pr)try{gs=pr.createPolicy("vue",{createHTML:e=>e})}catch{}const Go=gs?e=>gs.createHTML(e):e=>e,dl="http://www.w3.org/2000/svg",ul="http://www.w3.org/1998/Math/MathML",$e=typeof document<"u"?document:null,mr=$e&&$e.createElement("template"),fl={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,s)=>{const r=t==="svg"?$e.createElementNS(dl,e):t==="mathml"?$e.createElementNS(ul,e):n?$e.createElement(e,{is:n}):$e.createElement(e);return e==="select"&&s&&s.multiple!=null&&r.setAttribute("multiple",s.multiple),r},createText:e=>$e.createTextNode(e),createComment:e=>$e.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>$e.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,s,r,o){const a=n?n.previousSibling:t.lastChild;if(r&&(r===o||r.nextSibling))for(;t.insertBefore(r.cloneNode(!0),n),!(r===o||!(r=r.nextSibling)););else{mr.innerHTML=Go(s==="svg"?`<svg>${e}</svg>`:s==="mathml"?`<math>${e}</math>`:e);const l=mr.content;if(s==="svg"||s==="mathml"){const i=l.firstChild;for(;i.firstChild;)l.appendChild(i.firstChild);l.removeChild(i)}t.insertBefore(l,n)}return[a?a.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}},pl=Symbol("_vtc");function ml(e,t,n){const s=e[pl];s&&(t=(t?[t,...s]:[...s]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}const Cn=Symbol("_vod"),Uo=Symbol("_vsh"),hl={name:"show",beforeMount(e,{value:t},{transition:n}){e[Cn]=e.style.display==="none"?"":e.style.display,n&&t?n.beforeEnter(e):Mt(e,t)},mounted(e,{value:t},{transition:n}){n&&t&&n.enter(e)},updated(e,{value:t,oldValue:n},{transition:s}){!t!=!n&&(s?t?(s.beforeEnter(e),Mt(e,!0),s.enter(e)):s.leave(e,()=>{Mt(e,!1)}):Mt(e,t))},beforeUnmount(e,{value:t}){Mt(e,t)}};function Mt(e,t){e.style.display=t?e[Cn]:"none",e[Uo]=!t}const gl=Symbol(""),bl=/(?:^|;)\s*display\s*:/;function vl(e,t,n){const s=e.style,r=ae(n);let o=!1;if(n&&!r){if(t)if(ae(t))for(const a of t.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&bn(s,l,"")}else for(const a in t)n[a]==null&&bn(s,a,"");for(const a in n)a==="display"&&(o=!0),bn(s,a,n[a])}else if(r){if(t!==n){const a=s[gl];a&&(n+=";"+a),s.cssText=n,o=bl.test(n)}}else t&&e.removeAttribute("style");Cn in e&&(e[Cn]=o?s.display:"",e[Uo]&&(s.display="none"))}const hr=/\s*!important$/;function bn(e,t,n){if(q(n))n.forEach(s=>bn(e,t,s));else if(n==null&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{const s=_l(e,t);hr.test(n)?e.setProperty(_t(s),n.replace(hr,""),"important"):e[s]=n}}const gr=["Webkit","Moz","ms"],es={};function _l(e,t){const n=es[t];if(n)return n;let s=be(t);if(s!=="filter"&&s in e)return es[t]=s;s=Hn(s);for(let r=0;r<gr.length;r++){const o=gr[r]+s;if(o in e)return es[t]=o}return t}const br="http://www.w3.org/1999/xlink";function vr(e,t,n,s,r,o=wa(t)){s&&t.startsWith("xlink:")?n==null?e.removeAttributeNS(br,t.slice(6,t.length)):e.setAttributeNS(br,t,n):n==null||o&&!Vr(n)?e.removeAttribute(t):e.setAttribute(t,o?"":dt(n)?String(n):n)}function _r(e,t,n,s,r){if(t==="innerHTML"||t==="textContent"){n!=null&&(e[t]=t==="innerHTML"?Go(n):n);return}const o=e.tagName;if(t==="value"&&o!=="PROGRESS"&&!o.includes("-")){const l=o==="OPTION"?e.getAttribute("value")||"":e.value,i=n==null?e.type==="checkbox"?"on":"":String(n);(l!==i||!("_value"in e))&&(e.value=i),n==null&&e.removeAttribute(t),e._value=n;return}let a=!1;if(n===""||n==null){const l=typeof e[t];l==="boolean"?n=Vr(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{e[t]=n}catch{}a&&e.removeAttribute(r||t)}function yl(e,t,n,s){e.addEventListener(t,n,s)}function xl(e,t,n,s){e.removeEventListener(t,n,s)}const yr=Symbol("_vei");function wl(e,t,n,s,r=null){const o=e[yr]||(e[yr]={}),a=o[t];if(s&&a)a.value=s;else{const[l,i]=Al(t);if(s){const f=o[t]=Cl(s,r);yl(e,l,f,i)}else a&&(xl(e,l,a,i),o[t]=void 0)}}const xr=/(?:Once|Passive|Capture)$/;function Al(e){let t;if(xr.test(e)){t={};let s;for(;s=e.match(xr);)e=e.slice(0,e.length-s[0].length),t[s[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):_t(e.slice(2)),t]}let ts=0;const El=Promise.resolve(),Sl=()=>ts||(El.then(()=>ts=0),ts=Date.now());function Cl(e,t){const n=s=>{if(!s._vts)s._vts=Date.now();else if(s._vts<=n.attached)return;Ve(kl(s,n.value),t,5,[s])};return n.value=e,n.attached=Sl(),n}function kl(e,t){if(q(t)){const n=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0},t.map(s=>r=>!r._stopped&&s&&s(r))}else return t}const wr=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)>96&&e.charCodeAt(2)<123,Tl=(e,t,n,s,r,o)=>{const a=r==="svg";t==="class"?ml(e,s,a):t==="style"?vl(e,n,s):Tn(t)?Rn(t)||wl(e,t,n,s,o):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):Rl(e,t,s,a))?(_r(e,t,s),!e.tagName.includes("-")&&(t==="value"||t==="checked"||t==="selected")&&vr(e,t,s,a,o,t!=="value")):e._isVueCE&&(Pl(e,t)||e._def.__asyncLoader&&(/[A-Z]/.test(t)||!ae(s)))?_r(e,be(t),s,o,t):(t==="true-value"?e._trueValue=s:t==="false-value"&&(e._falseValue=s),vr(e,t,s,a))};function Rl(e,t,n,s){if(s)return!!(t==="innerHTML"||t==="textContent"||t in e&&wr(t)&&M(n));if(t==="spellcheck"||t==="draggable"||t==="translate"||t==="autocorrect"||t==="sandbox"&&e.tagName==="IFRAME"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA")return!1;if(t==="width"||t==="height"){const r=e.tagName;if(r==="IMG"||r==="VIDEO"||r==="CANVAS"||r==="SOURCE")return!1}return wr(t)&&ae(n)?!1:t in e}function Pl(e,t){const n=e._def.props;if(!n)return!1;const s=be(t);return Array.isArray(n)?n.some(r=>be(r)===s):Object.keys(n).some(r=>be(r)===s)}const Hl=ce({patchProp:Tl},fl);let Ar;function Ol(){return Ar||(Ar=Ui(Hl))}const Il=((...e)=>{const t=Ol().createApp(...e),{mount:n}=t;return t.mount=s=>{const r=Ll(s);if(!r)return;const o=t._component;!M(o)&&!o.render&&!o.template&&(o.template=r.innerHTML),r.nodeType===1&&(r.textContent="");const a=n(r,!1,Dl(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),a},t});function Dl(e){if(e instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&e instanceof MathMLElement)return"mathml"}function Ll(e){return ae(e)?document.querySelector(e):e}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const St=typeof document<"u";function Vo(e){return typeof e=="object"||"displayName"in e||"props"in e||"__vccOpts"in e}function jl(e){return e.__esModule||e[Symbol.toStringTag]==="Module"||e.default&&Vo(e.default)}const z=Object.assign;function ns(e,t){const n={};for(const s in t){const r=t[s];n[s]=Re(r)?r.map(e):e(r)}return n}const Qt=()=>{},Re=Array.isArray;function Er(e,t){const n={};for(const s in e)n[s]=s in t?t[s]:e[s];return n}const zo=/#/g,Nl=/&/g,Fl=/\//g,Ml=/=/g,ql=/\?/g,Wo=/\+/g,Bl=/%5B/g,Gl=/%5D/g,Ko=/%5E/g,Ul=/%60/g,$o=/%7B/g,Vl=/%7C/g,Yo=/%7D/g,zl=/%20/g;function Bs(e){return e==null?"":encodeURI(""+e).replace(Vl,"|").replace(Bl,"[").replace(Gl,"]")}function Wl(e){return Bs(e).replace($o,"{").replace(Yo,"}").replace(Ko,"^")}function bs(e){return Bs(e).replace(Wo,"%2B").replace(zl,"+").replace(zo,"%23").replace(Nl,"%26").replace(Ul,"`").replace($o,"{").replace(Yo,"}").replace(Ko,"^")}function Kl(e){return bs(e).replace(Ml,"%3D")}function $l(e){return Bs(e).replace(zo,"%23").replace(ql,"%3F")}function Yl(e){return $l(e).replace(Fl,"%2F")}function rn(e){if(e==null)return null;try{return decodeURIComponent(""+e)}catch{}return""+e}const Jl=/\/$/,Ql=e=>e.replace(Jl,"");function ss(e,t,n="/"){let s,r={},o="",a="";const l=t.indexOf("#");let i=t.indexOf("?");return i=l>=0&&i>l?-1:i,i>=0&&(s=t.slice(0,i),o=t.slice(i,l>0?l:t.length),r=e(o.slice(1))),l>=0&&(s=s||t.slice(0,l),a=t.slice(l,t.length)),s=tc(s??t,n),{fullPath:s+o+a,path:s,query:r,hash:rn(a)}}function Xl(e,t){const n=t.query?e(t.query):"";return t.path+(n&&"?")+n+(t.hash||"")}function Sr(e,t){return!t||!e.toLowerCase().startsWith(t.toLowerCase())?e:e.slice(t.length)||"/"}function Zl(e,t,n){const s=t.matched.length-1,r=n.matched.length-1;return s>-1&&s===r&&It(t.matched[s],n.matched[r])&&Jo(t.params,n.params)&&e(t.query)===e(n.query)&&t.hash===n.hash}function It(e,t){return(e.aliasOf||e)===(t.aliasOf||t)}function Jo(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(var n in e)if(!ec(e[n],t[n]))return!1;return!0}function ec(e,t){return Re(e)?Cr(e,t):Re(t)?Cr(t,e):(e==null?void 0:e.valueOf())===(t==null?void 0:t.valueOf())}function Cr(e,t){return Re(t)?e.length===t.length&&e.every((n,s)=>n===t[s]):e.length===1&&e[0]===t}function tc(e,t){if(e.startsWith("/"))return e;if(!e)return t;const n=t.split("/"),s=e.split("/"),r=s[s.length-1];(r===".."||r===".")&&s.push("");let o=n.length-1,a,l;for(a=0;a<s.length;a++)if(l=s[a],l!==".")if(l==="..")o>1&&o--;else break;return n.slice(0,o).join("/")+"/"+s.slice(a).join("/")}const at={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let vs=(function(e){return e.pop="pop",e.push="push",e})({}),rs=(function(e){return e.back="back",e.forward="forward",e.unknown="",e})({});function nc(e){if(!e)if(St){const t=document.querySelector("base");e=t&&t.getAttribute("href")||"/",e=e.replace(/^\w+:\/\/[^\/]+/,"")}else e="/";return e[0]!=="/"&&e[0]!=="#"&&(e="/"+e),Ql(e)}const sc=/^[^#]+#/;function rc(e,t){return e.replace(sc,"#")+t}function oc(e,t){const n=document.documentElement.getBoundingClientRect(),s=e.getBoundingClientRect();return{behavior:t.behavior,left:s.left-n.left-(t.left||0),top:s.top-n.top-(t.top||0)}}const Vn=()=>({left:window.scrollX,top:window.scrollY});function ac(e){let t;if("el"in e){const n=e.el,s=typeof n=="string"&&n.startsWith("#"),r=typeof n=="string"?s?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!r)return;t=oc(r,e)}else t=e;"scrollBehavior"in document.documentElement.style?window.scrollTo(t):window.scrollTo(t.left!=null?t.left:window.scrollX,t.top!=null?t.top:window.scrollY)}function kr(e,t){return(history.state?history.state.position-t:-1)+e}const _s=new Map;function ic(e,t){_s.set(e,t)}function lc(e){const t=_s.get(e);return _s.delete(e),t}function cc(e){return typeof e=="string"||e&&typeof e=="object"}function Qo(e){return typeof e=="string"||typeof e=="symbol"}let ne=(function(e){return e[e.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",e[e.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",e[e.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",e[e.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",e[e.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",e})({});const Xo=Symbol("");ne.MATCHER_NOT_FOUND+"",ne.NAVIGATION_GUARD_REDIRECT+"",ne.NAVIGATION_ABORTED+"",ne.NAVIGATION_CANCELLED+"",ne.NAVIGATION_DUPLICATED+"";function Dt(e,t){return z(new Error,{type:e,[Xo]:!0},t)}function Ke(e,t){return e instanceof Error&&Xo in e&&(t==null||!!(e.type&t))}const dc=["params","query","hash"];function uc(e){if(typeof e=="string")return e;if(e.path!=null)return e.path;const t={};for(const n of dc)n in e&&(t[n]=e[n]);return JSON.stringify(t,null,2)}function fc(e){const t={};if(e===""||e==="?")return t;const n=(e[0]==="?"?e.slice(1):e).split("&");for(let s=0;s<n.length;++s){const r=n[s].replace(Wo," "),o=r.indexOf("="),a=rn(o<0?r:r.slice(0,o)),l=o<0?null:rn(r.slice(o+1));if(a in t){let i=t[a];Re(i)||(i=t[a]=[i]),i.push(l)}else t[a]=l}return t}function Tr(e){let t="";for(let n in e){const s=e[n];if(n=Kl(n),s==null){s!==void 0&&(t+=(t.length?"&":"")+n);continue}(Re(s)?s.map(r=>r&&bs(r)):[s&&bs(s)]).forEach(r=>{r!==void 0&&(t+=(t.length?"&":"")+n,r!=null&&(t+="="+r))})}return t}function pc(e){const t={};for(const n in e){const s=e[n];s!==void 0&&(t[n]=Re(s)?s.map(r=>r==null?null:""+r):s==null?s:""+s)}return t}const mc=Symbol(""),Rr=Symbol(""),zn=Symbol(""),Gs=Symbol(""),ys=Symbol("");function qt(){let e=[];function t(s){return e.push(s),()=>{const r=e.indexOf(s);r>-1&&e.splice(r,1)}}function n(){e=[]}return{add:t,list:()=>e.slice(),reset:n}}function ct(e,t,n,s,r,o=a=>a()){const a=s&&(s.enterCallbacks[r]=s.enterCallbacks[r]||[]);return()=>new Promise((l,i)=>{const f=h=>{h===!1?i(Dt(ne.NAVIGATION_ABORTED,{from:n,to:t})):h instanceof Error?i(h):cc(h)?i(Dt(ne.NAVIGATION_GUARD_REDIRECT,{from:t,to:h})):(a&&s.enterCallbacks[r]===a&&typeof h=="function"&&a.push(h),l())},d=o(()=>e.call(s&&s.instances[r],t,n,f));let p=Promise.resolve(d);e.length<3&&(p=p.then(f)),p.catch(h=>i(h))})}function os(e,t,n,s,r=o=>o()){const o=[];for(const a of e)for(const l in a.components){let i=a.components[l];if(!(t!=="beforeRouteEnter"&&!a.instances[l]))if(Vo(i)){const f=(i.__vccOpts||i)[t];f&&o.push(ct(f,n,s,a,l,r))}else{let f=i();o.push(()=>f.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${a.path}"`);const p=jl(d)?d.default:d;a.mods[l]=d,a.components[l]=p;const h=(p.__vccOpts||p)[t];return h&&ct(h,n,s,a,l,r)()}))}}return o}function hc(e,t){const n=[],s=[],r=[],o=Math.max(t.matched.length,e.matched.length);for(let a=0;a<o;a++){const l=t.matched[a];l&&(e.matched.find(f=>It(f,l))?s.push(l):n.push(l));const i=e.matched[a];i&&(t.matched.find(f=>It(f,i))||r.push(i))}return[n,s,r]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let gc=()=>location.protocol+"//"+location.host;function Zo(e,t){const{pathname:n,search:s,hash:r}=t,o=e.indexOf("#");if(o>-1){let a=r.includes(e.slice(o))?e.slice(o).length:1,l=r.slice(a);return l[0]!=="/"&&(l="/"+l),Sr(l,"")}return Sr(n,e)+s+r}function bc(e,t,n,s){let r=[],o=[],a=null;const l=({state:h})=>{const g=Zo(e,location),P=n.value,S=t.value;let F=0;if(h){if(n.value=g,t.value=h,a&&a===P){a=null;return}F=S?h.position-S.position:0}else s(g);r.forEach(j=>{j(n.value,P,{delta:F,type:vs.pop,direction:F?F>0?rs.forward:rs.back:rs.unknown})})};function i(){a=n.value}function f(h){r.push(h);const g=()=>{const P=r.indexOf(h);P>-1&&r.splice(P,1)};return o.push(g),g}function d(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(z({},h.state,{scroll:Vn()}),"")}}function p(){for(const h of o)h();o=[],window.removeEventListener("popstate",l),window.removeEventListener("pagehide",d),document.removeEventListener("visibilitychange",d)}return window.addEventListener("popstate",l),window.addEventListener("pagehide",d),document.addEventListener("visibilitychange",d),{pauseListeners:i,listen:f,destroy:p}}function Pr(e,t,n,s=!1,r=!1){return{back:e,current:t,forward:n,replaced:s,position:window.history.length,scroll:r?Vn():null}}function vc(e){const{history:t,location:n}=window,s={value:Zo(e,n)},r={value:t.state};r.value||o(s.value,{back:null,current:s.value,forward:null,position:t.length-1,replaced:!0,scroll:null},!0);function o(i,f,d){const p=e.indexOf("#"),h=p>-1?(n.host&&document.querySelector("base")?e:e.slice(p))+i:gc()+e+i;try{t[d?"replaceState":"pushState"](f,"",h),r.value=f}catch(g){console.error(g),n[d?"replace":"assign"](h)}}function a(i,f){o(i,z({},t.state,Pr(r.value.back,i,r.value.forward,!0),f,{position:r.value.position}),!0),s.value=i}function l(i,f){const d=z({},r.value,t.state,{forward:i,scroll:Vn()});o(d.current,d,!0),o(i,z({},Pr(s.value,i,null),{position:d.position+1},f),!1),s.value=i}return{location:s,state:r,push:l,replace:a}}function _c(e){e=nc(e);const t=vc(e),n=bc(e,t.state,t.location,t.replace);function s(o,a=!0){a||n.pauseListeners(),history.go(o)}const r=z({location:"",base:e,go:s,createHref:rc.bind(null,e)},t,n);return Object.defineProperty(r,"location",{enumerable:!0,get:()=>t.location.value}),Object.defineProperty(r,"state",{enumerable:!0,get:()=>t.state.value}),r}function yc(e){return e=location.host?e||location.pathname+location.search:"",e.includes("#")||(e+="#"),_c(e)}let bt=(function(e){return e[e.Static=0]="Static",e[e.Param=1]="Param",e[e.Group=2]="Group",e})({});var re=(function(e){return e[e.Static=0]="Static",e[e.Param=1]="Param",e[e.ParamRegExp=2]="ParamRegExp",e[e.ParamRegExpEnd=3]="ParamRegExpEnd",e[e.EscapeNext=4]="EscapeNext",e})(re||{});const xc={type:bt.Static,value:""},wc=/[a-zA-Z0-9_]/;function Ac(e){if(!e)return[[]];if(e==="/")return[[xc]];if(!e.startsWith("/"))throw new Error(`Invalid path "${e}"`);function t(g){throw new Error(`ERR (${n})/"${f}": ${g}`)}let n=re.Static,s=n;const r=[];let o;function a(){o&&r.push(o),o=[]}let l=0,i,f="",d="";function p(){f&&(n===re.Static?o.push({type:bt.Static,value:f}):n===re.Param||n===re.ParamRegExp||n===re.ParamRegExpEnd?(o.length>1&&(i==="*"||i==="+")&&t(`A repeatable param (${f}) must be alone in its segment. eg: '/:ids+.`),o.push({type:bt.Param,value:f,regexp:d,repeatable:i==="*"||i==="+",optional:i==="*"||i==="?"})):t("Invalid state to consume buffer"),f="")}function h(){f+=i}for(;l<e.length;){if(i=e[l++],i==="\\"&&n!==re.ParamRegExp){s=n,n=re.EscapeNext;continue}switch(n){case re.Static:i==="/"?(f&&p(),a()):i===":"?(p(),n=re.Param):h();break;case re.EscapeNext:h(),n=s;break;case re.Param:i==="("?n=re.ParamRegExp:wc.test(i)?h():(p(),n=re.Static,i!=="*"&&i!=="?"&&i!=="+"&&l--);break;case re.ParamRegExp:i===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+i:n=re.ParamRegExpEnd:d+=i;break;case re.ParamRegExpEnd:p(),n=re.Static,i!=="*"&&i!=="?"&&i!=="+"&&l--,d="";break;default:t("Unknown state");break}}return n===re.ParamRegExp&&t(`Unfinished custom RegExp for param "${f}"`),p(),a(),r}const Hr="[^/]+?",Ec={sensitive:!1,strict:!1,start:!0,end:!0};var he=(function(e){return e[e._multiplier=10]="_multiplier",e[e.Root=90]="Root",e[e.Segment=40]="Segment",e[e.SubSegment=30]="SubSegment",e[e.Static=40]="Static",e[e.Dynamic=20]="Dynamic",e[e.BonusCustomRegExp=10]="BonusCustomRegExp",e[e.BonusWildcard=-50]="BonusWildcard",e[e.BonusRepeatable=-20]="BonusRepeatable",e[e.BonusOptional=-8]="BonusOptional",e[e.BonusStrict=.7000000000000001]="BonusStrict",e[e.BonusCaseSensitive=.25]="BonusCaseSensitive",e})(he||{});const Sc=/[.+*?^${}()[\]/\\]/g;function Cc(e,t){const n=z({},Ec,t),s=[];let r=n.start?"^":"";const o=[];for(const f of e){const d=f.length?[]:[he.Root];n.strict&&!f.length&&(r+="/");for(let p=0;p<f.length;p++){const h=f[p];let g=he.Segment+(n.sensitive?he.BonusCaseSensitive:0);if(h.type===bt.Static)p||(r+="/"),r+=h.value.replace(Sc,"\\$&"),g+=he.Static;else if(h.type===bt.Param){const{value:P,repeatable:S,optional:F,regexp:j}=h;o.push({name:P,repeatable:S,optional:F});const T=j||Hr;if(T!==Hr){g+=he.BonusCustomRegExp;try{`${T}`}catch(H){throw new Error(`Invalid custom RegExp for param "${P}" (${T}): `+H.message)}}let O=S?`((?:${T})(?:/(?:${T}))*)`:`(${T})`;p||(O=F&&f.length<2?`(?:/${O})`:"/"+O),F&&(O+="?"),r+=O,g+=he.Dynamic,F&&(g+=he.BonusOptional),S&&(g+=he.BonusRepeatable),T===".*"&&(g+=he.BonusWildcard)}d.push(g)}s.push(d)}if(n.strict&&n.end){const f=s.length-1;s[f][s[f].length-1]+=he.BonusStrict}n.strict||(r+="/?"),n.end?r+="$":n.strict&&!r.endsWith("/")&&(r+="(?:/|$)");const a=new RegExp(r,n.sensitive?"":"i");function l(f){const d=f.match(a),p={};if(!d)return null;for(let h=1;h<d.length;h++){const g=d[h]||"",P=o[h-1];p[P.name]=g&&P.repeatable?g.split("/"):g}return p}function i(f){let d="",p=!1;for(const h of e){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const g of h)if(g.type===bt.Static)d+=g.value;else if(g.type===bt.Param){const{value:P,repeatable:S,optional:F}=g,j=P in f?f[P]:"";if(Re(j)&&!S)throw new Error(`Provided param "${P}" is an array but it is not repeatable (* or + modifiers)`);const T=Re(j)?j.join("/"):j;if(!T)if(F)h.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${P}"`);d+=T}}return d||"/"}return{re:a,score:s,keys:o,parse:l,stringify:i}}function kc(e,t){let n=0;for(;n<e.length&&n<t.length;){const s=t[n]-e[n];if(s)return s;n++}return e.length<t.length?e.length===1&&e[0]===he.Static+he.Segment?-1:1:e.length>t.length?t.length===1&&t[0]===he.Static+he.Segment?1:-1:0}function ea(e,t){let n=0;const s=e.score,r=t.score;for(;n<s.length&&n<r.length;){const o=kc(s[n],r[n]);if(o)return o;n++}if(Math.abs(r.length-s.length)===1){if(Or(s))return 1;if(Or(r))return-1}return r.length-s.length}function Or(e){const t=e[e.length-1];return e.length>0&&t[t.length-1]<0}const Tc={strict:!1,end:!0,sensitive:!1};function Rc(e,t,n){const s=Cc(Ac(e.path),n),r=z(s,{record:e,parent:t,children:[],alias:[]});return t&&!r.record.aliasOf==!t.record.aliasOf&&t.children.push(r),r}function Pc(e,t){const n=[],s=new Map;t=Er(Tc,t);function r(p){return s.get(p)}function o(p,h,g){const P=!g,S=Dr(p);S.aliasOf=g&&g.record;const F=Er(t,p),j=[S];if("alias"in p){const H=typeof p.alias=="string"?[p.alias]:p.alias;for(const Y of H)j.push(Dr(z({},S,{components:g?g.record.components:S.components,path:Y,aliasOf:g?g.record:S})))}let T,O;for(const H of j){const{path:Y}=H;if(h&&Y[0]!=="/"){const ie=h.record.path,te=ie[ie.length-1]==="/"?"":"/";H.path=h.record.path+(Y&&te+Y)}if(T=Rc(H,h,F),g?g.alias.push(T):(O=O||T,O!==T&&O.alias.push(T),P&&p.name&&!Lr(T)&&a(p.name)),ta(T)&&i(T),S.children){const ie=S.children;for(let te=0;te<ie.length;te++)o(ie[te],T,g&&g.children[te])}g=g||T}return O?()=>{a(O)}:Qt}function a(p){if(Qo(p)){const h=s.get(p);h&&(s.delete(p),n.splice(n.indexOf(h),1),h.children.forEach(a),h.alias.forEach(a))}else{const h=n.indexOf(p);h>-1&&(n.splice(h,1),p.record.name&&s.delete(p.record.name),p.children.forEach(a),p.alias.forEach(a))}}function l(){return n}function i(p){const h=Ic(p,n);n.splice(h,0,p),p.record.name&&!Lr(p)&&s.set(p.record.name,p)}function f(p,h){let g,P={},S,F;if("name"in p&&p.name){if(g=s.get(p.name),!g)throw Dt(ne.MATCHER_NOT_FOUND,{location:p});F=g.record.name,P=z(Ir(h.params,g.keys.filter(O=>!O.optional).concat(g.parent?g.parent.keys.filter(O=>O.optional):[]).map(O=>O.name)),p.params&&Ir(p.params,g.keys.map(O=>O.name))),S=g.stringify(P)}else if(p.path!=null)S=p.path,g=n.find(O=>O.re.test(S)),g&&(P=g.parse(S),F=g.record.name);else{if(g=h.name?s.get(h.name):n.find(O=>O.re.test(h.path)),!g)throw Dt(ne.MATCHER_NOT_FOUND,{location:p,currentLocation:h});F=g.record.name,P=z({},h.params,p.params),S=g.stringify(P)}const j=[];let T=g;for(;T;)j.unshift(T.record),T=T.parent;return{name:F,path:S,params:P,matched:j,meta:Oc(j)}}e.forEach(p=>o(p));function d(){n.length=0,s.clear()}return{addRoute:o,resolve:f,removeRoute:a,clearRoutes:d,getRoutes:l,getRecordMatcher:r}}function Ir(e,t){const n={};for(const s of t)s in e&&(n[s]=e[s]);return n}function Dr(e){const t={path:e.path,redirect:e.redirect,name:e.name,meta:e.meta||{},aliasOf:e.aliasOf,beforeEnter:e.beforeEnter,props:Hc(e),children:e.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in e?e.components||null:e.component&&{default:e.component}};return Object.defineProperty(t,"mods",{value:{}}),t}function Hc(e){const t={},n=e.props||!1;if("component"in e)t.default=n;else for(const s in e.components)t[s]=typeof n=="object"?n[s]:n;return t}function Lr(e){for(;e;){if(e.record.aliasOf)return!0;e=e.parent}return!1}function Oc(e){return e.reduce((t,n)=>z(t,n.meta),{})}function Ic(e,t){let n=0,s=t.length;for(;n!==s;){const o=n+s>>1;ea(e,t[o])<0?s=o:n=o+1}const r=Dc(e);return r&&(s=t.lastIndexOf(r,s-1)),s}function Dc(e){let t=e;for(;t=t.parent;)if(ta(t)&&ea(e,t)===0)return t}function ta({record:e}){return!!(e.name||e.components&&Object.keys(e.components).length||e.redirect)}function jr(e){const t=Te(zn),n=Te(Gs),s=xe(()=>{const i=Ue(e.to);return t.resolve(i)}),r=xe(()=>{const{matched:i}=s.value,{length:f}=i,d=i[f-1],p=n.matched;if(!d||!p.length)return-1;const h=p.findIndex(It.bind(null,d));if(h>-1)return h;const g=Nr(i[f-2]);return f>1&&Nr(d)===g&&p[p.length-1].path!==g?p.findIndex(It.bind(null,i[f-2])):h}),o=xe(()=>r.value>-1&&Mc(n.params,s.value.params)),a=xe(()=>r.value>-1&&r.value===n.matched.length-1&&Jo(n.params,s.value.params));function l(i={}){if(Fc(i)){const f=t[Ue(e.replace)?"replace":"push"](Ue(e.to)).catch(Qt);return e.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>f),f}return Promise.resolve()}return{route:s,href:xe(()=>s.value.href),isActive:o,isExactActive:a,navigate:l}}function Lc(e){return e.length===1?e[0]:e}const jc=go({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:jr,setup(e,{slots:t}){const n=In(jr(e)),{options:s}=Te(zn),r=xe(()=>({[Fr(e.activeClass,s.linkActiveClass,"router-link-active")]:n.isActive,[Fr(e.exactActiveClass,s.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const o=t.default&&Lc(t.default(n));return e.custom?o:Bo("a",{"aria-current":n.isExactActive?e.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:r.value},o)}}}),Nc=jc;function Fc(e){if(!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)&&!e.defaultPrevented&&!(e.button!==void 0&&e.button!==0)){if(e.currentTarget&&e.currentTarget.getAttribute){const t=e.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(t))return}return e.preventDefault&&e.preventDefault(),!0}}function Mc(e,t){for(const n in t){const s=t[n],r=e[n];if(typeof s=="string"){if(s!==r)return!1}else if(!Re(r)||r.length!==s.length||s.some((o,a)=>o.valueOf()!==r[a].valueOf()))return!1}return!0}function Nr(e){return e?e.aliasOf?e.aliasOf.path:e.path:""}const Fr=(e,t,n)=>e??t??n,qc=go({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(e,{attrs:t,slots:n}){const s=Te(ys),r=xe(()=>e.route||s.value),o=Te(Rr,0),a=xe(()=>{let f=Ue(o);const{matched:d}=r.value;let p;for(;(p=d[f])&&!p.components;)f++;return f}),l=xe(()=>r.value.matched[a.value]);mn(Rr,xe(()=>a.value+1)),mn(mc,l),mn(ys,r);const i=Ls();return hn(()=>[i.value,l.value,e.name],([f,d,p],[h,g,P])=>{d&&(d.instances[p]=f,g&&g!==d&&f&&f===h&&(d.leaveGuards.size||(d.leaveGuards=g.leaveGuards),d.updateGuards.size||(d.updateGuards=g.updateGuards))),f&&d&&(!g||!It(d,g)||!h)&&(d.enterCallbacks[p]||[]).forEach(S=>S(f))},{flush:"post"}),()=>{const f=r.value,d=e.name,p=l.value,h=p&&p.components[d];if(!h)return Mr(n.default,{Component:h,route:f});const g=p.props[d],P=g?g===!0?f.params:typeof g=="function"?g(f):g:null,F=Bo(h,z({},P,t,{onVnodeUnmounted:j=>{j.component.isUnmounted&&(p.instances[d]=null)},ref:i}));return Mr(n.default,{Component:F,route:f})||F}}});function Mr(e,t){if(!e)return null;const n=e(t);return n.length===1?n[0]:n}const Bc=qc;function Gc(e){const t=Pc(e.routes,e),n=e.parseQuery||fc,s=e.stringifyQuery||Tr,r=e.history,o=qt(),a=qt(),l=qt(),i=za(at);let f=at;St&&e.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=ns.bind(null,_=>""+_),p=ns.bind(null,Yl),h=ns.bind(null,rn);function g(_,R){let C,I;return Qo(_)?(C=t.getRecordMatcher(_),I=R):I=_,t.addRoute(I,C)}function P(_){const R=t.getRecordMatcher(_);R&&t.removeRoute(R)}function S(){return t.getRoutes().map(_=>_.record)}function F(_){return!!t.getRecordMatcher(_)}function j(_,R){if(R=z({},R||i.value),typeof _=="string"){const m=ss(n,_,R.path),b=t.resolve({path:m.path},R),y=r.createHref(m.fullPath);return z(m,b,{params:h(b.params),hash:rn(m.hash),redirectedFrom:void 0,href:y})}let C;if(_.path!=null)C=z({},_,{path:ss(n,_.path,R.path).path});else{const m=z({},_.params);for(const b in m)m[b]==null&&delete m[b];C=z({},_,{params:p(m)}),R.params=p(R.params)}const I=t.resolve(C,R),G=_.hash||"";I.params=d(h(I.params));const c=Xl(s,z({},_,{hash:Wl(G),path:I.path})),u=r.createHref(c);return z({fullPath:c,hash:G,query:s===Tr?pc(_.query):_.query||{}},I,{redirectedFrom:void 0,href:u})}function T(_){return typeof _=="string"?ss(n,_,i.value.path):z({},_)}function O(_,R){if(f!==_)return Dt(ne.NAVIGATION_CANCELLED,{from:R,to:_})}function H(_){return te(_)}function Y(_){return H(z(T(_),{replace:!0}))}function ie(_,R){const C=_.matched[_.matched.length-1];if(C&&C.redirect){const{redirect:I}=C;let G=typeof I=="function"?I(_,R):I;return typeof G=="string"&&(G=G.includes("?")||G.includes("#")?G=T(G):{path:G},G.params={}),z({query:_.query,hash:_.hash,params:G.path!=null?{}:_.params},G)}}function te(_,R){const C=f=j(_),I=i.value,G=_.state,c=_.force,u=_.replace===!0,m=ie(C,I);if(m)return te(z(T(m),{state:typeof m=="object"?z({},G,m.state):G,force:c,replace:u}),R||C);const b=C;b.redirectedFrom=R;let y;return!c&&Zl(s,I,C)&&(y=Dt(ne.NAVIGATION_DUPLICATED,{to:b,from:I}),Ie(I,I,!0,!1)),(y?Promise.resolve(y):He(b,I)).catch(v=>Ke(v)?Ke(v,ne.NAVIGATION_GUARD_REDIRECT)?v:ot(v):V(v,b,I)).then(v=>{if(v){if(Ke(v,ne.NAVIGATION_GUARD_REDIRECT))return te(z({replace:u},T(v.to),{state:typeof v.to=="object"?z({},G,v.to.state):G,force:c}),R||b)}else v=ft(b,I,!0,u,G);return rt(b,I,v),v})}function Pe(_,R){const C=O(_,R);return C?Promise.reject(C):Promise.resolve()}function st(_){const R=wt.values().next().value;return R&&typeof R.runWithContext=="function"?R.runWithContext(_):_()}function He(_,R){let C;const[I,G,c]=hc(_,R);C=os(I.reverse(),"beforeRouteLeave",_,R);for(const m of I)m.leaveGuards.forEach(b=>{C.push(ct(b,_,R))});const u=Pe.bind(null,_,R);return C.push(u),Se(C).then(()=>{C=[];for(const m of o.list())C.push(ct(m,_,R));return C.push(u),Se(C)}).then(()=>{C=os(G,"beforeRouteUpdate",_,R);for(const m of G)m.updateGuards.forEach(b=>{C.push(ct(b,_,R))});return C.push(u),Se(C)}).then(()=>{C=[];for(const m of c)if(m.beforeEnter)if(Re(m.beforeEnter))for(const b of m.beforeEnter)C.push(ct(b,_,R));else C.push(ct(m.beforeEnter,_,R));return C.push(u),Se(C)}).then(()=>(_.matched.forEach(m=>m.enterCallbacks={}),C=os(c,"beforeRouteEnter",_,R,st),C.push(u),Se(C))).then(()=>{C=[];for(const m of a.list())C.push(ct(m,_,R));return C.push(u),Se(C)}).catch(m=>Ke(m,ne.NAVIGATION_CANCELLED)?m:Promise.reject(m))}function rt(_,R,C){l.list().forEach(I=>st(()=>I(_,R,C)))}function ft(_,R,C,I,G){const c=O(_,R);if(c)return c;const u=R===at,m=St?history.state:{};C&&(I||u?r.replace(_.fullPath,z({scroll:u&&m&&m.scroll},G)):r.push(_.fullPath,G)),i.value=_,Ie(_,R,C,u),ot()}let Oe;function Lt(){Oe||(Oe=r.listen((_,R,C)=>{if(!pt.listening)return;const I=j(_),G=ie(I,pt.currentRoute.value);if(G){te(z(G,{replace:!0,force:!0}),I).catch(Qt);return}f=I;const c=i.value;St&&ic(kr(c.fullPath,C.delta),Vn()),He(I,c).catch(u=>Ke(u,ne.NAVIGATION_ABORTED|ne.NAVIGATION_CANCELLED)?u:Ke(u,ne.NAVIGATION_GUARD_REDIRECT)?(te(z(T(u.to),{force:!0}),I).then(m=>{Ke(m,ne.NAVIGATION_ABORTED|ne.NAVIGATION_DUPLICATED)&&!C.delta&&C.type===vs.pop&&r.go(-1,!1)}).catch(Qt),Promise.reject()):(C.delta&&r.go(-C.delta,!1),V(u,I,c))).then(u=>{u=u||ft(I,c,!1),u&&(C.delta&&!Ke(u,ne.NAVIGATION_CANCELLED)?r.go(-C.delta,!1):C.type===vs.pop&&Ke(u,ne.NAVIGATION_ABORTED|ne.NAVIGATION_DUPLICATED)&&r.go(-1,!1)),rt(I,c,u)}).catch(Qt)}))}let yt=qt(),oe=qt(),$;function V(_,R,C){ot(_);const I=oe.list();return I.length?I.forEach(G=>G(_,R,C)):console.error(_),Promise.reject(_)}function ze(){return $&&i.value!==at?Promise.resolve():new Promise((_,R)=>{yt.add([_,R])})}function ot(_){return $||($=!_,Lt(),yt.list().forEach(([R,C])=>_?C(_):R()),yt.reset()),_}function Ie(_,R,C,I){const{scrollBehavior:G}=e;if(!St||!G)return Promise.resolve();const c=!C&&lc(kr(_.fullPath,0))||(I||!C)&&history.state&&history.state.scroll||null;return Ln().then(()=>G(_,R,c)).then(u=>u&&ac(u)).catch(u=>V(u,_,R))}const ve=_=>r.go(_);let xt;const wt=new Set,pt={currentRoute:i,listening:!0,addRoute:g,removeRoute:P,clearRoutes:t.clearRoutes,hasRoute:F,getRoutes:S,resolve:j,options:e,push:H,replace:Y,go:ve,back:()=>ve(-1),forward:()=>ve(1),beforeEach:o.add,beforeResolve:a.add,afterEach:l.add,onError:oe.add,isReady:ze,install(_){_.component("RouterLink",Nc),_.component("RouterView",Bc),_.config.globalProperties.$router=pt,Object.defineProperty(_.config.globalProperties,"$route",{enumerable:!0,get:()=>Ue(i)}),St&&!xt&&i.value===at&&(xt=!0,H(r.location).catch(I=>{}));const R={};for(const I in at)Object.defineProperty(R,I,{get:()=>i.value[I],enumerable:!0});_.provide(zn,pt),_.provide(Gs,oo(R)),_.provide(ys,i);const C=_.unmount;wt.add(_),_.unmount=function(){wt.delete(_),wt.size<1&&(f=at,Oe&&Oe(),Oe=null,i.value=at,xt=!1,$=!1),C()}}};function Se(_){return _.reduce((R,C)=>R.then(()=>st(C)),Promise.resolve())}return pt}function na(){return Te(zn)}function Uc(e){return Te(Gs)}const Vc={id:"spa-shell",class:"landing-body",tabindex:"0"},zc={class:"navbar navbar-expand-lg doc-navbar fixed-top"},Wc={class:"container-xxl px-3"},Kc=["data-bs-target","aria-controls"],$c=["src"],Yc={class:"collapse navbar-collapse",id:"appNavCollapse"},Jc={class:"navbar-nav ms-auto align-items-lg-center gap-lg-2"},Qc={class:"nav-item"},Xc={class:"nav-item"},Zc={class:"nav-item"},ed={__name:"App",setup(e){const n=Uc(),s=xe(()=>n.name==="doc"||n.name==="internals"),r=xe(()=>n.name==="internals"?"#tocOffcanvasInternals":"#tocOffcanvasDoc"),o=xe(()=>n.name==="internals"?"tocOffcanvasInternals":"tocOffcanvasDoc"),a=l=>n.name===l;return(l,i)=>{const f=tr("router-link"),d=tr("router-view");return Bn(),Gn("div",Vc,[B("nav",zc,[B("div",Wc,[ti(B("button",{type:"button",class:"btn btn-outline-secondary btn-sm me-2 flex-shrink-0",id:"appTocBtn","data-bs-toggle":"offcanvas","data-bs-target":r.value,"aria-controls":o.value},[...i[0]||(i[0]=[B("i",{class:"bi bi-list-ul","aria-hidden":"true"},null,-1),B("span",{class:"d-none d-sm-inline ms-1","data-i18n":"nav.contents"},"Contents",-1)])],8,Kc),[[hl,s.value]]),ue(f,{class:"navbar-brand fw-semibold d-flex align-items-center gap-2 text-decoration-none",id:"appBrandHome",to:"/"},{default:Bt(()=>[B("img",{src:`${Ue("./")}img/icon.png`,alt:"",width:"32",height:"32",class:"doc-brand-icon rounded-1",decoding:"async"},null,8,$c),i[1]||(i[1]=Fo(" Hub Énergie ",-1))]),_:1}),i[6]||(i[6]=B("button",{class:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#appNavCollapse","aria-controls":"appNavCollapse","aria-expanded":"false","aria-label":"Menu"},[B("span",{class:"navbar-toggler-icon"})],-1)),B("div",Yc,[B("ul",Jc,[B("li",Qc,[ue(f,{class:kt(["nav-link",{active:a("home")}]),to:"/",end:""},{default:Bt(()=>[...i[2]||(i[2]=[B("span",{"data-i18n":"nav.home"},"Home",-1)])]),_:1},8,["class"])]),B("li",Xc,[ue(f,{class:kt(["nav-link",{active:a("doc")}]),to:"/doc"},{default:Bt(()=>[...i[3]||(i[3]=[B("span",{"data-i18n":"nav.documentation"},"Documentation",-1)])]),_:1},8,["class"])]),B("li",Zc,[ue(f,{class:kt(["nav-link",{active:a("internals")}]),to:"/internals"},{default:Bt(()=>[...i[4]||(i[4]=[B("span",{"data-i18n":"nav.internals_short"},"Behind the scenes",-1)])]),_:1},8,["class"])])]),i[5]||(i[5]=B("div",{class:"d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0 flex-wrap justify-content-lg-end"},[B("div",{class:"btn-group btn-group-sm",role:"group",id:"langSwitch","data-i18n-aria":"nav.lang_aria","aria-label":"Language"},[B("button",{type:"button",class:"btn btn-outline-secondary px-2","data-lang":"en",id:"langEn","aria-pressed":"true"},[B("span",{"data-i18n":"lang.en"},"EN")]),B("button",{type:"button",class:"btn btn-outline-secondary px-2","data-lang":"fr",id:"langFr","aria-pressed":"false"},[B("span",{"data-i18n":"lang.fr"},"FR")])]),B("div",{class:"btn-group btn-group-sm",role:"group",id:"themeSwitch","data-i18n-aria":"theme.group_aria","aria-label":"Display theme"},[B("button",{type:"button",class:"btn btn-outline-secondary px-2",id:"themeLight","aria-pressed":"false","data-i18n-title":"theme.light",title:"Light"},[B("i",{class:"bi bi-sun-fill","aria-hidden":"true"}),B("span",{class:"d-none d-md-inline ms-1","data-i18n":"theme.light"},"Light")]),B("button",{type:"button",class:"btn btn-outline-secondary px-2",id:"themeDark","aria-pressed":"false","data-i18n-title":"theme.dark",title:"Dark"},[B("i",{class:"bi bi-moon-stars-fill","aria-hidden":"true"}),B("span",{class:"d-none d-md-inline ms-1","data-i18n":"theme.dark"},"Dark")])]),B("a",{class:"btn btn-outline-secondary btn-sm rounded-pill px-3",href:"https://gitlab.com/zzcyph1/home-assistant/hub-energie",target:"_blank",rel:"noopener noreferrer"},[B("i",{class:"bi bi-gitlab me-1","aria-hidden":"true"}),B("span",{"data-i18n":"nav.repository"},"Repository")])],-1))])])]),ue(d)])}}},td=`<div\r
      class="offcanvas offcanvas-start"\r
      tabindex="-1"\r
      id="tocOffcanvasDoc"\r
      aria-labelledby="tocOffcanvasDocLabel"\r
    >\r
      <div class="offcanvas-header border-bottom">\r
        <h2 class="offcanvas-title h5 mb-0" id="tocOffcanvasDocLabel" data-i18n="toc.on_this_page">\r
          On this page\r
        </h2>\r
        <button\r
          type="button"\r
          class="btn-close"\r
          data-bs-dismiss="offcanvas"\r
          data-i18n-aria="nav.close_aria"\r
          aria-label="Close"\r
        ></button>\r
      </div>\r
      <div class="offcanvas-body">\r
        <nav\r
          id="toc-nav-doc-mobile"\r
          class="nav nav-pills flex-column gap-1"\r
          data-i18n-aria="nav.toc_aria"\r
          aria-label="Page"\r
        >\r
          <a class="nav-link" href="#/" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="nav.home">Home</span></a\r
          >\r
          <a class="nav-link" href="#/internals" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="nav.internals">How it works behind the scenes</span></a\r
          >\r
          <hr class="border-secondary my-2 opacity-25" />\r
          <a class="nav-link" href="#overview" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.overview">Overview</span></a\r
          >\r
          <a class="nav-link" href="#ssot" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.ssot">Data &amp; SSOT</span></a\r
          >\r
          <a class="nav-link" href="#install" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.install">Install</span></a\r
          >\r
          <a class="nav-link" href="#lovelace" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.lovelace">Lovelace card</span></a\r
          >\r
          <a class="nav-link small py-1 ps-3" href="#lovelace-showcase" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.lovelace_showcase">Card preview</span></a\r
          >\r
          <a class="nav-link small py-1 ps-3" href="#lovelace-editor" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.lovelace_editor">Visual editor</span></a\r
          >\r
          <a class="nav-link" href="#configure" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.configure">Configure in HA</span></a\r
          >\r
          <a class="nav-link" href="#devices" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.devices">Devices</span></a\r
          >\r
          <a class="nav-link small py-1 ps-3" href="#devices-integration" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.devices_integration">Integration device list</span></a\r
          >\r
          <a class="nav-link small py-1 ps-3" href="#devices-gallery" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.devices_gallery">In Home Assistant</span></a\r
          >\r
          <a class="nav-link" href="#services" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.services">Services</span></a\r
          >\r
          <a class="nav-link" href="#limitations" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.limitations">Limitations</span></a\r
          >\r
          <a class="nav-link" href="#glossary" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.glossary">Glossary</span></a\r
          >\r
        </nav>\r
      </div>\r
    </div>\r
\r
    <header class="doc-hero pt-5 mt-5" id="top">\r
      <div class="container-xxl px-3 py-5">\r
        <div class="row g-4 align-items-center">\r
          <div class="col-lg-8">\r
            <p class="text-uppercase small fw-semibold text-primary mb-2 tracking-wide" data-i18n="hero.kicker">\r
              Home Assistant · Custom integration\r
            </p>\r
            <h1 class="display-6 fw-bold mb-3" data-i18n="hero.title">Energy monitoring, costs &amp; diagnostics</h1>\r
            <p class="lead text-secondary mb-3 mb-lg-0" data-i18n-html="hero.lead_html">\r
              Configure suppliers and tariffs, track kWh and daily cost, optional solar estimation and\r
              multi-battery support — with a Lovelace card served from\r
              <code class="font-mono small">/hub_energie/</code>.\r
            </p>\r
            <div class="mt-4">\r
              <a\r
                href="#/internals"\r
                class="btn btn-outline-primary btn-lg rounded-pill px-4 doc-internals-cta shadow-sm"\r
              >\r
                <i class="bi bi-diagram-3 me-2" aria-hidden="true"></i><span data-i18n="doc.hero_internals_cta"\r
                  >How it works behind the scenes</span\r
                >\r
              </a>\r
              <p class="small text-secondary mt-2 mb-0" data-i18n="doc.hero_internals_hint">\r
                Slot attribution, per-day buckets, Store, and long-term statistics — for readers who want the full\r
                pipeline.\r
              </p>\r
            </div>\r
          </div>\r
          <div class="col-lg-4">\r
            <div class="card border shadow-sm">\r
              <div class="card-body">\r
                <h2 class="h6 text-secondary text-uppercase small mb-3" data-i18n="glance.title">At a glance</h2>\r
                <ul class="list-unstyled mb-0 small vstack gap-2">\r
                  <li class="d-flex align-items-start gap-2">\r
                    <i class="bi bi-check-circle-fill text-success mt-1"></i>\r
                    <span data-i18n-html="glance.ha"><strong class="text-body">HA</strong> 2024.10.0 or newer</span>\r
                  </li>\r
                  <li class="d-flex align-items-start gap-2">\r
                    <i class="bi bi-tag-fill text-primary mt-1"></i>\r
                    <span data-i18n-html="glance.snapshot"\r
                      >Doc snapshot <span class="badge bg-primary badge-doc">v0.2.3</span></span\r
                    >\r
                  </li>\r
                  <li class="d-flex align-items-start gap-2">\r
                    <i class="bi bi-bug-fill text-warning mt-1"></i>\r
                    <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/issues" data-i18n="glance.issues"\r
                      >Issues &amp; feedback</a\r
                    >\r
                  </li>\r
                </ul>\r
              </div>\r
            </div>\r
          </div>\r
        </div>\r
      </div>\r
    </header>\r
\r
    <div class="container-xxl px-3 py-4 py-lg-5">\r
      <div class="row g-4 g-xl-5">\r
        <aside class="col-lg-3 d-none d-lg-block">\r
          <div class="doc-sidebar">\r
            <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="toc.on_this_page">\r
              On this page\r
            </div>\r
            <nav id="toc-nav-doc" class="nav nav-pills flex-column gap-1" role="navigation" data-i18n-aria="nav.toc_aria" aria-label="Page">\r
              <a class="nav-link" href="#overview"><span data-i18n="toc.overview">Overview</span></a>\r
              <a class="nav-link" href="#ssot"><span data-i18n="toc.ssot">Data &amp; SSOT</span></a>\r
              <a class="nav-link" href="#install"><span data-i18n="toc.install">Install</span></a>\r
              <a class="nav-link" href="#lovelace"><span data-i18n="toc.lovelace">Lovelace card</span></a>\r
              <a class="nav-link small py-1 ps-3" href="#lovelace-showcase"\r
                ><span data-i18n="toc.lovelace_showcase">Card preview</span></a\r
              >\r
              <a class="nav-link small py-1 ps-3" href="#lovelace-editor"\r
                ><span data-i18n="toc.lovelace_editor">Visual editor</span></a\r
              >\r
              <a class="nav-link" href="#configure"><span data-i18n="toc.configure">Configure in HA</span></a>\r
              <a class="nav-link" href="#devices"><span data-i18n="toc.devices">Devices</span></a>\r
              <a class="nav-link small py-1 ps-3" href="#devices-integration"\r
                ><span data-i18n="toc.devices_integration">Integration device list</span></a\r
              >\r
              <a class="nav-link small py-1 ps-3" href="#devices-gallery"\r
                ><span data-i18n="toc.devices_gallery">In Home Assistant</span></a\r
              >\r
              <a class="nav-link" href="#services"><span data-i18n="toc.services">Services</span></a>\r
              <a class="nav-link" href="#limitations"><span data-i18n="toc.limitations">Limitations</span></a>\r
              <a class="nav-link" href="#glossary"><span data-i18n="toc.glossary">Glossary</span></a>\r
            </nav>\r
          </div>\r
        </aside>\r
\r
        <main class="col-lg-9">\r
          <section id="overview" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="overview.title">Overview</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#overview"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary" data-i18n="overview.intro">\r
              This page is a guided companion to the README. Use the steps below in order when setting up for\r
              the first time.\r
            </p>\r
\r
            <div class="accordion accordion-flush border rounded-3 overflow-hidden mb-4" id="accScope">\r
              <div class="accordion-item border-0 border-bottom">\r
                <h3 class="accordion-header">\r
                  <button\r
                    class="accordion-button fw-semibold"\r
                    type="button"\r
                    data-bs-toggle="collapse"\r
                    data-bs-target="#scopeStable"\r
                  >\r
                    <i class="bi bi-shield-check text-success me-2"></i>\r
                    <span data-i18n="scope.stable_heading">Intended stable scope (v0.2.x)</span>\r
                  </button>\r
                </h3>\r
                <div id="scopeStable" class="accordion-collapse collapse show" data-bs-parent="#accScope">\r
                  <div class="accordion-body text-secondary small">\r
                    <ul class="mb-0">\r
                      <li data-i18n-html="scope.stable_li1_html">\r
                        <strong class="text-body">Config flow:</strong> supplier (EDF vs custom), tariff (flat,\r
                        HP–HC, multi-slot, EDF Tempo + RTE/API/sensor), grid and optional solar/battery wiring.\r
                      </li>\r
                      <li data-i18n-html="scope.stable_li2_html">\r
                        <strong class="text-body">Energy:</strong> positive deltas from\r
                        <code class="font-mono">total_increasing</code> meters → slot-day accounting (Paris day)\r
                        and SSOT total sensors owned by the integration.\r
                      </li>\r
                      <li data-i18n-html="scope.stable_li3_html">\r
                        <strong class="text-body">Costs:</strong> daily estimate (€), subscription split,\r
                        per-slot detail in attributes.\r
                      </li>\r
                      <li data-i18n-html="scope.stable_li4_html">\r
                        <strong class="text-body">EDF Tempo:</strong> colours, quotas, next-change times.\r
                      </li>\r
                      <li data-i18n-html="scope.stable_li5_html">\r
                        <strong class="text-body">Diagnostics:</strong> réinjection split, data quality, delta\r
                        telemetry, unknown bucket, staleness;\r
                        <strong class="text-body">health</strong> sensor\r
                        (<code class="font-mono">ok</code> / <code class="font-mono">degraded</code> /\r
                        <code class="font-mono">rebuilding</code> / <code class="font-mono">inconsistent</code>\r
                        / <code class="font-mono">no_input</code>) with a readable cause.\r
                      </li>\r
                      <li data-i18n-html="scope.stable_li6_html">Optional clear-sky PV and solar resale when configured.</li>\r
                      <li data-i18n-html="scope.stable_li7_html">\r
                        Lovelace: pre-built bundles in <code class="font-mono">frontend/dist/</code> are\r
                        versioned in the repo; Home Assistant serves them at <code class="font-mono">/hub_energie/</code>.\r
                      </li>\r
                    </ul>\r
                  </div>\r
                </div>\r
              </div>\r
              <div class="accordion-item border-0">\r
                <h3 class="accordion-header">\r
                  <button\r
                    class="accordion-button collapsed fw-semibold"\r
                    type="button"\r
                    data-bs-toggle="collapse"\r
                    data-bs-target="#scopeExp"\r
                  >\r
                    <i class="bi bi-flask text-warning me-2"></i>\r
                    <span data-i18n="scope.exp_heading">Experimental / best-effort</span>\r
                  </button>\r
                </h3>\r
                <div id="scopeExp" class="accordion-collapse collapse" data-bs-parent="#accScope">\r
                  <div class="accordion-body text-secondary small">\r
                    <ul class="mb-0">\r
                      <li data-i18n="scope.exp_li1">Power-flow battery charge origin split when sensors are partial or noisy.</li>\r
                      <li data-i18n="scope.exp_li2">Solar production estimation (model-based, not a physical meter).</li>\r
                      <li data-i18n="scope.exp_li3">Opportunity-cost style diagnostics for exported kWh.</li>\r
                    </ul>\r
                  </div>\r
                </div>\r
              </div>\r
            </div>\r
\r
            <div class="alert alert-info d-flex gap-2 small mb-0" role="status">\r
              <i class="bi bi-info-circle flex-shrink-0"></i>\r
              <div data-i18n-html="scope.disclaimer_html">\r
                Behaviour depends on your hardware and entity choices (especially the Energy dashboard). The\r
                lists above describe intent, not a warranty for every edge case.\r
              </div>\r
            </div>\r
          </section>\r
\r
          <section id="ssot" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="ssot.title">Data sources (SSOT)</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#ssot"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary" data-i18n="ssot.intro">\r
              Knowing what is authoritative avoids misconfiguring the Energy panel or the wrong attributes.\r
            </p>\r
            <ol class="doc-steps">\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">1</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="ssot.s1_title">Physical meters (external SSOT)</div>\r
                    <p class="small text-secondary mb-0" data-i18n-html="ssot.s1_html">\r
                      The energy entities you select (<code class="font-mono">grid_import_energy</code>, solar,\r
                      export, per-battery in/out). <strong class="text-body">Recorder history</strong> is ground\r
                      truth for total kWh from hardware or upstream integrations.\r
                    </p>\r
                  </div>\r
                </div>\r
              </li>\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">2</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="ssot.s2_title">Internal accounting</div>\r
                    <p class="small text-secondary mb-0" data-i18n-html="ssot.s2_html">\r
                      The coordinator accumulates <strong class="text-body">positive deltas</strong> into totals\r
                      and per-day slot kWh. Integration\r
                      <code class="font-mono">total_increasing</code> SSOT sensors reflect this\r
                      <strong class="text-body">internal sum</strong>, not a full re-read of the meter every\r
                      cycle.\r
                    </p>\r
                  </div>\r
                </div>\r
              </li>\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">3</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="ssot.s3_title">Long-term per-slot kWh (daily)</div>\r
                    <p class="small text-secondary mb-0" data-i18n-html="ssot.s3_html">\r
                      After each Paris day, external statistics\r
                      <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> are\r
                      written. Use these (or physical meters) for historical analytics — not raw\r
                      <code class="font-mono">cost_detail</code> attribute history alone.\r
                    </p>\r
                  </div>\r
                </div>\r
              </li>\r
            </ol>\r
          </section>\r
\r
          <section id="install" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="install.title">Installation</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#install"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary" data-i18n-html="install.intro_html">\r
              Install the repository <strong class="text-body">exactly</strong> as one package under your HA\r
              config:\r
            </p>\r
            <pre class="doc-code"><code>&lt;config&gt;/custom_components/hub_energie/</code></pre>\r
            <p class="text-secondary small" data-i18n-html="install.note_html">\r
              Home Assistant must load\r
              <code class="font-mono">custom_components/hub_energie/manifest.json</code>. Avoid a nested folder\r
              such as <code class="font-mono">hub_energie/hub_energie/</code>.\r
            </p>\r
\r
            <h3 class="h5 mt-4 mb-3">\r
              <i class="bi bi-download text-primary me-2"></i><span data-i18n="install.choose_path">Choose your path</span>\r
            </h3>\r
            <ul class="nav nav-tabs mb-3" role="tablist">\r
              <li class="nav-item" role="presentation">\r
                <button\r
                  class="nav-link active"\r
                  id="tab-git"\r
                  data-bs-toggle="tab"\r
                  data-bs-target="#pane-git"\r
                  type="button"\r
                  role="tab"\r
                >\r
                  <span data-i18n="tab.git">Git clone</span>\r
                </button>\r
              </li>\r
              <li class="nav-item" role="presentation">\r
                <button\r
                  class="nav-link"\r
                  id="tab-copy"\r
                  data-bs-toggle="tab"\r
                  data-bs-target="#pane-copy"\r
                  type="button"\r
                  role="tab"\r
                >\r
                  <span data-i18n="tab.copy">Copy files</span>\r
                </button>\r
              </li>\r
              <li class="nav-item" role="presentation">\r
                <button\r
                  class="nav-link"\r
                  id="tab-hacs"\r
                  data-bs-toggle="tab"\r
                  data-bs-target="#pane-hacs"\r
                  type="button"\r
                  role="tab"\r
                >\r
                  <span data-i18n="tab.hacs_tba">HACS (TBA)</span>\r
                </button>\r
              </li>\r
            </ul>\r
            <div class="tab-content">\r
              <div class="tab-pane fade" id="pane-hacs" role="tabpanel">\r
                <div class="alert alert-secondary mb-0" role="status">\r
                  <h3 class="h6 alert-heading d-flex align-items-center gap-2 mb-2">\r
                    <i class="bi bi-hourglass-split" aria-hidden="true"></i>\r
                    <span data-i18n="install.hacs_tba_heading">HACS default store (TBA)</span>\r
                  </h3>\r
                  <div class="small mb-0" data-i18n-html="install.hacs_tba_html"></div>\r
                </div>\r
              </div>\r
              <div class="tab-pane fade show active" id="pane-git" role="tabpanel">\r
                <ol class="doc-steps">\r
                  <li>\r
                    <div class="doc-step-card shadow-sm">\r
                      <span class="step-badge">1</span>\r
                      <div class="step-body">\r
                        <div class="step-title" data-i18n="install.git.s1_title">Clone into the right folder</div>\r
                        <pre class="doc-code mt-2 mb-0"><code>git clone &lt;your-repo-url&gt; hub-energie-src\r
cp -a hub-energie-src/custom_components/hub_energie /path/to/homeassistant/config/custom_components/hub_energie</code></pre>\r
                      </div>\r
                    </div>\r
                  </li>\r
                  <li>\r
                    <div class="doc-step-card shadow-sm">\r
                      <span class="step-badge">2</span>\r
                      <div class="step-body">\r
                        <div class="step-title" data-i18n="install.git.s2_title">Restart &amp; add the integration</div>\r
                        <p class="small text-secondary mb-0" data-i18n-html="install.git.s2_p_html">\r
                          Same as HACS: full restart, then\r
                          <a href="#configure">Configure in HA</a>.\r
                        </p>\r
                      </div>\r
                    </div>\r
                  </li>\r
                </ol>\r
              </div>\r
              <div class="tab-pane fade" id="pane-copy" role="tabpanel">\r
                <ol class="doc-steps">\r
                  <li>\r
                    <div class="doc-step-card shadow-sm">\r
                      <span class="step-badge">1</span>\r
                      <div class="step-body">\r
                        <div class="step-title" data-i18n="install.copy.s1_title">Copy the full tree</div>\r
                        <p class="small text-secondary mb-0" data-i18n-html="install.copy.s1_html">\r
                          From this repository, copy only the\r
                          <code class="font-mono">custom_components/hub_energie/</code> tree into your Home\r
                          Assistant <code class="font-mono">config/custom_components/hub_energie/</code> — all\r
                          subfolders (<code class="font-mono">battery/</code>,\r
                          <code class="font-mono">energy/</code>, <code class="font-mono">frontend/</code>,\r
                          etc.). Do not copy the repo root into HA.\r
                        </p>\r
                      </div>\r
                    </div>\r
                  </li>\r
                  <li>\r
                    <div class="doc-step-card shadow-sm">\r
                      <span class="step-badge">2</span>\r
                      <div class="step-body">\r
                        <div class="step-title" data-i18n="install.copy.s2_title">Restart &amp; add the integration</div>\r
                        <p class="small text-secondary mb-0" data-i18n-html="install.copy.s2_p_html">\r
                          Full restart, then <a href="#configure">Configure in HA</a>.\r
                        </p>\r
                      </div>\r
                    </div>\r
                  </li>\r
                </ol>\r
              </div>\r
            </div>\r
\r
            <div class="card border-warning border-opacity-50 mt-4">\r
              <div class="card-body">\r
                <h3 class="h6 card-title d-flex align-items-center gap-2 mb-2">\r
                  <i class="bi bi-puzzle text-warning"></i>\r
                  <span data-i18n="install.lovelace_title">If you use the Lovelace card</span>\r
                </h3>\r
                <p class="card-text small text-secondary mb-3" data-i18n-html="install.lovelace_body_html">\r
                  The card bundles under <code class="font-mono">frontend/dist/</code> are committed to this\r
                  repository (rebuilt in CI on each commit). You do <strong class="text-body">not</strong> need\r
                  <code class="font-mono">npm</code> on your Home Assistant host for a normal install—restart HA\r
                  after updating the integration. For reproducible installs, match a Git tag to\r
                  <code class="font-mono">manifest.json</code> → <code class="font-mono">version</code> (e.g.\r
                  <strong class="text-body">v0.2.3</strong>).\r
                </p>\r
                <p class="card-text small text-muted mb-0" data-i18n-html="install.lovelace_dev_html">\r
                  <strong class="text-body">Developers:</strong> to rebuild locally, from\r
                  <code class="font-mono">custom_components/hub_energie/frontend/</code> run\r
                  <code class="font-mono">npm ci</code> then <code class="font-mono">npm run build</code>.\r
                </p>\r
              </div>\r
            </div>\r
          </section>\r
\r
          <section id="lovelace" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="lovelace.title">Lovelace card</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#lovelace"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary" data-i18n-html="lovelace.intro_html">\r
              Built assets (<code class="font-mono">hub-energie-card-boot.js</code>,\r
              <code class="font-mono">hub-energie-card.js</code>, and chunks under\r
              <code class="font-mono">frontend/dist/</code>) are shipped in the repo and refreshed by CI each\r
              commit. Home Assistant serves the <code class="font-mono">dist</code> tree at\r
              <strong class="text-body"><code class="font-mono">/hub_energie/</code></strong>.\r
            </p>\r
\r
            <ol class="doc-steps">\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">1</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="lovelace.l1_title">Storage-mode dashboards (default)</div>\r
                    <p class="small text-secondary mb-0" data-i18n-html="lovelace.l1_html">\r
                      On startup the integration adds\r
                      <code class="font-mono">/hub_energie/hub-energie-card-boot.js</code> as a\r
                      <strong class="text-body">JavaScript module</strong> (same as\r
                      <em>Settings → Dashboards → Resources</em>). Usually nothing to do manually.\r
                    </p>\r
                  </div>\r
                </div>\r
              </li>\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">2</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="lovelace.l2_title">YAML-managed resources</div>\r
                    <p class="small text-secondary mb-2" data-i18n="lovelace.l2_p">Add the boot URL yourself:</p>\r
                    <pre class="doc-code"><code>resources:\r
  - url: /hub_energie/hub-energie-card-boot.js\r
    type: module</code></pre>\r
                    <p class="small text-secondary mb-0" data-i18n-html="lovelace.l2_note_html">\r
                      Replace legacy URLs such as\r
                      <code class="font-mono">/hub_energie/dist/hub-energie-card.js</code> with the boot URL. Do\r
                      not register duplicate modules for the same card.\r
                    </p>\r
                  </div>\r
                </div>\r
              </li>\r
              <li>\r
                <div class="doc-step-card shadow-sm">\r
                  <span class="step-badge">3</span>\r
                  <div class="step-body">\r
                    <div class="step-title" data-i18n="lovelace.l3_title">Add the card</div>\r
                    <pre class="doc-code mb-0"><code>type: custom:hub-energie-card\r
# Optional: hide sections via card config</code></pre>\r
                  </div>\r
                </div>\r
              </li>\r
            </ol>\r
\r
            <h3 class="h5 mt-4 mb-2 doc-subsection" id="lovelace-showcase">\r
              <span data-i18n="lovelace.showcase_title">Dashboard card</span>\r
            </h3>\r
            <figure class="doc-figure doc-figure--photo card mt-2">\r
              <div class="doc-screenshot-frame doc-screenshot-frame--full position-relative bg-body-secondary">\r
                <img\r
                  src="img/hub-energie-card.png"\r
                  alt=""\r
                  class="doc-carousel-img doc-zoomable"\r
                  width="1920"\r
                  height="1080"\r
                  decoding="async"\r
                  data-i18n-alt="lovelace.fig_alt"\r
                />\r
                <div\r
                  class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                >\r
                  <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                  <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                  <code class="font-mono small mt-1">public/img/hub-energie-card.png</code>\r
                </div>\r
              </div>\r
              <figcaption class="card-body py-2 px-3 small text-secondary mb-0" data-i18n-html="lovelace.fig_cap_html"></figcaption>\r
            </figure>\r
\r
            <h3 class="h5 mt-4 mb-2 doc-subsection" id="lovelace-editor">\r
              <span data-i18n="lovelace.editor_title">Visual editor</span>\r
            </h3>\r
            <p class="text-secondary small" data-i18n-html="lovelace.editor_intro_html"></p>\r
            <figure class="doc-figure doc-figure--photo card mt-3">\r
              <div class="doc-screenshot-frame doc-screenshot-frame--full position-relative bg-body-secondary">\r
                <img\r
                  src="img/lovelace-editor-01.png"\r
                  alt=""\r
                  class="doc-carousel-img doc-zoomable"\r
                  decoding="async"\r
                  data-i18n-alt="lovelace.ed1_alt"\r
                />\r
                <div\r
                  class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                >\r
                  <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                  <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                  <code class="font-mono small mt-1">public/img/lovelace-editor-01.png</code>\r
                </div>\r
              </div>\r
              <figcaption class="card-body py-2 px-3 small text-secondary mb-0" data-i18n-html="lovelace.editor_fig_cap_html"></figcaption>\r
            </figure>\r
          </section>\r
\r
          <section id="configure" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="configure.title">Configure in Home Assistant</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#configure"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary mb-3" data-i18n-html="configure.flow_lead_html"></p>\r
            <div class="card border mb-4 shadow-sm">\r
              <div class="card-body">\r
                <h3 class="h6 card-title" data-i18n="configure.flow_map_title">How the config flow branches</h3>\r
                <div class="small text-secondary" data-i18n-html="configure.flow_map_html"></div>\r
              </div>\r
            </div>\r
            <p class="text-secondary small mb-2" data-i18n-html="configure.flow_example_path_html"></p>\r
            <div class="row g-3">\r
              <div class="col-lg-3">\r
                <div class="doc-carousel-tree border rounded-3 p-2 sticky-lg-top">\r
                  <div class="small text-secondary text-uppercase fw-semibold mb-2" data-i18n="configure.flow_carousel_tree">\r
                    Example path\r
                  </div>\r
                  <nav class="nav flex-column gap-1" id="configFlowTree" aria-label="Config flow">\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump active"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="0"\r
                    >\r
                      <span class="badge bg-primary me-1">1</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_1_t">User</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_1_d"\r
                        >Supplier &amp; phase</span\r
                      >\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="1"\r
                    >\r
                      <span class="badge bg-primary me-1">2</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_2_t">Tariff mode</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_2_d"\r
                        >Automatic vs manual</span\r
                      >\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="2"\r
                    >\r
                      <span class="badge bg-primary me-1">3</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_3_t">Contract</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_3_d"\r
                        >Subscribed power &amp; name</span\r
                      >\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="3"\r
                    >\r
                      <span class="badge bg-primary me-1">4</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_4_t">EDF offer</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_4_d"\r
                        >BASE, HPHC, or TEMPO</span\r
                      >\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="4"\r
                    >\r
                      <span class="badge bg-primary me-1">5</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_5_t">Tempo source</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_5_d"\r
                        >RTE vs API Couleur Tempo</span\r
                      >\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#configFlowCarousel"\r
                      data-doc-slide-to="5"\r
                    >\r
                      <span class="badge bg-primary me-1">6</span\r
                      ><span class="fw-semibold" data-i18n="configure.flow_ex_6_t">RTE credentials</span>\r
                      <span class="small text-secondary d-block ps-1 mt-1" data-i18n="configure.flow_ex_6_d"\r
                        >If you chose RTE</span\r
                      >\r
                    </button>\r
                  </nav>\r
                </div>\r
              </div>\r
              <div class="col-lg-9">\r
                <div\r
                  id="configFlowCarousel"\r
                  class="carousel slide carousel-dark doc-doc-carousel card shadow-sm"\r
                  data-bs-ride="false"\r
                  data-i18n-aria="carousel.aria_config"\r
                  aria-label="Config flow"\r
                >\r
                  <div class="carousel-inner">\r
                    <div class="carousel-item active">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-01-user.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_1_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-01-user.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_1_t">User</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_1_d">Supplier &amp; phase</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-02-tariff-mode.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_2_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-02-tariff-mode.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_2_t">Tariff mode</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_2_d">Automatic vs manual</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-03-contract.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_3_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-03-contract.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_3_t">Contract</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_3_d">Subscribed power &amp; name</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-04-edf-offer.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_4_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-04-edf-offer.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_4_t">EDF offer</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_4_d">BASE, HPHC, or TEMPO</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-05-tempo-source.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_5_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-05-tempo-source.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_5_t">Tempo source</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_5_d">RTE vs API Couleur Tempo</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/config-flow-edf-06-rte-credentials.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="configure.flow_ex_6_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/config-flow-edf-06-rte-credentials.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="configure.flow_ex_6_t">RTE credentials</div>\r
                        <div class="small text-secondary" data-i18n="configure.flow_ex_6_d">If you chose RTE</div>\r
                      </div>\r
                    </div>\r
                  </div>\r
                  <button\r
                    class="carousel-control-prev"\r
                    type="button"\r
                    data-bs-target="#configFlowCarousel"\r
                    data-bs-slide="prev"\r
                  >\r
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>\r
                    <span class="visually-hidden" data-i18n="carousel.prev">Previous</span>\r
                  </button>\r
                  <button\r
                    class="carousel-control-next"\r
                    type="button"\r
                    data-bs-target="#configFlowCarousel"\r
                    data-bs-slide="next"\r
                  >\r
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>\r
                    <span class="visually-hidden" data-i18n="carousel.next">Next</span>\r
                  </button>\r
                </div>\r
                <p class="small text-secondary mt-2 mb-0" data-i18n-html="configure.flow_after_rte_html"></p>\r
              </div>\r
            </div>\r
          </section>\r
\r
          <section id="devices" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="devices.title">Device model</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#devices"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <p class="text-secondary small" data-i18n-html="devices.intro">\r
              One Home Assistant device per logical scope. Entity placement follows measured or configured\r
              domains; see <code class="font-mono">CHANGELOG.md</code> for finer detail.\r
            </p>\r
\r
            <h3 class="h5 mt-3 mb-2 doc-subsection" id="devices-integration">\r
              <span data-i18n="devices.integration_title">Integration device list</span>\r
            </h3>\r
            <figure class="doc-figure doc-figure--photo card mb-4">\r
              <div class="doc-screenshot-frame doc-screenshot-frame--full position-relative bg-body-secondary">\r
                <img\r
                  src="img/integration-devices-overview.png"\r
                  alt=""\r
                  class="doc-carousel-img doc-zoomable"\r
                  decoding="async"\r
                  data-i18n-alt="devices.integration_alt"\r
                />\r
                <div\r
                  class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                >\r
                  <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                  <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                  <code class="font-mono small mt-1">public/img/integration-devices-overview.png</code>\r
                </div>\r
              </div>\r
              <figcaption class="card-body py-2 px-3 small text-secondary mb-0" data-i18n-html="devices.integration_cap_html"></figcaption>\r
            </figure>\r
\r
            <div class="table-responsive rounded-3 border">\r
              <table class="table table-doc table-striped table-hover mb-0">\r
                <thead>\r
                  <tr>\r
                    <th scope="col" data-i18n="devices.th_device">Device</th>\r
                    <th scope="col" data-i18n="devices.th_purpose">Purpose</th>\r
                  </tr>\r
                </thead>\r
                <tbody class="table-group-divider">\r
                  <tr>\r
                    <td><strong>Offre</strong></td>\r
                    <td data-i18n="devices.p_offre">Tariff, supplier, contract</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Réseau</strong></td>\r
                    <td data-i18n="devices.p_reseau">Grid energy / power sensors</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Solaire</strong></td>\r
                    <td data-i18n="devices.p_solaire">Solar measurement / estimation</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Batterie &lt;name&gt;</strong></td>\r
                    <td data-i18n="devices.p_batt">Per-battery system (0..N)</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Batteries (total)</strong></td>\r
                    <td data-i18n="devices.p_battsum">Aggregated battery summary</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Bilan énergétique</strong></td>\r
                    <td data-i18n="devices.p_bilan">Computed energy flows (kWh)</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Coûts</strong></td>\r
                    <td data-i18n="devices.p_couts">Monetary values (€)</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong>Diagnostics</strong></td>\r
                    <td data-i18n="devices.p_diag">Health, reinjection diagnostics</td>\r
                  </tr>\r
                </tbody>\r
              </table>\r
            </div>\r
\r
            <h3 class="h5 mt-4 mb-2 doc-subsection" id="devices-gallery">\r
              <span data-i18n="devices.gallery_title">Devices in Home Assistant</span>\r
            </h3>\r
            <p class="text-secondary small" data-i18n-html="devices.gallery_intro_html"></p>\r
            <p class="small text-secondary mb-2" data-i18n-html="devices.gallery_multishot_html"></p>\r
            <div class="row g-3">\r
              <div class="col-lg-3">\r
                <div class="doc-carousel-tree border rounded-3 p-2 sticky-lg-top">\r
                  <div class="small text-secondary text-uppercase fw-semibold mb-2" data-i18n="devices.tree_label">\r
                    Devices\r
                  </div>\r
                  <nav class="nav flex-column gap-1" id="devicesGalleryTree" aria-label="Devices">\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump active"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="0"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g1_t">Offre</span>\r
                      <span class="small text-secondary" data-i18n="devices.g1_d">Tariff &amp; contract</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="1"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g2_t">Réseau</span>\r
                      <span class="small text-secondary" data-i18n="devices.g2_d">Grid sensors</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="2"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g3_t">Solaire</span>\r
                      <span class="small text-secondary" data-i18n="devices.g3_d">Solar stack</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="3"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g4_t">Batterie</span>\r
                      <span class="small text-secondary" data-i18n="devices.g4_d">Per-battery device</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="4"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g5_t">Batteries (total)</span>\r
                      <span class="small text-secondary" data-i18n="devices.g5_d">Aggregated</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="5"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g6_t">Bilan énergétique</span>\r
                      <span class="small text-secondary" data-i18n="devices.g6_d">Energy flows</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="6"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g7_t">Coûts</span>\r
                      <span class="small text-secondary" data-i18n="devices.g7_d">Cost entities</span>\r
                    </button>\r
                    <button\r
                      type="button"\r
                      class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"\r
                      data-doc-carousel="#devicesGalleryCarousel"\r
                      data-doc-slide-to="7"\r
                    >\r
                      <span class="fw-semibold d-block" data-i18n="devices.g8_t">Diagnostics</span>\r
                      <span class="small text-secondary" data-i18n="devices.g8_d">Health &amp; quality</span>\r
                    </button>\r
                  </nav>\r
                </div>\r
              </div>\r
              <div class="col-lg-9">\r
                <div\r
                  id="devicesGalleryCarousel"\r
                  class="carousel slide carousel-dark doc-doc-carousel card shadow-sm"\r
                  data-bs-ride="false"\r
                  data-i18n-aria="carousel.aria_devices"\r
                  aria-label="Devices"\r
                >\r
                  <div class="carousel-inner">\r
                    <div class="carousel-item active">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-01-offre.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g1_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-01-offre.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g1_t">Offre</div>\r
                        <div class="small text-secondary" data-i18n="devices.g1_d">Tariff &amp; contract</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-02-reseau.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g2_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-02-reseau.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g2_t">Réseau</div>\r
                        <div class="small text-secondary" data-i18n="devices.g2_d">Grid sensors</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-03-solaire.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g3_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-03-solaire.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g3_t">Solaire</div>\r
                        <div class="small text-secondary" data-i18n="devices.g3_d">Solar stack</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-04-batterie.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g4_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-04-batterie.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g4_t">Batterie</div>\r
                        <div class="small text-secondary" data-i18n="devices.g4_d">Per-battery device</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-05-batteries-total.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g5_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-05-batteries-total.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g5_t">Batteries (total)</div>\r
                        <div class="small text-secondary" data-i18n="devices.g5_d">Aggregated</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-06-bilan.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g6_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-06-bilan.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g6_t">Bilan énergétique</div>\r
                        <div class="small text-secondary" data-i18n="devices.g6_d">Energy flows</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-07-couts.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g7_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-07-couts.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g7_t">Coûts</div>\r
                        <div class="small text-secondary" data-i18n="devices.g7_d">Cost entities</div>\r
                      </div>\r
                    </div>\r
                    <div class="carousel-item">\r
                      <div class="doc-screenshot-frame doc-screenshot-frame--carousel position-relative bg-body-secondary">\r
                        <img\r
                          src="img/device-ui-08-diagnostics.png"\r
                          alt=""\r
                          class="doc-carousel-img doc-zoomable"\r
                          decoding="async"\r
                          data-i18n-alt="devices.g8_alt"\r
                        />\r
                        <div\r
                          class="doc-carousel-fallback d-none align-items-center justify-content-center flex-column text-secondary small text-center p-3 w-100 h-100 position-absolute top-0 start-0"\r
                        >\r
                          <i class="bi bi-image fs-2 mb-2 opacity-50" aria-hidden="true"></i>\r
                          <span data-i18n="common.img_placeholder">Add screenshot to</span>\r
                          <code class="font-mono small mt-1">public/img/device-ui-08-diagnostics.png</code>\r
                        </div>\r
                      </div>\r
                      <div class="border-top bg-body p-3">\r
                        <div class="fw-semibold" data-i18n="devices.g8_t">Diagnostics</div>\r
                        <div class="small text-secondary" data-i18n="devices.g8_d">Health &amp; quality</div>\r
                      </div>\r
                    </div>\r
                  </div>\r
                  <button\r
                    class="carousel-control-prev"\r
                    type="button"\r
                    data-bs-target="#devicesGalleryCarousel"\r
                    data-bs-slide="prev"\r
                  >\r
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>\r
                    <span class="visually-hidden" data-i18n="carousel.prev">Previous</span>\r
                  </button>\r
                  <button\r
                    class="carousel-control-next"\r
                    type="button"\r
                    data-bs-target="#devicesGalleryCarousel"\r
                    data-bs-slide="next"\r
                  >\r
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>\r
                    <span class="visually-hidden" data-i18n="carousel.next">Next</span>\r
                  </button>\r
                </div>\r
              </div>\r
            </div>\r
          </section>\r
\r
          <section id="services" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="services.title">Services</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#services"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <div class="table-responsive rounded-3 border">\r
              <table class="table table-doc table-striped mb-0">\r
                <thead>\r
                  <tr>\r
                    <th scope="col" data-i18n="services.th_service">Service</th>\r
                    <th scope="col" data-i18n="services.th_desc">Description</th>\r
                  </tr>\r
                </thead>\r
                <tbody class="table-group-divider">\r
                  <tr>\r
                    <td><code class="font-mono">hub_energie.refresh</code></td>\r
                    <td data-i18n="services.r1">Force coordinator refresh</td>\r
                  </tr>\r
                  <tr>\r
                    <td><code class="font-mono">hub_energie.refresh_tariffs</code></td>\r
                    <td data-i18n="services.r2">Re-fetch EDF tariffs (auto mode)</td>\r
                  </tr>\r
                </tbody>\r
              </table>\r
            </div>\r
          </section>\r
\r
          <section id="limitations" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="limitations.title">Limitations</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#limitations"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <ul class="text-secondary">\r
              <li data-i18n="limitations.li1">Recorder retention limits history, charts, and rebuild-from-recorder paths.</li>\r
              <li data-i18n="limitations.li2">Optional solar estimation is clear-sky output — indicative, not a production meter.</li>\r
              <li data-i18n-html="limitations.li3_html">\r
                The card’s power graph needs statistics; missing <code class="font-mono">state_class</code> or\r
                history can leave it empty.\r
              </li>\r
              <li data-i18n-html="limitations.li4_html">\r
                Health states aggregate many checks; brief\r
                <code class="font-mono">rebuilding</code> after a recorder rebuild is expected.\r
              </li>\r
              <li data-i18n-html="limitations.li5_html">\r
                Deep dives: <code class="font-mono">docs/troubleshooting.md</code> in the repository (trust,\r
                unknown bucket, recovery).\r
              </li>\r
            </ul>\r
          </section>\r
\r
          <section id="glossary" class="doc-section pb-4">\r
            <h2 class="mb-3">\r
              <span data-i18n="glossary.title">Measured, reconstructed, estimated</span>\r
              <a\r
                class="doc-anchor text-secondary"\r
                href="#glossary"\r
                data-i18n-aria="section.link_aria"\r
                aria-label="Link to section"\r
                >#</a\r
              >\r
            </h2>\r
            <div class="table-responsive rounded-3 border">\r
              <table class="table table-doc table-striped mb-0">\r
                <thead>\r
                  <tr>\r
                    <th scope="col" data-i18n="glossary.th_kind">Kind</th>\r
                    <th scope="col" data-i18n="glossary.th_meaning">Meaning</th>\r
                  </tr>\r
                </thead>\r
                <tbody class="table-group-divider">\r
                  <tr>\r
                    <td><strong data-i18n="glossary.measured">Measured</strong></td>\r
                    <td data-i18n-html="glossary.measured_html">\r
                      From configured HA entities (<code class="font-mono">total_increasing</code> kWh, power\r
                      where wired).\r
                    </td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong data-i18n="glossary.recon">Reconstructed</strong></td>\r
                    <td data-i18n="glossary.recon_d">Internal totals and per-slot kWh from deltas and optional recorder replay.</td>\r
                  </tr>\r
                  <tr>\r
                    <td><strong data-i18n="glossary.est">Estimated</strong></td>\r
                    <td data-i18n="glossary.est_d">Model-based solar and other best-effort paths without a direct meter.</td>\r
                  </tr>\r
                </tbody>\r
              </table>\r
            </div>\r
          </section>\r
\r
          <footer class="border-top pt-4 mt-2 small text-secondary">\r
            <p class="mb-2" data-i18n-html="footer.p1_html">\r
              Hub Énergie — documentation snapshot <strong class="text-body">v0.2.3</strong>. Canonical detail:\r
              README and <code class="font-mono">docs/</code> in the\r
              <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab project</a>.\r
            </p>\r
            <p class="mb-0" data-i18n="footer.license">License: see the repository.</p>\r
          </footer>\r
        </main>\r
      </div>\r
    </div>\r
\r
    <div\r
      class="modal fade"\r
      id="docImageModal"\r
      tabindex="-1"\r
      data-i18n-aria="doc.modal_aria"\r
      aria-label="Full-size screenshot"\r
      aria-hidden="true"\r
    >\r
      <div class="modal-dialog modal-dialog-centered modal-xl px-2 mx-auto">\r
        <div class="modal-content shadow-lg">\r
          <div class="modal-header py-2 flex-wrap border-bottom-0">\r
            <p class="mb-0 small text-secondary flex-grow-1 text-start pe-2" data-i18n="doc.modal_hint">\r
              Full width; scroll if needed.\r
            </p>\r
            <button\r
              type="button"\r
              class="btn-close ms-auto"\r
              data-bs-dismiss="modal"\r
              data-i18n-aria="doc.modal_close_aria"\r
              aria-label="Close"\r
            ></button>\r
          </div>\r
          <div class="modal-body text-center py-2 px-2">\r
            <img id="docImageModalImg" src="" alt="" class="rounded" decoding="async" />\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
`;function nd(e){if(!e||e==="#")return null;const t=e.split("#").filter(Boolean);return t.length?t[t.length-1]:null}function sd(){document.querySelectorAll("img.doc-carousel-img").forEach(e=>{function t(){e.classList.add("d-none");const n=e.parentElement;if(!n)return;const s=n.querySelector(".doc-carousel-fallback");s&&(s.classList.remove("d-none"),s.classList.add("d-flex"))}e.complete&&e.naturalWidth===0&&t(),e.addEventListener("error",t)})}function qr(e,t){const n=document.getElementById(e),s=document.getElementById(t);if(!n||!s||typeof bootstrap>"u")return;const r=bootstrap.Carousel.getOrCreateInstance(n,{interval:!1});function o(a){s.querySelectorAll(".doc-carousel-jump").forEach(l=>{const i=parseInt(l.getAttribute("data-doc-slide-to"),10);l.classList.toggle("active",i===a)})}s.querySelectorAll(".doc-carousel-jump").forEach(a=>{a.addEventListener("click",()=>{const l=parseInt(a.getAttribute("data-doc-slide-to"),10);isNaN(l)||r.to(l)})}),n.addEventListener("slid.bs.carousel",()=>{const a=n.querySelectorAll(".carousel-item"),l=n.querySelector(".carousel-item.active"),i=Array.prototype.indexOf.call(a,l);i>=0&&o(i)}),o(0)}function rd(){const e=document.getElementById("docImageModal"),t=document.getElementById("docImageModalImg");if(!e||!t||typeof bootstrap>"u")return;const n=bootstrap.Modal.getOrCreateInstance(e);document.querySelectorAll("img.doc-zoomable").forEach(s=>{s.setAttribute("tabindex","0"),s.setAttribute("role","button");function r(){if(s.classList.contains("d-none"))return;const o=s.currentSrc||s.src;o&&(t.src=o,t.alt=s.getAttribute("alt")||"",n.show())}s.addEventListener("click",r),s.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),r())})}),e.addEventListener("hidden.bs.modal",()=>{t.removeAttribute("src"),t.alt=""})}function sa(){document.querySelectorAll('#toc-nav-doc-mobile a[href^="#"], #toc-nav-internals-mobile a[href^="#"], #toc-nav-mobile a[href^="#"]').forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("href"),n=nd(t);if(!n)return;const s=document.getElementById(n);s&&setTimeout(()=>{s.scrollIntoView({block:"start"})},280)})})}function ra(e,t,n){if(!e)return()=>{};const s=r=>{const o=r.target.closest("a");if(!o||!e.contains(o))return;const a=o.getAttribute("href");if(!a||!a.startsWith("#")||a.startsWith("#/")||a==="#")return;const l=/^#([A-Za-z0-9_-]+)$/.exec(a);if(!l)return;r.preventDefault();const i=l[1];t.push({path:n,hash:`#${i}`}).then(()=>{requestAnimationFrame(()=>{var f;(f=document.getElementById(i))==null||f.scrollIntoView({behavior:"smooth",block:"start"})})})};return e.addEventListener("click",s),()=>e.removeEventListener("click",s)}const oa="hub-energie-doc-theme",aa="hub-energie-doc-lang";let kn="en";function it(e,t){const n=globalThis.HubEnergieI18n;if(!n)return"";let r=(n[e]||n.en)[t];return r===void 0&&e!=="en"&&(r=n.en[t]),r!==void 0?r:""}function od(){if(typeof bootstrap>"u"||!bootstrap.ScrollSpy)return;const e=bootstrap.ScrollSpy.getInstance(document.body);e&&e.refresh()}function fn(e,t){e!=="en"&&e!=="fr"&&(e="en"),kn=e,document.documentElement.setAttribute("lang",e),document.querySelectorAll("[data-i18n]").forEach(l=>{const i=it(e,l.getAttribute("data-i18n"));i!==""&&(l.textContent=i)}),document.querySelectorAll("[data-i18n-html]").forEach(l=>{const i=it(e,l.getAttribute("data-i18n-html"));i!==""&&(l.innerHTML=i)}),document.querySelectorAll("[data-i18n-aria]").forEach(l=>{l.setAttribute("aria-label",it(e,l.getAttribute("data-i18n-aria")))}),document.querySelectorAll("[data-i18n-title]").forEach(l=>{const i=it(e,l.getAttribute("data-i18n-title"));i!==""&&l.setAttribute("title",i)}),document.querySelectorAll("[data-i18n-alt]").forEach(l=>{const i=it(e,l.getAttribute("data-i18n-alt"));i!==""&&l.setAttribute("alt",i)}),document.querySelectorAll("img.doc-zoomable").forEach(l=>{const i=it(e,"common.image_open_full");i!==""&&l.setAttribute("title",i)});let n="meta.title",s="meta.description";t==="landing"?(n="meta.title.landing",s="meta.description.landing"):t==="doc"?(n="meta.title",s="meta.description"):t==="internals"&&(n="meta.title.internals",s="meta.description.internals"),document.title=it(e,n);const r=document.querySelector('meta[name="description"]');r&&r.setAttribute("content",it(e,s));try{localStorage.setItem(aa,e)}catch{}const o=document.getElementById("langEn"),a=document.getElementById("langFr");o&&a&&(o.classList.toggle("active",e==="en"),a.classList.toggle("active",e==="fr"),o.setAttribute("aria-pressed",e==="en"?"true":"false"),a.setAttribute("aria-pressed",e==="fr"?"true":"false")),od()}function xs(e){e!=="light"&&e!=="dark"&&(e="dark"),document.documentElement.setAttribute("data-bs-theme",e);try{localStorage.setItem(oa,e)}catch{}const t=document.getElementById("themeLight"),n=document.getElementById("themeDark");t&&n&&(t.classList.toggle("active",e==="light"),n.classList.toggle("active",e==="dark"),t.setAttribute("aria-pressed",e==="light"?"true":"false"),n.setAttribute("aria-pressed",e==="dark"?"true":"false"))}function ad(){try{return localStorage.getItem(aa)}catch{return null}}function id(){try{return localStorage.getItem(oa)}catch{return null}}function pn(e){return e==="home"?"landing":e==="doc"?"doc":e==="internals"?"internals":"landing"}function ld(){const e=ad(),t=(navigator.language||"en").slice(0,2).toLowerCase();kn=e==="en"||e==="fr"?e:t==="fr"?"fr":"en";const s=id(),r=window.matchMedia("(prefers-color-scheme: dark)").matches;xs(s==="light"||s==="dark"?s:r?"dark":"light")}function cd(e){const t=document.getElementById("themeLight"),n=document.getElementById("themeDark");t&&t.addEventListener("click",()=>{xs("light")}),n&&n.addEventListener("click",()=>{xs("dark")});const s=document.getElementById("langEn"),r=document.getElementById("langFr");s&&s.addEventListener("click",()=>{fn("en",pn(e.currentRoute.value.name))}),r&&r.addEventListener("click",()=>{fn("fr",pn(e.currentRoute.value.name))}),e.afterEach(o=>{fn(kn,pn(o.name))}),fn(kn,pn(e.currentRoute.value.name))}function Us(e){if(e!=="doc"&&e!=="internals"){Vs();return}if(typeof bootstrap>"u"||!bootstrap.ScrollSpy)return;const t=bootstrap.ScrollSpy.getInstance(document.body);t&&t.dispose(),document.body.removeAttribute("data-bs-spy"),document.body.removeAttribute("data-bs-target"),document.body.removeAttribute("data-bs-smooth-scroll"),document.body.removeAttribute("data-bs-offset"),e==="doc"?(document.body.setAttribute("data-bs-spy","scroll"),document.body.setAttribute("data-bs-target","#toc-nav-doc"),document.body.setAttribute("data-bs-smooth-scroll","true"),document.body.setAttribute("data-bs-offset","80"),new bootstrap.ScrollSpy(document.body,{target:"#toc-nav-doc",offset:80})):e==="internals"&&(document.body.setAttribute("data-bs-spy","scroll"),document.body.setAttribute("data-bs-target","#toc-nav-internals"),document.body.setAttribute("data-bs-smooth-scroll","true"),document.body.setAttribute("data-bs-offset","80"),new bootstrap.ScrollSpy(document.body,{target:"#toc-nav-internals",offset:80}))}function Vs(){if(typeof bootstrap>"u"||!bootstrap.ScrollSpy)return;const e=bootstrap.ScrollSpy.getInstance(document.body);e&&e.dispose(),document.body.removeAttribute("data-bs-spy"),document.body.removeAttribute("data-bs-target"),document.body.removeAttribute("data-bs-smooth-scroll"),document.body.removeAttribute("data-bs-offset")}const dd={id:"view-doc",class:"app-view"},ud=["innerHTML"],fd={__name:"DocView",setup(e){const t=Ls(null),n=na();let s=()=>{};return Nn(()=>{Us("doc"),Ln(()=>{sd(),qr("configFlowCarousel","configFlowTree"),qr("devicesGalleryCarousel","devicesGalleryTree"),rd(),sa(),t.value&&(s=ra(t.value,n,"/doc"))})}),Fn(()=>{s(),Vs()}),(r,o)=>(Bn(),Gn("div",dd,[B("div",{ref_key:"root",ref:t,innerHTML:Ue(td)},null,8,ud)]))}},pd=`<header class="landing-hero position-relative overflow-hidden">
      <div class="landing-hero-glow" aria-hidden="true"></div>
      <div class="container-xxl px-3 pt-5 mt-5 pb-5 position-relative">
        <div class="row justify-content-center">
          <div class="col-xl-10 col-lg-11 text-center">
            <p class="text-uppercase small fw-semibold text-primary mb-3 tracking-wide" data-i18n="landing.kicker">
              Home Assistant · Energy intelligence
            </p>
            <h1 class="display-4 fw-bold mb-4 landing-title" data-i18n="landing.headline">
              Centralize your site’s energy story
            </h1>
            <p class="lead text-secondary mb-5 mx-auto landing-lead" style="max-width: 42rem" data-i18n-html="landing.lead_html">
              One integration ties your tariff, meters, solar, batteries, costs, and diagnostics together — so you
              configure once and read a coherent picture in Home Assistant.
            </p>
            <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-center gap-3 mb-5">
              <a
                class="btn btn-primary btn-lg rounded-pill px-5 py-3 landing-discover shadow"
                href="#/doc"
                data-i18n="landing.cta_discover"
                >Discover</a
              >
              <a
                class="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3"
                href="#/internals"
                data-i18n="landing.cta_internals"
                >How it works</a
              >
            </div>
            <p class="small text-secondary mb-0" data-i18n="landing.version_note">Documentation snapshot v0.2.3</p>
          </div>
        </div>
      </div>
    </header>

    <div class="container-xxl px-3 pb-5 landing-features">
      <div class="row g-4 g-lg-4">
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-layers-fill fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f1_title">True centralization</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f1_body">
                Offer, grid, solar, per-battery devices, energy balance, costs, and diagnostics are grouped under one
                integration instead of scattered helpers and templates.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-clock-history fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f2_title">Tariff-aware accounting</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f2_body">
                Deltas from your kWh meters are split into tariff slots (including EDF Tempo) using explicit
                resolution rules, with fallbacks and observability when signals are missing.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-graph-up-arrow fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f3_title">Costs tied to usage</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f3_body">
                Daily estimates, subscription split, and per-slot detail stay aligned with the same snapshot the
                Lovelace card consumes.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-hdd-network fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f4_title">Durable history</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f4_body">
                Internal SSOT sensors reflect running totals; completed Paris days are written to long-term
                statistics for analytics and graphs.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-grid-1x2 fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f5_title">Card included</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f5_body">
                A maintained Lovelace bundle is served from your Home Assistant host at /hub_energie/ — no separate
                frontend project to host.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border shadow-sm landing-feature-card">
            <div class="card-body">
              <div class="landing-icon-wrap text-primary mb-3">
                <i class="bi bi-heart-pulse fs-3" aria-hidden="true"></i>
              </div>
              <h2 class="h5 fw-semibold" data-i18n="landing.f6_title">Honest diagnostics</h2>
              <p class="text-secondary small mb-0" data-i18n="landing.f6_body">
                Health, data quality, delta telemetry, and trust hints help you see when inputs are partial or when
                the integration is rebuilding state.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-5 pt-4 border-top">
        <a
          class="btn btn-primary btn-lg rounded-pill px-5 py-3 landing-discover shadow-sm"
          href="#/doc"
          data-i18n="landing.cta_discover_footer"
          >Discover the documentation</a
        >
      </div>
    </div>

    <footer class="border-top py-4 mt-2 small text-secondary text-center">
      <p class="mb-0" data-i18n-html="landing.footer_html">
        Hub Énergie · <a href="#/doc">Documentation</a> ·
        <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab</a>
      </p>
    </footer>`,md={id:"view-home",class:"app-view"},hd=["innerHTML"],gd={__name:"HomeView",setup(e){return Nn(()=>{Us(null)}),(t,n)=>(Bn(),Gn("div",md,[B("div",{innerHTML:Ue(pd)},null,8,hd)]))}},bd=`<div class="offcanvas offcanvas-start" tabindex="-1" id="tocOffcanvasInternals" aria-labelledby="tocOffcanvasInternalsLabel">\r
      <div class="offcanvas-header border-bottom">\r
        <h2 class="offcanvas-title h5 mb-0" id="tocOffcanvasInternalsLabel" data-i18n="toc.internals_title">\r
          On this page\r
        </h2>\r
        <button\r
          type="button"\r
          class="btn-close"\r
          data-bs-dismiss="offcanvas"\r
          data-i18n-aria="nav.close_aria"\r
          aria-label="Close"\r
        ></button>\r
      </div>\r
      <div class="offcanvas-body">\r
        <nav\r
          id="toc-nav-internals-mobile"\r
          class="nav nav-pills flex-column gap-1"\r
          data-i18n-aria="nav.toc_aria"\r
          aria-label="Page"\r
        >\r
          <a class="nav-link" href="#/" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="nav.home">Home</span></a\r
          >\r
          <a class="nav-link" href="#/doc" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="nav.documentation">Documentation</span></a\r
          >\r
          <hr class="border-secondary my-2 opacity-25" />\r
          <a class="nav-link" href="#internals-overview" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_overview">Pipeline</span></a\r
          >\r
          <a class="nav-link" href="#internals-sources" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_sources">Energy sources</span></a\r
          >\r
          <a class="nav-link" href="#internals-slots" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_slots">Tariff slots</span></a\r
          >\r
          <a class="nav-link" href="#internals-attribution" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_attribution">Slot attribution</span></a\r
          >\r
          <a class="nav-link" href="#internals-deltas" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_deltas">Deltas & policy</span></a\r
          >\r
          <a class="nav-link" href="#internals-day" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_day">Paris day buckets</span></a\r
          >\r
          <a class="nav-link" href="#internals-store" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_store">Store file</span></a\r
          >\r
          <a class="nav-link" href="#internals-lts" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_lts">Long-term statistics</span></a\r
          >\r
          <a class="nav-link" href="#internals-rebuild" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_rebuild">Recorder rebuild</span></a\r
          >\r
          <a class="nav-link" href="#internals-telemetry" data-bs-dismiss="offcanvas"\r
            ><span data-i18n="toc.internals_telemetry">Telemetry & quality</span></a\r
          >\r
        </nav>\r
      </div>\r
    </div>\r
\r
    <header class="doc-hero pt-5 mt-5" id="internals-top">\r
      <div class="container-xxl px-3 py-4">\r
        <p class="text-uppercase small fw-semibold text-primary mb-2 tracking-wide" data-i18n="internals.kicker">\r
          Implementation notes\r
        </p>\r
        <h1 class="display-6 fw-bold mb-2" data-i18n="internals.title">How it works behind the scenes</h1>\r
        <p class="lead text-secondary mb-0" data-i18n="internals.subtitle">\r
          Business logic for categorizing energy into tariff slots, persisting running totals, and registering daily\r
          kWh in Home Assistant statistics — without replacing your physical meters as ground truth.\r
        </p>\r
      </div>\r
    </header>\r
\r
    <div class="container-xxl px-3 py-4 py-lg-5">\r
      <div class="row g-4 g-xl-5">\r
        <aside class="col-lg-3 d-none d-lg-block">\r
          <div class="doc-sidebar">\r
            <div class="small text-uppercase text-secondary fw-semibold mb-2" data-i18n="toc.internals_title">\r
              On this page\r
            </div>\r
            <nav id="toc-nav-internals" class="nav nav-pills flex-column gap-1" role="navigation" data-i18n-aria="nav.toc_aria" aria-label="Page">\r
              <a class="nav-link" href="#internals-overview"><span data-i18n="toc.internals_overview">Pipeline</span></a>\r
              <a class="nav-link" href="#internals-sources"><span data-i18n="toc.internals_sources">Energy sources</span></a>\r
              <a class="nav-link" href="#internals-slots"><span data-i18n="toc.internals_slots">Tariff slots</span></a>\r
              <a class="nav-link" href="#internals-attribution"><span data-i18n="toc.internals_attribution">Slot attribution</span></a>\r
              <a class="nav-link" href="#internals-deltas"><span data-i18n="toc.internals_deltas">Deltas & policy</span></a>\r
              <a class="nav-link" href="#internals-day"><span data-i18n="toc.internals_day">Paris day buckets</span></a>\r
              <a class="nav-link" href="#internals-store"><span data-i18n="toc.internals_store">Store file</span></a>\r
              <a class="nav-link" href="#internals-lts"><span data-i18n="toc.internals_lts">Long-term statistics</span></a>\r
              <a class="nav-link" href="#internals-rebuild"><span data-i18n="toc.internals_rebuild">Recorder rebuild</span></a>\r
              <a class="nav-link" href="#internals-telemetry"><span data-i18n="toc.internals_telemetry">Telemetry & quality</span></a>\r
            </nav>\r
            <div class="mt-4 pt-3 border-top small">\r
              <a href="#/doc" class="link-secondary" data-i18n="internals.back_to_doc">Back to documentation</a>\r
            </div>\r
          </div>\r
        </aside>\r
\r
        <main class="col-lg-9">\r
          <section id="internals-overview" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_overview_h">End-to-end pipeline</span>\r
              <a class="doc-anchor text-secondary" href="#internals-overview" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_overview_p1">\r
              At a high level: configured energy entities (total_increasing kWh) are watched by the coordinator.\r
              Each positive delta is tagged with the tariff slot active at the time of the delta (in Europe/Paris),\r
              then summed into per-source totals and into per-day / per-slot buckets. After a Paris calendar day is\r
              complete, those buckets feed Home Assistant external statistics so you get durable graphs per slot and\r
              source. A JSON Store keeps the running sums and recent day maps so restarts stay consistent.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n-html="internals.s_overview_p2_html">\r
              Physical recorder history for the entities you picked remains the external SSOT for raw meter values;\r
              integration SSOT sensors expose the <strong class="text-body">internally accumulated</strong> totals\r
              used for slot splits and cost snapshots.\r
            </p>\r
          </section>\r
\r
          <section id="internals-sources" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_sources_h">Energy sources (accumulator keys)</span>\r
              <a class="doc-anchor text-secondary" href="#internals-sources" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_sources_p1">\r
              Each configured meter maps to a source key (for example grid import, grid export, solar, per-battery\r
              charge and discharge). The set of expected keys is derived from your configuration: only sources with a\r
              bound entity participate in statistics writes. Three-phase installs can synthesize summed “virtual”\r
              entities for bookkeeping while still using your phase meters upstream.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n="internals.s_sources_p2">\r
              Because writes to long-term statistics require a complete matrix of sources for a finished day, a day is\r
              skipped if any expected source is missing from the internal day map — protecting you from silently writing\r
              partial data.\r
            </p>\r
          </section>\r
\r
          <section id="internals-slots" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_slots_h">Tariff slot grid</span>\r
              <a class="doc-anchor text-secondary" href="#internals-slots" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n-html="internals.s_slots_p1_html">\r
              EDF Tempo exposes six physical price bands encoded as slot ids:\r
              <code class="font-mono">bleu_hc</code>, <code class="font-mono">bleu_hp</code>,\r
              <code class="font-mono">blanc_hc</code>, <code class="font-mono">blanc_hp</code>,\r
              <code class="font-mono">rouge_hc</code>, <code class="font-mono">rouge_hp</code>.\r
              BASE collapses to HP-only; HP/HC uses two bands mapped onto the same naming pattern; non-EDF manual\r
              tariffs still use the HC/HP naming for compatibility while prices come from your manual tables.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n-html="internals.s_slots_p2_html">\r
              An additional attribution bucket <code class="font-mono">unknown</code> exists only in live bookkeeping\r
              when no definite slot can be resolved. Completed days written to recorder statistics use the six canonical\r
              slots; the unknown bucket is surfaced through diagnostics for transparency.\r
            </p>\r
          </section>\r
\r
          <section id="internals-attribution" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_attr_h">How a delta picks a slot</span>\r
              <a class="doc-anchor text-secondary" href="#internals-attribution" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_attr_p1">\r
              When a delta is applied, the coordinator resolves the current slot in order: primary resolver (including\r
              Tempo calendar or colour, optional user slot sensor, wall-clock off-peak rules), then “last known good”\r
              stable slot if the primary result is ambiguous, then a schedule-only fallback from frozen EDF runtime\r
              fields and Paris time. If nothing matches a canonical slot, the attribution is classified as unknown —\r
              energy is still accumulated so it is not dropped silently.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n-html="internals.s_attr_p2_html">\r
              The resolution method is recorded alongside the delta (<code class="font-mono">direct</code>,\r
              <code class="font-mono">fallback_last_known</code>, <code class="font-mono">fallback_schedule</code>,\r
              <code class="font-mono">unknown</code>) so diagnostics can explain why a given bucket grew.\r
            </p>\r
          </section>\r
\r
          <section id="internals-deltas" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_delta_h">Delta policy (noise & rollbacks)</span>\r
              <a class="doc-anchor text-secondary" href="#internals-deltas" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_delta_p1">\r
              Only forward / positive deltas are counted toward consumption totals. Small negative steps can be treated\r
              as meter jitter (re-baselining without consuming energy); larger negative changes may trigger\r
              re-anchoring or discards according to integration thresholds. Caps guard against runaway spikes when data\r
              glitches.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n="internals.s_delta_p2">\r
              Drift between the external meter reading and the internal running sum is tracked per source so the health\r
              model can report inconsistent or degraded trust states without surprising silently shifted costs.\r
            </p>\r
          </section>\r
\r
          <section id="internals-day" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_day_h">Paris day rollover</span>\r
              <a class="doc-anchor text-secondary" href="#internals-day" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_day_p1">\r
              Day boundaries follow Europe/Paris local dates — consistent with Tempo calendars and HP/HC split times.\r
              At scheduled midnight maintenance the integration finalizes yesterday’s buckets, persists them, writes\r
              recorder statistics for that ISO day, trims old accumulator rows it no longer needs, and refreshes the\r
              public snapshot.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n="internals.s_day_p2">\r
              If Home Assistant was offline across a boundary, catch-up writes can still occur after restart: the Store\r
              records which days were successfully exported so duplicate statistics inserts are avoided when possible.\r
            </p>\r
          </section>\r
\r
          <section id="internals-store" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_store_h">Store file</span>\r
              <code class="font-mono small ms-1">hub_energie.&lt;entry_id&gt;</code>\r
              <a class="doc-anchor text-secondary" href="#internals-store" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n-html="internals.s_store_p1_html">\r
              The integration persists totals per source, a map of <code class="font-mono">slot_day_kwh[day][source][slot]</code>,\r
              last raw meter readings, drift anchors, which statistic days were written, optional reinjection /\r
              battery-split diagnostics, and the last known cumulative floors used for long-term statistics metadata.\r
              Debounced saves avoid hammering disk on busy systems.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n="internals.s_store_p2">\r
              If the Store payload is corrupt or too old to trust, a guarded path can rebuild internal totals from\r
              recorder history for completed days before normal operation resumes — surfacing a rebuilding trust state\r
              in the meantime.\r
            </p>\r
          </section>\r
\r
          <section id="internals-lts" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_lts_h">Long-term statistics registration</span>\r
              <a class="doc-anchor text-secondary" href="#internals-lts" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n-html="internals.s_lts_p1_html">\r
              For each finished day and for each pair <em>(source, slot)</em> among the six canonical Tempo slots, the\r
              integration calls Home Assistant’s external statistics API with a\r
              <code class="font-mono">TOTAL_INCREASING</code> sum. Statistic ids look like\r
              <code class="font-mono">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> where the source segment\r
              is normalized for id safety. The daily increment for that id is added on top of the previous cumulative\r
              sum stored alongside the Store so the recorder sees one continuous monotonic series per series.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n="internals.s_lts_p2">\r
              Those series are the preferred basis for historical analytics that need stable per-slot kWh — lighter\r
              than mining raw template attributes, and aligned with how the Energy dashboard expects statistics.\r
            </p>\r
          </section>\r
\r
          <section id="internals-rebuild" class="doc-section pb-5">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_rebuild_h">Recorder-driven rebuild</span>\r
              <a class="doc-anchor text-secondary" href="#internals-rebuild" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_rebuild_p1">\r
              When feasible, the integration replays prior external statistic samples to recover daily slot totals and\r
              rebuild the cumulative floor map — then reconciles against current entity readings. This path exists\r
              because long-term statistic series live in the recorder database while detailed per-slot day matrices live\r
              in the Store; both need to stay aligned after restores or migrations.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n-html="internals.s_rebuild_p2_html">\r
              If the recorder is temporarily unavailable the rebuild step is skipped with a warning; operation\r
              continues, but you should consult <code class="font-mono">docs/troubleshooting.md</code> when trust /\r
              health sensors complain after major database operations.\r
            </p>\r
          </section>\r
\r
          <section id="internals-telemetry" class="doc-section pb-4">\r
            <h2 class="mb-3">\r
              <span data-i18n="internals.s_tel_h">Telemetry, unknown bucket, health</span>\r
              <a class="doc-anchor text-secondary" href="#internals-telemetry" data-i18n-aria="section.link_aria" aria-label="Link">#</a>\r
            </h2>\r
            <p class="text-secondary" data-i18n="internals.s_tel_p1">\r
              Per-source delta telemetry exposes timestamps, applied kWh, attributed slot, resolution method, gaps\r
              between applies, and drift versus the external meter. Aggregated discard counters and last-rejection\r
              payloads help trace policy decisions during support. Separate input status tracks missing or unavailable\r
              entities before energy math even runs.\r
            </p>\r
            <p class="text-secondary mb-0" data-i18n-html="internals.s_tel_p2_html">\r
              The health / trust sensor combines these signals into coarse states such as\r
              <code class="font-mono">ok</code>, <code class="font-mono">degraded</code>,\r
              <code class="font-mono">rebuilding</code>, or <code class="font-mono">inconsistent</code> with human\r
              readable causes — the same signals the Lovelace card can surface in diagnostics views.\r
            </p>\r
          </section>\r
\r
          <footer class="border-top pt-4 mt-2 small text-secondary">\r
            <p class="mb-0" data-i18n-html="internals.footer_html">\r
              For user-facing setup, return to the <a href="#/doc">main documentation</a> or the\r
              <a href="https://gitlab.com/zzcyph1/home-assistant/hub-energie">GitLab repository</a>.\r
            </p>\r
          </footer>\r
        </main>\r
      </div>\r
    </div>\r
`,vd={id:"view-internals",class:"app-view"},_d=["innerHTML"],yd={__name:"InternalsView",setup(e){const t=Ls(null),n=na();let s=()=>{};return Nn(()=>{Us("internals"),Ln(()=>{sa(),t.value&&(s=ra(t.value,n,"/internals"))})}),Fn(()=>{s(),Vs()}),(r,o)=>(Bn(),Gn("div",vd,[B("div",{ref_key:"root",ref:t,innerHTML:Ue(bd)},null,8,_d)]))}},ia=Gc({history:yc(),scrollBehavior(e,t,n){if(n)return n;if(e.hash){const s=e.hash.replace(/^#/,"");return{el:s?`#${s}`:void 0,behavior:"smooth",top:80,left:0}}return{top:0,left:0}},routes:[{path:"/",name:"home",component:gd},{path:"/doc",name:"doc",component:fd},{path:"/internals",name:"internals",component:yd}]});ld();const la=Il(ed);la.use(ia);la.mount("#app");cd(ia);
