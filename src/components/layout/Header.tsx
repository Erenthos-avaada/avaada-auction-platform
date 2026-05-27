"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export default function Header({ role, name }: { role: string; name: string }) {
  const { notifications, count } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  const roleLabel = role === "ADMIN" ? "Administrator" : role === "PROCUREMENT" ? "Procurement Officer" : "Vendor";

  return (
    <header style={{
      height: "64px", minHeight: "64px",
      background: "var(--navy-800)",
      borderBottom: "1px solid rgba(201,168,76,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", position: "relative",
    }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "var(--slate)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {roleLabel} Portal
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowNotifs(!showNotifs)} style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--slate-light)", position: "relative",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {count > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                width: "18px", height: "18px", borderRadius: "50%",
                background: "var(--gold)", color: "var(--navy)",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{count > 9 ? "9+" : count}</span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div style={{
              position: "absolute", top: "48px", right: 0, width: "320px",
              background: "var(--navy-700)", border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "12px", boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              zIndex: 100, overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--white)" }}>Notifications</p>
                {count > 0 && <span style={{ fontSize: "0.7rem", color: "var(--gold)" }}>{count} unread</span>}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--slate)", fontSize: "0.82rem" }}>
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((n: any) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <p style={{ fontSize: "0.82rem", color: "var(--white)", fontWeight: 500 }}>{n.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--slate)", marginTop: "2px" }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "6px 12px 6px 6px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.1)",
          borderRadius: "999px",
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 700, color: "var(--navy)",
          }}>
            {(name || "?")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--slate-light)", fontWeight: 500 }}>{name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
