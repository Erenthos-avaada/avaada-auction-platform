import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ id, status: "CLOSED" });
}
