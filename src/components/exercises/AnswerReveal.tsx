import { FaText } from "@/components/ui/FaText";
import type { Item } from "@/lib/content";

/** Correct-answer slot for the FeedbackSheet: Persian, Finglish and English. */
export function AnswerReveal({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((it) => (
        <li key={it.id} className="flex flex-wrap items-center gap-x-3">
          <FaText fa={it.fa} translit={it.translit} size="sm" className="!items-start" />
          <span className="text-sm font-semibold">= {it.en}</span>
        </li>
      ))}
    </ul>
  );
}
