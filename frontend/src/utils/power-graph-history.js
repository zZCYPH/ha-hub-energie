/**
 * Power chart data from Home Assistant recorder statistics (real power entities only).
 * Uses recorder/statistics_during_period — not history/period on cost_detail.
 */

/** @param {number[][]} lists */
function unionSortedTimestamps(...lists) {
  const s = new Set();
  for (const L of lists) {
    for (const t of L) s.add(t);
  }
  return [...s].sort((a, b) => a - b);
}

/** @param {{ ts: number; w: number }[]} series */
function forwardFillNumericSeries(series, allTs) {
  let i = 0;
  let last = null;
  const out = [];
  for (const t of allTs) {
    while (i < series.length && series[i].ts <= t) {
      last = series[i].w;
      i++;
    }
    out.push(last);
  }
  return out;
}

/** @param {unknown} v */
function rowStartMs(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const p = Date.parse(v);
    return Number.isFinite(p) ? p : NaN;
  }
  return NaN;
}

/**
 * @param {unknown} block statistics array for one statistic_id
 * @param {{ allowNegative?: boolean }} opts
 * @returns {{ ts: number; w: number }[]} ts is bucket start (ms)
 */
export function seriesFromStatisticBlock(block, opts = {}) {
  const allowNegative = !!opts.allowNegative;
  if (!Array.isArray(block) || !block.length) return [];
  const out = [];
  for (const row of block) {
    const ts = rowStartMs(row?.start);
    const raw = row?.mean ?? row?.state ?? row?.min ?? row?.max;
    if (!Number.isFinite(ts) || raw == null) continue;
    const v = parseFloat(raw);
    if (!Number.isFinite(v)) continue;
    const w = allowNegative ? v : Math.max(0, v);
    out.push({ ts, w });
  }
  out.sort((a, b) => a.ts - b.ts);
  return out;
}

/**
 * Statistic IDs to query (entity_ids for normal sensors). Excludes cost_detail.
 * @param {Record<string, unknown> | null} map power_graph_entity_map
 */
export function collectPowerGraphStatisticIds(map) {
  if (!map || typeof map !== "object") return [];
  const seen = new Set();
  const out = [];
  const add = (id) => {
    if (id == null || typeof id !== "string") return;
    const t = id.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };
  for (const gid of map.grid_entities ?? []) {
    if (typeof gid === "string") add(gid);
  }
  add(map.solar_entity);
  for (const b of map.batteries ?? []) {
    if (b?.mode === "net") add(b.entity);
    else if (b?.mode === "in_out") {
      add(b.in);
      add(b.out);
    }
  }
  add(map.load_entity);
  return out;
}

/**
 * @param {object} hass
 * @param {{ startTimeIso: string; endTimeIso: string; statisticIds: string[]; period?: string }} opts
 */
export async function fetchStatisticsDuringPeriod(hass, { startTimeIso, endTimeIso, statisticIds, period = "5minute" }) {
  const conn = hass?.connection;
  if (!conn?.sendMessagePromise) {
    throw new Error("Home Assistant WebSocket not available");
  }
  const raw = await conn.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: startTimeIso,
    end_time: endTimeIso,
    statistic_ids: statisticIds,
    period,
    types: ["mean", "state"],
  });
  /* HA resolves sendMessagePromise with the command result object (statistic_id → rows), not { result }. */
  if (raw && typeof raw === "object" && raw.success === false) {
    throw new Error(raw.error?.message ?? "recorder/statistics_during_period failed");
  }
  if (raw && typeof raw === "object" && "result" in raw && raw.result !== undefined && !Array.isArray(raw.result)) {
    const inner = raw.result;
    if (inner && typeof inner === "object") return inner;
  }
  return raw;
}

/**
 * @param {Record<string, unknown>} map
 * @param {Record<string, unknown[]>} statsResult
 */
/** Sum grid phase sensors (signed: import positive, export negative when the sensor reports net power). */
function sumGridSignedFromStats(map, statsResult) {
  const ids = map.grid_entities;
  if (!Array.isArray(ids) || !ids.length) return [];

  const perPh = [];
  for (const rawId of ids) {
    const sid = typeof rawId === "string" ? rawId.trim() : "";
    if (!sid) continue;
    perPh.push(seriesFromStatisticBlock(statsResult[sid], { allowNegative: true }));
  }
  if (!perPh.length) return [];

  const allTs = unionSortedTimestamps(...perPh.map((s) => s.map((x) => x.ts)));
  let sum = allTs.map(() => 0);
  for (const c of perPh) {
    const ff = forwardFillNumericSeries(c, allTs);
    sum = sum.map((v, i) => v + (ff[i] ?? 0));
  }
  return allTs.map((ts, i) => ({ ts, w: sum[i] }));
}

