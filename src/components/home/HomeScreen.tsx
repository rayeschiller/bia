"use client";

import { ReviewButton } from "@/components/home/ReviewButton";
import { SkillPath } from "@/components/home/SkillPath";
import { TopBar } from "@/components/home/TopBar";
import { useProgress } from "@/lib/progress";
import { currentStreak, todayLocal } from "@/lib/progress/core";
import type { Unit } from "@/lib/types";

/** Home screen bound to live progress. Units come from the caller (content loader). */
export function HomeScreen({ units }: { units: Unit[] }) {
  const { progress, dueReviewItemIds } = useProgress();
  const { xp, completedLessons } = progress;
  const done = new Set(completedLessons);
  const currentIndex = Math.max(
    0,
    units.findIndex((u) => u.lessons.some((l) => !done.has(l.id))),
  );
  const current = units[currentIndex];

  return (
    <>
      <TopBar streak={currentStreak(progress, todayLocal())} xp={xp} />
      <main className="px-4">
        <section className="mt-4 rounded-card bg-primary px-4 py-3 text-on-primary">
          <p className="text-xs font-extrabold tracking-wider uppercase opacity-80">Unit {currentIndex + 1}</p>
          <h1 className="text-xl font-black">{current.title}</h1>
        </section>

        <SkillPath units={units} completedLessons={completedLessons} />

        <ReviewButton dueCount={dueReviewItemIds(Infinity).length} />
      </main>
    </>
  );
}
