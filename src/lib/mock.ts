/**
 * TODO(wiring): placeholder data for screens whose real data isn't built yet
 * (future units on the path, the alphabet).
 */
import type { UpcomingUnit } from "@/components/home/SkillPath";

/**
 * Units on the path that have no content yet. Drawn as locked placeholders
 * after the real units. TODO(wiring): remove each one as its content lands.
 */
export const UPCOMING_UNITS: UpcomingUnit[] = [
  { id: "family", title: "Family", emoji: "👨‍👩‍👧" },
  { id: "food", title: "Food", emoji: "🍚" },
  { id: "numbers", title: "Numbers", emoji: "🔢" },
  { id: "at-the-table", title: "At the Table", emoji: "🫖" },
  { id: "feelings", title: "Feelings", emoji: "💛" },
  { id: "celebrations", title: "Celebrations", emoji: "🎉" },
];

export interface MockLetter {
  fa: string;
  name: string;
  translit: string;
  sound: string;
}

export const MOCK_LETTERS: MockLetter[] = [
  { fa: "ا", name: "alef", translit: "â / a", sound: "as in “father”" },
  { fa: "ب", name: "be", translit: "b", sound: "as in “bia”" },
  { fa: "پ", name: "pe", translit: "p", sound: "as in “pen”" },
  { fa: "خ", name: "khe", translit: "kh", sound: "like Scottish “loch”" },
];
