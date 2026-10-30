import { SignOutButton } from "@/components/SignOutButton";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <span className="font-semibold text-primary">Nutrition Coach</span>
      <SignOutButton />
    </header>
  );
}
