import type { ElementType } from "react";
import { cn } from "@/lib/cn";

export type FaTextSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface FaTextProps {
  /** Persian script. */
  fa: string;
  /** Finglish transliteration (LTR). */
  translit?: string;
  /** Show the transliteration line under the Persian. Default true when translit is given. */
  showTranslit?: boolean;
  size?: FaTextSize;
  /** Wrapper element. Defaults to span (inline-safe). */
  as?: ElementType;
  className?: string;
}

// Persian sizes run ~1.25x larger than Latin so the script reads comfortably.
const faSizes: Record<FaTextSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-6xl",
};

const translitSizes: Record<FaTextSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
  "2xl": "text-xl",
};

/**
 * Renders Persian text in its own RTL island (dir="rtl", lang="fa", Vazirmatn)
 * so it never flips the surrounding LTR layout. The transliteration is a
 * separate LTR line.
 */
export function FaText({
  fa,
  translit,
  showTranslit = true,
  size = "md",
  as: Tag = "span",
  className,
}: FaTextProps) {
  const withTranslit = Boolean(translit) && showTranslit;
  return (
    <Tag className={cn("inline-flex flex-col items-center", className)}>
      <bdi
        dir="rtl"
        lang="fa"
        className={cn("font-persian leading-[1.6] font-semibold", faSizes[size])}
      >
        {fa}
      </bdi>
      {withTranslit && (
        <span dir="ltr" lang="fa-Latn" className={cn("text-ink-muted italic", translitSizes[size])}>
          {translit}
        </span>
      )}
    </Tag>
  );
}
