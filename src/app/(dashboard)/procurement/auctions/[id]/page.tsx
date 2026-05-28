import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AuctionDetailClient from "./AuctionDetailClient";

export const dynamic = "force-dynamic";

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { _count: { select: { bids: true } }, createdBy: { select: { name: true } } },
  });
  if (!auction) notFound();

  const bids = await prisma.bid.findMany({
    where: { auctionId: id }, orderBy: { amount: "asc" },
    include: { vendor: { select: { companyName: true } } },
  });

  const vendors = await prisma.vendor.findMany({ where: { status: "APPROVED" }, select: { id: true, companyName: true } });
  const invites = await prisma.auctionInvite.findMany({ where: { auctionId: id }, select: { vendorId: true } });
  const invitedIds = invites.map((i: any) => i.vendorId);

  return <AuctionDetailClient auction={JSON.parse(JSON.stringify(auction))} initialBids={JSON.parse(JSON.stringify(bids))} vendors={vendors} invitedIds={invitedIds} role="PROCUREMENT" />;
}
