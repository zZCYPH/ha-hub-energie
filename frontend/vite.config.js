import { defineConfig } from "vite";
import { resolve } from "node:path";

const humanReadableDist =
  process.env.HUB_ENERGIE_HUMAN_READABLE_DIST === "1" ||
  process.env.HUB_ENERGIE_HUMAN_READABLE_DIST === "true";

export default defineConfig({
  build: {
    outDir: humanReadableDist ? "dist-human" : "dist",
    emptyOutDir: true,
    sourcemap: humanReadableDist,
    minify: humanReadableDist ? false : "esbuild",
    cssCodeSplit: !humanReadableDist,
    lib: {
      entry: resolve(__dirname, "src/hub-energie-card.js"),
      formats: ["es"],
      fileName: () => (humanReadableDist ? "hub-energie-card.human.js" : "hub-energie-card.js"),
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
