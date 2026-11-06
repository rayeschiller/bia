"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Two-step, in-app confirm (no window.confirm): tap "Reset", then confirm or cancel inline. */
export function ResetProgress() {
  const { resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h2 className="font-extrabold">Reset progress</h2>
        <p className="text-sm text-ink-muted">Clears XP, streak, completed lessons, reviews and settings on this device.</p>
      </div>

      {confirming ? (
        <div role="alertdialog" aria-labelledby="reset-q" className="flex flex-col gap-3 rounded-tile bg-error-soft p-3">
          <p id="reset-q" className="font-bold text-error-ink">
            Erase all progress? This can’t be undone.
          </p>
          <div className="flex gap-2">
            {/* Focus lands on the safe choice when the confirm step opens. */}
            <Button autoFocus variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={() => {
                resetProgress();
                setConfirming(false);
                setDone(true);
              }}
            >
              Yes, reset
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="text-error-ink"
          onClick={() => {
            setDone(false);
            setConfirming(true);
          }}
        >
          Reset progress
        </Button>
      )}

      <p role="status" className="text-sm text-ink-muted empty:hidden">
        {done ? "Progress reset." : ""}
      </p>
    </Card>
  );
}
