import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bids = await prisma.bid.findMany({
    where: { auctionId: id }, orderBy: { amount: "asc" },
    include: { vendor: { select: { companyName: true } } },
  });
  return NextResponse.json({ bids });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);

    const vendor = await prisma.vendor.findUnique({ where: { userId: payload.id as string } });
    if (!vendor || vendor.status !== "APPROVED") {
      return NextResponse.json({ error: "Only approved vendors can bid." }, { status: 403 });
    }

    const auction = await prisma.auction.findUnique({ where: { id } });
    if (!auction) return NextResponse.json({ error: "Auction not found." }, { status: 404 });
    if (auction.status !== "ACTIVE") return NextResponse.json({ error: "Auction is not active." }, { status: 400 });

    const now = new Date();
    if (now < auction.startTime) return NextResponse.json({ error: "Auction has not started yet." }, { status: 400 });
    if (now > auction.endTime)   return NextResponse.json({ error: "Auction has already ended." }, { status: 400 });

    const { amount, note } = await request.json();
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount." }, { status: 400 });
    }

    // Get current lowest bid
    const lowestBid = await prisma.bid.findFirst({ where: { auctionId: id }, orderBy: { amount: "asc" } });

    if (lowestBid) {
      if (amount >= lowestBid.amount) {
        return NextResponse.json({ error: `Your bid must be lower than the current lowest bid of ₹${lowestBid.amount.toLocaleString("en-IN")}.` }, { status: 400 });
      }
      if (auction.minDecrement > 0) {
        const diff = lowestBid.amount - amount;
        // Bid must be a multiple of minDecrement lower than current lowest
        if (diff < auction.minDecrement) {
          return NextResponse.json({ error: `Bid must be at least ₹${auction.minDecrement.toLocaleString("en-IN")} lower than current lowest bid of ₹${lowestBid.amount.toLocaleString("en-IN")}.` }, { status: 400 });
        }
        if (Math.round(diff * 100) % Math.round(auction.minDecrement * 100) !== 0) {
          const validBids = [1,2,3].map(n => (lowestBid.amount - n * auction.minDecrement).toLocaleString("en-IN"));
          return NextResponse.json({ error: `Bid must be in multiples of ₹${auction.minDecrement.toLocaleString("en-IN")} below current lowest. Valid bids: ₹${validBids.join(", ₹")}...` }, { status: 400 });
        }
      }
    }

    // Check if vendor already has a lower or equal bid
    const myLowest = await prisma.bid.findFirst({ where: { auctionId: id, vendorId: vendor.id }, orderBy: { amount: "asc" } });
    if (myLowest && amount >= myLowest.amount) {
      return NextResponse.json({ error: `You already have a bid of ₹${myLowest.amount.toLocaleString("en-IN")}. New bid must be lower.` }, { status: 400 });
    }

    // Auto-extend: if bid placed within last autoExtendMins minutes, extend end time
    let newEndTime = auction.endTime;
    if (auction.autoExtendMins > 0) {
      const minsLeft = (auction.endTime.getTime() - now.getTime()) / 60000;
      if (minsLeft <= auction.autoExtendMins) {
        newEndTime = new Date(auction.endTime.getTime() + auction.autoExtendMins * 60000);
        await prisma.auction.update({ where: { id }, data: { endTime: newEndTime } });
      }
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: { auctionId: id, vendorId: vendor.id, amount, note: note || null },
      include: { vendor: { select: { companyName: true } } },
    });

    return NextResponse.json({ bid, extended: newEndTime !== auction.endTime, newEndTime }, { status: 201 });
  } catch (err: any) {
    console.error("Bid error:", err);
    return NextResponse.json({ error: "Failed to place bid." }, { status: 500 });
  }
}
