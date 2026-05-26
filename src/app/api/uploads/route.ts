import { NextResponse } from "next/server";

// POST /api/uploads - Upload file to Vercel Blob
export async function POST(request: Request) {
  // TODO: Stream file to Vercel Blob, return URL
  return NextResponse.json({ url: "" }, { status: 201 });
}
