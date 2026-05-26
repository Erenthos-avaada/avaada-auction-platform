import { NextResponse } from "next/server";

// PATCH /api/vendors/[id]/approve - Approve or reject vendor
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { status } = await request.json(); // APPROVED | REJECTED | BLACKLISTED
  // TODO: Update vendor status, send notification email
  return NextResponse.json({ id: params.id, status });
}
