import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/** GitLab Pages project URLs use a path prefix; set `VITE_SITE_BASE` in CI (e.g. `/group/project/`). */
const base = process.env.VITE_SITE_BASE && process.env.VITE_SITE_BASE !== "" ? process.env.VITE_SITE_BASE : "/";

export default defineConfig({
  plugins: [vue()],
  base: base.endsWith("/") ? base : `${base}/`,
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
