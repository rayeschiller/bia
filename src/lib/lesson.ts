import type { Exercise, Lesson, Progress } from "./types";

/** A lesson in progress: a queue that grows when an answer is wrong. */
export interface LessonRun {
  queue: Exercise[];
  pos: number;
  /** Number of distinct exercises in the lesson (the progress-bar denominator). */
  total: number;
  /** Exercise id -> was it right on the first attempt. */
  firstTry: Record<string, boolean>;
  /** Exercise ids answered correctly at least once. */
  done: string[];
}

export type LessonAction = { type: "answer"; correct: boolean } | { type: "next" };

export function startRun(exercises: Exercise[]): LessonRun {
  return { queue: exercises, pos: 0, total: exercises.length, firstTry: {}, done: [] };
}

/**
 * Duolingo-style flow: a wrong answer puts the exercise back at the end of the
 * queue, so the lesson only ends once every exercise has been answered right.
 */
export function lessonReducer(run: LessonRun, action: LessonAction): LessonRun {
  const ex = run.queue[run.pos];
  if (!ex) return run;
  if (action.type === "next") return { ...run, pos: run.pos + 1 };
  const firstTry = ex.id in run.firstTry ? run.firstTry : { ...run.firstTry, [ex.id]: action.correct };
  if (action.correct) {
    const done = run.done.includes(ex.id) ? run.done : [...run.done, ex.id];
    return { ...run, firstTry, done };
  }
  return { ...run, firstTry, queue: [...run.queue, ex] };
}

export const isFinished = (run: LessonRun) => run.pos >= run.queue.length;
export const runProgress = (run: LessonRun) => (run.total ? run.done.length / run.total : 0);

export function firstTryCorrect(run: LessonRun): number {
  return Object.values(run.firstTry).filter(Boolean).length;
}

/** 10 base XP + 1 per first-try correct answer, capped at 20. */
export function lessonXp(firstTryCorrectCount: number): number {
  return Math.min(20, 10 + firstTryCorrectCount);
}

/** First-try accuracy as a whole percentage. */
export function accuracyPct(run: LessonRun): number {
  return run.total ? Math.round((firstTryCorrect(run) / run.total) * 100) : 0;
}

/** Settings → Transliteration: "fade" keeps it only for items seen fewer than 3 times. */
export function translitVisible(
  setting: Progress["settings"]["translit"],
  review: Progress["review"],
  itemId: string,
): boolean {
  if (setting === "always") return true;
  if (setting === "off") return false;
  return (review[itemId]?.seen ?? 0) < 3;
}

/**
 * Exercise ids that should carry a "NEW WORD" badge: the first exercise that
 * tests each of the lesson's newItemIds.
 */
export function newItemExerciseIds(lesson: Pick<Lesson, "newItemIds" | "exercises">): Set<string> {
  const fresh = new Set(lesson.newItemIds);
  const out = new Set<string>();
  for (const e of lesson.exercises) {
    if (e.itemId && fresh.has(e.itemId)) {
      out.add(e.id);
      fresh.delete(e.itemId);
    }
  }
  return out;
}
