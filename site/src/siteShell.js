/**
 * i18n meta, theme, lang toggles (ported from public/js/app.js).
 */
import { nextTick } from "vue";
import { applyRouteHead } from "./headManager";
import { rewriteI18nHtmlAppLinks } from "./sitePaths";

const THEME_KEY = "hub-energie-doc-theme";
const LANG_KEY = "hub-energie-doc-lang";

let currentLang = "en";

function tr(lang, key) {
  const I = globalThis.HubEnergieI18n;
  if (!I) return "";
  const bag = I[lang] || I.en;
  let s = bag[key];
  if (s === undefined && lang !== "en") s = I.en[key];
  return s !== undefined ? s : "";
}

export function refreshScrollSpy() {
  if (typeof bootstrap === "undefined" || !bootstrap.ScrollSpy) return;
  const inst = bootstrap.ScrollSpy.getInstance(document.body);
  if (!inst) return;
  try {
    inst.refresh();
  } catch {
    /* Invalid TOC href (e.g. SPA hash) should not break i18n sync */
  }
}

/** Apply `data-i18n*` attributes under `root` (or full document if omitted). */
export function applyDataI18nTo(root) {
  const scope = root && typeof root.querySelectorAll === "function" ? root : document;
  const lang = currentLang;
  scope.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = tr(lang, el.getAttribute("data-i18n"));
    if (v !== "") el.textContent = v;
  });
  scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const v = tr(lang, el.getAttribute("data-i18n-html"));
    if (v !== "") {
      el.innerHTML = v;
      rewriteI18nHtmlAppLinks(el);
    }
  });
  scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", tr(lang, el.getAttribute("data-i18n-aria")));
  });
  scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const v = tr(lang, el.getAttribute("data-i18n-title"));
    if (v !== "") el.setAttribute("title", v);
  });
  scope.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const va = tr(lang, el.getAttribute("data-i18n-alt"));
    if (va !== "") el.setAttribute("alt", va);
  });
  scope.querySelectorAll("[data-i18n-bs-title]").forEach((el) => {
    const k = el.getAttribute("data-i18n-bs-title");
    const vt = tr(lang, k);
    if (vt !== "") el.setAttribute("data-bs-title", vt);
  });
}

export function applyLang(lang, page) {
  if (lang !== "en" && lang !== "fr") lang = "en";
  currentLang = lang;
  document.documentElement.setAttribute("lang", lang);
  applyDataI18nTo(document);
  document.querySelectorAll("img.doc-zoomable").forEach((el) => {
    const vt = tr(lang, "common.image_open_full");
    if (vt !== "") el.setAttribute("title", vt);
  });

  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* ignore */
  }
  const bEn = document.getElementById("langEn");
  const bFr = document.getElementById("langFr");
  if (bEn && bFr) {
    bEn.classList.toggle("active", lang === "en");
    bFr.classList.toggle("active", lang === "fr");
    bEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    bFr.setAttribute("aria-pressed", lang === "fr" ? "true" : "false");
  }
  refreshFooterSocialTooltips();
  refreshScrollSpy();
  window.dispatchEvent(new CustomEvent("hub-energie-lang", { detail: { lang } }));
}

function disposeFooterSocialTooltips() {
  if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
  document.querySelectorAll(".site-app-footer .site-social-tooltip-host").forEach((el) => {
    const inst = bootstrap.Tooltip.getInstance(el);
    if (inst) inst.dispose();
  });
}

function initFooterSocialTooltips() {
  if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
  document.querySelectorAll(".site-app-footer .site-social-tooltip-host").forEach((el) => {
    const title = el.getAttribute("data-bs-title");
    if (!title) return;
    bootstrap.Tooltip.getInstance(el)?.dispose();
    new bootstrap.Tooltip(el, {
      title,
      customClass: "site-social-tooltip",
      placement: "top",
      fallbackPlacements: ["bottom", "left", "right"],
      trigger: "hover focus",
      boundary: "viewport",
    });
  });
}

function refreshFooterSocialTooltips() {
  disposeFooterSocialTooltips();
  initFooterSocialTooltips();
}

export function setTheme(mode) {
  if (mode !== "light" && mode !== "dark") mode = "dark";
  document.documentElement.setAttribute("data-bs-theme", mode);
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (e) {
    /* ignore */
  }
  const tl = document.getElementById("themeLight");
  const td = document.getElementById("themeDark");
  if (tl && td) {
    tl.classList.toggle("active", mode === "light");
    td.classList.toggle("active", mode === "dark");
    tl.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
    td.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  }
}

