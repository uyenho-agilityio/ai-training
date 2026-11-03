import { Text } from "@/components/Text";

type WaterTargetCardProps = {
  targetMl: number;
};

export function WaterTargetCard({ targetMl }: WaterTargetCardProps) {
  return (
    <section className="flex flex-col gap-1">
      <Text size="sm" tone="muted">
        Water target
      </Text>
      <Text weight="semibold">{`${targetMl.toLocaleString("en-US")} ml`}</Text>
    </section>
  );
}
