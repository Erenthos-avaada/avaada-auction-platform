"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "APPROVED" | "REJECTED" | "BLACKLISTED";

const CONFIG: Record<Action, { label: string; confirmTitle: string; confirmMsg: string; btnClass: string; btnStyle?: React.CSSProperties }> = {
  APPROVED: {
    label: "✓ Approve",
    confirmTitle: "Re-approve this vendor?",
    confirmMsg: "The vendor will regain full platform access and be notified by email.",
    btnClass: "btn btn-success",
  },
  REJECTED: {
    label: "✗ Reject",
    confirmTitle: "Reject this vendor?",
    confirmMsg: "The vendor will lose platform access. They can re-apply with a new application.",
    btnClass: "btn btn-danger",
  },
  BLACKLISTED: {
    label: "⊘ Blacklist",
    confirmTitle: "Blacklist this vendor?",
    confirmMsg: "This is a permanent ban. The vendor will never be able to re-apply or access the platform again.",
    btnClass: "btn btn-ghost",
    btnStyle: { color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)" },
  },
};

const HINT: Record<string, string> = {
  PENDING:     "Review vendor details before approving or rejecting.",
  APPROVED:    "Rejecting allows reapplication. Blacklisting is permanent.",
  REJECTED:    "This vendor can re-apply. You may re-approve them if eligible.",
  BLACKLISTED: "This vendor is permanently banned and cannot re-apply or be re-approved.",
};

export default function VendorActions({ vendorId, currentStatus }: { vendorId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [confirm, setConfirm] = useState<Action | "">("");
  const [apiError, setApiError] = useState("");

  const update = async (status: Action) => {
    setLoading(status); setConfirm(""); setApiError("");
    const res = await fetch(`/api/vendors/${vendorId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setApiError(data.error || "Action failed.");
    }
    setLoading("");
    router.refresh();
  };

  // Blacklisted vendors cannot be re-approved — only show Reject for blacklisted
  const availableActions: Action[] = currentStatus === "BLACKLISTED"
    ? ["REJECTED"]
    : (["APPROVED", "REJECTED", "BLACKLISTED"] as Action[]).filter(s => s !== currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {availableActions.map(action => (
          <button key={action} onClick={() => setConfirm(action)} disabled={!!loading}
            className={CONFIG[action].btnClass}
            style={{ fontSize: "0.8rem", padding: "8px 16px", ...CONFIG[action].btnStyle }}>
            {loading === action ? "…" : CONFIG[action].label}
          </button>
        ))}
      </div>

      {/* API error */}
      {apiError && (
        <p style={{ fontSize: "0.75rem", color: "var(--danger)" }}>{apiError}</p>
      )}

      {/* Confirmation dialog */}
      {confirm && (
        <div className="anim-in" style={{
          background: confirm === "APPROVED" ? "rgba(52,211,100,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${confirm === "APPROVED" ? "rgba(52,211,100,0.25)" : "rgba(248,113,113,0.25)"}`,
          borderRadius: "var(--radius-md)", padding: "14px 16px", maxWidth: "360px",
        }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text)", marginBottom: "4px", fontWeight: 600 }}>
            {CONFIG[confirm].confirmTitle}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text2)", marginBottom: "12px" }}>
            {CONFIG[confirm].confirmMsg}
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setConfirm("")} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              Cancel
            </button>
            <button onClick={() => update(confirm)} disabled={!!loading}
              className={confirm === "APPROVED" ? "btn btn-success" : "btn btn-danger"}
              style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              {loading ? "…" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* Context hint */}
      <p style={{ fontSize: "0.72rem", color: currentStatus === "BLACKLISTED" ? "var(--danger)" : "var(--text3)", maxWidth: "360px", textAlign: "right" }}>
        {HINT[currentStatus] || ""}
      </p>
    </div>
  );
}
