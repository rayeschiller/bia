import { AccountChip } from "@/components/account/AccountChip";
import { cn } from "@/lib/cn";

export interface TopBarProps {
  /** Streak to display (already 0 if broken; see currentStreak). */
  streak: number;
  xp: number;
}

/** Sticky stats bar for Home: app name, streak, XP, and sign-in / account. The flame greys out at 0. */
export function TopBar({ streak, xp }: TopBarProps) {
  const lit = streak > 0;
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-border bg-bg/95 px-4 py-2 backdrop-blur">
      <span className="flex items-baseline gap-2 text-2xl font-black text-primary">
        Bia
        <bdi dir="rtl" lang="fa" className="font-persian text-xl">
          بیا
        </bdi>
      </span>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg font-extrabold",
            lit ? "text-accent-shadow dark:text-saffron" : "text-on-disabled",
          )}
          aria-label={`${streak} day streak`}
          data-testid="streak"
        >
          <span aria-hidden className={cn("transition-[filter,opacity]", !lit && "opacity-50 grayscale")}>
            🔥
          </span>
          {streak}
        </span>
        <span
          className="flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg font-extrabold text-primary"
          aria-label={`${xp} XP`}
          data-testid="xp"
        >
          <span aria-hidden>⭐</span>
          {xp}
        </span>
        <AccountChip />
      </div>
    </header>
  );
}
