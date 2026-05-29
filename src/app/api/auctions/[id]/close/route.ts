import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAuctionClosedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auction = await prisma.auction.update({
    where: { id }, data: { status: "CLOSED" },
  });

  // Notify all invited vendors
  try {
    const invites = await prisma.auctionInvite.findMany({
      where: { auctionId: id },
      include: { vendor: { include: { user: { select: { email: true } } } } },
    });
    await Promise.allSettled(
      invites.map(inv =>
        sendAuctionClosedEmail(inv.vendor.user.email, inv.vendor.companyName, auction.title)
      )
    );
  } catch (emailErr) { console.error("Email error:", emailErr); }

  return NextResponse.json({ id: auction.id, status: auction.status });
}
