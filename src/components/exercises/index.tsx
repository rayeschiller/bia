"use client";

import type { ExerciseType } from "@/lib/types";
import { BuildSentence } from "./BuildSentence";
import { ListenChoose } from "./ListenChoose";
import { MatchPairs } from "./MatchPairs";
import { MultipleChoice } from "./MultipleChoice";
import { TypeTranslit } from "./TypeTranslit";
import type { ExerciseProps } from "./types";

export type { ExerciseHandle, ExerciseProps, ExerciseResult } from "./types";

const COMPONENTS: Record<ExerciseType, (p: ExerciseProps) => React.ReactNode> = {
  multiple_choice: MultipleChoice,
  build_sentence: BuildSentence,
  match_pairs: MatchPairs,
  listen_choose: ListenChoose,
  type_translit: TypeTranslit,
};

/** Renders the right component for `exercise.type`. All share ExerciseProps. */
export function ExerciseView(props: ExerciseProps) {
  const Component = COMPONENTS[props.exercise.type];
  return (
    <div className="flex flex-1 flex-col" data-exercise-id={props.exercise.id} data-exercise-type={props.exercise.type}>
      <Component {...props} />
    </div>
  );
}
