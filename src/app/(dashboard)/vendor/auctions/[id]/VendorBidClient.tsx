"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function Countdown({ endTime }: { endTime: string }) {
  const [display, setDisplay] = useState("");
  const [urgent,  setUrgent]  = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setDisplay("Ended"); return; }
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
  return <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.1rem", fontWeight: 700, color: urgent ? "var(--danger)" : "var(--accent)" }}>{display}</span>;
}

export default function VendorBidClient({ auction: initial, initialBids, myBids: initialMyBids, vendorId }: {
  auction: any; initialBids: any[]; myBids: any[]; vendorId: string;
}) {
  const [auction,  setAuction]  = useState(initial);
  const [bids,     setBids]     = useState(initialBids);
  const [myBids,   setMyBids]   = useState(initialMyBids);
  const [amount,   setAmount]   = useState("");
  const [note,     setNote]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  // SSE
  useEffect(() => {
    if (auction.status !== "ACTIVE") return;
    const es = new EventSource(`/api/auctions/${auction.id}/stream`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "init" || data.type === "update") {
        if (data.auction) setAuction(data.auction);
        if (data.bids)    setBids(data.bids);
      }
      if (data.type === "closed") { setAuction((a: any) => ({ ...a, status: "CLOSED" })); es.close(); }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [auction.id]);

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`/api/auctions/${auction.id}/bids`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to place bid."); setLoading(false); return; }

      setSuccess(`Bid of ₹${parseFloat(amount).toLocaleString("en-IN")} placed successfully!${data.extended ? " Auction extended!" : ""}`);
      setMyBids((prev: any) => [data.bid, ...prev].sort((a, b) => a.amount - b.amount));
      setAmount(""); setNote("");
      if (data.extended && data.newEndTime) setAuction((a: any) => ({ ...a, endTime: data.newEndTime }));
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  const lowestBid   = bids[0];
  const myLowestBid = myBids[0];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const isActive    = auction.status === "ACTIVE";
  const myRank      = myLowestBid ? bids.findIndex((b: any) => b.amount >= myLowestBid.amount) + 1 : null;

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <Link href="/vendor/auctions" style={{ fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>← My Auctions</Link>
        <h1 className="page-title">{auction.title}</h1>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
          <span className={`badge badge-${auction.status.toLowerCase()}`}>{auction.status}</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{auction.itemDescription || auction.title}</span>
          {myRank === 1 && <span className="badge badge-active">🏆 Leading</span>}
          {myRank && myRank > 1 && <span className="badge badge-draft">#{myRank} Position</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "14px" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Stats */}
          <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div className="stat-card">
              <p className="stat-label">Current Lowest</p>
              <p className="stat-val" style={{ color: "var(--accent)", fontSize: "1.3rem" }}>{lowestBid ? fmt(lowestBid.amount) : "—"}</p>
              {lowestBid && <p className="stat-sub">{myLowestBid?.amount === lowestBid.amount ? "🏆 Your bid!" : lowestBid.vendor.companyName}</p>}
            </div>
            <div className="stat-card">
              <p className="stat-label">My Best Bid</p>
              <p className="stat-val" style={{ color: myRank === 1 ? "var(--success)" : "var(--text)", fontSize: "1.3rem" }}>{myLowestBid ? fmt(myLowestBid.amount) : "—"}</p>
              {myRank && <p className="stat-sub">Rank #{myRank} of {bids.length}</p>}
            </div>
            <div className="stat-card">
              <p className="stat-label">Time Left</p>
              <div style={{ marginTop: "8px" }}>
                {isActive ? <Countdown endTime={auction.endTime} /> : <span style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)" }}>{auction.status}</span>}
              </div>
            </div>
          </div>

          {/* Bid form */}
          {isActive && (
            <div className="anim-up d2 surface" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>Place a Bid</p>

              {lowestBid && (
                <div style={{ padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "16px", fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.7 }}>
                  <p>Current lowest: <strong style={{ color: "var(--accent)" }}>{fmt(lowestBid.amount)}</strong></p>
                  {auction.minDecrement > 0 && (
                    <>
                      <p>Decrement step: <strong style={{ color: "var(--text)" }}>{fmt(auction.minDecrement)}</strong></p>
                      <p>Valid next bids:{" "}
                        {[1,2,3].map(n => {
                          const v = lowestBid.amount - n * auction.minDecrement;
                          return v > 0 ? <strong key={n} style={{ color: "var(--accent)", marginRight: "8px" }}>{fmt(v)}</strong> : null;
                        })}
                      </p>
                    </>
                  )}
                </div>
              )}

              {error   && <div className="anim-in" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--danger)", fontSize: "0.82rem" }}>{error}</div>}
              {success && <div className="anim-in" style={{ background: "rgba(52,211,100,0.08)", border: "1px solid rgba(52,211,100,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--success)", fontSize: "0.82rem" }}>{success}</div>}

              <form onSubmit={submitBid} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label className="label">Your Bid Amount (₹)</label>
                  <input className="input" type="number" placeholder={lowestBid ? `Must be below ${fmt(lowestBid.amount - (auction.minDecrement || 0))}` : "Enter your bid"} value={amount} onChange={e => setAmount(e.target.value)} min="1" step="any" required style={{ fontSize: "1.1rem", fontFamily: "'DM Mono',monospace" }} />
                </div>
                <div>
                  <label className="label">Note <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                  <input className="input" type="text" placeholder="Any remarks..." value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <button type="submit" disabled={loading || !amount} className="btn btn-primary" style={{ padding: "12px", fontSize: "0.9rem" }}>
                  {loading ? "Placing bid..." : `Submit Bid${amount ? ` — ${fmt(parseFloat(amount) || 0)}` : ""}`}
                </button>
              </form>
            </div>
          )}

          {/* My bids history */}
          {myBids.length > 0 && (
            <div className="anim-up d3 surface" style={{ overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>My Bids ({myBids.length})</p>
              </div>
              <table className="tbl">
                <thead><tr><th>Amount</th><th>Note</th><th>Time</th></tr></thead>
                <tbody>
                  {myBids.map((b: any, i: number) => (
                    <tr key={b.id} style={{ background: i === 0 ? "var(--accent-bg)" : undefined }}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text)" }}>{fmt(b.amount)}</td>
                      <td style={{ fontSize: "0.78rem" }}>{b.note || "—"}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", color: "var(--text3)" }}>{new Date(b.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" , timeZone: "Asia/Kolkata"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right — Leaderboard (anonymised) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>Bid Leaderboard</p>
              {isActive && <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: "var(--success)" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />Live</span>}
            </div>
            {bids.length === 0
              ? <p style={{ padding: "24px", textAlign: "center", color: "var(--text3)", fontSize: "0.82rem" }}>No bids yet. Be the first!</p>
              : <table className="tbl">
                  <thead><tr><th>Rank</th><th>Bidder</th><th>Amount</th></tr></thead>
                  <tbody>
                    {bids.slice(0, 10).map((b: any, i: number) => {
                      const isMe = b.vendorId === vendorId;
                      return (
                        <tr key={b.id} style={{ background: isMe ? "var(--accent-bg)" : i === 0 ? "rgba(255,255,255,0.02)" : undefined }}>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text3)", fontSize: "0.8rem" }}>#{i + 1}</td>
                          <td style={{ fontSize: "0.8rem", fontWeight: isMe ? 600 : 400, color: isMe ? "var(--accent)" : "var(--text2)" }}>
                            {isMe ? "You 🏆" : `Vendor ${String.fromCharCode(65 + i)}`}
                          </td>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", fontWeight: 600, color: i === 0 ? "var(--accent)" : "var(--text)" }}>{fmt(b.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            }
          </div>

          {/* Auction info */}
          <div className="anim-up d3 surface" style={{ padding: "16px 18px" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "12px" }}>Details</p>
            {[
              ["Delivery",      auction.deliveryTerms || "—"],
              ["Auto-Extend",   `${auction.autoExtendMins} min`],
              ["Min Decrement", auction.minDecrement > 0 ? fmt(auction.minDecrement) : "None"],
              ["Closes",        new Date(auction.endTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--text3)" }}>{l}</span>
                <span style={{ fontSize: "0.76rem", color: "var(--text)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
