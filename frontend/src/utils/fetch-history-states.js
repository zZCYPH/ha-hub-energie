import {
  addCalendarDays,
  parisDayKeyFromTs,
  parisYmdStartUtc,
  todayParisISO,
} from "./date-utils.js";
import { COST_AGG_ATTRS, COST_AGG_DICT_ATTRS } from "./energy-utils.js";

export async function fetchHistoryStates(hass, startIso, endIso, entityIds, costEntityId) {
  const startIsoN = /^\d{4}-\d{2}-\d{2}$/.test(String(startIso)) ? String(startIso) : todayParisISO();
  const endIsoN = /^\d{4}-\d{2}-\d{2}$/.test(String(endIso)) ? String(endIso) : todayParisISO();
  let start = parisYmdStartUtc(startIsoN);
  let endExclusive = parisYmdStartUtc(addCalendarDays(endIsoN, 1));
  if (!Number.isFinite(start.getTime())) start = parisYmdStartUtc(todayParisISO());
  if (!Number.isFinite(endExclusive.getTime())) {
    endExclusive = parisYmdStartUtc(addCalendarDays(todayParisISO(), 1));
  }
  const qs = new URLSearchParams({
    filter_entity_id: entityIds.join(","),
    end_time: endExclusive.toISOString(),
  });
  const url = `history/period/${encodeURIComponent(start.toISOString())}?${qs}`;
  const data = await hass.callApi("GET", url);
  // For history rendering we want the day-end value (latest state that day),
  // not the max. Some sensors can briefly spike then be corrected/reset.
  const entityDayLast = new Map(); // id -> day -> {ts, v}
  const costAttrDayLast = new Map(); // attr -> day -> {ts, v}
  const costDictAttrDayLast = new Map(); // attr -> day -> {ts, dict}
  const latestById = new Map();
  const idSet = new Set(entityIds);

  for (const frame of Array.isArray(data) ? data : []) {
    if (!Array.isArray(frame)) continue;
    for (const s of frame) {
      const id = s?.entity_id;
      if (!id || !idSet.has(id)) continue;
      const ts = Date.parse(s?.last_changed ?? s?.last_updated ?? "");
      if (!Number.isFinite(ts)) continue;
      const day = parisDayKeyFromTs(ts);

      const n = parseFloat(s?.state);
      if (Number.isFinite(n)) {
        if (!entityDayLast.has(id)) entityDayLast.set(id, new Map());
        const byDay = entityDayLast.get(id);
        const prev = byDay.get(day);
        if (!prev || ts >= prev.ts) byDay.set(day, { ts, v: n });
      }

      if (id === costEntityId && s?.attributes && typeof s.attributes === "object") {
        for (const k of COST_AGG_ATTRS) {
          const v = parseFloat(s.attributes?.[k]);
          if (!Number.isFinite(v)) continue;
          if (!costAttrDayLast.has(k)) costAttrDayLast.set(k, new Map());
          const byDay = costAttrDayLast.get(k);
          const prev = byDay.get(day);
          if (!prev || ts >= prev.ts) byDay.set(day, { ts, v });
        }
        for (const k of COST_AGG_DICT_ATTRS) {
          const dict = s.attributes?.[k];
          if (!dict || typeof dict !== "object") continue;
          if (!costDictAttrDayLast.has(k)) costDictAttrDayLast.set(k, new Map());
          const byDay = costDictAttrDayLast.get(k);
          const prev = byDay.get(day);
          if (!prev || ts >= prev.ts) byDay.set(day, { ts, dict });
        }
      }

      const prev = latestById.get(id);
      if (!prev || ts > prev.ts) latestById.set(id, { ts, state: s });
    }
  }

  const sumDayLast = (m) => [...(m?.values() ?? [])].reduce((a, rec) => a + (rec?.v ?? 0), 0);

  const sumDictDayLast = (m) => {
    if (!m) return {};
    const merged = {};
    for (const rec of m.values()) {
      if (!rec?.dict || typeof rec.dict !== "object") continue;
      for (const [k, raw] of Object.entries(rec.dict)) {
        const v = typeof raw === "number" ? raw : parseFloat(raw);
        if (Number.isFinite(v)) merged[k] = (merged[k] ?? 0) + v;
      }
    }
    return merged;
  };

  const out = {};
  for (const id of idSet) {
    const latest = latestById.get(id)?.state;
    const attrs = { ...(latest?.attributes ?? {}) };
    if (id === costEntityId) {
      for (const k of COST_AGG_ATTRS) attrs[k] = sumDayLast(costAttrDayLast.get(k));
      for (const k of COST_AGG_DICT_ATTRS) attrs[k] = sumDictDayLast(costDictAttrDayLast.get(k));
    }
    out[id] = {
      entity_id: id,
      state: String(sumDayLast(entityDayLast.get(id))),
      attributes: attrs,
    };
  }
  return out;
}
