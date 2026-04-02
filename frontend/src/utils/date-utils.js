export const TZ_PARIS = "Europe/Paris";

export function toParisDateISO(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const todayParisISO = () => toParisDateISO();

export function parisYmdStartUtc(isoYmd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoYmd));
  if (!m) return new Date(NaN);
  const target = `${m[1]}-${m[2]}-${m[3]}`;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const lo = Date.UTC(y, mo - 1, d - 1, 18, 0, 0);
  const hi = Date.UTC(y, mo - 1, d + 1, 6, 0, 0);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let t = lo; t <= hi; t += 60_000) {
    const parts = fmt.formatToParts(new Date(t));
    const get = (ty) => parts.find((p) => p.type === ty)?.value ?? "";
    const ymd = `${get("year")}-${get("month")}-${get("day")}`;
    if (ymd !== target) continue;
    if (get("hour") === "00" && get("minute") === "00" && get("second") === "00") {
      return new Date(t);
    }
  }
  return new Date(NaN);
}

export function addCalendarDays(isoYmd, deltaDays) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoYmd));
  if (!m) return todayParisISO();
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const u = new Date(Date.UTC(y, mo - 1, d + deltaDays));
  return u.toISOString().slice(0, 10);
}

export function parisWeekdayMon0(isoYmd) {
  const t = parisYmdStartUtc(isoYmd).getTime();
  if (!Number.isFinite(t)) return 0;
  const w = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ_PARIS,
    weekday: "short",
  }).format(new Date(t));
  const map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[w] ?? 0;
}

export const parisDayKeyFromTs = (ts) => toParisDateISO(new Date(ts));

export function rangeFromPreset(endIso, preset) {
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(String(endIso));
  const end = valid ? String(endIso) : todayParisISO();
  let startIso;
  if (preset === "week") {
    const dow = parisWeekdayMon0(end);
    startIso = addCalendarDays(end, -dow);
  } else if (preset === "month") {
    startIso = `${end.slice(0, 7)}-01`;
  } else if (preset === "year") {
    startIso = `${end.slice(0, 4)}-01-01`;
  } else {
    startIso = end;
  }
  return { startIso, endIso: end };
}

export function formatYmdParisLocale(isoYmd, locale) {
  const t = parisYmdStartUtc(isoYmd);
  if (!Number.isFinite(t.getTime())) return String(isoYmd);
  return t.toLocaleDateString(locale, {
    timeZone: TZ_PARIS,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function rangeLabel(startIso, endIso, locale) {
  if (startIso === endIso) return formatYmdParisLocale(endIso, locale);
  return `${formatYmdParisLocale(startIso, locale)} - ${formatYmdParisLocale(endIso, locale)}`;
}
