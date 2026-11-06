import { describe, expect, it } from "vitest";
import { requireItem } from "./content";
import { buildReviewExercises, pickDistractors } from "./review";

describe("buildReviewExercises", () => {
  it("is empty when nothing is due", () => {
    expect(buildReviewExercises([])).toEqual([]);
  });

  it("builds ~10 exercises mixing typing and multiple choice", () => {
    const ids = ["salam", "mersi", "chetori", "khubam", "felan", "na", "bale", "sobh-bekheyr", "to-chi", "lotfan", "are"];
    const ex = buildReviewExercises(ids);
    expect(ex).toHaveLength(10);
    expect(new Set(ex.map((e) => e.type))).toEqual(new Set(["type_translit", "multiple_choice"]));
    expect(new Set(ex.map((e) => e.id)).size).toBe(10);
  });

  it("tests each of a few due items both ways", () => {
    const ex = buildReviewExercises(["salam", "mersi"]);
    expect(ex).toHaveLength(4);
    for (const id of ["salam", "mersi"]) {
      expect(ex.filter((e) => e.itemId === id).map((e) => e.type).sort()).toEqual(["multiple_choice", "type_translit"]);
    }
  });

  it("tests a single due item both ways", () => {
    expect(buildReviewExercises(["salam"]).map((e) => e.type)).toEqual(["type_translit", "multiple_choice"]);
  });

  it("ignores unknown ids", () => {
    expect(buildReviewExercises(["nope"])).toEqual([]);
  });
});

describe("pickDistractors", () => {
  it("never picks an item sharing a meaning", () => {
    // mersi ("thanks") and mamnun ("thank you", alt "thanks") overlap
    const d = pickDistractors(requireItem("mersi"), 3, "x");
    expect(d).toHaveLength(3);
    expect(d).not.toContain("mamnun");
    expect(d).not.toContain("mersi");
  });
});
