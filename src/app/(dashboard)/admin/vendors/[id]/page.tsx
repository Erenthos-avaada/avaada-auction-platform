import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VendorActions from "./VendorActions";

export const dynamic = "force-dynamic";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { user: true, bids: { orderBy: { createdAt: "desc" }, take: 8, include: { auction: { select: { title: true } } } } }
  });
  if (!vendor) notFound();

  const fields = [
    ["Company",        vendor.companyName],
    ["GST Number",     vendor.gstNumber   || "—"],
    ["PAN Number",     vendor.panNumber   || "—"],
    ["Bank Name",      vendor.bankName    || "—"],
    ["Account No.",    vendor.bankAccount || "—"],
    ["IFSC Code",      vendor.bankIfsc    || "—"],
    ["Email",          vendor.user.email],
    ["Categories",     vendor.categories.join(", ") || "—"],
  ];

  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="anim-up" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title">{vendor.companyName}</h1>
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <span className={`badge badge-${vendor.status.toLowerCase()}`}>{vendor.status}</span>
          </div>
        </div>
        <VendorActions vendorId={vendor.id} currentStatus={vendor.status} />
      </div>

      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="surface" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "14px" }}>Company Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {fields.map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{l}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "14px" }}>Recent Bids ({vendor.bids.length})</p>
          {vendor.bids.length === 0
            ? <p style={{ color: "var(--text3)", fontSize: "0.82rem" }}>No bids placed yet.</p>
            : vendor.bids.map((b: any) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{b.auction.title}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>₹{b.amount.toLocaleString("en-IN")}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