function readStoredLang() {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch (e) {
    return null;
  }
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (e) {
    return null;
  }
}

function pageFromRouteName(name) {
  if (name === "home") return "landing";
  if (name === "showcase") return "showcase";
  if (name === "lovelace-cards") return "showcase";
  if (name === "flowhelp") return "flowhelp";
  if (name === "internals") return "internals";
  if (name === "changelog") return "changelog";
  if (name === "developers") return "developers";
  return "landing";
}

export function getLang() {
  return currentLang;
}

export function applyStoredShell() {
  const storedLang = readStoredLang();
  const initialLang =
    storedLang === "en" || storedLang === "fr" ? storedLang : "fr";
  currentLang = initialLang;

  const storedTheme = readStoredTheme();
  const initialTheme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";

  setTheme(initialTheme);
}

/**
 * Apply theme to the document (already set before mount) and sync toggle buttons,
 * then replace data-i18n / meta from current route. Must run after Vue commits v-html.
 */
function resyncShellAfterDom(router) {
  nextTick(() => {
    const mode =
      document.documentElement.getAttribute("data-bs-theme") === "light"
        ? "light"
        : "dark";
    setTheme(mode);
    applyLang(currentLang, pageFromRouteName(router.currentRoute.value.name));
    applyRouteHead(router.currentRoute.value);
  });
}

export function bindShellControls(router) {
  const themeLight = document.getElementById("themeLight");
  const themeDark = document.getElementById("themeDark");
  if (themeLight)
    themeLight.addEventListener("click", () => {
      setTheme("light");
    });
  if (themeDark)
    themeDark.addEventListener("click", () => {
      setTheme("dark");
    });

  const langEn = document.getElementById("langEn");
  const langFr = document.getElementById("langFr");
  const routeName = () => router.currentRoute.value.name;
  if (langEn)
    langEn.addEventListener("click", () => {
      applyLang("en", pageFromRouteName(routeName()));
      nextTick(() => applyLang(currentLang, pageFromRouteName(routeName())));
    });
  if (langFr)
    langFr.addEventListener("click", () => {
      applyLang("fr", pageFromRouteName(routeName()));
      nextTick(() => applyLang(currentLang, pageFromRouteName(routeName())));
    });

  router.afterEach(() => {
    resyncShellAfterDom(router);
  });

  resyncShellAfterDom(router);
}

export function setupScrollSpy(route) {
  if (route !== "showcase" && route !== "internals" && route !== "lovelace-cards") {
    teardownScrollSpy();
    return;
  }
  if (typeof bootstrap === "undefined" || !bootstrap.ScrollSpy) return;
  const old = bootstrap.ScrollSpy.getInstance(document.body);
  if (old) old.dispose();
  document.body.removeAttribute("data-bs-spy");
  document.body.removeAttribute("data-bs-target");
  document.body.removeAttribute("data-bs-smooth-scroll");
  document.body.removeAttribute("data-bs-offset");

  const targetId =
    route === "internals"
      ? "toc-nav-internals"
      : route === "lovelace-cards"
        ? "toc-nav-lovelace-cards"
        : "toc-nav-doc";
  const targetEl = document.getElementById(targetId);
  /* Use an element for `target`: string resolution can fall back to body and scan every [href]. */
  if (!targetEl) return;

  try {
    document.body.setAttribute("data-bs-spy", "scroll");
    document.body.setAttribute("data-bs-target", `#${targetId}`);
    document.body.setAttribute("data-bs-smooth-scroll", "true");
    document.body.setAttribute("data-bs-offset", "80");
    new bootstrap.ScrollSpy(document.body, {
      target: targetEl,
      offset: 80,
      smoothScroll: true,
    });
  } catch {
    teardownScrollSpy();
  }
}

export function teardownScrollSpy() {
  if (typeof bootstrap === "undefined" || !bootstrap.ScrollSpy) return;
  const old = bootstrap.ScrollSpy.getInstance(document.body);
  if (old) old.dispose();
  document.body.removeAttribute("data-bs-spy");
  document.body.removeAttribute("data-bs-target");
  document.body.removeAttribute("data-bs-smooth-scroll");
  document.body.removeAttribute("data-bs-offset");
}
