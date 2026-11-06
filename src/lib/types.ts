// Bia — shared content + progress contract. Every agent must match these exactly.
// Lives at src/lib/types.ts in the app.

export type Register = "colloquial" | "formal" | "both";

export interface Word {
  id: string;              // kebab-case English gloss, unique, e.g. "salam", "khoda-hafez"
  fa: string;              // Persian script, e.g. "سلام"
  translit: string;        // canonical Finglish, see TRANSLIT RULES, e.g. "salâm"
  en: string;              // primary English meaning, e.g. "hello"
  alt_en?: string[];       // other accepted English answers
  register: Register;      // default colloquial Tehrani
  formal?: { fa: string; translit: string }; // only when formal form differs
  note?: string;           // short learner-facing note (usage, nuance)
  needsNativeCheck?: boolean;
}

export interface Phrase {
  id: string;
  fa: string;
  translit: string;
  en: string;
  alt_en?: string[];
  wordIds: string[];       // words in order, used to build sentence tiles
  register: Register;
  formal?: { fa: string; translit: string };
  note?: string;
  needsNativeCheck?: boolean;
}

export type ExerciseType =
  | "multiple_choice"      // see fa (+translit), pick English; or see English, pick fa
  | "build_sentence"       // tap word tiles in order to build a phrase
  | "match_pairs"          // match 4-5 fa<->en pairs
  | "listen_choose"        // hear audio, pick the fa/translit
  | "type_translit";       // see English (or hear), type Finglish

export interface Exercise {
  id: string;
  type: ExerciseType;
  direction?: "fa_to_en" | "en_to_fa";
  itemId?: string;         // Word or Phrase id this exercise tests
  pairIds?: string[];      // match_pairs only: Word ids
  distractorIds?: string[];// multiple_choice / listen_choose / build_sentence extra tiles
}

export interface Lesson {
  id: string;              // e.g. "greetings-1"
  title: string;           // e.g. "Hello & goodbye"
  newItemIds: string[];    // words/phrases introduced
  exercises: Exercise[];   // 10-12, mixing types, intro items before testing them
}

export interface Unit {
  id: string;              // e.g. "greetings"
  title: string;           // "Greetings"
  emoji: string;           // path icon
  lessons: Lesson[];
}

export interface ContentBundle {
  words: Word[];
  phrases: Phrase[];
  units: Unit[];
}

// Progress (localStorage key "bia:progress:v1")
export interface ItemReview {
  strength: number;        // 0-5 Leitner box
  due: string;             // ISO date
  seen: number;
  missed: number;
}
export interface Progress {
  xp: number;
  streak: number;
  lastActive: string | null;      // ISO date (local)
  completedLessons: string[];
  review: Record<string, ItemReview>; // keyed by Word/Phrase id
  settings: {
    translit: "always" | "fade" | "off";
    audioRate: 1 | 0.75;
    sfx: boolean;
  };
}

/* TRANSLIT RULES (canonical display; checker accepts variants)
 * آ / long a  -> â        (also accept "aa", "a")
 * short a (َ) -> a
 * e (ِ, final ه as vowel) -> e
 * o (ُ) -> o
 * و long u -> u           (accept "oo")
 * ی long i -> i           (accept "ee")
 * خ -> kh ; ش -> sh ; ژ -> zh ; چ -> ch
 * ق and غ -> gh           (accept "q")
 * ع / ء glottal stop -> '  (optional in answers)
 * ezafe -> "-e" / "-ye" joined with hyphen, e.g. "esm-e man"
 * lowercase, words separated by single spaces
 */
