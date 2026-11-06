/**
 * Pure progress logic: no React, no storage, no clock. Every function that
 * depends on "today" takes it as a local `YYYY-MM-DD` argument.
 */
import type { ItemReview, Progress } from "@/lib/types";
import { addDays, daysBetween, isISODate } from "./dates";

export { addDays, daysBetween, isISODate, toLocalDate, todayLocal } from "./dates";

type Settings = Progress["settings"];

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  translit: "always",
  audioRate: 1,
  sfx: true,
});

export function defaultProgress(): Progress {
  return {
    xp: 0,
    streak: 0,
    lastActive: null,
    completedLessons: [],
    review: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

/* ---------- Streak ---------- */

/**
 * Advance the streak for activity on `today`. Called on lesson completion only.
 * Same day → unchanged; yesterday → +1; gap or never active → 1.
 * A lastActive in the future (device clock moved back) is treated as same day.
 */
export function touchStreak(p: Progress, today: string): Progress {
  const gap = p.lastActive && isISODate(p.lastActive) ? daysBetween(p.lastActive, today) : null;
  if (gap !== null && gap <= 0) return p;
  const streak = gap === 1 ? p.streak + 1 : 1;
  return { ...p, streak, lastActive: today };
}

/** Streak to display: 0 once a full day has been missed. Does not mutate. */
export function currentStreak(p: Progress, today: string): number {
  if (!p.lastActive || !isISODate(p.lastActive)) return 0;
  return daysBetween(p.lastActive, today) <= 1 ? p.streak : 0;
}

/* ---------- Spaced repetition (Leitner boxes 0–5) ---------- */

export const MAX_STRENGTH = 5;
/** Days until next review, indexed by strength (box). */
export const INTERVALS = [0, 1, 2, 4, 7, 14] as const;

/** Next review state after answering an item. Wrong answers are due today. */
export function applyAnswer(review: ItemReview | undefined, correct: boolean, today: string): ItemReview {
  const prev = review ?? { strength: 0, due: today, seen: 0, missed: 0 };
  const strength = correct ? Math.min(MAX_STRENGTH, prev.strength + 1) : Math.max(0, prev.strength - 2);
  return {
    strength,
    due: correct ? addDays(today, INTERVALS[strength]) : today,
    seen: prev.seen + 1,
    missed: prev.missed + (correct ? 0 : 1),
  };
}

export function recordAnswer(p: Progress, itemId: string, correct: boolean, today: string): Progress {
  return { ...p, review: { ...p.review, [itemId]: applyAnswer(p.review[itemId], correct, today) } };
}

/**
 * Ids due on or before `today`, weakest first: strength asc, then most missed,
 * then oldest due, then id (so the order is fully deterministic).
 */
export function dueItems(p: Progress, today: string, limit = 10): string[] {
  return Object.entries(p.review)
    .filter(([, r]) => r.due <= today)
    .sort(
      ([ida, a], [idb, b]) =>
        a.strength - b.strength ||
        b.missed - a.missed ||
        (a.due < b.due ? -1 : a.due > b.due ? 1 : 0) ||
        (ida < idb ? -1 : ida > idb ? 1 : 0),
    )
    .slice(0, Math.max(0, limit))
    .map(([id]) => id);
}

/* ---------- Lessons & settings ---------- */

export function completeLesson(p: Progress, lessonId: string, xp: number, today: string): Progress {
  const gained = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const completedLessons = p.completedLessons.includes(lessonId)
    ? p.completedLessons
    : [...p.completedLessons, lessonId];
  const touched = touchStreak(p, today);
  // Never move lastActive backwards (e.g. device clock set back a day).
  const lastActive = touched.lastActive && touched.lastActive > today ? touched.lastActive : today;
  return { ...touched, xp: p.xp + gained, completedLessons, lastActive };
}

export function updateSettings(p: Progress, patch: Partial<Settings>): Progress {
  return { ...p, settings: normalizeSettings({ ...p.settings, ...patch }) };
}

/* ---------- Normalisation (invalid / partial / future data) ---------- */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const nonNegInt = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;

function normalizeSettings(raw: unknown): Settings {
  const s = isObj(raw) ? raw : {};
  return {
    ...s, // keep unknown future settings
    translit: s.translit === "fade" || s.translit === "off" || s.translit === "always" ? s.translit : DEFAULT_SETTINGS.translit,
    audioRate: s.audioRate === 0.75 || s.audioRate === 1 ? s.audioRate : DEFAULT_SETTINGS.audioRate,
    sfx: typeof s.sfx === "boolean" ? s.sfx : DEFAULT_SETTINGS.sfx,
  };
}

function normalizeReview(raw: unknown): ItemReview | null {
  if (!isObj(raw)) return null;
  return {
    ...raw,
    strength: Math.min(MAX_STRENGTH, nonNegInt(raw.strength)),
    due: isISODate(raw.due) ? raw.due : "1970-01-01", // unknown due → due now
    seen: nonNegInt(raw.seen),
    missed: nonNegInt(raw.missed),
  };
}

/**
 * Coerce anything (parsed JSON, older or newer shapes) into a valid Progress.
 * Invalid fields fall back to defaults; unknown fields are preserved.
 */
export function normalizeProgress(raw: unknown): Progress {
  if (!isObj(raw)) return defaultProgress();
  const review: Record<string, ItemReview> = {};
  if (isObj(raw.review)) {
    for (const [id, r] of Object.entries(raw.review)) {
      const n = normalizeReview(r);
      if (n) review[id] = n;
    }
  }
  const lessons = Array.isArray(raw.completedLessons)
    ? raw.completedLessons.filter((x): x is string => typeof x === "string")
    : [];
  return {
    ...raw,
    xp: nonNegInt(raw.xp),
    streak: nonNegInt(raw.streak),
    lastActive: isISODate(raw.lastActive) ? raw.lastActive : null,
    completedLessons: [...new Set(lessons)],
    review,
    settings: normalizeSettings(raw.settings),
  };
}
