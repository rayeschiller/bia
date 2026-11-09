"use client";

import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/auth";
import { useAccount } from "@/lib/account";
import { Avatar } from "./Avatar";
import { GoogleG } from "./GoogleButton";

/**
 * Home top bar account control: a compact "Sign in" button when signed out
 * (returns to Home after Google), your photo linking to Settings when signed in.
 * Renders nothing while loading or when accounts aren't configured.
 */
export function AccountChip() {
  const { status, user } = useAccount();

  if (status === "signedIn" && user) {
    return (
      <Link
        href="/settings"
        aria-label="Account settings"
        className="flex min-h-12 min-w-12 items-center justify-center rounded-full"
      >
        <Avatar user={user} className="size-9 text-base" />
      </Link>
    );
  }

  if (status !== "signedOut") return null;

  return (
    <form action={signInWithGoogle.bind(null, "/")}>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#747775] bg-white px-3 text-sm font-bold text-[#1f1f1f] active:bg-[#f2f2f2]"
      >
        <GoogleG />
        Sign in
      </button>
    </form>
  );
}
