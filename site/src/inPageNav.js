import { appBasePath } from "./sitePaths";

/**
 * Fragment HTML uses Bootstrap offcanvas + `data-bs-dismiss="offcanvas"` on TOC links.
 * Bootstrap always preventDefault() on those, so plain `href` on in-app routes never
 * reach Vue Router — we must navigate with the router and hide the offcanvas ourselves.
 *
 * Supports history-mode paths (`/showcase`, `/internals`, …) and legacy hash URLs (`#/…`).
 * In-page anchors `href="#section"` stay compatible with ScrollSpy via router.push + hash.
 */
function dismissOpenOffcanvas() {
  if (typeof bootstrap === "undefined") return;
  document.querySelectorAll(".offcanvas.show").forEach((el) => {
    const inst = bootstrap.Offcanvas.getInstance(el);
    if (inst) inst.hide();
  });
}

const INTERNAL_ROUTES = new Set(["/", "/showcase", "/lovelace-cards", "/doc/setup-help", "/internals", "/dev"]);

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Strip Vite `base` from the URL pathname so we match Vue route paths. */
function pathnameWithoutBase(pathname) {
  const base = appBasePath();
  if (!base) return normalizePathname(pathname);
  const n = normalizePathname(pathname);
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  if (n === b || n === `${b}/`) return "/";
  if (n.startsWith(`${b}/`)) return normalizePathname(n.slice(b.length));
  return n;
}

/** @returns {{ path: string, hash?: string } | null} */
function parseHashSpaHref(href) {
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

/** Same-origin app paths only (history mode). */
function parsePathSpaHref(href) {
  if (!href || href.startsWith("//") || href.startsWith("#")) return null;
  try {
    const u = new URL(href, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    const routePath = pathnameWithoutBase(u.pathname);
    if (!INTERNAL_ROUTES.has(routePath)) return null;
    const pathForRouter = (routePath === "/" ? "/" : routePath) + (u.search || "");
    const hash = u.hash && u.hash.length > 1 ? u.hash : undefined;
    return { path: pathForRouter, hash };
  } catch {
    return null;
  }
}

export function attachInPageNav(root, router, basePath) {
  if (!root) return () => {};

  const onClick = (e) => {
    const a = e.target.closest("a");
    if (!a || !root.contains(a)) return;
    const href = a.getAttribute("href");
    if (!href) return;

    const spa = parsePathSpaHref(href) || parseHashSpaHref(href);
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

    if (!href.startsWith("#")) return;
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
