"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileLink() {
  const pathname = usePathname();

  if (pathname === "/profile") {
    return null;
  }

  return (
    <Link href="/profile" className="text-primary font-semibold">
      Profile
    </Link>
  );
}
