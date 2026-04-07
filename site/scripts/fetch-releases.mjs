/**
 * Writes site/public/releases.json for the doc build.
 * In GitLab CI (CI_JOB_TOKEN + CI_API_V4_URL + CI_PROJECT_ID): fetches releases from the API.
 * Locally: set GITLAB_TOKEN + GITLAB_PROJECT_ID (numeric) to refresh; otherwise leaves an existing file unchanged.
 */
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const outPath = join(siteDir, "public", "releases.json");

const SEMVER_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

function semverCompare(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function normalizePayload(apiReleases) {
  if (!Array.isArray(apiReleases)) return [];
  const rows = [];
  for (const r of apiReleases) {
    const tag = r.tag_name;
    if (!tag || !SEMVER_TAG.test(tag)) continue;
    const version = tag.slice(1);
    const links = r.assets?.links ?? [];
    const zip = links.find(
      (l) =>
        typeof l.name === "string" &&
        l.name.startsWith("hub-energie-") &&
        l.name.endsWith(".zip") &&
        typeof l.url === "string",
    );
    if (!zip) continue;
    rows.push({
      tag,
      version,
      url: zip.url,
      filename: zip.name,
    });
  }
  rows.sort((x, y) => semverCompare(y.version, x.version));
  const seen = new Set();
  return rows.filter((r) => {
    if (seen.has(r.version)) return false;
    seen.add(r.version);
    return true;
  });
}

async function fetchAllReleases(headers, projectRef) {
  const base = process.env.CI_API_V4_URL || "https://gitlab.com/api/v4";
  const perPage = 100;
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${base}/projects/${encodeURIComponent(projectRef)}/releases?per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`GitLab releases API ${res.status}: ${t.slice(0, 200)}`);
    }
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < perPage) break;
  }
  return all;
}

async function main() {
  const isGitLabCi = process.env.GITLAB_CI === "true";
  let releases = null;

  if (isGitLabCi && process.env.CI_JOB_TOKEN && process.env.CI_PROJECT_ID) {
    const data = await fetchAllReleases(
      { "JOB-TOKEN": process.env.CI_JOB_TOKEN },
      process.env.CI_PROJECT_ID,
    );
    releases = normalizePayload(data);
  } else if (process.env.GITLAB_TOKEN && process.env.GITLAB_PROJECT_ID) {
    const data = await fetchAllReleases(
      { "PRIVATE-TOKEN": process.env.GITLAB_TOKEN },
      process.env.GITLAB_PROJECT_ID,
    );
    releases = normalizePayload(data);
  }

  if (releases !== null) {
    const payload = {
      generated_at: new Date().toISOString(),
      releases,
    };
    writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`fetch-releases: wrote ${releases.length} release(s) to public/releases.json`);
    return;
  }

  if (!existsSync(outPath)) {
    writeFileSync(
      outPath,
      `${JSON.stringify({ generated_at: null, releases: [] }, null, 2)}\n`,
      "utf8",
    );
    console.log("fetch-releases: created empty public/releases.json (no API credentials)");
    return;
  }

  console.log("fetch-releases: skipped (keeping existing public/releases.json)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
