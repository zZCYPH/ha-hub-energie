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

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "hub-energie-html-social-meta",
      transformIndexHtml(html) {
        const root = canonicalSiteRoot();
        const ogImage = `${root}/img/og-social.png`;
        const ogUrl = `${root}/`;
        const ogDesc =
          "Hub Énergie — une seule intégration Home Assistant pour tarifs, énergie, coûts, solaire, batteries et diagnostics.";
        const ogTitle = "Hub Énergie";
        const ogImageAlt = "Hub Énergie — intégration Home Assistant";
        /** Put Open Graph first: Facebook flags “inferred og:image” if image tags dominate before explicit og:image. */
        const ogCore = `    <meta property="og:title" content="${escapeAttr(ogTitle)}" />
    <meta property="og:description" content="${escapeAttr(ogDesc)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeAttr(ogImage)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeAttr(ogImageAlt)}" />
    <meta property="og:url" content="${escapeAttr(ogUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(ogTitle)}" />
    <meta property="og:locale" content="fr_FR" />`;
        const twitterBlock = `    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(ogTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(ogDesc)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />`;
        const block = `${ogCore}\n${twitterBlock}`;
        return html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n${block}`);
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
