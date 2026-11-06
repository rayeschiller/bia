/**
 * Framework-agnostic external store around Progress. Keeps one in-memory
 * snapshot (stable identity between changes, as useSyncExternalStore needs),
 * saves on every change, and picks up writes from other tabs.
 */
import type { Progress } from "@/lib/types";
import { defaultProgress } from "./core";
import { browserStorage, loadProgress, saveProgress, STORAGE_KEY, type KeyValueStorage } from "./storage";

export interface ProgressStore {
  getSnapshot(): Progress;
  subscribe(listener: () => void): () => void;
  update(fn: (p: Progress) => Progress): void;
}

/** Shared server snapshot: the server always renders defaults. */
export const SERVER_SNAPSHOT: Progress = defaultProgress();

export function createProgressStore(storage: KeyValueStorage | null = browserStorage()): ProgressStore {
  let state: Progress | null = null; // lazy: first read happens on the client
  const listeners = new Set<() => void>();

  const read = () => (state ??= loadProgress(storage));
  const emit = () => listeners.forEach((l) => l());

  const onStorage = (e: StorageEvent) => {
    // key === null means another tab called localStorage.clear()
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    state = loadProgress(storage);
    emit();
  };

  return {
    getSnapshot: read,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorage);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
    update(fn) {
      const next = fn(read());
      if (next === state) return;
      state = next;
      saveProgress(next, storage);
      emit();
    },
  };
}
