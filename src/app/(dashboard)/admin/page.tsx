import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalVendors, pendingVendors, totalAuctions, activeAuctions] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { status: "PENDING" } }),
    prisma.auction.count(),
    prisma.auction.count({ where: { status: "ACTIVE" } }),
  ]);
  return { totalVendors, pendingVendors, totalAuctions, activeAuctions };
}

export default async function AdminDashboard() {
  const s = await getStats();
  const stats = [
    { label: "Total Vendors",    value: s.totalVendors,  sub: "Registered",    accent: "var(--accent)" },
    { label: "Pending Approval", value: s.pendingVendors, sub: "Needs review",  accent: "var(--warning)" },
    { label: "Total Auctions",   value: s.totalAuctions,  sub: "All time",      accent: "var(--info)" },
    { label: "Active Now",       value: s.activeAuctions, sub: "Live auctions", accent: "var(--success)" },
  ];

  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="anim-up" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Platform overview and quick actions</p>
      </div>

      {/* Stats */}
      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "28px" }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-val" style={{ color: s.accent }}>{s.value}</p>
            <p className="stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="anim-up d2 surface" style={{ padding: "20px 24px" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "14px" }}>Quick Actions</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/vendors?status=PENDING" className="btn btn-primary" style={{ fontSize: "0.82rem", padding: "9px 16px" }}>
            Review Pending {s.pendingVendors > 0 && `(${s.pendingVendors})`}
          </Link>
          <Link href="/admin/vendors" className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "9px 16px" }}>All Vendors</Link>
          <Link href="/admin/users"   className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "9px 16px" }}>Manage Users</Link>
          <Link href="/admin/themes"  className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "9px 16px" }}>Change Theme</Link>
        </div>
      </div>
    </div>
  );
}
