import { describe, expect, it } from "vitest";

import { todayInVietnam } from "@/utils/todayInVietnam";

// Vietnam is UTC+7 all year, so midnight in Vietnam is 17:00 UTC.
describe("todayInVietnam", () => {
  it("is the same date before midnight in Vietnam", () => {
    expect(todayInVietnam(new Date("2026-10-30T16:59:59Z"))).toBe("2026-10-30");
  });

  it("moves to the next date at midnight in Vietnam", () => {
    expect(todayInVietnam(new Date("2026-10-30T17:00:00Z"))).toBe("2026-10-31");
  });

  it("uses the Vietnam date at midday UTC", () => {
    expect(todayInVietnam(new Date("2026-10-30T12:00:00Z"))).toBe("2026-10-30");
  });
});
