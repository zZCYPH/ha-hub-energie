/**
 * Hub Énergie doc site: language (i18n), light/dark theme, scroll spy, mobile TOC.
 * Requires: i18n.js (HubEnergieI18n), Bootstrap bundle (ScrollSpy).
 */
(function () {
  "use strict";

  var THEME_KEY = "hub-energie-doc-theme";
  var LANG_KEY = "hub-energie-doc-lang";

  function tr(lang, key) {
    var I = window.HubEnergieI18n;
    if (!I) return "";
    var bag = I[lang] || I.en;
    var s = bag[key];
    if (s === undefined && lang !== "en") s = I.en[key];
    return s !== undefined ? s : "";
  }

  function refreshScrollSpy() {
    if (typeof bootstrap === "undefined" || !bootstrap.ScrollSpy) return;
    var inst = bootstrap.ScrollSpy.getInstance(document.body);
    if (inst) inst.refresh();
  }

  function applyLang(lang) {
    if (lang !== "en" && lang !== "fr") lang = "en";
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = tr(lang, el.getAttribute("data-i18n"));
      if (v !== "") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = tr(lang, el.getAttribute("data-i18n-html"));
      if (v !== "") el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", tr(lang, el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var v = tr(lang, el.getAttribute("data-i18n-title"));
      if (v !== "") el.setAttribute("title", v);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var va = tr(lang, el.getAttribute("data-i18n-alt"));
      if (va !== "") el.setAttribute("alt", va);
    });
    document.title = tr(lang, "meta.title");
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", tr(lang, "meta.description"));
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    var bEn = document.getElementById("langEn");
    var bFr = document.getElementById("langFr");
    if (bEn && bFr) {
      bEn.classList.toggle("active", lang === "en");
      bFr.classList.toggle("active", lang === "fr");
      bEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
      bFr.setAttribute("aria-pressed", lang === "fr" ? "true" : "false");
    }
    refreshScrollSpy();
  }

  function setTheme(mode) {
    if (mode !== "light" && mode !== "dark") mode = "dark";
    document.documentElement.setAttribute("data-bs-theme", mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch (e) {}
    var tl = document.getElementById("themeLight");
    var td = document.getElementById("themeDark");
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

  var storedLang = readStoredLang();
  var navLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  var initialLang =
    storedLang === "en" || storedLang === "fr"
      ? storedLang
      : navLang === "fr"
        ? "fr"
        : "en";

  var storedTheme = readStoredTheme();
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initialTheme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";

  setTheme(initialTheme);

  document.getElementById("themeLight").addEventListener("click", function () {
    setTheme("light");
  });
  document.getElementById("themeDark").addEventListener("click", function () {
    setTheme("dark");
  });

  document.getElementById("langEn").addEventListener("click", function () {
    applyLang("en");
  });
  document.getElementById("langFr").addEventListener("click", function () {
    applyLang("fr");
  });

  applyLang(initialLang);

  function wireDocCarouselImages() {
    document.querySelectorAll("img.doc-carousel-img").forEach(function (img) {
      function showFallback() {
        img.classList.add("d-none");
        var wrap = img.parentElement;
        if (!wrap) return;
        var fb = wrap.querySelector(".doc-carousel-fallback");
        if (fb) {
          fb.classList.remove("d-none");
          fb.classList.add("d-flex");
        }
      }
      if (img.complete && img.naturalWidth === 0) showFallback();
      img.addEventListener("error", showFallback);
    });
  }

  function wireCarouselPair(carouselId, treeRootId) {
    var el = document.getElementById(carouselId);
    var root = document.getElementById(treeRootId);
    if (!el || !root || typeof bootstrap === "undefined") return;
    var carousel = bootstrap.Carousel.getOrCreateInstance(el, { interval: false });
    function syncTree(idx) {
      root.querySelectorAll(".doc-carousel-jump").forEach(function (btn) {
        var to = parseInt(btn.getAttribute("data-doc-slide-to"), 10);
        btn.classList.toggle("active", to === idx);
      });
    }
    root.querySelectorAll(".doc-carousel-jump").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-doc-slide-to"), 10);
        if (!isNaN(i)) carousel.to(i);
      });
    });
    el.addEventListener("slid.bs.carousel", function () {
      var items = el.querySelectorAll(".carousel-item");
      var active = el.querySelector(".carousel-item.active");
      var idx = Array.prototype.indexOf.call(items, active);
      if (idx >= 0) syncTree(idx);
    });
    syncTree(0);
  }

  wireDocCarouselImages();
  wireCarouselPair("configFlowCarousel", "configFlowTree");
  wireCarouselPair("devicesGalleryCarousel", "devicesGalleryTree");

  document.querySelectorAll('#toc-nav-mobile a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var el = document.querySelector(a.getAttribute("href"));
      if (el) {
        setTimeout(function () {
          el.scrollIntoView({ block: "start" });
        }, 280);
      }
    });
  });
})();
