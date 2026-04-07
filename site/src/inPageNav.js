/**
 * Fragment HTML uses Bootstrap offcanvas + `data-bs-dismiss="offcanvas"` on TOC links.
 * Bootstrap always preventDefault() on those, so `href="#/"` / `href="#/internals"` never
 * update the hash — we must route with Vue Router and hide the offcanvas ourselves.
 *
 * In-page anchors `href="#section"` stay compatible with ScrollSpy via router.push + hash.
 */
function dismissOpenOffcanvas() {
  if (typeof bootstrap === "undefined") return;
  document.querySelectorAll(".offcanvas.show").forEach((el) => {
    const inst = bootstrap.Offcanvas.getInstance(el);
    if (inst) inst.hide();
  });
}

function parseSpaHashHref(href) {
  if (!href.startsWith("#/")) return null;
  const tail = href.slice(1);
  const [pathPart, ...hashParts] = tail.split("#");
  const path =
    pathPart === "" || pathPart === "/"
      ? "/"
      : pathPart.startsWith("/")
        ? pathPart
        : `/${pathPart}`;
  const hash = hashParts.length ? `#${hashParts.join("#")}` : undefined;
  return { path, hash };
}

export function attachInPageNav(root, router, basePath) {
  if (!root) return () => {};

  const onClick = (e) => {
    const a = e.target.closest("a");
    if (!a || !root.contains(a)) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const spa = parseSpaHashHref(href);
    if (spa) {
      e.preventDefault();
      e.stopPropagation();
      const dest = spa.hash ? { path: spa.path, hash: spa.hash } : spa.path;
      router.push(dest).then(() => {
        dismissOpenOffcanvas();
        if (spa.hash) {
          const id = spa.hash.replace(/^#/, "");
          requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      });
      return;
    }

    if (href === "#") return;
    const m = /^#([A-Za-z0-9_-]+)$/.exec(href);
    if (!m) return;
    e.preventDefault();
    e.stopPropagation();
    const id = m[1];
    router.push({ path: basePath, hash: `#${id}` }).then(() => {
      dismissOpenOffcanvas();
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  root.addEventListener("click", onClick, true);
  return () => root.removeEventListener("click", onClick, true);
}
