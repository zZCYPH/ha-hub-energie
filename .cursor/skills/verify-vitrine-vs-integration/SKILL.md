---
name: verify-vitrine-vs-integration
description: Align Hub Énergie marketing site (site/) with integration truth (manifest, services, README). Run after releases or doc edits.
---

# Verify vitrine vs integration

Use this skill when the user wants **marketing / GitLab Pages copy** (`site/`) and **repo docs** to match **what the integration actually ships** (`custom_components/hub_energie/`).

## Canonical sources (single source of truth)

1. **`custom_components/hub_energie/manifest.json`** — `version` (doc snapshot / release) and `homeassistant` (minimum HA).
2. **`custom_components/hub_energie/services.yaml`** — service action ids (documented in README as `` `hub_energie.<id>` ``).
3. **`hacs.json`** — `homeassistant` must equal `manifest.json` → `homeassistant`.

## Surfaces to keep in sync

| Surface | What to align |
|--------|----------------|
| `site/lang/en/*.json` and `site/lang/fr/*.json` | EN + FR strings (merged by `npm run prebuild` → `site/src/vendor/hub-energie-i18n.js`): doc snapshot version placeholders, HA minimum, Lovelace / card copy that names a version. |
| `site/src/views/**` (landing / doc / internals Vue partials) | Same copy concerns as former HTML fragments; keep version tokens as `{{HUB_ENERGIE_VERSION}}` in JSON where applicable. |
| `README.md` | Intro HA line, example tag (`vX.Y.Z`), “Since vX.Y.Z” card features, **Services** table vs `services.yaml`. |

Deep technical accuracy (slot rules, health states, limitations) must match **`README.md`** and **`custom_components/hub_energie/docs/*.md`**. The static site should not claim behaviour that contradicts those files.

## Automated check (run first)

From the repo root:

```bash
python3 scripts/verify_vitrine_integration_docs.py
```

- Exit **0** → version tokens on `site/lang/**` + any remaining `site/src/assets/*.html`, HACS HA field, and README service list are consistent with `manifest.json` / `services.yaml`.
- Exit **non-zero** → follow the printed list; update literals so only **one** integration semver and **one** HA minimum appear in each scanned file (calendar-style `20xx.y.z` is treated as the HA minimum, not as a second “release” version).
- **Internals page** copy lives in `site/lang/*/internals.json` and Vue partials under `site/src/views/partial/internals/`; internals are not version-gated like the main doc page — still review when behaviour changes.
- **Showcase page** layout and sections are Vue partials under `site/src/views/partial/doc/*.vue` (composed by `DocView.vue`); the devices carousel mock is still `site/src/assets/doc-devices-carousel-inner.include.html` (injected via `DocSectionDevices.vue`). `/doc/setup-help` is `ConfigFlowHelpView.vue` under `site/src/views/partial/doc/setup-help/`.

## Manual pass (features & honesty)

After the script passes, skim for **marketing drift**:

1. **Landing cards** (`landing.f1_*` … `f6_*` in `site/lang/*/landing.json`) vs README **Supported scope** / **Features** / **Limitations** — no promise of cloud-only features, “real” solar where the README says model/estimate, etc.
2. **Internals page** (`internals.*` / `ssot.*` in `site/lang/*/internals.json`) vs `ARCHITECTURE.md` and `README.md` **Data sources (SSOT)** — SSOT wording, Paris TZ, unknown bucket, rebuild behaviour.
3. **New integration features** — if code or `CHANGELOG.md` adds user-visible behaviour, add or adjust copy on `/showcase` and landing as needed, then re-run the script.

## After a version bump

Typical order:

1. Bump `manifest.json` `version` (and tag in Git when releasing).
2. Update `CHANGELOG.md`.
3. Grep the repo for the **old** semver and HA string; replace in `site/lang/en|fr/*.json`, any remaining `site/src/assets/*.html`, Vue templates if needed, and README examples.
4. Run `python3 scripts/verify_vitrine_integration_docs.py` until green.

## Site build

From `site/`, `npm run predev` / `prebuild` runs `node scripts/build-i18n.mjs`, which merges `site/lang/{en,fr}/*.json` into `site/src/vendor/hub-energie-i18n.js` (with manifest version tokens). Run after editing translation JSON.
