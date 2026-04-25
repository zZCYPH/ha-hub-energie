/**
 * Renders repo-root CHANGELOG.md to site/public/changelog.generated.json for the /changelog route.
 * Run via npm prebuild / predev (see site/package.json).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const repoRoot = join(siteDir, "..");
const mdPath = join(repoRoot, "CHANGELOG.md");
const outPath = join(siteDir, "public", "changelog.generated.json");

if (!existsSync(mdPath)) {
  console.error(`sync-changelog: missing ${mdPath}`);
  process.exit(1);
}

const md = readFileSync(mdPath, "utf8");
marked.setOptions({
  gfm: true,
  mangle: false,
  headerIds: true,
});

const inner = marked.parse(md);
const html = `<div class="site-changelog-markdown">${inner}</div>`;
const payload = {
  generated_at: new Date().toISOString(),
  html,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log("sync-changelog: wrote public/changelog.generated.json");
