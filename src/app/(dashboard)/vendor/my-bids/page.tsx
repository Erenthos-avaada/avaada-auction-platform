import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function MyBidsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);
  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.id as string } });

  if (!vendor) return <p style={{ color: "var(--text3)" }}>Vendor not found.</p>;

  const bids = await prisma.bid.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    include: { auction: { select: { id: true, title: true, status: true, endTime: true, auctionType: true, itemDescription: true } } },
  });

  // Group by auction, keep only lowest per auction
  const auctionMap: Record<string, any> = {};
  bids.forEach((b: any) => {
    if (!auctionMap[b.auctionId] || b.amount < auctionMap[b.auctionId].amount) {
      auctionMap[b.auctionId] = b;
    }
  });
  const bestBids = Object.values(auctionMap);

  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">My <span>Bids</span></h1>
        <p className="page-sub">{bids.length} total bids across {bestBids.length} auctions</p>
      </div>

      <div className="anim-up d1 surface" style={{ overflow: "hidden" }}>
        {bestBids.length === 0
          ? <p style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No bids placed yet.</p>
          : <table className="tbl">
              <thead><tr><th>Auction</th><th>Type</th><th>My Best Bid</th><th>Total Bids</th><th>Status</th><th>Closes</th><th></th></tr></thead>
              <tbody>
                {bestBids.map((b: any) => (
                  <tr key={b.auctionId}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{b.auction.title}</td>
                    <td>{b.auction.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: "var(--accent)" }}>₹{b.amount.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "center" }}>{bids.filter((x: any) => x.auctionId === b.auctionId).length}</td>
                    <td><span className={`badge badge-${b.auction.status.toLowerCase()}`}>{b.auction.status}</span></td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{new Date(b.auction.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td><Link href={`/vendor/auctions/${b.auctionId}`} style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
