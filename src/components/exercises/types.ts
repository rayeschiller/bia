import type { ReactNode, Ref } from "react";
import type { Exercise } from "@/lib/types";

export interface ExerciseResult {
  correct: boolean;
  /** Accepted with a one-character slip ("Watch the spelling"). */
  typo?: boolean;
  /** What to show in the FeedbackSheet. */
  correctAnswer: ReactNode;
  /** Per-item outcomes for recordAnswer (item id -> correct). */
  graded: Record<string, boolean>;
}

/** Imperative handle every exercise exposes; the player's Check button calls it. */
export interface ExerciseHandle {
  check(): void;
}

/**
 * Shared props for every exercise component. Pattern: the exercise owns its
 * answer state, reports when Check may be pressed via `onReadyChange`, grades
 * itself in `check()`, and reports the outcome once via `onAnswer`.
 */
export interface ExerciseProps {
  exercise: Exercise;
  /** Transliteration visibility for a given item id (Settings: always / fade / off). */
  showTranslit: (itemId: string) => boolean;
  /** First time this lesson tests the item: show the "NEW WORD" badge. */
  isNew?: boolean;
  /** Seed for stable option shuffling (differs per attempt of a re-queued exercise). */
  seed: string;
  /** Playback rate from settings (1 or 0.75). */
  audioRate?: number;
  onReadyChange: (ready: boolean) => void;
  onAnswer: (result: ExerciseResult) => void;
  ref?: Ref<ExerciseHandle>;
}
