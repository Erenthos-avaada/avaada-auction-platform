import { NextResponse } from "next/server";

// PATCH /api/auctions/[id]/close - Mark auction as closed
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  // TODO: Check procurement role, update status to CLOSED
  return NextResponse.json({ id: params.id, status: "CLOSED" });
}
