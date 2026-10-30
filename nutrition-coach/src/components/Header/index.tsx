import { SignOutButton } from "@/components/SignOutButton";
import { Text } from "@/components/Text";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Text as="span" weight="semibold" tone="primary">
        Nutrition Coach
      </Text>
      <SignOutButton />
    </header>
  );
}
