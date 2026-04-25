# Changelog

All notable changes to **Hub Énergie** are documented in this file.

## Unreleased

### Lovelace card / savings

- **Daily solar savings (`eco_solar`)** now uses **PV self-consumption at home** (production minus solar-to-battery attribution and grid export per slot), avoiding double-count with battery savings and export.
- **Consumption** header **Total energy**: tooltip clarifies that the figure is **energy delivered to the home** (grid + slot-attributed solar + battery discharge), excluding energy used only for battery charging.

## [0.5.7] — 2026-04-25

### Lovelace — hub card & power flow

- **Stable entity IDs** (slug from `unique_id`) with migration **v6/v7**; **`site_slug`** in setup/options, **Site** device, and **`card_entity_ids`** / Lovelace payload sensor for reliable YAML.
- **Multi-site UX**: site index selector (`card_site_index`), site segment in subtitle, frontend sensors resolved with **site segment** (`hub_energie_<seg>_…`), editor bundle **no longer embedded** in `hub-energie-card.js`.
- **Power flow card**: square **1:1** viewport, clearer layout, hierarchy & focus, **SVG** node icons, skeleton loading, optional **glass** panel + shadow, animated cable highlight, **live data age** and value transitions; **Tempo** grouping under **Offre**; **bridge** title polish.
- **Costs / energy semantics**: **total energy** and **daily solar savings (`eco_solar`)** aligned with **in-home** usage (avoid double-count with battery / export); consumption “total energy” documents **energy delivered to the home**.

### Config flow / vitrine

- Flow catalog & step-help updates for **site** / **`site_slug`**; GitHub **release ZIP** parity for the doc site; **CHANGELOG** page on the vitrine; pre-release ZIP list gated behind a **disclaimer** modal.

## [0.5.4] — 2026-04-22

### Distribution / docs

- **HACS / GitHub releases** path for downloadable ZIPs; branding & **README** refresh; **codeowners** fix.

## [0.5.3] — 2026-04-10

### Documentation site

- **History-mode routes** (`/showcase`, etc.), GitLab Pages **SPA fallback** + `_redirects`, **per-route SEO** (`headManager`).

## [0.5.2] — 2026-04-10

### Site / CI

- Router hardening, **Pages deploy** CI fix, minor **URI** cleanup.

## [0.5.1] — 2026-04-10

### Lovelace & config flow

- **Power flow card** UX pass (backdrop, radial nodes, **ROW_CY** layout, diagram polish); **solar** reconfigure split into clearer steps; **advanced** solar fixes in the options/config flow.
- **Setup-help** field guide stacks better on **mobile**.

### CI

- GitLab CI token / PAT adjustments for release & Pages jobs.

## [0.5.0] — 2026-04-10

### Lovelace

- First **live power flow** card (`hub-energie-flow-card`) and related **site** mockups / simulator wiring.

### Documentation site

- Stronger **landing / vitrine** layout, **service desk** surfacing, flow **step help** integration.

## [0.4.0] — 2026-04-09

### Configure (options) / vitrine parity

- **Re-injection** tuning restored under **Configure** (options flow) with **catalog + simulator parity**.
- **Second FlowSimulator** path for **existing config entries** (reconfigure menu).

### Documentation site

- **Mobile** readability pass on `/showcase`; flow help & **catalog** updates; `config-flow.md` slimmed to point at the interactive simulator.

## [0.3.3] — 2026-04-09

### Documentation / site

- Setup & options **step help** lists **per-field explanations** (generated from integration `data_description` into `flowHelpFieldGuide.generated.json`). Expanded `data_description` coverage in `strings.json` and translations (EN/FR); vitrine catalog regenerated from the same strings.

### Config flow / UX

- Options **battery pick**: delete / add-new use **boolean toggles** instead of Yes/No dropdowns (simulator aligned).
- **Back** navigation on grid / tri / solar steps no longer blocked by Voluptuous `Required` energy fields; validation remains on **Continue** (`_wizard_step_energy_entity`).
- **Other supplier** tariff step restores the **manual-only / no automatic fetch** description text.

## [0.3.2] — 2026-04-08

### Documentation / site

- Doc site strings and raw HTML fragments take their **release version** from `custom_components/hub_energie/manifest.json` at build time (`{{HUB_ENERGIE_VERSION}}` / `{{HUB_ENERGIE_VERSION_SERIES}}` expanded by `site/scripts/sync-public.mjs` and the Vite plugin in `site/vite.config.js`).

## [0.3.1] — 2026-04-08

### Diagnostics / trust

- **Breaking:** The diagnostic **`…_health`** sensor no longer uses state `warning`. It is now an **enum** with **`ok`**, **`degraded`**, **`rebuilding`**, and **`inconsistent`**. Update automations and dashboards accordingly.
- Trust is computed from existing signals (data quality, delta telemetry and discards, unknown tariff bucket, staleness, Tempo RTE readiness, current slot, battery data quality, internal-vs-meter drift, and recorder store rebuild). Attributes **`trust_cause_code`** and **`trust_cause`** give a short primary reason; raw telemetry remains in the same entity attributes.
- Coordinator snapshot includes **`trust_level`**, **`trust_cause_code`**, and **`trust_cause`** for reuse (e.g. Lovelace card).

### Config flow, documentation site & CI

