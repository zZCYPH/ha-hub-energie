#!/usr/bin/env python3
"""
Reflow Hub Énergie flowhelp HTML fragments for shorter, scannable <p> blocks.

- Flattens <p><div>...</div>...</p> into several <p> (same reading rhythm, valid HTML).
- Splits long paragraphs at sentence boundaries while preserving inline tags.
- Skips <p> inside <pre> or <table>, and <p> that already contain block-level children.

Run from repo root: python scripts/reflow_flowhelp_prose.py
Optional: python scripts/beautify_flowhelp_html.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

REPO_ROOT = Path(__file__).resolve().parent.parent
BODIES = REPO_ROOT / "site" / "src" / "content" / "flowhelp" / "bodies"

BLOCK_TAGS = frozenset(
    {
        "div",
        "ul",
        "ol",
        "table",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
    }
)

MIN_PARA_CHARS_TO_SPLIT = 95
MIN_SEGMENT_CHARS = 28
SEMICOLON_SPLIT_THRESHOLD = 260


def _should_skip_p(p: Tag) -> bool:
    if p.find_parent("pre"):
        return True
    if p.find_parent("table"):
        return True
    return False


def _p_has_block_child(p: Tag) -> bool:
    for c in p.children:
        if isinstance(c, Tag) and c.name in BLOCK_TAGS:
            return True
    return False


def _only_div_children(p: Tag) -> bool:
    direct = [
        c
        for c in p.children
        if not (isinstance(c, NavigableString) and not str(c).strip())
    ]
    if not direct:
        return False
    return all(isinstance(c, Tag) and c.name == "div" for c in direct)


def flatten_p_wrapping_divs(soup: BeautifulSoup, p: Tag) -> bool:
    if not _only_div_children(p):
        return False
    direct = [
        c
        for c in p.children
        if not (isinstance(c, NavigableString) and not str(c).strip())
    ]
    for d in direct:
        np = soup.new_tag("p")
        for child in list(d.children):
            np.append(child)
        p.insert_before(np)
    p.decompose()
    return True


def _merge_tiny_segments(parts: list[str]) -> list[str]:
    out: list[str] = []
    for piece in parts:
        piece = piece.strip()
        if not piece:
            continue
        if out and len(piece) < 18:
            out[-1] = out[-1].rstrip() + " " + piece.lstrip()
        elif out and len(out[-1]) < 18:
            out[-1] = out[-1].rstrip() + " " + piece.lstrip()
        else:
            out.append(piece)
    return [x for x in out if x]


def _is_false_sentence_dot(html: str, i: int) -> bool:
    """True if dot at i is part of an abbreviation / decimal, not end of sentence."""
    if html[i] != ".":
        return False
    # Decimal: digit.digit
    if i > 0 and html[i - 1].isdigit():
        j = i + 1
        while j < len(html) and html[j].isspace():
            j += 1
        if j < len(html) and html[j].isdigit():
            return True
    # e.g.  i.e.  etc.
    if i >= 3 and html[i - 3 : i] in ("e.g", "i.e"):
        return True
    if i >= 3 and html[i - 3 : i] == "etc":
        return True
    if i >= 2 and html[i - 2 : i].lower() == "vs":
        return True
    return False


def split_html_outside_tags(html: str, break_chars: str) -> list[str]:
    n = len(html)
    buf: list[str] = []
    i = 0
    pieces: list[str] = []

    def flush_buf() -> str:
        nonlocal buf
        s = "".join(buf).strip()
        buf = []
        return s

    while i < n:
        if html[i] == "<":
            buf.append(html[i])
            i += 1
            while i < n and html[i] != ">":
                buf.append(html[i])
                i += 1
            if i < n:
                buf.append(html[i])
                i += 1
            continue

        ch = html[i]
        if ch in break_chars and i + 1 < n and html[i + 1].isspace():
            if ch == "." and _is_false_sentence_dot(html, i):
                buf.append(ch)
                i += 1
                continue

            buf.append(ch)
            i += 1
            while i < n and html[i].isspace():
                buf.append(html[i])
                i += 1
            seg = flush_buf()
            if seg and (len(seg) >= MIN_SEGMENT_CHARS or not pieces):
                pieces.append(seg)
            continue

        buf.append(ch)
        i += 1

    tail = flush_buf()
    if tail:
        pieces.append(tail)
    return _merge_tiny_segments(pieces)


def split_paragraph_inner_html(inner: str) -> list[str]:
    plain = re.sub(r"<[^>]+>", " ", inner)
    parts = split_html_outside_tags(inner, ".?!")
    if len(parts) <= 1 and len(plain) > SEMICOLON_SPLIT_THRESHOLD:
        parts = split_html_outside_tags(inner, ";")
    return parts


def replace_p_with_parts(soup: BeautifulSoup, p: Tag, parts: list[str]) -> None:
    # Always insert before the same anchor so order stays [part0, part1, …, p].
    for piece in parts:
        np = soup.new_tag("p")
        frag = BeautifulSoup(piece, "html.parser")
        for ch in list(frag.contents):
            np.append(ch)
        p.insert_before(np)
    p.decompose()


def reflow_prose(soup: BeautifulSoup, root: Tag) -> None:
    for p in list(root.find_all("p")):
        if _should_skip_p(p):
            continue
        flatten_p_wrapping_divs(soup, p)

    for p in list(root.find_all("p")):
        if _should_skip_p(p):
            continue
        if _p_has_block_child(p):
            continue
        text = p.get_text(separator=" ", strip=True)
        if len(text) < MIN_PARA_CHARS_TO_SPLIT:
            continue
        inner = "".join(str(c) for c in p.contents)
        parts = split_paragraph_inner_html(inner)
        if len(parts) <= 1:
            continue
        replace_p_with_parts(soup, p, parts)


def process_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    wrapped = f'<div id="__flowhelp_root__">{raw}</div>'
    soup = BeautifulSoup(wrapped, "html.parser")
    root = soup.find(id="__flowhelp_root__")
    if root is None:
        return False
    reflow_prose(soup, root)
    out = "".join(str(c) for c in root.children)
    if out != raw:
        nl = "\n" if not out.endswith("\n") else ""
        path.write_text(out + nl, encoding="utf-8")
        return True
    return False


def main() -> int:
    if not BODIES.is_dir():
        print(f"Missing directory: {BODIES}", file=sys.stderr)
        return 1
    files = sorted(BODIES.rglob("*.html"))
    changed = 0
    for f in files:
        if process_file(f):
            changed += 1
            print(f"updated {f.relative_to(REPO_ROOT)}")
    print(f"reflow_flowhelp_prose: {changed} file(s) changed, {len(files)} total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
