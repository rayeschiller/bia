"use client";

import { useEffect, useState } from "react";
import { GoogleButton } from "@/components/account/GoogleButton";
import { useAccount } from "@/lib/account";
import { browserStorage } from "@/lib/progress/storage";

export const NUDGE_DISMISSED_KEY = "bia:nudge:save-progress:dismissed";

/** Small, dismissible "Save your progress" prompt for signed-out learners (only when sign-in is available). */
export function SaveProgressNudge() {
  const { status } = useAccount();
  // Start hidden; read the dismissal flag after mount so SSR and hydration agree.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of localStorage after hydration
    setDismissed(browserStorage()?.getItem(NUDGE_DISMISSED_KEY) === "1");
  }, []);

  if (status !== "signedOut" || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      browserStorage()?.setItem(NUDGE_DISMISSED_KEY, "1");
    } catch {
      // storage full / blocked: hidden for this session only
    }
  };

  return (
    <aside
      aria-label="Save your progress"
      className="relative flex w-full flex-col gap-2 rounded-card border-2 border-dashed border-primary bg-primary-soft p-3 pr-12 text-left"
    >
      <p className="font-extrabold">Save your progress</p>
      <p className="-mt-2 text-sm text-ink-muted">Keep your streak on every device.</p>
      <GoogleButton redirectTo="/" />
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-0 right-0 flex size-12 items-center justify-center rounded-card text-xl font-black text-ink-muted"
      >
        <span aria-hidden>×</span>
      </button>
    </aside>
  );
}
