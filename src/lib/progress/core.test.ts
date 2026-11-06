import { describe, expect, it } from "vitest";
import type { Progress } from "@/lib/types";
import {
  applyAnswer,
  completeLesson,
  currentStreak,
  defaultProgress,
  dueItems,
  normalizeProgress,
  recordAnswer,
  touchStreak,
  updateSettings,
} from "./core";

const TODAY = "2026-11-06";
const YESTERDAY = "2026-11-05";
const with_ = (patch: Partial<Progress>): Progress => ({ ...defaultProgress(), ...patch });

describe("defaultProgress", () => {
  it("matches the spec", () => {
    expect(defaultProgress()).toEqual({
      xp: 0,
      streak: 0,
      lastActive: null,
      completedLessons: [],
      review: {},
      settings: { translit: "always", audioRate: 1, sfx: true },
    });
  });

  it("returns a fresh object each call", () => {
    const a = defaultProgress();
    a.settings.sfx = false;
    a.completedLessons.push("x");
    expect(defaultProgress().settings.sfx).toBe(true);
    expect(defaultProgress().completedLessons).toEqual([]);
  });
});

describe("touchStreak", () => {
  it("starts at 1 when never active", () => {
    expect(touchStreak(defaultProgress(), TODAY)).toMatchObject({ streak: 1, lastActive: TODAY });
  });

  it("is unchanged on the same day", () => {
    const p = with_({ streak: 4, lastActive: TODAY });
    expect(touchStreak(p, TODAY)).toBe(p);
  });

  it("continues (+1) when last active yesterday", () => {
    expect(touchStreak(with_({ streak: 4, lastActive: YESTERDAY }), TODAY)).toMatchObject({
      streak: 5,
      lastActive: TODAY,
    });
  });

  it("continues across month and year boundaries", () => {
    expect(touchStreak(with_({ streak: 2, lastActive: "2026-12-31" }), "2027-01-01").streak).toBe(3);
    expect(touchStreak(with_({ streak: 2, lastActive: "2028-02-28" }), "2028-02-29").streak).toBe(3);
  });

  it("resets to 1 after a gap", () => {
    expect(touchStreak(with_({ streak: 9, lastActive: "2026-11-04" }), TODAY)).toMatchObject({
      streak: 1,
      lastActive: TODAY,
    });
    expect(touchStreak(with_({ streak: 9, lastActive: "2025-11-06" }), TODAY).streak).toBe(1);
  });

  it("does not mutate its input", () => {
    const p = with_({ streak: 2, lastActive: YESTERDAY });
    touchStreak(p, TODAY);
    expect(p).toMatchObject({ streak: 2, lastActive: YESTERDAY });
  });

  it("leaves a future lastActive (clock moved back) alone", () => {
    const p = with_({ streak: 3, lastActive: "2026-11-08" });
    expect(touchStreak(p, TODAY)).toBe(p);
  });
});

describe("currentStreak", () => {
  it("is 0 when never active", () => {
    expect(currentStreak(defaultProgress(), TODAY)).toBe(0);
  });

  it("shows the streak if active today or yesterday", () => {
    expect(currentStreak(with_({ streak: 6, lastActive: TODAY }), TODAY)).toBe(6);
    expect(currentStreak(with_({ streak: 6, lastActive: YESTERDAY }), TODAY)).toBe(6);
  });

  it("shows 0 once a full day is missed, without mutating", () => {
    const p = with_({ streak: 6, lastActive: "2026-11-04" });
    expect(currentStreak(p, TODAY)).toBe(0);
    expect(p.streak).toBe(6);
  });
});

