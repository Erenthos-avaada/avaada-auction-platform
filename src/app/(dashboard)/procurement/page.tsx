import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [active, draft, closed, totalBids] = await Promise.all([
    prisma.auction.count({ where: { status: "ACTIVE" } }),
    prisma.auction.count({ where: { status: "DRAFT" } }),
    prisma.auction.count({ where: { status: "CLOSED" } }),
    prisma.bid.count(),
  ]);
  const recent = await prisma.auction.findMany({
    orderBy: { createdAt: "desc" }, take: 5,
    include: { _count: { select: { bids: true } } }
  });
  return { active, draft, closed, totalBids, recent };
}

export default async function ProcurementDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
          Procurement <span className="text-gold-gradient">Dashboard</span>
        </h1>
        <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Manage your reverse auctions and bids</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Active Auctions", value: stats.active, color: "#3db87a" },
          { label: "Draft Auctions", value: stats.draft, color: "#c9a84c" },
          { label: "Closed Auctions", value: stats.closed, color: "#8892a4" },
          { label: "Total Bids", value: stats.totalBids, color: "#5b8af5" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--navy-700)", border: `1px solid ${s.color}22`, borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "10px" }}>{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Auctions */}
      <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--white)" }}>Recent Auctions</h2>
          <Link href="/procurement/auctions" style={{ fontSize: "0.8rem", color: "var(--gold)", textDecoration: "none" }}>View all →</Link>
        </div>
        {stats.recent.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--slate)" }}>
            <p style={{ marginBottom: "12px" }}>No auctions yet.</p>
            <Link href="/procurement/auctions/new" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "8px",
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
              color: "var(--gold)", fontSize: "0.82rem", textDecoration: "none",
            }}>+ Create First Auction</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Bids</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((a: any) => (
                <tr key={a.id}>
                  <td><Link href={`/procurement/auctions/${a.id}`} style={{ color: "var(--white)", textDecoration: "none", fontWeight: 500 }}>{a.title}</Link></td>
                  <td>{a.category}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td>{a._count.bids}</td>
                  <td style={{ fontSize: "0.8rem" }}>{new Date(a.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
