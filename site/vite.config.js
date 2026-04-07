import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const outDir = fileURLToPath(new URL("../public", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  base: "./",
  publicDir: "public",
  build: {
    outDir,
    emptyOutDir: false,
  },
});
