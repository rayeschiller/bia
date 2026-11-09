"use client";

import { useState } from "react";
import { Avatar } from "@/components/account/Avatar";
import { GoogleButton } from "@/components/account/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAccount, type AccountApi } from "@/lib/account";

const SHOW_COMING_SOON = process.env.NODE_ENV === "development";

function syncLabel(sync: AccountApi["sync"]) {
  if (sync === "synced") return { text: "Progress synced ✓", className: "text-success-ink" };
  if (sync === "error") return { text: "Not synced yet. Will retry", className: "text-ink-muted" };
  return { text: "Syncing…", className: "text-ink-muted" };
}

/** Settings "Account" card: Google sign-in for cloud progress sync. Hidden when accounts aren't configured. */
export function AccountCard() {
  const { status, user, sync, signOut } = useAccount();
  const [leaving, setLeaving] = useState(false);

  if (status === "loading") return null;

  if (status === "disabled") {
    if (!SHOW_COMING_SOON) return null;
    return (
      <Card className="flex flex-col gap-1">
        <h2 className="font-extrabold">Account</h2>
        <p className="text-sm text-ink-muted">
          Coming soon: sign in to sync progress. (Dev: set AUTH_* and Redis env vars to enable.)
        </p>
      </Card>
    );
  }

  if (status === "signedOut" || !user) {
    return (
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="font-extrabold">Save your progress</h2>
          <p className="text-sm text-ink-muted">Sign in to keep your streak and progress on every device.</p>
        </div>
        <GoogleButton redirectTo="/settings" />
      </Card>
    );
  }

  const label = syncLabel(sync);
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-extrabold">Account</h2>
      <div className="flex items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          {user.name && <p className="truncate font-bold">{user.name}</p>}
          {user.email && <p className="truncate text-sm text-ink-muted">{user.email}</p>}
          <p role="status" className={`text-sm font-bold ${label.className}`}>
            {label.text}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        disabled={leaving}
        onClick={async () => {
          setLeaving(true);
          await signOut();
          setLeaving(false);
        }}
      >
        {leaving ? "Signing out…" : "Sign out"}
      </Button>
      <p className="text-xs text-ink-muted">Signing out keeps your progress on this device.</p>
    </Card>
  );
}
