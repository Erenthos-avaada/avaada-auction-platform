import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "https://avaada-auction-platform.vercel.app"));
}
