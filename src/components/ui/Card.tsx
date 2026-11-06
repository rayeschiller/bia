import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

/** Rounded surface with the same chunky bottom edge as buttons, at rest. */
export function Card({ padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border-2 border-b-4 border-border bg-surface",
        padded && "p-4",
        className,
      )}
      {...props}
    />
  );
}
