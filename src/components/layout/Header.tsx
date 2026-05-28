"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export default function Header({ role, name }: { role: string; name: string }) {
  const { notifications, count } = useNotifications();
  const [open, setOpen] = useState(false);
  const roleLabel = { ADMIN: "Administrator", PROCUREMENT: "Procurement Officer", VENDOR: "Vendor" }[role] || role;

  return (
    <header style={{ height: "56px", minHeight: "56px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{roleLabel} Portal</p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen(!open)} style={{ width: "34px", height: "34px", borderRadius: "var(--radius-sm)", background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text2)", position: "relative", transition: "all 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border2)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            {count > 0 && <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "16px", height: "16px", borderRadius: "50%", background: "var(--accent)", color: "var(--bg)", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{count > 9 ? "9+" : count}</span>}
          </button>
          {open && (
            <div className="anim-in" style={{ position: "absolute", top: "42px", right: 0, width: "300px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)", zIndex: 100, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>Notifications</span>
                {count > 0 && <span style={{ fontSize: "0.72rem", color: "var(--accent)" }}>{count} unread</span>}
              </div>
              {notifications.length === 0
                ? <p style={{ padding: "20px", textAlign: "center", fontSize: "0.8rem", color: "var(--text3)" }}>No notifications</p>
                : notifications.slice(0, 5).map((n: any) => (
                  <div key={n.id} style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <p style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 500 }}>{n.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text2)", marginTop: "2px" }}>{n.message}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* User pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "5px 10px 5px 5px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "999px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent-bg)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)" }}>
            {(name || "?")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text2)", fontWeight: 500 }}>{name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