- **Per-step setup help** plus wizard **Previous** refactor so back navigation stays reliable.
- **README** links to the public showcase; **Home Assistant** backlinks & hero logo; footer refresh (social placeholders, tooltips).
- **`verify_vitrine_integration_docs.py`** (+ CI) to keep marketing copy aligned with `manifest.json` / `services.yaml`.
- **GitLab release job**: scrape the **package HTML page** to resolve **`package_files`** when the API cannot be used with the job token alone.

## [0.2.5] — 2026-04-07

### CI / release pipeline

- Harden **GitLab release** ZIP asset resolution (**`package_files`** listing, retries, and fallbacks) before the larger **0.3.x** documentation and trust work.

## [0.2.3] — 2026-04-07

### Lovelace card

- **Solar production bar (kWh):** optional strip (toggle **Barre production solaire** in the card editor) showing the same period as the card: self-consumed solar, solar used to charge the battery, and PV surplus attributed to grid export (diagnostic share — see reinjection; tooltip explains). Placed in the **Consumption** block under the grid-import strip. **`show_solar_production_bar`** in YAML (default on).
- **Grid import strip title:** the word **“couleur”** / **“day colour”** only appears for **Tempo**; Base and HP/HC use a shorter title (**Import Enedis par créneau** / **Grid import by slot**).
- **Cache busting:** in **storage** Lovelace mode, the integration **refreshes** the boot module resource URL with a new **`?v=<timestamp>`** on startup and when a config entry is set up or reloaded, so browsers pick up new `frontend/dist` bundles without a stale module cache. The boot loader passes the same `v` to the dynamic import of **`hub-energie-card.js`**. (**YAML** resources: append or bump `?v=` manually after deploying new JS.)

## [0.2.2] — 2026-04-04

### Long-term statistics (recorder)

- External per-slot kWh statistics now use **`TOTAL_INCREASING`** metadata and a **running cumulative `sum`** per `statistic_id`, matching Home Assistant counter semantics and avoiding blocked or inconsistent long-term statistics.
- **Recorder rebuild** from history distinguishes **monotonic cumulative** series (deltas between rows) from **legacy daily** rows (pre‑v0.2.2 `sum` behaviour); hydration restores **`lts_cumulative_kwh_by_statistic_id`** accordingly.
- Store payload preserves **`last_stable_attribution_slot`** when loading older snapshots.

### Entities & device registry

- **Device assignment** refactored: per-slot kWh, SSOT/today, power-flow, usage-flow, and split export diagnostics are attached to **Réseau**, **Solaire**, **Batteries (total)**, **Bilan énergétique**, **Offre**, or **Diagnostics** as appropriate (instead of lumping most under the energy-balance device).
- **EDF Tempo “heures creuses”** binary sensor moved to the **Offre** device.
- **Today kWh** helpers use `state_class: total` where applicable for clearer semantics.

### Config flow & validation

- Config flow and selector wiring hardened; validation and strings updated (EN/FR).

### Lovelace card

- **`shouldUpdate` / state key** hardened so invalid or non-serialisable Tempo payloads cannot throw and surface a generic HA “Configuration error”.

### Tooling

- **`scripts/deploy-integrations.sh`** and **`.deployignore`** added for deployment workflows.

## [0.2.0] — 2026-04-03

### Packaging

- Set manifest `version` to **0.2.0**; add `codeowners`, valid GitLab `documentation` and `issue_tracker` URLs.
- Set `integration_type` to **hub** and `iot_class` to **local_polling** (primary data: local Home Assistant entity states).
- Declare minimum Home Assistant version **2024.6.0** in manifest.

### Entities & Home Assistant semantics

- Monetary sensors use `device_class: monetary` and `native_unit_of_measurement: EUR` (constants from Home Assistant).
- Tempo / quota / colour / HC scheduling sensors are grouped under the **Diagnostics** device with `entity_category: diagnostic`.
- Reworked “next off-peak start” entity naming (French label, `has_entity_name`).
- **Per-slot kWh sensors** (grid / solar / battery charge & discharge / maison) are registered: default-enabled slots follow the selected offer; the `unknown` tariff bucket is exposed as **disabled by default**. Slot and maison sensors expose **`last_reset`** at Paris midnight for the snapshot day (long-term statistics / Energy semantics).
- Binary sensors: EDF Tempo uses `CONF_TARIFF_OFFER` consistently; off-peak renamed in French; solar “producing” no longer uses an invalid `device_class`.

### Observability

- Snapshot and **État général** (`health`) attributes include:
  - last delta **rejection** per source (reason, timestamp, optional raw/delta kWh);
  - grid **unknown** tariff bucket energy for the current Paris day;
  - **seconds since last applied** meter delta (any source).
- New diagnostic sensors: **Réseau — créneau indéterminé (jour en cours)** and **Délai depuis dernière mise à jour compteur**.

### Runtime

- Rejection telemetry is recorded in-memory when a delta is discarded (negative or unrealistic); intended for live debugging (not persisted in the JSON store after restart).

### Tests

- Added tests for staleness computation, rejection recording, and store hydration + apply invariants.

## [0.1.0] — earlier

- Initial public baseline (fork architecture, coordinator, snapshot pipeline, multi-battery, solar estimation, EDF Tempo paths).

[0.3.3]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.2.5...v0.3.1
[0.5.7]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.5.4...v0.5.7
[0.5.4]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/zZCYPH/ha-hub-energie/compare/v0.3.3...v0.4.0
[0.2.5]: https://github.com/zZCYPH/ha-hub-energie/releases/tag/v0.2.5
[0.2.3]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.2...0.2.3
[0.2.2]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.0...0.2.2
[0.2.0]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.1.0...0.2.0
[0.1.0]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/tree/0.1.0
