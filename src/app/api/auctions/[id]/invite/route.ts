import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const { id } = await params;
  const { vendorIds } = await request.json();
  const results = await Promise.allSettled(
    vendorIds.map((vendorId: string) =>
      prisma.auctionInvite.upsert({
        where: { auctionId_vendorId: { auctionId: id, vendorId } },
        update: {},
        create: { auctionId: id, vendorId },
      })
    )
  );
  return NextResponse.json({ invited: results.filter(r => r.status === "fulfilled").length });
}