describe("applyAnswer (Leitner)", () => {
  it("creates a review for a new item: correct → box 1, due tomorrow", () => {
    expect(applyAnswer(undefined, true, TODAY)).toEqual({ strength: 1, due: "2026-11-07", seen: 1, missed: 0 });
  });

  it("creates a review for a new item: wrong → box 0, due today", () => {
    expect(applyAnswer(undefined, false, TODAY)).toEqual({ strength: 0, due: TODAY, seen: 1, missed: 1 });
  });

  it("promotes one box per correct answer with intervals [0,1,2,4,7,14]", () => {
    const expected = [
      [1, "2026-11-07"],
      [2, "2026-11-08"],
      [3, "2026-11-10"],
      [4, "2026-11-13"],
      [5, "2026-11-20"],
    ] as const;
    let r = applyAnswer(undefined, true, TODAY);
    expect([r.strength, r.due]).toEqual(expected[0]);
    for (const [strength, due] of expected.slice(1)) {
      r = applyAnswer(r, true, TODAY);
      expect([r.strength, r.due]).toEqual([strength, due]);
    }
    expect(r.seen).toBe(5);
  });

  it("caps strength at 5", () => {
    const r = applyAnswer({ strength: 5, due: TODAY, seen: 9, missed: 1 }, true, TODAY);
    expect(r).toEqual({ strength: 5, due: "2026-11-20", seen: 10, missed: 1 });
  });

  it("demotes two boxes on a wrong answer and is due today", () => {
    expect(applyAnswer({ strength: 4, due: "2026-11-01", seen: 6, missed: 0 }, false, TODAY)).toEqual({
      strength: 2,
      due: TODAY,
      seen: 7,
      missed: 1,
    });
  });

  it("never demotes below 0", () => {
    expect(applyAnswer({ strength: 1, due: TODAY, seen: 2, missed: 1 }, false, TODAY).strength).toBe(0);
    expect(applyAnswer({ strength: 0, due: TODAY, seen: 2, missed: 2 }, false, TODAY)).toMatchObject({
      strength: 0,
      missed: 3,
    });
  });

  it("does not mutate the previous review", () => {
    const prev = { strength: 2, due: TODAY, seen: 2, missed: 0 };
    applyAnswer(prev, false, TODAY);
    expect(prev).toEqual({ strength: 2, due: TODAY, seen: 2, missed: 0 });
  });
});

describe("recordAnswer", () => {
  it("writes the review under the item id without touching others", () => {
    const p = with_({ review: { other: { strength: 3, due: TODAY, seen: 3, missed: 0 } } });
    const next = recordAnswer(p, "salam", true, TODAY);
    expect(next.review.salam).toEqual({ strength: 1, due: "2026-11-07", seen: 1, missed: 0 });
    expect(next.review.other).toBe(p.review.other);
    expect(p.review.salam).toBeUndefined();
  });

  it("does not affect streak or xp", () => {
    const next = recordAnswer(defaultProgress(), "salam", true, TODAY);
    expect(next).toMatchObject({ xp: 0, streak: 0, lastActive: null });
  });
});

describe("dueItems", () => {
  const r = (strength: number, missed: number, due = TODAY) => ({ strength, due, seen: missed + 1, missed });

  it("includes items due today or earlier, excludes future", () => {
    const p = with_({ review: { past: r(2, 0, "2026-11-01"), today: r(2, 0), future: r(0, 5, "2026-11-07") } });
    expect(dueItems(p, TODAY).sort()).toEqual(["past", "today"]);
  });

  it("sorts by strength asc, then most missed", () => {
    const p = with_({
      review: { a: r(3, 0), b: r(0, 1), c: r(0, 4), d: r(1, 9), e: r(0, 2) },
    });
    expect(dueItems(p, TODAY)).toEqual(["c", "e", "b", "d", "a"]);
  });

  it("is deterministic regardless of insertion order", () => {
    const entries: [string, ReturnType<typeof r>][] = [
      ["x", r(1, 1, "2026-11-03")],
      ["y", r(1, 1, "2026-11-01")],
      ["z", r(1, 1, "2026-11-03")],
      ["w", r(1, 1, "2026-11-03")],
    ];
    const fwd = with_({ review: Object.fromEntries(entries) });
    const rev = with_({ review: Object.fromEntries([...entries].reverse()) });
    // ties → oldest due first, then id
    expect(dueItems(fwd, TODAY)).toEqual(["y", "w", "x", "z"]);
    expect(dueItems(rev, TODAY)).toEqual(dueItems(fwd, TODAY));
  });

  it("defaults to a limit of 10 and respects a custom limit", () => {
    const review = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`w${String(i).padStart(2, "0")}`, r(0, i)]));
    const p = with_({ review });
    expect(dueItems(p, TODAY)).toHaveLength(10);
    expect(dueItems(p, TODAY)[0]).toBe("w14");
    expect(dueItems(p, TODAY, 3)).toEqual(["w14", "w13", "w12"]);
    expect(dueItems(p, TODAY, 0)).toEqual([]);
  });

  it("is empty with no reviews", () => {
    expect(dueItems(defaultProgress(), TODAY)).toEqual([]);
  });

  it("a wrong answer makes an item due immediately", () => {
    const p = recordAnswer(recordAnswer(defaultProgress(), "salam", true, TODAY), "salam", false, TODAY);
    expect(dueItems(p, TODAY)).toEqual(["salam"]);
  });
});

