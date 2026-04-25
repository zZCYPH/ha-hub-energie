/**
 * Writes site/public/releases.json (Vite copies it to dist/ as /releases.json).
 *
 * Fetches **GitHub Releases** for the HACS mirror repo so ZIP links match what HACS installs.
 *
 * Environment:
 * - `GITHUB_REPOSITORY` — `owner/repo` (default: `zZCYPH/ha-hub-energie`, same as the doc install section).
 * - `GITHUB_TOKEN` — optional; raises API rate limits for CI and local refresh.
 *
 * GitLab CI (`pages` job): run after the GitHub release for the integration semver exists with a
 * `hub-energie-*.zip` asset (see `.gitlab-ci.yml` wait loop). No GitLab Releases API.
 *
 * Locally: `npm run fetch-releases` (or `node site/scripts/fetch-releases.mjs` from repo root).
 * On failure, keeps existing `public/releases.json` when not in CI; CI exits non-zero.
 *
 * Each row includes `prerelease` (boolean): GitHub’s `prerelease` flag and/or tags matching
 * `vX.Y.Z-<suffix>`. The doc ZIP picker hides pre-releases until the user opts in.
 */
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = dirname(fileURLToPath(import.meta.url));
const siteDir = join(__root, "..");
const outPath = join(siteDir, "public", "releases.json");

const DEFAULT_REPO = "zZCYPH/ha-hub-energie";
/** Strict vX.Y.Z (stable tag). */
const SEMVER_STABLE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
/** vX.Y.Z-suffix (e.g. beta) — treated as pre-release. */
const SEMVER_PRERELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)-(.+)$/;

function semverCompareTriplet(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function semverBase(versionOrTag) {
  const s = versionOrTag.startsWith("v") ? versionOrTag.slice(1) : versionOrTag;
  return s.split("-")[0];
}

function parseRepository(repo) {
  const s = String(repo).trim();
  const i = s.indexOf("/");
  if (i < 1 || i === s.length - 1) {
    throw new Error(`Invalid GITHUB_REPOSITORY (expected owner/repo): ${repo}`);
  }
  return { owner: s.slice(0, i), repo: s.slice(i + 1) };
}

function normalizeGitHubPayload(apiReleases) {
  if (!Array.isArray(apiReleases)) return [];
  const rows = [];
  for (const r of apiReleases) {
    const tag = r.tag_name;
    if (!tag) continue;
    const stableMatch = SEMVER_STABLE_TAG.test(tag);
    const preTagMatch = SEMVER_PRERELEASE_TAG.test(tag);
    if (!stableMatch && !preTagMatch) continue;
    const version = tag.slice(1);
    const apiPre = Boolean(r.prerelease);
    const prerelease = apiPre || preTagMatch;
    const assets = Array.isArray(r.assets) ? r.assets : [];
    const zip = assets.find(
      (a) =>
        a &&
        typeof a.name === "string" &&
        a.name.startsWith("hub-energie-") &&
        a.name.endsWith(".zip") &&
        typeof a.browser_download_url === "string",
    );
    if (!zip) continue;
    rows.push({
      tag,
      version,
      url: zip.browser_download_url,
      filename: zip.name,
      prerelease,
    });
  }
  rows.sort((x, y) => {
    if (x.prerelease !== y.prerelease) return x.prerelease ? 1 : -1;
    const bx = semverBase(x.version);
    const by = semverBase(y.version);
    const c = semverCompareTriplet(by, bx);
    if (c !== 0) return c;
    return y.version.localeCompare(x.version);
  });
  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.version)) return false;
    seen.add(row.version);
    return true;
  });
}

async function fetchAllGitHubReleases(owner, repo, authHeaders) {
  const base = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const perPage = 100;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...authHeaders,
  };
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${base}?per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`GitHub releases API ${res.status}: ${t.slice(0, 200)}`);
    }
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < perPage) break;
  }
  return all;
}

function isCi() {
  return process.env.GITLAB_CI === "true" || process.env.CI === "true";
}

function shouldSkipFetch() {
  const v = process.env.SKIP_GITHUB_RELEASES;
  return v === "1" || v === "true";
}

async function main() {
  if (shouldSkipFetch()) {
    console.log("fetch-releases: SKIP_GITHUB_RELEASES set, not fetching GitHub");
    if (!existsSync(outPath)) {
      writeFileSync(
        outPath,
        `${JSON.stringify({ generated_at: null, releases: [] }, null, 2)}\n`,
        "utf8",
      );
    }
    return;
  }

  const repoFull = process.env.GITHUB_REPOSITORY?.trim() || DEFAULT_REPO;
  const { owner, repo } = parseRepository(repoFull);
  const authHeaders = {};
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const data = await fetchAllGitHubReleases(owner, repo, authHeaders);
    const releases = normalizeGitHubPayload(data);
    const payload = {
      generated_at: new Date().toISOString(),
      releases,
    };
    writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(
      `fetch-releases: wrote ${releases.length} release(s) to public/releases.json (${repoFull})`,
    );
  } catch (e) {
    if (isCi()) {
      console.error(e);
      process.exit(1);
    }
    if (!existsSync(outPath)) {
      writeFileSync(
        outPath,
        `${JSON.stringify({ generated_at: null, releases: [] }, null, 2)}\n`,
        "utf8",
      );
      console.warn("fetch-releases: GitHub fetch failed, wrote empty releases.json:", e.message);
      return;
    }
    console.warn("fetch-releases: GitHub fetch failed, keeping existing public/releases.json:", e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
