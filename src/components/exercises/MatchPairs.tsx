"use client";

import { useImperativeHandle, useMemo, useRef, useState } from "react";
import { FaText } from "@/components/ui/FaText";
import { speak } from "@/lib/audio";
import { requireItem } from "@/lib/content";
import { seededShuffle } from "@/lib/shuffle";
import { AnswerReveal } from "./AnswerReveal";
import { ExerciseHeader } from "./ExerciseHeader";
import { OptionCard, type OptionState } from "./OptionCard";
import type { ExerciseProps } from "./types";

type Side = "fa" | "en";
const FLASH_MS = 450;

/** Tap a Persian tile and its English partner. Correct pairs lock green; wrong ones flash coral. */
export function MatchPairs({ exercise, showTranslit, seed, audioRate = 1, onReadyChange, onAnswer, ref }: ExerciseProps) {
  const items = useMemo(() => (exercise.pairIds ?? []).map(requireItem), [exercise.pairIds]);
  const faCol = useMemo(() => seededShuffle(items, `${seed}:fa`), [items, seed]);
  const enCol = useMemo(() => seededShuffle(items, `${seed}:en`), [items, seed]);
  const [sel, setSel] = useState<{ side: Side; id: string } | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ fa: string; en: string } | null>(null);
  const missed = useRef(new Set<string>());
  const mistakes = useRef(0);
  const [done, setDone] = useState(false);

  const tap = (side: Side, id: string) => {
    if (done || flash || matched.includes(id)) return;
    if (side === "fa") speak(requireItem(id).fa, { rate: audioRate });
    if (!sel || sel.side === side) return setSel({ side, id });
    const fa = side === "fa" ? id : sel.id;
    const en = side === "en" ? id : sel.id;
    setSel(null);
    if (fa === en) {
      const next = [...matched, id];
      setMatched(next);
      if (next.length === items.length) onReadyChange(true);
      return;
    }
    mistakes.current += 1;
    missed.current.add(fa).add(en);
    setFlash({ fa, en });
    setTimeout(() => setFlash(null), FLASH_MS);
  };

  useImperativeHandle(ref, () => ({
    check() {
      if (done || matched.length < items.length) return;
      setDone(true);
      const graded = Object.fromEntries(items.map((it) => [it.id, !missed.current.has(it.id)]));
      const tricky = items.filter((it) => missed.current.has(it.id));
      onAnswer({ correct: mistakes.current <= 1, correctAnswer: <AnswerReveal items={tricky.length ? tricky : items} />, graded });
    },
  }));

  const stateOf = (side: Side, id: string): OptionState => {
    if (matched.includes(id)) return "correct";
    if (flash && flash[side] === id) return "wrong";
    return sel?.side === side && sel.id === id ? "selected" : "idle";
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ExerciseHeader title="Match the pairs" />
      <div className="grid grid-cols-2 gap-3">
        <div role="group" aria-label="Persian" className="flex flex-col gap-3">
          {faCol.map((it) => (
            <OptionCard key={it.id} state={stateOf("fa", it.id)} onClick={() => tap("fa", it.id)} className="min-h-16 px-2">
              <FaText fa={it.fa} translit={it.translit} showTranslit={showTranslit(it.id)} size="sm" />
            </OptionCard>
          ))}
        </div>
        <div role="group" aria-label="English" className="flex flex-col gap-3">
          {enCol.map((it) => (
            <OptionCard key={it.id} state={stateOf("en", it.id)} onClick={() => tap("en", it.id)} className="min-h-16 px-2 text-base">
              {it.en}
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
