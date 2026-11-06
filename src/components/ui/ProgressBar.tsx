import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  /** Accessible label, e.g. "Lesson progress". */
  label?: string;
  tone?: "success" | "primary" | "accent";
  className?: string;
}

const tones = {
  success: "bg-success",
  primary: "bg-primary",
  accent: "bg-accent",
} as const;

export function ProgressBar({
  value,
  label = "Progress",
  tone = "success",
  className,
}: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-4 w-full overflow-hidden rounded-full bg-disabled", className)}
    >
      <div
        className={cn(
          "relative h-full rounded-full transition-[width] duration-500 ease-out",
          tones[tone],
        )}
        style={{ width: `${pct}%` }}
      >
        {/* glossy highlight stripe */}
        <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
