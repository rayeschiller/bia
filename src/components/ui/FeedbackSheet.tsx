import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { CheckIcon, CloseIcon } from "./icons";

export interface FeedbackSheetProps {
  open: boolean;
  status: "correct" | "wrong";
  /** Override the heading. Defaults: "Âfarin! Nicely done" / "Not quite". */
  title?: string;
  /** Slot for the correct answer (e.g. a <FaText/>), shown mainly when wrong. */
  correctAnswer?: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
}

/**
 * Bottom sheet that slides up after Check. Green for correct, coral for wrong.
 * Rendered as a polite live region so screen readers announce the result.
 */
export function FeedbackSheet({
  open,
  status,
  title,
  correctAnswer,
  onContinue,
  continueLabel = "Continue",
}: FeedbackSheetProps) {
  if (!open) return null;
  const ok = status === "correct";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 animate-sheet-up rounded-t-3xl",
        "px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        ok ? "bg-success-soft" : "bg-error-soft",
      )}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full bg-surface",
              ok ? "text-success" : "text-error",
            )}
          >
            {ok ? <CheckIcon /> : <CloseIcon />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xl font-extrabold", ok ? "text-success-ink" : "text-error-ink")}>
              {title ?? (ok ? "Âfarin! Nicely done" : "Not quite")}
            </p>
            {correctAnswer && (
              <div className={cn("mt-1", ok ? "text-success-ink" : "text-error-ink")}>
                <p className="text-sm font-bold">Correct answer:</p>
                <div className="mt-1">{correctAnswer}</div>
              </div>
            )}
          </div>
        </div>
        <Button variant={ok ? "success" : "error"} onClick={onContinue} autoFocus>
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
