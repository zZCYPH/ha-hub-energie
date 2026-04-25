/**
 * Per-route document head: title, description, Open Graph / Twitter, canonical, JSON-LD.
 * Runs client-side after navigation (hash-free URLs for history mode).
 */
import { getLang } from "./siteShell";
import { appBasePath } from "./sitePaths";

const DEFAULT_ORIGIN = "https://hub-energie.ts-devops.com";

function tr(lang, key) {
  const I = globalThis.HubEnergieI18n;
  if (!I) return "";
  const bag = I[lang] || I.en;
  let s = bag[key];
  if (s === undefined && lang !== "en") s = I.en[key];
  return s !== undefined ? s : "";
}

function origin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_ORIGIN;
}

/** Absolute URL to the default social preview image (Facebook / Twitter / LinkedIn). */
function openGraphImageUrl() {
  const o = origin();
  const prefix = appBasePath();
  return prefix ? `${o}${prefix}/img/og-social.png` : `${o}/img/og-social.png`;
}

function upsertMetaByName(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaProperty(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkRel(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function titleAndDescKeys(routeName) {
  if (routeName === "home") return ["meta.title.landing", "meta.description.landing"];
  if (routeName === "showcase") return ["meta.title.showcase", "meta.description.showcase"];
  if (routeName === "lovelace-cards") return ["meta.title.lovelace_cards", "meta.description.lovelace_cards"];
  if (routeName === "flowhelp") return ["meta.title.flowhelp", "meta.description.flowhelp"];
  if (routeName === "internals") return ["meta.title.internals", "meta.description.internals"];
  if (routeName === "changelog") return ["meta.title.changelog", "meta.description.changelog"];
  if (routeName === "developers") return ["meta.title.developers", "meta.description.developers"];
  return ["meta.title.landing", "meta.description.landing"];
}

function jsonLdForRoute(routeName, lang, pageUrl, title, description) {
  const ver =
    typeof globalThis.HubEnergieManifestVersion === "string" ? globalThis.HubEnergieManifestVersion : "";
  if (routeName === "home") {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hub Énergie",
      url: `${origin()}${appBasePath() || ""}/`,
      description,
      inLanguage: lang === "fr" ? "fr" : "en",
    };
  }
  if (routeName === "showcase") {
    const o = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Hub Énergie",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Home Assistant",
      url: pageUrl,
      description,
      inLanguage: lang === "fr" ? "fr" : "en",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
    };
    if (ver) o.softwareVersion = ver;
    return o;
  }
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: pageUrl,
    description,
    inLanguage: lang === "fr" ? "fr" : "en",
    isPartOf: { "@type": "WebSite", name: "Hub Énergie", url: `${origin()}/` },
  };
}

/**
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 */
export function applyRouteHead(route) {
  const lang = getLang();
  const [titleKey, descKey] = titleAndDescKeys(route.name);
  const title = tr(lang, titleKey);
  const description = tr(lang, descKey);
  if (title) document.title = title;
  upsertMetaByName("description", description);

  const base = origin();
  const pathQuery = route.fullPath.split("#")[0] || "/";
  const pq = pathQuery.startsWith("/") ? pathQuery : `/${pathQuery}`;
  const prefix = appBasePath();
  const pageUrl = `${base}${prefix}${pq}`;

  upsertLinkRel("canonical", pageUrl);
  upsertMetaProperty("og:site_name", "Hub Énergie");
  upsertMetaProperty("og:title", title);
  upsertMetaProperty("og:description", description);
  upsertMetaProperty("og:url", pageUrl);
  upsertMetaProperty("og:type", route.name === "home" ? "website" : "article");
  upsertMetaProperty("og:locale", lang === "fr" ? "fr_FR" : "en_US");
  const ogImage = openGraphImageUrl();
  upsertMetaProperty("og:image", ogImage);
  upsertMetaProperty("og:image:secure_url", ogImage);
  upsertMetaProperty("og:image:type", "image/png");
  upsertMetaProperty("og:image:width", "1200");
  upsertMetaProperty("og:image:height", "630");
  upsertMetaProperty("og:image:alt", tr(lang, "meta.og_image_alt") || "Hub Énergie");
  upsertMetaByName("twitter:card", "summary_large_image");
  upsertMetaByName("twitter:title", title);
  upsertMetaByName("twitter:description", description);
  upsertMetaByName("twitter:image", ogImage);

  setJsonLd("hub-energie-jsonld", jsonLdForRoute(route.name, lang, pageUrl, title, description));
}
