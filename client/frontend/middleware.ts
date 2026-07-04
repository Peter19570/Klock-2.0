import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/api/config";

const PROTECTED_PREFIXES = ["/dashboard", "/attendance", "/sessions", "/branches", "/users", "/organization", "/audits", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (!request.cookies.has(REFRESH_COOKIE_NAME)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/attendance/:path*", "/sessions/:path*", "/branches/:path*", "/users/:path*", "/organization/:path*", "/audits/:path*", "/settings/:path*"],
};