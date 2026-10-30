import {
  ACTIVITY_FACTORS,
  DEFICIT_KCAL,
  FAT_KCAL_PER_G,
  FAT_SHARE_OF_KCAL,
  KCAL_PER_G,
  PROTEIN_G_PER_KG,
} from "@/constants/nutrition";

export type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

export type TargetProfile = {
  sex: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  bodyFatPercent: number | null;
};

export type Targets = {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
};

function basalMetabolicRate(profile: TargetProfile) {
  if (profile.bodyFatPercent !== null) {
    const leanMassKg = profile.weightKg * (1 - profile.bodyFatPercent / 100);
    return 370 + 21.6 * leanMassKg;
  }

  const base =
    10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === "male" ? base + 5 : base - 161;
}

export function calculateTargets(profile: TargetProfile): Targets {
  const kcal =
    basalMetabolicRate(profile) * ACTIVITY_FACTORS[profile.activityLevel] -
    DEFICIT_KCAL;
  const proteinG = PROTEIN_G_PER_KG * profile.weightKg;
  const fatKcal = kcal * FAT_SHARE_OF_KCAL;
  const fatG = fatKcal / FAT_KCAL_PER_G;
  const carbKcal = kcal - proteinG * KCAL_PER_G.protein - fatKcal;
  const carbG = Math.max(0, carbKcal / KCAL_PER_G.carb);

  return {
    kcal: Math.round(kcal),
    proteinG: Math.round(proteinG),
    carbG: Math.round(carbG),
    fatG: Math.round(fatG),
  };
}
