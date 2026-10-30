import type { Targets } from "@/utils/targets";

export type DailyEntry = Targets;

export function calculateDailyTotals(target: Targets, entries: DailyEntry[]) {
  const eaten: Targets = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 };

  for (const entry of entries) {
    eaten.kcal += entry.kcal;
    eaten.proteinG += entry.proteinG;
    eaten.carbG += entry.carbG;
    eaten.fatG += entry.fatG;
  }

  const remaining: Targets = {
    kcal: target.kcal - eaten.kcal,
    proteinG: target.proteinG - eaten.proteinG,
    carbG: target.carbG - eaten.carbG,
    fatG: target.fatG - eaten.fatG,
  };

  return { eaten, remaining };
}
