import type { Phrase, Word } from "./types";

type Item = Word | Phrase;

export interface CheckResult {
  correct: boolean;
  /** Accepted, but with a one-character slip: the UI should say "Watch the spelling". */
  typo?: boolean;
}

/** Normalise Finglish so spelling variants compare equal (see TRANSLIT RULES in types.ts). */
export function normalizeTranslit(s: string): string {
  return s
    .toLowerCase()
    .replace(/â/g, "a")
    .replace(/['’ʼ`]/g, "")
    .replace(/-/g, " ")
    .replace(/[?!.,،؟]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/aa/g, "a")
    .replace(/oo/g, "u")
    .replace(/ee/g, "i")
    .replace(/q/g, "gh");
}

/** Classic Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

const squash = (s: string) => s.replace(/ /g, "");

/**
 * True if the typed Finglish matches the item's translit (or its formal form).
 * Word breaks are not graded ("khoda hafez" == "khodâhâfez"). One-character
 * slips are forgiven for answers of 6+ characters, flagged as `typo`.
 */
export function checkTranslit(input: string, item: Pick<Item, "translit" | "formal">): CheckResult {
  const got = squash(normalizeTranslit(input));
  if (!got) return { correct: false };
  const wanted = [item.translit, item.formal?.translit]
    .filter((t): t is string => Boolean(t))
    .map((t) => squash(normalizeTranslit(t)));
  if (wanted.includes(got)) return { correct: true };
  const close = wanted.some((w) => w.length >= 6 && levenshtein(w, got) <= 1);
  return close ? { correct: true, typo: true } : { correct: false };
}

/** Normalise English answers: case, punctuation, apostrophes, parentheticals, leading article. */
export function normalizeEnglish(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/['’]/g, "")
    .replace(/[?!.,;:"]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|a|an) /, "");
}

/** True if typed English matches `en` or any `alt_en`. */
export function checkEnglish(input: string, item: Pick<Item, "en" | "alt_en">): CheckResult {
  const got = normalizeEnglish(input);
  if (!got) return { correct: false };
  return { correct: [item.en, ...(item.alt_en ?? [])].some((a) => normalizeEnglish(a) === got) };
}

/** Sentence building: the selected tile ids must match the phrase's words exactly, in order. */
export function checkTiles(selectedWordIds: readonly string[], phrase: Pick<Phrase, "wordIds">): CheckResult {
  const want = phrase.wordIds;
  return {
    correct: selectedWordIds.length === want.length && want.every((id, i) => selectedWordIds[i] === id),
  };
}
