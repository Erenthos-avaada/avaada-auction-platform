import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAuctionClosingSoonEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Called by Vercel Cron every 5 minutes
// Sends "closing soon" email to vendors when auction has 30 min left
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now     = new Date();
  const in35min = new Date(now.getTime() + 35 * 60 * 1000);
  const in25min = new Date(now.getTime() + 25 * 60 * 1000);

  // Auctions closing in 25-35 min window (catches the 30-min mark)
  const auctions = await prisma.auction.findMany({
    where: { status: "ACTIVE", endTime: { gte: in25min, lte: in35min } },
  });

  let sent = 0;
  for (const auction of auctions) {
    const invites = await prisma.auctionInvite.findMany({
      where: { auctionId: auction.id },
      include: { vendor: { include: { user: { select: { email: true } } } } },
    });
    await Promise.allSettled(
      invites.map(inv =>
        sendAuctionClosingSoonEmail(inv.vendor.user.email, inv.vendor.companyName, auction.title, auction.id, 30)
      )
    );
    sent += invites.length;
  }

  return NextResponse.json({ checked: auctions.length, emailsSent: sent });
}
