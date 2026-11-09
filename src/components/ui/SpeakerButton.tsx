"use client";

import { speak } from "@/lib/audio";
import { cn } from "@/lib/cn";
import { SlowIcon, SpeakerIcon } from "./icons";

export interface SpeakerButtonProps {
  /** Persian text to speak via `speak()` (lib/audio). */
  text?: string;
  /** Playback rate for normal speed (Settings → audio speed). "slow" always uses 0.75. */
  rate?: number;
  /** Extra handler, called after speaking. */
  onClick?: () => void;
  /** "slow" shows the tortoise variant for 0.75x playback. */
  speed?: "normal" | "slow";
  size?: "md" | "lg";
  /** Accessible name; defaults based on speed. */
  label?: string;
  className?: string;
}

export function SpeakerButton({
  text,
  rate = 1,
  onClick,
  speed = "normal",
  size = "md",
  label,
  className,
}: SpeakerButtonProps) {
  const slow = speed === "slow";
  const handleClick = () => {
    if (text) speak(text, { rate: slow ? 0.75 : rate });
    onClick?.();
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label ?? (slow ? "Play slowly" : "Play audio")}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border-b-4 text-on-primary",
        "transition-[transform,border-width] duration-75 active:translate-y-[2px] active:border-b-2",
        slow ? "bg-primary/90 border-primary-shadow" : "bg-primary border-primary-shadow",
        size === "lg" ? "size-20" : "size-12",
        className,
      )}
    >
      {slow ? <SlowIcon size={size === "lg" ? 36 : 24} /> : <SpeakerIcon size={size === "lg" ? 40 : 24} />}
    </button>
  );
}
