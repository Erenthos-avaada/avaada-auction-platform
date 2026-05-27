import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required.", step: "validation" }, { status: 400 });
    }

    // Step 1: find user
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr: any) {
      return NextResponse.json({ error: "Database error: " + dbErr.message, step: "db_lookup" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found.", step: "user_not_found", email }, { status: 401 });
    }

    // Step 2: check password
    let valid;
    try {
      valid = await bcrypt.compare(password, user.password);
    } catch (bcryptErr: any) {
      return NextResponse.json({ error: "Bcrypt error: " + bcryptErr.message, step: "bcrypt" }, { status: 500 });
    }

    if (!valid) {
      return NextResponse.json({ error: "Password mismatch.", step: "password_wrong" }, { status: 401 });
    }

    // Step 3: create JWT
    const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret";
    const secret = new TextEncoder().encode(secretKey);

    let token;
    try {
      token = await new SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
    } catch (jwtErr: any) {
      return NextResponse.json({ error: "JWT error: " + jwtErr.message, step: "jwt" }, { status: 500 });
    }

    // Step 4: set cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    } catch (cookieErr: any) {
      return NextResponse.json({ error: "Cookie error: " + cookieErr.message, step: "cookie" }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: user.role, step: "done" });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error: " + err.message, step: "unknown" }, { status: 500 });
  }
}
