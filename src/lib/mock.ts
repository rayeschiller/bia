/**
 * TODO(wiring): mock data for screen shells only. Replace with the real
 * ContentBundle (content team).
 */
import type { Unit } from "./types";

const lesson = (id: string, title: string) => ({
  id,
  title,
  newItemIds: [],
  exercises: [],
});

export const MOCK_UNITS: Unit[] = [
  {
    id: "greetings",
    title: "Greetings",
    emoji: "👋",
    lessons: [lesson("greetings-1", "Hello & goodbye"), lesson("greetings-2", "How are you?")],
  },
  {
    id: "introductions",
    title: "Introductions",
    emoji: "🙋",
    lessons: [lesson("intro-1", "My name is…"), lesson("intro-2", "Where are you from?")],
  },
  {
    id: "tea",
    title: "Tea time",
    emoji: "🫖",
    lessons: [lesson("tea-1", "Would you like tea?"), lesson("tea-2", "Taarof")],
  },
  {
    id: "family",
    title: "Family",
    emoji: "👨‍👩‍👧",
    lessons: [lesson("family-1", "Mom & dad")],
  },
  {
    id: "food",
    title: "Food",
    emoji: "🍚",
    lessons: [lesson("food-1", "Tahdig!")],
  },
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
