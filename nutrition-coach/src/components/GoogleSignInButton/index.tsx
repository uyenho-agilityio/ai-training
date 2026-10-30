"use client";

import { signInWithGoogle } from "@/app/actions/auth";

export function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="cursor-pointer rounded-button bg-primary px-6 py-3 font-semibold text-on-primary shadow-card hover:shadow-raised"
    >
      Continue with Google
    </button>
  );
}
