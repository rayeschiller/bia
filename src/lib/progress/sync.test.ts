import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Progress } from "@/lib/types";
import { defaultProgress } from "./core";
import { createProgressStore } from "./store";
import { startSync, type SyncStatus } from "./sync";

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

/** Fake /api/progress: remembers the last PUT, can be told to fail. */
function fakeServer(initial: unknown = null) {
  const state = { remote: initial, fail: false, calls: [] as { method: string; keepalive?: boolean; body?: Progress }[] };
  const fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const body = init?.body ? (JSON.parse(String(init.body)) as Progress) : undefined;
    state.calls.push({ method, keepalive: init?.keepalive, body });
    if (state.fail) return new Response("down", { status: 503 });
    if (method === "PUT") state.remote = body;
    return Response.json(method === "GET" ? state.remote : { ok: true });
  });
  return { state, fetch: fetch as unknown as typeof globalThis.fetch };
}

const settle = () => vi.advanceTimersByTimeAsync(0);
const puts = (s: ReturnType<typeof fakeServer>["state"]) => s.calls.filter((c) => c.method === "PUT");

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("startSync", () => {
  it("pulls, merges into local, and pushes the merged copy back", async () => {
    const store = createProgressStore(memoryStorage());
    store.update((p) => ({ ...p, xp: 10, completedLessons: ["a"] }));
    const remote = { ...defaultProgress(), xp: 50, completedLessons: ["b"], updatedAt: "2026-11-07T00:00:00Z" };
    const server = fakeServer(remote);
    const statuses: SyncStatus[] = [];
    startSync({ store, fetch: server.fetch, target: null, onStatus: (s) => statuses.push(s) });
    await settle();
    expect(store.getSnapshot()).toMatchObject({ xp: 50, completedLessons: ["a", "b"] });
    expect(store.getSnapshot()).not.toHaveProperty("updatedAt");
    expect(puts(server.state)).toHaveLength(1);
    expect(server.state.remote).toMatchObject({ xp: 50, completedLessons: ["a", "b"] });
    expect(statuses.at(-1)).toBe("synced");
  });

  it("debounces later changes into one PUT", async () => {
    const store = createProgressStore(memoryStorage());
    const server = fakeServer();
    startSync({ store, fetch: server.fetch, target: null, debounceMs: 1500 });
    await settle();
    store.update((p) => ({ ...p, xp: 1 }));
    store.update((p) => ({ ...p, xp: 2 }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(puts(server.state)).toHaveLength(1); // only the initial push
    await vi.advanceTimersByTimeAsync(600);
    expect(puts(server.state)).toHaveLength(2);
    expect(server.state.remote).toMatchObject({ xp: 2 });
  });

  it("never pushes before the first pull succeeds, and retries the pull on the next change", async () => {
    const store = createProgressStore(memoryStorage());
    const server = fakeServer({ ...defaultProgress(), xp: 99 });
    server.state.fail = true;
    const statuses: SyncStatus[] = [];
    startSync({ store, fetch: server.fetch, target: null, onStatus: (s) => statuses.push(s) });
    await settle();
    expect(statuses.at(-1)).toBe("error");
    server.state.fail = false;
    store.update((p) => ({ ...p, xp: 3 }));
    await settle();
    expect(store.getSnapshot().xp).toBe(99);
    expect(puts(server.state).every((c) => c.body?.xp === 99)).toBe(true);
  });

  it("retries a failed PUT on the next change", async () => {
    const store = createProgressStore(memoryStorage());
    const server = fakeServer();
    startSync({ store, fetch: server.fetch, target: null, debounceMs: 10 });
    await settle();
    server.state.fail = true;
    store.update((p) => ({ ...p, xp: 7 }));
    await vi.advanceTimersByTimeAsync(20);
    server.state.fail = false;
    store.update((p) => ({ ...p, xp: 8 }));
    await vi.advanceTimersByTimeAsync(20);
    expect(server.state.remote).toMatchObject({ xp: 8 });
  });

  it("flushes pending changes with keepalive when the page is hidden", async () => {
    const store = createProgressStore(memoryStorage());
    const server = fakeServer();
    const target = new EventTarget() as unknown as Window;
    startSync({ store, fetch: server.fetch, target, isHidden: () => true });
    await settle();
    store.update((p) => ({ ...p, xp: 4 }));
    target.dispatchEvent(new Event("visibilitychange"));
    await settle();
    const last = puts(server.state).at(-1);
    expect(last).toMatchObject({ keepalive: true, body: { xp: 4 } });
  });

  it("stops listening after stop()", async () => {
    const store = createProgressStore(memoryStorage());
    const server = fakeServer();
    const handle = startSync({ store, fetch: server.fetch, target: null, debounceMs: 10 });
    await settle();
    handle.stop();
    store.update((p) => ({ ...p, xp: 5 }));
    await vi.advanceTimersByTimeAsync(50);
    expect(puts(server.state)).toHaveLength(1);
  });
});
