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
        "Lovelace assets under <code class=\"font-mono\">/hub_energie/</code> after build.",

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
      "tab.hacs": "HACS",
      "tab.git": "Git clone",
      "tab.copy": "Copy files",

      "install.h1_title": "Add custom repository",
      "install.h1_p_html":
        "In HACS: menu (⋮) → <strong class=\"text-body\">Custom repositories</strong> → paste the GitLab URL → category <strong class=\"text-body\">Integration</strong> → Add.",
      "install.h1_ph1": "Screenshot: HACS → Custom repositories",
      "install.h1_ph2_html":
        "Replace this block with <code class=\"font-mono\">&lt;img src=\"img/hacs-custom-repo.png\" alt=\"…\" /&gt;</code>",
      "install.h1_caption_html":
        "Optional — drop your PNG/WebP into <code class=\"font-mono\">public/img/</code> and reference it here.",

      "install.h2_title": "Download the integration",
      "install.h2_p_html":
        "HACS → <strong class=\"text-body\">Integrations</strong> → find <strong class=\"text-body\">Hub Énergie</strong> → Download. HACS installs from the <code class=\"font-mono\">custom_components/hub_energie/</code> folder in the repository (standard layout).",

      "install.h3_title": "Restart Home Assistant",
      "install.h3_p_html":
        "Full restart — not only “Reload YAML”. Then continue with <a href=\"#configure\">Configure in HA</a> below.",

      "install.git.s1_title": "Clone into the right folder",
      "install.git.s2_title": "Restart & add the integration",
      "install.git.s2_p_html":
        "Same as HACS: full restart, then <a href=\"#configure\">Configure in HA</a>.",

      "install.copy.s1_title": "Copy the full tree",
      "install.copy.s1_html":
        "From this repository, copy only the <code class=\"font-mono\">custom_components/hub_energie/</code> tree into your Home Assistant <code class=\"font-mono\">config/custom_components/hub_energie/</code> — all subfolders (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Do not copy the repo root (<code class=\"font-mono\">public/</code>, <code class=\"font-mono\">tests/</code>, …) into HA.",
      "install.copy.s2_title": "Restart & add the integration",
      "install.copy.s2_p_html": "Full restart, then <a href=\"#configure\">Configure in HA</a>.",

      "install.lovelace_title": "If you use the Lovelace card",
      "install.lovelace_p1": "Build the frontend bundle once on the host where the files live:",
      "install.lovelace_p2_html":
        "Then restart HA again if needed. For reproducible installs, use a Git tag matching <code class=\"font-mono\">manifest.json</code> <code class=\"font-mono\">version</code> (e.g. <strong class=\"text-body\">v0.2.2</strong>).",

      "lovelace.title": "Lovelace card",
      "lovelace.intro_html":
        "Vite builds <code class=\"font-mono\">hub-energie-card-boot.js</code> (registers <code class=\"font-mono\">hub-energie-card</code>) plus chunks under <code class=\"font-mono\">frontend/dist/</code>. HA serves them at <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>.",

      "lovelace.l1_title": "Storage-mode dashboards (default)",
      "lovelace.l1_html":
        "On startup the integration adds <code class=\"font-mono\">/hub_energie/hub-energie-card-boot.js</code> as a <strong class=\"text-body\">JavaScript module</strong> (same as <em>Settings → Dashboards → Resources</em>). Usually nothing to do manually.",

      "lovelace.l2_title": "YAML-managed resources",
      "lovelace.l2_p": "Add the boot URL yourself:",
      "lovelace.l2_note_html":
        "Replace legacy URLs such as <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> with the boot URL. Do not register duplicate modules for the same card.",

      "lovelace.l3_title": "Add the card",

      "lovelace.fig_ph": "Screenshot: Dashboard with Hub Énergie card",
      "lovelace.fig_cap_html":
        "Swap the placeholder for an <code class=\"font-mono\">&lt;img&gt;</code> when you have a capture.",

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

      "configure.fig_ph": "Screenshot: Integrations → Hub Énergie → config flow",
      "configure.fig_cap": "Helps readers match each step to the UI.",

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
        "Ressources Lovelace sous <code class=\"font-mono\">/hub_energie/</code> après build.",

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
      "tab.hacs": "HACS",
      "tab.git": "Clone Git",
      "tab.copy": "Copie des fichiers",

      "install.h1_title": "Ajouter le dépôt personnalisé",
      "install.h1_p_html":
        "Dans HACS : menu (⋮) → <strong class=\"text-body\">Dépôts personnalisés</strong> → collez l’URL GitLab → catégorie <strong class=\"text-body\">Intégration</strong> → Ajouter.",
      "install.h1_ph1": "Capture : HACS → Dépôts personnalisés",
      "install.h1_ph2_html":
        "Remplacez ce bloc par <code class=\"font-mono\">&lt;img src=\"img/hacs-custom-repo.png\" alt=\"…\" /&gt;</code>",
      "install.h1_caption_html":
        "Optionnel — placez votre PNG/WebP dans <code class=\"font-mono\">public/img/</code> et référencez-le ici.",

      "install.h2_title": "Télécharger l’intégration",
      "install.h2_p_html":
        "HACS → <strong class=\"text-body\">Intégrations</strong> → trouvez <strong class=\"text-body\">Hub Énergie</strong> → Télécharger. HACS installe à partir du dossier <code class=\"font-mono\">custom_components/hub_energie/</code> du dépôt (mise en page standard).",

      "install.h3_title": "Redémarrer Home Assistant",
      "install.h3_p_html":
        "Redémarrage <strong>complet</strong> — pas seulement « Recharger YAML ». Puis poursuivez avec <a href=\"#configure\">Configurer dans HA</a> ci-dessous.",

      "install.git.s1_title": "Cloner au bon endroit",
      "install.git.s2_title": "Redémarrer & ajouter l’intégration",
      "install.git.s2_p_html":
        "Comme avec HACS : redémarrage complet, puis <a href=\"#configure\">Configurer dans HA</a>.",

      "install.copy.s1_title": "Copier l’arborescence complète",
      "install.copy.s1_html":
        "Depuis ce dépôt, copiez uniquement l’arborescence <code class=\"font-mono\">custom_components/hub_energie/</code> vers le <code class=\"font-mono\">config/custom_components/hub_energie/</code> de Home Assistant — tous les sous-dossiers (<code class=\"font-mono\">battery/</code>, <code class=\"font-mono\">energy/</code>, <code class=\"font-mono\">frontend/</code>, etc.). Ne copiez pas la racine du dépôt (<code class=\"font-mono\">public/</code>, <code class=\"font-mono\">tests/</code>, …) dans HA.",
      "install.copy.s2_title": "Redémarrer & ajouter l’intégration",
      "install.copy.s2_p_html": "Redémarrage complet, puis <a href=\"#configure\">Configurer dans HA</a>.",

      "install.lovelace_title": "Si vous utilisez la carte Lovelace",
      "install.lovelace_p1": "Compilez le frontend une fois sur la machine qui héberge les fichiers :",
      "install.lovelace_p2_html":
        "Puis redémarrez HA si besoin. Pour des installations reproductibles, utilisez un tag Git aligné sur <code class=\"font-mono\">manifest.json</code> → <code class=\"font-mono\">version</code> (ex. <strong class=\"text-body\">v0.2.2</strong>).",

      "lovelace.title": "Carte Lovelace",
      "lovelace.intro_html":
        "Vite produit <code class=\"font-mono\">hub-energie-card-boot.js</code> (enregistre <code class=\"font-mono\">hub-energie-card</code>) et les morceaux sous <code class=\"font-mono\">frontend/dist/</code>. HA les sert sous <strong class=\"text-body\"><code class=\"font-mono\">/hub_energie/</code></strong>.",

      "lovelace.l1_title": "Tableaux de bord en mode stockage (défaut)",
      "lovelace.l1_html":
        "Au démarrage, l’intégration enregistre <code class=\"font-mono\">/hub_energie/hub-energie-card-boot.js</code> en <strong class=\"text-body\">module JavaScript</strong> (comme <em>Réglages → Tableaux de bord → Ressources</em>). En général, rien à faire à la main.",

      "lovelace.l2_title": "Ressources gérées en YAML",
      "lovelace.l2_p": "Ajoutez vous-même l’URL d’amorçage :",
      "lovelace.l2_note_html":
        "Remplacez les anciennes URL du type <code class=\"font-mono\">/hub_energie/dist/hub-energie-card.js</code> par l’URL d’amorçage. N’enregistrez pas deux modules pour la même carte.",

      "lovelace.l3_title": "Ajouter la carte",

      "lovelace.fig_ph": "Capture : tableau de bord avec la carte Hub Énergie",
      "lovelace.fig_cap_html":
        "Remplacez le placeholder par un <code class=\"font-mono\">&lt;img&gt;</code> lorsque vous avez une capture.",

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

      "configure.fig_ph": "Capture : Intégrations → Hub Énergie → assistant de config",
      "configure.fig_cap": "Aide à faire correspondre chaque étape à l’interface.",

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
