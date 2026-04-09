#!/usr/bin/env python3
"""
Cross-check marketing site (vitrine) and integration docs against canonical sources.

Canonical sources:
  - custom_components/hub_energie/manifest.json (integration version, min HA)
  - custom_components/hub_energie/services.yaml (service ids)
  - hacs.json (HACS homeassistant field should match manifest)

Scanned surfaces:
  - site/lang/en/*.json and site/lang/fr/*.json (scoped strings merged at site prebuild)
  - site/src/assets/*.html (remaining static fragments / includes; may use
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
SITE_LANG_EN = ROOT / "site/lang/en"
SITE_LANG_FR = ROOT / "site/lang/fr"
SITE_ASSETS = ROOT / "site/src/assets"

LANG_MERGE_ORDER = ("common", "landing", "doc", "flowsim", "flowhelp", "internals")
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


def _lang_dir_concat_text(lang_dir: Path) -> str:
    chunks: list[str] = []
    for name in LANG_MERGE_ORDER:
        p = lang_dir / f"{name}.json"
        if not p.is_file():
            raise FileNotFoundError(f"missing scoped lang file: {p}")
        chunks.append(p.read_text(encoding="utf-8"))
    return "\n".join(chunks)


def _merged_lang_flat_keys(lang_dir: Path) -> dict[str, str]:
    merged: dict[str, str] = {}
    for name in LANG_MERGE_ORDER:
        p = lang_dir / f"{name}.json"
        data = _load_json(p)
        for k, v in data.items():
            if k in merged:
                raise ValueError(f"duplicate i18n key {k!r} merging {p.name}")
            if not isinstance(v, str):
                raise TypeError(f"{p.name}: key {k!r} must be a string")
            merged[k] = v
    return merged


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

    if SITE_LANG_EN.is_dir() and SITE_LANG_FR.is_dir():
        try:
            en_keys = _merged_lang_flat_keys(SITE_LANG_EN)
            fr_keys = _merged_lang_flat_keys(SITE_LANG_FR)
        except (FileNotFoundError, ValueError, TypeError, json.JSONDecodeError) as e:
            errors.append(f"site/lang: {e}")
            en_keys = {}
            fr_keys = {}
        if en_keys and fr_keys:
            only_en = sorted(set(en_keys) - set(fr_keys))
            only_fr = sorted(set(fr_keys) - set(en_keys))
            if only_en:
                errors.append(
                    "site/lang: keys present in en/ but missing in fr/: " + ", ".join(only_en[:40])
                    + (" …" if len(only_en) > 40 else "")
                )
            if only_fr:
                errors.append(
                    "site/lang: keys present in fr/ but missing in en/: " + ", ".join(only_fr[:40])
                    + (" …" if len(only_fr) > 40 else "")
                )
        errors.extend(
            _check_site_text(
                "site/lang/en/*.json",
                _lang_dir_concat_text(SITE_LANG_EN),
                ver,
                ha_min,
                require_ha_line=True,
                allow_build_time_version_placeholder=True,
            )
        )
        errors.extend(
            _check_site_text(
                "site/lang/fr/*.json",
                _lang_dir_concat_text(SITE_LANG_FR),
                ver,
                ha_min,
                require_ha_line=True,
                allow_build_time_version_placeholder=True,
            )
        )

    if SITE_ASSETS.is_dir():
        for p in sorted(SITE_ASSETS.glob("*.html")):
            rel = p.relative_to(ROOT)
            name = p.name
            require_ha = True
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
            "README.md, hacs.json, site/lang/en|fr/*.json, and site/src/assets/*.html "
            "(or use {{HUB_ENERGIE_VERSION}} in sources; site prebuild expands from the manifest). "
            "Or run from Cursor with the verify-vitrine-vs-integration skill.",
            file=sys.stderr,
        )
        return 1

    print(
        f"verify_vitrine_integration_docs: OK (integration {ver}, HA >= {ha_min}, services match README)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
