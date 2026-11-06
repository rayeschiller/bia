import { cn } from "@/lib/cn";
import { SlowIcon, SpeakerIcon } from "./icons";

export interface SpeakerButtonProps {
  /** Audio is wired later; this is UI only. */
  onClick?: () => void;
  /** "slow" shows the tortoise variant for 0.75x playback. */
  speed?: "normal" | "slow";
  size?: "md" | "lg";
  /** Accessible name; defaults based on speed. */
  label?: string;
  className?: string;
}

export function SpeakerButton({
  onClick,
  speed = "normal",
  size = "md",
  label,
  className,
}: SpeakerButtonProps) {
  const slow = speed === "slow";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (slow ? "Play slowly" : "Play audio")}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border-b-4 text-on-primary",
        "transition-[transform,border-width] duration-75 active:translate-y-[2px] active:border-b-2",
        slow ? "bg-turquoise/80 border-primary-shadow" : "bg-primary border-primary-shadow",
        size === "lg" ? "size-20" : "size-12",
        className,
      )}
    >
      {slow ? <SlowIcon size={size === "lg" ? 36 : 24} /> : <SpeakerIcon size={size === "lg" ? 40 : 24} />}
    </button>
  );
}
