"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Text } from "@/components/Text";
import type { SamplePlan as SamplePlanData } from "@/utils/samplePlan";

type SamplePlanProps = {
  target: number;
  plan: SamplePlanData;
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function SamplePlan({ target, plan }: SamplePlanProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const day = plan.days[dayIndex];

  return (
    <section className="flex flex-col gap-3">
      <Heading level={2}>Sample meal plan</Heading>
      <div className="flex flex-wrap gap-2">
        {plan.days.map((_, index) => (
          <Button
            key={index}
            variant={index === dayIndex ? "primary" : "outline"}
            aria-pressed={index === dayIndex}
            onClick={() => setDayIndex(index)}
          >
            Day {index + 1}
          </Button>
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {day.meals.map((meal) => (
          <li key={meal.mealType} className="flex justify-between gap-4">
            <div className="flex flex-col">
              <Text size="sm" tone="muted">
                {mealLabels[meal.mealType]}
              </Text>
              <Text>{meal.food.nameEn}</Text>
            </div>
            <Text weight="semibold">{Math.round(meal.food.kcal)} kcal</Text>
          </li>
        ))}
      </ul>
      <Text size="sm">
        {`${Math.round(day.kcal)} kcal of ${Math.round(target)} kcal target`}
      </Text>
    </section>
  );
}
