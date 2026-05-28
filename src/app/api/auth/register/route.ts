import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName, gstNumber, panNumber, categories, bankName, bankAccount, bankIfsc } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "Name, email, password and company name are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, role: "VENDOR",
        vendor: {
          create: {
            companyName, gstNumber: gstNumber || null, panNumber: panNumber || null,
            categories: categories || [],
            bankName: bankName || null, bankAccount: bankAccount || null, bankIfsc: bankIfsc || null,
            status: "PENDING",
          }
        }
      }
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
