import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ONE-TIME USE: Creates first admin if none exists.
// Delete or disable this route after first use.
export async function POST(request: Request) {
  const { secret } = await request.json();
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
  }
  const hashed = await bcrypt.hash("Avaada@2024", 12);
  const user = await prisma.user.create({
    data: { name: "Avaada Admin", email: "admin@avaada.com", password: hashed, role: "ADMIN" }
  });
  return NextResponse.json({ success: true, email: user.email });
}
