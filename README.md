**English** · [Français](README.fr.md)

# Hub Énergie

**Home Assistant · custom integration** — tariffs, time slots, costs, grid / solar / batteries, with diagnostics that stay readable when data is messy.

[![Minimum Home Assistant](https://img.shields.io/badge/Home%20Assistant-%E2%89%A52024.10.0-41BDF5?logo=home-assistant&logoColor=white)](https://github.com/home-assistant/core/releases)
[![HACS-ready layout](https://img.shields.io/badge/layout-HACS%20custom%20component-1D1D1D?logo=github)](https://hacs.xyz/docs/publish/start/)

| | |
| :--- | :--- |
| **Explore (no install)** | **[Showcase + config flow simulator](https://hub-energie.ts-devops.com/showcase)** |
| **Full documentation** | **[hub-energie.ts-devops.com](https://hub-energie.ts-devops.com)** · [Setup & help](https://hub-energie.ts-devops.com/doc/setup-help) |
| **Issues** | [GitLab](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/issues) |
| **Releases** | [GitHub](https://github.com/zZCYPH/ha-hub-energie/releases) (mirror, HACS) · [GitLab](https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/releases) (upstream) |

> Deep-dive topics (SSOT vs meters, health states, recorder rebuilds, limitations) live on the site — this README stays a **quick orientation + install**.

---

## What you get (snapshot)

| Area | What Hub Énergie does |
| :--- | :--- |
| **Tariffs** | EDF or custom · flat, HP/HC, multi-slot, Tempo (RTE / API / sensor). Rates + subscription → **daily cost (€)** and per-slot detail in attributes. |
| **Energy** | Positive `total_increasing` deltas → Paris-day slots, long-term stats, integration **SSOT** totals that match internal accounting. |
| **Hardware** | Single- or three-phase grid · optional export & solar · **0…N** batteries · optional clear-sky PV estimate + resale line. |
| **Diagnostics** | Health / trust style signals, staleness, unknown bucket, rebuild hints — **plain-language `cause`**, not only a green LED. |
| **UI** | **Lovelace** card + live flow card · bundles in `frontend/dist/`, served by HA at **`/hub_energie/`** (no Node on the appliance for a normal install). |

**Experimental / best-effort** (where enabled): power-flow battery attribution, PV model, opportunity-cost style hints — see changelog & site for boundaries.

---

## Install

**Requirement:** Home Assistant **2024.10** or newer (`manifest.json`).

1. Get the integration tree under `custom_components/hub_energie/` onto your host (see below).
2. **Restart** Home Assistant (full restart).
3. **Settings → Devices & services → Add integration → Hub Énergie**.

### HACS (custom repository)

HACS → ⋮ → **Custom repositories** → URL: **`https://github.com/zZCYPH/ha-hub-energie`** → category **Integration**, then install from the UI.  
*(Default store listing is separate — see [HACS publish / include](https://hacs.dev/docs/publish/include).)*

### ZIP (GitHub or GitLab)

Download a release ZIP and extract it at the **root** of your HA config (next to `configuration.yaml`) so you obtain:

`config/custom_components/hub_energie/manifest.json`

Do **not** copy `site/`, `tests/`, or `scripts/` into `config/` — only the `custom_components/hub_energie/` package.

### Brand icons (Home Assistant 2026.3+)

Icons ship in **`custom_components/hub_energie/brand/`** (local brands — no separate `home-assistant/brands` PR for new customs).

---

## Lovelace (minimal)

Storage-mode dashboards usually get the module resource automatically; for YAML-managed resources, point at the **boot** URL:

```yaml
resources:
  - url: /hub_energie/hub-energie-card-boot.js
    type: module
```

```yaml
type: custom:hub-energie-card
```

```yaml
type: custom:hub-energie-flow-card
```

More editor options, cache-busting, and legacy URL migration → **[site docs](https://hub-energie.ts-devops.com)**.

---

## Services

| Service | Purpose |
| :--- | :--- |
| `hub_energie.refresh` | Force a coordinator refresh |
| `hub_energie.refresh_tariffs` | Re-fetch EDF tariffs (when using auto mode) |

---

## Repo layout (for contributors)

| Path | Role |
| :--- | :--- |
| `custom_components/hub_energie/` | Integration loaded by Home Assistant |
| `site/` | Vite marketing / docs site (GitLab Pages & public vitrine — **not** part of the HA install) |
| `.github/workflows/` | GitHub Actions (verify `hacs` branch, tagged releases) |
| `.gitlab-ci.yml` | GitLab CI (pages, releases, catalog checks) |

---

## License

Use and redistribution are governed by the license file(s) shipped with this repository.