/** One signed curve per system: discharge positive, charge negative (in_out: out − in). */
function sumBatterySignedFromStats(map, statsResult) {
  const bats = map.batteries ?? [];
  if (!Array.isArray(bats) || !bats.length) return [];

  const perBatt = [];
  for (const b of bats) {
    if (b?.mode === "net" && b.entity) {
      const id = String(b.entity);
      const ser = seriesFromStatisticBlock(statsResult[id], { allowNegative: true }).map((p) => {
        const net = b.net_sign === "positive_charge" ? -p.w : p.w;
        return { ts: p.ts, w: net };
      });
      perBatt.push(ser);
    } else if (b?.mode === "in_out") {
      const idIn = b.in ? String(b.in) : "";
      const idOut = b.out ? String(b.out) : "";
      const serIn = idIn ? seriesFromStatisticBlock(statsResult[idIn]) : [];
      const serOut = idOut ? seriesFromStatisticBlock(statsResult[idOut]) : [];
      const allTsB = unionSortedTimestamps(
        serIn.map((x) => x.ts),
        serOut.map((x) => x.ts),
      );
      if (!allTsB.length) {
        perBatt.push([]);
        continue;
      }
      const inCol = serIn.length ? forwardFillNumericSeries(serIn, allTsB) : allTsB.map(() => null);
      const outCol = serOut.length ? forwardFillNumericSeries(serOut, allTsB) : allTsB.map(() => null);
      perBatt.push(
        allTsB.map((ts, i) => ({
          ts,
          w: (outCol[i] ?? 0) - (inCol[i] ?? 0),
        })),
      );
    }
  }
  if (!perBatt.length) return [];

  const allTs = unionSortedTimestamps(...perBatt.map((s) => s.map((x) => x.ts)));
  let sum = allTs.map(() => 0);
  for (const c of perBatt) {
    if (!c.length) continue;
    const ff = forwardFillNumericSeries(c, allTs);
    sum = sum.map((v, i) => v + (ff[i] ?? 0));
  }
  return allTs.map((ts, i) => ({ ts, w: sum[i] }));
}

/**
 * Per-bucket W series for line chart: solar, battery (signed net), grid (signed), optional house load.
 * @param {Record<string, unknown> | null} map
 * @param {Record<string, unknown[]>} statsResult
 * @returns {{ filled: { ts: number; grid: number; solar: number; batt: number; load: number | null }[] } | null}
 */
export function mergePowerStatisticsToChartPoints(map, statsResult) {
  if (!map || typeof map !== "object" || !statsResult || typeof statsResult !== "object") return null;

  const solarE = typeof map.solar_entity === "string" ? map.solar_entity.trim() : "";
  const loadE = typeof map.load_entity === "string" ? map.load_entity.trim() : "";

  const gridSer = sumGridSignedFromStats(map, statsResult);
  const solarSer = solarE ? seriesFromStatisticBlock(statsResult[solarE]) : [];
  const battSer = sumBatterySignedFromStats(map, statsResult);
  const loadSer = loadE ? seriesFromStatisticBlock(statsResult[loadE]) : [];

  const allTs = unionSortedTimestamps(
    gridSer.map((p) => p.ts),
    solarSer.map((p) => p.ts),
    battSer.map((p) => p.ts),
    loadSer.map((p) => p.ts),
  );
  if (!allTs.length) return null;

  const gridCol = gridSer.length ? forwardFillNumericSeries(gridSer, allTs) : allTs.map(() => null);
  const solarCol = solarSer.length ? forwardFillNumericSeries(solarSer, allTs) : allTs.map(() => null);
  const battCol = battSer.length ? forwardFillNumericSeries(battSer, allTs) : allTs.map(() => null);
  const loadCol = loadSer.length ? forwardFillNumericSeries(loadSer, allTs) : allTs.map(() => null);

  const filled = allTs.map((ts, i) => ({
    ts,
    grid: gridCol[i],
    solar: solarCol[i],
    batt: battCol[i],
    load: loadCol[i],
  }));

  if (!filled.some((p) => p.grid != null || p.solar != null || p.batt != null || p.load != null)) {
    return null;
  }

  let lastG = 0;
  let lastS = 0;
  let lastB = 0;
  let lastLoad = loadSer.length ? 0 : null;
  const smoothed = [];
  for (const p of filled) {
    if (p.grid != null) lastG = p.grid;
    if (p.solar != null) lastS = p.solar;
    if (p.batt != null) lastB = p.batt;
    if (loadSer.length && p.load != null) lastLoad = p.load;
    smoothed.push({ ts: p.ts, grid: lastG, solar: lastS, batt: lastB, load: loadSer.length ? lastLoad : null });
  }

  return { filled: smoothed };
}

