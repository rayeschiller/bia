"use client";

import { useImperativeHandle, useMemo, useState, type ReactNode, type Ref } from "react";
import { requireItem, type Item } from "@/lib/content";
import { seededShuffle } from "@/lib/shuffle";
import type { Exercise } from "@/lib/types";
import type { OptionState } from "./OptionCard";
import type { ExerciseHandle, ExerciseResult } from "./types";

interface UseChoiceArgs {
  exercise: Exercise;
  seed: string;
  ref?: Ref<ExerciseHandle>;
  onReadyChange: (ready: boolean) => void;
  onAnswer: (r: ExerciseResult) => void;
  reveal: (target: Item) => ReactNode;
}

/**
 * Shared state for pick-one exercises (MultipleChoice, ListenChoose): builds
 * 3-4 stably shuffled options from the item + distractors, tracks the pick,
 * and grades it when the player calls check().
 */
export function useChoice({ exercise, seed, ref, onReadyChange, onAnswer, reveal }: UseChoiceArgs) {
  const target = requireItem(exercise.itemId!);
  const options = useMemo(() => {
    const ids = [exercise.itemId!, ...(exercise.distractorIds ?? []).slice(0, 3)];
    return seededShuffle(ids, seed).map(requireItem);
  }, [exercise, seed]);
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const pick = (id: string) => {
    if (checked) return;
    setPicked(id);
    onReadyChange(true);
  };

  useImperativeHandle(ref, () => ({
    check() {
      if (!picked || checked) return;
      setChecked(true);
      const correct = picked === target.id;
      onAnswer({ correct, correctAnswer: reveal(target), graded: { [target.id]: correct } });
    },
  }));

  const stateOf = (id: string): OptionState => {
    if (!checked) return picked === id ? "selected" : "idle";
    if (id === target.id) return "correct";
    return id === picked ? "wrong" : "dimmed";
  };

  return { target, options, pick, checked, stateOf };
}
