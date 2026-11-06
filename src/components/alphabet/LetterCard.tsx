import { Card } from "@/components/ui/Card";
import { FaText } from "@/components/ui/FaText";
import type { MockLetter } from "@/lib/mock";

export interface LetterCardProps {
  letter: MockLetter;
}

/** Letter tile for the alphabet grid. TODO(wiring): make tappable once audio exists. */
export function LetterCard({ letter }: LetterCardProps) {
  return (
    <Card className="flex min-h-36 flex-col items-center justify-center gap-1 text-center">
      <FaText fa={letter.fa} size="2xl" showTranslit={false} />
      <span className="font-extrabold">
        {letter.name} <span className="text-ink-muted">· {letter.translit}</span>
      </span>
      <span className="text-xs text-ink-muted">{letter.sound}</span>
    </Card>
  );
}
