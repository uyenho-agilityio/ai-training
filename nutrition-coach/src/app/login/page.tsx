import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold text-primary">Nutrition Coach</h1>
      <GoogleSignInButton />
    </main>
  );
}
