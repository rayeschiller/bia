import Link from "next/link";

export interface ReviewButtonProps {
  /** Number of review items due today. */
  dueCount: number;
}

const base =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 px-5 py-3 font-extrabold tracking-wide uppercase";

/** Home "Review" CTA: count badge when items are due, disabled when none. */
export function ReviewButton({ dueCount }: ReviewButtonProps) {
  if (dueCount <= 0) {
    return (
      <button type="button" disabled className={`${base} cursor-not-allowed border-transparent bg-disabled text-on-disabled`}>
        <span aria-hidden>🔁</span> Nothing to review
      </button>
    );
  }
  return (
    <Link
      href="/lesson/review"
      aria-label={`Review, ${dueCount} ${dueCount === 1 ? "item" : "items"} due`}
      className={`${base} border-b-[5px] border-border bg-surface text-primary active:translate-y-[3px] active:border-b-2`}
    >
      <span aria-hidden>🔁</span> Review
      <span
        aria-hidden
        data-testid="review-badge"
        className="ml-1 inline-flex min-w-7 items-center justify-center rounded-full bg-accent px-2 py-0.5 text-sm text-ink tabular-nums dark:text-bg"
      >
        {dueCount}
      </span>
    </Link>
  );
}
