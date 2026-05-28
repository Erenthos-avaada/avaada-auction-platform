import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);
  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.id as string } });

  if (!vendor || vendor.status === "PENDING") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: "380px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--accent-bg)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>Registration Under Review</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.7 }}>Your application is being reviewed by the Avaada procurement team. You'll be notified once approved.</p>
      </div>
    </div>
  );

  const [myBids, invites, recentBids] = await Promise.all([
    prisma.bid.count({ where: { vendorId: vendor.id } }),
    prisma.auctionInvite.count({ where: { vendorId: vendor.id } }),
    prisma.bid.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: "desc" }, take: 5, include: { auction: { select: { title: true, status: true, endTime: true } } } }),
  ]);

  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="anim-up" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Welcome, <span>{vendor.companyName}</span></h1>
        <p className="page-sub">Your vendor dashboard</p>
      </div>

      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px", marginBottom: "24px" }}>
        <div className="stat-card"><p className="stat-label">My Bids</p><p className="stat-val" style={{ color: "var(--accent)" }}>{myBids}</p></div>
        <div className="stat-card"><p className="stat-label">Auction Invites</p><p className="stat-val" style={{ color: "var(--info)" }}>{invites}</p></div>
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Recent Bids</p>
          <Link href="/vendor/my-bids" style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
        </div>
        {recentBids.length === 0
          ? <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "var(--text3)", marginBottom: "12px", fontSize: "0.85rem" }}>No bids placed yet</p>
              <Link href="/vendor/auctions" className="btn btn-primary" style={{ fontSize: "0.82rem" }}>Browse Auctions</Link>
            </div>
          : <table className="tbl">
              <thead><tr><th>Auction</th><th>Amount</th><th>Status</th><th>Closes</th></tr></thead>
              <tbody>
                {recentBids.map((b: any) => (
                  <tr key={b.id}>
                    <td><Link href={`/vendor/auctions/${b.auctionId}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>{b.auction.title}</Link></td>
                    <td style={{ color: "var(--accent)", fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>₹{b.amount.toLocaleString("en-IN")}</td>
                    <td><span className={`badge badge-${b.auction.status.toLowerCase()}`}>{b.auction.status}</span></td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem" }}>{new Date(b.auction.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
