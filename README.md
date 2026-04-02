# Hub Énergie

A Home Assistant custom integration for energy monitoring, cost tracking, and diagnostics.

Fork of `edf_energy_tariffs` with a cleaner architecture, generic supplier support, multi-battery systems, solar PV estimation, and three-phase grid support.

## Features

- **Generic supplier support**: EDF (with auto-tariff fetch) and manual configuration for any other provider
- **Flexible tariff models**: flat, time-of-use (HP/HC), advanced multi-slot schedule
- **Multi-phase grid**: single-phase and three-phase support with per-phase or total sensors
- **Multi-battery systems**: 0..N independent battery/inverter monitoring with aggregation
- **Solar PV estimation**: optional clear-sky production estimator with multi-array support and aging model
- **Solar resale tracking**: export revenue computation when a re-sale contract is configured
- **Energy balance**: per-slot kWh tracking, usage flow attribution, origin breakdown
- **Cost analysis**: daily cost computation, subscription proration, savings calculation
- **Diagnostics**: reinjection classification, export attribution, health monitoring
- **Lovelace card**: forked card with battery SOC bar, ETA to full/empty, refactored to LitElement

## Installation

Copy the `hub_energie` folder to your Home Assistant `custom_components/` directory:

```
custom_components/
  hub_energie/
    __init__.py
    config_flow.py
    const.py
    coordinator.py
    sensor.py
    binary_sensor.py
    solar_model.py
    tariff_manager.py
    manifest.json
    services.yaml
    strings.json
    translations/
      en.json
      fr.json
    providers/
      __init__.py
      edf.py
    frontend/
      hub-energie-card.js
```

Restart Home Assistant, then add the integration via **Settings → Devices & Services → Add Integration → Hub Énergie**.

## Lovelace Card

The integration registers the card automatically (`dist/hub-energie-card.js`).

If you add the resource manually, **use the `dist` URL** (single bundled file; avoids mobile/WebView issues with a stub that only does `import "./dist/..."`):

```yaml
resources:
  - url: /hub_energie/dist/hub-energie-card.js
    type: module
```

After `npm run build`, `/hub_energie/hub-energie-card.js` is also a full copy of the bundle (same as `dist`), for backwards compatibility.

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

## Configuration Flow

1. **Supplier** — EDF or custom provider
2. **Phase type** — single-phase or three-phase
3. **Tariff** — auto-fetch (EDF) or manual (flat/TOU/schedule)
4. **Contract** — power (kVA), name
5. **Grid sensors** — import energy (required), export, power
6. **Solar** — energy, power, resale contract, PV estimation
7. **Batteries** — per-battery energy in/out, optional power/SOC/capacity

## Coexistence

This integration runs independently alongside `edf_energy_tariffs`. Both can be installed simultaneously — they use different domains and entity prefixes.

## Services

| Service | Description |
|---------|-------------|
| `hub_energie.refresh` | Force coordinator refresh |
| `hub_energie.refresh_tariffs` | Re-fetch EDF tariffs (auto mode) |

## License

Same license as the original `edf_energy_tariffs` integration.
