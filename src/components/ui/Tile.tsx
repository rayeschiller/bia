import { cn } from "@/lib/cn";

export type TileState = "idle" | "selected" | "correct" | "wrong" | "disabled";

export interface TileProps {
  /** Persian word shown on the tile. */
  fa: string;
  translit?: string;
  showTranslit?: boolean;
  state?: TileState;
  onClick?: () => void;
  className?: string;
}

const states: Record<TileState, string> = {
  idle: "bg-surface border-border text-ink active:translate-y-[2px] active:border-b-2",
  selected: "bg-primary-soft border-primary text-ink",
  correct: "bg-success-soft border-success text-success-ink animate-pop",
  wrong: "bg-error-soft border-error text-error-ink",
  // "disabled" = placeholder left behind once a word moves into the answer row
  disabled: "bg-disabled border-disabled text-transparent",
};

/**
 * Selectable word tile for sentence building. The tile is a button (LTR
 * element) whose label is an RTL island, so tiles can live in either an LTR
 * word bank or an RTL answer row.
 */
export function Tile({
  fa,
  translit,
  showTranslit = true,
  state = "idle",
  onClick,
  className,
}: TileProps) {
  const disabled = state === "disabled";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      aria-hidden={disabled || undefined}
      className={cn(
        "inline-flex min-h-12 min-w-12 flex-col items-center justify-center rounded-tile border-2 border-b-4 px-3 py-1",
        "transition-transform duration-75 select-none",
        states[state],
        className,
      )}
    >
      <bdi dir="rtl" lang="fa" className="font-persian text-xl leading-snug font-semibold">
        {fa}
      </bdi>
      {translit && showTranslit && (
        <span dir="ltr" className={cn("text-xs", disabled ? "text-transparent" : "text-ink-muted")}>
          {translit}
        </span>
      )}
    </button>
  );
}
