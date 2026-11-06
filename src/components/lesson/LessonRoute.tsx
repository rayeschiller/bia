"use client";

import { useMemo } from "react";
import { getLesson } from "@/lib/content";
import { newItemExerciseIds } from "@/lib/lesson";
import { useProgress } from "@/lib/progress";
import { LessonPlayer } from "./LessonPlayer";

/** Client entry for /lesson/[lessonId]: looks up the lesson and plays it. */
export function LessonRoute({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!;
  const { completeLesson } = useProgress();
  const newIds = useMemo(() => newItemExerciseIds(lesson), [lesson]);
  return (
    <LessonPlayer
      title={lesson.title}
      exercises={lesson.exercises}
      newExerciseIds={newIds}
      onComplete={(xp) => completeLesson(lesson.id, xp)}
    />
  );
}
