/**
 * Extract Hub Énergie "solar → battery" / "grid → battery" 5‑minute means from an
 * `ha_get_statistics` JSON dump and inject `battChgSolarW` + `battChgGridW` into
 * `vitrineParisDemo20260413.js` (after `socPct`, before `solarW`).
 *
 * Usage (from repo root):
 *   node site/scripts/inject-batt-chg-split-from-mcp-dump.mjs site/scripts/_mcp_paris_stats_dump.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dumpPath = path.resolve(process.argv[2] || "");
if (!dumpPath || !fs.existsSync(dumpPath)) {
  console.error("Usage: node inject-batt-chg-split-from-mcp-dump.mjs <ha_get_statistics.json>");
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
const ents = j?.data?.entities;
if (!Array.isArray(ents)) {
  console.error("Invalid dump: expected data.entities[]");
  process.exit(1);
}

const want = [
  "sensor.hub_energie_bilan_energetique_puissance_solaire_vers_batterie",
  "sensor.hub_energie_bilan_energetique_puissance_reseau_vers_batterie",
];

const roundArr = (stats) =>
  stats.map((s) => {
    const m = Number(s.mean);
    return Number.isFinite(m) ? Math.round(m * 10) / 10 : 0;
  });

const found = want.map((id) => {
  const e = ents.find((x) => x.entity_id === id);
  if (!e?.statistics?.length) throw new Error(`missing statistics for ${id}`);
  return roundArr(e.statistics);
});

const [solar, grid] = found;
if (solar.length !== grid.length) throw new Error("length mismatch solar vs grid");

const demoPath = path.join(__dirname, "../src/data/vitrineParisDemo20260413.js");
let s = fs.readFileSync(demoPath, "utf8");
const needle = '],"solarW":';
if (s.includes('"battChgSolarW":[')) {
  console.log("skip: battChgSolarW already present");
  process.exit(0);
}
if (!s.includes(needle)) throw new Error(`needle not found: ${needle}`);
const ins =
  '],"battChgSolarW":' +
  JSON.stringify(solar) +
  ',"battChgGridW":' +
  JSON.stringify(grid) +
  ',"solarW":';
s = s.replace(needle, ins);
fs.writeFileSync(demoPath, s);
console.log("injected battChgSolarW / battChgGridW", solar.length, "buckets");
