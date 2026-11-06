export interface TopBarProps {
  streak: number;
  xp: number;
}

/** Sticky stats bar for Home: app name, streak, XP. */
export function TopBar({ streak, xp }: TopBarProps) {
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
          className="flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg font-extrabold text-accent-shadow dark:text-saffron"
          aria-label={`${streak} day streak`}
        >
          <span aria-hidden>🔥</span>
          {streak}
        </span>
        <span
          className="flex min-h-12 items-center gap-1 rounded-xl px-2 text-lg font-extrabold text-primary"
          aria-label={`${xp} XP`}
        >
          <span aria-hidden>⭐</span>
          {xp}
        </span>
      </div>
    </header>
  );
}
