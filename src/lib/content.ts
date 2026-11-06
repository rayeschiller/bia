import type { ContentBundle, Lesson, Phrase, Unit, Word } from "./types";
import greetings from "@/content/greetings.json";

/**
 * All content bundles, in path order. To add a unit, import its JSON and
 * append it here: that is the only change needed.
 */
const BUNDLES: ContentBundle[] = [greetings as ContentBundle];

export type Item = Word | Phrase;

const units: Unit[] = BUNDLES.flatMap((b) => b.units);
const items = new Map<string, Item>();
for (const b of BUNDLES) for (const x of [...b.words, ...b.phrases]) items.set(x.id, x);
const lessons = new Map<string, Lesson>();
const unitOfLesson = new Map<string, Unit>();
for (const u of units) {
  for (const l of u.lessons) {
    lessons.set(l.id, l);
    unitOfLesson.set(l.id, u);
  }
}

export function getUnits(): Unit[] {
  return units;
}

export function getLesson(id: string): Lesson | undefined {
  return lessons.get(id);
}

/** A Word or Phrase by id. */
export function getItem(id: string): Item | undefined {
  return items.get(id);
}

/** Like getItem, but throws on a missing id (content is validated by `npm run validate:content`). */
export function requireItem(id: string): Item {
  const item = items.get(id);
  if (!item) throw new Error(`Unknown content item "${id}"`);
  return item;
}

export function getUnitForLesson(id: string): Unit | undefined {
  return unitOfLesson.get(id);
}

/** Every Word and Phrase across all bundles. */
export function getAllItems(): Item[] {
  return [...items.values()];
}

export function isPhrase(item: Item): item is Phrase {
  return "wordIds" in item;
}
