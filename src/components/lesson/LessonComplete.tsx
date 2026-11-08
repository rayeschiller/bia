"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FaText } from "@/components/ui/FaText";
import { SaveProgressNudge } from "./SaveProgressNudge";

export interface LessonCompleteProps {
  title: string;
  /** XP earned this session; omitted for sessions that award none (e.g. review). */
  xp?: number;
  /** 0..100 */
  accuracy: number;
  heading?: string;
  onContinue: () => void;
}

const COLORS = ["bg-turquoise", "bg-saffron", "bg-success", "bg-error", "bg-primary"];
// Fixed confetti layout (no Math.random) so server and client render alike.
const PIECES = Array.from({ length: 18 }, (_, i) => ({
  color: COLORS[i % COLORS.length],
  style: {
    left: `${8 + ((i * 37) % 84)}%`,
    animationDelay: `${(i % 6) * 70}ms`,
    "--dx": `${((i * 53) % 120) - 60}px`,
    "--dy": `${200 + ((i * 29) % 140)}px`,
    "--rot": `${(i % 2 ? 1 : -1) * (240 + i * 20)}deg`,
  } as CSSProperties,
}));

/** End-of-lesson celebration: XP, accuracy, Continue. Confetti is skipped under reduced motion. */
export function LessonComplete({ title, xp, accuracy, heading = "Lesson complete!", onContinue }: LessonCompleteProps) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-16 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 motion-reduce:hidden">
        {PIECES.map((p, i) => (
          <span
            key={i}
            className={`absolute top-10 block h-3 w-2 animate-confetti rounded-sm ${p.color}`}
            style={p.style}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 text-center">
        <span aria-hidden className="animate-celebrate text-8xl">
          🎉
        </span>
        <FaText fa="آفرین!" translit="âfarin!" size="xl" />
        <h1 className="text-2xl font-black">{heading}</h1>
        <p className="text-ink-muted">{title}</p>

        <div className={`mt-4 grid w-full gap-3 ${xp === undefined ? "grid-cols-1" : "grid-cols-2"}`}>
          {xp !== undefined && (
            <Card className="flex flex-col items-center gap-1 border-accent!">
              <span className="text-xs font-black tracking-wider text-accent-shadow uppercase dark:text-saffron">
                XP earned
              </span>
              <span className="text-2xl font-black whitespace-nowrap">
                <span aria-hidden>⭐ </span>+{xp}
              </span>
            </Card>
          )}
          <Card className="flex flex-col items-center gap-1 border-success!">
            <span className="text-xs font-black tracking-wider text-success-ink uppercase">Accuracy</span>
            <span className="text-2xl font-black whitespace-nowrap">
              <span aria-hidden>🎯 </span>
              {accuracy}%
            </span>
          </Card>
        </div>

        {xp !== undefined && <SaveProgressNudge />}
      </div>

      <Button onClick={onContinue} autoFocus>
        Continue
      </Button>
    </div>
  );
}
