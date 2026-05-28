"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PROCUREMENT" });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccess(""); setError("");
    try {
      const res  = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create user."); setSaving(false); return; }
      setSuccess(`✓ ${data.role} account created for ${data.email}`);
      setForm({ name: "", email: "", password: "", role: "PROCUREMENT" });
      router.refresh();
    } catch { setError("Something went wrong."); }
    setSaving(false);
  };

  return (
    <div className="surface" style={{ padding: "22px 24px" }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>
        Create New User
      </p>

      {success && (
        <div style={{ background: "rgba(52,211,100,0.08)", border: "1px solid rgba(52,211,100,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--success)", fontSize: "0.82rem" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--danger)", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label className="label">Full Name</label>
          <input className="input" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="rahul@avaada.com" value={form.email} onChange={e => set("email", e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={e => set("role", e.target.value)} style={{ cursor: "pointer" }}>
            <option value="PROCUREMENT">Procurement Officer</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div style={{ padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--text2)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--accent)" }}>Procurement Officers</strong> can create and manage auctions, view all bids, and invite vendors.<br/>
          <strong style={{ color: "var(--accent)" }}>Administrators</strong> have full platform access including user and vendor management.
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "11px" }}>
          {saving ? "Creating..." : "Create Account →"}
        </button>
      </form>
    </div>
  );
}
