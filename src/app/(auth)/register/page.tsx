"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Civil", "Electrical", "Mechanical", "IT & Software", "Solar EPC", "O&M Services", "Logistics", "Manpower", "Other"];

const steps = ["Account", "Company", "Banking"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    companyName: "", gstNumber: "", panNumber: "", categories: [] as string[],
    bankName: "", bankAccount: "", bankIfsc: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (cat: string) => {
    set("categories", form.categories.includes(cat)
      ? form.categories.filter(c => c !== cat)
      : [...form.categories, cat]);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0 && form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      router.push("/login?registered=1");
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

      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>

        {/* Brand */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "52px", height: "52px", borderRadius: "14px", marginBottom: "16px",
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
            boxShadow: "0 8px 32px rgba(201,168,76,0.25)",
          }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 22H2L14 2Z" stroke="var(--navy)" strokeWidth="2.5" fill="none"/>
              <path d="M14 8L22 20H6L14 8Z" fill="var(--navy)" opacity="0.4"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: "4px" }}>
            <span className="text-gold-shimmer">Vendor</span>
            <span style={{ color: "var(--white)", marginLeft: "8px" }}>Registration</span>
          </h1>
          <p style={{ color: "var(--slate)", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Avaada Auction Platform
          </p>
        </div>

        {/* Step indicators */}
        <div className="animate-fadeUp delay-100" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "28px" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < step ? "var(--gold)" : i === step ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
                  border: i === step ? "2px solid var(--gold)" : i < step ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.1)",
                  color: i < step ? "var(--navy)" : i === step ? "var(--gold)" : "var(--slate)",
                  fontSize: "0.8rem", fontWeight: 700, transition: "all 0.3s ease"
                }}>
                  {i < step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : i + 1}
                </div>
                <span style={{ fontSize: "0.7rem", color: i === step ? "var(--gold)" : "var(--slate)", fontWeight: 500, letterSpacing: "0.04em" }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: "80px", height: "1px", background: i < step ? "var(--gold)" : "rgba(255,255,255,0.1)", margin: "0 8px", marginBottom: "22px", transition: "background 0.3s ease" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass animate-fadeUp delay-200" style={{ borderRadius: "20px", padding: "36px", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>

          {error && (
            <div className="animate-fadeIn" style={{
              background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)",
              borderRadius: "8px", padding: "11px 14px", marginBottom: "20px",
              color: "#ff9090", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center"
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 110-2 1 1 0 010 2z"/></svg>
              {error}
            </div>
          )}

          {/* Step 0 — Account */}
          {step === 0 && (
            <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--white)", marginBottom: "4px" }}>Account Details</h3>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Full Name</label>
                <input className="input-gold" type="text" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Email Address</label>
                <input className="input-gold" type="email" placeholder="you@company.com" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Password</label>
                  <input className="input-gold" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Confirm</label>
                  <input className="input-gold" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-gold" style={{ marginTop: "8px" }}>Continue →</button>
            </form>
          )}

          {/* Step 1 — Company */}
          {step === 1 && (
            <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--white)", marginBottom: "4px" }}>Company Details</h3>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Company Name</label>
                <input className="input-gold" type="text" placeholder="Your company legal name" value={form.companyName} onChange={e => set("companyName", e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>GST Number</label>
                  <input className="input-gold" type="text" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => set("gstNumber", e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>PAN Number</label>
                  <input className="input-gold" type="text" placeholder="AAAPL1234C" value={form.panNumber} onChange={e => set("panNumber", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "10px" }}>Work Categories</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                      padding: "6px 14px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                      background: form.categories.includes(cat) ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
                      border: form.categories.includes(cat) ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                      color: form.categories.includes(cat) ? "var(--gold)" : "var(--slate-light)",
                      transition: "all 0.2s ease"
                    }}>{cat}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="btn-outline" onClick={() => setStep(0)} style={{ width: "auto", flex: "0 0 auto", padding: "12px 20px" }}>← Back</button>
                <button type="submit" className="btn-gold">Continue →</button>
              </div>
            </form>
          )}

          {/* Step 2 — Banking */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--white)", marginBottom: "4px" }}>Bank Details</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginTop: "-8px" }}>Optional — can be updated from your profile later</p>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Bank Name</label>
                <input className="input-gold" type="text" placeholder="e.g. State Bank of India" value={form.bankName} onChange={e => set("bankName", e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>Account Number</label>
                <input className="input-gold" type="text" placeholder="Your account number" value={form.bankAccount} onChange={e => set("bankAccount", e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "7px" }}>IFSC Code</label>
                <input className="input-gold" type="text" placeholder="e.g. SBIN0001234" value={form.bankIfsc} onChange={e => set("bankIfsc", e.target.value)} />
              </div>

              {/* Summary box */}
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "10px", padding: "14px 16px", marginTop: "4px" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Registration Summary</p>
                <p style={{ fontSize: "0.83rem", color: "var(--slate-light)" }}><span style={{ color: "var(--slate)" }}>Name:</span> {form.name}</p>
                <p style={{ fontSize: "0.83rem", color: "var(--slate-light)" }}><span style={{ color: "var(--slate)" }}>Company:</span> {form.companyName}</p>
                <p style={{ fontSize: "0.83rem", color: "var(--slate-light)" }}><span style={{ color: "var(--slate)" }}>Email:</span> {form.email}</p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" className="btn-outline" onClick={() => setStep(1)} style={{ width: "auto", flex: "0 0 auto", padding: "12px 20px" }}>← Back</button>
                <button type="submit" className="btn-gold" disabled={loading}>
                  {loading ? "Submitting..." : "✓ Submit Registration"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="animate-fadeUp delay-400" style={{ textAlign: "center", marginTop: "20px", fontSize: "0.83rem", color: "var(--slate)" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>Sign in →</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "10px", fontSize: "0.72rem", color: "var(--slate)", opacity: 0.5 }}>
          Your application will be reviewed by our procurement team within 24 hours.
        </p>
      </div>
    </div>
  );
}
