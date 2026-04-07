import { defineConfig } from "vite";
import { resolve } from "node:path";

const humanReadableDist =
  process.env.HUB_ENERGIE_HUMAN_READABLE_DIST === "1" ||
  process.env.HUB_ENERGIE_HUMAN_READABLE_DIST === "true";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: humanReadableDist ? "dist-human" : "dist",
    emptyOutDir: true,
    sourcemap: humanReadableDist,
    minify: humanReadableDist ? false : "esbuild",
    cssCodeSplit: !humanReadableDist,
    lib: {
      entry: {
        "hub-energie-card-boot": resolve(__dirname, "src/hub-energie-card-boot.js"),
        "hub-energie-card": resolve(__dirname, "src/hub-energie-card.js"),
      },
      formats: ["es"],
      fileName: (format, entryName) => {
        if (humanReadableDist) {
          return entryName === "hub-energie-card-boot"
            ? "hub-energie-card-boot.human.js"
            : "hub-energie-card.human.js";
        }
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
});
