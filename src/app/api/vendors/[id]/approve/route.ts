import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVendorApprovedEmail, sendVendorRejectedEmail, sendVendorBlacklistedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id }     = await params;
  const { status } = await request.json();

  // Blacklisted vendors cannot be re-approved via this route
  const current = await prisma.vendor.findUnique({ where: { id } });
  if (current?.status === "BLACKLISTED" && status === "APPROVED") {
    return NextResponse.json({ error: "Blacklisted vendors cannot be re-approved. This ban is permanent." }, { status: 403 });
  }

  const vendor = await prisma.vendor.update({
    where: { id }, data: { status },
    include: { user: { select: { email: true } } },
  });

  try {
    if (status === "APPROVED")    await sendVendorApprovedEmail(vendor.user.email, vendor.companyName);
    if (status === "REJECTED")    await sendVendorRejectedEmail(vendor.user.email, vendor.companyName);
    if (status === "BLACKLISTED") await sendVendorBlacklistedEmail(vendor.user.email, vendor.companyName);
  } catch (err) { console.error("Email error:", err); }

  return NextResponse.json({ id: vendor.id, status: vendor.status });
}
