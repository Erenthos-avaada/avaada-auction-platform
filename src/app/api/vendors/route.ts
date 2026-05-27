import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/vendors - List all vendors (admin/procurement only)
export async function GET() {
  // TODO: Fetch vendors with status filter
  return NextResponse.json({ vendors: [] });
}
