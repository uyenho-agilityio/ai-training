import { describe, expect, it } from "vitest";

import { calculateDailyTotals } from "@/utils/dailyTotals";

const target = { kcal: 2211, proteinG: 160, carbG: 254, fatG: 61 };

// Values from docs/requirements/food-list.md
const coHen = { kcal: 291, proteinG: 18, carbG: 40.1, fatG: 6.3 };
const banhMi = { kcal: 678.8, proteinG: 30.6, carbG: 48.1, fatG: 40.5 };
const comRangThapCam = { kcal: 623, proteinG: 19.9, carbG: 86.6, fatG: 21.9 };

describe("calculateDailyTotals", () => {
  it("leaves the whole target remaining on an empty day", () => {
    expect(calculateDailyTotals(target, [])).toEqual({
      eaten: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
      remaining: target,
    });
  });

  it("subtracts one entry from the target", () => {
    const { eaten, remaining } = calculateDailyTotals(target, [coHen]);

    expect(eaten.kcal).toBeCloseTo(291);
    expect(remaining.kcal).toBeCloseTo(1920);
    expect(remaining.proteinG).toBeCloseTo(142);
    expect(remaining.carbG).toBeCloseTo(213.9);
    expect(remaining.fatG).toBeCloseTo(54.7);
  });

  it("adds up several entries", () => {
    const { eaten, remaining } = calculateDailyTotals(target, [coHen, banhMi]);

    expect(eaten.kcal).toBeCloseTo(969.8);
    expect(eaten.proteinG).toBeCloseTo(48.6);
    expect(eaten.carbG).toBeCloseTo(88.2);
    expect(eaten.fatG).toBeCloseTo(46.8);
    expect(remaining.kcal).toBeCloseTo(1241.2);
  });

  it("gives negative remaining values when the day is over target", () => {
    const { remaining } = calculateDailyTotals(
      { kcal: 500, proteinG: 40, carbG: 50, fatG: 15 },
      [comRangThapCam],
    );

    expect(remaining.kcal).toBeCloseTo(-123);
    expect(remaining.proteinG).toBeCloseTo(20.1);
    expect(remaining.carbG).toBeCloseTo(-36.6);
    expect(remaining.fatG).toBeCloseTo(-6.9);
  });
});
