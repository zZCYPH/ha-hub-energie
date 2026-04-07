/**
 * Hub Énergie documentation — static i18n (en / fr).
 * Loaded by public/index.html; keys are applied via data-i18n / data-i18n-html.
 */
(function (global) {
  "use strict";

  global.HubEnergieI18n = {
    en: {
      "meta.title": "Hub Énergie — Documentation",
      "meta.description":
        "Hub Énergie — Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.",

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
      "toc.devices": "Devices",
      "toc.services": "Services",
      "toc.limitations": "Limitations",
      "toc.glossary": "Glossary",
      "toc.lovelace_showcase": "Card preview",
      "toc.lovelace_editor": "Visual editor",
      "toc.devices_gallery": "In Home Assistant",

      "common.img_placeholder": "Screenshot missing — add file under",

      "carousel.prev": "Previous",
      "carousel.next": "Next",
      "carousel.aria_config": "Config flow screenshots",
      "carousel.aria_editor": "Lovelace card editor screenshots",
      "carousel.aria_devices": "Device list screenshots",

      "hero.kicker": "Home Assistant · Custom integration",
      "hero.title": "Energy monitoring, costs & diagnostics",
      "hero.lead_html":
        "Configure suppliers and tariffs, track kWh and daily cost, optional solar estimation and multi-battery support — with a Lovelace card served from <code class=\"font-mono small\">/hub_energie/</code>.",

      "glance.title": "At a glance",
      "glance.ha": "<strong class=\"text-body\">HA</strong> 2024.10.0 or newer",
      "glance.snapshot": "Doc snapshot <span class=\"badge bg-primary badge-doc\">v0.2.2</span>",
      "glance.issues": "Issues & feedback",

      "overview.title": "Overview",
      "overview.intro":
        "This page is a guided companion to the README. Use the steps below in order when setting up for the first time.",

      "scope.stable_heading": "Intended stable scope (v0.2.x)",
      "scope.stable_li1_html":
        "<strong class=\"text-body\">Config flow:</strong> supplier (EDF vs custom), tariff (flat, HP–HC, multi-slot, EDF Tempo + RTE/API/sensor), grid and optional solar/battery wiring.",
      "scope.stable_li2_html":
        "<strong class=\"text-body\">Energy:</strong> positive deltas from <code class=\"font-mono\">total_increasing</code> meters → slot-day accounting (Paris day) and SSOT total sensors owned by the integration.",
      "scope.stable_li3_html":
        "<strong class=\"text-body\">Costs:</strong> daily estimate (€), subscription split, per-slot detail in attributes.",
      "scope.stable_li4_html":
        "<strong class=\"text-body\">EDF Tempo:</strong> colours, quotas, next-change times.",
      "scope.stable_li5_html":
        "<strong class=\"text-body\">Diagnostics:</strong> réinjection split, data quality, delta telemetry, unknown bucket, staleness; <strong class=\"text-body\">health</strong> sensor (<code class=\"font-mono\">ok</code> / <code class=\"font-mono\">degraded</code> / <code class=\"font-mono\">rebuilding</code> / <code class=\"font-mono\">inconsistent</code> / <code class=\"font-mono\">no_input</code>) with a readable cause.",
      "scope.stable_li6_html": "Optional clear-sky PV and solar resale when configured.",
      "scope.stable_li7_html":
        "Lovelace: pre-built bundles in <code class=\"font-mono\">frontend/dist/</code> are versioned in the repo; Home Assistant serves them at <code class=\"font-mono\">/hub_energie/</code>.",

      "scope.exp_heading": "Experimental / best-effort",
      "scope.exp_li1": "Power-flow battery charge origin split when sensors are partial or noisy.",
      "scope.exp_li2": "Solar production estimation (model-based, not a physical meter).",
      "scope.exp_li3": "Opportunity-cost style diagnostics for exported kWh.",

      "scope.disclaimer_html":
        "Behaviour depends on your hardware and entity choices (especially the Energy dashboard). The lists above describe intent, not a warranty for every edge case.",

      "section.link_aria": "Link to section",

      "ssot.title": "Data sources (SSOT)",
      "ssot.intro":
        "Knowing what is authoritative avoids misconfiguring the Energy panel or the wrong attributes.",
      "ssot.s1_title": "Physical meters (external SSOT)",
      "ssot.s1_html":
        "The energy entities you select (<code class=\"font-mono\">grid_import_energy</code>, solar, export, per-battery in/out). <strong class=\"text-body\">Recorder history</strong> is ground truth for total kWh from hardware or upstream integrations.",
      "ssot.s2_title": "Internal accounting",
      "ssot.s2_html":
        "The coordinator accumulates <strong class=\"text-body\">positive deltas</strong> into totals and per-day slot kWh. Integration <code class=\"font-mono\">total_increasing</code> SSOT sensors reflect this <strong class=\"text-body\">internal sum</strong>, not a full re-read of the meter every cycle.",
      "ssot.s3_title": "Long-term per-slot kWh (daily)",
      "ssot.s3_html":
        "After each Paris day, external statistics <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code> are written. Use these (or physical meters) for historical analytics — not raw <code class=\"font-mono\">cost_detail</code> attribute history alone.",

      "install.title": "Installation",
      "install.intro_html":
        "Install the repository <strong class=\"text-body\">exactly</strong> as one package under your HA config:",
      "install.note_html":
        "Home Assistant must load <code class=\"font-mono\">custom_components/hub_energie/manifest.json</code>. Avoid a nested folder such as <code class=\"font-mono\">hub_energie/hub_energie/</code>.",
      "install.choose_path": "Choose your path",
      "tab.hacs_tba": "HACS (TBA)",
      "tab.git": "Git clone",
      "tab.copy": "Copy files",

      "install.hacs_tba_heading": "HACS default store — to be confirmed",
      "install.hacs_tba_html":
        "<p class=\"mb-2\">The public <strong class=\"text-body\">HACS</strong> catalogue is built around <strong class=\"text-body\">GitHub</strong>-hosted repositories (<a href=\"https://hacs.xyz/docs/publish/start/\" target=\"_blank\" rel=\"noopener noreferrer\">publishing rules</a>). This project lives on <strong class=\"text-body\">GitLab</strong>, so a frictionless “search and install” entry in the default store is <strong class=\"text-body\">not available yet</strong>.</p><p class=\"mb-0\">For now use <strong class=\"text-body\">Git clone</strong> or <strong class=\"text-body\">Copy files</strong> (tabs above). If your HACS build allows <strong class=\"text-body\">custom repositories</strong> with a GitLab URL, you can try adding the integration that way — support varies by version. After install, always perform a <strong class=\"text-body\">full restart</strong> of Home Assistant.</p>",

      "install.git.s1_title": "Clone into the right folder",
      "install.git.s2_title": "Restart & add the integration",
      "install.git.s2_p_html":
        "Full restart of Home Assistant, then <a href=\"#configure\">Configure in HA</a> (Settings → Devices &amp; services → Add integration).",

      "install.copy.s1_title": "Copy the full tree",
      "install.copy.s1_html":
        "From this repository, copy only the <code class=\"font-mono\">custom_components/hub_energie/</code> tree into your Home Assistant <code class=\"font-mono\">config/custom_components/hub_energie/</code> — all subfolders (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Do not copy the repo root (<code class=\"font-mono\">public/</code>, <code class=\"font-mono\">tests/</code>, …) into HA.",
      "install.copy.s2_title": "Restart & add the integration",
      "install.copy.s2_p_html": "Full restart, then <a href=\"#configure\">Configure in HA</a>.",

      "install.lovelace_title": "If you use the Lovelace card",
      "install.lovelace_body_html":
        "The card bundles under <code class=\"font-mono\">frontend/dist/</code> are committed to this repository (rebuilt in CI on each commit). You do <strong class=\"text-body\">not</strong> need <code class=\"font-mono\">npm</code> on your Home Assistant host for a normal install—restart HA after updating the integration. For reproducible installs, match a Git tag to <code class=\"font-mono\">manifest.json</code> → <code class=\"font-mono\">version</code> (e.g. <strong class=\"text-body\">v0.2.2</strong>).",
      "install.lovelace_dev_html":
        "<strong class=\"text-body\">Developers:</strong> to rebuild locally, from <code class=\"font-mono\">custom_components/hub_energie/frontend/</code> run <code class=\"font-mono\">npm ci</code> then <code class=\"font-mono\">npm run build</code>.",

      "lovelace.title": "Lovelace card",
      "lovelace.intro_html":
        "Built assets (<code class=\"font-mono\">hub-energie-card-boot.js</code>, <code class=\"font-mono\">hub-energie-card.js</code>, and chunks under <code class=\"font-mono\">frontend/dist/</code>) are shipped in the repo and refreshed by CI each commit. Home Assistant serves the <code class=\"font-mono\">dist</code> tree at <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>.",

      "lovelace.l1_title": "Storage-mode dashboards (default)",
      "lovelace.l1_html":
        "On startup the integration adds <code class=\"font-mono\">/hub_energie/hub-energie-card-boot.js</code> as a <strong class=\"text-body\">JavaScript module</strong> (same as <em>Settings → Dashboards → Resources</em>). Usually nothing to do manually.",

      "lovelace.l2_title": "YAML-managed resources",
      "lovelace.l2_p": "Add the boot URL yourself:",
      "lovelace.l2_note_html":
        "Replace legacy URLs such as <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> with the boot URL. Do not register duplicate modules for the same card.",

      "lovelace.l3_title": "Add the card",

      "lovelace.showcase_title": "Dashboard card",
      "lovelace.fig_alt": "Hub Énergie Lovelace card on a dashboard",
      "lovelace.fig_cap_html":
        "Example of the card in daily mode (Tempo, instant power, consumption, costs, reinjection). File: <code class=\"font-mono\">public/img/hub-energie-card.png</code>.",

      "lovelace.editor_title": "Visual editor",
      "lovelace.editor_intro_html":
        "The card exposes a rich editor (<code class=\"font-mono\">hub-energie-card-editor.js</code> in the repo) to tune section visibility, Tempo controls, date period, and optional entity overrides — without YAML.",
      "lovelace.editor_tree": "Screens",
      "lovelace.ed1_t": "Layout & options",
      "lovelace.ed1_d": "Sections, date range, Tempo and display toggles",
      "lovelace.ed2_t": "Entities",
      "lovelace.ed2_d": "Optional diagnostic / override pickers",
      "lovelace.ed1_alt": "Lovelace card editor — general options",
      "lovelace.ed2_alt": "Lovelace card editor — entity pickers",

      "configure.title": "Configure in Home Assistant",
      "configure.intro":
        "After a full restart, add the integration from the UI and walk through the config flow in this order:",

      "configure.s1_t": "Supplier",
      "configure.s1_d": "EDF or custom provider",
      "configure.s2_t": "Phase type",
      "configure.s2_d": "Single-phase or three-phase",
      "configure.s3_t": "Tariff",
      "configure.s3_d": "Auto (EDF) or manual: flat, TOU, schedule",
      "configure.s4_t": "Contract",
      "configure.s4_d": "Power (kVA), name",
      "configure.s5_t": "Grid sensors",
      "configure.s5_d": "Import energy (required), export, power",
      "configure.s6_t": "Solar",
      "configure.s6_d": "Energy, power, resale, optional PV estimation",
      "configure.s7_t": "Batteries",
      "configure.s7_d": "Per-battery in/out; optional power, SOC, capacity",

      "configure.tree_label": "Assistant steps",
      "configure.carousel_hint_html":
        "Screenshots are named <code class=\"font-mono\">config-flow-01.png</code> … <code class=\"font-mono\">07.png</code> in <code class=\"font-mono\">public/img/</code>. Use the outline on the left or the arrows to move between steps.",
      "configure.slide1_alt": "Hub Énergie config flow — step 1 supplier",
      "configure.slide2_alt": "Hub Énergie config flow — step 2 phase",
      "configure.slide3_alt": "Hub Énergie config flow — step 3 tariff",
      "configure.slide4_alt": "Hub Énergie config flow — step 4 contract",
      "configure.slide5_alt": "Hub Énergie config flow — step 5 grid sensors",
      "configure.slide6_alt": "Hub Énergie config flow — step 6 solar",
      "configure.slide7_alt": "Hub Énergie config flow — step 7 batteries",

      "devices.title": "Device model",
      "devices.intro":
        "One Home Assistant device per logical scope. Entity placement follows measured or configured domains; see <code class=\"font-mono\">CHANGELOG.md</code> for finer detail.",

      "devices.th_device": "Device",
      "devices.th_purpose": "Purpose",
      "devices.p_offre": "Tariff, supplier, contract",
      "devices.p_reseau": "Grid energy / power sensors",
      "devices.p_solaire": "Solar measurement / estimation",
      "devices.p_batt": "Per-battery system (0..N)",
      "devices.p_battsum": "Aggregated battery summary",
      "devices.p_bilan": "Computed energy flows (kWh)",
      "devices.p_couts": "Monetary values (€)",
      "devices.p_diag": "Health, reinjection diagnostics",

      "devices.gallery_title": "Devices in the UI",
      "devices.gallery_intro_html":
        "Each integration device groups related entities. Below, one slide per device so readers can see how the structure looks in <strong class=\"text-body\">Settings → Devices &amp; services</strong>.",
      "devices.gallery_multishot_html":
        "For dense devices (many entities), you can add extra PNGs later (e.g. <code class=\"font-mono\">device-ui-02-reseau-2.png</code>) — the doc can be extended with a nested carousel when those assets exist.",
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
      "devices.g8_d": "Health and reinjection diagnostics",
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
      "services.r1": "Force coordinator refresh",
      "services.r2": "Re-fetch EDF tariffs (auto mode)",

      "limitations.title": "Limitations",
      "limitations.li1": "Recorder retention limits history, charts, and rebuild-from-recorder paths.",
      "limitations.li2":
        "Optional solar estimation is clear-sky output — indicative, not a production meter.",
      "limitations.li3_html":
        "The card’s power graph needs statistics; missing <code class=\"font-mono\">state_class</code> or history can leave it empty.",
      "limitations.li4_html":
        "Health states aggregate many checks; brief <code class=\"font-mono\">rebuilding</code> after a recorder rebuild is expected.",
      "limitations.li5_html":
        "Deep dives: <code class=\"font-mono\">docs/troubleshooting.md</code> in the repository (trust, unknown bucket, recovery).",

      "glossary.title": "Measured, reconstructed, estimated",
      "glossary.th_kind": "Kind",
      "glossary.th_meaning": "Meaning",
      "glossary.measured": "Measured",
      "glossary.measured_html":
        "From configured HA entities (<code class=\"font-mono\">total_increasing</code> kWh, power where wired).",
      "glossary.recon": "Reconstructed",
      "glossary.recon_d": "Internal totals and per-slot kWh from deltas and optional recorder replay.",
      "glossary.est": "Estimated",
      "glossary.est_d": "Model-based solar and other best-effort paths without a direct meter.",

      "footer.p1_html":
        "Hub Énergie — documentation snapshot <strong class=\"text-body\">v0.2.2</strong>. Canonical detail: README and <code class=\"font-mono\">docs/</code> in the <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">GitLab project</a>.",
      "footer.license": "License: see the repository.",
    },

    fr: {
      "meta.title": "Hub Énergie — Documentation",
      "meta.description":
        "Hub Énergie — Intégration personnalisée Home Assistant pour le suivi énergétique, les coûts et le diagnostic.",

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
      "toc.devices": "Appareils",
      "toc.services": "Services",
      "toc.limitations": "Limites",
      "toc.glossary": "Glossaire",
      "toc.lovelace_showcase": "Aperçu carte",
      "toc.lovelace_editor": "Éditeur visuel",
      "toc.devices_gallery": "Dans Home Assistant",

      "common.img_placeholder": "Capture absente — ajoutez le fichier sous",

      "carousel.prev": "Précédent",
      "carousel.next": "Suivant",
      "carousel.aria_config": "Captures de l’assistant de configuration",
      "carousel.aria_editor": "Captures de l’éditeur de carte Lovelace",
      "carousel.aria_devices": "Captures des appareils",

      "hero.kicker": "Home Assistant · Intégration personnalisée",
      "hero.title": "Suivi énergétique, coûts & diagnostic",
      "hero.lead_html":
        "Configurez fournisseurs et tarifs, suivez les kWh et le coût journalier, avec estimation solaire optionnelle et multi-batteries — et une carte Lovelace servie depuis <code class=\"font-mono small\">/hub_energie/</code>.",

      "glance.title": "En bref",
      "glance.ha": "<strong class=\"text-body\">HA</strong> 2024.10.0 ou plus récent",
      "glance.snapshot": "Instantané doc <span class=\"badge bg-primary badge-doc\">v0.2.2</span>",
      "glance.issues": "Tickets & retours",

      "overview.title": "Vue d’ensemble",
      "overview.intro":
        "Cette page complète le README. Pour une première installation, suivez les étapes ci-dessous dans l’ordre.",

      "scope.stable_heading": "Périmètre stable visé (v0.2.x)",
      "scope.stable_li1_html":
        "<strong class=\"text-body\">Assistant de config :</strong> fournisseur (EDF ou personnalisé), tarif (prix unique, HP/HC, multi-creuses, Tempo EDF + RTE/API/capteur), réseau et câblage solaire/batteries optionnel.",
      "scope.stable_li2_html":
        "<strong class=\"text-body\">Énergie :</strong> deltas positifs sur compteurs <code class=\"font-mono\">total_increasing</code> → comptabilisation par créneau et jour (jour Paris) et capteurs SSOT totaux gérés par l’intégration.",
      "scope.stable_li3_html":
        "<strong class=\"text-body\">Coûts :</strong> estimation journalière (€), abonnement lissé, détail par créneau dans les attributs.",
      "scope.stable_li4_html":
        "<strong class=\"text-body\">EDF Tempo :</strong> couleurs, quotas, prochains changements.",
      "scope.stable_li5_html":
        "<strong class=\"text-body\">Diagnostics :</strong> export/réinjection, qualité des données, télémétrie des deltas, créneau inconnu, obsolescence ; capteur <strong class=\"text-body\">santé</strong> (<code class=\"font-mono\">ok</code> / <code class=\"font-mono\">degraded</code> / <code class=\"font-mono\">rebuilding</code> / <code class=\"font-mono\">inconsistent</code> / <code class=\"font-mono\">no_input</code>) avec cause lisible.",
      "scope.stable_li6_html": "PV « ciel clair » optionnel et revente solaire si configurée.",
      "scope.stable_li7_html":
        "Lovelace : les paquets précompilés dans <code class=\"font-mono\">frontend/dist/</code> sont versionnés dans le dépôt ; Home Assistant les sert sous <code class=\"font-mono\">/hub_energie/</code>.",

      "scope.exp_heading": "Expérimental / au mieux",
      "scope.exp_li1":
        "Répartition de l’origine de la charge batterie par bilans de puissance lorsque les capteurs sont partiels ou bruités.",
      "scope.exp_li2": "Estimation de production solaire (modèle, pas un compteur physique).",
      "scope.exp_li3": "Diagnostics de type coût d’opportunité pour les kWh exportés.",

      "scope.disclaimer_html":
        "Le comportement dépend de votre matériel et du choix des entités (notamment le tableau Énergie). Les listes ci-dessus décrivent l’objectif, pas une garantie pour tous les cas limites.",

      "section.link_aria": "Lien vers cette section",

      "ssot.title": "Sources de données (SSOT)",
      "ssot.intro":
        "Savoir ce qui fait foi évite de mal paramétrer le tableau Énergie ou de lire les mauvais attributs.",
      "ssot.s1_title": "Compteurs physiques (SSOT externe)",
      "ssot.s1_html":
        "Les entités énergie que vous sélectionnez (<code class=\"font-mono\">grid_import_energy</code>, solaire, export, entrées/sorties par batterie). L’<strong class=\"text-body\">historique Recorder</strong> fait foi pour les kWh totaux (matériel ou intégrations amont).",

      "ssot.s2_title": "Comptabilité interne",
      "ssot.s2_html":
        "Le coordinateur cumule les <strong class=\"text-body\">deltas positifs</strong> en totaux et kWh par créneau et jour. Les capteurs SSOT <code class=\"font-mono\">total_increasing</code> reflètent cette <strong class=\"text-body\">somme interne</strong>, pas une relecture intégrale du compteur à chaque cycle.",

      "ssot.s3_title": "kWh long-terme par créneau (quotidien)",
      "ssot.s3_html":
        "Après chaque jour (Paris), écriture des statistiques externes <code class=\"font-mono\">hub_energie:slot_&lt;source&gt;_&lt;slot&gt;_kwh</code>. À utiliser (ou les compteurs physiques) pour l’analyse historique — pas seul l’historique brut d’attribut <code class=\"font-mono\">cost_detail</code>.",

      "install.title": "Installation",
      "install.intro_html":
        "Installez le dépôt <strong class=\"text-body\">exactement</strong> comme un seul paquet sous la config HA :",
      "install.note_html":
        "Home Assistant doit charger <code class=\"font-mono\">custom_components/hub_energie/manifest.json</code>. Évitez un dossier imbriqué du type <code class=\"font-mono\">hub_energie/hub_energie/</code>.",
      "install.choose_path": "Choisissez votre méthode",
      "tab.hacs_tba": "HACS (TBA)",
      "tab.git": "Clone Git",
      "tab.copy": "Copie des fichiers",

      "install.hacs_tba_heading": "Catalogue HACS public — à confirmer",
      "install.hacs_tba_html":
        "<p class=\"mb-2\">Le catalogue public <strong class=\"text-body\">HACS</strong> repose surtout sur des dépôts <strong class=\"text-body\">GitHub</strong> (<a href=\"https://hacs.xyz/docs/publish/start/\" target=\"_blank\" rel=\"noopener noreferrer\">règles de publication</a>). Ce projet est sur <strong class=\"text-body\">GitLab</strong> : une entrée « rechercher et installer » dans le catalogue par défaut n’est <strong class=\"text-body\">pas encore assurée</strong>.</p><p class=\"mb-0\">Pour l’instant privilégiez <strong class=\"text-body\">Clone Git</strong> ou <strong class=\"text-body\">Copie des fichiers</strong> (onglets ci-dessus). Si votre version de HACS accepte les <strong class=\"text-body\">dépôts personnalisés</strong> avec une URL GitLab, vous pouvez tenter cette voie — le comportement varie selon les versions. Après installation, effectuez toujours un <strong class=\"text-body\">redémarrage complet</strong> de Home Assistant.</p>",

      "install.git.s1_title": "Cloner au bon endroit",
      "install.git.s2_title": "Redémarrer & ajouter l’intégration",
      "install.git.s2_p_html":
        "Redémarrage <strong>complet</strong> de Home Assistant, puis <a href=\"#configure\">Configurer dans HA</a> (Réglages → Appareils et services → Ajouter une intégration).",

      "install.copy.s1_title": "Copier l’arborescence complète",
      "install.copy.s1_html":
        "Depuis ce dépôt, copiez uniquement l’arborescence <code class=\"font-mono\">custom_components/hub_energie/</code> vers le <code class=\"font-mono\">config/custom_components/hub_energie/</code> de Home Assistant — tous les sous-dossiers (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Ne copiez pas la racine du dépôt (<code class=\"font-mono\">public/</code>, <code class=\"font-mono\">tests/</code>, …) dans HA.",
      "install.copy.s2_title": "Redémarrer & ajouter l’intégration",
      "install.copy.s2_p_html": "Redémarrage complet, puis <a href=\"#configure\">Configurer dans HA</a>.",

      "install.lovelace_title": "Si vous utilisez la carte Lovelace",
      "install.lovelace_body_html":
        "Les paquets sous <code class=\"font-mono\">frontend/dist/</code> sont inclus dans ce dépôt (recompilés en CI à chaque commit). Vous n’avez <strong class=\"text-body\">pas</strong> besoin de lancer <code class=\"font-mono\">npm</code> sur la machine Home Assistant pour une installation courante — redémarrez HA après mise à jour de l’intégration. Pour des installations reproductibles, alignez un tag Git sur <code class=\"font-mono\">manifest.json</code> → <code class=\"font-mono\">version</code> (ex. <strong class=\"text-body\">v0.2.2</strong>).",
      "install.lovelace_dev_html":
        "<strong class=\"text-body\">Développement :</strong> pour recompiler en local, depuis <code class=\"font-mono\">custom_components/hub_energie/frontend/</code> exécutez <code class=\"font-mono\">npm ci</code> puis <code class=\"font-mono\">npm run build</code>.",

      "lovelace.title": "Carte Lovelace",
      "lovelace.intro_html":
        "Les artefacts de build (<code class=\"font-mono\">hub-energie-card-boot.js</code>, <code class=\"font-mono\">hub-energie-card.js</code> et les morceaux sous <code class=\"font-mono\">frontend/dist/</code>) sont livrés dans le dépôt et régénérés en CI à chaque commit. Home Assistant sert l’arborescence <code class=\"font-mono\">dist</code> sous <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>.",

      "lovelace.l1_title": "Tableaux de bord en mode stockage (défaut)",
      "lovelace.l1_html":
        "Au démarrage, l’intégration enregistre <code class=\"font-mono\">/hub_energie/hub-energie-card-boot.js</code> en <strong class=\"text-body\">module JavaScript</strong> (comme <em>Réglages → Tableaux de bord → Ressources</em>). En général, rien à faire à la main.",

      "lovelace.l2_title": "Ressources gérées en YAML",
      "lovelace.l2_p": "Ajoutez vous-même l’URL d’amorçage :",
      "lovelace.l2_note_html":
        "Remplacez les anciennes URL du type <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> par l’URL d’amorçage. N’enregistrez pas deux modules pour la même carte.",

      "lovelace.l3_title": "Ajouter la carte",

      "lovelace.showcase_title": "Carte tableau de bord",
      "lovelace.fig_alt": "Carte Lovelace Hub Énergie sur un tableau de bord",
      "lovelace.fig_cap_html":
        "Exemple en mode jour (Tempo, puissance instantanée, consommation, coûts, réinjection). Fichier : <code class=\"font-mono\">public/img/hub-energie-card.png</code>.",

      "lovelace.editor_title": "Éditeur visuel",
      "lovelace.editor_intro_html":
        "La carte dispose d’un éditeur complet (<code class=\"font-mono\">hub-energie-card-editor.js</code> dans le dépôt) pour régler la visibilité des sections, Tempo, la période et des entités optionnelles — sans YAML.",
      "lovelace.editor_tree": "Captures",
      "lovelace.ed1_t": "Mise en page & options",
      "lovelace.ed1_d": "Sections, période, Tempo et affichage",
      "lovelace.ed2_t": "Entités",
      "lovelace.ed2_d": "Sélecteurs optionnels / diagnostic",
      "lovelace.ed1_alt": "Éditeur de carte Lovelace — options générales",
      "lovelace.ed2_alt": "Éditeur de carte Lovelace — choix d’entités",

      "configure.title": "Configurer dans Home Assistant",
      "configure.intro":
        "Après un redémarrage complet, ajoutez l’intégration depuis l’interface et suivez l’assistant dans cet ordre :",

      "configure.s1_t": "Fournisseur",
      "configure.s1_d": "EDF ou autre",
      "configure.s2_t": "Type de phase",
      "configure.s2_d": "Monophasé ou triphasé",
      "configure.s3_t": "Tarif",
      "configure.s3_d": "Automatique (EDF) ou manuel : prix unique, heures creuses, calendrier",
      "configure.s4_t": "Contrat",
      "configure.s4_d": "Puissance (kVA), nom",
      "configure.s5_t": "Capteurs réseau",
      "configure.s5_d": "Énergie importée (obligatoire), export, puissance",
      "configure.s6_t": "Solaire",
      "configure.s6_d": "Énergie, puissance, revente, estimation PV optionnelle",
      "configure.s7_t": "Batteries",
      "configure.s7_d": "Entrées/sorties par batterie ; puissance, SOC, capacité optionnels",

      "configure.tree_label": "Étapes de l’assistant",
      "configure.carousel_hint_html":
        "Nommez les captures <code class=\"font-mono\">config-flow-01.png</code> … <code class=\"font-mono\">07.png</code> dans <code class=\"font-mono\">public/img/</code>. Utilisez l’arborescence à gauche ou les flèches pour passer d’une étape à l’autre.",
      "configure.slide1_alt": "Hub Énergie — assistant étape 1 fournisseur",
      "configure.slide2_alt": "Hub Énergie — assistant étape 2 phase",
      "configure.slide3_alt": "Hub Énergie — assistant étape 3 tarif",
      "configure.slide4_alt": "Hub Énergie — assistant étape 4 contrat",
      "configure.slide5_alt": "Hub Énergie — assistant étape 5 capteurs réseau",
      "configure.slide6_alt": "Hub Énergie — assistant étape 6 solaire",
      "configure.slide7_alt": "Hub Énergie — assistant étape 7 batteries",

      "devices.title": "Modèle d’appareils",
      "devices.intro":
        "Un appareil Home Assistant par périmètre logique. Le placement des entités suit les domaines mesurés ou configurés ; voir <code class=\"font-mono\">CHANGELOG.md</code> pour le détail.",

      "devices.th_device": "Appareil",
      "devices.th_purpose": "Rôle",
      "devices.p_offre": "Tarif, fournisseur, contrat",
      "devices.p_reseau": "Capteurs énergie / puissance réseau",
      "devices.p_solaire": "Mesure ou estimation solaire",
      "devices.p_batt": "Système par batterie (0..N)",
      "devices.p_battsum": "Synthèse batteries agrégée",
      "devices.p_bilan": "Flux énergétiques calculés (kWh)",
      "devices.p_couts": "Montants (€)",
      "devices.p_diag": "Santé, diagnostics réinjection",

      "devices.gallery_title": "Appareils dans l’interface",
      "devices.gallery_intro_html":
        "Chaque appareil regroupe les entités associées. Ci-dessous, un volet par appareil pour illustrer la structure dans <strong class=\"text-body\">Réglages → Appareils et services</strong>.",
      "devices.gallery_multishot_html":
        "Pour les appareils très fournis en entités, vous pourrez ajouter d’autres PNG (ex. <code class=\"font-mono\">device-ui-02-reseau-2.png</code>) — la doc pourra intégrer un carrousel imbriqué quand ces fichiers existeront.",
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
      "devices.g8_d": "Santé et réinjection",
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
        "La rétention du Recorder borne l’historique, les graphiques et la reconstruction depuis le Recorder.",
      "limitations.li2":
        "L’estimation solaire optionnelle est un modèle « ciel clair » — indicative, pas un compteur de production.",
      "limitations.li3_html":
        "Le graphe de puissance de la carte repose sur les statistiques ; un <code class=\"font-mono\">state_class</code> manquant ou peu d’historique peut le laisser vide.",
      "limitations.li4_html":
        "Les états de santé agrègent plusieurs contrôles ; un court <code class=\"font-mono\">rebuilding</code> après reconstruction via le Recorder est normal.",
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
        "Totaux internes et kWh par créneau à partir des deltas et rejouage Recorder optionnel.",
      "glossary.est": "Estimé",
      "glossary.est_d":
        "Solaire modélisé et autres approximations lorsqu’il n’y a pas de compteur direct.",

      "footer.p1_html":
        "Hub Énergie — instantané de documentation <strong class=\"text-body\">v0.2.2</strong>. Référence détaillée : README et <code class=\"font-mono\">docs/</code> dans le <a href=\"https://gitlab.com/zzcyph1/home-assistant/hub-energie\">projet GitLab</a>.",
      "footer.license": "Licence : voir le dépôt.",
    },
  };
})(typeof window !== "undefined" ? window : this);
