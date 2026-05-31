import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function VendorAuctionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);
  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.id as string } });

  if (!vendor || vendor.status !== "APPROVED") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <p style={{ color: "var(--text3)", fontSize: "0.85rem" }}>Your account is pending approval.</p>
      </div>
    );
  }

  const invites = await prisma.auctionInvite.findMany({
    where: { vendorId: vendor.id },
    include: {
      auction: {
        include: { _count: { select: { bids: true } } }
      }
    },
    orderBy: { sentAt: "desc" },
  });

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">My <span>Auctions</span></h1>
        <p className="page-sub">Auctions you have been invited to participate in</p>
      </div>

      <div className="anim-up d1 surface" style={{ overflow: "hidden" }}>
        {invites.length === 0
          ? <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text3)", fontSize: "0.85rem" }}>No auction invitations yet.</p>
              <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: "6px" }}>The procurement team will invite you when relevant auctions are published.</p>
            </div>
          : <table className="tbl">
              <thead><tr><th>Auction</th><th>Type</th><th>Description</th><th>Status</th><th>Bids</th><th>Closes</th><th></th></tr></thead>
              <tbody>
                {invites.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{inv.auction.title}</td>
                    <td>{inv.auction.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem" }}>{inv.auction.itemDescription || "—"}</td>
                    <td><span className={`badge badge-${inv.auction.status.toLowerCase()}`}>{inv.auction.status}</span></td>
                    <td style={{ textAlign: "center" }}>{inv.auction._count.bids}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{new Date(inv.auction.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" , timeZone: "Asia/Kolkata"})}</td>
                    <td>
                      {inv.auction.status === "ACTIVE"
                        ? <Link href={`/vendor/auctions/${inv.auction.id}`} className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>Bid Now →</Link>
                        : <Link href={`/vendor/auctions/${inv.auction.id}`} style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>View →</Link>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
