import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VendorBidClient from "./VendorBidClient";

export const dynamic = "force-dynamic";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function VendorAuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);

  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.id as string } });
  if (!vendor) notFound();

  const auction = await prisma.auction.findUnique({ where: { id } });
  if (!auction) notFound();

  const bids = await prisma.bid.findMany({
    where: { auctionId: id }, orderBy: { amount: "asc" },
    include: { vendor: { select: { companyName: true } } },
  });

  const myBids = await prisma.bid.findMany({
    where: { auctionId: id, vendorId: vendor.id },
    orderBy: { amount: "asc" },
  });

  return (
    <VendorBidClient
      auction={JSON.parse(JSON.stringify(auction))}
      initialBids={JSON.parse(JSON.stringify(bids))}
      myBids={JSON.parse(JSON.stringify(myBids))}
      vendorId={vendor.id}
    />
  );
}
