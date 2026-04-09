/**
 * Emit bodies/*.html + titles.*.json from legacy flowHelpContent.js exports.
 * Run from site/: node scripts/emit-flowhelp-bodies.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FLOW_HELP_EN, FLOW_HELP_FR } from "../src/data/flowHelpContent.js";

const __root = dirname(fileURLToPath(import.meta.url));
const flowhelpRoot = join(__root, "../src/content/flowhelp");
const bodiesRoot = join(flowhelpRoot, "bodies");

function emit(bag, lang) {
  const dir = join(bodiesRoot, lang);
  mkdirSync(dir, { recursive: true });
  const titles = {};
  for (const [k, v] of Object.entries(bag)) {
    titles[k] = v.title;
    writeFileSync(join(dir, `${k}.html`), `${v.body_html.trimEnd()}\n`, "utf8");
  }
  writeFileSync(
    join(flowhelpRoot, `titles.${lang}.json`),
    `${JSON.stringify(titles, null, 2)}\n`,
    "utf8",
  );
}

emit(FLOW_HELP_EN, "en");
emit(FLOW_HELP_FR, "fr");
console.log("emit-flowhelp-bodies: wrote bodies + titles");
