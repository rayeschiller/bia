/**
 * Pure merge of two Progress snapshots (this device vs. the cloud copy).
 * Never loses work: XP is the max, lessons and review items are unioned.
 * Everything except settings is commutative: merge(a, b) ≡ merge(b, a).
 */
import type { ItemReview, Progress } from "@/lib/types";
import { normalizeProgress } from "./core";

const cmp = (a: string | number, b: string | number) => (a < b ? -1 : a > b ? 1 : 0);

/** Positive when `a` is the more advanced review entry. */
function compareReview(a: ItemReview, b: ItemReview): number {
  return cmp(a.seen, b.seen) || cmp(a.due, b.due) || cmp(a.strength, b.strength) || cmp(a.missed, b.missed);
}

/** Positive when `a` holds the more recent streak (later lastActive, tie → higher streak). */
function compareStreak(a: Progress, b: Progress): number {
  return cmp(a.lastActive ?? "", b.lastActive ?? "") || cmp(a.streak, b.streak);
}

export function mergeReview(
  a: Progress["review"],
  b: Progress["review"],
): Progress["review"] {
  const out: Progress["review"] = {};
  for (const id of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
    const x = a[id];
    const y = b[id];
    out[id] = !x ? y : !y ? x : compareReview(x, y) >= 0 ? x : y;
  }
  return out;
}

/**
 * Merge this device's progress with the stored remote copy.
 * - xp: max · completedLessons: union (sorted, so order never depends on the side)
 * - streak + lastActive: from the side with the later lastActive (tie → higher streak)
 * - review: union of items; per item the entry with more `seen` (tie → later `due`)
 * - settings: remote wins when there is a remote copy (it's the user's chosen settings)
 */
export function mergeProgress(local: Progress, remote: Progress | null | undefined): Progress {
  const l = normalizeProgress(local);
  if (!remote) return l;
  const r = normalizeProgress(remote);
  const streakSide = compareStreak(l, r) >= 0 ? l : r;
  return normalizeProgress({
    ...l,
    ...r, // unknown future fields: remote's copy wins, like settings
    xp: Math.max(l.xp, r.xp),
    streak: streakSide.streak,
    lastActive: streakSide.lastActive,
    completedLessons: [...new Set([...l.completedLessons, ...r.completedLessons])].sort(),
    review: mergeReview(l.review, r.review),
    settings: r.settings,
  });
}

/** Stable equality for Progress values (key order independent for the parts we merge). */
export function sameProgress(a: Progress, b: Progress): boolean {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, canonical(obj[k])]));
  }
  return value;
}
