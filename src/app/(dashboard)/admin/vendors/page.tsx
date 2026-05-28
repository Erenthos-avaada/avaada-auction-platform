import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const vendors = await prisma.vendor.findMany({
    where: status ? { status: status as any } : {},
    include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  const counts = await prisma.vendor.groupBy({ by: ["status"], _count: true });
  const cm: any = {};
  counts.forEach((c: any) => { cm[c.status] = c._count; });

  const filters = [
    { label: "All",        value: "",            count: vendors.length },
    { label: "Pending",    value: "PENDING",     count: cm.PENDING     || 0 },
    { label: "Approved",   value: "APPROVED",    count: cm.APPROVED    || 0 },
    { label: "Rejected",   value: "REJECTED",    count: cm.REJECTED    || 0 },
    { label: "Blacklisted",value: "BLACKLISTED", count: cm.BLACKLISTED || 0 },
  ];

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Vendor <span>Management</span></h1>
        <p className="page-sub">{vendors.length} vendors</p>
      </div>

      <div className="anim-up d1" style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <Link key={f.value} href={f.value ? `/admin/vendors?status=${f.value}` : "/admin/vendors"} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 500, textDecoration: "none", transition: "all 0.15s",
            background: (status || "") === f.value ? "var(--accent-bg)" : "var(--bg3)",
            border:     (status || "") === f.value ? "1px solid var(--border2)" : "1px solid var(--border)",
            color:      (status || "") === f.value ? "var(--accent)" : "var(--text2)",
          }}>{f.label} <span style={{ opacity: 0.6 }}>({f.count})</span></Link>
        ))}
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        {vendors.length === 0
          ? <p style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No vendors found.</p>
          : <table className="tbl">
              <thead><tr><th>Company</th><th>Email</th><th>GST</th><th>Categories</th><th>Status</th><th>Registered</th><th></th></tr></thead>
              <tbody>
                {vendors.map((v: any) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{v.companyName}</td>
                    <td style={{ fontSize: "0.8rem" }}>{v.user.email}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{v.gstNumber || "—"}</td>
                    <td style={{ fontSize: "0.78rem" }}>{v.categories.slice(0,2).join(", ")}{v.categories.length > 2 ? ` +${v.categories.length-2}` : ""}</td>
                    <td><span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                    <td style={{ fontSize: "0.75rem", fontFamily: "'DM Mono',monospace" }}>{new Date(v.user.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                    <td><Link href={`/admin/vendors/${v.id}`} style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Manage →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
