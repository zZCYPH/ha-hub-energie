import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/** GitLab Pages project URLs use a path prefix; set `VITE_SITE_BASE` in CI (e.g. `/group/project/`). */
const base = process.env.VITE_SITE_BASE && process.env.VITE_SITE_BASE !== "" ? process.env.VITE_SITE_BASE : "/";

/** Absolute site root for Open Graph / Twitter cards (Facebook, Slack, etc.). Override in CI if needed. */
function canonicalSiteRoot() {
  const origin = (process.env.VITE_CANONICAL_ORIGIN || "https://hub-energie.ts-devops.com").replace(/\/$/, "");
  const raw = process.env.VITE_SITE_BASE || "/";
  if (raw === "/" || raw === "") return origin;
  const pathPrefix = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  const p = pathPrefix.startsWith("/") ? pathPrefix : `/${pathPrefix}`;
  return `${origin}${p}`;
}

/** Escape text inside double-quoted HTML attributes (Open Graph / Twitter). */
function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

const PLACEHOLDER_CANONICAL_ROOT = "__HUB_ENERGIE_CANONICAL_ROOT__";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "hub-energie-html-social-meta",
      transformIndexHtml(html) {
        const root = canonicalSiteRoot();
        if (!html.includes(PLACEHOLDER_CANONICAL_ROOT)) {
          // eslint-disable-next-line no-console
          console.warn(
            `[hub-energie-html-social-meta] index.html should contain ${PLACEHOLDER_CANONICAL_ROOT} for og:image URLs.`,
          );
        }
        let out = html.replaceAll(PLACEHOLDER_CANONICAL_ROOT, root);
        /** Default Open Graph for crawlers that do not execute JS (SPA). Route-specific tags still come from headManager.js. */
        const ogImage = `${root}/img/og-social.png`;
        const ogUrl = `${root}/`;
        const ogDesc =
          "Hub Énergie — une seule intégration Home Assistant pour tarifs, énergie, coûts, solaire, batteries et diagnostics.";
        const ogTitle = "Hub Énergie";
        const ogImageAlt = "Hub Énergie — intégration Home Assistant";
        const ogCore = `    <meta property="og:title" content="${escapeAttr(ogTitle)}" />
    <meta property="og:description" content="${escapeAttr(ogDesc)}" />
    <meta property="og:url" content="${escapeAttr(ogUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(ogTitle)}" />
    <meta property="og:locale" content="fr_FR" />`;
        const twitterBlock = `    <meta name="twitter:title" content="${escapeAttr(ogTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(ogDesc)}" />`;
        const block = `${ogCore}\n${twitterBlock}`;
        /** Match charset whether the serializer keeps self-closing void tags or not. */
        const reCharset = /<meta\s+charset=["']utf-8["']\s*\/?>/i;
        if (!reCharset.test(out)) {
          // eslint-disable-next-line no-console
          console.warn("[hub-energie-html-social-meta] could not find <meta charset> to inject default OG tags.");
          return out;
        }
        return out.replace(reCharset, (m) => `${m}\n${block}`);
      },
    },
  ],
  base: base.endsWith("/") ? base : `${base}/`,
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
