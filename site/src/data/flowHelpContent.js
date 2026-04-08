/**
 * Per-step help for Home Assistant config / options dialogs.
 * Linked from HA via: #/doc/setup-help#flow-step-<id> or #flow-step-options-<id>
 */

const DOC_DELTA = '<a href="#/doc#configure-delta-caps">Energy delta caps</a>';
const DOC_DELTA_FR =
  '<a href="#/doc#configure-delta-caps">Plafonds de delta d’énergie</a>';

export const FLOW_HELP_EN = {
  user: {
    title: "User — supplier & phase",
    body_html: `<p>First screen of the setup wizard. Pick your <strong>supplier</strong> (EDF vs other) and whether the installation is <strong>single- or three-phase</strong>. That choice steers the whole branch (automatic EDF tariffs vs manual pricing, tri sub-steps later).</p>`,
  },
  supplier_custom: {
    title: "Custom supplier",
    body_html: `<p>Shown when you choose a supplier other than EDF. Enter a short <strong>display name</strong> for dashboards and devices. Tariffs will be entered manually next — there is no automatic feed for arbitrary suppliers.</p>`,
  },
  tariff_mode_manual_only: {
    title: "Manual tariffs (other supplier)",
    body_html: `<p>Confirms that pricing is <strong>manual-only</strong> for your “other” supplier path, then continues to contract / pricing forms.</p>`,
  },
  tariff_mode: {
    title: "Tariff mode (EDF)",
    body_html: `<p>For EDF, choose whether Hub Énergie should <strong>fetch official tariff rows</strong> (automatic) or whether you will enter prices yourself (manual). Automatic mode later selects BASE / HPHC / Tempo and possibly RTE or API Couleur.</p>`,
  },
  contract: {
    title: "Contract — subscribed power",
    body_html: `<p>Enter your <strong>subscribed power (kVA)</strong> and an optional contract label. This screen is shared across many branches; what happens next depends on EDF vs other and auto vs manual tariffs (offer selection, manual price tables, or fetch).</p>`,
  },
  edf_offer: {
    title: "EDF offer type",
    body_html: `<p>Pick <strong>BASE</strong>, <strong>HPHC</strong>, or <strong>TEMPO</strong>. Tempo adds a step to choose RTE vs API Couleur. If the tariff API fetch fails, the flow may return here with an error so you can fix credentials or retry.</p>`,
  },
  edf_tempo: {
    title: "Tempo — data source",
    body_html: `<p>Choose how Hub Énergie obtains Tempo colours: <strong>RTE</strong> (OAuth API, credentials required) or <strong>API Couleur Tempo</strong> (no RTE account). This sets which follow-up screen appears.</p>`,
  },
  edf_tempo_rte: {
    title: "RTE API credentials",
    body_html: `<p>Enter RTE <strong>client id</strong> and <strong>secret</strong>. Home Assistant validates them against the API before continuing. Leave the secret empty in options later if you only want to rotate the id.</p>`,
  },
  manual_pricing: {
    title: "Manual pricing — structure",
    body_html: `<p>Select how you want to encode prices: <strong>flat</strong>, simple <strong>peak/off-peak</strong> table, or an <strong>advanced schedule</strong> (form or JSON). All branches end at grid sensors once numbers are complete.</p>`,
  },
  manual_flat: {
    title: "Manual — flat rate",
    body_html: `<p>Single energy price (per kWh) plus optional monthly subscription fields, then the flow jumps to <strong>grid</strong> wiring.</p>`,
  },
  manual_tou: {
    title: "Manual — two-slot TOU",
    body_html: `<p>Define morning/evening (or similar) windows and a price per slot — a compact HP/HC-style model without full Tempo.</p>`,
  },
  manual_schedule: {
    title: "Manual — advanced schedule menu",
    body_html: `<p>Choose between a <strong>visual slot editor</strong> and a <strong>JSON</strong> representation for complex weekly / calendar rules.</p>`,
  },
  manual_schedule_form: {
    title: "Manual — schedule (form)",
    body_html: `<p>Fill rows for start/end times, price, optional day filter, and labels. Validation ensures coverage rules expected by the integration.</p>`,
  },
  manual_schedule_json: {
    title: "Manual — schedule (JSON)",
    body_html: `<p>Paste or edit the schedule as JSON — useful for power users duplicating configs between homes.</p>`,
  },
  grid_tri_energy_mode: {
    title: "Three-phase — energy layout",
    body_html: `<p>Declare whether you have <strong>one total import counter</strong> for the whole feed or <strong>per-phase import meters</strong>. This decides the next tri-specific screens.</p>`,
  },
  grid_tri_per_phase: {
    title: "Three-phase — per-phase import",
    body_html: `<p>Pick L1/L2/L3 import <code class="font-mono">total_increasing</code> entities and optional export per phase. Missing export must be all-or-none.</p>`,
  },
  grid: {
    title: "Grid sensors",
    body_html: `<p>Bind <strong>grid import</strong> energy (required) and optional export / power / load entities. On three-phase “single total” paths you may still pass through extra layout steps after this form.</p>`,
  },
  grid_tri_layout: {
    title: "Three-phase — sensor layout",
    body_html: `<p>When tri + one total energy entity, choose whether optional per-phase power / export picks are collected in a wizard chain or via combined JSON lists.</p>`,
  },
  grid_phases: {
    title: "Three-phase — JSON phase lists",
    body_html: `<p>Advanced path: supply structured lists of entity ids for each phase (import/export/power) in one shot.</p>`,
  },
  tri_grid_phase_1: {
    title: "Three-phase — L1 optional sensors",
    body_html: `<p>First leg of the optional per-phase walkthrough (repeat for L2 and L3) before solar.</p>`,
  },
  tri_grid_phase_2: {
    title: "Three-phase — L2 optional sensors",
    body_html: `<p>Second leg of the optional per-phase walkthrough.</p>`,
  },
  tri_grid_phase_3: {
    title: "Three-phase — L3 optional sensors",
    body_html: `<p>Final leg of the optional per-phase walkthrough, then solar.</p>`,
  },
  solar: {
    title: "Solar — yes or no",
    body_html: `<p>Toggle whether you track solar production through Hub Énergie. “Yes” opens production / resale / estimation questions.</p>`,
  },
  solar_config: {
    title: "Solar — entities & resale",
    body_html: `<p>Select production energy / power entities and optional resale tariff. You can enable the clear-sky <strong>estimation</strong> model instead of a physical production meter.</p>`,
  },
  solar_estimation: {
    title: "Solar — estimation model",
    body_html: `<p>Configure location, orientation, shading, and PV parameters for the simplified production model (indicative, not a replacement for a meter).</p>`,
  },
  battery: {
    title: "Batteries — yes or no",
    body_html: `<p>Declare if at least one storage system should be tracked. “Yes” starts the battery wizard (name, in/out energy, optional power &amp; SOC).</p>`,
  },
  battery_add: {
    title: "Battery — add system",
    body_html: `<p>Define charge/discharge energy meters and optional power/SOC. Advanced mode toggles capacity and charge limit helpers.</p>`,
  },
  battery_advanced: {
    title: "Battery — advanced limits",
    body_html: `<p>Optional capacity, charge/discharge limits, SOC min/max — either manual numbers or linked entities (XOR per field).</p>`,
  },
  battery_more: {
    title: "Battery — add another?",
    body_html: `<p>Loop control: add more battery definitions or finish the wizard and create the config entry.</p>`,
  },
  reinjection: {
    title: "Advanced reinjection tuning",
    body_html: `<p>Optional expert thresholds for classifying export, solar contribution, and short “latency” spikes. Adjust only when debugging mis-tagged reinjection.</p>`,
  },

  options_init: {
    title: "Options — menu",
    body_html: `<p>Entry point for <strong>Configure</strong> after the integration is installed. Pick a topic (offer, grid, solar, batteries, Tempo, delta caps, …) without walking the entire first-run wizard.</p>`,
  },
  options_offer: {
    title: "Options — offer & contract",
    body_html: `<p>Post-setup menu entry. Adjust supplier display, contract kVA / label (and EDF-specific tariff refresh prerequisites). Does not repeat the entire first-run tree.</p>`,
  },
  options_tariff_refresh: {
    title: "Options — EDF tariff refresh",
    body_html: `<p>Re-query official EDF JSON rates for the selected offer &amp; kVA and patch the integration options (rates + timestamp).</p>`,
  },
  options_tempo: {
    title: "Options — Tempo source",
    body_html: `<p>Switch between RTE, API Couleur, or sensor-driven slot providers without redoing the whole setup.</p>`,
  },
  options_tempo_rte: {
    title: "Options — RTE credentials",
    body_html: `<p>Update RTE OAuth secrets; blank secret keeps the previous value. Same validation rules as the initial wizard.</p>`,
  },
  options_advanced_energy: {
    title: "Options — energy delta caps",
    body_html: `<p>Override the maximum positive kWh jump accepted per poll for grid, solar, batteries, and other sources. See ${DOC_DELTA} for when to raise caps and what happens if HA was offline.</p>`,
  },
  options_grid: {
    title: "Options — grid sensors",
    body_html: `<p>Change import/export/power entities without deleting the integration. Useful after replacing hardware templates.</p>`,
  },
  options_grid_tri_energy_mode: {
    title: "Options — three-phase import mode",
    body_html: `<p>Re-opens the tri import layout with the same validation as setup: one total counter vs one import meter per phase. Useful after rewiring meters.</p>`,
  },
  options_grid_tri_per_phase: {
    title: "Options — three-phase per-phase imports",
    body_html: `<p>Pick L1/L2/L3 import entities and optional phased export — same all-or-none export rule as the wizard.</p>`,
  },
  options_grid_tri_layout: {
    title: "Options — three-phase sensor layout",
    body_html: `<p>Choose JSON lists vs step-by-step phase forms for optional per-phase sensors; main grid totals from the Grid step stay primary.</p>`,
  },
  options_grid_phases: {
    title: "Options — three-phase JSON lists",
    body_html: `<p>Advanced path: structured lists of entity ids for import/export/power per phase.</p>`,
  },
  options_tri_grid_phase_1: {
    title: "Options — tri phase L1",
    body_html: `<p>Optional entities for phase 1 — mirror the wizard; leave fields empty to skip.</p>`,
  },
  options_tri_grid_phase_2: {
    title: "Options — tri phase L2",
    body_html: `<p>Optional entities for phase 2 — mirror the wizard; leave fields empty to skip.</p>`,
  },
  options_tri_grid_phase_3: {
    title: "Options — tri phase L3",
    body_html: `<p>Optional entities for phase 3 — mirror the wizard; leave fields empty to skip.</p>`,
  },
  options_solar: {
    title: "Options — solar",
    body_html: `<p>Toggle solar tracking or edit production/resale/estimation parameters after installation.</p>`,
  },
  options_solar_estimation: {
    title: "Options — solar estimation",
    body_html: `<p>Edit PV estimation parameters when production is enabled, without redoing the whole energy wiring.</p>`,
  },
  options_battery: {
    title: "Options — batteries",
    body_html: `<p>Add, remove, or edit battery definitions; pick which pack to edit when several exist.</p>`,
  },
  options_battery_pick: {
    title: "Options — pick battery",
    body_html: `<p>Shown when multiple batteries are configured — choose which row to edit or add a new pack.</p>`,
  },
  options_battery_add: {
    title: "Options — add / edit battery",
    body_html: `<p>Same fields as the wizard battery form: energy in/out required; power/SOC optional; advanced toggles capacity and limits.</p>`,
  },
  options_battery_advanced: {
    title: "Options — battery limits",
    body_html: `<p>Capacity, max charge/discharge, SOC bounds — entity vs manual pairs remain mutually exclusive per row.</p>`,
  },
  options_battery_more: {
    title: "Options — another battery?",
    body_html: `<p>Loop to add another pack or return to the batteries menu.</p>`,
  },
};

