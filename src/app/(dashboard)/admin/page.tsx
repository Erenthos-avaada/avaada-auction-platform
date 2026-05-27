import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalVendors, pendingVendors, totalAuctions, activeAuctions] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { status: "PENDING" } }),
    prisma.auction.count(),
    prisma.auction.count({ where: { status: "ACTIVE" } }),
  ]);
  return { totalVendors, pendingVendors, totalAuctions, activeAuctions };
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: number; sub?: string; color: string; icon: string }) {
  return (
    <div style={{
      background: "var(--navy-700)", border: `1px solid ${color}22`,
      borderRadius: "16px", padding: "24px",
      display: "flex", flexDirection: "column", gap: "12px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", borderRadius: "0 16px 0 80px", background: `${color}10` }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)" }}>{label}</p>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d={icon}/></svg>
        </div>
      </div>
      <div>
        <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--white)", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: "0.78rem", color: "var(--slate)", marginTop: "4px" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
          Admin <span className="text-gold-gradient">Dashboard</span>
        </h1>
        <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Overview of the Avaada Auction Platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <StatCard label="Total Vendors" value={stats.totalVendors} sub="Registered companies" color="#c9a84c"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        <StatCard label="Pending Approval" value={stats.pendingVendors} sub="Awaiting review" color="#e09a2a"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Total Auctions" value={stats.totalAuctions} sub="All time" color="#3db87a"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <StatCard label="Active Auctions" value={stats.activeAuctions} sub="Live right now" color="#5b8af5"
          icon="M13 10V3L4 14h7v7l9-11h-7z" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "14px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/vendors" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "10px",
            background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
            color: "var(--gold)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none",
            transition: "all 0.2s ease",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Review Pending Vendors {stats.pendingVendors > 0 && `(${stats.pendingVendors})`}
          </Link>
          <Link href="/admin/users" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "10px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--slate-light)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}
