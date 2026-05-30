import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuctionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const auctions = await prisma.auction.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bids: true } }, items: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const counts = await prisma.auction.groupBy({ by: ["status"], _count: true });
  const cm: any = {};
  counts.forEach((c: any) => { cm[c.status] = c._count; });

  const filters = [
    { label: "All",       value: "" },
    { label: "Active",    value: "ACTIVE" },
    { label: "Draft",     value: "DRAFT" },
    { label: "Closed",    value: "CLOSED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Auctions</h1>
          <p className="page-sub">{auctions.length} auctions</p>
        </div>
        <Link href="/procurement/auctions/new" className="btn btn-primary" style={{ fontSize: "0.82rem" }}>+ New Auction</Link>
      </div>

      <div className="anim-up d1" style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <Link key={f.value} href={f.value ? `/procurement/auctions?status=${f.value}` : "/procurement/auctions"} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 500, textDecoration: "none", transition: "all 0.15s",
            background: (status || "") === f.value ? "var(--accent-bg)" : "var(--bg3)",
            border:     (status || "") === f.value ? "1px solid var(--border2)" : "1px solid var(--border)",
            color:      (status || "") === f.value ? "var(--accent)" : "var(--text2)",
          }}>{f.label} {cm[f.value] ? `(${cm[f.value]})` : ""}</Link>
        ))}
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        {auctions.length === 0
          ? <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text3)", marginBottom: "14px", fontSize: "0.85rem" }}>No auctions found</p>
              <Link href="/procurement/auctions/new" className="btn btn-primary" style={{ fontSize: "0.82rem" }}>Create First Auction</Link>
            </div>
          : <table className="tbl">
              <thead><tr><th>Title</th><th>Type</th><th>Description</th><th>Status</th><th>Bids</th><th>Closes</th><th></th></tr></thead>
              <tbody>
                {auctions.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>
                      <Link href={`/procurement/auctions/${a.id}`} style={{ color: "inherit", textDecoration: "none" }}>{a.title}</Link>
                    </td>
                    <td><span style={{ fontSize: "0.72rem", color: "var(--text2)", background: "var(--bg3)", padding: "2px 8px", borderRadius: "999px", border: "1px solid var(--border)" }}>{a.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text2)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.itemDescription || "—"}</td>
                    <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                    <td style={{ textAlign: "center" }}>{a._count.bids}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{new Date(a.endTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td><Link href={`/procurement/auctions/${a.id}`} style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}>View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
