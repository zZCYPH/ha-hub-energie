/**
 * One-off / maintenance: read legacy site/public/i18n.js and write site/lang/{en,fr}/*.json
 * by scope. Run from repo: node site/scripts/extract-lang-from-legacy-i18n.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const legacy = join(siteDir, "public", "i18n.js");

function scopeForKey(key) {
  if (key.startsWith("landing.")) return "landing";
  if (key.startsWith("internals.") || key.startsWith("ssot.")) return "internals";
  if (key.startsWith("toc.internals_")) return "internals";
  if (key.startsWith("flowsim.")) return "flowsim";
  if (key.startsWith("flowhelp.")) return "flowhelp";
  const commonRoots = new Set([
    "meta",
    "nav",
    "theme",
    "lang",
    "common",
    "footer",
    "social",
  ]);
  const first = key.split(".")[0];
  if (commonRoots.has(first)) return "common";
  return "doc";
}

const code = readFileSync(legacy, "utf8");
const ctx = vm.createContext({});
vm.runInContext(code, ctx);
const I = ctx.HubEnergieI18n;
if (!I?.en || !I?.fr) {
  console.error("Expected HubEnergieI18n.en and .fr");
  process.exit(1);
}

const scopes = ["common", "landing", "doc", "flowsim", "flowhelp", "internals"];

for (const lang of ["en", "fr"]) {
  const bag = I[lang];
  const byScope = Object.fromEntries(scopes.map((s) => [s, {}]));
  for (const [k, v] of Object.entries(bag)) {
    const s = scopeForKey(k);
    byScope[s][k] = v;
  }
  const langDir = join(siteDir, "lang", lang);
  mkdirSync(langDir, { recursive: true });
  for (const s of scopes) {
    const path = join(langDir, `${s}.json`);
    writeFileSync(path, `${JSON.stringify(byScope[s], null, 2)}\n`, "utf8");
    console.log("wrote", path, Object.keys(byScope[s]).length, "keys");
  }
}
