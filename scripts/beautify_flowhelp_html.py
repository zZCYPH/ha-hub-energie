#!/usr/bin/env python3
"""
Beautify Hub Énergie flowhelp body fragments:
  site/src/content/flowhelp/bodies/**/*.html

Uses Prettier (HTML parser) via npx — requires Node.js on PATH.
Run from repo root: python scripts/beautify_flowhelp_html.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


def resolve_npx() -> str | None:
    for name in ("npx", "npx.cmd"):
        p = shutil.which(name)
        if p:
            return p
    return None

REPO_ROOT = Path(__file__).resolve().parent.parent
BODIES = REPO_ROOT / "site" / "src" / "content" / "flowhelp" / "bodies"
SITE_DIR = REPO_ROOT / "site"


def main() -> int:
    if not BODIES.is_dir():
        print(f"Missing directory: {BODIES}", file=sys.stderr)
        return 1
    files = sorted(BODIES.rglob("*.html"))
    if not files:
        print(f"No HTML files under {BODIES}", file=sys.stderr)
        return 1
    npx = resolve_npx()
    if not npx:
        print("npx not found — install Node.js and ensure npx is on PATH.", file=sys.stderr)
        return 1
    print(
        f"Beautifying {len(files)} file(s) under flowhelp/bodies/ ...",
        flush=True,
    )
    # Windows CMD has a short max command length; batch file lists.
    batch_size = 25
    for i in range(0, len(files), batch_size):
        chunk = files[i : i + batch_size]
        cmd = [
            npx,
            "--yes",
            "prettier",
            "--write",
            "--parser",
            "html",
            *[str(p) for p in chunk],
        ]
        r = subprocess.run(cmd, cwd=SITE_DIR)
        if r.returncode != 0:
            return r.returncode
    print(f"Beautified {len(files)} file(s) under flowhelp/bodies/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
