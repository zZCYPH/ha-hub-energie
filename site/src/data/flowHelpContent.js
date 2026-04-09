/**
 * Per-step help for Home Assistant config / options dialogs.
 * Linked from HA via: #/doc/setup-help#flow-step-<id> or #flow-step-options-<id>
 */

const DOC_DELTA = '<a href="#/doc#configure-delta-caps">Energy delta caps</a>';
const DOC_DELTA_FR =
  '<a href="#/doc#configure-delta-caps">Plafonds de delta d’énergie</a>';

const DOC_INTERNALS_REINJECTION =
  '<a href="#/internals#internals-reinjection">Internals — grid export &amp; reinjection</a>';
const DOC_INTERNALS_REINJECTION_FR =
  '<a href="#/internals#internals-reinjection">Internes — export &amp; réinjection</a>';
const DOC_INTERNALS_DELTA_CAPS =
  '<a href="#/internals#internals-delta-caps">Internals — energy delta caps</a>';
const DOC_INTERNALS_DELTA_CAPS_FR =
  '<a href="#/internals#internals-delta-caps">Internes — plafonds de delta</a>';

/** From ``custom_components/hub_energie/docs/advanced-schedule-slots.md`` — keep in sync when that doc changes. */
const FLOWHELP_ADV_SCHEDULE_REFERENCE_EN = `
<div class="flowhelp-schedule-ref small text-body">
<p class="text-secondary mb-3">Each <strong>slot</strong> is a time range, an energy price (per kWh), which days it applies to, and an optional label. The integration stores slots as a JSON <strong>array of objects</strong> in <code class="font-mono">schedule_slots</code> (Home Assistant config entry data).</p>

<h4 class="h6 fw-semibold mt-3 mb-2">JSON shape — field reference</h4>
<div class="table-responsive mb-3">
  <table class="table table-sm table-bordered align-middle mb-0">
    <thead class="table-light"><tr><th scope="col">Field</th><th scope="col">Required</th><th scope="col">Type</th><th scope="col">Description</th></tr></thead>
    <tbody>
      <tr><td><code class="font-mono">start</code></td><td>yes</td><td>string</td><td>Start time, <code class="font-mono">HH:MM</code> (24 h). Seconds (<code class="font-mono">HH:MM:SS</code>) are accepted and normalized to <code class="font-mono">HH:MM</code>.</td></tr>
      <tr><td><code class="font-mono">end</code></td><td>yes</td><td>string</td><td>End time, same format. <strong><code class="font-mono">00:00</code> means midnight at the end of the day</strong> (24:00), not midnight at the start. Use this for ranges that cross midnight (e.g. <code class="font-mono">22:00</code> → <code class="font-mono">00:00</code>).</td></tr>
      <tr><td><code class="font-mono">price</code></td><td>yes</td><td>number</td><td>Energy price in your configured currency per kWh (non-negative).</td></tr>
      <tr><td><code class="font-mono">day_type</code></td><td>no</td><td>string</td><td>One of: <code class="font-mono">all</code>, <code class="font-mono">weekdays</code>, <code class="font-mono">weekends</code>. Default: <code class="font-mono">all</code>.</td></tr>
      <tr><td><code class="font-mono">name</code></td><td>no</td><td>string</td><td>Short label for UI / logs (e.g. <code class="font-mono">Night</code>, <code class="font-mono">Peak</code>).</td></tr>
    </tbody>
  </table>
</div>

<h4 class="h6 fw-semibold mt-3 mb-2"><code class="font-mono">day_type</code> values</h4>
<ul class="mb-3 ps-3">
  <li><code class="font-mono">all</code> — every day</li>
  <li><code class="font-mono">weekdays</code> — Monday–Friday</li>
  <li><code class="font-mono">weekends</code> — Saturday and Sunday</li>
</ul>

<h4 class="h6 fw-semibold mt-3 mb-2">Minimal example (two bands, all days)</h4>
<pre class="p-3 bg-body-secondary border rounded small overflow-x-auto mb-3"><code>[
  {
    "start": "22:00",
    "end": "06:00",
    "price": 0.1296,
    "day_type": "all",
    "name": "Off-peak"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.1609,
    "day_type": "all",
    "name": "Peak"
  }
]</code></pre>

<h4 class="h6 fw-semibold mt-3 mb-2">Example — different weekday / weekend prices</h4>
<pre class="p-3 bg-body-secondary border rounded small overflow-x-auto mb-3"><code>[
  {
    "start": "00:00",
    "end": "06:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Night"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.18,
    "day_type": "weekdays",
    "name": "Weekday day"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.15,
    "day_type": "weekends",
    "name": "Weekend day"
  },
  {
    "start": "22:00",
    "end": "00:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Evening"
  }
]</code></pre>

<h4 class="h6 fw-semibold mt-3 mb-2">Validation (summary)</h4>
<ul class="mb-3 ps-3">
  <li>At least one slot is required.</li>
  <li>Times must be valid 24 h <code class="font-mono">HH:MM</code>.</li>
  <li><code class="font-mono">price</code> must be a number ≥ 0.</li>
  <li><code class="font-mono">day_type</code>, if present, must be exactly one of the three allowed values.</li>
</ul>
<p class="text-secondary mb-0">The tariff engine matches the current local time and weekday against slots; overlapping rules depend on how slots are ordered and evaluated in code — keep your intent clear and avoid redundant overlaps when possible.</p>
</div>
`;

