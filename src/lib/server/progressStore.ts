/**
 * Cloud copy of a learner's Progress in Upstash Redis.
 * Key `bia:progress:<googleSub>` → Progress JSON plus `updatedAt` (ISO timestamp).
 */
import { Redis } from "@upstash/redis";
import type { Progress } from "@/lib/types";
import { normalizeProgress } from "@/lib/progress/core";
import { redisCredentials } from "./env";

export type StoredProgress = Progress & { updatedAt: string };

/** Minimal surface we use (lets tests pass an in-memory fake). */
export interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
}

let client: KV | null | undefined;

/** Redis client, or null when no Redis env vars are set. */
export function getKV(): KV | null {
  if (client !== undefined) return client;
  const creds = redisCredentials();
  client = creds ? new Redis(creds) : null;
  return client;
}

export const progressKey = (sub: string) => `bia:progress:${sub}`;

/** Stored progress (normalized) or null if this user has never synced. */
export async function readProgress(kv: KV, sub: string): Promise<StoredProgress | null> {
  const raw = await kv.get<unknown>(progressKey(sub));
  if (raw === null || raw === undefined) return null;
  const data = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  const updatedAt =
    data && typeof data === "object" && typeof (data as { updatedAt?: unknown }).updatedAt === "string"
      ? (data as { updatedAt: string }).updatedAt
      : new Date(0).toISOString();
  return { ...stripMeta(normalizeProgress(data)), updatedAt };
}

export async function writeProgress(kv: KV, sub: string, p: Progress, now = new Date()): Promise<StoredProgress> {
  const record: StoredProgress = { ...stripMeta(p), updatedAt: now.toISOString() };
  await kv.set(progressKey(sub), JSON.stringify(record));
  return record;
}

/** Drop transport metadata so it never leaks into Progress. */
export function stripMeta(p: Progress): Progress {
  const copy = { ...p } as Progress & { updatedAt?: unknown };
  delete copy.updatedAt;
  return copy;
}
