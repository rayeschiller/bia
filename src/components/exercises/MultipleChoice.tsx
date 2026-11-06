"use client";

import { FaText } from "@/components/ui/FaText";
import { SpeakerButton } from "@/components/ui/SpeakerButton";
import { AnswerReveal } from "./AnswerReveal";
import { ExerciseHeader } from "./ExerciseHeader";
import { OptionCard } from "./OptionCard";
import type { ExerciseProps } from "./types";
import { useChoice } from "./useChoice";

/**
 * fa_to_en: see Persian (+ speaker), pick the English meaning.
 * en_to_fa: see English, pick the Persian card.
 */
export function MultipleChoice({ exercise, showTranslit, isNew, seed, audioRate, onReadyChange, onAnswer, ref }: ExerciseProps) {
  const { target, options, pick, checked, stateOf } = useChoice({
    exercise,
    seed,
    ref,
    onReadyChange,
    onAnswer,
    reveal: (t) => <AnswerReveal items={[t]} />,
  });
  const faToEn = exercise.direction !== "en_to_fa";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ExerciseHeader title={faToEn ? "What does this mean?" : "Pick the Persian"} isNew={isNew} />

      {faToEn ? (
        <div className="flex items-center justify-center gap-4 rounded-card border-2 border-border bg-surface px-4 py-5">
          <SpeakerButton text={target.fa} rate={audioRate} />
          <FaText fa={target.fa} translit={target.translit} showTranslit={showTranslit(target.id)} size="xl" />
        </div>
      ) : (
        <p className="rounded-card border-2 border-border bg-surface px-4 py-5 text-center text-2xl font-bold">
          {target.en}
        </p>
      )}

      <div role="group" aria-label="Answer options" className="flex flex-col gap-3">
        {options.map((o) => (
          <OptionCard key={o.id} state={stateOf(o.id)} onClick={checked ? undefined : () => pick(o.id)}>
            {faToEn ? (
              o.en
            ) : (
              <FaText fa={o.fa} translit={o.translit} showTranslit={showTranslit(o.id)} size="md" />
            )}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
