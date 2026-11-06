"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Full-row toggle; the whole row is the 48px+ tap target. */
export function Switch({ label, description, checked, onChange }: SwitchProps) {
  const descId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={description ? descId : undefined}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block font-bold">{label}</span>
        {description && (
          <span id={descId} className="block text-sm text-ink-muted">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-disabled",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-6",
          )}
        />
      </span>
    </button>
  );
}
