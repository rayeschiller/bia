import type { Metadata } from "next";
import { LetterCard } from "@/components/alphabet/LetterCard";
import { MOCK_LETTERS } from "@/lib/mock";

export const metadata: Metadata = { title: "Alphabet · Bia" };

export default function AlphabetPage() {
  // TODO(wiring): replace MOCK_LETTERS with the full 32-letter alphabet data.
  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-black">Alphabet</h1>
      <p className="mt-1 text-ink-muted">The letters of Persian script. Audio coming soon.</p>
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {MOCK_LETTERS.map((l) => (
          <li key={l.name}>
            <LetterCard letter={l} />
          </li>
        ))}
      </ul>
    </main>
  );
}
