/**
 * Read `custom_components/hub_energie/manifest.json` (repo root) and substitute
 * `{{HUB_ENERGIE_VERSION}}` / `{{HUB_ENERGIE_VERSION_SERIES}}` in site assets.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __scripts = dirname(fileURLToPath(import.meta.url));
const __site = join(__scripts, "..");
const __repoRoot = join(__site, "..");

export const HUB_ENERGIE_MANIFEST_PATH = join(
  __repoRoot,
  "custom_components",
  "hub_energie",
  "manifest.json",
);

export function readHubEnergieManifestVersion(manifestPath = HUB_ENERGIE_MANIFEST_PATH) {
  const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!raw.version || typeof raw.version !== "string") {
    throw new Error(`hub_energie manifest.json: missing string "version" (${manifestPath})`);
  }
  return raw.version.trim();
}

export function hubEnergieVersionSeries(version) {
  const parts = String(version).split(".");
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : String(version);
}

/**
 * @param {string} template
 * @param {string} [version] full semver from manifest
 */
export function applyHubEnergieVersionTokens(template, version = readHubEnergieManifestVersion()) {
  const series = hubEnergieVersionSeries(version);
  return String(template)
    .replace(/\{\{HUB_ENERGIE_VERSION\}\}/g, version)
    .replace(/\{\{HUB_ENERGIE_VERSION_SERIES\}\}/g, series);
}
