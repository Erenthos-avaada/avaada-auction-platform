"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Civil","Electrical","Mechanical","IT & Software","Solar EPC","O&M Services","Logistics","Manpower","Other"];
const UNITS      = ["MT","KG","Nos","KWp","MW","KVA","KM","Sqm","Lumpsum","Other"];

export default function NewAuctionPage() {
  const router  = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [form,   setForm]   = useState({
    title: "", description: "", category: "", quantity: "", unit: "",
    deliveryTerms: "", startTime: "", endTime: "",
    autoExtendMins: "10", minDecrement: "0",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "ACTIVE") => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity), autoExtendMins: parseInt(form.autoExtendMins), minDecrement: parseFloat(form.minDecrement), status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create auction."); setSaving(false); return; }
      router.push(`/procurement/auctions/${data.id}`);
    } catch { setError("Something went wrong."); setSaving(false); }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="label">{label}</label>{children}</div>
  );

  return (
    <div style={{ maxWidth: "720px" }}>
      <div className="anim-up" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">New <span>Auction</span></h1>
        <p className="page-sub">Create a reverse auction for vendor bidding</p>
      </div>

      {error && (
        <div className="anim-in" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "11px 14px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={e => handleSubmit(e, "ACTIVE")}>
        {/* Basic Info */}
        <div className="anim-up d1 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Basic Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Auction Title">
              <input className="input" type="text" placeholder="e.g. Supply of Solar Panels — 10 MWp" value={form.title} onChange={e => set("title", e.target.value)} required />
            </Field>
            <Field label="Description">
              <textarea className="input" placeholder="Detailed scope of work, specifications..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Category">
                <select className="input" value={form.category} onChange={e => set("category", e.target.value)} required style={{ cursor: "pointer" }}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <Field label="Quantity">
                  <input className="input" type="number" placeholder="0" min="0" step="any" value={form.quantity} onChange={e => set("quantity", e.target.value)} required />
                </Field>
                <Field label="Unit">
                  <select className="input" value={form.unit} onChange={e => set("unit", e.target.value)} required style={{ cursor: "pointer" }}>
                    <option value="">Unit</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <Field label="Delivery Terms">
              <input className="input" type="text" placeholder="e.g. Ex-works, FOR site, within 30 days" value={form.deliveryTerms} onChange={e => set("deliveryTerms", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Timing */}
        <div className="anim-up d2 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Auction Timing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Start Date & Time">
              <input className="input" type="datetime-local" value={form.startTime} onChange={e => set("startTime", e.target.value)} required />
            </Field>
            <Field label="End Date & Time">
              <input className="input" type="datetime-local" value={form.endTime} onChange={e => set("endTime", e.target.value)} required />
            </Field>
          </div>
        </div>

        {/* Bidding Rules */}
        <div className="anim-up d3 surface" style={{ padding: "24px", marginBottom: "24px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Bidding Rules</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Auto-Extend (minutes)">
              <input className="input" type="number" min="0" max="60" value={form.autoExtendMins} onChange={e => set("autoExtendMins", e.target.value)} />
            </Field>
            <Field label="Minimum Decrement (₹)">
              <input className="input" type="number" min="0" step="any" value={form.minDecrement} onChange={e => set("minDecrement", e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: "14px", padding: "11px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Auto-extend:</span> If a bid is placed within the last <strong style={{ color: "var(--text)" }}>{form.autoExtendMins} min</strong> before closing, the auction end time extends by that duration.
              {parseFloat(form.minDecrement) > 0 && <><br/><span style={{ color: "var(--accent)", fontWeight: 600 }}>Min decrement:</span> Each bid must be at least <strong style={{ color: "var(--text)" }}>₹{parseFloat(form.minDecrement).toLocaleString("en-IN")}</strong> lower than the current lowest.</>}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="anim-up d4" style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={e => handleSubmit(e as any, "DRAFT")} disabled={saving} className="btn btn-ghost" style={{ padding: "11px 20px" }}>
            Save as Draft
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "11px 24px" }}>
            {saving ? "Publishing..." : "Publish Auction →"}
          </button>
        </div>
      </form>
    </div>
  );
}
