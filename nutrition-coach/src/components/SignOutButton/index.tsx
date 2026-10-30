"use client";

import { useFormStatus } from "react-dom";

import { signOut } from "@/app/actions/auth";

function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-button border border-primary px-4 py-2 font-semibold text-primary disabled:cursor-default disabled:opacity-60"
    >
      Sign out
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SignOutSubmit />
    </form>
  );
}
