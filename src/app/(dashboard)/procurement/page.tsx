import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProcurementDashboard() {
  const [active, draft, closed, totalBids, recent] = await Promise.all([
    prisma.auction.count({ where: { status: "ACTIVE" } }),
    prisma.auction.count({ where: { status: "DRAFT" } }),
    prisma.auction.count({ where: { status: "CLOSED" } }),
    prisma.bid.count(),
    prisma.auction.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { bids: true } }, items: false } }),
  ]);

  const stats = [
    { label: "Active",     value: active,    accent: "var(--success)" },
    { label: "Draft",      value: draft,     accent: "var(--warning)" },
    { label: "Closed",     value: closed,    accent: "var(--text2)"   },
    { label: "Total Bids", value: totalBids, accent: "var(--info)"    },
  ];

  return (
    <div style={{ maxWidth: "960px" }}>
      <div className="anim-up" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Manage your reverse auctions</p>
        </div>
        <Link href="/procurement/auctions/new" className="btn btn-primary" style={{ fontSize: "0.82rem" }}>+ New Auction</Link>
      </div>

      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-val" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Recent Auctions</p>
          <Link href="/procurement/auctions" style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
        </div>
        {recent.length === 0
          ? <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--text3)", marginBottom: "12px", fontSize: "0.85rem" }}>No auctions yet</p>
              <Link href="/procurement/auctions/new" className="btn btn-primary" style={{ fontSize: "0.82rem" }}>Create First Auction</Link>
            </div>
          : <table className="tbl">
              <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Bids</th><th>Closes</th></tr></thead>
              <tbody>
                {recent.map((a: any) => (
                  <tr key={a.id}>
                    <td><Link href={`/procurement/auctions/${a.id}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>{a.title}</Link></td>
                    <td>{a.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</td>
                    <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                    <td>{a._count.bids}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem" }}>{new Date(a.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
