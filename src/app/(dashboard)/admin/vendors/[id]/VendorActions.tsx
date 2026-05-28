"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorActions({ vendorId, currentStatus }: { vendorId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const update = async (status: string) => {
    setLoading(status);
    await fetch(`/api/vendors/${vendorId}/approve`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setLoading(""); router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {currentStatus !== "APPROVED"    && <button onClick={() => update("APPROVED")}    disabled={!!loading} className="btn btn-success" style={{ fontSize: "0.8rem", padding: "8px 14px" }}>{loading === "APPROVED"    ? "…" : "✓ Approve"}</button>}
      {currentStatus !== "REJECTED"    && <button onClick={() => update("REJECTED")}    disabled={!!loading} className="btn btn-danger"  style={{ fontSize: "0.8rem", padding: "8px 14px" }}>{loading === "REJECTED"    ? "…" : "✗ Reject"}</button>}
      {currentStatus !== "BLACKLISTED" && <button onClick={() => update("BLACKLISTED")} disabled={!!loading} className="btn btn-ghost"   style={{ fontSize: "0.8rem", padding: "8px 14px", color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)" }}>{loading === "BLACKLISTED" ? "…" : "⊘ Blacklist"}</button>}
    </div>
  );
}
