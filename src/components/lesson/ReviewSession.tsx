"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/lib/progress";
import { buildReviewExercises } from "@/lib/review";
import type { Exercise } from "@/lib/types";
import { LessonPlayer } from "./LessonPlayer";

const SESSION_SIZE = 10;
const noop = () => () => {};

/**
 * /lesson/review: a ~10-exercise session over due items. The exercise list is
 * frozen when the learner taps Start, so answering doesn't reshuffle the queue.
 */
export function ReviewSession() {
  const { dueReviewItemIds } = useProgress();
  const [session, setSession] = useState<Exercise[] | null>(null);
  // Progress lives in the browser, so only ask what's due once mounted (no hydration mismatch).
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const due = mounted ? dueReviewItemIds(SESSION_SIZE) : [];

  if (session) return <LessonPlayer title="Review" exercises={session} />;
  if (!mounted) return null;

  const empty = due.length === 0;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 pt-20 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
      <div className="flex flex-1 flex-col items-center gap-3">
        <span aria-hidden className="text-7xl">
          {empty ? "🫖" : "🔁"}
        </span>
        <h1 className="text-2xl font-black">{empty ? "All caught up!" : "Time to review"}</h1>
        <p className="max-w-xs text-ink-muted">
          {empty
            ? "Nothing is due for review right now. Pour yourself a chây and come back later."
            : `${due.length} ${due.length === 1 ? "word is" : "words are"} ready for a quick refresher.`}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {!empty && (
          <Button onClick={() => setSession(buildReviewExercises(due, SESSION_SIZE, `review:${due.join(",")}`))}>
            Start review
          </Button>
        )}
        <Link
          href="/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-b-[5px] border-border bg-surface px-5 py-3 font-extrabold tracking-wide text-primary uppercase active:translate-y-[3px] active:border-b-2"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
