"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: Record<string, { href: string; label: string; icon: string }[]> = {
  ADMIN: [
    { href: "/admin",         label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin/vendors", label: "Vendors",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { href: "/admin/users",   label: "Users",     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { href: "/admin/themes",  label: "Themes",    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  ],
  PROCUREMENT: [
    { href: "/procurement",              label: "Dashboard",   icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/procurement/auctions",     label: "Auctions",    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { href: "/procurement/auctions/new", label: "New Auction", icon: "M12 4v16m8-8H4" },
    { href: "/procurement/reports",      label: "Reports",     icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ],
  VENDOR: [
    { href: "/vendor",          label: "Dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/vendor/auctions", label: "My Auctions",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { href: "/vendor/my-bids",  label: "My Bids",      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/vendor/profile",  label: "My Profile",   icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ],
};

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({ role, name, email }: { role: string; name: string; email: string }) {
  const pathname = usePathname();
  const links    = NAV[role] || [];

  const isActive = (href: string) =>
    href === "/admin" || href === "/procurement" || href === "/vendor"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside style={{ width: "220px", minWidth: "220px", height: "100vh", background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>

      {/* Brand */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--accent-bg)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>Avaada</p>
            <p style={{ fontSize: "0.62rem", color: "var(--text3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Auctions</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", padding: "0 6px", marginBottom: "6px", marginTop: "2px" }}>Menu</p>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? "active" : ""}`}>
            <Icon d={l.icon} />
            {l.label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--bg3)", marginBottom: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent-bg)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
            {(name || email || "?")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "User"}</p>
            <p style={{ fontSize: "0.67rem", color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
          </div>
        </div>
        <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
          className="btn btn-ghost" style={{ width: "100%", fontSize: "0.78rem", padding: "8px", justifyContent: "center", gap: "6px", color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
