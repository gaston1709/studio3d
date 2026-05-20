import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isApiRoute = pathname.startsWith("/api/");
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    const isUserRoute = pathname.startsWith("/orders") || pathname.startsWith("/api/orders") || pathname.startsWith("/profile") || pathname.startsWith("/api/user");

    // 1. Admin Route Protection
    if (isAdminRoute) {
      if (!token) {
        if (isApiRoute) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      if (token.role !== "ADMIN") {
        if (isApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 2. User Route Protection
    if (isUserRoute) {
      if (!token) {
        if (isApiRoute) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
    secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "jddRfoAdsQJYNvnGQ/KlXtoINY0Yc/Ab0MYgdg5J2IQ=" : undefined),
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/orders/:path*",
    "/orders",
    "/profile/:path*",
    "/profile",
    "/api/admin/:path*",
    "/api/admin",
    "/api/orders/:path*",
    "/api/orders",
    "/api/user/:path*",
    "/api/user",
  ],
};
