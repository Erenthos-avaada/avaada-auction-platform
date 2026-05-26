export function AuctionPublishedEmail({ auctionTitle, auctionUrl }: { auctionTitle: string; auctionUrl: string }) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: "#15803d" }}>New Auction Published</h2>
      <p>A new auction has been published: <strong>{auctionTitle}</strong></p>
      <a href={auctionUrl} style={{ background: "#16a34a", color: "#fff", padding: "10px 20px", borderRadius: 4, textDecoration: "none" }}>
        View Auction
      </a>
    </div>
  );
}
