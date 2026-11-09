import Link from "next/link";
import { cn } from "@/lib/cn";
import { LockIcon } from "@/components/ui/icons";

export type UnitNodeState = "done" | "current" | "locked";

export interface UnitNodeProps {
  title: string;
  emoji: string;
  /** 0..1 fraction of lessons complete. */
  progress: number;
  state: UnitNodeState;
  /** Where tapping goes (next lesson). Ignored when locked. */
  href: string;
}

const SIZE = 88;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Round path node with a progress ring around a chunky 3D button. */
export function UnitNode({ title, emoji, progress, state, href }: UnitNodeProps) {
  const locked = state === "locked";
  const pct = Math.round(progress * 100);

  const face = (
    <span
      className={cn(
        "flex size-[66px] items-center justify-center rounded-full border-b-[6px] text-3xl",
        state === "done" && "bg-accent border-accent-shadow",
        state === "current" && "bg-primary border-primary-shadow",
        locked && "bg-disabled border-border text-on-disabled",
      )}
    >
      {locked ? <LockIcon size={28} /> : <span aria-hidden>{emoji}</span>}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90" aria-hidden>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            className={state === "current" ? "stroke-primary-soft" : "stroke-disabled"}
          />
          {!locked && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              className={state === "done" ? "stroke-saffron" : "stroke-primary"}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {locked ? (
            <span role="img" aria-label={`${title}, locked`}>
              {face}
            </span>
          ) : (
            <Link
              href={href}
              aria-label={`${title}, ${pct}% complete`}
              className="rounded-full transition-transform active:translate-y-[3px]"
            >
              {face}
            </Link>
          )}
        </div>
      </div>
      <span className={cn("text-sm font-bold", locked ? "text-ink-muted" : "text-ink")}>{title}</span>
    </div>
  );
}
