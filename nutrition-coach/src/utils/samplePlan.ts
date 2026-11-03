import { FOODS, type Food, type MealType } from "@/constants/foods";

export type RandomSource = () => number;

export type PlannedMeal = {
  mealType: "breakfast" | "lunch" | "dinner";
  food: Food;
};

export type SamplePlanDay = {
  meals: PlannedMeal[];
  kcal: number;
};

export type SamplePlan = {
  days: SamplePlanDay[];
};

const SAMPLE_PLAN_DAYS = 7;
const MEAL_ORDER = ["breakfast", "lunch", "dinner"] as const;
const TOLERANCE = 0.1;
const TRIES_PER_DAY = 5;

const NEAREST_CHOICES = 2;

function candidatesFor(mealType: MealType, usedCodes: Set<string>): Food[] {
  return FOODS.filter(
    (food) => food.mealTypes.includes(mealType) && !usedCodes.has(food.code),
  );
}

// Each meal is one of the dishes nearest to its share of what is left, picked
// at random among the nearest few. Dinner is the last meal, so it gets what
// is left.
function buildDay(targetKcal: number, random: RandomSource): SamplePlanDay {
  const usedCodes = new Set<string>();
  const meals: PlannedMeal[] = [];
  let eatenKcal = 0;

  MEAL_ORDER.forEach((mealType, index) => {
    const mealsLeft = MEAL_ORDER.length - index;
    const share = (targetKcal - eatenKcal) / mealsLeft;
    const nearest = candidatesFor(mealType, usedCodes)
      .sort((a, b) => Math.abs(a.kcal - share) - Math.abs(b.kcal - share))
      .slice(0, NEAREST_CHOICES);
    const food = nearest[Math.floor(random() * nearest.length)];

    usedCodes.add(food.code);
    eatenKcal += food.kcal;
    meals.push({ mealType, food });
  });

  return { meals, kcal: eatenKcal };
}

export function generateSamplePlan(
  targetKcal: number,
  random: RandomSource,
): SamplePlan {
  const days: SamplePlanDay[] = [];

  for (let dayIndex = 0; dayIndex < SAMPLE_PLAN_DAYS; dayIndex++) {
    let closest = buildDay(targetKcal, random);

    for (let attempt = 1; attempt < TRIES_PER_DAY; attempt++) {
      if (Math.abs(closest.kcal - targetKcal) <= targetKcal * TOLERANCE) {
        break;
      }
      const candidate = buildDay(targetKcal, random);
      if (
        Math.abs(candidate.kcal - targetKcal) <
        Math.abs(closest.kcal - targetKcal)
      ) {
        closest = candidate;
      }
    }

    days.push(closest);
  }

  return { days };
}
