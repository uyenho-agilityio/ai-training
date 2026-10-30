import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

const privatePaths = ["/today", "/profile"];

function isPrivatePath(pathname: string) {
  return privatePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Reading the claims refreshes an expiring session and writes the new cookies.
  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;

  let target: string | null = null;
  if (pathname === "/") {
    target = data ? "/today" : "/login";
  } else if (!data && isPrivatePath(pathname)) {
    target = "/login";
  }

  if (!target) {
    return response;
  }

  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = target;
  const redirect = NextResponse.redirect(targetUrl);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