/** @param {{ ts: number; solar?: number; batt?: number; grid?: number; load?: number | null }[]} pts */
export function yExtentFromPowerChartPoints(pts) {
  let yMin = 0;
  let yMax = 1;
  for (const p of pts) {
    const cand = [];
    if (p.load != null && Number.isFinite(p.load)) cand.push(p.load);
    if (p.solar != null && Number.isFinite(p.solar)) cand.push(p.solar);
    const br = p.batt;
    if (br != null && Number.isFinite(br)) {
      cand.push(Math.max(0, br), Math.max(0, -br));
    }
    if (p.grid != null && Number.isFinite(p.grid)) cand.push(p.grid);
    for (const v of cand) {
      yMin = Math.min(yMin, v);
      yMax = Math.max(yMax, v);
    }
  }
  if (yMax - yMin < 1) yMax = yMin + 1;
  return { yMin, yMax };
}

/**
 * Instantaneous power from entity states (same entities as statistics map).
 * @param {object} hass
 * @param {Record<string, unknown> | null} map
 * @returns {{ solar: number | null; batt: number | null; grid: number | null; load: number | null } | null}
 */
export function readLivePowerGraphComponents(hass, map) {
  if (!hass?.states || !map || typeof map !== "object") return null;
  const st = hass.states;

  const parse = (id) => {
    if (id == null || typeof id !== "string") return null;
    const t = id.trim();
    if (!t || !st[t]) return null;
    const n = parseFloat(st[t].state);
    return Number.isFinite(n) ? n : null;
  };

  let gridSum = 0;
  let gridN = 0;
  for (const gid of map.grid_entities ?? []) {
    if (typeof gid !== "string") continue;
    const v = parse(gid);
    if (v != null) {
      gridSum += v;
      gridN++;
    }
  }

  const solarE = typeof map.solar_entity === "string" ? map.solar_entity.trim() : "";
  const solarRaw = solarE ? parse(solarE) : null;
  const solar = solarRaw != null ? Math.max(0, solarRaw) : null;

  const loadE = typeof map.load_entity === "string" ? map.load_entity.trim() : "";
  const load = loadE ? parse(loadE) : null;

  let battSum = 0;
  let battN = 0;
  for (const b of map.batteries ?? []) {
    if (b?.mode === "net" && b.entity) {
      const v = parse(String(b.entity));
      if (v != null) {
        const net = b.net_sign === "positive_charge" ? -v : v;
        battSum += net;
        battN++;
      }
    } else if (b?.mode === "in_out") {
      const vin = b.in ? parse(String(b.in)) : null;
      const vout = b.out ? parse(String(b.out)) : null;
      if (vin != null || vout != null) {
        battSum += (vout ?? 0) - (vin ?? 0);
        battN++;
      }
    }
  }

  if (!gridN && solar == null && !battN && load == null) return null;

  return {
    solar,
    batt: battN > 0 ? battSum : null,
    grid: gridN > 0 ? gridSum : null,
    load,
  };
}

/**
 * Append one realtime point after statistics (updates every hass tick). Preserves last stat values for null live fields.
 * @param {{ ts: number; solar: number; batt: number; grid: number; load?: number | null }[]} statsPts
 * @param {{ solar: number | null; batt: number | null; grid: number | null; load?: number | null } | null} live
 */
export function mergeStatsPointsWithLiveTail(statsPts, live) {
  if (!statsPts?.length) return [];
  if (!live) return statsPts;
  const last = statsPts[statsPts.length - 1];
  const ts = Math.max(Date.now(), last.ts + 1);
  const pt = {
    ts,
    solar: live.solar != null ? live.solar : last.solar ?? 0,
    batt: live.batt != null ? live.batt : last.batt ?? 0,
    grid: live.grid != null ? live.grid : last.grid ?? 0,
    load: live.load != null ? live.load : last.load != null ? last.load : null,
  };
  return [...statsPts, pt];
}
