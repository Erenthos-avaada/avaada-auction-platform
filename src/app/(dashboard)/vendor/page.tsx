import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function VendorDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);
  const userId = payload.id as string;

  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  const myBids = vendor ? await prisma.bid.count({ where: { vendorId: vendor.id } }) : 0;
  const myInvites = vendor ? await prisma.auctionInvite.count({ where: { vendorId: vendor.id } }) : 0;
  const recentBids = vendor ? await prisma.bid.findMany({
    where: { vendorId: vendor.id }, orderBy: { createdAt: "desc" }, take: 5,
    include: { auction: { select: { title: true, status: true, endTime: true } } }
  }) : [];

  if (!vendor || vendor.status === "PENDING") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "var(--white)", marginBottom: "10px" }}>Registration Under Review</h2>
          <p style={{ color: "var(--slate)", fontSize: "0.875rem", lineHeight: 1.6 }}>Your vendor registration is pending approval by the Avaada procurement team. You'll be notified once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
          Welcome, <span className="text-gold-gradient">{vendor.companyName}</span>
        </h1>
        <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Your vendor dashboard</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "My Bids", value: myBids, color: "#c9a84c" },
          { label: "Auction Invites", value: myInvites, color: "#3db87a" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--navy-700)", border: `1px solid ${s.color}22`, borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "10px" }}>{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--white)" }}>Recent Bids</h2>
          <Link href="/vendor/my-bids" style={{ fontSize: "0.8rem", color: "var(--gold)", textDecoration: "none" }}>View all →</Link>
        </div>
        {recentBids.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--slate)" }}>
            <p style={{ marginBottom: "12px" }}>No bids placed yet.</p>
            <Link href="/vendor/auctions" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "var(--gold)", fontSize: "0.82rem", textDecoration: "none" }}>Browse Auctions</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Auction</th><th>Amount</th><th>Status</th><th>Closes</th></tr></thead>
            <tbody>
              {recentBids.map((b: any) => (
                <tr key={b.id}>
                  <td><Link href={`/vendor/auctions/${b.auctionId}`} style={{ color: "var(--white)", textDecoration: "none", fontWeight: 500 }}>{b.auction.title}</Link></td>
                  <td style={{ color: "var(--gold)", fontWeight: 600 }}>₹{b.amount.toLocaleString("en-IN")}</td>
                  <td><span className={`badge badge-${b.auction.status.toLowerCase()}`}>{b.auction.status}</span></td>
                  <td style={{ fontSize: "0.8rem" }}>{new Date(b.auction.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
