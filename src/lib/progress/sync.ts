/**
 * Cloud sync for a signed-in learner. Framework-agnostic; started by the
 * AccountProvider once /api/me reports a session.
 *
 * 1. Pull: GET the cloud copy, merge it with this device's progress, write the
 *    result locally, PUT it back.
 * 2. Push: every later change is PUT after a short debounce, and flushed with
 *    `keepalive` when the page is hidden or closed.
 * Failures never throw or block the UI; the next change (or coming back
 * online) retries. Until the first pull succeeds nothing is pushed, so a
 * stale device can't overwrite the cloud copy.
 */
import type { Progress } from "@/lib/types";
import { mergeProgress, sameProgress } from "./merge";
import type { ProgressStore } from "./store";

export type SyncStatus = "syncing" | "synced" | "error";

export interface SyncOptions {
  store: ProgressStore;
  onStatus?: (status: SyncStatus) => void;
  fetch?: typeof fetch;
  endpoint?: string;
  debounceMs?: number;
  /** Where to listen for pagehide / visibilitychange / online (default: window). */
  target?: Pick<Window, "addEventListener" | "removeEventListener"> | null;
  isHidden?: () => boolean;
}

export interface SyncHandle {
  /** Send any pending change now (keepalive). */
  flush(): void;
  stop(): void;
}

function withoutMeta(raw: unknown): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const copy = { ...(raw as Record<string, unknown>) };
  delete copy.updatedAt;
  return copy as unknown as Progress;
}

export function startSync(opts: SyncOptions): SyncHandle {
  const { store, endpoint = "/api/progress", debounceMs = 1500 } = opts;
  const doFetch = opts.fetch ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const target = opts.target === undefined ? (typeof window !== "undefined" ? window : null) : opts.target;
  const isHidden = opts.isHidden ?? (() => typeof document !== "undefined" && document.visibilityState === "hidden");

  let pulled = false; // first merge done
  let pulling = false;
  let dirty = false; // local changes not yet confirmed by the server
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const status = (s: SyncStatus) => !stopped && opts.onStatus?.(s);

  async function push(keepalive = false) {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!pulled || stopped) return;
    dirty = false;
    status("syncing");
    try {
      const res = await doFetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store.getSnapshot()),
        keepalive,
      });
      if (!res.ok) throw new Error(`PUT ${res.status}`);
      status(dirty ? "syncing" : "synced");
    } catch {
      dirty = true;
      status("error");
    }
  }

  async function pull() {
    if (pulling || stopped) return;
    pulling = true;
    status("syncing");
    try {
      const res = await doFetch(endpoint, { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const remote = withoutMeta(await res.json());
      if (stopped) return;
      const local = store.getSnapshot();
      const merged = mergeProgress(local, remote);
      pulled = true;
      if (!sameProgress(merged, local)) store.update(() => merged);
      await push();
    } catch {
      status("error");
    } finally {
      pulling = false;
    }
  }

  const schedule = () => {
    dirty = true;
    if (!pulled) return void pull();
    status("syncing");
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void push(), debounceMs);
  };

  const flush = () => {
    if (dirty && pulled) void push(true);
  };
  const onVisibility = () => isHidden() && flush();
  const onOnline = () => (pulled ? dirty && void push() : void pull());

  const unsubscribe = store.subscribe(schedule);
  target?.addEventListener("visibilitychange", onVisibility);
  target?.addEventListener("pagehide", flush);
  target?.addEventListener("online", onOnline);
  void pull();

  return {
    flush,
    stop() {
      flush();
      stopped = true;
      if (timer) clearTimeout(timer);
      unsubscribe();
      target?.removeEventListener("visibilitychange", onVisibility);
      target?.removeEventListener("pagehide", flush);
      target?.removeEventListener("online", onOnline);
    },
  };
}
