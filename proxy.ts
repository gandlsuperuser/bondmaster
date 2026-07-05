import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isConfigured = isSupabaseConfigured();
  let isAuthenticated = false;
  let response = NextResponse.next({ request });

  if (isConfigured) {
    // 1. Supabase Auth Mode
    const { createServerClient } = await import("@supabase/ssr");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    } catch (e) {
      isAuthenticated = false;
    }
  } else {
    // 2. Mock Auth Mode
    isAuthenticated = request.cookies.has("bondmaster-mock-session");
  }

  const isAuthRoute = ["/login", "/forgot-password", "/reset-password"].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isProtectedRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
