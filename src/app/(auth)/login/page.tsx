"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "24px" }}>
      <div className="geo-bg" />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "60px", height: "60px", borderRadius: "16px", marginBottom: "20px",
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
            boxShadow: "0 8px 32px rgba(201,168,76,0.25)",
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 22H2L14 2Z" stroke="var(--navy)" strokeWidth="2.5" fill="none"/>
              <path d="M14 8L22 20H6L14 8Z" fill="var(--navy)" opacity="0.4"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "6px" }}>
            <span className="text-gold-shimmer">Avaada</span>
            <span style={{ color: "var(--white)", marginLeft: "8px" }}>Auctions</span>
          </h1>
          <p style={{ color: "var(--slate)", fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Procurement Platform
          </p>
        </div>

        <div className="glass animate-fadeUp delay-100" style={{ borderRadius: "20px", padding: "40px", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--white)", marginBottom: "6px" }}>Welcome back</h2>
            <p style={{ color: "var(--slate)", fontSize: "0.875rem" }}>Sign in to access the auction dashboard</p>
          </div>

          {error && (
            <div className="animate-fadeIn" style={{
              background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)",
              borderRadius: "8px", padding: "12px 14px", marginBottom: "20px",
              color: "#ff9090", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "8px" }}>
                Email Address
              </label>
              <input type="email" className="input-gold" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} className="input-gold"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  required style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--slate)", padding: 0
                }}>
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }}>or</div>
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--slate)" }}>
            Are you a vendor?{" "}
            <Link href="/register" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
              Register your company →
            </Link>
          </p>
        </div>

        <p className="animate-fadeUp delay-300" style={{ textAlign: "center", marginTop: "24px", fontSize: "0.75rem", color: "var(--slate)", opacity: 0.6 }}>
          © {new Date().getFullYear()} Avaada Group · Secure Procurement Platform
        </p>
      </div>
    </div>
  );
}
