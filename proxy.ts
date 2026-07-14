import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session-edge";

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password", "/invite"];
const PROTECTED_PREFIX = "/dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Static assets — pass through immediately ─────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Read session cookie ──────────────────────────────────────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    const session = await verifySessionToken(token);
    isAuthenticated = !!session;
  }

  // ── Route classification ─────────────────────────────────────────────────
  const isAuthRoute =
    pathname === "/" ||
    AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
  const isProtectedRoute =
    pathname === PROTECTED_PREFIX ||
    pathname.startsWith(PROTECTED_PREFIX + "/");

  // ── Redirect unauthenticated users away from protected routes ────────────
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect authenticated users away from auth routes ───────────────────
  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
