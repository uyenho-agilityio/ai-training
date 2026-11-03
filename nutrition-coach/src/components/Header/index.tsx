import { ProfileLink } from "@/components/ProfileLink";
import { SignOutButton } from "@/components/SignOutButton";
import { Text } from "@/components/Text";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Text as="span" weight="semibold" tone="primary">
        Nutrition Coach
      </Text>
      <div className="flex items-center gap-4">
        <ThemeSwitch />
        <ProfileLink />
        <SignOutButton />
      </div>
    </header>
  );
}
