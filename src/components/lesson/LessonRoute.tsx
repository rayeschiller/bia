"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getLesson, getUnitForLesson, getUnits } from "@/lib/content";
import { firstIncompleteUnit, newItemExerciseIds, unitState } from "@/lib/lesson";
import { useProgress } from "@/lib/progress";
import { LessonPlayer } from "./LessonPlayer";

/** Client entry for /lesson/[lessonId]: looks up the lesson and plays it. */
export function LessonRoute({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!;
  const { progress, completeLesson } = useProgress();
  const newIds = useMemo(() => newItemExerciseIds(lesson), [lesson]);
  const units = getUnits();
  const unit = getUnitForLesson(lessonId)!;
  const completed = new Set(progress.completedLessons);
  const current = units[firstIncompleteUnit(units, completed)];

  if (unitState(unit, completed, current === unit) === "locked") {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-12">
        <h1 className="text-2xl font-black">{unit.title} is locked</h1>
        <p className="mt-2 text-ink-muted">Finish the earlier units on your path to unlock this one.</p>
        <Link href="/" className="mt-6 inline-block font-extrabold text-primary underline">
          Back to Learn
        </Link>
      </main>
    );
  }

  return (
    <LessonPlayer
      key={lessonId}
      title={lesson.title}
      exercises={lesson.exercises}
      newExerciseIds={newIds}
      onComplete={(xp) => completeLesson(lesson.id, xp)}
    />
  );
}
