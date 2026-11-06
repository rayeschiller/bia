import { describe, expect, it, vi } from "vitest";
import type { Progress } from "@/lib/types";
import { completeLesson, defaultProgress } from "./core";
import { loadProgress, migrate, saveProgress, SCHEMA_KEY, SCHEMA_VERSION, STORAGE_KEY, type KeyValueStorage } from "./storage";
import { createProgressStore } from "./store";

function memoryStorage(init: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(init));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: KeyValueStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {},
};

describe("loadProgress", () => {
  it("is SSR-safe: no storage → defaults", () => {
    expect(loadProgress(null)).toEqual(defaultProgress());
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadProgress(memoryStorage())).toEqual(defaultProgress());
  });

  it("returns defaults for corrupt JSON", () => {
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual(defaultProgress());
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: "null" }))).toEqual(defaultProgress());
  });

  it("returns defaults when storage throws", () => {
    expect(loadProgress(throwing)).toEqual(defaultProgress());
  });

  it("merges partial data with defaults", () => {
    const s = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ xp: 42, settings: { translit: "off" } }) });
    expect(loadProgress(s)).toEqual({
      ...defaultProgress(),
      xp: 42,
      settings: { translit: "off", audioRate: 1, sfx: true },
    });
  });

  it("preserves unknown future fields through a load/save round trip", () => {
    const s = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ xp: 1, hearts: 5 }) });
    const p = loadProgress(s);
    saveProgress(completeLesson(p, "l", 10, "2026-11-06"), s);
    expect(JSON.parse(s.data.get(STORAGE_KEY)!)).toMatchObject({ xp: 11, hearts: 5 });
  });
});

describe("saveProgress", () => {
  it("writes the contract shape under bia:progress:v1 and the schema version separately", () => {
    const s = memoryStorage();
    const p: Progress = { ...defaultProgress(), xp: 10 };
    expect(saveProgress(p, s)).toBe(true);
    expect(JSON.parse(s.data.get(STORAGE_KEY)!)).toEqual(p);
    expect(s.data.get(SCHEMA_KEY)).toBe(String(SCHEMA_VERSION));
    expect(loadProgress(s)).toEqual(p);
  });

  it("returns false instead of throwing when storage fails or is absent", () => {
    expect(saveProgress(defaultProgress(), throwing)).toBe(false);
    expect(saveProgress(defaultProgress(), null)).toBe(false);
  });
});

describe("migrate", () => {
  it("is a no-op at the current version", () => {
    const raw = { xp: 1 };
    expect(migrate(raw, SCHEMA_VERSION)).toBe(raw);
  });

  it("runs each step from the stored version up to the current one", () => {
    // Simulate stored data at version 0 with a step 0 → 1 that renames a field.
    const steps = { 0: (r: Record<string, unknown>) => ({ ...r, xp: r.points, points: undefined }) };
    expect(migrate({ points: 7 }, 0, steps)).toMatchObject({ xp: 7 });
  });

  it("passes non-objects through for normalisation to handle", () => {
    expect(migrate("x", 0)).toBe("x");
  });
});

describe("createProgressStore", () => {
  it("loads lazily, saves on every update and notifies subscribers", () => {
    const s = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ xp: 5 }) });
    const store = createProgressStore(s);
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    expect(store.getSnapshot().xp).toBe(5);
    expect(store.getSnapshot()).toBe(store.getSnapshot()); // stable identity

    store.update((p) => ({ ...p, xp: p.xp + 1 }));
    expect(store.getSnapshot().xp).toBe(6);
    expect(JSON.parse(s.data.get(STORAGE_KEY)!).xp).toBe(6);
    expect(listener).toHaveBeenCalledTimes(1);

    store.update((p) => p); // no change → no save/notify
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
  });
});
