"use client";
import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";

const UNITS = ["MT","KG","Nos","KWp","MW","KVA","KM","Sqm","Ltr","Bags","Sets","Lumpsum","Other"];

type Item = { id: string; description: string; quantity: string; unit: string };

let itemCounter = 0;
const makeItem = (): Item => ({
  id: `item-${++itemCounter}`,
  description: "", quantity: "", unit: "Nos",
});

// Memoised row — only re-renders when its own data changes
const ItemRow = memo(function ItemRow({
  item, index, canRemove, onChange, onRemove,
}: {
  item: Item; index: number; canRemove: boolean;
  onChange: (id: string, k: keyof Item, v: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 32px", gap: "8px", alignItems: "center" }}>
      <input
        className="input" type="text"
        placeholder={`Item ${index + 1} description`}
        value={item.description}
        onChange={e => onChange(item.id, "description", e.target.value)}
        required
      />
      <input
        className="input" type="number"
        placeholder="Qty" min="0" step="any"
        value={item.quantity}
        onChange={e => onChange(item.id, "quantity", e.target.value)}
        required
      />
      <select
        className="input" value={item.unit}
        onChange={e => onChange(item.id, "unit", e.target.value)}
        style={{ cursor: "pointer" }}
      >
        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={!canRemove}
        style={{
          width: "32px", height: "32px", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)", background: "transparent",
          cursor: canRemove ? "pointer" : "not-allowed",
          color: "var(--danger)", opacity: canRemove ? 1 : 0.3,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
});

// Split into separate component so DateTimePicker re-renders don't affect form fields
const DateTimePicker = memo(function DateTimePicker({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const date = value ? value.split("T")[0] : "";
  const time = value ? value.split("T")[1]?.slice(0, 5) : "";

  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      timeOptions.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <input
          className="input" type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => onChange(`${e.target.value}T${time || "09:00"}`)}
          style={{ cursor: "pointer" }}
        />
        <select
          className="input" value={time}
          onChange={e => onChange(`${date || new Date().toISOString().split("T")[0]}T${e.target.value}`)}
          style={{ cursor: "pointer" }}
        >
          <option value="">Select time</option>
          {timeOptions.map(t => {
            const [h, m] = t.split(":").map(Number);
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 || 12;
            return <option key={t} value={t}>{`${h12}:${String(m).padStart(2,"0")} ${period}`}</option>;
          })}
        </select>
      </div>
    </div>
  );
});

export default function NewAuctionPage() {
  const router = useRouter();
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [auctionType, setAuctionType] = useState<"LUMPSUM" | "ITEM_RATE">("LUMPSUM");
  const [items,       setItems]       = useState<Item[]>(() => [makeItem()]);
  const [title,       setTitle]       = useState("");
  const [itemDesc,    setItemDesc]    = useState("");
  const [description, setDescription]= useState("");
  const [delivery,    setDelivery]    = useState("");
  const [startTime,   setStartTime]   = useState("");
  const [endTime,     setEndTime]     = useState("");
  const [autoExtend,  setAutoExtend]  = useState("10");
  const [minDecrement,setMinDecrement]= useState("0");

  // Stable callbacks — won't cause child re-renders
  const updateItem = useCallback((id: string, k: keyof Item, v: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [k]: v } : it));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, makeItem()]);
  }, []);

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "ACTIVE") => {
    e.preventDefault();
    if (!startTime || !endTime) { setError("Please select start and end date/time."); return; }
    if (new Date(endTime) <= new Date(startTime)) { setError("End time must be after start time."); return; }
    if (auctionType === "ITEM_RATE" && items.some(it => !it.description || !it.quantity)) {
      setError("Please fill in all item rows."); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, auctionType, itemDescription: itemDesc,
          description, deliveryTerms: delivery,
          startTime, endTime,
          autoExtendMins: parseInt(autoExtend),
          minDecrement: parseFloat(minDecrement),
          status,
          items: auctionType === "ITEM_RATE" ? items.map((it, i) => ({
            description: it.description,
            quantity: parseFloat(it.quantity),
            unit: it.unit, sortOrder: i,
          })) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create auction."); setSaving(false); return; }
      router.push(`/procurement/auctions/${data.id}`);
    } catch { setError("Something went wrong."); setSaving(false); }
  };

  const duration = startTime && endTime && new Date(endTime) > new Date(startTime)
    ? (() => {
        const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
      })()
    : null;

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

        {/* Auction Type */}
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
            <div>
              <label className="label">Auction Title</label>
              <input className="input" type="text" placeholder="e.g. Supply of Solar Panels — 10 MWp"
                value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="label">Item Description</label>
              <input className="input" type="text"
                placeholder={auctionType === "LUMPSUM" ? "e.g. Supply, installation and commissioning of 10 MWp solar plant" : "e.g. Civil works for 10 MWp solar plant"}
                value={itemDesc} onChange={e => setItemDesc(e.target.value)} required />
            </div>
            <div>
              <label className="label">Additional Notes</label>
              <textarea className="input" placeholder="Specifications, terms, conditions..."
                value={description} onChange={e => setDescription(e.target.value)}
                rows={3} style={{ resize: "vertical" }} />
            </div>
            <div>
              <label className="label">Delivery Terms</label>
              <input className="input" type="text" placeholder="e.g. FOR site, within 60 days of PO"
                value={delivery} onChange={e => setDelivery(e.target.value)} />
            </div>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 32px", gap: "8px", marginBottom: "8px", padding: "0 2px" }}>
              {["Description", "Quantity", "Unit", ""].map(h => (
                <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{h}</span>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item, i) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={i}
                  canRemove={items.length > 1}
                  onChange={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
            <p style={{ fontSize: "0.74rem", color: "var(--text3)", marginTop: "12px" }}>
              Vendors submit a rate for each line item.
            </p>
          </div>
        )}

        {/* Timing */}
        <div className="anim-up d2 surface" style={{ padding: "24px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Auction Timing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <DateTimePicker label="Start Date & Time" value={startTime} onChange={setStartTime} />
            <DateTimePicker label="End Date & Time"   value={endTime}   onChange={setEndTime}   />
          </div>
          {duration && (
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text2)" }}>
              ⏱ Duration: <strong style={{ color: "var(--text)" }}>{duration}</strong>
            </div>
          )}
        </div>

        {/* Bidding Rules */}
        <div className="anim-up d3 surface" style={{ padding: "24px", marginBottom: "24px" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "18px" }}>Bidding Rules</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="label">Auto-Extend (minutes)</label>
              <input className="input" type="number" min="0" max="60"
                value={autoExtend} onChange={e => setAutoExtend(e.target.value)} />
            </div>
            <div>
              <label className="label">Minimum Decrement (₹)</label>
              <input className="input" type="number" min="0" step="any"
                value={minDecrement} onChange={e => setMinDecrement(e.target.value)} />
            </div>
          </div>
          {(parseInt(autoExtend) > 0 || parseFloat(minDecrement) > 0) && (
            <div style={{ marginTop: "14px", padding: "11px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.6 }}>
              {parseInt(autoExtend) > 0 && <p><span style={{ color: "var(--accent)", fontWeight: 600 }}>Auto-extend:</span> Bid in last <strong style={{ color: "var(--text)" }}>{autoExtend} min</strong> extends auction by that duration.</p>}
              {parseFloat(minDecrement) > 0 && <p style={{ marginTop: "4px" }}><span style={{ color: "var(--accent)", fontWeight: 600 }}>Min decrement:</span> Each bid must be ₹<strong style={{ color: "var(--text)" }}>{parseFloat(minDecrement).toLocaleString("en-IN")}</strong> lower.</p>}
            </div>
          )}
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
