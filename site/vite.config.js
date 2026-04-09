import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
