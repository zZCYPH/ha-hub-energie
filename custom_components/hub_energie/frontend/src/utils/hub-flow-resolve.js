/**
 * Flow-card-only helpers: keep this module imported only from hub-energie-flow-card.js so Vite
 * bundles them into hub-energie-flow-card.js. Avoid importing shared chunks like energy-utils.js
 * from the flow entry — minified cross-chunk export names (e.g. `B`) break if one chunk is cached stale.
 */

/** Keep in sync with `DEFAULT_HUB_ENTITY_PREFIX` in energy-utils.js */
const DEFAULT_HUB_ENTITY_PREFIX = "sensor.hub_energie_";

function defaultFrontendEntityIds(prefix = DEFAULT_HUB_ENTITY_PREFIX) {
  const p = prefix;
  return {
    frontendData: `${p}frontend_data`,
    frontendMeta: `${p}frontend_meta`,
  };
}

/**
 * Resolve Hub Énergie Lovelace payload sensors (frontend_data / frontend_meta).
 *
 * @param {Record<string, unknown> | undefined} states - `hass.states`
 * @param {Record<string, unknown> | undefined} config - card YAML; optional `frontend_data_entity`, `frontend_meta_entity`
 * @returns {{ data: string, meta: string } | null}
 */
export function resolveHubFrontendPayloadEntities(states, config) {
  if (!states || typeof states !== "object") return null;

  const trim = (v) => (typeof v === "string" ? v.trim() : "");
  const explicitData = trim(config?.frontend_data_entity);
  const explicitMeta = trim(config?.frontend_meta_entity);

  const tryPair = (dataId, metaId) => {
    if (!dataId || !metaId) return null;
    const d = states[dataId];
    const m = states[metaId];
    if (d && m) return { data: dataId, meta: metaId };
    return null;
  };

  if (explicitData && explicitMeta) {
    const pair = tryPair(explicitData, explicitMeta);
    if (pair) return pair;
  }

  const map = defaultFrontendEntityIds();
  let pair = tryPair(map.frontendData, map.frontendMeta);
  if (pair) return pair;

  pair = tryPair("sensor.frontend_data", "sensor.frontend_meta");
  if (pair) return pair;

  return null;
}

/** Mirror of energy-utils `dayColorLabel` (keep behaviour in sync). */
export function dayColorLabel(v, i18n) {
  const c = String(v ?? "").toLowerCase();
  if (c.includes("blue") || c.includes("bleu")) return i18n?.tempoDayBlue ?? "Blue";
  if (c.includes("white") || c.includes("blanc")) return i18n?.tempoDayWhite ?? "White";
  if (c.includes("red") || c.includes("rouge")) return i18n?.tempoDayRed ?? "Red";
  if (c === "n/a") return i18n?.dayColorNA ?? "N/A";
  return c || (i18n?.emDash ?? "—");
}

/** Mirror of format-utils `readAttrOptionalFloat` (keep behaviour in sync). */
export function readAttrOptionalFloat(states, id, attr) {
  const raw = states?.[id]?.attributes?.[attr];
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Mirror of format-utils `fmtPowerCompact` (keep behaviour in sync). */
export function fmtPowerCompact(w) {
  const x = Number(w);
  if (!Number.isFinite(x)) return "—";
  const ax = Math.abs(x);
  if (ax >= 1000) return `${(x / 1000).toFixed(ax >= 10000 ? 0 : 1)} kW`;
  return `${Math.round(x)} W`;
}

/**
 * Human-readable age since entity `last_changed` / `last_updated` (flow card header).
 *
 * @param {string | undefined} iso - ISO timestamp from HA state
 * @param {number} nowMs
 * @param {Record<string, string>} i18n - flowAgeSeconds, flowAgeMinutes, flowAgeHours, flowAgeDays
 */
export function formatFlowDataAge(iso, nowMs, i18n) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const sec = Math.max(0, Math.floor((nowMs - t) / 1000));
  if (sec < 60) return i18n.flowAgeSeconds.replace("{n}", String(sec));
  const min = Math.floor(sec / 60);
  if (min < 60) return i18n.flowAgeMinutes.replace("{n}", String(min));
  const h = Math.floor(min / 60);
  if (h < 48) return i18n.flowAgeHours.replace("{n}", String(h));
  const d = Math.floor(h / 24);
  return i18n.flowAgeDays.replace("{n}", String(d));
}
