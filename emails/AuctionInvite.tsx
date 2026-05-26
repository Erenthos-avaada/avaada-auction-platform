// Resend React Email template for auction invites
export function AuctionInviteEmail({ auctionTitle, auctionUrl }: { auctionTitle: string; auctionUrl: string }) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: "#15803d" }}>You are invited to bid</h2>
      <p>You have been invited to participate in the following reverse auction:</p>
      <h3>{auctionTitle}</h3>
      <a href={auctionUrl} style={{ background: "#16a34a", color: "#fff", padding: "10px 20px", borderRadius: 4, textDecoration: "none" }}>
        View Auction & Bid
      </a>
    </div>
  );
}
