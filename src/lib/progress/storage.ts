/**
 * localStorage persistence for Progress.
 *
 * `bia:progress:v1` holds the Progress object exactly as the contract types it.
 * `bia:progress:schema` holds the schema version as a separate key, so future
 * migrations can run without wrapping (and so changing) the stored shape.
 */
import type { Progress } from "@/lib/types";
import { defaultProgress, normalizeProgress } from "./core";

export const STORAGE_KEY = "bia:progress:v1";
export const SCHEMA_KEY = "bia:progress:schema";
export const SCHEMA_VERSION = 1;

/** The subset of the Web Storage API we use (injectable for tests). */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/**
 * MIGRATIONS[n] upgrades raw data from schema n to n + 1. Data with no schema
 * key is treated as version 1. Add entries here when the schema changes and
 * bump SCHEMA_VERSION; normalizeProgress then fills any gaps with defaults.
 */
export const MIGRATIONS: Record<number, Migration> = {};

export function migrate(raw: unknown, fromVersion: number, migrations = MIGRATIONS): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw;
  let data = raw as Record<string, unknown>;
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (step) data = step(data);
  }
  return data;
}

/** localStorage, or null on the server / when storage is blocked. */
export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null; // e.g. Safari private mode / disabled cookies throw on access
  }
}

function readVersion(storage: KeyValueStorage): number {
  const v = Number(storage.getItem(SCHEMA_KEY));
  return Number.isInteger(v) && v >= 1 ? v : 1;
}

/** Never throws. Missing, invalid or partial data is merged with defaults. */
export function loadProgress(storage: KeyValueStorage | null = browserStorage()): Progress {
  if (!storage) return defaultProgress();
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return defaultProgress();
    return normalizeProgress(migrate(JSON.parse(text), readVersion(storage)));
  } catch {
    return defaultProgress();
  }
}

/** Returns false if the write failed (quota exceeded, storage blocked). */
export function saveProgress(p: Progress, storage: KeyValueStorage | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(p));
    storage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    return true;
  } catch {
    return false;
  }
}
