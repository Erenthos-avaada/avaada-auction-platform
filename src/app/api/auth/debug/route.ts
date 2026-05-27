import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Temporary debug route — DELETE AFTER USE
export async function POST(request: Request) {
  const { email, password, secret } = await request.json();
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ found: false, email });
  const valid = await bcrypt.compare(password, user.password);
  return NextResponse.json({
    found: true,
    email: user.email,
    role: user.role,
    passwordMatch: valid,
  });
}
