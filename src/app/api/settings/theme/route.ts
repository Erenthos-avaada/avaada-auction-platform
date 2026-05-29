import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { THEMES, ThemeId, DEFAULT_THEME } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "global", theme: DEFAULT_THEME } });
  }
  // Cache at edge for 30 seconds — massively reduces DB hits
  // Admin switching theme busts this via POST which updates DB
  return NextResponse.json(
    { theme: settings.theme },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
  );
}

export async function POST(request: Request) {
  const { theme } = await request.json();
  if (!THEMES[theme as ThemeId]) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }
  await prisma.siteSettings.upsert({
    where:  { id: "global" },
    update: { theme },
    create: { id: "global", theme },
  });
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return NextResponse.json({ success: true, theme });
}
