import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { secret, newPassword } = await request.json();
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: "auction-auction-admin@avaada.com" },
    data: { password: hashed },
  });
  return NextResponse.json({ success: true, message: "Password updated." });
}
