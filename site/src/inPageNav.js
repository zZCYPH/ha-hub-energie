/**
 * Keep Bootstrap-friendly #section links while syncing the hash with vue-router (e.g. #/doc#overview).
 */
export function attachInPageNav(root, router, basePath) {
  if (!root) return () => {};
  const onClick = (e) => {
    const a = e.target.closest("a");
    if (!a || !root.contains(a)) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    if (href.startsWith("#/")) return;
    if (href === "#") return;
    const m = /^#([A-Za-z0-9_-]+)$/.exec(href);
    if (!m) return;
    e.preventDefault();
    const id = m[1];
    router.push({ path: basePath, hash: `#${id}` }).then(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
