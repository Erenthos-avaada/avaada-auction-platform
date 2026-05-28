import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { cookies } from "next/headers";
import { DEFAULT_THEME, ThemeId } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Avaada Auction Platform",
  description: "Reverse Auction Procurement System — Avaada Group",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || DEFAULT_THEME) as ThemeId;
  return (
    <html lang="en" data-theme={theme}>
      <body>
        <ThemeProvider theme={theme} />
        {children}
      </body>
    </html>
  );
}
