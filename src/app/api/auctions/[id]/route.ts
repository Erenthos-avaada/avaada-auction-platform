import { NextResponse } from "next/server";

// GET /api/auctions/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  // TODO: Fetch single auction by ID
  return NextResponse.json({ id: params.id });
}

// PATCH /api/auctions/[id]
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  // TODO: Update auction
  return NextResponse.json({ id: params.id, ...body });
}

// DELETE /api/auctions/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // TODO: Delete / cancel auction
  return NextResponse.json({ deleted: params.id });
}
