# Hub Énergie

A Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.

It targets generic supplier and tariff setups, multi-battery systems, solar PV estimation (optional), and three-phase grid support.

**Home Assistant:** 2024.10.0 or newer (see `manifest.json`). **HACS:** the repo is structured for HACS (`hacs.json` with `content_in_root`, `brand/icon.png` per [HACS integration requirements](https://hacs.xyz/docs/publish/integration/)).

## Supported scope (v0.2.x)

**Intended to be stable**

- Config flow: supplier (EDF vs custom), tariff model (flat / HP–HC / multi-slot / EDF Tempo with RTE, API, or sensor), grid and optional solar/battery entity wiring; validation and selectors aligned with runtime expectations (see changelog).
- Positive energy deltas from `total_increasing` meter entities → internal slot-day accounting (Paris day) and integration-owned SSOT total sensors.
- Daily cost estimate (€) from configured rates + subscription split; per-slot breakdown in attributes.
- EDF Tempo helpers (when applicable): colours, quotas, next change timestamps.
- Diagnostics: export / réinjection split, data quality, delta telemetry, unknown bucket and staleness sensors; **overall health** sensor with synthetic **trust** states (`ok` / `degraded` / `rebuilding` / `inconsistent`) and a readable **cause**.
- Optional clear-sky PV estimation and solar resale revenue line (when configured).
- Lovelace card served from `/hub_energie/` after build.

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

## Installation

This repository **is** the contents of the `hub_energie` integration package. You must install it **exactly** under:

`<config directory>/custom_components/hub_energie/`

So that Home Assistant loads `custom_components/hub_energie/manifest.json` (not a nested copy such as `custom_components/hub_energie/hub_energie/`).

**Ways to install**

1. **HACS (custom repository)** — In HACS: open the menu (⋮) → **Custom repositories** → add your repository URL → category **Integration** → **Add**. Then open **HACS → Integrations**, find **Hub Énergie**, and **Download**. HACS installs the package under `custom_components/hub_energie/` (root-of-repo layout is enabled via `content_in_root` in `hacs.json`). After install, restart Home Assistant, then add the integration under **Settings → Devices & services**. If you use the Lovelace card, run `npm ci` and `npm run build` inside `custom_components/hub_energie/frontend/` on the host (same as a manual install). Listing in the default HACS store requires a public **GitHub** repo per [HACS publishing rules](https://hacs.xyz/docs/publish/start/); GitLab or other hosts still work for **manual** install or if your HACS version accepts them as custom repositories.
2. **Clone** this repo **into** `custom_components/hub_energie` (git clone URL `custom_components/hub_energie`), **or**
3. **Copy** the full tree from the repo root into `custom_components/hub_energie`, preserving all subfolders (`battery/`, `energy/`, `frontend/`, `runtime/`, `snapshot/`, `translations/`, etc.).

Do **not** cherry-pick only a few files: the integration is a single Python package split across many modules.

After copying or cloning:

1. If you use the Lovelace card, build the frontend bundle once: in `custom_components/hub_energie/frontend/` run `npm ci` (or `npm install`) then `npm run build`.
2. **Restart Home Assistant** (full restart, not only “Reload YAML”).
3. Add the integration: **Settings → Devices & services → Add integration → Hub Énergie**.

**Version:** see `manifest.json` (`version` field). For reproducible installs, use the Git tag matching that version (e.g. **v0.2.2**).

## Lovelace Card

The Vite bundle is written to `frontend/dist/` on disk, but Home Assistant serves those files at the **`/hub_energie/`** URL root: the static route maps the `dist` directory to `/hub_energie/`, so the public module URL is **`/hub_energie/hub-energie-card.js`**, not `/hub_energie/dist/hub-energie-card.js`. The integration registers this URL automatically.

If you add the resource manually, use the same URL (single bundled module):

```yaml
resources:
  - url: /hub_energie/hub-energie-card.js
    type: module
```

**Legacy dashboards:** if an older resource still points at `/hub_energie/dist/hub-energie-card.js`, remove it and add `/hub_energie/hub-energie-card.js` instead; the `/dist/` URL is not served.

Then add a card:

```yaml
type: custom:hub-energie-card
# Optional: override entity prefix (default: sensor.hub_energie_)
# entity_prefix: sensor.hub_energie_
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

Entity placement follows the measured or configured domain where possible (per-slot kWh, SSOT/today, power-flow, and split export lines on **Réseau** / **Solaire** / **Batteries (total)** / **Offre**); see the [0.2.2](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.0...0.2.2) notes in `CHANGELOG.md`.

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