const FLOWHELP_ADV_SCHEDULE_REFERENCE_FR = `
<div class="flowhelp-schedule-ref small text-body">
<p class="text-secondary mb-3">Chaque <strong>créneau</strong> définit une plage horaire, un prix d’énergie (par kWh), les jours concernés et un libellé optionnel. L’intégration enregistre les créneaux en JSON : un <strong>tableau d’objets</strong> dans <code class="font-mono">schedule_slots</code> (données de l’entrée de configuration Home Assistant).</p>

<h4 class="h6 fw-semibold mt-3 mb-2">Structure JSON — référence des champs</h4>
<div class="table-responsive mb-3">
  <table class="table table-sm table-bordered align-middle mb-0">
    <thead class="table-light"><tr><th scope="col">Champ</th><th scope="col">Obligatoire</th><th scope="col">Type</th><th scope="col">Description</th></tr></thead>
    <tbody>
      <tr><td><code class="font-mono">start</code></td><td>oui</td><td>chaîne</td><td>Heure de début, <code class="font-mono">HH:MM</code> (24 h). Les secondes (<code class="font-mono">HH:MM:SS</code>) sont acceptées et normalisées en <code class="font-mono">HH:MM</code>.</td></tr>
      <tr><td><code class="font-mono">end</code></td><td>oui</td><td>chaîne</td><td>Heure de fin, même format. <strong><code class="font-mono">00:00</code> signifie minuit en <em>fin</em> de journée</strong> (équivalent 24:00), pas minuit au début. À utiliser pour les plages qui passent minuit (ex. <code class="font-mono">22:00</code> → <code class="font-mono">00:00</code>).</td></tr>
      <tr><td><code class="font-mono">price</code></td><td>oui</td><td>nombre</td><td>Prix de l’énergie, dans la devise configurée, par kWh (≥ 0).</td></tr>
      <tr><td><code class="font-mono">day_type</code></td><td>non</td><td>chaîne</td><td>L’une des valeurs : <code class="font-mono">all</code>, <code class="font-mono">weekdays</code>, <code class="font-mono">weekends</code>. Défaut : <code class="font-mono">all</code>.</td></tr>
      <tr><td><code class="font-mono">name</code></td><td>non</td><td>chaîne</td><td>Libellé court pour l’UI / les journaux (ex. <code class="font-mono">Night</code>, <code class="font-mono">Peak</code>).</td></tr>
    </tbody>
  </table>
</div>

<h4 class="h6 fw-semibold mt-3 mb-2">Valeurs de <code class="font-mono">day_type</code></h4>
<ul class="mb-3 ps-3">
  <li><code class="font-mono">all</code> — tous les jours</li>
  <li><code class="font-mono">weekdays</code> — lundi à vendredi</li>
  <li><code class="font-mono">weekends</code> — samedi et dimanche</li>
</ul>

<h4 class="h6 fw-semibold mt-3 mb-2">Exemple minimal (deux plages, tous les jours)</h4>
<pre class="p-3 bg-body-secondary border rounded small overflow-x-auto mb-3"><code>[
  {
    "start": "22:00",
    "end": "06:00",
    "price": 0.1296,
    "day_type": "all",
    "name": "Off-peak"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.1609,
    "day_type": "all",
    "name": "Peak"
  }
]</code></pre>

<h4 class="h6 fw-semibold mt-3 mb-2">Exemple — tarifs jour de semaine / week-end différents</h4>
<pre class="p-3 bg-body-secondary border rounded small overflow-x-auto mb-3"><code>[
  {
    "start": "00:00",
    "end": "06:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Night"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.18,
    "day_type": "weekdays",
    "name": "Weekday day"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.15,
    "day_type": "weekends",
    "name": "Weekend day"
  },
  {
    "start": "22:00",
    "end": "00:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Evening"
  }
]</code></pre>

<h4 class="h6 fw-semibold mt-3 mb-2">Validation (résumé)</h4>
<ul class="mb-3 ps-3">
  <li>Au moins un créneau est requis.</li>
  <li>Les heures doivent être valides en 24 h (<code class="font-mono">HH:MM</code>).</li>
  <li><code class="font-mono">price</code> doit être un nombre ≥ 0.</li>
  <li>Si <code class="font-mono">day_type</code> est présent, il doit être exactement l’une des trois valeurs autorisées.</li>
</ul>
<p class="text-secondary mb-0">Le moteur tarifaire confronte l’heure locale et le jour de la semaine aux créneaux ; le comportement en cas de chevauchement dépend de l’ordre et de l’évaluation dans le code — gardez une intention claire et évitez les recouvrements redondants lorsque c’est possible.</p>
</div>
`;

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
    body_html: `<p>For non-EDF suppliers, <strong>automatic tariff retrieval is not available yet</strong>. This step confirms the manual path; choose <strong>Continue</strong> to enter contract details and then your prices yourself.</p>`,
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
    body_html: `<p>The wizard asks whether you want <strong>form</strong> or <strong>JSON</strong> mode for the advanced schedule (manual tariff).</p>
<ul class="ps-3 mb-3">
  <li><strong>Form</strong> — up to <strong>6</strong> slots with time pickers, price, day type, and optional name (no raw JSON).</li>
  <li><strong>JSON</strong> — paste a full array (same object shape as the form); use this for more than six slots or bulk edits.</li>
</ul>
<p class="mb-0">The <strong>Schedule (form)</strong> section below explains how to fill the time-slot sections. The <strong>Schedule (JSON)</strong> section has the full field reference, examples, and validation details for advanced or bulk edits.</p>`,
  },
  manual_schedule_form: {
    title: "Manual — schedule (form)",
    body_html: `<p>This step is a <strong>form</strong> (no raw JSON). You get up to <strong>six</strong> collapsible sections — typically labelled like <em>Time slot 1</em> … <em>Time slot 6</em> — plus an optional <strong>monthly subscription</strong> field at the bottom.</p>

<h4 class="h6 fw-semibold mt-3 mb-2">Per slot</h4>
<ul class="ps-3 mb-3">
  <li><strong>Start</strong> and <strong>End</strong> — use the time controls; format is 24&nbsp;h (<code class="font-mono">HH:MM</code>). For a range that crosses midnight, set the end to <code class="font-mono">00:00</code>: in this integration that means <strong>midnight at the end of the day</strong> (not the start), e.g. <code class="font-mono">22:00</code> → <code class="font-mono">00:00</code> for an overnight band.</li>
  <li><strong>Energy price</strong> — price per kWh in your configured currency (non-negative).</li>
  <li><strong>Day type</strong> — <em>All days</em>, <em>Weekdays</em> (Mon–Fri), or <em>Weekends</em> (Sat–Sun).</li>
  <li><strong>Label</strong> — optional short name (e.g. “Peak”, “Night”) for clarity in the UI or logs.</li>
</ul>

<h4 class="h6 fw-semibold mt-3 mb-2">How rows are used</h4>
<ul class="ps-3 mb-3">
  <li>A section with <strong>both</strong> start and end left empty is <strong>ignored</strong> — you do not need to fill every slot.</li>
  <li>If you enter only one of start or end, the form will show an error (incomplete row).</li>
  <li>You need <strong>at least one</strong> complete slot (start, end, and a valid price) for validation to succeed.</li>
</ul>

<p class="text-secondary mb-0">Need <strong>more than six</strong> slots, or a copy-paste JSON workflow? Use the <strong>Schedule (JSON)</strong> step instead — see that section below for the exact stored field names and examples.</p>`,
  },
  manual_schedule_json: {
    title: "Manual — schedule (JSON)",
    body_html: `<p class="text-secondary mb-3">Paste or edit a JSON <strong>array of slot objects</strong> in <code class="font-mono">schedule_slots</code>. Prefer JSON when you need <strong>more than six</strong> slots or copy/paste between instances. The format is identical to what the form produces.</p>
${FLOWHELP_ADV_SCHEDULE_REFERENCE_EN}`,
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

  options_init: {
    title: "Options — menu",
    body_html: `<p>Entry point for <strong>Configure</strong> after the integration is installed. Pick a topic (offer, grid, solar, batteries, Tempo, reinjection tuning, delta caps, …) without walking the entire first-run wizard.</p>`,
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
  options_reinjection: {
    title: "Options — reinjection tuning",
    body_html: `<p>Optional expert thresholds (W, seconds, ratios, SOC fraction) for classifying grid export, solar contribution, battery charge significance, and short “switch latency” spikes. Stored in integration options; adjust only when debugging mis-tagged reinjection diagnostics.</p><p class="text-secondary small mb-0">How the numbers map to code paths, the dynamic export bar, and example situations by diagnostic category: ${DOC_INTERNALS_REINJECTION}.</p>`,
  },
  options_advanced_energy: {
    title: "Options — energy delta caps",
    body_html: `<p>Each number is the <strong>maximum positive kWh step</strong> the hub will book in <em>one update</em> for that meter class. If the physical counter jumped further while Home Assistant was away (or a bad sample spiked), anything above the cap is <strong>skipped for internal</strong> slot and cost totals — the stored raw reading still moves forward so the next delta stays consistent.</p>
<ul class="ps-3 mb-3 text-secondary small">
<li><strong>Grid import &amp; export</strong> — one shared ceiling for both directions on the grid energy entities you picked in Grid / tri steps.</li>
<li><strong>Solar production</strong> — applies to the PV <code class="font-mono">total_increasing</code> kWh entity.</li>
<li><strong>Battery in &amp; out</strong> — each configured pack: charge and discharge counters are checked separately against this cap.</li>
<li><strong>Other energy meters</strong> — fallback for any other hub-tracked source that is not grid, solar, or those battery counters.</li>
</ul>
<p class="text-secondary small mb-0">End-to-end mechanics, default ceilings, and outage/spike walk-throughs: ${DOC_INTERNALS_DELTA_CAPS}. Shorter user-facing notes: ${DOC_DELTA}.</p>`,
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
    body_html: `<p>Turn battery tracking on or off. When it stays on and at least one system is saved, you can pick a pack to edit, add another, or remove one from the picker step.</p>`,
  },
  options_battery_pick: {
    title: "Options — pick battery",
    body_html: `<p>Shown when at least one battery exists: choose which system to edit, turn on <strong>Add a new battery</strong> to start a blank row, or turn on <strong>Delete the selected battery</strong> to remove the highlighted entry and save (you cannot combine delete and add-new on the same submit). Removing the last battery also turns battery support off.</p>`,
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
    body_html: `<p>Pour les fournisseurs autres qu’EDF, <strong>la récupération automatique des tarifs n’est pas encore disponible</strong>. Cette étape confirme le parcours manuel : choisissez <strong>Continuer</strong> pour le contrat puis la saisie des prix.</p>`,
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
    body_html: `<p>L’assistant demande si vous préférez le <strong>formulaire</strong> ou la saisie <strong>JSON</strong> pour le calendrier avancé (tarif manuel).</p>
<ul class="ps-3 mb-3">
  <li><strong>Formulaire</strong> — jusqu’à <strong>6</strong> créneaux : heures début/fin, prix, type de jour, nom optionnel (sans JSON brut).</li>
  <li><strong>JSON</strong> — collez un tableau complet (même structure d’objets que le formulaire) ; utile au-delà de six créneaux ou pour copier/coller en masse.</li>
</ul>
<p class="mb-0">La section <strong>Calendrier (formulaire)</strong> ci-dessous explique comment remplir les créneaux. La section <strong>Calendrier (JSON)</strong> contient la référence complète des champs, des exemples et le détail des règles de validation pour les cas avancés ou les gros copier-coller.</p>`,
  },
  manual_schedule_form: {
    title: "Manuel — calendrier (formulaire)",
    body_html: `<p>Cette étape est un <strong>formulaire</strong> (pas de JSON brut). Vous avez jusqu’à <strong>six</strong> blocs repliables — en général intitulés du type <em>Créneau horaire 1</em> … <em>Créneau horaire 6</em> — et en bas un champ optionnel d’<strong>abonnement mensuel</strong>.</p>

<h4 class="h6 fw-semibold mt-3 mb-2">Pour chaque créneau</h4>
<ul class="ps-3 mb-3">
  <li><strong>Début</strong> et <strong>Fin</strong> — sélecteurs d’heure au format 24&nbsp;h (<code class="font-mono">HH:MM</code>). Pour une plage qui passe minuit, mettez la fin à <code class="font-mono">00:00</code> : ici cela signifie <strong>minuit en fin de journée</strong> (et non le début du jour), par ex. <code class="font-mono">22:00</code> → <code class="font-mono">00:00</code> pour une plage de nuit.</li>
  <li><strong>Prix de l’énergie</strong> — prix au kWh dans votre devise (≥ 0).</li>
  <li><strong>Type de jour</strong> — <em>Tous les jours</em>, <em>Jours de semaine</em> (lun–ven) ou <em>Week-ends</em> (sam–dim).</li>
  <li><strong>Libellé</strong> — nom court optionnel (ex. « Heures pleines », « Nuit »).</li>
</ul>

<h4 class="h6 fw-semibold mt-3 mb-2">Utilisation des lignes</h4>
<ul class="ps-3 mb-3">
  <li>Un bloc où <strong>début et fin sont vides</strong> est <strong>ignoré</strong> — inutile de remplir les six.</li>
  <li>Si vous ne renseignez qu’une seule des deux heures, le formulaire signale une erreur (ligne incomplète).</li>
  <li>Il faut <strong>au moins un</strong> créneau complet (début, fin et prix valide) pour valider.</li>
</ul>

<p class="text-secondary mb-0">Au-delà de <strong>six</strong> créneaux ou pour travailler en JSON copier-coller, utilisez l’étape <strong>Calendrier (JSON)</strong> — voir la section correspondante ci-dessous pour les noms de champs stockés et des exemples.</p>`,
  },
  manual_schedule_json: {
    title: "Manuel — calendrier (JSON)",
    body_html: `<p class="text-secondary mb-3">Collez ou éditez un <strong>tableau JSON d’objets créneau</strong> dans <code class="font-mono">schedule_slots</code>. Préférez le JSON pour <strong>plus de six</strong> créneaux ou la duplication entre instances. Le format est identique à celui produit par le formulaire.</p>
${FLOWHELP_ADV_SCHEDULE_REFERENCE_FR}`,
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

  options_init: {
    title: "Options — menu",
    body_html: `<p>Point d’entrée du menu <strong>Configurer</strong> après installation : choisir un thème (offre, réseau, solaire, batteries, Tempo, réinjection, deltas, …) sans refaire tout l’assistant initial.</p>`,
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
  options_reinjection: {
    title: "Options — réglages réinjection",
    body_html: `<p>Seuils experts optionnels (W, secondes, ratios, fraction SOC) pour classer l’export réseau, la part solaire, la charge batterie « significative » et les courts pics de « latence ». Stockés dans les options de l’intégration ; à n’ajuster que pour diagnostiquer une mauvaise étiquette de réinjection.</p><p class="text-secondary small mb-0">Lien entre seuils et chemins dans le code, barre dynamique d’export, exemples par catégorie de diagnostic : ${DOC_INTERNALS_REINJECTION_FR}.</p>`,
  },
  options_advanced_energy: {
    title: "Options — plafonds de delta",
    body_html: `<p>Chaque valeur est le <strong>plus grand pas positif en kWh</strong> que le hub enregistre <em>en une mise à jour</em> pour cette classe de compteur. Si le compteur physique a sauté davantage (Home Assistant arrêté, échantillon aberrant), la partie au-dessus du plafond est <strong>ignorée pour les totaux internes</strong> par créneau et coût — la lecture brute conservée avance quand même pour que le prochain delta reste cohérent.</p>
<ul class="ps-3 mb-3 text-secondary small">
<li><strong>Réseau import &amp; export</strong> — plafond commun aux deux sens sur les entités réseau choisies (mono / tri).</li>
<li><strong>Production solaire</strong> — s’applique au compteur kWh <code class="font-mono">total_increasing</code> de production PV.</li>
<li><strong>Batteries (charge &amp; décharge)</strong> — pour chaque pack configuré, les compteurs charge et décharge sont contrôlés séparément par rapport à ce plafond.</li>
<li><strong>Autres compteurs d’énergie</strong> — valeur de repli pour toute autre source suivie par le hub hors réseau, PV et ces compteurs batterie.</li>
</ul>
<p class="text-secondary small mb-0">Mécanique complète, plafonds par défaut et exemples (coupures, pics) : ${DOC_INTERNALS_DELTA_CAPS_FR}. Notes plus courtes sur la doc principale : ${DOC_DELTA_FR}.</p>`,
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
    body_html: `<p>Activer ou désactiver le suivi batteries. S’il reste actif et qu’au moins un système est enregistré, vous pouvez en choisir un à modifier, en ajouter un autre ou en supprimer un depuis l’écran de sélection.</p>`,
  },
  options_battery_pick: {
    title: "Options — choix de batterie",
    body_html: `<p>Affiché dès qu’au moins une batterie existe : choisissez la ligne à modifier, activez <strong>Ajouter une nouvelle batterie</strong> pour une saisie vide, ou activez <strong>Supprimer la batterie sélectionnée</strong> pour retirer l’entrée choisie et enregistrer (suppression et ajout ne peuvent pas être validés ensemble). Si vous supprimez la dernière batterie, le suivi batteries est désactivé.</p>`,
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
