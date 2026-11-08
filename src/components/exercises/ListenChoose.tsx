"use client";

import { useEffect } from "react";
import { FaText } from "@/components/ui/FaText";
import { SpeakerButton } from "@/components/ui/SpeakerButton";
import { speak } from "@/lib/audio";
import { AnswerReveal } from "./AnswerReveal";
import { ExerciseHeader } from "./ExerciseHeader";
import { OptionCard } from "./OptionCard";
import type { ExerciseProps } from "./types";
import { useChoice } from "./useChoice";

/** Hear the word (auto-plays once), pick the Persian card. Translit stays hidden until checked. */
export function ListenChoose({ exercise, showTranslit, isNew, seed, audioRate = 1, onReadyChange, onAnswer, ref }: ExerciseProps) {
  const { target, options, pick, checked, stateOf } = useChoice({
    exercise,
    seed,
    ref,
    onReadyChange,
    onAnswer,
    reveal: (t) => <AnswerReveal items={[t]} />,
  });

  useEffect(() => {
    speak(target.fa, { rate: audioRate });
    // Auto-play once per exercise attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ExerciseHeader title="What do you hear?" isNew={isNew} />

      <div className="flex items-center justify-center gap-4 py-2">
        <SpeakerButton text={target.fa} rate={audioRate} size="lg" label="Play the word" />
        <SpeakerButton text={target.fa} speed="slow" label="Play the word slowly" />
      </div>

      <div role="group" aria-label="Answer options" className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <OptionCard
            key={o.id}
            state={stateOf(o.id)}
            onClick={checked ? undefined : () => pick(o.id)}
            className="min-h-20"
          >
            <FaText fa={o.fa} translit={o.translit} showTranslit={showTranslit(o.id)} size="md" />
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
