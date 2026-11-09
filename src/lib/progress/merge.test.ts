import { describe, expect, it } from "vitest";
import type { Progress } from "@/lib/types";
import { defaultProgress } from "./core";
import { mergeProgress, sameProgress } from "./merge";

const p = (over: Partial<Progress> = {}): Progress => ({ ...defaultProgress(), ...over });
const r = (seen: number, due: string, strength = 1, missed = 0) => ({ seen, due, strength, missed });

const phone = p({
  xp: 120,
  streak: 4,
  lastActive: "2026-11-07",
  completedLessons: ["greetings-1", "greetings-2"],
  review: { salam: r(5, "2026-11-10", 3), merci: r(2, "2026-11-08") },
  settings: { translit: "fade", audioRate: 1, sfx: true },
});
const laptop = p({
  xp: 90,
  streak: 9,
  lastActive: "2026-11-05",
  completedLessons: ["greetings-1", "family-1"],
  review: { salam: r(3, "2026-11-20", 4), baleh: r(1, "2026-11-09") },
  settings: { translit: "off", audioRate: 0.75, sfx: false },
});

describe("mergeProgress", () => {
  it("takes max xp and the union of completed lessons", () => {
    const m = mergeProgress(phone, laptop);
    expect(m.xp).toBe(120);
    expect(m.completedLessons).toEqual(["family-1", "greetings-1", "greetings-2"]);
  });

  it("takes streak and lastActive from the side with the later lastActive", () => {
    expect(mergeProgress(phone, laptop)).toMatchObject({ streak: 4, lastActive: "2026-11-07" });
    expect(mergeProgress(laptop, phone)).toMatchObject({ streak: 4, lastActive: "2026-11-07" });
  });

  it("breaks a lastActive tie with the higher streak; null lastActive loses", () => {
    const a = p({ streak: 2, lastActive: "2026-11-07" });
    const b = p({ streak: 6, lastActive: "2026-11-07" });
    expect(mergeProgress(a, b).streak).toBe(6);
    expect(mergeProgress(b, a).streak).toBe(6);
    const never = p({ streak: 0, lastActive: null });
    expect(mergeProgress(never, a)).toMatchObject({ streak: 2, lastActive: "2026-11-07" });
  });

  it("unions review items and keeps the entry with more `seen`", () => {
    const m = mergeProgress(phone, laptop);
    expect(Object.keys(m.review).sort()).toEqual(["baleh", "merci", "salam"]);
    expect(m.review.salam).toEqual(r(5, "2026-11-10", 3));
  });

  it("breaks a `seen` tie on review entries with the later due date", () => {
    const a = p({ review: { x: r(4, "2026-11-09", 2) } });
    const b = p({ review: { x: r(4, "2026-11-12", 3) } });
    expect(mergeProgress(a, b).review.x.due).toBe("2026-11-12");
    expect(mergeProgress(b, a).review.x.due).toBe("2026-11-12");
  });

  it("uses remote settings when there is a remote copy, else local", () => {
    expect(mergeProgress(phone, laptop).settings).toEqual(laptop.settings);
    expect(mergeProgress(laptop, phone).settings).toEqual(phone.settings);
    expect(mergeProgress(phone, null).settings).toEqual(phone.settings);
  });

  it("returns (normalized) local unchanged when there is no remote copy", () => {
    expect(mergeProgress(phone, null)).toEqual(phone);
    expect(mergeProgress(phone, undefined)).toEqual(phone);
  });

  it("is idempotent", () => {
    const once = mergeProgress(phone, laptop);
    expect(mergeProgress(once, laptop)).toEqual(once);
    expect(mergeProgress(once, once)).toEqual(once);
    expect(mergeProgress(phone, phone)).toEqual(phone);
  });

  it("is commutative apart from settings", () => {
    const ab = mergeProgress(phone, laptop);
    const ba = mergeProgress(laptop, phone);
    expect({ ...ab, settings: null }).toEqual({ ...ba, settings: null });
    expect(sameProgress({ ...ab, settings: ba.settings }, ba)).toBe(true);
  });

  it("is associative for the merged fields", () => {
    const third = p({ xp: 200, completedLessons: ["food-1"], review: { merci: r(9, "2026-12-01") } });
    const left = mergeProgress(mergeProgress(phone, laptop), third);
    const right = mergeProgress(phone, mergeProgress(laptop, third));
    expect(left).toEqual(right);
  });

  it("sanitizes junk on either side instead of throwing", () => {
    const junk = { xp: -5, streak: "x", review: { a: "nope" }, completedLessons: [1, "b"] } as unknown as Progress;
    const m = mergeProgress(junk, phone);
    expect(m.xp).toBe(120);
    expect(m.completedLessons).toEqual(["b", "greetings-1", "greetings-2"]);
    expect(m.review.a).toBeUndefined();
  });

  it("does not let a fresh device wipe cloud progress", () => {
    expect(mergeProgress(defaultProgress(), phone)).toMatchObject({
      xp: 120,
      streak: 4,
      completedLessons: ["greetings-1", "greetings-2"],
    });
  });
});

describe("sameProgress", () => {
  it("ignores key order", () => {
    const a = p({ xp: 3 });
    const b = { settings: a.settings, review: {}, completedLessons: [], lastActive: null, streak: 0, xp: 3 };
    expect(sameProgress(a, b)).toBe(true);
    expect(sameProgress(a, p({ xp: 4 }))).toBe(false);
  });
});
