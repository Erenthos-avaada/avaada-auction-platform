import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { secret, to } = await request.json();
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set in environment variables." }, { status: 500 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM   = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: "Avaada Auctions — Email Test",
      html: "<p>✅ Email is working correctly from the Avaada Auction Platform.</p>",
    });
    return NextResponse.json({ success: true, from: FROM, to, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, details: err }, { status: 500 });
  }
}
