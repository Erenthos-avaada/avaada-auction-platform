"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function Countdown({ endTime, onExpire }: { endTime: string; onExpire?: () => void }) {
  const [display, setDisplay] = useState("");
  const [urgent,  setUrgent]  = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setDisplay("Ended"); onExpire?.(); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 300000);
      setDisplay(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endTime]);
  return <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.1rem", fontWeight: 600, color: urgent ? "var(--danger)" : "var(--accent)" }}>{display}</span>;
}

export default function AuctionDetailClient({ auction: initial, initialBids, vendors, invitedIds, role }: {
  auction: any; initialBids: any[]; vendors: any[]; invitedIds: string[]; role: string;
}) {
  const [auction,    setAuction]    = useState(initial);
  const [bids,       setBids]       = useState(initialBids);
  const [closing,    setClosing]    = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selected,   setSelected]   = useState<string[]>(invitedIds);
  const [inviting,   setInviting]   = useState(false);
  const [inviteMsg,  setInviteMsg]  = useState("");
  const [activeItem, setActiveItem] = useState<string | null>(
    initial.auctionType === "ITEM_RATE" && initial.items?.length > 0 ? initial.items[0].id : null
  );

  useEffect(() => {
    if (auction.status === "CLOSED" || auction.status === "CANCELLED") return;
    const es = new EventSource(`/api/auctions/${auction.id}/stream`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "init" || data.type === "update") {
        if (data.auction) setAuction(data.auction);
        if (data.bids)    setBids(data.bids);
      }
      if (data.type === "closed") es.close();
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [auction.id]);

  const closeAuction = async () => {
    setClosing(true);
    await fetch(`/api/auctions/${auction.id}/close`, { method: "PATCH" });
    setAuction((a: any) => ({ ...a, status: "CLOSED" }));
    setClosing(false);
  };

  const sendInvites = async () => {
    setInviting(true);
    const res  = await fetch(`/api/auctions/${auction.id}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vendorIds: selected }) });
    const data = await res.json();
    setInviteMsg(`✓ ${data.invited} vendor(s) invited`);
    setInviting(false);
  };

  const isItemRate = auction.auctionType === "ITEM_RATE";
  const fmt        = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  // Filter bids by active item tab for item-rate
  const filteredBids = isItemRate && activeItem
    ? bids.filter((b: any) => b.itemId === activeItem)
    : bids;

  const lowestBid = filteredBids[0];

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <Link href="/procurement/auctions" style={{ fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>← Auctions</Link>
            <h1 className="page-title">{auction.title}</h1>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
              <span className={`badge badge-${auction.status.toLowerCase()}`}>{auction.status}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text3)", background: "var(--bg3)", padding: "2px 8px", borderRadius: "999px", border: "1px solid var(--border)" }}>
                {isItemRate ? "Item-Rate" : "Lumpsum"}
              </span>
            </div>
          </div>
          {role === "PROCUREMENT" && auction.status === "ACTIVE" && (
            <button onClick={closeAuction} disabled={closing} className="btn btn-danger" style={{ padding: "9px 18px", fontSize: "0.82rem" }}>
              {closing ? "Closing..." : "Close Auction"}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Item tabs for Item-Rate */}
          {isItemRate && auction.items?.length > 0 && (
            <div className="anim-up d1" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {auction.items.map((item: any) => (
                <button key={item.id} onClick={() => setActiveItem(item.id)} style={{
                  padding: "7px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 500,
                  cursor: "pointer", border: "none", transition: "all 0.15s",
                  background: activeItem === item.id ? "var(--accent-bg)" : "var(--bg3)",
                  outline: activeItem === item.id ? "1px solid var(--border2)" : "1px solid var(--border)",
                  color:   activeItem === item.id ? "var(--accent)" : "var(--text2)",
                }}>
                  {item.description} <span style={{ opacity: 0.6 }}>({item.quantity} {item.unit})</span>
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div className="stat-card">
              <p className="stat-label">Lowest Bid</p>
              <p className="stat-val" style={{ color: "var(--accent)", fontSize: "1.4rem" }}>{lowestBid ? fmt(lowestBid.amount) : "—"}</p>
              {lowestBid && <p className="stat-sub">{lowestBid.vendor.companyName}</p>}
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Bids</p>
              <p className="stat-val" style={{ fontSize: "1.4rem" }}>{filteredBids.length}</p>
              <p className="stat-sub">{new Set(filteredBids.map((b: any) => b.vendorId)).size} vendors</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Time Left</p>
              <div style={{ marginTop: "8px" }}>
                {auction.status === "ACTIVE"
                  ? <Countdown endTime={auction.endTime} />
                  : <span style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)" }}>{auction.status}</span>
                }
              </div>
            </div>
          </div>

          {/* Bid table */}
          <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>
                {isItemRate ? `Bids — ${auction.items?.find((i: any) => i.id === activeItem)?.description || ""}` : "Live Bid Ladder"}
              </p>
              {auction.status === "ACTIVE" && <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "var(--success)" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />Live</span>}
            </div>
            {filteredBids.length === 0
              ? <p style={{ padding: "32px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No bids yet</p>
              : <table className="tbl">
                  <thead><tr><th>Rank</th><th>Company</th><th>Amount</th><th>Time</th></tr></thead>
                  <tbody>
                    {filteredBids.map((b: any, i: number) => (
                      <tr key={b.id} style={{ background: i === 0 ? "var(--accent-bg)" : undefined }}>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text3)" }}>#{i + 1}</td>
                        <td style={{ fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--text)" : "var(--text2)" }}>{b.vendor.companyName}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text)" }}>{fmt(b.amount)}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", color: "var(--text3)" }}>{new Date(b.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" , timeZone: "Asia/Kolkata"})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="anim-up d1 surface" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "14px" }}>Auction Details</p>
            {[
              ["Type",          isItemRate ? "Item-Rate" : "Lumpsum"],
              ["Description",   auction.itemDescription || "—"],
              ["Delivery",      auction.deliveryTerms   || "—"],
              ["Auto-Extend",   `${auction.autoExtendMins} min`],
              ["Min Decrement", auction.minDecrement > 0 ? fmt(auction.minDecrement) : "None"],
              ["Starts",        new Date(auction.startTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })],
              ["Closes",        new Date(auction.endTime).toLocaleString("en-IN",   { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{l}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 500, maxWidth: "55%", textAlign: "right" }}>{v}</span>
              </div>
            ))}
            {isItemRate && auction.items?.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "8px" }}>Line Items</p>
                {auction.items.map((item: any, i: number) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: "0.78rem" }}>
                    <span style={{ color: "var(--text2)" }}>{i + 1}. {item.description}</span>
                    <span style={{ color: "var(--text3)", fontFamily: "'DM Mono',monospace" }}>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite vendors */}
          {role === "PROCUREMENT" && (
            <div className="anim-up d2 surface" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)" }}>Invite Vendors</p>
                <button onClick={() => setShowInvite(!showInvite)} style={{ fontSize: "0.72rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                  {showInvite ? "Hide" : "Show"}
                </button>
              </div>
              {showInvite && (
                <>
                  <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
                    {vendors.map((v: any) => (
                      <label key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                        background: selected.includes(v.id) ? "var(--accent-bg)" : "transparent",
                        border: selected.includes(v.id) ? "1px solid var(--border2)" : "1px solid transparent", transition: "all 0.15s" }}>
                        <input type="checkbox" checked={selected.includes(v.id)}
                          onChange={() => setSelected(s => s.includes(v.id) ? s.filter(x => x !== v.id) : [...s, v.id])}
                          style={{ accentColor: "var(--accent)" }} />
                        <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>{v.companyName}</span>
                      </label>
                    ))}
                  </div>
                  {inviteMsg && <p style={{ fontSize: "0.75rem", color: "var(--success)", marginBottom: "8px" }}>{inviteMsg}</p>}
                  <button onClick={sendInvites} disabled={inviting || selected.length === 0} className="btn btn-primary" style={{ width: "100%", fontSize: "0.8rem", padding: "9px" }}>
                    {inviting ? "Sending..." : `Invite ${selected.length} Vendor${selected.length !== 1 ? "s" : ""}`}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
