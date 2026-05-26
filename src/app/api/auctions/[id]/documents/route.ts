import { NextResponse } from "next/server";

// GET /api/auctions/[id]/documents
export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ documents: [], auctionId: params.id });
}

// POST /api/auctions/[id]/documents - Upload document
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // TODO: Handle file upload via Vercel Blob, save URL to DB
  return NextResponse.json({ auctionId: params.id }, { status: 201 });
}