describe("completeLesson", () => {
  it("adds xp, records the lesson, starts the streak and sets lastActive", () => {
    expect(completeLesson(defaultProgress(), "greetings-1", 15, TODAY)).toMatchObject({
      xp: 15,
      completedLessons: ["greetings-1"],
      streak: 1,
      lastActive: TODAY,
    });
  });

  it("does not duplicate a replayed lesson but still awards xp", () => {
    const once = completeLesson(defaultProgress(), "greetings-1", 15, TODAY);
    const twice = completeLesson(once, "greetings-1", 10, TODAY);
    expect(twice.completedLessons).toEqual(["greetings-1"]);
    expect(twice.xp).toBe(25);
    expect(twice.streak).toBe(1);
  });

  it("continues the streak from yesterday and breaks it after a gap", () => {
    expect(completeLesson(with_({ streak: 3, lastActive: YESTERDAY }), "l", 10, TODAY).streak).toBe(4);
    expect(completeLesson(with_({ streak: 3, lastActive: "2026-11-01" }), "l", 10, TODAY).streak).toBe(1);
  });

  it("ignores negative or non-finite xp", () => {
    expect(completeLesson(with_({ xp: 5 }), "l", -10, TODAY).xp).toBe(5);
    expect(completeLesson(with_({ xp: 5 }), "l", Number.NaN, TODAY).xp).toBe(5);
  });

  it("preserves review data and settings", () => {
    const p = with_({ review: { a: { strength: 1, due: TODAY, seen: 1, missed: 0 } }, settings: { translit: "off", audioRate: 0.75, sfx: false } });
    const next = completeLesson(p, "l", 10, TODAY);
    expect(next.review).toBe(p.review);
    expect(next.settings).toBe(p.settings);
  });
});

describe("updateSettings", () => {
  it("merges a partial patch", () => {
    const next = updateSettings(defaultProgress(), { translit: "fade" });
    expect(next.settings).toEqual({ translit: "fade", audioRate: 1, sfx: true });
    expect(updateSettings(next, { audioRate: 0.75, sfx: false }).settings).toEqual({
      translit: "fade",
      audioRate: 0.75,
      sfx: false,
    });
  });

  it("rejects invalid values", () => {
    const bad = { translit: "sometimes", audioRate: 2 } as unknown as Partial<Progress["settings"]>;
    expect(updateSettings(defaultProgress(), bad).settings).toEqual({ translit: "always", audioRate: 1, sfx: true });
  });
});

describe("normalizeProgress (load / migration)", () => {
  it("returns defaults for non-objects", () => {
    for (const raw of [null, undefined, 42, "x", [], true]) {
      expect(normalizeProgress(raw)).toEqual(defaultProgress());
    }
  });

  it("fills missing fields from defaults (partial data)", () => {
    expect(normalizeProgress({ xp: 120 })).toEqual({ ...defaultProgress(), xp: 120 });
    expect(normalizeProgress({ settings: { sfx: false } }).settings).toEqual({
      translit: "always",
      audioRate: 1,
      sfx: false,
    });
  });

  it("replaces invalid field values with defaults", () => {
    const p = normalizeProgress({
      xp: -5,
      streak: "7",
      lastActive: "yesterday",
      completedLessons: ["a", 3, "a", null, "b"],
      review: { ok: { strength: 9, due: "nope", seen: 2.7, missed: -1 }, bad: "x", alsoBad: null },
      settings: { translit: "sometimes", audioRate: 0.5, sfx: "yes" },
    });
    expect(p).toEqual({
      xp: 0,
      streak: 0,
      lastActive: null,
      completedLessons: ["a", "b"],
      review: { ok: { strength: 5, due: "1970-01-01", seen: 2, missed: 0 } },
      settings: { translit: "always", audioRate: 1, sfx: true },
    });
  });

  it("keeps a valid full progress intact", () => {
    const full: Progress = {
      xp: 340,
      streak: 6,
      lastActive: TODAY,
      completedLessons: ["greetings-1"],
      review: { salam: { strength: 2, due: "2026-11-08", seen: 3, missed: 1 } },
      settings: { translit: "fade", audioRate: 0.75, sfx: false },
    };
    expect(normalizeProgress(JSON.parse(JSON.stringify(full)))).toEqual(full);
  });

  it("preserves unknown future fields at every level", () => {
    const p = normalizeProgress({
      xp: 1,
      gems: 50,
      review: { salam: { strength: 1, due: TODAY, seen: 1, missed: 0, lastSeenAt: "t" } },
      settings: { sfx: false, theme: "dark" },
    }) as Progress & Record<string, unknown>;
    expect(p.gems).toBe(50);
    expect(p.review.salam).toMatchObject({ lastSeenAt: "t" });
    expect(p.settings).toMatchObject({ theme: "dark", sfx: false });
  });
});
