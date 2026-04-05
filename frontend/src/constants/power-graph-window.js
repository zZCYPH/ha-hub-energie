/** Preset window lengths (hours) for live power history; shared by card and hub-power-graph. */
export const POWER_GRAPH_ROLLING_HOURS = [24, 12, 6, 3, 1];

export const DEFAULT_POWER_GRAPH_ROLLING_HOURS = 6;

export function snapPowerGraphRollingHours(raw, fallback = DEFAULT_POWER_GRAPH_ROLLING_HOURS) {
  if (!Number.isFinite(raw)) return fallback;
  const n = Math.trunc(raw);
  if (POWER_GRAPH_ROLLING_HOURS.includes(n)) return n;
  return POWER_GRAPH_ROLLING_HOURS.reduce(
    (best, h) => (Math.abs(h - n) < Math.abs(best - n) ? h : best),
    fallback,
  );
}
