import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAuctionInviteEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invites = await prisma.auctionInvite.findMany({
    where: { auctionId: id },
    include: { vendor: { select: { companyName: true, status: true } } },
  });
  return NextResponse.json({ invites });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }        = await params;
  const { vendorIds } = await request.json();

  const auction = await prisma.auction.findUnique({ where: { id } });
  if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

  let invited = 0;
  for (const vendorId of vendorIds) {
    try {
      await prisma.auctionInvite.upsert({
        where:  { auctionId_vendorId: { auctionId: id, vendorId } },
        update: {},
        create: { auctionId: id, vendorId },
      });

      // Send invite email
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: { select: { email: true } } },
      });
      if (vendor) {
        await sendAuctionInviteEmail(
          vendor.user.email, vendor.companyName,
          auction.title, auction.id, auction.endTime
        );
      }
      invited++;
    } catch (err) { console.error(`Invite error for vendor ${vendorId}:`, err); }
  }

  return NextResponse.json({ invited });
}
