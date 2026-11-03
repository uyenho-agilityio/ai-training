"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logCustomFood } from "@/app/actions/foods";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import type { SavedCustomFood } from "@/utils/supabase/queries/customFoods";

type CustomFoodListProps = {
  foods: SavedCustomFood[];
};

export function CustomFoodList({ foods }: CustomFoodListProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleLog(food: SavedCustomFood) {
    setPendingId(food.id);
    let result;
    try {
      result = await logCustomFood({ customFoodId: food.id });
    } catch {
      setPendingId(null);
      setError("Could not log the food. Try again.");
      return;
    }
    setPendingId(null);

    if (result.ok) {
      setError(null);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  if (foods.length === 0) {
    return <Text tone="muted">No saved foods yet</Text>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {foods.map((food) => (
          <li
            key={food.id}
            aria-label={food.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex flex-col">
              <Text weight="semibold">{food.name}</Text>
              <Text size="sm" tone="muted">
                {Math.round(food.kcal)} kcal
              </Text>
            </div>
            <Button
              variant="outline"
              aria-label={`Log ${food.name}`}
              disabled={pendingId !== null}
              onClick={() => handleLog(food)}
            >
              Log
            </Button>
          </li>
        ))}
      </ul>
      {error ? (
        <div role="alert">
          <Text tone="primary">{error}</Text>
        </div>
      ) : null}
    </div>
  );
}
