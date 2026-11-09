"use client";

import { getUnits } from "@/lib/content";
import { UPCOMING_UNITS } from "@/lib/mock";
import { useProgress } from "@/lib/progress";
import { currentStreak, todayLocal } from "@/lib/progress/core";
import { ReviewButton } from "./ReviewButton";
import { SkillPath } from "./SkillPath";
import { TopBar } from "./TopBar";

/** Home: stats bar, current-unit banner, the skill path, and the review button. */
export function HomeView() {
  const { progress, dueReviewItemIds } = useProgress();
  const units = getUnits();
  const done = new Set(progress.completedLessons);
  const firstIncomplete = units.findIndex((u) => u.lessons.some((l) => !done.has(l.id)));
  const currentIndex = firstIncomplete === -1 ? units.length - 1 : firstIncomplete;
  const current = units[currentIndex];
  const nextLesson = current.lessons.find((l) => !done.has(l.id));

  return (
    <>
      <TopBar streak={currentStreak(progress, todayLocal())} xp={progress.xp} />
      <main className="px-4">
        <section className="learn-unit-banner mt-4 rounded-card bg-primary px-4 py-3 text-on-primary dark:bg-[#1646a0] dark:text-white">
          <p className="text-xs font-extrabold tracking-wider uppercase opacity-80">Unit {currentIndex + 1}</p>
          <h1 className="text-xl font-black">{current.title}</h1>
          <p className="text-sm font-bold opacity-90">
            {nextLesson ? `Next: ${nextLesson.title}` : "Unit complete! More units coming soon."}
          </p>
        </section>

        <SkillPath units={units} completedLessons={progress.completedLessons} upcoming={UPCOMING_UNITS} />

        <ReviewButton dueCount={dueReviewItemIds(Infinity).length} />
      </main>
    </>
  );
}
