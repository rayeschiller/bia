import { describe, expect, it } from "vitest";
import { getUnits } from "./content";
import { firstIncompleteUnit, unitState } from "./lesson";
import { completeLesson, defaultProgress } from "./progress/core";

describe("unit progression", () => {
  const units = getUnits();

  it("unlocks Family for learners who already completed the original Greetings lessons", () => {
    const completed = new Set(["greetings-1", "greetings-2", "greetings-3"]);
    const current = firstIncompleteUnit(units, completed);

    expect(units[current].id).toBe("family");
    expect(unitState(units[0], completed, false)).toBe("done");
    expect(unitState(units[2], completed, false)).toBe("locked");
  });

  it("keeps the next unit locked until every lesson in the current unit is complete", () => {
    expect(units.map(({ id }) => id)).toEqual([
      "greetings", "family", "food", "numbers", "at-the-table", "feelings", "celebrations",
    ]);

    let progress = defaultProgress();
    for (const [index, unit] of units.entries()) {
      for (const lesson of unit.lessons) {
        const completed = new Set(progress.completedLessons);
        const current = firstIncompleteUnit(units, completed);
        expect(current).toBe(index);
        expect(unitState(unit, completed, true)).toBe("current");
        for (const later of units.slice(index + 1)) {
          expect(unitState(later, completed, false)).toBe("locked");
        }
        progress = completeLesson(progress, lesson.id, 20, "2026-11-09");
      }
    }
    expect(firstIncompleteUnit(units, new Set(progress.completedLessons))).toBe(-1);
  });
});