// French: mirror structure (concise)
export const FLOW_HELP_FR = {
  user: {
    title: "Utilisateur — fournisseur & phase",
    body_html: `<p>Premier écran de l’assistant. Choisissez le <strong>fournisseur</strong> (EDF ou autre) et le type de <strong>phase</strong> (mono / tri). La suite du parcours (tarifs auto EDF vs saisie manuelle, sous-étapes tri) en découle.</p>`,
  },
  supplier_custom: {
    title: "Fournisseur personnalisé",
    body_html: `<p>Affiché si vous n’êtes pas chez EDF. Saisissez un <strong>nom court</strong> pour les libellés ; les tarifs seront <strong>manuels</strong> ensuite.</p>`,
  },
  tariff_mode_manual_only: {
    title: "Tarifs manuels (autre fournisseur)",
    body_html: `<p>Confirme le mode <strong>uniquement manuel</strong> puis enchaîne vers le contrat / grilles de prix.</p>`,
  },
  tariff_mode: {
    title: "Mode tarifaire (EDF)",
    body_html: `<p>Pour EDF : tarifs <strong>automatiques</strong> (API) ou <strong>manuel</strong>. Le mode auto mène ensuite au choix BASE / HPHC / Tempo et éventuellement RTE ou API Couleur.</p>`,
  },
  contract: {
    title: "Contrat — puissance souscrite",
    body_html: `<p>Saisie de la <strong>puissance souscrite (kVA)</strong> et d’un libellé optionnel. L’écran suivant dépend du fournisseur et du mode auto / manuel.</p>`,
  },
  edf_offer: {
    title: "Offre EDF",
    body_html: `<p>Choix <strong>BASE</strong>, <strong>HPHC</strong> ou <strong>TEMPO</strong>. Tempo ajoute l’étape « source des couleurs ». En cas d’échec de récupération des tarifs, l’assistant peut revenir ici avec une erreur.</p>`,
  },
  edf_tempo: {
    title: "Tempo — source de données",
    body_html: `<p><strong>RTE</strong> (OAuth, identifiants requis) ou <strong>API Couleur Tempo</strong> (sans compte RTE).</p>`,
  },
  edf_tempo_rte: {
    title: "Identifiants API RTE",
    body_html: `<p>Client ID et secret ; validation côté API. Laisser le secret vide en modification ultérieure pour conserver l’existant.</p>`,
  },
  manual_pricing: {
    title: "Tarification manuelle — structure",
    body_html: `<p>Prix <strong>unique</strong>, <strong>HP/HC</strong> simple ou <strong>calendrier avancé</strong> (formulaire ou JSON).</p>`,
  },
  manual_flat: {
    title: "Manuel — prix unique",
    body_html: `<p>Un prix au kWh et abonnement optionnel, puis capteurs réseau.</p>`,
  },
  manual_tou: {
    title: "Manuel — deux plages",
    body_html: `<p>Deux créneaux horaires et un prix chacun (style HP/HC compact).</p>`,
  },
  manual_schedule: {
    title: "Manuel — calendrier avancé",
    body_html: `<p>Choix entre formulaire visuel et saisie <strong>JSON</strong>.</p>`,
  },
  manual_schedule_form: {
    title: "Manuel — calendrier (formulaire)",
    body_html: `<p>Remplir les lignes (début / fin / prix / type de jour / nom). Des règles de validation garantissent la couverture attendue.</p>`,
  },
  manual_schedule_json: {
    title: "Manuel — calendrier (JSON)",
    body_html: `<p>Édition ou collage JSON pour dupliquer des configurations ou versions avancées.</p>`,
  },
  grid_tri_energy_mode: {
    title: "Triphasé — mode énergie",
    body_html: `<p>Compteur d’import <strong>total unique</strong> ou <strong>un compteur par phase</strong> ; la suite dépend de ce choix.</p>`,
  },
  grid_tri_per_phase: {
    title: "Triphasé — import par phase",
    body_html: `<p>Sélection des entités kWh L1/L2/L3 et export par phase optionnel (tout ou rien).</p>`,
  },
  grid: {
    title: "Capteurs réseau",
    body_html: `<p>Import obligatoire, export / puissance / charge optionnels. En tri « total unique », d’autres sous-étapes peuvent suivre.</p>`,
  },
  grid_tri_layout: {
    title: "Triphasé — disposition des capteurs",
    body_html: `<p>Avec un seul compteur tri, choix entre assistant par phase ou listes JSON combinées.</p>`,
  },
  grid_phases: {
    title: "Triphasé — JSON par phase",
    body_html: `<p>Listes JSON d’identifiants d’entités par phase pour utilisateurs avancés.</p>`,
  },
  tri_grid_phase_1: {
    title: "Triphasé — L1 (optionnel)",
    body_html: `<p>Première étape de la chaîne L1→L2→L3 pour capteurs optionnels.</p>`,
  },
  tri_grid_phase_2: {
    title: "Triphasé — L2 (optionnel)",
    body_html: `<p>Deuxième étape de la chaîne par phase.</p>`,
  },
  tri_grid_phase_3: {
    title: "Triphasé — L3 (optionnel)",
    body_html: `<p>Dernière étape avant le solaire.</p>`,
  },
  solar: {
    title: "Solaire — oui / non",
    body_html: `<p>Active ou non le suivi PV dans l’intégration.</p>`,
  },
  solar_config: {
    title: "Solaire — entités & revente",
    body_html: `<p>Entités production, revente, activation éventuelle du modèle d’estimation « ciel clair ».</p>`,
  },
  solar_estimation: {
    title: "Solaire — estimation",
    body_html: `<p>Paramètres géographiques et du générateur pour l’estimation modèle (indicatif).</p>`,
  },
  battery: {
    title: "Batteries — oui / non",
    body_html: `<p>Déclare si au moins un stockage est suivi ; « oui » ouvre l’assistant batterie.</p>`,
  },
  battery_add: {
    title: "Batterie — ajout",
    body_html: `<p>Nom, compteurs énergie charge/décharge, puissance/SOC optionnels ; mode avancé pour limites.</p>`,
  },
  battery_advanced: {
    title: "Batterie — avancé",
    body_html: `<p>Capacité, puissances max, SOC min/max — manuel ou entité (exclusif par ligne).</p>`,
  },
  battery_more: {
    title: "Batterie — une autre ?",
    body_html: `<p>Boucle d’ajout ou fin de création d’entrée de configuration.</p>`,
  },
  reinjection: {
    title: "Réglages avancés réinjection",
    body_html: `<p>Seuils experts optionnels pour classer export, part solaire et courts pics de « latence ». À n’ajuster que pour diagnostiquer une mauvaise étiquette.</p>`,
  },

  options_init: {
    title: "Options — menu",
    body_html: `<p>Point d’entrée du menu <strong>Configurer</strong> après installation : choisir un thème (offre, réseau, solaire, batteries, Tempo, deltas, …) sans refaire tout l’assistant initial.</p>`,
  },
  options_offer: {
    title: "Options — offre & contrat",
    body_html: `<p>Après installation : ajuster offre, kVA ou libellé sans tout recommencer.</p>`,
  },
  options_tariff_refresh: {
    title: "Options — rafraîchir tarifs EDF",
    body_html: `<p>Relit l’API tabulaire et met à jour les options (prix + horodatage).</p>`,
  },
  options_tempo: {
    title: "Options — source Tempo",
    body_html: `<p>Bascule RTE / API / capteur sans refaire la première installation.</p>`,
  },
  options_tempo_rte: {
    title: "Options — identifiants RTE",
    body_html: `<p>Rotation des secrets RTE avec les mêmes règles que le flux initial.</p>`,
  },
  options_advanced_energy: {
    title: "Options — plafonds de delta",
    body_html: `<p>Remplace les plafonds kWh par relevé pour éviter rejets après longue coupure ou, inversement, limiter un pic. Voir ${DOC_DELTA_FR}.</p>`,
  },
  options_grid: {
    title: "Options — réseau",
    body_html: `<p>Remplacer les entités import/export/puissance si votre câblage a changé.</p>`,
  },
  options_grid_tri_energy_mode: {
    title: "Options — triphasé, mode d’import",
    body_html: `<p>Réouvre la question import tri (total unique vs compteur par phase) avec les mêmes règles que l’assistant — utile après changement de comptage.</p>`,
  },
  options_grid_tri_per_phase: {
    title: "Options — triphasé, import par phase",
    body_html: `<p>Sélection L1/L2/L3 et export par phase optionnel — règle « tout ou rien » sur l’export comme à l’installation.</p>`,
  },
  options_grid_tri_layout: {
    title: "Options — triphasé, disposition capteurs",
    body_html: `<p>Listes JSON ou assistant phase par phase pour capteurs optionnels ; les totaux réseau de l’étape Réseau restent la base.</p>`,
  },
  options_grid_phases: {
    title: "Options — triphasé, JSON",
    body_html: `<p>Voie avancée : listes d’identifiants import/export/puissance par phase.</p>`,
  },
  options_tri_grid_phase_1: {
    title: "Options — tri phase L1",
    body_html: `<p>Capteurs optionnels phase 1 — comme l’assistant ; champs vides pour ignorer.</p>`,
  },
  options_tri_grid_phase_2: {
    title: "Options — tri phase L2",
    body_html: `<p>Capteurs optionnels phase 2 — comme l’assistant ; champs vides pour ignorer.</p>`,
  },
  options_tri_grid_phase_3: {
    title: "Options — tri phase L3",
    body_html: `<p>Capteurs optionnels phase 3 — comme l’assistant ; champs vides pour ignorer.</p>`,
  },
  options_solar: {
    title: "Options — solaire",
    body_html: `<p>Réactiver/désactiver le suivi ou modifier production / revente / estimation.</p>`,
  },
  options_solar_estimation: {
    title: "Options — estimation PV",
    body_html: `<p>Modifier les paramètres d’estimation lorsque le suivi est actif, sans refaire tout le câblage énergie.</p>`,
  },
  options_battery: {
    title: "Options — batteries",
    body_html: `<p>Éditer la flotte : ajout, choix d’un pack existant, suppression implicite si tout est retiré.</p>`,
  },
  options_battery_pick: {
    title: "Options — choix de batterie",
    body_html: `<p>Liste déroulante lorsque plusieurs systèmes sont enregistrés.</p>`,
  },
  options_battery_add: {
    title: "Options — ajouter / éditer batterie",
    body_html: `<p>Mêmes champs que l’assistant : énergie charge/décharge obligatoires ; puissance/SOC optionnels ; mode avancé pour limites/ capacité.</p>`,
  },
  options_battery_advanced: {
    title: "Options — limites batterie",
    body_html: `<p>Capacité, puissances max, bornes SOC — paires entité / manuel toujours exclusives par ligne.</p>`,
  },
  options_battery_more: {
    title: "Options — une autre batterie ?",
    body_html: `<p>Boucle d’ajout ou retour au menu batteries.</p>`,
  },
};
