import { describe, expect, it } from "vitest";
import { addDays, daysBetween, isISODate, toLocalDate, todayLocal } from "./dates";

describe("local date helpers (TZ=America/Los_Angeles)", () => {
  it("runs in the pinned timezone", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("America/Los_Angeles");
  });

  it("uses the local calendar day, not UTC, just before midnight", () => {
    // 23:30 PST on Nov 6 is already 07:30 UTC on Nov 7.
    const d = new Date(2026, 10, 6, 23, 30);
    expect(d.toISOString().slice(0, 10)).toBe("2026-11-07");
    expect(toLocalDate(d)).toBe("2026-11-06");
  });

  it("rolls over exactly at local midnight", () => {
    expect(todayLocal(new Date(2026, 10, 6, 23, 59, 59, 999))).toBe("2026-11-06");
    expect(todayLocal(new Date(2026, 10, 7, 0, 0, 0, 0))).toBe("2026-11-07");
  });

  it("uses the local day just after midnight (UTC still on the previous day elsewhere)", () => {
    const d = new Date(2026, 0, 1, 0, 5);
    expect(toLocalDate(d)).toBe("2026-01-01");
  });

  it("validates real calendar dates only", () => {
    expect(isISODate("2026-11-06")).toBe(true);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("2026-02-29")).toBe(false);
    expect(isISODate("2026-13-01")).toBe(false);
    expect(isISODate("2026-1-1")).toBe(false);
    expect(isISODate("2026-11-06T00:00:00Z")).toBe(false);
    expect(isISODate(null)).toBe(false);
    expect(isISODate(20261106)).toBe(false);
  });

  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-11-06", 1)).toBe("2026-11-07");
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-11-06", 14)).toBe("2026-11-20");
  });

  it("is unaffected by DST transitions", () => {
    // US DST ends 2026-11-01 and starts 2026-03-08 (23h and 25h days locally).
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
    expect(toLocalDate(new Date(2026, 10, 1, 23, 30))).toBe("2026-11-01");
  });

  it("counts days in both directions", () => {
    expect(daysBetween("2026-11-06", "2026-11-06")).toBe(0);
    expect(daysBetween("2026-11-05", "2026-11-06")).toBe(1);
    expect(daysBetween("2026-11-06", "2026-11-05")).toBe(-1);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });
});
