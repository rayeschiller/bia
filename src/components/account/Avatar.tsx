"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AccountUser } from "@/lib/account/types";

/** Google profile photo, or the first initial if there's no photo or it fails to load. */
export function Avatar({ user, className }: { user: AccountUser; className?: string }) {
  const [broken, setBroken] = useState(false);
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();
  if (user.image && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny remote avatar; no image optimisation needed
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={cn("size-12 shrink-0 rounded-full border-2 border-border object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-black text-on-primary",
        className,
      )}
    >
      {initial}
    </span>
  );
}
