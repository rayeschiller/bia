"use client";

import { useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseView, type ExerciseHandle, type ExerciseResult } from "@/components/exercises";
import { Button } from "@/components/ui/Button";
import { FeedbackSheet } from "@/components/ui/FeedbackSheet";
import {
  accuracyPct,
  firstTryCorrect,
  isFinished,
  lessonReducer,
  lessonXp,
  runProgress,
  startRun,
  translitVisible,
} from "@/lib/lesson";
import { useProgress } from "@/lib/progress";
import type { Exercise, Progress } from "@/lib/types";
import { LessonComplete } from "./LessonComplete";
import { LessonShell } from "./LessonShell";

export interface LessonPlayerProps {
  title: string;
  exercises: Exercise[];
  /** Exercise ids that get the "NEW WORD" badge. */
  newExerciseIds?: ReadonlySet<string>;
  /** Called once when the run finishes, with the XP earned. Omit for sessions that don't complete a lesson. */
  onComplete?: (xpEarned: number) => void;
}

const PRAISE = ["Nice!", "Âfarin! Nicely done", "Great job!", "Spot on!", "Awesome!", "Nice one!"];

/**
 * Runs a list of exercises: Check is enabled when the exercise says it's
 * ready, the FeedbackSheet shows the verdict, wrong answers are re-queued at
 * the end, and a celebration screen closes the session.
 */
export function LessonPlayer({ title, exercises, newExerciseIds, onComplete }: LessonPlayerProps) {
  const router = useRouter();
  const { progress, recordAnswer } = useProgress();
  const [run, dispatch] = useReducer(lessonReducer, exercises, startRun);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  // Review counts frozen at check time so translit doesn't flicker under the feedback sheet.
  const [frozenReview, setFrozenReview] = useState<Progress["review"] | null>(null);
  const exerciseRef = useRef<ExerciseHandle>(null);

  if (isFinished(run)) {
    const accuracy = accuracyPct(run);
    return (
      <LessonComplete
        title={title}
        xp={onComplete ? lessonXp(firstTryCorrect(run)) : undefined}
        heading={onComplete ? undefined : "Review complete!"}
        accuracy={accuracy}
        onContinue={() => router.push("/")}
      />
    );
  }

  const exercise = run.queue[run.pos];
  const retry = run.pos >= run.total;
  const review = frozenReview ?? progress.review;

  const handleAnswer = (r: ExerciseResult) => {
    setFrozenReview(progress.review);
    for (const [itemId, ok] of Object.entries(r.graded)) recordAnswer(itemId, ok);
    dispatch({ type: "answer", correct: r.correct });
    setResult(r);
  };

  const handleContinue = () => {
    const finishing = run.pos + 1 >= run.queue.length && result?.correct;
    if (finishing) onComplete?.(lessonXp(firstTryCorrect(run)));
    dispatch({ type: "next" });
    setResult(null);
    setReady(false);
    setFrozenReview(null);
  };

  const praise = PRAISE[(run.pos + run.done.length) % PRAISE.length];

  return (
    <LessonShell
      progress={runProgress(run)}
      footer={
        <Button disabled={!ready || result !== null} onClick={() => exerciseRef.current?.check()}>
          Check
        </Button>
      }
      overlay={
        <FeedbackSheet
          open={result !== null}
          status={result?.correct ? "correct" : "wrong"}
          title={result?.typo ? "Watch the spelling" : result?.correct ? praise : undefined}
          correctAnswer={result && (!result.correct || result.typo) ? result.correctAnswer : undefined}
          onContinue={handleContinue}
        />
      }
    >
      {retry && (
        <p className="mb-3 text-sm font-extrabold tracking-wide text-error-ink uppercase">
          <span aria-hidden>↻ </span>Previous mistake
        </p>
      )}
      <ExerciseView
        key={`${run.pos}:${exercise.id}`}
        ref={exerciseRef}
        exercise={exercise}
        seed={retry ? `${exercise.id}:${run.pos}` : exercise.id}
        isNew={!retry && newExerciseIds?.has(exercise.id)}
        showTranslit={(id) => translitVisible(progress.settings.translit, review, id)}
        audioRate={progress.settings.audioRate}
        onReadyChange={setReady}
        onAnswer={handleAnswer}
      />
    </LessonShell>
  );
}
