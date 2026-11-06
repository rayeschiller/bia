"use client";

/**
 * TEMPORARY in-memory stub of the progress API so the lesson engine can be
 * built in parallel. The progress engineer replaces this file with the real
 * localStorage-backed implementation; keep the exported API identical.
 */
import { useSyncExternalStore } from "react";
import type { Progress } from "@/lib/types";

const DEFAULT: Progress = {
  xp: 0,
  streak: 0,
  lastActive: null,
  completedLessons: [],
  review: {},
  settings: { translit: "always", audioRate: 1, sfx: true },
};

let state: Progress = DEFAULT;
const listeners = new Set<() => void>();
const set = (next: Progress) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const today = () => new Date().toISOString().slice(0, 10);

function recordAnswer(itemId: string, correct: boolean) {
  const prev = state.review[itemId] ?? { strength: 0, due: today(), seen: 0, missed: 0 };
  const strength = correct ? Math.min(5, prev.strength + 1) : 0;
  set({
    ...state,
    review: {
      ...state.review,
      [itemId]: { strength, due: today(), seen: prev.seen + 1, missed: prev.missed + (correct ? 0 : 1) },
    },
  });
}

function completeLesson(lessonId: string, xpEarned: number) {
  const completedLessons = state.completedLessons.includes(lessonId)
    ? state.completedLessons
    : [...state.completedLessons, lessonId];
  set({ ...state, xp: state.xp + xpEarned, completedLessons, lastActive: today() });
}

function updateSettings(patch: Partial<Progress["settings"]>) {
  set({ ...state, settings: { ...state.settings, ...patch } });
}

/** Stub: everything seen is "due", weakest first. */
function dueReviewItemIds(limit = 10): string[] {
  return Object.entries(state.review)
    .sort(([, a], [, b]) => a.strength - b.strength || b.missed - a.missed)
    .slice(0, limit)
    .map(([id]) => id);
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, () => state, () => DEFAULT);
  return { progress, recordAnswer, completeLesson, updateSettings, dueReviewItemIds };
}
