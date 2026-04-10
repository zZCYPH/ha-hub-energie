#!/usr/bin/env python3
"""Build a JSON catalog of Hub Énergie *initial* config-flow steps for the doc vitrine.

Reads ``config_flow.py`` (AST) for ``HubEnergieConfigFlow`` + ``_BatteryWizardMixin``,
plus selected ``HubEnergieOptionsFlow`` steps (``init``, ``advanced_energy``, ``battery_pick``) for the doc vitrine,
``strings.json`` (EN) and ``translations/fr.json`` for localized titles / field labels, plus
a ``selector`` block (option labels).

The interactive preview navigates using **branching logic in the Vue simulator** (not linear
scenarios in this JSON). Full validation cannot be replayed without Home Assistant; this artifact
stays aligned with real ``step_id`` values and integration strings.

Usage::
    python scripts/extract_config_flow_catalog.py              # write flowCatalog + flowHelpFieldGuide JSON
    python scripts/extract_config_flow_catalog.py --check     # exit 2 if either output would change
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
CONFIG_FLOW = REPO / "custom_components/hub_energie/config_flow.py"
STRINGS_JSON = REPO / "custom_components/hub_energie/strings.json"
STRINGS_FR_JSON = REPO / "custom_components/hub_energie/translations/fr.json"
OUT_JSON = REPO / "site/src/data/flowCatalog.generated.json"
OUT_FIELD_GUIDE_JSON = REPO / "site/src/data/flowHelpFieldGuide.generated.json"

STEP_HELP_DOC_PREFIX = "https://hub-energie.ts-devops.com/#/doc/setup-help#"

# Keep in sync with ``site/src/data/flowStepHelpDefs.js`` (anchors on the doc site).
FLOW_HELP_WIZARD_IDS: tuple[str, ...] = (
    "user",
    "supplier_custom",
    "tariff_mode_manual_only",
    "tariff_mode",
    "contract",
    "edf_offer",
    "edf_tempo",
    "edf_tempo_rte",
    "manual_pricing",
    "manual_flat",
    "manual_tou",
    "manual_schedule",
    "manual_schedule_form",
    "manual_schedule_json",
    "grid_tri_energy_mode",
    "grid_tri_per_phase",
    "grid",
    "grid_tri_layout",
    "grid_phases",
    "tri_grid_phase_1",
    "tri_grid_phase_2",
    "tri_grid_phase_3",
    "solar",
    "solar_config",
    "solar_estimation",
    "battery",
    "battery_add",
    "battery_advanced",
    "battery_more",
)

FLOW_HELP_OPTIONS_IDS: tuple[str, ...] = (
    "init",
    "offer",
    "tariff_refresh",
    "tempo",
    "tempo_rte",
    "expert",
    "reinjection",
    "advanced_energy",
    "grid",
    "grid_tri_energy_mode",
    "grid_tri_per_phase",
    "grid_tri_layout",
    "grid_phases",
    "tri_grid_phase_1",
    "tri_grid_phase_2",
    "tri_grid_phase_3",
    "solar",
    "solar_config",
    "solar_estimation",
    "battery",
    "battery_pick",
    "battery_add",
    "battery_advanced",
    "battery_more",
)

CLASS_NAMES = frozenset({"HubEnergieConfigFlow", "_BatteryWizardMixin"})
OPTIONS_FLOW_CLASS = "HubEnergieOptionsFlow"
# Options-only steps merged into the catalog (``step_id`` must not collide with setup flow,
# except ``OPTIONS_CATALOG_DUP_STEP_IDS`` where both setup and options rows are kept).
OPTIONS_CATALOG_HANDLERS = frozenset(
    {
        "async_step_init",
        "async_step_expert",
        "async_step_solar",
        "async_step_solar_config",
        "async_step_solar_estimation",
        "async_step_reinjection",
        "async_step_advanced_energy",
        "async_step_battery_pick",
    }
)
OPTIONS_CATALOG_DUP_STEP_IDS: frozenset[str] = frozenset(
    {"solar", "solar_config", "solar_estimation"}
)


def _tri_phase_step_id(method_name: str) -> str | None:
    m = re.match(r"^async_step_tri_grid_phase_(\d+)$", method_name)
    if not m:
        return None
    return f"tri_grid_phase_{m.group(1)}"


def _kwarg_str(call: ast.Call, name: str) -> str | None:
    for kw in call.keywords:
        if kw.arg != name:
            continue
        if isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str):
            return kw.value.value
    return None


def _menu_options(call: ast.Call) -> list[str] | None:
    for kw in call.keywords:
        if kw.arg != "menu_options":
            continue
        if not isinstance(kw.value, ast.List):
            continue
        out: list[str] = []
        for elt in kw.value.elts:
            if isinstance(elt, ast.Constant) and isinstance(elt.value, str):
                out.append(elt.value)
        return out or None
    return None


def _scan_calls(func: ast.AsyncFunctionDef) -> tuple[set[str], str | None, list[str] | None]:
    """Collect step_id strings from async_show_form / async_show_menu, menu options, and kind."""
    step_ids_set: set[str] = set()
    kind: str | None = None
    menu_options: list[str] | None = None
    has_show_form = False
    has_show_menu = False
    for n in ast.walk(func):
        if not isinstance(n, ast.Call):
            continue
        fn: str | None = None
        if isinstance(n.func, ast.Attribute):
            fn = n.func.attr
        elif isinstance(n.func, ast.Name):
            fn = n.func.id
        if fn == "async_show_form":
            has_show_form = True
            sid = _kwarg_str(n, "step_id")
            if sid:
                step_ids_set.add(sid)
        elif fn == "async_show_menu":
            has_show_menu = True
            kind = "menu"
            sid = _kwarg_str(n, "step_id")
            if sid:
                step_ids_set.add(sid)
            mo = _menu_options(n)
            if mo:
                menu_options = mo
    if has_show_form and not has_show_menu:
        kind = "form"
    elif has_show_menu:
        kind = "menu"
    elif step_ids_set and not kind:
        kind = "form"
    return step_ids_set, kind, menu_options


def _infer_step_id(func_name: str, found_ids: set[str]) -> str:
    if len(found_ids) == 1:
        return next(iter(found_ids))
    if len(found_ids) > 1:
        stripped = func_name.removeprefix("async_step_")
        if stripped in found_ids:
            return stripped
        return sorted(found_ids)[0]
    tri = _tri_phase_step_id(func_name)
    if tri:
        return tri
    return func_name.removeprefix("async_step_")


def _expand_step_help_description(
    description: str, step_id: str, *, options_flow: bool = False
) -> str:
    """``strings.json`` uses ``{step_help_url}``; runtime fills it from ``config_flow.py``."""
    if "{step_help_url}" not in description:
        return description
    slug = f"flow-step-options-{step_id}" if options_flow else f"flow-step-{step_id}"
    return description.replace("{step_help_url}", f"{STEP_HELP_DOC_PREFIX}{slug}")


def _build_field_entries(step_id: str, raw: dict[str, Any], *, options_flow: bool = False) -> dict[str, Any]:
    entry = raw.get("data", {}) or {}
    desc = raw.get("data_description", {}) or {}
    fields: list[dict[str, str]] = []
    for key, label in entry.items():
        if key == "flow_nav":
            continue
        fields.append(
            {
                "key": key,
                "label": str(label),
                "description": str(desc[key]) if key in desc else "",
            }
        )
    menu_choices: list[dict[str, str]] = []
    mo = raw.get("menu_options")
    if isinstance(mo, dict):
        for k, v in mo.items():
            menu_choices.append({"key": k, "label": str(v)})
    sections_out: list[dict[str, Any]] = []
    sections = raw.get("sections")
    if isinstance(sections, dict):
        for sec_key, sec_val in sections.items():
            if not isinstance(sec_val, dict):
                continue
            name = str(sec_val.get("name", sec_key))
            subfields: list[dict[str, str]] = []
            subdata = sec_val.get("data", {}) or {}
            subdesc = sec_val.get("data_description", {}) or {}
            for sk, sl in subdata.items():
                if sk == "flow_nav":
                    continue
                subfields.append(
                    {
                        "key": sk,
                        "label": str(sl),
                        "description": str(subdesc[sk]) if sk in subdesc else "",
                    }
                )
            sections_out.append({"id": sec_key, "name": name, "fields": subfields})
    step_desc = _expand_step_help_description(
        str(raw.get("description", "")), step_id, options_flow=options_flow
    )
    return {
        "title": str(raw.get("title", "")),
        "description": step_desc,
        "fields": fields,
        "menu_choices": menu_choices,
        "sections": sections_out,
    }


def iter_setup_flow_handlers() -> list[tuple[str, str]]:
    """Return ``(source_class, handler_name)`` for every ``async_step_*`` on the setup wizard classes."""
    tree = ast.parse(CONFIG_FLOW.read_text(encoding="utf-8"))
    out: list[tuple[str, str]] = []
    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name not in CLASS_NAMES:
            continue
        for item in node.body:
            if isinstance(item, ast.AsyncFunctionDef) and item.name.startswith("async_step_"):
                out.append((node.name, item.name))
    out.sort(key=lambda t: (t[0], t[1]))
    return out


def iter_options_catalog_handlers() -> set[str]:
    """Handler names merged into the vitrine catalog from ``HubEnergieOptionsFlow`` (subset)."""
    tree = ast.parse(CONFIG_FLOW.read_text(encoding="utf-8"))
    out: set[str] = set()
    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name != OPTIONS_FLOW_CLASS:
            continue
        for item in node.body:
            if isinstance(item, ast.AsyncFunctionDef) and item.name in OPTIONS_CATALOG_HANDLERS:
                out.add(item.name)
    return out


def extract_steps() -> list[dict[str, Any]]:
    tree = ast.parse(CONFIG_FLOW.read_text(encoding="utf-8"))
    by_step: dict[str, dict[str, Any]] = {}
    strings_root_en = json.loads(STRINGS_JSON.read_text(encoding="utf-8"))
    step_strings_en: dict[str, Any] = strings_root_en.get("config", {}).get("step", {})
    strings_root_fr = json.loads(STRINGS_FR_JSON.read_text(encoding="utf-8"))
    step_strings_fr: dict[str, Any] = strings_root_fr.get("config", {}).get("step", {})

    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name not in CLASS_NAMES:
            continue
        src_class = node.name
        for item in node.body:
            if not isinstance(item, ast.AsyncFunctionDef):
                continue
            if not item.name.startswith("async_step_"):
                continue
            found_ids, kind, menu_opts = _scan_calls(item)
            step_id = _infer_step_id(item.name, found_ids)
            if step_id not in by_step:
                by_step[step_id] = {
                    "step_id": step_id,
                    "handler": item.name,
                    "source_class": src_class,
                    "kind": kind or ("form" if item.name != "async_step_manual_schedule_prev" else "redirect"),
                    "menu_options": menu_opts,
                }
            else:
                existing = by_step[step_id]
                if menu_opts and not existing.get("menu_options"):
                    existing["menu_options"] = menu_opts
                if kind and existing.get("kind") == "form" and kind == "menu":
                    existing["kind"] = "menu"

    steps: list[dict[str, Any]] = []
    for step_id in sorted(by_step):
        meta = by_step[step_id]
        raw_en = step_strings_en.get(step_id, {})
        if not isinstance(raw_en, dict):
            raw_en = {}
        raw_fr = step_strings_fr.get(step_id, raw_en)
        if not isinstance(raw_fr, dict):
            raw_fr = raw_en
        strings_en = _build_field_entries(step_id, raw_en)
        strings_fr = _build_field_entries(step_id, raw_fr)
        if not strings_en["title"]:
            strings_en["title"] = step_id.replace("_", " ").title()
        if not strings_fr["title"]:
            strings_fr["title"] = strings_en["title"]
        merged: dict[str, Any] = {
            **meta,
            "strings": {"en": strings_en, "fr": strings_fr},
        }
        steps.append(merged)

    return steps


def extract_options_catalog_steps() -> list[dict[str, Any]]:
    """Build catalog rows for whitelisted options-flow forms (strings under ``options.step``)."""
    tree = ast.parse(CONFIG_FLOW.read_text(encoding="utf-8"))
    strings_root_en = json.loads(STRINGS_JSON.read_text(encoding="utf-8"))
    step_strings_en: dict[str, Any] = strings_root_en.get("options", {}).get("step", {})
    strings_root_fr = json.loads(STRINGS_FR_JSON.read_text(encoding="utf-8"))
    step_strings_fr: dict[str, Any] = strings_root_fr.get("options", {}).get("step", {})

    out: list[dict[str, Any]] = []
    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name != OPTIONS_FLOW_CLASS:
            continue
        for item in node.body:
            if not isinstance(item, ast.AsyncFunctionDef) or item.name not in OPTIONS_CATALOG_HANDLERS:
                continue
            found_ids, kind, menu_opts = _scan_calls(item)
            step_id = _infer_step_id(item.name, found_ids)
            raw_en = step_strings_en.get(step_id, {})
            if not isinstance(raw_en, dict):
                raw_en = {}
            raw_fr = step_strings_fr.get(step_id, raw_en)
            if not isinstance(raw_fr, dict):
                raw_fr = raw_en
            strings_en = _build_field_entries(step_id, raw_en, options_flow=True)
            strings_fr = _build_field_entries(step_id, raw_fr, options_flow=True)
            if not strings_en["title"]:
                strings_en["title"] = step_id.replace("_", " ").title()
            if not strings_fr["title"]:
                strings_fr["title"] = strings_en["title"]
            out.append(
                {
                    "step_id": step_id,
                    "handler": item.name,
                    "source_class": OPTIONS_FLOW_CLASS,
                    "kind": kind or "form",
                    "menu_options": menu_opts,
                    "strings": {"en": strings_en, "fr": strings_fr},
                }
            )
    out.sort(key=lambda s: s["step_id"])
    return out


def _integration_selector_i18n() -> dict[str, Any]:
    """``selector`` option labels from integration ``strings.json`` / ``translations/fr.json`` (HA shape)."""
    en_root = json.loads(STRINGS_JSON.read_text(encoding="utf-8"))
    fr_root = json.loads(STRINGS_FR_JSON.read_text(encoding="utf-8"))
    return {
        "en": en_root.get("selector", {}) or {},
        "fr": fr_root.get("selector", {}) or {},
    }


def _field_guide_bundle(raw: dict[str, Any], step_id: str, *, options_flow: bool) -> dict[str, Any]:
    """Strip title/description so the field-guide JSON stays compact."""
    full = _build_field_entries(step_id, raw, options_flow=options_flow)
    return {
        "fields": full.get("fields") or [],
        "sections": full.get("sections") or [],
        "menu_choices": full.get("menu_choices") or [],
    }


def build_flow_help_field_guide() -> dict[str, Any]:
    """Per-step field/menu labels + ``data_description`` for the doc vitrine (EN + FR)."""
    en_root = json.loads(STRINGS_JSON.read_text(encoding="utf-8"))
    fr_root = json.loads(STRINGS_FR_JSON.read_text(encoding="utf-8"))
    cfg_en = en_root.get("config", {}).get("step", {}) or {}
    cfg_fr = fr_root.get("config", {}).get("step", {}) or {}
    opt_en = en_root.get("options", {}).get("step", {}) or {}
    opt_fr = fr_root.get("options", {}).get("step", {}) or {}

    wizard: dict[str, Any] = {}
    for sid in FLOW_HELP_WIZARD_IDS:
        raw_en = cfg_en.get(sid, {})
        raw_fr = cfg_fr.get(sid, raw_en)
        if not isinstance(raw_en, dict):
            raw_en = {}
        if not isinstance(raw_fr, dict):
            raw_fr = raw_en
        wizard[sid] = {
            "en": _field_guide_bundle(raw_en, sid, options_flow=False),
            "fr": _field_guide_bundle(raw_fr, sid, options_flow=False),
        }

    options: dict[str, Any] = {}
    for sid in FLOW_HELP_OPTIONS_IDS:
        raw_en = opt_en.get(sid, {})
        raw_fr = opt_fr.get(sid, raw_en)
        if not isinstance(raw_en, dict):
            raw_en = {}
        if not isinstance(raw_fr, dict):
            raw_fr = raw_en
        options[sid] = {
            "en": _field_guide_bundle(raw_en, sid, options_flow=True),
            "fr": _field_guide_bundle(raw_fr, sid, options_flow=True),
        }

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_files": {
            "strings_en": STRINGS_JSON.relative_to(REPO).as_posix(),
            "strings_fr": STRINGS_FR_JSON.relative_to(REPO).as_posix(),
        },
        "wizard": wizard,
        "options": options,
    }


def build_doc() -> dict[str, Any]:
    setup_steps = extract_steps()
    options_steps = extract_options_catalog_steps()
    by_id = {s["step_id"]: s for s in setup_steps}
    dup_extras: list[dict[str, Any]] = []
    for s in options_steps:
        sid = s["step_id"]
        if sid in by_id and sid in OPTIONS_CATALOG_DUP_STEP_IDS:
            dup_extras.append(s)
            continue
        if sid in by_id:
            raise RuntimeError(
                f"Catalog step_id collision: {sid!r} exists in setup and options extract."
            )
        by_id[sid] = s
    steps = sorted(by_id.values(), key=lambda x: x["step_id"]) + sorted(
        dup_extras, key=lambda x: (x["step_id"], x.get("source_class", ""))
    )
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_files": {
            "config_flow": CONFIG_FLOW.relative_to(REPO).as_posix(),
            "strings_en": STRINGS_JSON.relative_to(REPO).as_posix(),
            "strings_fr": STRINGS_FR_JSON.relative_to(REPO).as_posix(),
        },
        "selector": _integration_selector_i18n(),
        "steps": steps,
    }


def _stable_json_blob(doc: dict[str, Any]) -> str:
    """Compare catalog content without the volatile timestamp."""
    trimmed = {k: v for k, v in doc.items() if k != "generated_at"}
    return json.dumps(trimmed, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def _stable_field_guide_blob(doc: dict[str, Any]) -> str:
    trimmed = {k: v for k, v in doc.items() if k != "generated_at"}
    return json.dumps(trimmed, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate flowCatalog.generated.json for the doc site.")
    ap.add_argument(
        "--check",
        action="store_true",
        help="Do not write; exit with code 2 if the committed file would change.",
    )
    args = ap.parse_args()
    doc = build_doc()
    fg = build_flow_help_field_guide()
    text = json.dumps(doc, indent=2, ensure_ascii=False) + "\n"
    fg_text = json.dumps(fg, indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not OUT_JSON.is_file():
            print(f"Missing {OUT_JSON}; run without --check to generate.", file=sys.stderr)
            sys.exit(2)
        try:
            existing_doc = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"Invalid JSON in {OUT_JSON}: {e}", file=sys.stderr)
            sys.exit(2)
        if _stable_json_blob(existing_doc) != _stable_json_blob(doc):
            print(
                f"{OUT_JSON} is stale. Run: python scripts/extract_config_flow_catalog.py",
                file=sys.stderr,
            )
            sys.exit(2)
        if not OUT_FIELD_GUIDE_JSON.is_file():
            print(f"Missing {OUT_FIELD_GUIDE_JSON}; run without --check to generate.", file=sys.stderr)
            sys.exit(2)
        try:
            existing_fg = json.loads(OUT_FIELD_GUIDE_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"Invalid JSON in {OUT_FIELD_GUIDE_JSON}: {e}", file=sys.stderr)
            sys.exit(2)
        if _stable_field_guide_blob(existing_fg) != _stable_field_guide_blob(fg):
            print(
                f"{OUT_FIELD_GUIDE_JSON} is stale. Run: python scripts/extract_config_flow_catalog.py",
                file=sys.stderr,
            )
            sys.exit(2)
        return
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(text, encoding="utf-8")
    OUT_FIELD_GUIDE_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_FIELD_GUIDE_JSON.write_text(fg_text, encoding="utf-8")
    print(f"Wrote {OUT_JSON.relative_to(REPO)} ({len(doc['steps'])} steps)")
    print(f"Wrote {OUT_FIELD_GUIDE_JSON.relative_to(REPO)}")


if __name__ == "__main__":
    main()
