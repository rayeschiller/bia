import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name, since the button has no visible text. */
  label: string;
  icon: ReactNode;
  variant?: "plain" | "filled";
}

/** Square 48px icon-only button. */
export function IconButton({
  label,
  icon,
  variant = "plain",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-ink-muted",
        "transition-colors hover:bg-surface-2 active:scale-95",
        variant === "filled" && "bg-primary text-on-primary hover:bg-primary",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
