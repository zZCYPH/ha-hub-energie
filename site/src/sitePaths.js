/**
 * Vite `BASE_URL` (e.g. `/` locally, `/group/project/` on GitLab Pages default domain).
 * Use for same-origin `<a href>` so inPageNav and static hosts agree.
 */
export function appBasePath() {
  const b = import.meta.env.BASE_URL || "/";
  if (b === "/" || b === "") return "";
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

/** @param {string} path route path starting with `/` (Vue Router path, no duplicate base) */
export function pathTo(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = appBasePath();
  return base ? `${base}${p}` : p;
}

/** Prefix root-relative app links inside i18n HTML when the app is hosted under `BASE_URL`. */
export function rewriteI18nHtmlAppLinks(rootEl) {
  const base = appBasePath();
  if (!base || !rootEl) return;
  rootEl.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href");
    if (!h || !h.startsWith("/") || h.startsWith("//")) return;
    if (/^\/(showcase|lovelace-cards|internals|doc\/|dev)(\/|$|#|\?)/.test(h) || h.startsWith("/doc/setup-help")) {
      a.setAttribute("href", `${base}${h}`);
    }
  });
}
