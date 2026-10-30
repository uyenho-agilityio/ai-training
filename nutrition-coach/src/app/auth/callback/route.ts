import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

// Exchanges the one-time code for a session, then sends the user to Today.
// Today checks for a profile and sends users without one to Profile.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/today", origin));
    }
  }

  return NextResponse.redirect(new URL("/login", origin));
}
