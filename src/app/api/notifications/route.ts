import { NextResponse } from "next/server";

// GET /api/notifications - Get notifications for logged-in user
export async function GET() {
  // TODO: Fetch unread notifications for current user
  return NextResponse.json({ notifications: [] });
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  const { ids } = await request.json();
  // TODO: Mark notification IDs as read
  return NextResponse.json({ updated: ids });
}
