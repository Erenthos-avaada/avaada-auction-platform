"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorActions({ vendorId, currentStatus }: { vendorId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [confirm, setConfirm] = useState("");

  const update = async (status: string) => {
    setLoading(status); setConfirm("");
    await fetch(`/api/vendors/${vendorId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading("");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>

      <div style={{ display: "flex", gap: "8px" }}>
        {currentStatus !== "APPROVED" && (
          <button onClick={() => update("APPROVED")} disabled={!!loading}
            className="btn btn-success" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>
            {loading === "APPROVED" ? "…" : "✓ Approve"}
          </button>
        )}
        {currentStatus !== "REJECTED" && (
          <button onClick={() => setConfirm("REJECTED")} disabled={!!loading}
            className="btn btn-danger" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>
            ✗ Reject
          </button>
        )}
        {currentStatus !== "BLACKLISTED" && (
          <button onClick={() => setConfirm("BLACKLISTED")} disabled={!!loading}
            className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 16px", color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⊘ Blacklist
          </button>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="anim-in" style={{
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: "var(--radius-md)", padding: "14px 16px", maxWidth: "340px", textAlign: "right",
        }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text)", marginBottom: "4px", fontWeight: 600 }}>
            {confirm === "REJECTED" ? "Reject this vendor?" : "Blacklist this vendor?"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text2)", marginBottom: "12px", textAlign: "left" }}>
            {confirm === "REJECTED"
              ? "The vendor will lose access to all auctions and be notified by email."
              : "The vendor will be permanently banned from the platform and notified by email."
            }
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setConfirm("")} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              Cancel
            </button>
            <button onClick={() => update(confirm)} disabled={!!loading} className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              {loading ? "…" : `Confirm ${confirm === "REJECTED" ? "Reject" : "Blacklist"}`}
            </button>
          </div>
        </div>
      )}

      {/* Status context hint */}
      {currentStatus === "APPROVED" && (
        <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
          Rejecting or blacklisting will revoke this vendor's platform access
        </p>
      )}
    </div>
  );
}
