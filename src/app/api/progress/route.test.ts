import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KV } from "@/lib/server/progressStore";

// Session and Redis are mocked: no network, no real credentials.
const session = vi.hoisted(() => ({ sub: null as string | null }));
const db = vi.hoisted(() => new Map<string, unknown>());
const kv = vi.hoisted(() => ({ enabled: true }));

vi.mock("@/auth", () => ({ currentUserId: async () => session.sub }));
vi.mock("@/lib/server/progressStore", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/server/progressStore")>();
  const fake: KV = {
    get: async <T,>(key: string) => (db.has(key) ? (JSON.parse(db.get(key) as string) as T) : null),
    set: async (key: string, value: unknown) => db.set(key, value),
  };
  return { ...real, getKV: () => (kv.enabled ? fake : null) };
});

const { GET, PUT } = await import("./route");

const put = (body: unknown, headers: Record<string, string> = {}) =>
  PUT(
    new Request("http://localhost/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const progress = {
  xp: 40,
  streak: 2,
  lastActive: "2026-11-07",
  completedLessons: ["greetings-1"],
  review: { salam: { strength: 2, due: "2026-11-09", seen: 3, missed: 0 } },
  settings: { translit: "fade", audioRate: 1, sfx: true },
};

beforeEach(() => {
  vi.stubEnv("AUTH_GOOGLE_ID", "test-id");
  vi.stubEnv("AUTH_GOOGLE_SECRET", "test-secret");
  vi.stubEnv("AUTH_SECRET", "test-auth-secret");
  session.sub = "google-sub-123";
  kv.enabled = true;
  db.clear();
});
afterEach(() => vi.unstubAllEnvs());

describe("/api/progress", () => {
  it("returns 401 without a session", async () => {
    session.sub = null;
    expect((await GET()).status).toBe(401);
    expect((await put(progress)).status).toBe(401);
  });

  it("returns 401 when auth env vars are missing, even with a session", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    expect((await GET()).status).toBe(401);
  });

  it("returns 503 when Redis is not configured", async () => {
    kv.enabled = false;
    expect((await GET()).status).toBe(503);
  });

  it("GET returns null before anything was saved, with no-store", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.json()).toBeNull();
  });

  it("PUT saves under bia:progress:<sub> with updatedAt, and GET returns it", async () => {
    const res = await put(progress);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect([...db.keys()]).toEqual(["bia:progress:google-sub-123"]);
    const got = await (await GET()).json();
    expect(got).toMatchObject(progress);
    expect(typeof got.updatedAt).toBe("string");
  });

  it("sanitizes the body with normalizeProgress", async () => {
    await put({ xp: -10, streak: "lots", completedLessons: ["a", 3, "a"], review: { x: "junk" } });
    const got = await (await GET()).json();
    expect(got).toMatchObject({ xp: 0, streak: 0, completedLessons: ["a"], review: {} });
    expect(got.settings).toEqual({ translit: "always", audioRate: 1, sfx: true });
  });

  it("merges into the stored copy so a stale device can't erase progress", async () => {
    await put(progress);
    await put({ ...progress, xp: 5, completedLessons: [], review: {}, settings: { translit: "off", audioRate: 0.75, sfx: false } });
    const got = await (await GET()).json();
    expect(got).toMatchObject({ xp: 40, completedLessons: ["greetings-1"] });
    expect(got.review.salam.seen).toBe(3);
    expect(got.settings).toEqual({ translit: "off", audioRate: 0.75, sfx: false });
  });

  it("keeps users apart", async () => {
    await put(progress);
    session.sub = "someone-else";
    expect(await (await GET()).json()).toBeNull();
  });

  it("rejects bodies over 64KB with 413", async () => {
    const big = { ...progress, padding: "x".repeat(65 * 1024) };
    expect((await put(big)).status).toBe(413);
    expect((await put(progress, { "Content-Length": String(70_000) })).status).toBe(413);
    expect(db.size).toBe(0);
  });

  it("rejects invalid JSON and non-objects with 400", async () => {
    expect((await put("{nope")).status).toBe(400);
    expect((await put([1, 2])).status).toBe(400);
    expect((await put("null")).status).toBe(400);
  });

  it("returns 502 (not a crash) when Redis fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    db.set("bia:progress:google-sub-123", "{broken json");
    expect((await GET()).status).toBe(502);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
