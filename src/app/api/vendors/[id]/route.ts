import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } } } });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vendor);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { companyName, gstNumber, panNumber, bankName, bankAccount, bankIfsc, categories } = body;
  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      companyName: companyName || undefined,
      gstNumber:   gstNumber   || null,
      panNumber:   panNumber   || null,
      bankName:    bankName    || null,
      bankAccount: bankAccount || null,
      bankIfsc:    bankIfsc    || null,
      categories:  categories  || [],
    },
  });
  return NextResponse.json(vendor);
}
