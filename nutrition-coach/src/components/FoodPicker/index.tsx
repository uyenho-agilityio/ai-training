"use client";

import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

import { logFood } from "@/app/actions/meal";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { FOODS } from "@/constants/foods";

export function FoodPicker() {
  const router = useRouter();
  const [foodCode, setFoodCode] = useState(FOODS[0].code);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    let result;
    try {
      result = await logFood({ foodCode });
    } catch {
      setPending(false);
      setError("Could not log the dish. Try again.");
      return;
    }
    setPending(false);

    if (result.ok) {
      setError(null);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Dish</span>
        <select
          value={foodCode}
          onChange={(event) => setFoodCode(event.target.value)}
          className="cursor-pointer rounded-field border border-primary/30 py-2 pr-3 pl-3"
        >
          {FOODS.map((food) => (
            <option key={food.code} value={food.code}>
              {food.nameEn}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <div role="alert">
          <Text tone="primary">{error}</Text>
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        Log dish
      </Button>
    </form>
  );
}
