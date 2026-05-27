"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorActions({ vendorId, currentStatus }: { vendorId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const updateStatus = async (status: string) => {
    setLoading(status);
    await fetch(`/api/vendors/${vendorId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading("");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {currentStatus !== "APPROVED" && (
        <button onClick={() => updateStatus("APPROVED")} disabled={!!loading} style={{
          padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(61,184,122,0.4)",
          background: "rgba(61,184,122,0.1)", color: "#3db87a", fontSize: "0.82rem",
          fontWeight: 600, cursor: "pointer",
        }}>
          {loading === "APPROVED" ? "..." : "✓ Approve"}
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button onClick={() => updateStatus("REJECTED")} disabled={!!loading} style={{
          padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(224,82,82,0.4)",
          background: "rgba(224,82,82,0.1)", color: "#e05252", fontSize: "0.82rem",
          fontWeight: 600, cursor: "pointer",
        }}>
          {loading === "REJECTED" ? "..." : "✗ Reject"}
        </button>
      )}
      {currentStatus !== "BLACKLISTED" && (
        <button onClick={() => updateStatus("BLACKLISTED")} disabled={!!loading} style={{
          padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(224,82,82,0.2)",
          background: "transparent", color: "#ff6060", fontSize: "0.82rem",
          fontWeight: 600, cursor: "pointer",
        }}>
          {loading === "BLACKLISTED" ? "..." : "⊘ Blacklist"}
        </button>
      )}
    </div>
  );
}
