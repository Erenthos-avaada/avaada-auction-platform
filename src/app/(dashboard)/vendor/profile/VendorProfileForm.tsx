"use client";
import { useState } from "react";

const CATS = ["Civil","Electrical","Mechanical","IT & Software","Solar EPC","O&M Services","Logistics","Manpower","Other"];

export default function VendorProfileForm({ vendor }: { vendor: any }) {
  const [form, setForm] = useState({
    companyName: vendor.companyName || "",
    gstNumber:   vendor.gstNumber   || "",
    panNumber:   vendor.panNumber   || "",
    bankName:    vendor.bankName    || "",
    bankAccount: vendor.bankAccount || "",
    bankIfsc:    vendor.bankIfsc    || "",
    categories:  vendor.categories  || [],
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleCat = (c: string) => set("categories", form.categories.includes(c) ? form.categories.filter((x: string) => x !== c) : [...form.categories, c]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setSuccess("Profile updated successfully.");
      else setError("Failed to update profile.");
    } catch { setError("Something went wrong."); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: "680px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">My <span>Profile</span></h1>
        <p className="page-sub">{vendor.user.email} · <span className={`badge badge-${vendor.status.toLowerCase()}`} style={{ fontSize: "0.68rem" }}>{vendor.status}</span></p>
      </div>

      {success && <div className="anim-in" style={{ background: "rgba(52,211,100,0.08)", border: "1px solid rgba(52,211,100,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "16px", color: "var(--success)", fontSize: "0.82rem" }}>{success}</div>}
      {error   && <div className="anim-in" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "16px", color: "var(--danger)",  fontSize: "0.82rem" }}>{error}</div>}

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="anim-up d1 surface" style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "16px" }}>Company Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><label className="label">Company Name</label><input className="input" value={form.companyName} onChange={e => set("companyName", e.target.value)} required /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div><label className="label">GST Number</label><input className="input" value={form.gstNumber} onChange={e => set("gstNumber", e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
              <div><label className="label">PAN Number</label><input className="input" value={form.panNumber} onChange={e => set("panNumber", e.target.value)} placeholder="AAAPL1234C" /></div>
            </div>
            <div>
              <label className="label">Work Categories</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {CATS.map(c => (
                  <button key={c} type="button" onClick={() => toggleCat(c)} style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
                    background: form.categories.includes(c) ? "var(--accent-bg)" : "var(--bg3)",
                    border: form.categories.includes(c) ? "1px solid var(--accent)" : "1px solid var(--border)",
                    color: form.categories.includes(c) ? "var(--accent)" : "var(--text2)",
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="anim-up d2 surface" style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "16px" }}>Bank Details</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><label className="label">Bank Name</label><input className="input" value={form.bankName} onChange={e => set("bankName", e.target.value)} placeholder="State Bank of India" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div><label className="label">Account Number</label><input className="input" value={form.bankAccount} onChange={e => set("bankAccount", e.target.value)} /></div>
              <div><label className="label">IFSC Code</label><input className="input" value={form.bankIfsc} onChange={e => set("bankIfsc", e.target.value)} placeholder="SBIN0001234" /></div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: "flex-start", padding: "11px 28px" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
