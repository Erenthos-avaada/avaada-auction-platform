import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/procurement") && !["ADMIN", "PROCUREMENT"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/vendor") && token?.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/admin/:path*", "/procurement/:path*", "/vendor/:path*"],
};
