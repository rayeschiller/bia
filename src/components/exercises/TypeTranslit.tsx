"use client";

import { useId, useImperativeHandle, useState } from "react";
import { SpeakerButton } from "@/components/ui/SpeakerButton";
import { checkTranslit } from "@/lib/check";
import { cn } from "@/lib/cn";
import { requireItem } from "@/lib/content";
import { AnswerReveal } from "./AnswerReveal";
import { ExerciseHeader } from "./ExerciseHeader";
import type { ExerciseProps } from "./types";

/** See English (and hear it), type the Finglish. Enter submits via the player's Check. */
export function TypeTranslit({ exercise, isNew, audioRate, onReadyChange, onAnswer, ref }: ExerciseProps) {
  const item = requireItem(exercise.itemId!);
  const inputId = useId();
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<null | "right" | "typo" | "wrong">(null);

  const check = () => {
    if (verdict || !value.trim()) return;
    const r = checkTranslit(value, item);
    setVerdict(!r.correct ? "wrong" : r.typo ? "typo" : "right");
    onAnswer({
      correct: r.correct,
      typo: r.typo,
      correctAnswer: <AnswerReveal items={[item]} />,
      graded: { [item.id]: r.correct },
    });
  };
  useImperativeHandle(ref, () => ({ check }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ExerciseHeader title="Type this in Finglish" isNew={isNew} />

      <div className="flex items-center gap-3">
        <SpeakerButton text={item.fa} rate={audioRate} />
        <p className="flex-1 rounded-card border-2 border-border bg-surface px-4 py-3 text-xl font-bold">{item.en}</p>
      </div>

      <label htmlFor={inputId} className="sr-only">
        Your answer in Finglish
      </label>
      <input
        id={inputId}
        type="text"
        dir="ltr"
        lang="fa-Latn"
        value={value}
        readOnly={verdict !== null}
        onChange={(e) => {
          setValue(e.target.value);
          onReadyChange(e.target.value.trim().length > 0);
        }}
        placeholder="Type in Finglish…"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        onKeyDown={(e) => {
          if (e.key === "Enter") check();
        }}
        className={cn(
          "min-h-16 w-full rounded-card border-2 border-b-4 bg-surface px-4 text-2xl font-bold outline-none",
          "placeholder:font-semibold placeholder:text-on-disabled focus:border-primary",
          verdict === null && "border-border",
          verdict === "right" && "border-success text-success-ink",
          verdict === "typo" && "border-accent text-ink",
          verdict === "wrong" && "border-error text-error-ink",
        )}
      />
    </div>
  );
}
