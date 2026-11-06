"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FaText } from "@/components/ui/FaText";
import { FeedbackSheet } from "@/components/ui/FeedbackSheet";
import { LessonShell } from "./LessonShell";
import { PlaceholderExercise, type PlaceholderTile } from "./PlaceholderExercise";

const BANK: PlaceholderTile[] = [
  { id: "khubi", fa: "خوبی", translit: "khubi" },
  { id: "salam", fa: "سلام", translit: "salâm" },
  { id: "merci", fa: "مرسی", translit: "mersi" },
  { id: "chetori", fa: "چطوری", translit: "chetori" },
];

/**
 * TODO(wiring): demo-only state so the shell can be exercised end to end.
 * There is no answer checking here; Check alternates correct/wrong so both
 * FeedbackSheet states can be reviewed. The lesson engine owns this later.
 */
export function LessonDemo() {
  const router = useRouter();
  const [answer, setAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [checks, setChecks] = useState(0);

  const toggle = (id: string) =>
    setAnswer((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const check = () => {
    setFeedback(checks % 2 === 0 ? "correct" : "wrong");
    setChecks((n) => n + 1);
  };

  const next = () => {
    setFeedback(null);
    setAnswer([]);
    if (checks >= 4) router.push("/");
  };

  return (
    <LessonShell
      progress={Math.min(checks / 4, 1)}
      footer={
        <Button disabled={answer.length === 0 || feedback !== null} onClick={check}>
          Check
        </Button>
      }
      overlay={
        <FeedbackSheet
          open={feedback !== null}
          status={feedback ?? "correct"}
          correctAnswer={<FaText fa="سلام، خوبی؟" translit="salâm, khubi?" size="md" />}
          onContinue={next}
        />
      }
    >
      <PlaceholderExercise bank={BANK} answer={answer} onToggle={toggle} locked={feedback !== null} />
    </LessonShell>
  );
}
