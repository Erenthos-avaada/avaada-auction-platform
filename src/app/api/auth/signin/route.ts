import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret"
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendor: { select: { status: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Block rejected and blacklisted vendors from logging in
    if (user.vendor) {
      if (user.vendor.status === "BLACKLISTED") {
        return NextResponse.json({
          error: "Your account has been suspended. Please contact the Avaada procurement team.",
          code: "BLACKLISTED",
        }, { status: 403 });
      }
      if (user.vendor.status === "REJECTED") {
        return NextResponse.json({
          error: "Your application was not approved. You may re-apply with a new registration.",
          code: "REJECTED",
          reapply: true,
        }, { status: 403 });
      }
    }

    // Create JWT
    const token = await new SignJWT({
      id: user.id, email: user.email, name: user.name, role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (err: any) {
    console.error("Signin error:", err);
    return NextResponse.json({ error: "Sign in failed. Please try again." }, { status: 500 });
  }
}
