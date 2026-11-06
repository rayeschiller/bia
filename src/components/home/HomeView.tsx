"use client";

import Link from "next/link";
import { getUnits } from "@/lib/content";
import { UPCOMING_UNITS } from "@/lib/mock";
import { useProgress } from "@/lib/progress";
import { SkillPath } from "./SkillPath";
import { TopBar } from "./TopBar";

/** Home: stats bar, current-unit banner, the skill path, and the review button. */
export function HomeView() {
  const { progress } = useProgress();
  const units = getUnits();
  const done = new Set(progress.completedLessons);
  const firstIncomplete = units.findIndex((u) => u.lessons.some((l) => !done.has(l.id)));
  const allDone = firstIncomplete === -1;
  const currentIndex = allDone ? units.length - 1 : firstIncomplete;
  const current = units[currentIndex];
  const nextLesson = current.lessons.find((l) => !done.has(l.id));

  return (
    <>
      <TopBar streak={progress.streak} xp={progress.xp} />
      <main className="px-4">
        <section className="mt-4 rounded-card bg-primary px-4 py-3 text-on-primary">
          <p className="text-xs font-extrabold tracking-wider uppercase opacity-80">Unit {currentIndex + 1}</p>
          <h1 className="text-xl font-black">{current.title}</h1>
          <p className="text-sm font-bold opacity-90">
            {nextLesson ? `Next: ${nextLesson.title}` : "Unit complete! More units coming soon."}
          </p>
        </section>

        <SkillPath units={units} completedLessons={progress.completedLessons} upcoming={UPCOMING_UNITS} />

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
