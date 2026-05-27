import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/auctions - List all auctions
export async function GET() {
  // TODO: Fetch auctions from DB with filters
  return NextResponse.json({ auctions: [] });
}

// POST /api/auctions - Create new auction
export async function POST(request: Request) {
  // TODO: Validate input, create auction in DB
  const body = await request.json();
  return NextResponse.json({ auction: body }, { status: 201 });
}
