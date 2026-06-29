// ============================================
// Middleware - Route Protection
// ============================================

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes - no auth needed
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiRegister = pathname.startsWith("/api/register");
  const isApiDoctorsPublic = pathname.startsWith("/api/doctors") && req.method === "GET";

  if (isPublicRoute || isApiAuth || isApiRegister || isApiDoctorsPublic) {
    // If logged in user tries to access auth pages, redirect to dashboard
    if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/register")) {
      return NextResponse.redirect(
        new URL(`/${userRole}/dashboard`, req.url)
      );
    }
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (pathname.startsWith("/patient") && userRole !== "patient") {
    return NextResponse.redirect(
      new URL(`/${userRole}/dashboard`, req.url)
    );
  }

  if (pathname.startsWith("/doctor") && userRole !== "doctor") {
    return NextResponse.redirect(
      new URL(`/${userRole}/dashboard`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|avatars|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
