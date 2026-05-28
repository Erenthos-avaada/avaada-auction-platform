import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function GET() {
  const auctions = await prisma.auction.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bids: true } } },
  });
  return NextResponse.json({ auctions });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);

    const body = await request.json();
    const { title, description, category, quantity, unit, deliveryTerms, startTime, endTime, autoExtendMins, minDecrement, status } = body;

    if (!title || !category || !quantity || !unit || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    const auction = await prisma.auction.create({
      data: {
        title, description: description || null, category, quantity, unit,
        deliveryTerms: deliveryTerms || null,
        startTime: new Date(startTime), endTime: new Date(endTime),
        autoExtendMins: autoExtendMins ?? 10, minDecrement: minDecrement ?? 0,
        status: status || "DRAFT",
        createdById: payload.id as string,
      },
    });
    return NextResponse.json(auction, { status: 201 });
  } catch (err: any) {
    console.error("Create auction error:", err);
    return NextResponse.json({ error: "Failed to create auction." }, { status: 500 });
  }
}
