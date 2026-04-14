/**
 * Injects `socPct` into vitrineParisDemo20260413.js from an MCP ha_get_statistics JSON file.
 * Usage: node scripts/inject-paris-demo-soc.mjs [path/to/ha_get_statistics.json]
 * Default path: ./scripts/_mcp_soc.json (gitignored; save MCP response there).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inPath = process.argv[2] || path.join(__dirname, "_mcp_soc.json");
const raw = JSON.parse(fs.readFileSync(inPath, "utf8"));
const stats = raw.data.entities[0].statistics;
if (stats.length !== 288) throw new Error(`Expected 288 SOC buckets, got ${stats.length}`);

const socPct = stats.map((s) => Math.round(Number(s.mean) * 10) / 10);
const arrStr = JSON.stringify(socPct);

const demoPath = path.join(__dirname, "../src/data/vitrineParisDemo20260413.js");
let s = fs.readFileSync(demoPath, "utf8");

const needle =
  '"battChgGridW":"sensor.hub_energie_bilan_energetique_puissance_reseau_vers_batterie"},"solarW"';
const replacement =
  '"battChgGridW":"sensor.hub_energie_bilan_energetique_puissance_reseau_vers_batterie","socPct":"sensor.hyper_2000_electric_level"},"socPct":' +
  arrStr +
  ',"solarW"';

if (s.includes('"socPct":[')) {
  console.log("socPct already present; skipping");
  process.exit(0);
}
if (!s.includes(needle)) throw new Error("Needle not found in vitrineParisDemo20260413.js");

fs.writeFileSync(demoPath, s.replace(needle, replacement));
console.log("Injected socPct", socPct.length, "values into", demoPath);
