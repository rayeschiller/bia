import { describe, expect, it } from "vitest";
import { getLesson } from "./content";
import {
  accuracyPct,
  isFinished,
  lessonReducer,
  lessonXp,
  newItemExerciseIds,
  runProgress,
  startRun,
} from "./lesson";
import type { Exercise } from "./types";

const ex = (id: string): Exercise => ({ id, type: "multiple_choice", itemId: id });

describe("lessonReducer", () => {
  it("advances on correct answers and finishes", () => {
    let r = startRun([ex("a"), ex("b")]);
    r = lessonReducer(r, { type: "answer", correct: true });
    expect(runProgress(r)).toBe(0.5);
    r = lessonReducer(r, { type: "next" });
    r = lessonReducer(r, { type: "answer", correct: true });
    r = lessonReducer(r, { type: "next" });
    expect(isFinished(r)).toBe(true);
    expect(accuracyPct(r)).toBe(100);
  });

  it("re-queues a wrong answer at the end until it is right", () => {
    let r = startRun([ex("a"), ex("b")]);
    r = lessonReducer(r, { type: "answer", correct: false });
    expect(r.queue.map((e) => e.id)).toEqual(["a", "b", "a"]);
    r = lessonReducer(lessonReducer(r, { type: "next" }), { type: "answer", correct: true });
    r = lessonReducer(r, { type: "next" });
    expect(isFinished(r)).toBe(false);
    r = lessonReducer(r, { type: "answer", correct: false }); // wrong again
    expect(r.queue.map((e) => e.id)).toEqual(["a", "b", "a", "a"]);
    r = lessonReducer(lessonReducer(r, { type: "next" }), { type: "answer", correct: true });
    r = lessonReducer(r, { type: "next" });
    expect(isFinished(r)).toBe(true);
    expect(runProgress(r)).toBe(1);
    expect(r.firstTry).toEqual({ a: false, b: true });
    expect(accuracyPct(r)).toBe(50);
  });
});

describe("lessonXp", () => {
  it("is 10 + first-try correct, capped at 20", () => {
    expect(lessonXp(0)).toBe(10);
    expect(lessonXp(7)).toBe(17);
    expect(lessonXp(12)).toBe(20);
  });
});

describe("newItemExerciseIds", () => {
  it("marks the first exercise testing each new item", () => {
    const ids = newItemExerciseIds(getLesson("greetings-1")!);
    expect(ids.has("greetings-1-ex-01")).toBe(true); // salam, first time
    expect(ids.has("greetings-1-ex-04")).toBe(false); // salam again
    expect(ids.has("greetings-1-ex-10")).toBe(true); // ghorbunet-beram
    expect(ids.has("greetings-1-ex-11")).toBe(false);
  });
});
