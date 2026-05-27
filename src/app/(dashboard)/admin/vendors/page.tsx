import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const where = status ? { status: status as any } : {};
  const vendors = await prisma.vendor.findMany({
    where, include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.vendor.groupBy({ by: ["status"], _count: true });
  const countMap: any = {};
  counts.forEach((c: any) => { countMap[c.status] = c._count; });

  const filters = [
    { label: "All", value: "" },
    { label: `Pending (${countMap.PENDING || 0})`, value: "PENDING" },
    { label: `Approved (${countMap.APPROVED || 0})`, value: "APPROVED" },
    { label: `Rejected (${countMap.REJECTED || 0})`, value: "REJECTED" },
    { label: `Blacklisted (${countMap.BLACKLISTED || 0})`, value: "BLACKLISTED" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "4px" }}>
            Vendor <span className="text-gold-gradient">Management</span>
          </h1>
          <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>{vendors.length} vendors found</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <Link key={f.value} href={f.value ? `/admin/vendors?status=${f.value}` : "/admin/vendors"} style={{
            padding: "7px 16px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 500,
            textDecoration: "none", transition: "all 0.2s ease",
            background: (status || "") === f.value ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
            border: (status || "") === f.value ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.08)",
            color: (status || "") === f.value ? "var(--gold)" : "var(--slate-light)",
          }}>{f.label}</Link>
        ))}
      </div>

      <div style={{ background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "16px", overflow: "hidden" }}>
        {vendors.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--slate)" }}>No vendors found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>GST</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: "var(--white)" }}>{v.companyName}</td>
                  <td>{v.user.email}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem" }}>{v.gstNumber || "—"}</td>
                  <td style={{ fontSize: "0.78rem" }}>{v.categories.slice(0, 2).join(", ")}{v.categories.length > 2 ? ` +${v.categories.length - 2}` : ""}</td>
                  <td><span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                  <td style={{ fontSize: "0.78rem" }}>{new Date(v.user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>
                    <Link href={`/admin/vendors/${v.id}`} style={{ fontSize: "0.78rem", color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
