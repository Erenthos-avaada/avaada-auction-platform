import { NextResponse } from "next/server";

// GET /api/auctions/[id]/bids - Get all bids for an auction
export async function GET(_: Request, { params }: { params: { id: string } }) {
  // TODO: Fetch bids sorted by amount ASC
  return NextResponse.json({ bids: [], auctionId: params.id });
}

// POST /api/auctions/[id]/bids - Place a new bid
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  // TODO: Validate bid lower than current lowest, save to DB, trigger auto-extend
  return NextResponse.json({ bid: { auctionId: params.id, ...body } }, { status: 201 });
}
