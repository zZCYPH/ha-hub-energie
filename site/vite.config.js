import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { applyHubEnergieVersionTokens } from "./scripts/manifest-version.mjs";

/**
 * Replace `{{HUB_ENERGIE_VERSION}}` / `{{HUB_ENERGIE_VERSION_SERIES}}` in raw HTML bundled as `?raw`
 * (see `site/scripts/manifest-version.mjs`; source of truth: `custom_components/hub_energie/manifest.json`).
 */
function hubEnergieManifestVersionPlugin() {
  return {
    name: "hub-energie-manifest-version-html",
    transform(code, id) {
      if (!id.includes(".html")) return null;
      if (!id.includes("landing-body.html") && !id.includes("doc-fragment.html")) return null;
      const hasToken =
        code.includes("{{HUB_ENERGIE_VERSION}}") || code.includes("{{HUB_ENERGIE_VERSION_SERIES}}");
      if (!hasToken) return null;
      return applyHubEnergieVersionTokens(code);
    },
  };
}

export default defineConfig({
  plugins: [vue(), hubEnergieManifestVersionPlugin()],
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
