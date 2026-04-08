/**
 * Build `src/vendor/hub-energie-i18n.js` from `site/public/i18n.js` (Vue imports the vendor file).
 * Static assets for the doc site live only under `site/public/` (Vite publicDir).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { applyHubEnergieVersionTokens } from "./manifest-version.mjs";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const sitePublic = join(siteDir, "public");
const vendorDir = join(siteDir, "src", "vendor");
mkdirSync(vendorDir, { recursive: true });

const i18nSrc = join(sitePublic, "i18n.js");
if (!existsSync(i18nSrc)) {
  console.error("hub_energie site: missing site/public/i18n.js");
  process.exit(1);
}
let s = readFileSync(i18nSrc, "utf8");
s = applyHubEnergieVersionTokens(s);
s = s.replace(/href=\\"#doc\\"/g, 'href=\\"#/doc\\"');
writeFileSync(join(vendorDir, "hub-energie-i18n.js"), s);
