# Hub Énergie

A Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.

It targets generic supplier and tariff setups, multi-battery systems, solar PV estimation (optional), and three-phase grid support.

**Visit the showcase site** at **[hub-energie.ts-devops.com](https://hub-energie.ts-devops.com)** for a guided overview, the documentation snapshot, and implementation notes—it is the easiest way to **explore** Hub Énergie before installing the integration in Home Assistant.

**Home Assistant:** 2024.10.0 or newer (see `custom_components/hub_energie/manifest.json`). **Install today:** download a **[GitLab release ZIP](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases)** and extract it so `custom_components/hub_energie/` sits under your config, or use **git clone** / **copy** of that folder tree (see [Installation](#installation)). Hub Énergie is **not in the default HACS catalogue** yet—the project lives on **GitLab**, while HACS is largely built around **GitHub**, so there is **no one-click store install** for now. The repo still includes `hacs.json` and `brand/` for a possible future listing; treat them as preparatory, not as a supported install path. The **`site/`** folder is the **Vue + Vite** static documentation built in CI for **GitLab Pages** (same content as the showcase above); it is not loaded by Home Assistant.

## Supported scope (v0.3.x)

**Intended to be stable**

- Config flow: supplier (EDF vs custom), tariff model (flat / HP–HC / multi-slot / EDF Tempo with RTE, API, or sensor), grid and optional solar/battery entity wiring; validation and selectors aligned with runtime expectations (see changelog).
- Positive energy deltas from `total_increasing` meter entities → internal slot-day accounting (Paris day) and integration-owned SSOT total sensors.
- Daily cost estimate (€) from configured rates + subscription split; per-slot breakdown in attributes.
- EDF Tempo helpers (when applicable): colours, quotas, next change timestamps.
- Diagnostics: export / réinjection split, data quality, delta telemetry, unknown bucket and staleness sensors; **overall health** sensor with synthetic states (`ok` / `degraded` / `rebuilding` / `inconsistent` / `no_input`) and a readable **cause**.
- Optional clear-sky PV estimation and solar resale revenue line (when configured).
- Lovelace card: pre-built bundles in `frontend/dist/` are versioned; HA serves them at `/hub_energie/`.

**Experimental / best-effort**

- Power-flow–based battery charge origin split when sensors are partial or noisy.
- Solar production estimation (model-based, not a physical meter).
- Opportunity-cost diagnostics for exported kWh.

The README **features** section below is descriptive, not a warranty: behaviour depends on your hardware and entity choice (especially for the Energy panel).

## Features

- **Generic supplier support**: EDF (with auto-tariff fetch) and manual configuration for any other provider
- **Flexible tariff models**: flat, time-of-use (HP/HC), advanced multi-slot schedule
- **Multi-phase grid**: single-phase and three-phase support with per-phase or total sensors
- **Multi-battery systems**: 0..N independent battery/inverter monitoring with aggregation
- **Solar PV estimation**: optional clear-sky production estimator with multi-array support and aging model
- **Solar resale tracking**: export revenue computation when a re-sale contract is configured
- **Energy balance**: per-slot kWh tracking, usage flow attribution, origin breakdown (optional **per-slot sensors** for grid / solar / batteries / maison — `unknown` bucket disabled by default)
- **Cost analysis**: daily cost computation, subscription proration, savings calculation
- **Diagnostics**: reinjection classification, export attribution, health monitoring
- **Lovelace card**: forked card with battery SOC bar, ETA to full/empty, refactored to LitElement

## Data sources (SSOT)

Understanding what is authoritative avoids misconfiguring the Energy Dashboard or scraping the wrong attributes:

1. **Physical meters (external SSOT)** — The energy entities you select in the integration (`grid_import_energy`, `solar_energy`, export, per-battery in/out). Their recorder history is the ground truth for **total** kWh from hardware or upstream integrations.
2. **Internal accounting** — The coordinator accumulates **positive deltas** from those entities into `totals_kwh_by_source` and per-day `slot_day_kwh` (including a dedicated `unknown` bucket when the tariff slot cannot be resolved without dropping energy). The integration’s **`total_increasing` SSOT sensors** reflect this internal sum, not a live re-read of the meter state each update.
3. **Long-term per-slot kWh (daily)** — After each Paris day, the integration writes **external statistics** (`hub_energie:slot_<source>_<slot>_kwh`) via the recorder. Use these (or the physical meters) for historical analytics—not raw `cost_detail` attribute history, which is sampled and mixed with UI/diagnostic fields.

Optional observability on the **health** and **`cost_detail`** sensors includes synthetic **`trust_level`** / **`trust_cause`**, `data_quality`, `delta_telemetry`, and `delta_discards` (per-source last applied delta, gap, drift vs meter, attribution method).

## Limitations

The integration is designed to be transparent when data is imperfect. The points below match actual behaviour in code—not edge cases invented for the docs.

- **Recorder history and retention** — Anything that reads HA history or **long-term statistics** (per-slot kWh stats, the Lovelace card’s historical views, and **rebuilding internal totals from the recorder** when the integration store is missing or invalid) only sees what the recorder still holds. Shorter **purge / retention** means less past data for charts, analytics, and recovery paths.
- **Solar estimation (optional)** — When enabled, PV power and energy are **clear-sky model outputs** (simplified irradiance, no real cloud cover). Treat them as **indicative**, not a substitute for a production meter.
- **Power graph on the Lovelace card** — The card loads past power curves via **`recorder/statistics_during_period`** on the configured power entities. If statistics are missing (e.g. entity without a suitable **`state_class`**, or not enough history yet), the graph can be empty or incomplete; the card reports that case in plain language.
- **Health / trust states** — The **`…_health`** sensor can read **`ok`**, **`degraded`**, **`rebuilding`**, **`inconsistent`**, or **`no_input`**. They summarise probes, delta telemetry, staleness, optional missing entities, Tempo/RTE readiness, battery data quality, unknown tariff bucket usage, and **store vs recorder rebuild**—not a single physical fault. **`rebuilding`** is expected briefly after a **recorder-based rebuild** of internal kWh state.
- **When some numbers are withheld** — If the grid import counter is not readable, **`no_input`** applies and **specific** grid/cost-adjacent sensors hide their numeric state (grid SSOT total, grid/home “today” kWh, savings). When trust is **`inconsistent`**, `input_status` is **`error`** and the same **sensor-level** protections apply. The main **“Coût du jour”** entity can still show a value from internal accounting — use **`…_health`** and **`input_status`** before trusting it. Details: [`custom_components/hub_energie/docs/troubleshooting.md`](custom_components/hub_energie/docs/troubleshooting.md).
- **Partial operation** — Solar, export, batteries, and many sensors are **optional**. Missing or unavailable optional entities contribute to **degraded** diagnostics, but the coordinator can still refresh what it can. A readable **grid import** energy entity remains central to slot/cost logic.
- **Power vs energy** — **Energy** SSOT totals are accumulated and persisted (store + statistics writes). **Instantaneous power** and power-flow views are derived from the latest coordinator cycle; they are not stored the same way as kWh totals.
- **Experimental paths** — Items listed under **Experimental / best-effort** in *Supported scope* (e.g. power-flow-based battery split, opportunity-cost style diagnostics) can be noisy or incomplete when inputs are partial.

### Measured, reconstructed, estimated (quick glossary)

| Kind | Meaning |
|------|--------|
| **Measured** | Values taken from **your configured Home Assistant entities** (e.g. `total_increasing` kWh meters, power sensors where you wired them). |
| **Reconstructed** | **Internal** running totals and per-slot kWh built from **positive deltas** on those meters, plus—if needed—**replay from recorder long-term statistics** for past days when the integration store could not be loaded. |
| **Estimated** | **Model-based** solar (clear-sky PV) and other **best-effort** derivations where no direct meter exists or where experimental logic fills gaps. |

### Troubleshooting (trust, recovery, unknown bucket)

For a concrete guide to **`…_health`** states (`ok` / `degraded` / `rebuilding` / `inconsistent` / `no_input`), the tariff **`unknown`** bucket, measured vs reconstructed vs estimated energy, and **store / recorder** recovery paths, see **[`custom_components/hub_energie/docs/troubleshooting.md`](custom_components/hub_energie/docs/troubleshooting.md)**.

## Installation

The integration package in this repository lives under **`custom_components/hub_energie/`**. You must install **that folder’s contents** **exactly** under:

`<config directory>/custom_components/hub_energie/`

So that Home Assistant loads `custom_components/hub_energie/manifest.json` (not a nested copy such as `custom_components/hub_energie/hub_energie/`). Ignore `site/`, `tests/`, `scripts/`, and other repo-only paths when copying to Home Assistant.

**Ways to install**

1. **Release ZIP (simplest)** — On [GitLab Releases](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases), download the archive for the version you want. Unzip at the **root** of your Home Assistant configuration directory (the folder that contains `configuration.yaml`) so you get `config/custom_components/hub_energie/` with `manifest.json` at that path (not nested `hub_energie/hub_energie/`).
2. **Clone** this repository, then copy **`custom_components/hub_energie/`** from the clone into your Home Assistant `config/custom_components/hub_energie/` (replace or merge as needed).
3. **Copy** only the tree under `custom_components/hub_energie/` from this repository into `custom_components/hub_energie/` on your host, preserving all subfolders (`battery/`, `energy/`, `frontend/`, `runtime/`, `snapshot/`, `translations/`, etc.).

**HACS store** — Hub Énergie is **not** in the default HACS catalogue. The ecosystem is mainly **GitHub**-centric ([publishing](https://hacs.xyz/docs/publish/start/)), so you cannot install it like a mainstream HACS integration today. Use **ZIP**, **clone**, or **copy** above. If your HACS version allows a **custom repository** with a GitLab URL, you can try that under (⋮) → **Custom repositories** → **Integration**; results vary by version and this is **best-effort**, not a supported primary path.

Do **not** cherry-pick only a few files: the integration is a single Python package split across many modules.

After any install method:

1. **Restart Home Assistant** (full restart, not only “Reload YAML”).
2. Add the integration: **Settings → Devices & services → Add integration → Hub Énergie**.

The Lovelace bundles in `frontend/dist/` are committed (rebuilt in CI), so you do **not** need Node/npm on the HA host for a normal install.

**Card frontend:** `frontend/dist/` is included in the repository. You only need `npm ci` / `npm run build` under `custom_components/hub_energie/frontend/` if you change the card source locally.

**Version:** see `custom_components/hub_energie/manifest.json` (`version` field). For reproducible installs, use a Git tag whose name is **`v`** plus that exact value (for example version `0.3.3` → tag **`v0.3.3`**).

## Lovelace Card

CI rebuilds the Vite bundle on each commit; **`hub-energie-card-boot.js`** (shell, registered as `hub-energie-card`), **`hub-energie-card.js`**, **`hub-energie-card-editor.js`**, the live **`hub-energie-flow-card.js`** chunk and any shared chunks under `frontend/dist/` are **checked in**. Home Assistant serves the whole `dist` folder at **`/hub_energie/`**.

**Solar production (kWh)** — Since **v0.2.3**, the card can show an optional **“Production solaire (énergie)”** bar (editor: **Barre production solaire**; YAML: `show_solar_production_bar`, default on). It appears in the **Consumption** section, under the grid-import strip, and splits the selected day/range into self-use, solar-to-battery charging, and attributed PV export (see `CHANGELOG.md`).

**Lovelace resources (storage mode):** On startup (and when you **reload** the integration) the integration adds or **updates** **`/hub_energie/hub-energie-card-boot.js?v=…`** as a **JavaScript module** resource (same as *Settings → Dashboards → Resources*). The query string **cache-busts** the boot script and the main card chunk after you deploy new `dist/` files. Legacy `frontend.add_extra_js_url` registration is removed on load.

If Lovelace resources are **YAML-managed**, add the URL yourself under `lovelace.resources`:

If you add the resource manually (optional when using storage mode), use the boot URL:

```yaml
resources:
  # Optional ?v=… query avoids stale browser cache after upgrading dist/ (storage mode does this automatically).
  - url: /hub_energie/hub-energie-card-boot.js?v=1
    type: module
```

**Legacy dashboards:** replace old URLs such as `/hub_energie/dist/hub-energie-card.js` or a standalone `/hub_energie/hub-energie-card.js` resource with **`/hub_energie/hub-energie-card-boot.js`** so the loader runs first; keep no duplicate module entries for the same card.

Then add a card:

```yaml
type: custom:hub-energie-card
# Optional: hide sections (all true by default), e.g. show_reinjection: false, show_solar_production_bar: false
```

The integration also exposes two helper entities for Lovelace cards:

- `sensor.hub_energie_frontend_data` for high-churn live power/flow attributes
- `sensor.hub_energie_frontend_meta` for lower-churn card metadata

You can use them through the dedicated live flow card:

```yaml
type: custom:hub-energie-flow-card
# Optional: layout: auto | full | compact
# Optional: title: Hub Énergie
```

## Device Model

The integration creates one HA device per logical scope:

| Device | Purpose |
|--------|---------|
| **Offre** | Tariff, supplier, contract configuration |
| **Réseau** | Grid energy/power sensor configuration |
| **Solaire** | Solar measurement/estimation configuration |
| **Batterie \<name\>** | Per-battery system (0..N) |
| **Batteries (total)** | Aggregated battery summary |
| **Bilan énergétique** | Computed energy flows (kWh only) |
| **Coûts** | Computed monetary values (€) |
| **Diagnostics** | Health, reinjection diagnostics |

Entity placement follows the measured or configured domain where possible (per-slot kWh, SSOT/today, power-flow, and split export lines on **Réseau** / **Solaire** / **Batteries (total)** / **Offre**); see [0.2.3](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.2...0.2.3) and [0.2.2](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.0...0.2.2) in `CHANGELOG.md`.

## Configuration Flow

1. **Supplier** — EDF or custom provider
2. **Phase type** — single-phase or three-phase
3. **Tariff** — auto-fetch (EDF) or manual (flat/TOU/schedule)
4. **Contract** — power (kVA), name
5. **Grid sensors** — import energy (required), export, power
6. **Solar** — energy, power, resale contract, PV estimation
7. **Batteries** — per-battery energy in/out, optional power/SOC/capacity

## Services

| Service | Description |
|---------|-------------|
| `hub_energie.refresh` | Force coordinator refresh |
| `hub_energie.refresh_tariffs` | Re-fetch EDF tariffs (auto mode) |

## License

Subject to the license terms under which you obtained this repository.
