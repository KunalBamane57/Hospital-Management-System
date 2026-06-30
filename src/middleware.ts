// ============================================
// Middleware - Route Protection with Role-Based Access
// ============================================

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

function getDashboardForRole(role?: string): string {
  switch (role) {
    case "patient":
      return "/patient/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

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
    if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/register")) {
      return NextResponse.redirect(new URL(getDashboardForRole(userRole), req.url));
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
    return NextResponse.redirect(new URL(getDashboardForRole(userRole), req.url));
  }

  if (pathname.startsWith("/doctor") && userRole !== "doctor") {
    return NextResponse.redirect(new URL(getDashboardForRole(userRole), req.url));
  }

  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL(getDashboardForRole(userRole), req.url));
  }

  // API route protection for admin endpoints
  if (pathname.startsWith("/api/admin") && userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|avatars|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
