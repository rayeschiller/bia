import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "error";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Stretch to container width (default true: most buttons are full-width on mobile). */
  block?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary border-primary-shadow",
  secondary: "bg-surface text-primary border-border border-2 border-b-[5px]",
  ghost: "bg-transparent text-primary border-transparent border-b-0 active:translate-y-0",
  success: "bg-success text-white border-success-shadow dark:text-bg",
  error: "bg-error text-white border-error-shadow dark:text-bg",
};

/**
 * Big, chunky "pressable" button. The thick bottom border is the 3D edge;
 * on press the button drops by that edge so it feels physically pushed.
 */
export function Button({
  variant = "primary",
  block = true,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-[5px] px-5 py-3",
        "text-base font-extrabold tracking-wide uppercase select-none",
        "transition-[transform,border-width] duration-75",
        "active:translate-y-[3px] active:border-b-2",
        "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-on-disabled disabled:active:translate-y-0",
        variants[variant],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
