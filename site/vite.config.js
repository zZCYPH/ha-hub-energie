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
        const block = `    <meta property="og:site_name" content="Hub Énergie" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:title" content="Hub Énergie" />
    <meta property="og:description" content="${ogDesc.replace(/"/g, "&quot;")}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Hub Énergie — intégration Home Assistant" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Hub Énergie" />
    <meta name="twitter:description" content="${ogDesc.replace(/"/g, "&quot;")}" />
    <meta name="twitter:image" content="${ogImage}" />`;
        return html.replace("</title>", `</title>\n${block}`);
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
