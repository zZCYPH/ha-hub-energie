/**
 * Copy static assets from repo public/ into site/public/ before Vite build.
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const sitePublic = join(siteDir, "public");
const repoRoot = join(siteDir, "..");
const repoPublic = join(repoRoot, "public");

function copyIfExists(src, dest) {
  if (!existsSync(src)) return;
  cpSync(src, dest, { recursive: true });
}

mkdirSync(sitePublic, { recursive: true });
const vendorDir = join(siteDir, "src", "vendor");
mkdirSync(vendorDir, { recursive: true });

copyIfExists(join(repoPublic, "css"), join(sitePublic, "css"));
copyIfExists(join(repoPublic, "img"), join(sitePublic, "img"));

const i18nSrc = join(repoPublic, "i18n.js");
if (existsSync(i18nSrc)) {
  let s = readFileSync(i18nSrc, "utf8");
  s = s.replace(/href=\\"#doc\\"/g, 'href=\\"#/doc\\"');
  writeFileSync(join(sitePublic, "i18n.js"), s);
  writeFileSync(join(vendorDir, "hub-energie-i18n.js"), s);
}
