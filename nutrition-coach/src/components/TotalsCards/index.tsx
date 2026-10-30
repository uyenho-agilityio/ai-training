import { Text } from "@/components/Text";
import type { Targets } from "@/utils/targets";

type TotalsCardsProps = {
  target: Targets;
  eaten: Targets;
  remaining: Targets;
};

export function TotalsCards({ target, eaten, remaining }: TotalsCardsProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex justify-between gap-4">
        <div className="flex flex-col">
          <Text size="sm" tone="muted">
            Target
          </Text>
          <Text weight="semibold">{Math.round(target.kcal)} kcal</Text>
        </div>
        <div className="flex flex-col">
          <Text size="sm" tone="muted">
            Eaten
          </Text>
          <Text weight="semibold">{Math.round(eaten.kcal)} kcal</Text>
        </div>
        <div className="flex flex-col">
          <Text size="sm" tone="muted">
            Remaining
          </Text>
          <Text weight="semibold">{Math.round(remaining.kcal)} kcal</Text>
        </div>
      </div>
      <Text size="sm">{Math.round(remaining.proteinG)} g protein left</Text>
      <Text size="sm">{Math.round(remaining.carbG)} g carbs left</Text>
      <Text size="sm">{Math.round(remaining.fatG)} g fat left</Text>
    </section>
  );
}
