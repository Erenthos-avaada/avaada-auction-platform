"use client";
import { useState } from "react";

function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }
function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

async function downloadPDF(auction: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const M = 18;

  // Header bar
  doc.setFillColor(13, 31, 21);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(52, 211, 100);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("AVAADA AUCTIONS", M, 12);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 200, 150);
  doc.text("AUCTION REPORT — CONFIDENTIAL", M, 20);

  // Generated on
  doc.setTextColor(150, 200, 150);
  doc.setFontSize(7);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`, W - M, 20, { align: "right" });

  let y = 38;

  // Auction title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text(auction.title, M, y); y += 8;

  // Status badge
  const statusColors: any = { CLOSED: [100,100,100], ACTIVE: [52,211,100], DRAFT: [201,168,76] };
  const [sr, sg, sb] = statusColors[auction.status] || [100,100,100];
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(M, y, 22, 6, 1, 1, "F");
  doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text(auction.status, M + 11, y + 4, { align: "center" });
  y += 12;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(M, y, W - M, y); y += 8;

  // Auction details grid
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("AUCTION DETAILS", M, y); y += 6;

  const details = [
    ["Type",         auction.auctionType === "ITEM_RATE" ? "Item-Rate Basis" : "Lumpsum"],
    ["Description",  auction.itemDescription || "—"],
    ["Delivery",     auction.deliveryTerms   || "—"],
    ["Start Time",   fmtDate(auction.startTime)],
    ["End Time",     fmtDate(auction.endTime)],
    ["Auto-Extend",  `${auction.autoExtendMins} minutes`],
    ["Min Decrement",auction.minDecrement > 0 ? fmt(auction.minDecrement) : "None"],
    ["Created By",   auction.createdBy?.name || "—"],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(label + ":", M, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(value, W - M - 60);
    doc.text(lines, 75, y);
    y += lines.length * 5 + 2;
  });

  y += 4; doc.line(M, y, W - M, y); y += 8;

  // Participation summary
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text("PARTICIPATION SUMMARY", M, y); y += 6;

  const uniqueVendors = new Set(auction.bids.map((b: any) => b.vendorId)).size;
  const summaryItems = [
    ["Vendors Invited",    String(auction.invites?.length || 0)],
    ["Vendors Participated", String(uniqueVendors)],
    ["Total Bids Received", String(auction.bids.length)],
  ];

  summaryItems.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(label + ":", M, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(value, 75, y);
    y += 7;
  });

  // Lowest bid / winner
  if (auction.bids.length > 0) {
    y += 2;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(M, y - 4, W - 2 * M, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text("Lowest Bid:", M + 3, y + 2);
    doc.setTextColor(22, 163, 74); doc.setFontSize(11);
    doc.text(fmt(auction.bids[0].amount), 75, y + 3);
    doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text("by", 110, y + 3);
    doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
    doc.text(auction.bids[0].vendor.companyName, 118, y + 3);
    y += 18;
  }

  y += 2; doc.line(M, y, W - M, y); y += 8;

  // Bid ladder
  if (auction.bids.length > 0) {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text("BID LADDER", M, y); y += 6;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(M, y - 3, W - 2*M, 7, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text("RANK", M + 2, y + 1);
    doc.text("COMPANY", M + 20, y + 1);
    doc.text("BID AMOUNT", W - M - 2, y + 1, { align: "right" });
    y += 8;

    auction.bids.slice(0, 15).forEach((bid: any, i: number) => {
      if (y > 270) return; // page overflow guard
      if (i === 0) {
        doc.setFillColor(240, 253, 244);
        doc.rect(M, y - 3, W - 2*M, 7, "F");
      }
      doc.setFont("helvetica", "bold"); doc.setTextColor(i === 0 ? 22 : 100, i === 0 ? 163 : 116, i === 0 ? 74 : 139);
      doc.setFontSize(8);
      doc.text(`L${i + 1}`, M + 2, y + 1);
      doc.setFont("helvetica", i === 0 ? "bold" : "normal"); doc.setTextColor(15, 23, 42);
      doc.text(bid.vendor.companyName, M + 20, y + 1);
      doc.setFont("helvetica", "bold"); doc.setTextColor(i === 0 ? 22 : 15, i === 0 ? 163 : 23, i === 0 ? 74 : 42);
      doc.text(fmt(bid.amount), W - M - 2, y + 1, { align: "right" });
      doc.setDrawColor(241, 245, 249);
      doc.line(M, y + 4, W - M, y + 4);
      y += 7;
    });
  }

  // Item-rate line items
  if (auction.auctionType === "ITEM_RATE" && auction.items?.length > 0) {
    y += 4; doc.line(M, y, W - M, y); y += 8;
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text("LINE ITEMS", M, y); y += 6;
    auction.items.forEach((item: any, i: number) => {
      if (y > 270) return;
      doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42); doc.setFontSize(8);
      doc.text(`${i+1}. ${item.description}`, M + 2, y);
      doc.setTextColor(100, 116, 139);
      doc.text(`${item.quantity} ${item.unit}`, W - M - 2, y, { align: "right" });
      y += 6;
    });
  }

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 282, W, 15, "F");
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text("Avaada Group — Confidential Procurement Document", W / 2, 289, { align: "center" });
  doc.text(`Auction ID: ${auction.id}`, W / 2, 293, { align: "center" });

  doc.save(`Avaada-Auction-Report-${auction.title.replace(/[^a-z0-9]/gi, "-")}.pdf`);
}

export default function ReportsClient({ auctions, totalBids, totalVendors }: {
  auctions: any[]; totalBids: number; totalVendors: number;
}) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (auction: any) => {
    setDownloading(auction.id);
    try { await downloadPDF(auction); }
    finally { setDownloading(null); }
  };

  const closed = auctions.filter(a => a.status === "CLOSED").length;

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="anim-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Auction <span>Reports</span></h1>
        <p className="page-sub">Participation and performance summary · Download PDF for any auction</p>
      </div>

      <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "24px" }}>
        <div className="stat-card"><p className="stat-label">Closed Auctions</p><p className="stat-val" style={{ color: "var(--accent)" }}>{closed}</p></div>
        <div className="stat-card"><p className="stat-label">Total Bids</p><p className="stat-val" style={{ color: "var(--info)" }}>{totalBids}</p></div>
        <div className="stat-card"><p className="stat-label">Active Vendors</p><p className="stat-val" style={{ color: "var(--success)" }}>{totalVendors}</p></div>
      </div>

      <div className="anim-up d2 surface" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Auction Summary</p>
        </div>
        {auctions.length === 0
          ? <p style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>No auctions yet.</p>
          : <table className="tbl">
              <thead>
                <tr>
                  <th>Auction</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Invited</th>
                  <th>Participated</th>
                  <th>Bids</th>
                  <th>Lowest Bid</th>
                  <th>Winner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((a: any) => {
                  const uniqueVendors = new Set(a.bids.map((b: any) => b.vendorId)).size;
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: "var(--text)", maxWidth: "160px" }}>{a.title}</td>
                      <td style={{ fontSize: "0.75rem" }}>{a.auctionType === "ITEM_RATE" ? "Item-Rate" : "Lumpsum"}</td>
                      <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                      <td style={{ textAlign: "center" }}>{a.invites?.length || 0}</td>
                      <td style={{ textAlign: "center" }}>{uniqueVendors}</td>
                      <td style={{ textAlign: "center" }}>{a.bids.length}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>
                        {a.bids[0] ? fmt(a.bids[0].amount) : "—"}
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{a.bids[0]?.vendor.companyName || "—"}</td>
                      <td>
                        <button
                          onClick={() => handleDownload(a)}
                          disabled={downloading === a.id}
                          className="btn btn-ghost"
                          style={{ fontSize: "0.75rem", padding: "5px 12px", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          {downloading === a.id ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          )}
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
