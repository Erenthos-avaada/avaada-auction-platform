import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await prisma.auction.update({
    where: { id }, data: { status: "CLOSED" },
  });
  return NextResponse.json({ id: auction.id, status: auction.status });
}
