import { FaText } from "@/components/ui/FaText";
import { SpeakerButton } from "@/components/ui/SpeakerButton";
import { Tile, type TileState } from "@/components/ui/Tile";

export interface PlaceholderTile {
  id: string;
  fa: string;
  translit: string;
}

export interface PlaceholderExerciseProps {
  bank: PlaceholderTile[];
  answer: string[];
  onToggle: (id: string) => void;
  locked: boolean;
}

/**
 * TODO(wiring): visual stand-in for a "build_sentence" exercise so the shell
 * has something real-looking to lay out. The lesson engine replaces this.
 */
export function PlaceholderExercise({ bank, answer, onToggle, locked }: PlaceholderExerciseProps) {
  const byId = new Map(bank.map((t) => [t.id, t]));
  const bankState = (id: string): TileState => (answer.includes(id) ? "disabled" : "idle");

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-black">Write this in Persian</h1>

      <div className="flex items-center gap-3">
        <SpeakerButton />
        <p className="rounded-card border-2 border-border bg-surface px-4 py-3 text-lg font-bold">
          Hello, how are you?
        </p>
      </div>

      {/* Answer row: Persian reads right-to-left, so this row is its own RTL island. */}
      <div
        dir="rtl"
        lang="fa"
        aria-label="Your answer"
        className="flex min-h-[7.5rem] flex-wrap content-start gap-2 border-y-2 border-border py-3"
      >
        {answer.map((id) => {
          const t = byId.get(id)!;
          return (
            <Tile
              key={id}
              fa={t.fa}
              translit={t.translit}
              state={locked ? "selected" : "idle"}
              onClick={locked ? undefined : () => onToggle(id)}
            />
          );
        })}
      </div>

      {/* Word bank: also RTL so tiles appear in reading order. */}
      <div dir="rtl" lang="fa" className="flex flex-wrap justify-center gap-2" aria-label="Word bank">
        {bank.map((t) => (
          <Tile
            key={t.id}
            fa={t.fa}
            translit={t.translit}
            state={bankState(t.id)}
            onClick={locked ? undefined : () => onToggle(t.id)}
          />
        ))}
      </div>

      <p className="mt-auto text-center text-sm text-ink-muted">
        Preview: <FaText fa="سلام، خوبی؟" translit="salâm, khubi?" size="sm" />
      </p>
    </div>
  );
}
