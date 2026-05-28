import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { DEFAULT_THEME, ThemeId } from "@/lib/themes";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Avaada Auction Platform",
  description: "Reverse Auction Procurement System — Avaada Group",
};

export const dynamic    = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Force Next.js to treat this as dynamic by reading headers
  await headers();

  let theme: ThemeId = DEFAULT_THEME;
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
    });
    if (settings?.theme) theme = settings.theme as ThemeId;
  } catch (e) {
    console.error("Theme fetch error:", e);
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
