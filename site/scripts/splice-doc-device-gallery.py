#!/usr/bin/env python3
"""Splice doc-devices-carousel-inner.include.html into doc-fragment.html (carousel-inner)."""

from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FRAG = REPO / "src/assets/doc-fragment.html"
INNER = REPO / "src/assets/doc-devices-carousel-inner.include.html"


def main() -> None:
    text = FRAG.read_text(encoding="utf-8")
    inner = INNER.read_text(encoding="utf-8")
    start_tag = 'id="devicesGalleryCarousel"'
    mid = '<div class="carousel-inner">'
    end_marker = '                  </div>\n                  <button\n                    class="carousel-control-prev"'
    i0 = text.index(start_tag)
    i1 = text.index(mid, i0) + len(mid)
    i2 = text.index(end_marker, i1)
    new_text = text[:i1] + "\n" + inner.rstrip() + "\n" + text[i2:]
    FRAG.write_text(new_text, encoding="utf-8")
    print(f"Updated {FRAG.relative_to(REPO)}")


if __name__ == "__main__":
    main()
