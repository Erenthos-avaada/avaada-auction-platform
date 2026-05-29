"use client";
import { useState } from "react";
import Link from "next/link";

type Status = "" | "PENDING" | "APPROVED" | "REJECTED" | "BLACKLISTED";

export default function VendorsClient({ vendors }: { vendors: any[] }) {
  const [filter, setFilter] = useState<Status>("");

  const filtered = filter ? vendors.filter(v => v.status === filter) : vendors;

  const count = (s: Status) => s ? vendors.filter(v => v.status === s).length : vendors.length;

  const filters: { label: string; value: Status }[] = [
    { label: "All",         value: ""            },
    { label: "Pending",     value: "PENDING"     },
    { label: "Approved",    value: "APPROVED"    },
    { label: "Rejected",    value: "REJECTED"    },
    { label: "Blacklisted", value: "BLACKLISTED" },
  ];

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Vendor <span>Management</span></h1>
        <p className="page-sub">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Instant client-side filter tabs */}
      <div className="anim-up d1" style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 500,
            cursor: "pointer", transition: "all 0.15s", border: "none",
            background: filter === f.value ? "var(--accent-bg)" : "var(--bg3)",
            outline: filter === f.value ? "1px solid var(--border2)" : "1px solid var(--border)",
            color: filter === f.value ? "var(--accent)" : "var(--text2)",
          }}>
            {f.label} <span style={{ opacity: 0.6 }}>({count(f.value)})</span>
          </button>
        ))}
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        {filtered.length === 0
          ? <p style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No vendors found.</p>
          : <table className="tbl">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Email</th>
                  <th>GST</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v: any) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{v.companyName}</td>
                    <td style={{ fontSize: "0.8rem" }}>{v.user.email}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>{v.gstNumber || "—"}</td>
                    <td style={{ fontSize: "0.78rem" }}>
                      {v.categories.slice(0, 2).join(", ")}
                      {v.categories.length > 2 ? ` +${v.categories.length - 2}` : ""}
                      {v.categories.length === 0 ? "—" : ""}
                    </td>
                    <td><span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                    <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem" }}>
                      {new Date(v.user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <Link href={`/admin/vendors/${v.id}`} style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                        Manage →
                      </Link>
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
