"use client";

import { signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/Button";

export function GoogleSignInButton() {
  return (
    <Button onClick={() => signInWithGoogle()}>Continue with Google</Button>
  );
}
