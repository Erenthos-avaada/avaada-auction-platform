import { NextResponse } from "next/server";

// POST /api/auctions/[id]/invite - Invite vendors to auction
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json(); // { vendorIds: string[] }
  // TODO: Create AuctionInvite records, send invite emails
  return NextResponse.json({ invited: body.vendorIds, auctionId: params.id });
}
