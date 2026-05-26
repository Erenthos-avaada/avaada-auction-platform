import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const token = req.auth;
  const path = req.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (token.user as any)?.role;

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/procurement") && !["ADMIN", "PROCUREMENT"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/vendor") && role !== "VENDOR") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/procurement/:path*", "/vendor/:path*"],
};
