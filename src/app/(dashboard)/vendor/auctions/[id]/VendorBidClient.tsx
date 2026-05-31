"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function Countdown({ startTime, endTime }: { startTime: string; endTime: string }) {
  const [display, setDisplay] = useState("");
  const [urgent,  setUrgent]  = useState(false);
  const [phase,   setPhase]   = useState<"pending"|"active"|"ended">("pending");

  useEffect(() => {
    const tick = () => {
      const now   = Date.now();
      const start = new Date(startTime).getTime();
      const end   = new Date(endTime).getTime();

      if (now < start) {
        setPhase("pending");
        const diff = start - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setDisplay(h > 0 ? `Starts in ${h}h ${m}m ${s}s` : `Starts in ${m}m ${s}s`);
        setUrgent(false);
        return;
      }
      if (now >= end) {
        setPhase("ended"); setDisplay("Auction Ended"); return;
      }
      setPhase("active");
      const diff = end - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 300000);
      setDisplay(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [startTime, endTime]);

  return (
    <div>
      {phase === "pending" && (
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginBottom: "4px" }}>Auction has not started yet</p>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.9rem", fontWeight: 600, color: "var(--info)" }}>{display}</span>
        </div>
      )}
      {phase === "active" && (
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.1rem", fontWeight: 700, color: urgent ? "var(--danger)" : "var(--accent)" }}>{display}</span>
      )}
      {phase === "ended" && (
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1rem", color: "var(--text2)" }}>Auction Ended</span>
      )}
    </div>
  );
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
      setSuccess(`Bid of ₹${parseFloat(amount).toLocaleString("en-IN")} placed!${data.extended ? " Auction extended!" : ""}`);
      setMyBids((prev: any) => [data.bid, ...prev].sort((a: any, b: any) => a.amount - b.amount));
      setAmount(""); setNote("");
      if (data.extended && data.newEndTime) setAuction((a: any) => ({ ...a, endTime: data.newEndTime }));
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  const fmt          = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const isActive     = auction.status === "ACTIVE";
  const now          = Date.now();
  const hasStarted   = now >= new Date(auction.startTime).getTime();
  const canBid       = isActive && hasStarted;
  const myLowestBid  = myBids[0];
  // My rank = position of my lowest bid in the full sorted bid list
  const myRank       = myLowestBid ? bids.findIndex((b: any) => b.vendorId === vendorId && b.amount === myLowestBid.amount) + 1 : null;
  const totalVendors = new Set(bids.map((b: any) => b.vendorId)).size;

  // Min decrement hint — based on MY lowest bid (not global lowest)
  const minDec       = auction.minDecrement || 0;
  const myBase       = myLowestBid?.amount ?? (bids[0]?.amount ?? null);
  const validBids    = myBase && minDec > 0
    ? [1,2,3].map(n => myBase - n * minDec).filter(v => v > 0)
    : null;

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <Link href="/vendor/auctions" style={{ fontSize: "0.78rem", color: "var(--text3)", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>← My Auctions</Link>
        <h1 className="page-title">{auction.title}</h1>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
          <span className={`badge badge-${auction.status.toLowerCase()}`}>{auction.status}</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{auction.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "14px" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Stats */}
          <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>

            {/* My Rank — large prominent display */}
            <div className="stat-card" style={{ gridColumn: myRank ? "1" : "1" }}>
              <p className="stat-label">My Rank</p>
              {myRank ? (
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "2.8rem", fontWeight: 700, lineHeight: 1,
                  color: myRank === 1 ? "var(--success)" : myRank <= 3 ? "var(--accent)" : "var(--text)",
                  marginTop: "4px",
                }}>
                  L{myRank}
                </p>
              ) : (
                <p style={{ fontSize: "1rem", color: "var(--text3)", marginTop: "8px" }}>—</p>
              )}
              {myLowestBid && (
                <p className="stat-sub" style={{ marginTop: "6px" }}>
                  {myRank === 1 ? "🏆 Leading" : `of ${totalVendors} vendors`}
                </p>
              )}
            </div>

            <div className="stat-card">
              <p className="stat-label">My Best Bid</p>
              <p className="stat-val" style={{ color: myRank === 1 ? "var(--success)" : "var(--text)", fontSize: "1.3rem" }}>
                {myLowestBid ? fmt(myLowestBid.amount) : "—"}
              </p>
              {myBids.length > 0 && <p className="stat-sub">{myBids.length} bid{myBids.length > 1 ? "s" : ""} placed</p>}
            </div>

            <div className="stat-card">
              <p className="stat-label">Time Left</p>
              <div style={{ marginTop: "8px" }}>
                <Countdown startTime={auction.startTime} endTime={auction.endTime} />
              </div>
            </div>
          </div>

          {/* Bid form */}
          {isActive && (
            <div className="anim-up d2 surface" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
                {canBid ? "Place a Bid" : "Auction has not started yet"}
              </p>

              {canBid && (
                <>
                  {/* Min decrement hint based on MY lowest bid */}
                  {myLowestBid && (
                    <div style={{ padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "16px", fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.7 }}>
                      <p>Your current bid: <strong style={{ color: "var(--accent)" }}>{fmt(myLowestBid.amount)}</strong></p>
                      {minDec > 0 && validBids && (
                        <p>Next valid bids (step ₹{minDec.toLocaleString("en-IN")}): {validBids.map((v, i) => (
                          <strong key={i} style={{ color: "var(--accent)", marginRight: "8px" }}>{fmt(v)}</strong>
                        ))}</p>
                      )}
                      {minDec === 0 && bids[0] && (
                        <p>Must bid below: <strong style={{ color: "var(--accent)" }}>{fmt(bids[0].amount)}</strong></p>
                      )}
                    </div>
                  )}
                  {!myLowestBid && bids[0] && minDec > 0 && (
                    <div style={{ padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "16px", fontSize: "0.78rem", color: "var(--text2)" }}>
                      <p>Current lowest bid: <strong style={{ color: "var(--accent)" }}>{fmt(bids[0].amount)}</strong></p>
                      <p>Decrement step: <strong style={{ color: "var(--text)" }}>{fmt(minDec)}</strong></p>
                    </div>
                  )}

                  {error   && <div className="anim-in" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--danger)", fontSize: "0.82rem" }}>{error}</div>}
                  {success && <div className="anim-in" style={{ background: "rgba(52,211,100,0.08)", border: "1px solid rgba(52,211,100,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 13px", marginBottom: "14px", color: "var(--success)", fontSize: "0.82rem" }}>{success}</div>}

                  <form onSubmit={submitBid} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label className="label">Your Bid Amount (₹)</label>
                      <input className="input" type="number"
                        placeholder={myLowestBid ? `Below ${fmt(myLowestBid.amount)}` : bids[0] ? `Below ${fmt(bids[0].amount)}` : "Enter your bid"}
                        value={amount} onChange={e => setAmount(e.target.value)}
                        min="1" step="any" required
                        style={{ fontSize: "1.1rem", fontFamily: "'DM Mono',monospace" }} />
                    </div>
                    <div>
                      <label className="label">Note <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                      <input className="input" type="text" placeholder="Any remarks..." value={note} onChange={e => setNote(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading || !amount} className="btn btn-primary" style={{ padding: "12px", fontSize: "0.9rem" }}>
                      {loading ? "Placing bid..." : `Submit Bid${amount ? ` — ${fmt(parseFloat(amount) || 0)}` : ""}`}
                    </button>
                  </form>
                </>
              )}
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
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", color: "var(--text3)" }}>{new Date(b.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right — Rank display + details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Big rank display */}
          {myRank && (
            <div className="anim-up d1 surface" style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "12px" }}>Your Current Rank</p>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "5rem", fontWeight: 700, lineHeight: 1,
                color: myRank === 1 ? "var(--success)" : myRank <= 3 ? "var(--accent)" : "var(--text)",
              }}>
                L{myRank}
              </p>
              <p style={{ fontSize: "0.8rem", color: myRank === 1 ? "var(--success)" : "var(--text2)", marginTop: "8px", fontWeight: myRank === 1 ? 600 : 400 }}>
                {myRank === 1 ? "🏆 You are leading!" : myRank === 2 ? "Close — keep bidding" : "Improve your bid"}
              </p>
            </div>
          )}

          {/* Auction details — matches procurement view */}
          <div className="anim-up d2 surface" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "14px" }}>Auction Details</p>
            {[
              ["Type",            auction.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"],
              ["Description",     auction.itemDescription || "—"],
              ["Delivery Terms",  auction.deliveryTerms   || "—"],
              ["Auto-Extend",     `${auction.autoExtendMins} min`],
              ["Min Decrement",   minDec > 0 ? fmt(minDec) : "None"],
              ["Start Time",      new Date(auction.startTime).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })],
              ["End Time",        new Date(auction.endTime).toLocaleString("en-IN",   { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{l}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 500, maxWidth: "55%", textAlign: "right" }}>{v}</span>
              </div>
            ))}
            {auction.auctionType === "ITEM_RATE" && auction.items?.length > 0 && (
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
        </div>
      </div>
    </div>
  );
}
