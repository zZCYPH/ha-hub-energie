/**
 * Optional: mirror GitLab CI — copy `site/dist` to repo-root `public/` for local static preview.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const dist = join(siteDir, "dist");
const pub = join(siteDir, "..", "public");

if (!existsSync(dist)) {
  console.error("Run `npm run build` in site/ first (no dist/ folder).");
  process.exit(1);
}
rmSync(pub, { recursive: true, force: true });
mkdirSync(pub, { recursive: true });
cpSync(dist, pub, { recursive: true });
console.log("Wrote", pub);
