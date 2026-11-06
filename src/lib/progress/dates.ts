/**
 * Calendar-date helpers. A "date" is a local `YYYY-MM-DD` string in the
 * user's timezone (not UTC), so a streak day ends at the user's midnight.
 * Arithmetic is done on the calendar date itself (via UTC epoch of the
 * y/m/d parts) so DST shifts can never skip or repeat a day.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** Local calendar date of a Date, e.g. 23:30 PST on Nov 6 → "2026-11-06". */
export function toLocalDate(d: Date): string {
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today's local calendar date. */
export function todayLocal(now: Date = new Date()): string {
  return toLocalDate(now);
}

/** True for a real calendar date in `YYYY-MM-DD` form (rejects 2026-02-30). */
export function isISODate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** `iso` shifted by `days` calendar days. */
export function addDays(iso: string, days: number): string {
  const t = new Date((dayNumber(iso) + days) * DAY_MS);
  return `${pad(t.getUTCFullYear(), 4)}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}
