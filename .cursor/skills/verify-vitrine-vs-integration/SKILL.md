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
| `site/public/i18n.js` | EN + FR strings: doc snapshot version, HA minimum, Lovelace / card copy that names a version. |
| `site/src/assets/landing-body.html` | Fallback text for `landing.version_note` (must match manifest `version` as `vX.Y.Z`). |
| `site/src/assets/doc-fragment.html` | Fallback HTML: `glance` HA line, badge `vX.Y.Z`, footer snapshot, examples citing `vX.Y.Z`. |
| `README.md` | Intro HA line, example tag (`vX.Y.Z`), “Since vX.Y.Z” card features, **Services** table vs `services.yaml`. |

Deep technical accuracy (slot rules, health states, limitations) must match **`README.md`** and **`custom_components/hub_energie/docs/*.md`**. The static site should not claim behaviour that contradicts those files.

## Automated check (run first)

From the repo root:

```bash
python3 scripts/verify_vitrine_integration_docs.py
```

- Exit **0** → version tokens on the vitrine assets + `i18n.js`, HACS HA field, and README service list are consistent with `manifest.json` / `services.yaml`.
- Exit **non-zero** → follow the printed list; update literals so only **one** integration semver and **one** HA minimum appear in each scanned file (calendar-style `20xx.y.z` is treated as the HA minimum, not as a second “release” version).
- **`site/src/assets/internals-fragment.html`** is intentionally not version-gated by the script (internals are timeless); still review it when behaviour changes.

## Manual pass (features & honesty)

After the script passes, skim for **marketing drift**:

1. **Landing cards** (`landing.f1_*` … `f6_*` in `i18n.js`) vs README **Supported scope** / **Features** / **Limitations** — no promise of cloud-only features, “real” solar where the README says model/estimate, etc.
2. **Internals page** (`internals.*` strings) vs `ARCHITECTURE.md` and `README.md` **Data sources (SSOT)** — SSOT wording, Paris TZ, unknown bucket, rebuild behaviour.
3. **New integration features** — if code or `CHANGELOG.md` adds user-visible behaviour, add or adjust copy on `#/doc` and landing as needed, then re-run the script.

## After a version bump

Typical order:

1. Bump `manifest.json` `version` (and tag in Git when releasing).
2. Update `CHANGELOG.md`.
3. Grep the repo for the **old** semver and HA string; replace in `site/public/i18n.js`, `site/src/assets/*.html`, and README examples.
4. Run `python3 scripts/verify_vitrine_integration_docs.py` until green.

## Optional: regenerate `site/public` copies

If the project uses a sync step for `public/` (e.g. `npm run postinstall` under `site/`), run it so checked-in `public/` mirrors `src/` after HTML edits.
