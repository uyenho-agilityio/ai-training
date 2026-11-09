"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Today and Profile, shown next to the app name in the header.
// The link to the current page is hidden. Today is shown only when the user has a profile,
// because Today sends a user without one to Profile.
export function AppNav({ hasProfile }: { hasProfile: boolean }) {
  const pathname = usePathname();
  const onToday = pathname === "/today";
  const onProfile = pathname === "/profile";

  return (
    <nav aria-label="Main" className="flex items-center gap-4">
      {hasProfile && !onToday && (
        <Link href="/today" className="text-text font-semibold">
          Today
        </Link>
      )}
      {!onProfile && (
        <Link href="/profile" className="text-text font-semibold">
          Profile
        </Link>
      )}
    </nav>
  );
}
