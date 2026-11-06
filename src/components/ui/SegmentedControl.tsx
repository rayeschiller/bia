"use client";

import { cn } from "@/lib/cn";

export interface SegmentedControlProps<T extends string | number> {
  /** Visible group label (used as the radiogroup's accessible name). */
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-2xl bg-surface-2 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-12 flex-1 rounded-xl px-2 text-sm font-bold transition-colors",
              active ? "bg-surface text-primary shadow-sm" : "text-ink-muted",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
