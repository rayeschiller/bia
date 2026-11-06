import Link from "next/link";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface LessonShellProps {
  /** 0..1 progress through the lesson. */
  progress: number;
  /** Where the close (X) button goes. */
  exitHref?: string;
  /** Exercise area. */
  children: ReactNode;
  /** Sticky bottom action area (Check button). */
  footer: ReactNode;
  /** Overlay slot, e.g. <FeedbackSheet/>. */
  overlay?: ReactNode;
}

/** Full-screen lesson layout: header (X + progress), exercise slot, sticky footer. */
export function LessonShell({ progress, exitHref = "/", children, footer, overlay }: LessonShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="flex items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          href={exitHref}
          aria-label="Quit lesson"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-ink-muted hover:bg-surface-2"
        >
          <CloseIcon />
        </Link>
        <ProgressBar value={progress} label="Lesson progress" className="mr-2" />
      </header>

      <main className="flex flex-1 flex-col px-4 pt-4 pb-6">{children}</main>

      <footer className="sticky bottom-0 border-t-2 border-border bg-bg px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {footer}
      </footer>
      {overlay}
    </div>
  );
}
