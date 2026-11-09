import { AppNav } from "@/components/AppNav";
import { SignOutButton } from "@/components/SignOutButton";
import { Text } from "@/components/Text";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Header({ hasProfile }: { hasProfile: boolean }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Text as="span" weight="semibold" tone="primary">
          Nutrition Coach
        </Text>
        <AppNav hasProfile={hasProfile} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <ThemeSwitch />
        <SignOutButton />
      </div>
    </header>
  );
}
