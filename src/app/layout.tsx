import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avaada Auction Platform",
  description: "Reverse Auction Procurement System — Avaada Group",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
