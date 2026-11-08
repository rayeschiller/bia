"use client";

/**
 * Who's signed in, and cloud sync while they are. Render <AccountProvider>
 * inside <ProgressProvider>; read with useAccount(). Without the auth/Redis
 * env vars the status is "disabled" and the app stays local-only.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { signOutOfGoogle } from "@/app/actions/auth";
import { useProgressStore } from "@/lib/progress";
import { startSync, type SyncHandle, type SyncStatus } from "@/lib/progress/sync";
import type { AccountUser, MeResponse } from "./types";

export type AccountStatus = "loading" | "disabled" | "signedOut" | "signedIn";

export interface AccountApi {
  status: AccountStatus;
  user: AccountUser | null;
  /** Cloud sync state while signed in, else null. */
  sync: SyncStatus | null;
  signOut(): Promise<void>;
}

const AccountContext = createContext<AccountApi>({
  status: "disabled",
  user: null,
  sync: null,
  signOut: async () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const store = useProgressStore();
  const [status, setStatus] = useState<AccountStatus>("loading");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const syncRef = useRef<SyncHandle | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<MeResponse>) : null))
      .catch(() => null)
      .then((me) => {
        if (cancelled) return;
        setUser(me?.user ?? null);
        setStatus(!me?.enabled ? "disabled" : me.user ? "signedIn" : "signedOut");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "signedIn") return;
    const handle = startSync({ store, onStatus: setSync });
    syncRef.current = handle;
    return () => {
      handle.stop();
      syncRef.current = null;
      setSync(null);
    };
  }, [status, store]);

  const signOut = useCallback(async () => {
    syncRef.current?.flush();
    try {
      await signOutOfGoogle();
    } catch {
      // Cookie may survive; the next /api/me check will tell.
    }
    setUser(null);
    setStatus("signedOut"); // progress stays on this device
  }, []);

  const value = useMemo(() => ({ status, user, sync, signOut }), [status, user, sync, signOut]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountApi {
  return useContext(AccountContext);
}
