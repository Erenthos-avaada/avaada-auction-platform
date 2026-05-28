import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [auctions, totalBids, vendors] = await Promise.all([
    prisma.auction.findMany({
      where: { status: { in: ["CLOSED", "ACTIVE"] } },
      orderBy: { endTime: "desc" },
      include: {
        _count: { select: { bids: true, invites: true } },
        bids: { orderBy: { amount: "asc" }, take: 1, include: { vendor: { select: { companyName: true } } } },
      },
    }),
    prisma.bid.count(),
    prisma.vendor.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Auction <span>Reports</span></h1>
        <p className="page-sub">Participation and performance summary</p>
      </div>

      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "24px" }}>
        <div className="stat-card"><p className="stat-label">Closed Auctions</p><p className="stat-val" style={{ color: "var(--accent)" }}>{auctions.filter((a: any) => a.status === "CLOSED").length}</p></div>
        <div className="stat-card"><p className="stat-label">Total Bids</p><p className="stat-val" style={{ color: "var(--info)" }}>{totalBids}</p></div>
        <div className="stat-card"><p className="stat-label">Active Vendors</p><p className="stat-val" style={{ color: "var(--success)" }}>{vendors}</p></div>
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Auction Summary</p>
        </div>
        {auctions.length === 0
          ? <p style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No closed auctions yet.</p>
          : <table className="tbl">
              <thead><tr><th>Auction</th><th>Category</th><th>Status</th><th>Bids</th><th>Invites</th><th>Lowest Bid</th><th>Leading Vendor</th></tr></thead>
              <tbody>
                {auctions.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)", maxWidth: "180px" }}>{a.title}</td>
                    <td>{a.category}</td>
                    <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                    <td style={{ textAlign: "center" }}>{a._count.bids}</td>
                    <td style={{ textAlign: "center" }}>{a._count.invites}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>{a.bids[0] ? `₹${a.bids[0].amount.toLocaleString("en-IN")}` : "—"}</td>
                    <td style={{ fontSize: "0.8rem" }}>{a.bids[0]?.vendor.companyName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
