import { GoogleSignInButton, Heading } from "@/components";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Heading tone="primary">Nutrition Coach</Heading>
      <GoogleSignInButton />
    </main>
  );
}
