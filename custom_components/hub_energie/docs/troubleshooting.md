# Troubleshooting — trust, health, and recovery

This guide matches **current Hub Énergie behaviour in code**. It is meant to reassure you: most “degraded” signals mean *caution*, not a broken house.

## Where to look first

1. **Diagnostics device → “État général” (`…_health`)** — enum state plus attributes:
   - `trust_level`, `trust_cause_code`, `trust_cause` — why trust is not `ok`
   - `input_status`, `input_status_reasons` — whether configured entities are readable
   - `data_quality` — attribution / delta health (related to unknown bucket and gaps)
   - `delta_telemetry`, `delta_discards`, `grid_unknown_bucket_kwh_today`, `seconds_since_last_applied_delta` — detail for investigation

2. **Réseau device → “Réseau — créneau indéterminé (jour en cours)”** — kWh booked today when the tariff **slot could not be resolved** (see [Unknown bucket](#the-unknown-tariff-bucket)).

3. **Home Assistant logs** — warnings such as invalid integration store, recorder rebuild skipped, or incomplete statistics writes.

---

## Health sensor states (`…_health`)

The visible state is a **summary**. It combines **trust** (internal consistency and data-quality rules) with **input** (can we read your grid import meter and are optional entities missing/unavailable?).

Priority order in code: **`no_input`** → **`inconsistent`** → **`rebuilding`** → **`degraded`** → **`ok`**.

### `ok`

| | |
|---|---|
| **Meaning** | Checked signals are within the integration’s normal bounds; grid import is readable; trust is not `inconsistent` or `rebuilding`. |
| **Typical causes** | Normal operation. |
| **What to check** | Nothing required. |
| **When to worry** | No. |

### `degraded`

| | |
|---|---|
| **Meaning** | Something is imperfect, but the coordinator still runs. Often several sub-signals overlap (optional entities missing, Tempo/RTE not ready, unknown bucket usage, long gaps between meter updates, etc.). |
| **Typical causes** | See **`trust_cause_code`** on the same entity (primary explanation). Common codes include: `unknown_tariff_bucket`, `missing_current_slot`, `tempo_rte_calendar_not_ready`, `large_inter_delta_gap`, `stale_meter_data`, `delta_discards_present`, `battery_data_partial_or_poor`, `attribution_not_direct`, `data_quality_degraded`. Optional entities **missing** or **`unavailable`** also contribute (`input_status` = `degraded`). |
| **What to check** | Open **`input_status_reasons`**, **`delta_telemetry`**, and **`grid_unknown_bucket_kwh_today`**. Fix missing entities, wait for RTE calendar if you use Tempo+RTE, ensure grid import updates (not stuck `unknown`/`unavailable`). |
| **When to worry** | Usually **no** if it clears after startup or a short-lived tariff/sensor glitch. **Yes** if it stays for hours with **`stale_meter_data`** or a frozen grid import entity. |

**Thresholds (fixed in code):** “Large gap” between applied deltas is **> 2 hours**; “stale meter” is **> 6 hours** without a successful applied delta while energy sources are configured. Unknown bucket contributes when today’s grid unknown kWh is **> 0.01 kWh**.

### `rebuilding`

| | |
|---|---|
| **Meaning** | Internal kWh state was **just** rebuilt from **recorder long-term statistics** because the integration **store file was missing or invalid**. |
| **Typical causes** | First start, corrupted/cleared `.storage` entry, or failed validation of the saved payload. |
| **What to check** | Logs for “Invalid Store payload” / rebuild. After **one successful coordinator refresh**, trust leaves `rebuilding` (next cycle). |
| **When to worry** | **No** if it disappears after a refresh or two. **Investigate** if it appears on every restart (storage or permissions issue). |

### `inconsistent`

| | |
|---|---|
| **Meaning** | Trust level **`inconsistent`**: internal SSOT energy **since the drift anchor** disagrees with **meter increments since that same anchor** by at least **1.0 kWh** (per source, in `delta_telemetry` / `trust_cause`). The anchor is set at first use, after an entity change, or when the meter is rebased without counting energy — **not** the raw cumulative counter if it predates the integration. **Or** `input_status` is **`error`** (same root cause: inconsistent trust). |
| **Typical causes** | Accounting bugs, discarded deltas piling up, duplicate/conflicting counters, or rare desync after manual store edits — **not** simply “old meter vs young integration”. |
| **What to check** | **`trust_cause`** (names the source key). Compare recent meter **deltas** to Hub Énergie’s attributed totals; inspect `delta_telemetry` **drift_kwh** (relative to anchor). |
| **When to worry** | **Yes** for cost and grid-facing interpretation until resolved — see [What the integration hides](#what-the-integration-hides-when-inputs-are-bad). |

### `no_input`

| | |
|---|---|
| **Meaning** | **Grid import energy** is **not readable**: entity missing, or state **`unknown` / `unavailable` / empty**. |
| **Typical causes** | Integration not loaded, wrong entity id, device offline, template sensor not ready. |
| **What to check** | Developer Tools → States for your grid import entity. Reconfigure the integration if the entity changed. |
| **When to worry** | **Yes** until the meter is readable — slot accounting and deltas do not advance correctly without it. |

---

## `trust_cause_code` quick reference

These strings come from `trust_cause_code` / `trust_cause` when trust is not `ok`:

| Code | Trust level | Plain meaning |
|------|-------------|----------------|
| `recorder_rebuild_from_store` | `rebuilding` | Replayed past days from recorder stats after invalid/missing store. |
| `internal_total_diverges_from_meter` | `inconsistent` | Internal total vs **meter since drift anchor** beyond **1 kWh** (source named in message). |
| `tempo_rte_calendar_not_ready` | `degraded` | Tempo + RTE mode but calendar not ready yet. |
| `missing_current_slot` | `degraded` | Current tariff slot empty — slot/cost breakdown may be wrong. |
| `unknown_tariff_bucket` | `degraded` | Energy is accumulating in the **unknown** slot bucket today. |
| `attribution_not_direct` | `degraded` | Last delta used a non-direct attribution method (fallback/estimate). |
| `large_inter_delta_gap` | `degraded` | Gap **> 2 h** between applied deltas on at least one source. |
| `battery_data_partial_or_poor` | `degraded` | Battery telemetry quality flagged partial/poor. |
| `delta_discards_present` | `degraded` | At least one discard counter **> 0** (e.g. negative/unrealistic delta rejected). |
| `stale_meter_data` | `degraded` | No successful delta applied for **> 6 h** while sources exist. |
| `data_quality_degraded` | `degraded` | Internal `data_quality` heuristic is `degraded` (unknown bucket / gaps / non-direct attribution). |

---

## The unknown tariff bucket

When a **positive** grid energy delta arrives but the integration **cannot resolve** the current tariff **slot**, that energy is **not dropped**. It is booked into an internal slot named **`unknown`** (Paris calendar day).

- **Diagnostic sensor:** “Réseau — créneau indéterminé (jour en cours)” shows **today’s** kWh in that bucket.
- **Effect on trust:** More than **0.01 kWh** there contributes to **`degraded`** trust and `data_quality` = `degraded`.
- **What to do:** Fix slot resolution — e.g. EDF Tempo colour/sensors, schedule configuration, or Tempo+RTE calendar readiness — so new deltas get a real slot. Existing **unknown** kWh for the day remain until the day rolls over in Paris time.

This is **separate** from a Home Assistant entity state being `unknown`; here **`unknown`** names a **tariff bucket**, not HA’s entity state.

---

## Measured, reconstructed, estimated

| Kind | Meaning in this integration |
|------|------------------------------|
| **Measured** | Values read from **your configured entities** (e.g. `total_increasing` kWh meters, power sensors). |
| **Reconstructed** | **Internal** running totals and per-slot kWh built from **positive deltas** on those meters. If the **JSON store** is invalid or missing, **completed past days** can be **replayed** from **recorder long-term statistics** (`hub_energie:slot_…` daily sums). **Today** is not “filled in” from thin air by that path alone — live deltas still matter for the current day. |
| **Estimated** | **Model-based** solar (clear-sky PV) and other **best-effort** paths where there is no direct meter or where experimental logic fills gaps. Treat as indicative. |

---

## Recovery: restarts, missing entities, and recorder limits

### After a Home Assistant restart

- The integration **loads** its **Store** (per config entry). If the payload is **valid**, internal totals and floors are restored.
- If the payload is **invalid or absent**, it **resets** internal state and runs **`rebuild_from_recorder`**: it pulls **daily** long-term statistics for configured `hub_energie:slot_*` ids and rebuilds **past completed days** plus **LTS cumulative floors** for statistics continuity.
- **`rebuilding`** trust reflects that path until the **first full refresh** after setup completes.

### Recorder not ready or rebuild fails

If the recorder database is **not ready** or the statistics query **fails**, rebuild is **skipped** (logged). The integration **continues** with a fresh internal state; you may see **discontinuity** vs earlier history until new deltas repopulate accounting.

### Insufficient or purged history

Rebuild only sees what the **recorder still retains**. Shorter **purge / retention** means **less** history to recover and weaker backfill for charts and internal reconciliation.

### Entities `unknown` / `unavailable`

- **Grid import** in that state → **`no_input`**, no reliable new deltas.
- **Optional** entities (solar, export, batteries, etc.) → **`degraded`** input path with reasons listing **missing** / **unavailable** ids (lists may be truncated in attributes with totals).

You can call the **`hub_energie.refresh`** service after fixing entities to force a coordinator cycle (same as waiting for the next poll).

---

## What the integration hides when inputs are bad

When `input_status` is **`no_input`** or **`error`** (the latter is used when trust is **`inconsistent`**):

- **These sensor states return `None` / unavailable-style behaviour:** grid **SSOT total** kWh, **grid** and **home** “today” kWh helpers, and **solar/battery savings** € sensors — so misleading grid/cost-adjacent numbers are not shown there.

The main **“Coût du jour” (`…_cost_detail`)** entity **still exposes** its computed state from the coordinator snapshot; **always cross-check `…_health` and `input_status`** before trusting money figures when health is **`no_input`** or **`inconsistent`**.

---

## Related reading

- `README.md` — limitations, SSOT overview, quick glossary.
- `CHANGELOG.md` — trust enum changes and recorder/statistics behaviour.
