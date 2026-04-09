/**
 * Normalize site/lang/{en,fr}/doc.json: no HTML in values, keys drop the `_html` suffix.
 * Flow map: split legacy <li> entries into configure.flow_map_li1 … li5 (plain text).
 *
 * Run: node site/scripts/patch-doc-lang-plaintext.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");

function stripInnerHtmlToText(s) {
  return String(s)
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitFlowMapLis(html) {
  const lis = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    lis.push(stripInnerHtmlToText(m[1]));
  }
  return lis;
}

function transformDoc(lang) {
  const p = join(siteDir, "lang", lang, "doc.json");
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const flowRaw = doc["configure.flow_map_html"];
  const flowLis = typeof flowRaw === "string" ? splitFlowMapLis(flowRaw) : [];

  const next = { ...doc };
  delete next["configure.flow_map_html"];
  if (flowLis.length) {
    for (let i = 0; i < flowLis.length; i++) {
      next[`configure.flow_map_li${i + 1}`] = flowLis[i];
    }
  }

  for (const k of [...Object.keys(next)]) {
    const v = next[k];
    if (typeof v !== "string" || !v.includes("<")) continue;
    const plain = stripInnerHtmlToText(v);
    const nk = k.endsWith("_html") ? k.slice(0, -5) : k;
    if (nk !== k) delete next[k];
    next[nk] = plain;
  }

  const keys = Object.keys(next).sort();
  const sorted = {};
  for (const k of keys) sorted[k] = next[k];
  writeFileSync(p, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  console.log("wrote", p, "keys", keys.length);
}

transformDoc("en");
transformDoc("fr");
