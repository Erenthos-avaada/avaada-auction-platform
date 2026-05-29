import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVendorApprovedEmail, sendVendorRejectedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }     = await params;
  const { status } = await request.json();

  const vendor = await prisma.vendor.update({
    where: { id }, data: { status },
    include: { user: { select: { email: true } } },
  });

  // Send email based on status
  try {
    if (status === "APPROVED") {
      await sendVendorApprovedEmail(vendor.user.email, vendor.companyName);
    } else if (status === "REJECTED") {
      await sendVendorRejectedEmail(vendor.user.email, vendor.companyName);
    }
  } catch (emailErr) { console.error("Email error:", emailErr); }

  return NextResponse.json({ id: vendor.id, status: vendor.status });
}
