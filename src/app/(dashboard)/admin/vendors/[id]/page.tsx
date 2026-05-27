import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VendorActions from "./VendorActions";

export const dynamic = "force-dynamic";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { user: true, bids: { orderBy: { createdAt: "desc" }, take: 10, include: { auction: { select: { title: true } } } } }
  });
  if (!vendor) notFound();

  const fields = [
    { label: "Company Name", value: vendor.companyName },
    { label: "GST Number", value: vendor.gstNumber || "—" },
    { label: "PAN Number", value: vendor.panNumber || "—" },
    { label: "Bank Name", value: vendor.bankName || "—" },
    { label: "Account Number", value: vendor.bankAccount || "—" },
    { label: "IFSC Code", value: vendor.bankIfsc || "—" },
    { label: "Email", value: vendor.user.email },
    { label: "Categories", value: vendor.categories.join(", ") || "—" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
            {vendor.companyName}
          </h1>
          <span className={`badge badge-${vendor.status.toLowerCase()}`}>{vendor.status}</span>
        </div>
        <VendorActions vendorId={vendor.id} currentStatus={vendor.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "16px" }}>Company Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {fields.map(f => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{f.label}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--white)", fontWeight: 500 }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "16px" }}>Recent Bids ({vendor.bids.length})</h2>
          {vendor.bids.length === 0 ? (
            <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>No bids placed yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {vendor.bids.map((b: any) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--slate-light)" }}>{b.auction.title}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: 600 }}>₹{b.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
