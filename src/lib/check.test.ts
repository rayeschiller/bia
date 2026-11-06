import { describe, expect, it } from "vitest";
import { checkEnglish, checkTiles, checkTranslit, levenshtein, normalizeTranslit } from "./check";
import { getItem, getLesson, getUnits, isPhrase } from "./content";
import type { Phrase, Word } from "./types";

const item = (id: string) => {
  const x = getItem(id);
  if (!x) throw new Error(`missing ${id}`);
  return x;
};

describe("normalizeTranslit", () => {
  it("lowercases, trims and collapses spaces", () => {
    expect(normalizeTranslit("  Salam   Khubi  ")).toBe("salam khubi");
  });
  it("strips punctuation, including Persian ، and ؟", () => {
    expect(normalizeTranslit("salâm, khubi?!.")).toBe("salam khubi");
    expect(normalizeTranslit("chetori؟")).toBe("chetori");
    expect(normalizeTranslit("mersi، khubam")).toBe("mersi khubam");
  });
  it("folds vowel spellings: â, aa, oo, ee", () => {
    expect(normalizeTranslit("salâm")).toBe("salam");
    expect(normalizeTranslit("Salaam")).toBe("salam");
    expect(normalizeTranslit("khoob")).toBe("khub");
    expect(normalizeTranslit("cheetori")).toBe("chitori");
  });
  it("maps q to gh, drops apostrophes, treats hyphens as spaces", () => {
    expect(normalizeTranslit("qorbunet")).toBe("ghorbunet");
    expect(normalizeTranslit("fe'lan")).toBe("felan");
    expect(normalizeTranslit("hâl-e shomâ")).toBe("hal e shoma");
  });
});

describe("levenshtein", () => {
  it("counts edits", () => {
    expect(levenshtein("khubam", "khubam")).toBe(0);
    expect(levenshtein("khubam", "khuam")).toBe(1);
    expect(levenshtein("khubam", "khobam")).toBe(1);
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});

describe("checkTranslit", () => {
  it("accepts salam / salâm / Salaam", () => {
    for (const s of ["salam", "salâm", "Salaam", " SALAM! "]) {
      expect(checkTranslit(s, item("salam"))).toEqual({ correct: true });
    }
  });
  it("accepts khodahafez with or without the word break", () => {
    for (const s of ["khodahafez", "khodâhâfez", "khoda hafez", "Khodaa haafez", "khoda-hafez"]) {
      expect(checkTranslit(s, item("khoda-hafez"))).toEqual({ correct: true });
    }
  });
  it("treats the glottal stop as optional: fe'lan / felan", () => {
    expect(checkTranslit("fe'lan", item("felan"))).toEqual({ correct: true });
    expect(checkTranslit("felan", item("felan"))).toEqual({ correct: true });
  });
  it("accepts q for gh: ghorbunet beram / qorbunet beram", () => {
    expect(checkTranslit("ghorbunet beram", item("ghorbunet-beram"))).toEqual({ correct: true });
    expect(checkTranslit("qorbunet beram", item("ghorbunet-beram"))).toEqual({ correct: true });
    expect(checkTranslit("ghorboonet beram", item("ghorbunet-beram"))).toEqual({ correct: true });
  });
  it("accepts the formal translit when present", () => {
    expect(checkTranslit("motashakkeram", item("mersi"))).toEqual({ correct: true });
    expect(checkTranslit("hâl-e shomâ chetor ast", item("hal-e-shoma-chetore"))).toEqual({ correct: true });
  });
  it("forgives one typo on answers of 6+ chars, flagged", () => {
    expect(checkTranslit("khobam", item("khubam"))).toEqual({ correct: true, typo: true });
    expect(checkTranslit("khoshbakhtm", item("khoshbakhtam"))).toEqual({ correct: true, typo: true });
    expect(checkTranslit("chetory", item("chetori"))).toEqual({ correct: true, typo: true });
  });
  it("does not forgive typos on short answers or two slips", () => {
    expect(checkTranslit("salom", item("salam"))).toEqual({ correct: false });
    expect(checkTranslit("mersy", item("mersi"))).toEqual({ correct: false });
    expect(checkTranslit("khobum", item("khubam"))).toEqual({ correct: false });
  });
  it("rejects wrong and empty answers", () => {
    expect(checkTranslit("mersi", item("salam"))).toEqual({ correct: false });
    expect(checkTranslit("   ", item("salam"))).toEqual({ correct: false });
  });
});

describe("checkEnglish", () => {
  it("accepts en and alt_en, case- and punctuation-insensitive", () => {
    expect(checkEnglish("Hello", item("salam")).correct).toBe(true);
    expect(checkEnglish("hi!", item("salam")).correct).toBe(true);
    expect(checkEnglish("How are you", item("chetori")).correct).toBe(true);
    expect(checkEnglish("how's it going", item("chetori")).correct).toBe(true);
  });
  it("ignores a leading the/a and trailing punctuation", () => {
    const w = { en: "morning", alt_en: [] } satisfies Pick<Word, "en" | "alt_en">;
    expect(checkEnglish("the morning.", w).correct).toBe(true);
    expect(checkEnglish("A morning", w).correct).toBe(true);
  });
  it("ignores parenthetical notes in the key", () => {
    expect(checkEnglish("you", item("shoma")).correct).toBe(true);
    expect(checkEnglish("how are you", item("hal-e-shoma-chetore")).correct).toBe(true);
  });
  it("rejects wrong answers", () => {
    expect(checkEnglish("goodbye", item("salam")).correct).toBe(false);
    expect(checkEnglish("", item("salam")).correct).toBe(false);
  });
});

describe("checkTiles", () => {
  const p = item("hal-e-shoma-chetore") as Phrase;
  it("requires the exact order", () => {
    expect(checkTiles(["hal", "shoma", "chetore"], p).correct).toBe(true);
    expect(checkTiles(["shoma", "hal", "chetore"], p).correct).toBe(false);
  });
  it("rejects missing or extra tiles", () => {
    expect(checkTiles(["hal", "shoma"], p).correct).toBe(false);
    expect(checkTiles(["hal", "shoma", "chetore", "chi"], p).correct).toBe(false);
    expect(checkTiles([], p).correct).toBe(false);
  });
});

describe("content loader", () => {
  it("exposes the greetings unit and its lessons", () => {
    expect(getUnits().map((u) => u.id)).toContain("greetings");
    expect(getLesson("greetings-1")?.exercises.length).toBeGreaterThanOrEqual(10);
    expect(getLesson("nope")).toBeUndefined();
  });
  it("can answer every typed and built item in the content", () => {
    for (const u of getUnits())
      for (const l of u.lessons)
        for (const e of l.exercises) {
          if (!e.itemId) continue;
          const it = item(e.itemId);
          expect(checkTranslit(it.translit, it).correct).toBe(true);
          expect(checkEnglish(it.en, it).correct).toBe(true);
          if (e.type === "build_sentence" && isPhrase(it)) expect(checkTiles(it.wordIds, it).correct).toBe(true);
        }
  });
});
