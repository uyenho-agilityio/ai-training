"use client";

import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="cursor-pointer rounded-button border border-primary px-4 py-2 font-semibold text-primary"
    >
      Sign out
    </button>
  );
}
