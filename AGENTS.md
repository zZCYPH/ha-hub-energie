# AGENTS.md

## Cursor Cloud specific instructions

### Products in this repo

| Component | Path | Stack | Purpose |
|-----------|------|-------|---------|
| **Integration** | `custom_components/hub_energie/` | Python (runs inside HA) | Home Assistant custom integration for energy monitoring |
| **Lovelace cards** | `custom_components/hub_energie/frontend/` | Lit + Vite 7 | Two custom Lovelace cards (`hub-energie-card`, `hub-energie-flow-card`) |
| **Marketing site (vitrine)** | `site/` | Vue 3 + Vite 6 | Docs site with config-flow simulator, changelog, release picker |
| **Tests** | `tests/` | pytest | Unit tests for integration business logic (HA stubs in `conftest.py`) |

### Running tests

```bash
python3 -m pytest tests/ -v --tb=short
```

- Tests stub all Home Assistant internals in `conftest.py`; no real HA install needed.
- Two test files (`test_config_validation.py`, `test_migration.py`) have pre-existing collection errors due to missing HA stubs for `split_entity_id` and `device_registry`. The remaining 191 tests pass.
- Coverage `fail_under` is 70% in `.coveragerc`; when the 2 erroring test files are excluded, coverage reports ~61%. This is a known pre-existing state.
- To run CI-style catalog tests without coverage: `python3 -m pytest tests/test_flow_catalog_coverage.py -v --override-ini addopts=`

### CI-equivalent lint/verification checks

No ESLint/Ruff/Flake8 linters are configured. The repo uses these CI verification scripts as the lint gate:

```bash
python3 scripts/extract_config_flow_catalog.py --check   # Flow catalog parity
python3 scripts/verify_vitrine_integration_docs.py        # Docs consistency
```

### Building

- **Lovelace cards**: `cd custom_components/hub_energie/frontend && npm run build`
- **Site**: `cd site && npm run build` (runs `prebuild` automatically to generate i18n + changelog)

### Running the dev server (site)

```bash
cd site && npm run dev
```

The `predev` hook auto-generates `src/vendor/hub-energie-i18n.js` and `public/changelog.generated.json`. The site runs at `http://localhost:5173`.

### Gotchas

- The site `postinstall` hook runs `node scripts/build-i18n.mjs` to generate the i18n vendor bundle. If `npm ci` fails mid-way, this file may be missing — re-run `npm ci` in `site/`.
- The site `sync-changelog` script reads `CHANGELOG.md` from the repo root; if that file is renamed/removed the `prebuild`/`predev` scripts will fail.
- The Lovelace frontend uses Vite 7; the site uses Vite 6. They have separate `node_modules` and separate lock files.
- When changing config flow steps/schemas, always regenerate the catalog with `python3 scripts/extract_config_flow_catalog.py` and verify with `--check`. See `.cursor/rules/config-flow-vitrine-parity.mdc` for full checklist.
