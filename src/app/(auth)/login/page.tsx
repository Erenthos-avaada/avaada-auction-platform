"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.success) {
        if (data.role === "ADMIN")       window.location.href = "/admin";
        else if (data.role === "PROCUREMENT") window.location.href = "/procurement";
        else                             window.location.href = "/vendor";
        return;
      }
      setError(data.error || "Invalid credentials.");
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div className="anim-up" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="auth-logo-ring">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h1 className="auth-title">Avaada Auctions</h1>
          <p className="auth-sub">Procurement Platform</p>
        </div>

        {/* Card */}
        <div className="auth-card anim-up d1">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Sign in</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text2)", marginBottom: "24px" }}>Enter your credentials to continue</p>

          {error && (
            <div className="anim-in" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "18px", color: "var(--danger)", fontSize: "0.82rem", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@avaada.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: "42px" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 0, display: "flex" }}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "4px", padding: "12px" }}>
              {loading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Signing in...</>
                : "Sign in →"
              }
            </button>
          </form>

          <div className="divider" style={{ margin: "20px 0" }}>or</div>
          <p style={{ textAlign: "center", fontSize: "0.83rem", color: "var(--text2)" }}>
            New vendor?{" "}
            <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Create account</Link>
          </p>
        </div>

        <p className="anim-up d3" style={{ textAlign: "center", marginTop: "20px", fontSize: "0.72rem", color: "var(--text3)" }}>
          © {new Date().getFullYear()} Avaada Group · All rights reserved
        </p>
      </div>
    </div>
  );
}
