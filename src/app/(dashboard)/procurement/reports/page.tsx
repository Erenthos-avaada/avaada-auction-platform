import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [auctions, totalBids, totalVendors] = await Promise.all([
    prisma.auction.findMany({
      where: { status: { in: ["CLOSED", "ACTIVE", "DRAFT"] } },
      orderBy: { endTime: "desc" },
      include: {
        _count:  { select: { bids: true, invites: true } },
        items:   { orderBy: { sortOrder: "asc" } },
        invites: { include: { vendor: { select: { companyName: true } } } },
        bids: {
          orderBy: { amount: "asc" },
          include: { vendor: { select: { companyName: true } } },
        },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.bid.count(),
    prisma.vendor.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <ReportsClient
      auctions={JSON.parse(JSON.stringify(auctions))}
      totalBids={totalBids}
      totalVendors={totalVendors}
    />
  );
}
