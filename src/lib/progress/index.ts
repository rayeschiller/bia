"use client";

/**
 * React binding for progress. Wrap the app in <ProgressProvider> (done in
 * src/app/layout.tsx) and read/write with useProgress().
 *
 * Hydration-safe: the server and the hydration pass render default progress;
 * React then re-renders with the stored progress, so there is no mismatch.
 * Pure helpers (currentStreak, todayLocal, …) live in ./core.
 */
import { createContext, createElement, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Progress } from "@/lib/types";
import * as core from "./core";
import { createProgressStore, SERVER_SNAPSHOT, type ProgressStore } from "./store";

export interface ProgressApi {
  progress: Progress;
  recordAnswer(itemId: string, correct: boolean): void;
  completeLesson(lessonId: string, xpEarned: number): void;
  updateSettings(patch: Partial<Progress["settings"]>): void;
  dueReviewItemIds(limit?: number): string[];
  /** Wipe everything back to defaultProgress() (settings included). */
  resetProgress(): void;
}

const StoreContext = createContext<ProgressStore | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProgressStore());
  return createElement(StoreContext.Provider, { value: store }, children);
}

const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useProgress(): ProgressApi {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useProgress() must be used inside <ProgressProvider>");
  const progress = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);

  const actions = useMemo(
    () => ({
      recordAnswer: (itemId: string, correct: boolean) =>
        store.update((p) => core.recordAnswer(p, itemId, correct, core.todayLocal())),
      completeLesson: (lessonId: string, xpEarned: number) =>
        store.update((p) => core.completeLesson(p, lessonId, xpEarned, core.todayLocal())),
      updateSettings: (patch: Partial<Progress["settings"]>) =>
        store.update((p) => core.updateSettings(p, patch)),
      resetProgress: () => store.update(() => core.defaultProgress()),
    }),
    [store],
  );

  return useMemo(
    () => ({
      progress,
      ...actions,
      dueReviewItemIds: (limit?: number) => core.dueItems(progress, core.todayLocal(), limit),
    }),
    [progress, actions],
  );
}
