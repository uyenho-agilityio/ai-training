export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export const DEFICIT_KCAL = 500;

export const PROTEIN_G_PER_KG = 2;

export const FAT_SHARE_OF_KCAL = 0.25;

export const KCAL_PER_G = {
  protein: 4,
  carb: 4,
} as const;

export const FAT_KCAL_PER_G = 9;

export const BODY_FAT_PERCENT_RANGE = { min: 3, max: 60 } as const;
