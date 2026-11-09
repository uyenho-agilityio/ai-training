import { AppNav } from "@/components/AppNav";
import { SignOutButton } from "@/components/SignOutButton";
import { Text } from "@/components/Text";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Header({ hasProfile }: { hasProfile: boolean }) {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4">
      <div className="flex items-center gap-6">
        <Text as="span" weight="semibold" tone="primary">
          Nutrition Coach
        </Text>
        <AppNav hasProfile={hasProfile} />
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitch />
        <SignOutButton />
      </div>
    </header>
  );
}
