"use client";

import { useFormStatus } from "react-dom";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/Button";

function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      Sign out
    </Button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SignOutSubmit />
    </form>
  );
}
