"use server";

import { signIn, signOut } from "@/auth";
import { isAuthConfigured, isSyncEnabled } from "@/lib/server/env";

/** Only same-origin paths, so this can't be used as an open redirect. */
const safePath = (path: unknown) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/";

/** Starts Google sign-in, then returns the learner to `redirectTo`. */
export async function signInWithGoogle(redirectTo: string): Promise<void> {
  if (!isSyncEnabled()) return;
  await signIn("google", { redirectTo: safePath(redirectTo) });
}

/** Clears the session cookie. Local progress on the device is kept. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isAuthConfigured()) return;
  await signOut({ redirect: false });
}
