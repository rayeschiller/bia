import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { isAuthConfigured } from "@/lib/server/env";

const notConfigured = () =>
  new Response("Accounts are not configured", { status: 404, headers: { "Cache-Control": "no-store" } });

/** Auth.js endpoints (incl. /api/auth/callback/google). 404 until the AUTH_* env vars are set. */
export function GET(req: NextRequest) {
  return isAuthConfigured() ? handlers.GET(req) : notConfigured();
}

export function POST(req: NextRequest) {
  return isAuthConfigured() ? handlers.POST(req) : notConfigured();
}
