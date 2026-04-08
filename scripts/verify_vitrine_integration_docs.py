#!/usr/bin/env python3
"""
Cross-check marketing site (vitrine) and integration docs against canonical sources.

Canonical sources:
  - custom_components/hub_energie/manifest.json (integration version, min HA)
  - custom_components/hub_energie/services.yaml (service ids)
  - hacs.json (HACS homeassistant field should match manifest)

Scanned surfaces:
  - site/public/i18n.js (EN/FR strings shown on the static site)
  - site/src/assets/*.html (static fallbacks / fragments; may use
    {{HUB_ENERGIE_VERSION}} substituted at site build from manifest)

Exit 0 if consistent; non-zero with a short report otherwise.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "custom_components/hub_energie/manifest.json"
HACS = ROOT / "hacs.json"
SERVICES = ROOT / "custom_components/hub_energie/services.yaml"
README = ROOT / "README.md"
SITE_I18N = ROOT / "site/public/i18n.js"
SITE_ASSETS = ROOT / "site/src/assets"
# Replaced from manifest during site prebuild (see site/scripts/manifest-version.mjs).
MANIFEST_VERSION_PLACEHOLDER = "{{HUB_ENERGIE_VERSION}}"

# Triplet a.b.c (integration semver or calendar-style HA min); calendar years filtered below.
TRIPLET_RE = re.compile(r"\b(v?)([0-9]+\.[0-9]+\.[0-9]+)\b")
# Home Assistant min version (YYYY.M.N)
HA_VER_RE = re.compile(r"\b(20[0-9]{2}\.[0-9]{1,2}\.[0-9]+)\b")


def _is_calendar_style_triplet(t: str) -> bool:
    """True for 20xx.y.z style tokens (HA min version), not integration semver."""
    parts = t.split(".")
    if len(parts) != 3 or not parts[0].isdigit():
        return False
    y = int(parts[0])
    return len(parts[0]) == 4 and y >= 1990


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _manifest_versions() -> tuple[str, str]:
    m = _load_json(MANIFEST)
    ver = m.get("version")
    ha = m.get("homeassistant")
    if not ver or not ha:
        raise SystemExit(f"manifest.json missing version or homeassistant: {MANIFEST}")
    return str(ver), str(ha)


def _hacs_ha() -> str | None:
    if not HACS.is_file():
        return None
    h = _load_json(HACS)
    return str(h["homeassistant"]) if h.get("homeassistant") else None


def _service_ids() -> set[str]:
    text = SERVICES.read_text(encoding="utf-8")
    ids: set[str] = set()
    for line in text.splitlines():
        line = line.strip()
        if line.endswith(":") and not line.startswith("#"):
            key = line[:-1].strip()
            if key and not key.startswith(" "):
                ids.add(key)
    return ids


def _readme_service_ids() -> set[str]:
    text = README.read_text(encoding="utf-8")
    found: set[str] = set()
    for m in re.finditer(r"`(hub_energie\.[a-z0-9_]+)`", text):
        found.add(m.group(1).removeprefix("hub_energie."))
    return found


def _collect_semvers_and_ha(text: str) -> tuple[set[str], set[str]]:
    semvers: set[str] = set()
    for m in TRIPLET_RE.finditer(text):
        triplet = m.group(2)
        if _is_calendar_style_triplet(triplet):
            continue
        semvers.add(triplet)
    ha_vers: set[str] = {m.group(1) for m in HA_VER_RE.finditer(text)}
    return semvers, ha_vers


def _check_site_text(
    label: str,
    text: str,
    expect_ver: str,
    expect_ha: str,
    *,
    require_ha_line: bool = True,
    allow_build_time_version_placeholder: bool = False,
) -> list[str]:
    errors: list[str] = []
    semvers, ha_vers = _collect_semvers_and_ha(text)

    version_ok = expect_ver in semvers
    if (
        not version_ok
        and allow_build_time_version_placeholder
        and MANIFEST_VERSION_PLACEHOLDER in text
        and len(semvers) == 0
    ):
        # Literal semver in source would override / contradict the placeholder contract.
        version_ok = True
    if not version_ok:
        errors.append(
            f"{label}: expected integration version token {expect_ver!r} "
            f"(from manifest), or {MANIFEST_VERSION_PLACEHOLDER!r} with no other integration "
            f"semver literals in the file."
        )
    if len(semvers) > 1:
        errors.append(
            f"{label}: multiple semver literals {sorted(semvers)!r} — keep a single release "
            f"{expect_ver!r} aligned with manifest.json."
        )
    if require_ha_line:
        if expect_ha not in ha_vers:
            errors.append(
                f"{label}: expected Home Assistant min version {expect_ha!r} not found."
            )
        if len(ha_vers) > 1:
            errors.append(
                f"{label}: multiple HA min-version literals {sorted(ha_vers)!r} "
                f"(manifest requires {expect_ha!r})."
            )
    return errors


def main() -> int:
    errors: list[str] = []
    ver, ha_min = _manifest_versions()

    hacs_ha = _hacs_ha()
    if hacs_ha is not None and hacs_ha != ha_min:
        errors.append(
            f"hacs.json homeassistant ({hacs_ha!r}) must match manifest homeassistant ({ha_min!r})."
        )

    svc = _service_ids()
    readme_svc = _readme_service_ids()
    if readme_svc != svc:
        missing_in_readme = sorted(svc - readme_svc)
        extra_in_readme = sorted(readme_svc - svc)
        if missing_in_readme:
            errors.append(
                "README.md services table missing hub_energie.* entries for: "
                + ", ".join(f"`hub_energie.{s}`" for s in missing_in_readme)
            )
        if extra_in_readme:
            errors.append(
                "README.md documents services not present in services.yaml: "
                + ", ".join(f"`hub_energie.{s}`" for s in extra_in_readme)
            )

    if SITE_I18N.is_file():
        errors.extend(
            _check_site_text(
                "site/public/i18n.js",
                SITE_I18N.read_text(encoding="utf-8"),
                ver,
                ha_min,
                require_ha_line=True,
            )
        )

    if SITE_ASSETS.is_dir():
        for p in sorted(SITE_ASSETS.glob("*.html")):
            rel = p.relative_to(ROOT)
            name = p.name
            if name == "internals-fragment.html":
                continue
            require_ha = name != "landing-body.html"
            errors.extend(
                _check_site_text(
                    str(rel),
                    p.read_text(encoding="utf-8"),
                    ver,
                    ha_min,
                    require_ha_line=require_ha,
                    allow_build_time_version_placeholder=True,
                )
            )

    if errors:
        print("verify_vitrine_integration_docs: FAILED", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        print(
            "\nFix: bump custom_components/hub_energie/manifest.json, then align "
            "README.md, hacs.json, site/public/i18n.js, and site/src/assets/*.html "
            "(or use {{HUB_ENERGIE_VERSION}} in HTML; prebuild fills it from the manifest). "
            "Or run from Cursor with the verify-vitrine-vs-integration skill.",
            file=sys.stderr,
        )
        return 1

    print(
        f"verify_vitrine_integration_docs: OK (integration {ver}, HA ≥ {ha_min}, services match README)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
