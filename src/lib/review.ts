import { getAllItems, getItem, isPhrase, type Item } from "./content";
import { seededShuffle } from "./shuffle";
import type { Exercise } from "./types";

const meanings = (it: Item) => new Set([it.en, ...(it.alt_en ?? [])].map((s) => s.toLowerCase()));

/** Up to `n` distractors for `target`: same kind (word/phrase) first, never sharing a meaning. */
export function pickDistractors(target: Item, n: number, seed: string): string[] {
  const own = meanings(target);
  const ok = getAllItems().filter((it) => it.id !== target.id && ![...meanings(it)].some((m) => own.has(m)));
  const sameKind = ok.filter((it) => isPhrase(it) === isPhrase(target));
  const rest = ok.filter((it) => isPhrase(it) !== isPhrase(target));
  return [...seededShuffle(sameKind, seed), ...seededShuffle(rest, seed)].slice(0, n).map((it) => it.id);
}

/**
 * A review session from due item ids: alternates typing the Finglish and
 * picking the meaning, ~`size` exercises. Items are cycled if fewer are due.
 */
export function buildReviewExercises(dueIds: string[], size = 10, seed = "review"): Exercise[] {
  const items = dueIds.map(getItem).filter((x): x is Item => Boolean(x));
  if (items.length === 0) return [];
  const count = Math.min(size, Math.max(items.length, Math.min(size, items.length * 2)));
  return Array.from({ length: count }, (_, i) => {
    const k = i % items.length;
    const it = items[k];
    // Flip the type each time an item comes round again, so repeats test the other direction.
    const typed = (k + Math.floor(i / items.length)) % 2 === 0;
    const id = `review-${i + 1}-${it.id}`;
    return typed
      ? { id, type: "type_translit", direction: "en_to_fa", itemId: it.id }
      : { id, type: "multiple_choice", direction: "fa_to_en", itemId: it.id, distractorIds: pickDistractors(it, 3, `${seed}:${id}`) };
  });
}
