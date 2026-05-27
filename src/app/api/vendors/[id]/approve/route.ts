import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ id: vendor.id, status: vendor.status });
}
