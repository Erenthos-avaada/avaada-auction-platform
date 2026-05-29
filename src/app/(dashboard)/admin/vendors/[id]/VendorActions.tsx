"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTION_CONFIG: Record<string, { label: string; confirmTitle: string; confirmMsg: string; btnClass: string; btnStyle?: React.CSSProperties }> = {
  APPROVED: {
    label: "✓ Approve",
    confirmTitle: "Re-approve this vendor?",
    confirmMsg: "The vendor will regain full platform access and be notified by email.",
    btnClass: "btn btn-success",
  },
  REJECTED: {
    label: "✗ Reject",
    confirmTitle: "Reject this vendor?",
    confirmMsg: "The vendor will lose access to all auctions and be notified by email.",
    btnClass: "btn btn-danger",
  },
  BLACKLISTED: {
    label: "⊘ Blacklist",
    confirmTitle: "Blacklist this vendor?",
    confirmMsg: "The vendor will be permanently banned from the platform and notified by email.",
    btnClass: "btn btn-ghost",
    btnStyle: { color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)" },
  },
};

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

  // Show all actions except the current status
  const availableActions = Object.keys(ACTION_CONFIG).filter(s => s !== currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {availableActions.map(action => {
          const cfg = ACTION_CONFIG[action];
          return (
            <button key={action} onClick={() => setConfirm(action)} disabled={!!loading}
              className={cfg.btnClass} style={{ fontSize: "0.8rem", padding: "8px 16px", ...cfg.btnStyle }}>
              {loading === action ? "…" : cfg.label}
            </button>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="anim-in" style={{
          background: confirm === "APPROVED" ? "rgba(52,211,100,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${confirm === "APPROVED" ? "rgba(52,211,100,0.25)" : "rgba(248,113,113,0.25)"}`,
          borderRadius: "var(--radius-md)", padding: "14px 16px", maxWidth: "360px",
        }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text)", marginBottom: "4px", fontWeight: 600 }}>
            {ACTION_CONFIG[confirm].confirmTitle}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text2)", marginBottom: "12px" }}>
            {ACTION_CONFIG[confirm].confirmMsg}
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setConfirm("")} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              Cancel
            </button>
            <button onClick={() => update(confirm)} disabled={!!loading}
              className={confirm === "APPROVED" ? "btn btn-success" : "btn btn-danger"}
              style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              {loading ? "…" : `Confirm`}
            </button>
          </div>
        </div>
      )}

      {/* Status hint */}
      <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
        {currentStatus === "APPROVED"   && "Rejecting or blacklisting will revoke this vendor's platform access"}
        {currentStatus === "REJECTED"   && "You can re-approve this vendor to restore their access"}
        {currentStatus === "BLACKLISTED"&& "You can re-approve this vendor to restore their access"}
        {currentStatus === "PENDING"    && "Review vendor details before approving or rejecting"}
      </p>
    </div>
  );
}
