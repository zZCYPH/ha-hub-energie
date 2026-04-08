#!/usr/bin/env python3
"""Build a JSON catalog of Hub Énergie *initial* config-flow steps for the doc vitrine.

Reads ``config_flow.py`` (AST) for ``HubEnergieConfigFlow`` + ``_BatteryWizardMixin`` and
``strings.json`` for English titles / field labels. Declarative **scenarios** (linear paths)
are embedded here for the interactive preview; CI validates that every referenced ``step_id``
exists in the extracted catalog.

Full branching + validation cannot be replayed without Home Assistant; this artifact stays
aligned with real ``step_id`` values and integration strings.

Usage::
    python scripts/extract_config_flow_catalog.py              # write site/src/data/flowCatalog.generated.json
    python scripts/extract_config_flow_catalog.py --check     # exit 2 if output would change
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
OUT_JSON = REPO / "site/src/data/flowCatalog.generated.json"

CLASS_NAMES = frozenset({"HubEnergieConfigFlow", "_BatteryWizardMixin"})

# Linear paths for the doc “fake wizard”. Keep in sync with real navigation where possible.
SCENARIOS: list[dict[str, Any]] = [
    {
        "id": "tempo_rte",
        "title": "Tempo · RTE (mono, no battery)",
        "step_ids": [
            "user",
            "tariff_mode",
            "contract",
            "edf_offer",
            "edf_tempo",
            "edf_tempo_rte",
            "grid",
            "solar",
            "battery",
        ],
        "note": "After valid RTE credentials the integration fetches EDF tariffs internally, then continues to grid.",
    },
    {
        "id": "tempo_api",
        "title": "Tempo · API Couleur (mono, no battery)",
        "step_ids": [
            "user",
            "tariff_mode",
            "contract",
            "edf_offer",
            "edf_tempo",
            "grid",
            "solar",
            "battery",
        ],
        "note": "Choose API Couleur on the Tempo source step. Tariffs are fetched before grid.",
    },
    {
        "id": "manual_flat_edf",
        "title": "EDF · manual flat tariff (mono)",
        "step_ids": [
            "user",
            "tariff_mode",
            "contract",
            "manual_pricing",
            "manual_flat",
            "grid",
            "solar",
            "battery",
        ],
    },
    {
        "id": "other_supplier_flat",
        "title": "Other supplier · manual flat (mono)",
        "step_ids": [
            "user",
            "supplier_custom",
            "tariff_mode_manual_only",
            "contract",
            "manual_pricing",
            "manual_flat",
            "grid",
            "solar",
            "battery",
        ],
    },
    {
        "id": "tempo_rte_with_battery",
        "title": "Tempo · RTE + one battery",
        "step_ids": [
            "user",
            "tariff_mode",
            "contract",
            "edf_offer",
            "edf_tempo",
            "edf_tempo_rte",
            "grid",
            "solar",
            "battery",
            "battery_add",
            "battery_more",
        ],
    },
]


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


def _build_field_entries(step_id: str, raw: dict[str, Any]) -> dict[str, Any]:
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
            for sk, sl in subdata.items():
                if sk == "flow_nav":
                    continue
                subfields.append({"key": sk, "label": str(sl), "description": ""})
            sections_out.append({"id": sec_key, "name": name, "fields": subfields})
    return {
        "title": str(raw.get("title", "")),
        "description": str(raw.get("description", "")),
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


def extract_steps() -> list[dict[str, Any]]:
    tree = ast.parse(CONFIG_FLOW.read_text(encoding="utf-8"))
    by_step: dict[str, dict[str, Any]] = {}
    strings_root = json.loads(STRINGS_JSON.read_text(encoding="utf-8"))
    step_strings: dict[str, Any] = strings_root.get("config", {}).get("step", {})

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
        raw = step_strings.get(step_id, {})
        if not isinstance(raw, dict):
            raw = {}
        merged: dict[str, Any] = {
            **meta,
            "strings": _build_field_entries(step_id, raw),
        }
        if not merged["strings"]["title"]:
            merged["strings"]["title"] = step_id.replace("_", " ").title()
        steps.append(merged)

    return steps


def validate_scenarios(steps: list[dict[str, Any]]) -> None:
    ids = {s["step_id"] for s in steps}
    for sc in SCENARIOS:
        for sid in sc["step_ids"]:
            if sid not in ids:
                raise SystemExit(f"Scenario {sc['id']!r} references unknown step_id {sid!r}")


def build_doc() -> dict[str, Any]:
    steps = extract_steps()
    validate_scenarios(steps)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_files": {
            "config_flow": CONFIG_FLOW.relative_to(REPO).as_posix(),
            "strings": STRINGS_JSON.relative_to(REPO).as_posix(),
        },
        "steps": steps,
        "scenarios": SCENARIOS,
    }


def _stable_json_blob(doc: dict[str, Any]) -> str:
    """Compare catalog content without the volatile timestamp."""
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
    text = json.dumps(doc, indent=2, ensure_ascii=False) + "\n"
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
        return
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(text, encoding="utf-8")
    print(f"Wrote {OUT_JSON.relative_to(REPO)} ({len(doc['steps'])} steps, {len(doc['scenarios'])} scenarios)")


if __name__ == "__main__":
    main()
