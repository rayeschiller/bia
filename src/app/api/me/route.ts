import { auth } from "@/auth";
import type { MeResponse } from "@/lib/account/types";
import { isSyncEnabled } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/me: is sign-in available, and who is signed in (no ids or tokens). */
export async function GET() {
  const body: MeResponse = { enabled: isSyncEnabled(), user: null };
  if (body.enabled) {
    try {
      const u = (await auth())?.user;
      if (u?.id) body.user = { name: u.name ?? null, email: u.email ?? null, image: u.image ?? null };
    } catch {
      // Bad/expired cookie or misconfiguration: treat as signed out.
    }
  }
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
