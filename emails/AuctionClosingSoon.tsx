export function AuctionClosingSoonEmail({ auctionTitle, auctionUrl, minutesLeft }: { auctionTitle: string; auctionUrl: string; minutesLeft: number }) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: "#dc2626" }}>⏰ Auction Closing Soon</h2>
      <p><strong>{auctionTitle}</strong> is closing in {minutesLeft} minutes!</p>
      <a href={auctionUrl} style={{ background: "#dc2626", color: "#fff", padding: "10px 20px", borderRadius: 4, textDecoration: "none" }}>
        Place Your Bid Now
      </a>
    </div>
  );
}
