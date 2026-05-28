import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { cookies } from "next/headers";
import { DEFAULT_THEME, ThemeId } from "@/lib/themes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Avaada Auction Platform",
  description: "Reverse Auction Procurement System — Avaada Group",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Always read theme from DB — so admin changes apply to ALL browsers on next load
  let theme: ThemeId = DEFAULT_THEME;
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    if (settings?.theme) theme = settings.theme as ThemeId;
  } catch {
    // Fallback to cookie if DB unavailable
    const cookieStore = await cookies();
    theme = (cookieStore.get("theme")?.value || DEFAULT_THEME) as ThemeId;
  }

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <ThemeProvider theme={theme} />
        {children}
      </body>
    </html>
  );
}
