"use client";

import { useImperativeHandle, useMemo, useState } from "react";
import { Tile, type TileState } from "@/components/ui/Tile";
import { checkTiles } from "@/lib/check";
import { isPhrase, requireItem } from "@/lib/content";
import { seededShuffle } from "@/lib/shuffle";
import { AnswerReveal } from "./AnswerReveal";
import { ExerciseHeader } from "./ExerciseHeader";
import type { ExerciseProps } from "./types";

/** See English, tap Persian word tiles into an RTL answer row in the right order. */
export function BuildSentence({ exercise, showTranslit, isNew, seed, onReadyChange, onAnswer, ref }: ExerciseProps) {
  const phrase = requireItem(exercise.itemId!);
  if (!isPhrase(phrase)) throw new Error(`build_sentence needs a phrase: ${phrase.id}`);
  // Bank slots are indexed so a word that appears twice still gets two tiles.
  const bank = useMemo(
    () => seededShuffle([...phrase.wordIds, ...(exercise.distractorIds ?? [])], seed).map(requireItem),
    [phrase, exercise.distractorIds, seed],
  );
  const [answer, setAnswer] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const locked = verdict !== null;

  const toggle = (slot: number) => {
    if (locked) return;
    const next = answer.includes(slot) ? answer.filter((s) => s !== slot) : [...answer, slot];
    setAnswer(next);
    onReadyChange(next.length > 0);
  };

  useImperativeHandle(ref, () => ({
    check() {
      if (locked || answer.length === 0) return;
      const { correct } = checkTiles(answer.map((s) => bank[s].id), phrase);
      setVerdict(correct);
      onAnswer({ correct, correctAnswer: <AnswerReveal items={[phrase]} />, graded: { [phrase.id]: correct } });
    },
  }));

  const answerState: TileState = verdict === null ? "idle" : verdict ? "correct" : "wrong";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ExerciseHeader title="Build this in Farsi" isNew={isNew} />

      <p className="rounded-card border-2 border-border bg-surface px-4 py-3 text-lg font-bold">{phrase.en}</p>

      {/* Left-to-right so the Finglish reads in order as you tap. */}
      <div
        dir="ltr"
        aria-label="Your answer"
        className="flex min-h-[7.5rem] flex-wrap content-start gap-2 border-y-2 border-border py-3"
      >
        {answer.map((slot) => (
          <Tile
            key={slot}
            fa={bank[slot].fa}
            translit={bank[slot].translit}
            showTranslit={showTranslit(bank[slot].id)}
            state={answerState}
            onClick={locked ? undefined : () => toggle(slot)}
          />
        ))}
      </div>

      <div dir="ltr" aria-label="Word bank" className="flex flex-wrap justify-center gap-2">
        {bank.map((w, slot) => (
          <Tile
            key={slot}
            fa={w.fa}
            translit={w.translit}
            showTranslit={showTranslit(w.id)}
            state={answer.includes(slot) ? "disabled" : "idle"}
            onClick={locked ? undefined : () => toggle(slot)}
          />
        ))}
      </div>
    </div>
  );
}
