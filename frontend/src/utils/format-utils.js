export const readNum = (states, id) => {
  const n = parseFloat(states?.[id]?.state);
  return Number.isFinite(n) ? n : 0;
};

export const readAttrNum = (states, id, attr) => {
  const n = parseFloat(states?.[id]?.attributes?.[attr]);
  return Number.isFinite(n) ? n : 0;
};

export const readAttrOptionalFloat = (states, id, attr) => {
  const raw = states?.[id]?.attributes?.[attr];
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export const fmtPowerCompact = (w) => {
  const x = Number(w);
  if (!Number.isFinite(x)) return "—";
  const ax = Math.abs(x);
  if (ax >= 1000) return `${(x / 1000).toFixed(ax >= 10000 ? 0 : 1)} kW`;
  return `${Math.round(x)} W`;
};

export const fmtEnergy = (kwh) => {
  const x = Number(kwh);
  const safe = Number.isFinite(x) ? x : 0;
  return safe < 1 ? `${Math.round(safe * 1000)} Wh` : `${safe.toFixed(2)} kWh`;
};

export const makeSectionEnergyFormatter = (values) => {
  const nums = (values ?? []).map((v) => Number(v)).filter((n) => Number.isFinite(n));
  const useKwh = nums.some((v) => v >= 1);
  return (kwh) => {
    const x = Number(kwh);
    const safe = Number.isFinite(x) ? x : 0;
    return useKwh ? `${safe.toFixed(2)} kWh` : `${Math.round(safe * 1000)} Wh`;
  };
};

const ICON_MAP = {
  reseau: "mdi:transmission-tower",
  "réseau": "mdi:transmission-tower",
  grid: "mdi:transmission-tower",
  solaire: "mdi:weather-sunny",
  solar: "mdi:weather-sunny",
  batterie: "mdi:battery",
  battery: "mdi:battery",
  "surplus pv": "mdi:solar-power-variant",
  "solar surplus": "mdi:solar-power-variant",
  "batt pleine": "mdi:battery-off",
  "battery full": "mdi:battery-off",
  latence: "mdi:timer-sand",
  "switch latency": "mdi:timer-sand",
  autre: "mdi:help-circle-outline",
  other: "mdi:help-circle-outline",
  abonnement: "mdi:calendar-month",
  subscription: "mdi:calendar-month",
};

export function iconForLabel(label) {
  const l = String(label ?? "").toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (l.includes(k)) return v;
  }
  return null;
}

export function isGridSlotLabel(label) {
  const l = String(label ?? "").toLowerCase();
  return /\b(bleu|blanc|rouge)\b/.test(l) || /\b(hc|hp)\b/.test(l);
}

export function labelLooksHc(label) {
  const l = String(label ?? "").toLowerCase();
  return l.includes(" hc") || l.endsWith("hc") || l.includes("heures creuses") || l.includes("off-peak");
}

export function isLightHexColor(color) {
  const c = String(color ?? "").trim();
  const m = c.match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const hex = m[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance >= 0.68;
}

export function freshnessFromISO(iso, i18n) {
  if (!iso) return { cls: "status-red", label: i18n.unknown };
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return { cls: "status-red", label: i18n.invalid };
  const ageHours = (Date.now() - parsed) / 3_600_000;
  if (ageHours <= 48) return { cls: "status-green", label: i18n.fresh };
  if (ageHours <= 168) return { cls: "status-amber", label: i18n.aging };
  return { cls: "status-red", label: i18n.stale };
}

export function formatTariffRefresh(iso, i18n, locale = "fr-FR") {
  if (!iso) return { cls: "status-red", label: i18n.unknown };
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return { cls: "status-red", label: i18n.invalid };
  const freshness = freshnessFromISO(iso, i18n);
  const dt = new Date(parsed);
  const dateLabel = dt.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { cls: freshness.cls, label: dateLabel };
}

/** @returns {string} e.g. "3h 33min" (no "Full in" / "Empty" prefix — use icons for that in UI). */
export function formatEtaTimeOnly(minutes) {
  const minsSafe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(minsSafe / 60);
  const mins = minsSafe % 60;
  return `${hours}h ${mins}min`;
}

export function formatEtaLabel(i18n, mode, minutes) {
  const t = formatEtaTimeOnly(minutes);
  if (mode === "full") return `${i18n.battFullIn} ${t}`;
  if (mode === "empty") return `${i18n.battEmptyIn} ${t}`;
  return "";
}
