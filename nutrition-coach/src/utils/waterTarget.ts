import { WATER_ADD_ON_ML, WATER_ML_PER_KG } from "@/constants/nutrition";
import type { ActivityLevel } from "@/utils/targets";

export type WaterProfile = {
  weightKg: number;
  activityLevel: ActivityLevel;
};

export function calculateWaterTarget(profile: WaterProfile): number {
  const base = profile.weightKg * WATER_ML_PER_KG;
  return Math.round(base + WATER_ADD_ON_ML[profile.activityLevel]);
}
