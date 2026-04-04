# Changelog

All notable changes to **Hub Énergie** are documented in this file.

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

[0.2.2]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.2.0...0.2.2
[0.2.0]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/compare/0.1.0...0.2.0
[0.1.0]: https://gitlab.com/zzcyph1/home-assistant/hub-energie/-/tree/0.1.0
