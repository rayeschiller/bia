import Link from "next/link";
import { SkillPath } from "@/components/home/SkillPath";
import { TopBar } from "@/components/home/TopBar";
import { MOCK_PROGRESS, MOCK_UNITS } from "@/lib/mock";

export default function HomePage() {
  // TODO(wiring): read units from ContentBundle and xp/streak/completedLessons from Progress.
  const { xp, streak, completedLessons } = MOCK_PROGRESS;
  const done = new Set(completedLessons);
  const currentIndex = Math.max(
    0,
    MOCK_UNITS.findIndex((u) => u.lessons.some((l) => !done.has(l.id))),
  );
  const current = MOCK_UNITS[currentIndex];

  return (
    <>
      <TopBar streak={streak} xp={xp} />
      <main className="px-4">
        <section className="mt-4 rounded-card bg-primary px-4 py-3 text-on-primary">
          <p className="text-xs font-extrabold tracking-wider uppercase opacity-80">Unit {currentIndex + 1}</p>
          <h1 className="text-xl font-black">{current.title}</h1>
        </section>

        <SkillPath units={MOCK_UNITS} completedLessons={completedLessons} />

        {/* TODO(wiring): route to a review session built from due ItemReview entries. */}
        <Link
          href="/lesson/review"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-[5px] border-border bg-surface px-5 py-3 font-extrabold tracking-wide text-primary uppercase active:translate-y-[3px] active:border-b-2"
        >
          <span aria-hidden>🔁</span> Review
        </Link>
      </main>
    </>
  );
}
