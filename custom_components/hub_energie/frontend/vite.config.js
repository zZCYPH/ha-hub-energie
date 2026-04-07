import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    cssCodeSplit: true,
    lib: {
      entry: {
        "hub-energie-card-boot": resolve(__dirname, "src/hub-energie-card-boot.js"),
        "hub-energie-card": resolve(__dirname, "src/hub-energie-card.js"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        /* Stable names so git-tracked dist/ does not churn (delete/add) on every build. */
        chunkFileNames: "[name].js",
      },
    },
  },
});
