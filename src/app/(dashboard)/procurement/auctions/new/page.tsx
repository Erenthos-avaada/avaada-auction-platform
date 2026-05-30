"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const UNITS = ["MT","KG","Nos","KWp","MW","KVA","KM","Sqm","Ltr","Bags","Sets","Lumpsum","Other"];

type Item = { id: string; description: string; quantity: string; unit: string };

function newItem(): Item {
  return { id: Math.random().toString(36).slice(2), description: "", quantity: "", unit: "Nos" };
}

// Date + Time picker split into separate fields for clean UX
function DateTimePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const date = value ? value.split("T")[0] : "";
  const time = value ? value.split("T")[1]?.slice(0, 5) : "";

  const update = (d: string, t: string) => {
    if (d && t) onChange(`${d}T${t}`);
    else if (d) onChange(`${d}T${time || "09:00"}`);
  };

  // Generate time options every 30 min
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      timeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <input
          className="input"
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => update(e.target.value, time)}
          style={{ cursor: "pointer" }}
        />
        <select
          className="input"
          value={time}
          onChange={e => update(date, e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="">Select time</option>
          {timeOptions.map(t => (
            <option key={t} value={t}>
              {(() => {
                const [h, m] = t.split(":").map(Number);
                const period = h >= 12 ? "PM" : "AM";
                const h12 = h % 12 || 12;
                return `${h12}:${String(m).padStart(2, "0")} ${period}`;
              })()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function NewAuctionPage() {
  const router = useRouter();
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [auctionType, setAuctionType] = useState<"LUMPSUM" | "ITEM_RATE">("LUMPSUM");
  const [items,       setItems]       = useState<Item[]>([newItem()]);
  const [form,        setForm]        = useState({
    title: "", itemDescription: "", description: "",
    deliveryTerms: "", startTime: "", endTime: "",
    autoExtendMins: "10", minDecrement: "0",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Item-rate row helpers
  const updateItem = (id: string, k: keyof Item, v: string) =>
    setItems(items.map(it => it.id === id ? { ...it, [k]: v } : it));
  const addItem    = () => setItems([...items, newItem()]);
  const removeItem = (id: string) => setItems(items.filter(it => it.id !== id));

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "ACTIVE") => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) { setError("Please select start and end date/time."); return; }
    if (new Date(form.endTime) <= new Date(form.startTime)) { setError("End time must be after start time."); return; }
    if (auctionType === "ITEM_RATE" && items.some(it => !it.description || !it.quantity || !it.unit)) {
      setError("Please fill in all item rows completely."); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          auctionType,
          autoExtendMins: parseInt(form.autoExtendMins),
          minDecrement:   parseFloat(form.minDecrement),
          status,
          items: auctionType === "ITEM_RATE" ? items.map((it, i) => ({
            description: it.description,
            quantity:    parseFloat(it.quantity),
            unit:        it.unit,
            sortOrder:   i,
          })) : [],
        }),
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
    <div style={{ maxWidth: "760px" }}>
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

        {/* Auction Type Selector */}
        <div className="anim-up d1 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "16px" }}>Auction Type</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {([
              { value: "LUMPSUM",   label: "Lumpsum",        desc: "Single overall price for the entire scope of work" },
              { value: "ITEM_RATE", label: "Item-Rate Basis", desc: "Vendors quote per-item rates across multiple line items" },
            ] as const).map(opt => (
              <button key={opt.value} type="button" onClick={() => setAuctionType(opt.value)} style={{
                padding: "16px", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left",
                background: auctionType === opt.value ? "var(--accent-bg)" : "var(--bg3)",
                border: auctionType === opt.value ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: auctionType === opt.value ? "4px solid var(--accent)" : "2px solid var(--border2)",
                    background: auctionType === opt.value ? "var(--accent-bg)" : "transparent",
                    flexShrink: 0, transition: "all 0.15s",
                  }} />
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: auctionType === opt.value ? "var(--accent)" : "var(--text)" }}>
                    {opt.label}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text2)", paddingLeft: "24px", lineHeight: 1.5 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="anim-up d1 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Basic Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Auction Title">
              <input className="input" type="text" placeholder="e.g. Supply of Solar Panels — 10 MWp" value={form.title} onChange={e => set("title", e.target.value)} required />
            </Field>
            <Field label="Item Description">
              <input className="input" type="text"
                placeholder={auctionType === "LUMPSUM" ? "e.g. Supply, installation and commissioning of 10 MWp solar plant" : "e.g. Civil works for 10 MWp solar plant"}
                value={form.itemDescription} onChange={e => set("itemDescription", e.target.value)} required />
            </Field>
            <Field label="Additional Notes">
              <textarea className="input" placeholder="Specifications, terms, conditions..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </Field>
            <Field label="Delivery Terms">
              <input className="input" type="text" placeholder="e.g. FOR site, within 60 days of PO" value={form.deliveryTerms} onChange={e => set("deliveryTerms", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Item-Rate rows */}
        {auctionType === "ITEM_RATE" && (
          <div className="anim-up surface" style={{ padding: "24px", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Line Items ({items.length})
              </p>
              <button type="button" onClick={addItem} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
                + Add Item
              </button>
            </div>

            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 32px", gap: "8px", marginBottom: "8px", padding: "0 2px" }}>
              {["Description", "Quantity", "Unit", ""].map(h => (
                <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{h}</span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item, i) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 32px", gap: "8px", alignItems: "center" }}>
                  <input className="input" type="text" placeholder={`Item ${i + 1} description`}
                    value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} required />
                  <input className="input" type="number" placeholder="Qty" min="0" step="any"
                    value={item.quantity} onChange={e => updateItem(item.id, "quantity", e.target.value)} required />
                  <select className="input" value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} style={{ cursor: "pointer" }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button type="button" onClick={() => items.length > 1 && removeItem(item.id)}
                    disabled={items.length === 1}
                    style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", cursor: items.length === 1 ? "not-allowed" : "pointer", color: "var(--danger)", opacity: items.length === 1 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.74rem", color: "var(--text3)", marginTop: "12px" }}>
              Vendors will submit a rate for each line item. Total bid = sum of all item rates × quantities.
            </p>
          </div>
        )}

        {/* Timing */}
        <div className="anim-up d2 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Auction Timing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <DateTimePicker label="Start Date & Time" value={form.startTime} onChange={v => set("startTime", v)} />
            <DateTimePicker label="End Date & Time"   value={form.endTime}   onChange={v => set("endTime",   v)} />
          </div>
          {form.startTime && form.endTime && new Date(form.endTime) > new Date(form.startTime) && (
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text2)" }}>
              ⏱ Duration:{" "}
              {(() => {
                const diff = new Date(form.endTime).getTime() - new Date(form.startTime).getTime();
                const h    = Math.floor(diff / 3600000);
                const m    = Math.floor((diff % 3600000) / 60000);
                return h > 0 ? `${h} hour${h > 1 ? "s" : ""} ${m > 0 ? `${m} min` : ""}` : `${m} minutes`;
              })()}
            </div>
          )}
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
          <div style={{ marginTop: "14px", padding: "11px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.6 }}>
            {parseInt(form.autoExtendMins) > 0 && (
              <p><span style={{ color: "var(--accent)", fontWeight: 600 }}>Auto-extend:</span> If a bid is placed in the last <strong style={{ color: "var(--text)" }}>{form.autoExtendMins} min</strong>, the auction extends by that duration.</p>
            )}
            {parseFloat(form.minDecrement) > 0 && (
              <p style={{ marginTop: "4px" }}><span style={{ color: "var(--accent)", fontWeight: 600 }}>Min decrement:</span> Each bid must be at least <strong style={{ color: "var(--text)" }}>₹{parseFloat(form.minDecrement).toLocaleString("en-IN")}</strong> lower than current lowest.</p>
            )}
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
