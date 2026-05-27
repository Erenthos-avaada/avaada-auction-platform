"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/vendors", label: "Vendors", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/admin/users", label: "Users", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const procurementLinks = [
  { href: "/procurement", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/procurement/auctions", label: "Auctions", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/procurement/auctions/new", label: "New Auction", icon: "M12 4v16m8-8H4" },
  { href: "/procurement/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const vendorLinks = [
  { href: "/vendor", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/vendor/auctions", label: "My Auctions", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/vendor/my-bids", label: "My Bids", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/vendor/profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({ role, name, email }: { role: string; name: string; email: string }) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? adminLinks : role === "PROCUREMENT" ? procurementLinks : vendorLinks;
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "PROCUREMENT" ? "Procurement" : "Vendor";

  return (
    <aside style={{
      width: "240px", minWidth: "240px", height: "100vh",
      background: "var(--navy-800)",
      borderRight: "1px solid rgba(201,168,76,0.1)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 22H2L14 2Z" stroke="var(--navy)" strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--white)", lineHeight: 1.2 }}>
              <span className="text-gold-gradient">Avaada</span> Auctions
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--slate)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)", padding: "0 8px", marginBottom: "8px" }}>
          Navigation
        </p>
        {links.map(link => {
          const isActive = pathname === link.href || (link.href !== "/admin" && link.href !== "/procurement" && link.href !== "/vendor" && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={`sidebar-link ${isActive ? "active" : ""}`}>
              <NavIcon d={link.icon} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "10px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--navy-600), var(--navy-500))",
            border: "1px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 700, color: "var(--gold)",
          }}>
            {(name || email || "?")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "User"}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--slate)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST" style={{ marginTop: "8px" }}>
          <button type="submit" style={{
            width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(224,82,82,0.2)",
            background: "transparent", color: "#e05252", fontSize: "0.78rem", fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(224,82,82,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
