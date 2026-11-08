import { currentUserId } from "@/auth";
import { normalizeProgress } from "@/lib/progress/core";
import { mergeProgress } from "@/lib/progress/merge";
import { isAuthConfigured } from "@/lib/server/env";
import { getKV, readProgress, stripMeta, writeProgress, type KV } from "@/lib/server/progressStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Signed-in user + Redis, or the error response to send. */
async function context(): Promise<{ error: Response } | { sub: string; kv: KV }> {
  const sub = isAuthConfigured() ? await currentUserId() : null;
  if (!sub) return { error: json({ error: "unauthorized" }, 401) };
  const kv = getKV();
  if (!kv) return { error: json({ error: "sync unavailable" }, 503) };
  return { sub, kv };
}

/** GET /api/progress → the stored Progress (plus `updatedAt`) or `null`. */
export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  try {
    return json(await readProgress(ctx.kv, ctx.sub));
  } catch (err) {
    console.error("progress read failed", err);
    return json({ error: "storage error" }, 502);
  }
}

/**
 * PUT /api/progress with a Progress JSON body (≤ 64KB). The body is sanitized
 * with normalizeProgress, then merged into the stored copy so a stale device
 * can never erase progress made elsewhere (its settings still win).
 */
export async function PUT(req: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "payload too large" }, 413);
  }
  const text = await req.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return json({ error: "payload too large" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json({ error: "expected a progress object" }, 400);
  }

  try {
    const incoming = stripMeta(normalizeProgress(body));
    const stored = await readProgress(ctx.kv, ctx.sub);
    const next = stored ? mergeProgress(stripMeta(stored), incoming) : incoming;
    const saved = await writeProgress(ctx.kv, ctx.sub, next);
    return json({ ok: true, updatedAt: saved.updatedAt });
  } catch (err) {
    console.error("progress write failed", err);
    return json({ error: "storage error" }, 502);
  }
}
