import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

export interface OptionCardProps {
  state?: OptionState;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const states: Record<OptionState, string> = {
  idle: "bg-surface border-border text-ink active:translate-y-[2px] active:border-b-2",
  selected: "bg-primary-soft border-primary text-ink",
  correct: "bg-success-soft border-success text-success-ink animate-pop",
  wrong: "bg-error-soft border-error text-error-ink",
  dimmed: "bg-surface border-border text-ink-muted opacity-60",
};

/** Chunky answer card for multiple choice and match pairs (English or Persian content). */
export function OptionCard({ state = "idle", onClick, children, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state === "selected"}
      className={cn(
        "flex min-h-14 w-full items-center justify-center rounded-tile border-2 border-b-4 px-4 py-2",
        "text-center text-lg font-bold transition-transform duration-75 select-none",
        states[state],
        className,
      )}
    >
      {children}
    </button>
  );
}
